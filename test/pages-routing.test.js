import test from 'node:test';
import assert from 'node:assert/strict';
import {readdir} from 'node:fs/promises';
import {extname,join,relative,dirname,basename} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {match as matchPath} from 'path-to-regexp';

const functionsDir=fileURLToPath(new URL('../functions',import.meta.url));
function convertCatchall(routePath){
  return routePath.replace(/\[\[([^\]]+)\]\]/g,(_m,param)=>`:${param}*`);
}
function convertSimple(routePath){
  return routePath.replace(/\[([^\]]+)\]/g,(_m,param)=>`:${param}`);
}
function toUrlPath(filePath){
  return filePath.replace(/\\/g,'/');
}
function parseSegments(routePath){
  return routePath.slice(1).split('/').filter(Boolean);
}
function compareRoutes(a,b){
  const segmentsA=parseSegments(a.routePath),segmentsB=parseSegments(b.routePath);
  if(segmentsA.length!==segmentsB.length)return segmentsB.length-segmentsA.length;
  for(let i=0;i<segmentsA.length;i++){
    const segA=segmentsA[i]??'',segB=segmentsB[i]??'';
    const isWildcardA=segA.includes('*'),isWildcardB=segB.includes('*');
    const isParamA=segA.includes(':'),isParamB=segB.includes(':');
    if(isWildcardA&&!isWildcardB)return 1;
    if(!isWildcardA&&isWildcardB)return -1;
    if(isParamA&&!isParamB)return 1;
    if(!isParamA&&isParamB)return -1;
  }
  if(a.method&&!b.method)return -1;
  if(!a.method&&b.method)return 1;
  return a.routePath.localeCompare(b.routePath);
}

async function walk(dir,out=[]){
  for(const entry of await readdir(dir,{withFileTypes:true})){
    const pathname=join(dir,entry.name);
    if(entry.isDirectory())await walk(pathname,out);
    else if(entry.isFile())out.push(pathname);
  }
  return out;
}

async function pagesRoutes(){
  const files=await walk(functionsDir);
  const routes=[];
  for(const filepath of files){
    const ext=extname(filepath);
    if(!/^\.(mjs|js|ts|tsx|jsx)$/.test(ext))continue;
    const source=await import(pathToFileURL(filepath).href);
    for(const exportName of Object.keys(source)){
      const matched=exportName.match(/^onRequest(Get|Post|Put|Patch|Delete|Options|Head)?$/);
      if(!matched)continue;
      const method=(matched[1]||'').toUpperCase();
      const fileBase=basename(filepath).slice(0,-ext.length);
      const isIndex=fileBase==='index';
      const isMiddleware=fileBase==='_middleware'||fileBase==='_middleware_';
      let routePath=relative(functionsDir,filepath).slice(0,-ext.length);
      if(isIndex||isMiddleware)routePath=dirname(routePath);
      if(routePath==='.')routePath='';
      routePath=`/${routePath}`;
      routePath=convertCatchall(routePath);
      routePath=convertSimple(routePath);
      routes.push({
        routePath:toUrlPath(routePath),
        method,
        modulePath:toUrlPath(relative(functionsDir,filepath)),
        handler:source[exportName]
      });
    }
  }
  routes.sort(compareRoutes);
  return routes;
}

function firstModuleMatch(routes,method,pathname){
  const escapeRegex=/[.+?^${}()|[\]\\]/g;
  for(const route of routes){
    if(route.method&&route.method!==method)continue;
    const routeMatcher=matchPath(route.routePath.replace(escapeRegex,'\\$&'),{end:true});
    const result=routeMatcher(pathname);
    if(result)return {route,params:result.params};
  }
  return null;
}

test('pages routing keeps GET/PUT /api/trips on the trips document handler',async()=>{
  const routes=await pagesRoutes();
  const getTrips=firstModuleMatch(routes,'GET','/api/trips');
  assert.ok(getTrips,'GET /api/trips must match a function');
  assert.equal(getTrips.route.modulePath,'api/trips.js','GET /api/trips must not be captured by a readings catch-all');
  const putTrips=firstModuleMatch(routes,'PUT','/api/trips');
  assert.ok(putTrips);
  assert.equal(putTrips.route.modulePath,'api/trips.js','PUT /api/trips must stay on the document handler');

  const list=firstModuleMatch(routes,'GET','/api/trips/one/readings');
  assert.ok(list);
  assert.match(list.route.modulePath,/readings/);
  const one=firstModuleMatch(routes,'PUT','/api/trips/one/readings/jiaxing-nanhu');
  assert.ok(one);
  assert.match(one.route.modulePath,/readings/);
  const share=firstModuleMatch(routes,'POST','/api/trips/share');
  assert.ok(share);
  assert.equal(share.route.modulePath,'api/trips/share.js');
  const publicTrip=firstModuleMatch(routes,'GET','/api/public/trips/'+'a'.repeat(43));
  assert.ok(publicTrip);
  assert.equal(publicTrip.route.modulePath,'api/public/trips/[token].js');
  const publicReading=firstModuleMatch(routes,'GET','/api/public/trips/'+'a'.repeat(43)+'/readings/r1');
  assert.ok(publicReading);
  assert.equal(publicReading.route.modulePath,'api/public/trips/[token]/readings/[readingId].js');
  assert.equal(routes.some(route=>route.routePath.includes('*')&&matchPath(route.routePath.replace(/[.+?^${}()|[\]\\]/g,'\\$&'),{end:true})('/api/trips')),false,'no catch-all may match /api/trips');
});
