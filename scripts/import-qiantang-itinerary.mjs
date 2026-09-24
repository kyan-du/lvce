#!/usr/bin/env node
/**
 * One-time helper for data/qiantang-itinerary.seed.json.
 * Default: print the seed rows (safe). Does not run during migrate.
 * To PUT into a live document: LVCE_PASSWORD=... APPLY=1 node scripts/import-qiantang-itinerary.mjs
 */
import {readFile} from 'node:fs/promises';

const seedUrl=new URL('../data/qiantang-itinerary.seed.json',import.meta.url);
const rows=JSON.parse(await readFile(seedUrl,'utf8'));
const origin=process.env.LVCE_ORIGIN||'https://lvce.pages.dev';
const password=process.env.LVCE_PASSWORD;
const apply=process.env.APPLY==='1';

if(!apply){
  console.log(JSON.stringify(rows,null,2));
  console.error(`\n${rows.length} seed rows (print-only). Not used by migrate/build.`);
  console.error('To PUT: LVCE_PASSWORD=... [LVCE_ORIGIN=...] APPLY=1 node scripts/import-qiantang-itinerary.mjs');
  process.exit(0);
}

if(!password){
  console.error('APPLY=1 requires LVCE_PASSWORD');
  process.exit(1);
}

async function api(path,options={}){
  const response=await fetch(origin+path,{...options,headers:{'content-type':'application/json',...options.headers},redirect:'manual'});
  const type=response.headers.get('content-type')||'';
  const body=type.includes('json')?await response.json():await response.text();
  if(!response.ok)throw new Error(`${options.method||'GET'} ${path} -> ${response.status} ${typeof body==='string'?body:JSON.stringify(body)}`);
  return {response,body};
}

const login=await api('/api/auth/login',{method:'POST',body:JSON.stringify({password})});
const cookie=login.response.headers.getSetCookie?.().join('; ')||login.response.headers.get('set-cookie');
if(!cookie)throw new Error('login did not return session cookie');
const get=await api('/api/trips',{headers:{cookie}});
const doc=get.body;
const trip=doc.trips?.find(t=>t.id==='qiantang');
if(!trip)throw new Error('qiantang trip missing from document');
trip.itinerary=rows.map(row=>row.slice());
await api('/api/trips',{method:'PUT',headers:{cookie},body:JSON.stringify(doc)});
console.log(`PUT ${rows.length} itinerary rows into qiantang at ${origin}`);
