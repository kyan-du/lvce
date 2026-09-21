#!/usr/bin/env node
import {readdir,readFile} from 'node:fs/promises';
import {basename,join} from 'node:path';

const origin=process.env.LVCE_ORIGIN||'https://lvce.pages.dev';
const password=process.env.LVCE_PASSWORD;
const readingsDir=new URL('../test/fixtures/readings/',import.meta.url);
if(!password){
  console.error('用法: LVCE_PASSWORD=... node scripts/seed-readings.mjs');
  process.exit(1);
}

function catalogFrom(source,label){
  const match=source.match(new RegExp(`const ${label}=(\\[.*?\\]);`,'s'));
  if(!match)throw new Error(`missing ${label}`);
  return Function(`return ${match[1]}`)();
}

async function api(path,options={}){
  const response=await fetch(origin+path,{...options,headers:{'content-type':'application/json',...options.headers},redirect:'manual'});
  const type=response.headers.get('content-type')||'';
  const body=type.includes('json')?await response.json():await response.text();
  if(!response.ok)throw new Error(`${options.method||'GET'} ${path} -> ${response.status} ${typeof body==='string'?body:JSON.stringify(body)}`);
  return {response,body};
}

const app=await readFile(new URL('../app.js',import.meta.url),'utf8');
const catalogs={
  zhangjiajie:catalogFrom(app,'defaultReadings'),
  qiantang:catalogFrom(app,'qiantangReadings')
};
const files=new Map((await readdir(readingsDir)).filter(name=>name.endsWith('.md')).map(name=>[basename(name,'.md'),name]));
const login=await api('/api/auth/login',{method:'POST',body:JSON.stringify({password})});
const cookie=login.response.headers.getSetCookie?.().join('; ')||login.response.headers.get('set-cookie');
if(!cookie)throw new Error('login did not return lvce_session');

let wrote=0;
for(const [tripId,rows] of Object.entries(catalogs)){
  for(const row of rows){
    const file=files.get(row.id);
    if(!file)throw new Error(`${tripId}/${row.id} has no markdown fixture`);
    const markdown=await readFile(join(readingsDir.pathname,file),'utf8');
    await api(`/api/trips/${tripId}/readings/${row.id}`,{method:'PUT',headers:{cookie},body:JSON.stringify({title:row.title,venue:row.venue||'',category:row.category||'',markdown})});
    wrote++;
    console.log(`wrote ${tripId}/${row.id} (${markdown.length} bytes)`);
  }
}
console.log(`done: ${wrote} readings`);
