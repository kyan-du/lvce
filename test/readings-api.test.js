import test from 'node:test';
import assert from 'node:assert/strict';
import {onRequest as middleware} from '../functions/_middleware.js';
import {onRequestGet as listReadings,onRequestPut as putReading,onRequestDelete as deleteReading} from '../functions/api/trips/[[path]].js';
const readReading=listReadings;
import {onRequestGet as readPublicReading} from '../functions/api/public/trips/[[path]].js';
import {onRequestPost as createShare} from '../functions/api/trips/share.js';

const tripDoc={active:'one',tab:'reading',trips:[{id:'one',name:'公开旅行',categories:[],itinerary:[],transport:[],hotels:[],tickets:[],emergency:[],tour:[],readings:[{id:'r1',title:'南湖'}]},{id:'two',name:'私有旅行',categories:[],itinerary:[],transport:[],hotels:[],tickets:[],emergency:[],tour:[],readings:[]}]};

function envWithReadings(data=tripDoc){
  const db={doc:{data:JSON.stringify(data),updated_at:'2026-09-21 00:00:00',version:1},shares:new Map(),readings:new Map()};
  db.prepare=sql=>({bind(...args){return run(sql,args,db)},...run(sql,[],db)});
  return {DB:db};
}
function key(tripId,readingId){return `${tripId}\0${readingId}`}
function run(sql,args,db){
  return {
    async first(){
      if(sql.includes("FROM documents WHERE id = 'trips'"))return db.doc;
      if(sql.includes('FROM public_trip_shares WHERE token_hash = ?'))return db.shares.get(args[0])?{trip_id:db.shares.get(args[0])}:null;
      if(sql.includes('FROM public_trip_shares WHERE trip_id = ?'))return [...db.shares.values()].includes(args[0])?{1:1}:null;
      if(sql.includes('FROM readings WHERE trip_id = ? AND reading_id = ?')){
        const row=db.readings.get(key(args[0],args[1]));
        return row?{...row}:null;
      }
      return null;
    },
    async all(){
      if(sql.includes('FROM readings WHERE trip_id = ?')&&!sql.includes('reading_id = ?')){
        const tripId=args[0];
        return {results:[...db.readings.values()].filter(row=>row.trip_id===tripId).map(({markdown,...meta})=>meta)};
      }
      if(sql.includes('SELECT trip_id FROM public_trip_shares'))return {results:[...new Set(db.shares.values())].map(trip_id=>({trip_id}))};
      return {results:[]};
    },
    async run(){
      if(sql.startsWith('CREATE TABLE IF NOT EXISTS readings'))return {meta:{changes:0}};
      if(sql.startsWith('INSERT INTO public_trip_shares'))db.shares.set(args[0],args[1]);
      if(sql.includes('INSERT INTO readings')||sql.includes('INSERT OR REPLACE INTO readings')){
        db.readings.set(key(args[0],args[1]),{trip_id:args[0],reading_id:args[1],title:args[2],venue:args[3],category:args[4],markdown:args[5],updated_at:'2026-09-21 12:00:00'});
        return {meta:{changes:1}};
      }
      if(sql.startsWith('DELETE FROM readings WHERE trip_id = ? AND reading_id = ?')){
        const existed=db.readings.delete(key(args[0],args[1]));
        return {meta:{changes:existed?1:0}};
      }
      return {meta:{changes:1}};
    }
  };
}
const jsonReq=(url,method,body)=>{
  const init={method,headers:{'Content-Type':'application/json'}};
  if(body!==undefined)init.body=JSON.stringify(body);
  return new Request(url,init);
};

test('readings API stays behind login',async()=>{
  const env={SESSION_SECRET:'long random secret',DB:{prepare(){throw Error('DB should not be read without a session cookie')}}};
  for(const path of ['/api/trips/one/readings','/api/trips/one/readings/r1']){
    const response=await middleware({request:new Request('https://example.test'+path),env,next:async()=>new Response('next')});
    assert.equal(response.status,401,`${path} should remain protected`);
  }
  const publicPath='/api/public/trips/'+('a'.repeat(43))+'/readings/r1';
  let nextCalled=false;
  const open=await middleware({request:new Request('https://example.test'+publicPath),env,next:async()=>{nextCalled=true;return new Response('next')}});
  assert.equal(nextCalled,true,'public reading body should pass through middleware');
  assert.equal(open.status,200);
});

test('authenticated readings API writes markdown outside the trips JSON document',async()=>{
  const env=envWithReadings();
  const created=await putReading({params:{tripId:'one',readingId:'jiaxing-nanhu'},request:jsonReq('https://example.test/api/trips/one/readings/jiaxing-nanhu','PUT',{title:'嘉兴南湖',venue:'嘉兴南湖',category:'城市湖泊',markdown:'# 嘉兴南湖\n\n正文'}),env});
  assert.equal(created.status,200);
  const saved=await created.json();
  assert.equal(saved.id,'jiaxing-nanhu');
  assert.equal(saved.markdown,'# 嘉兴南湖\n\n正文');
  assert.equal(JSON.parse(env.DB.doc.data).trips[0].readings[0].markdown,undefined,'reading body must not be copied into trips JSON');

  const listed=await (await listReadings({request:new Request('https://example.test/api/trips/one/readings'),env})).json();
  assert.deepEqual(listed.readings.map(row=>row.id),['jiaxing-nanhu']);
  assert.equal(listed.readings[0].markdown,undefined,'list must omit markdown');
  assert.equal(listed.readings[0].title,'嘉兴南湖');

  const read=await (await readReading({request:new Request('https://example.test/api/trips/one/readings/jiaxing-nanhu'),env})).json();
  assert.equal(read.markdown,'# 嘉兴南湖\n\n正文');

  const missingTrip=await putReading({params:{tripId:'missing',readingId:'x'},request:jsonReq('https://example.test/api/trips/missing/readings/x','PUT',{title:'x',markdown:'y'}),env});
  assert.equal(missingTrip.status,404);
  const missingRead=await readReading({request:new Request('https://example.test/api/trips/one/readings/nope'),env});
  assert.equal(missingRead.status,404);

  const updated=await putReading({params:{tripId:'one',readingId:'jiaxing-nanhu'},request:jsonReq('https://example.test/api/trips/one/readings/jiaxing-nanhu','PUT',{title:'嘉兴南湖（修订）',venue:'嘉兴南湖',category:'城市湖泊',markdown:'# 修订'}),env});
  assert.equal(updated.status,200);
  assert.equal((await (await readReading({request:new Request('https://example.test/api/trips/one/readings/jiaxing-nanhu'),env})).json()).markdown,'# 修订');

  const removed=await deleteReading({request:jsonReq('https://example.test/api/trips/one/readings/jiaxing-nanhu','DELETE'),env});
  assert.equal(removed.status,200);
  assert.equal((await readReading({request:new Request('https://example.test/api/trips/one/readings/jiaxing-nanhu'),env})).status,404);
});

test('shared trip can read a stored reading body without login and cannot see another trip',async()=>{
  const env=envWithReadings();
  await putReading({params:{tripId:'one',readingId:'r1'},request:jsonReq('https://example.test/api/trips/one/readings/r1','PUT',{title:'南湖',markdown:'# 公开正文'}),env});
  await putReading({params:{tripId:'two',readingId:'secret'},request:jsonReq('https://example.test/api/trips/two/readings/secret','PUT',{title:'私密',markdown:'# 不该泄漏'}),env});
  const created=await createShare({request:jsonReq('https://example.test/api/trips/share','POST',{tripId:'one'}),env});
  const token=(await created.json()).token;
  const publicRead=await readPublicReading({params:{token},request:new Request(`https://example.test/api/public/trips/${token}/readings/r1`),env});
  assert.equal(publicRead.status,200);
  assert.equal((await publicRead.json()).markdown,'# 公开正文');
  assert.equal((await readPublicReading({params:{token},request:new Request(`https://example.test/api/public/trips/${token}/readings/secret`),env})).status,404);
  assert.equal((await readPublicReading({params:{token:'a'.repeat(43)},request:new Request('https://example.test/api/public/trips/'+('a'.repeat(43))+'/readings/r1'),env})).status,404);
});
