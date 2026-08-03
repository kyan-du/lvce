import test from 'node:test';import assert from 'node:assert/strict';import {pbkdf2Sync} from 'node:crypto';import {makeSession,readSession,verifyPassword,verifySession} from '../lib/auth.js';import {validateDocument,MAX_BYTES} from '../lib/trips.js';import {onRequestPost as createShare,onRequestDelete as revokeShare,onRequestGet as getShareMetadata} from '../functions/api/trips/share.js';import {onRequestGet as readPublicTrip} from '../functions/api/public/trips/[token].js';import {onRequest as middleware} from '../functions/_middleware.js';import {onRequestPost as authLogin} from '../functions/api/auth/login.js';import {onRequestPost as legacyLogin} from '../functions/api/login.js';
const b=v=>Buffer.from(v).toString('base64url');
test('PBKDF2 password verification',async()=>{const salt=Buffer.from('0123456789abcdef'),hash=`pbkdf2-sha256$100000$${b(salt)}$${b(pbkdf2Sync('hello',salt,100000,32,'sha256'))}`;assert.equal(await verifyPassword('hello',hash),true);assert.equal(await verifyPassword('no',hash),false)});
test('signed session carries server-verifiable id, expires and rejects tampering',async()=>{const token=await makeSession('long random secret',0,'session-1');assert.equal((await readSession(token,'long random secret',1000)).sid,'session-1');assert.equal(await verifySession(token,'long random secret',1000),true);assert.equal(await verifySession(token+'x','long random secret',1000),false);assert.equal(await verifySession(token,'long random secret',31*864e5),false)});
test('trip document validation',()=>{const valid={active:'a',tab:'packing',trips:[{id:'a',name:'A',categories:[],itinerary:[],transport:[],hotels:[],tickets:[['景点','2026-08-03','成人票','2','张三','¥20','凭证使用']],emergency:[],tour:[['旧团','保留','不展示']],readings:[{id:'r',title:'旅读',source:'/assets/readings/a.md'}]}]};assert.equal(validateDocument(valid),null);assert.equal(validateDocument({...valid,trips:[{...valid.trips[0],tickets:undefined,readings:undefined}]}),null,'old documents without tickets/readings should remain valid');assert.match(validateDocument({...valid,trips:[{...valid.trips[0],tickets:{}}]}),/tickets/);assert.match(validateDocument({...valid,trips:[{...valid.trips[0],readings:{}}]}),/readings/);assert.match(validateDocument({trips:[]}),/active/);assert.match(validateDocument({...valid,pad:'x'.repeat(MAX_BYTES)}),/字节/)});

test('trip JSON roundtrip keeps tickets and legacy tour',()=>{
  const trip={active:'a',tab:'bookings',trips:[{id:'a',name:'A',categories:[],itinerary:[],transport:[],hotels:[],tickets:[['景点','2026-08-03','夜场','2','游客','¥20','说明']],emergency:[],tour:[['旧团数据']]}]};
  const parsed=JSON.parse(JSON.stringify(trip));
  assert.equal(validateDocument(parsed),null);
  assert.deepEqual(parsed.trips[0].tickets,trip.trips[0].tickets);
  assert.deepEqual(parsed.trips[0].tour,trip.trips[0].tour);
});

test('trip JSON roundtrip allows hotel roomType and legacy concierge compatibility data',()=>{
  const trip={active:'a',tab:'bookings',trips:[{id:'a',name:'A',categories:[],itinerary:[],transport:[],hotels:[['旧酒店','2026-08-03','旧礼宾','电话','地址','房型：旧房型','1','¥1'],{name:'新酒店',checkin:'2026-08-04',checkout:'2026-08-06',concierge:'兼容保留',contact:'电话',address:'地址',roomType:'新房型',nights:'2',totalCost:'¥2'}],tickets:[],emergency:[],tour:[]}]};
  const parsed=JSON.parse(JSON.stringify(trip));
  assert.equal(validateDocument(parsed),null);
  assert.deepEqual(parsed.trips[0].hotels,trip.trips[0].hotels);
});

test('middleware keeps login and public share routes open without opening authenticated APIs',async()=>{
  const env={SESSION_SECRET:'long random secret',DB:{prepare(){throw Error('DB should not be read without a session cookie')}}};
  async function hit(path){
    let nextCalled=false;
    const response=await middleware({request:new Request('https://example.test'+path),env,next:async()=>{nextCalled=true;return new Response('next')}});
    return {nextCalled,response};
  }
  for(const path of ['/login','/login.html','/api/login','/api/auth/login','/share/abc','/api/public/trips/'+('a'.repeat(43))]){
    const result=await hit(path);
    assert.equal(result.nextCalled,true,`${path} should pass through middleware`);
    assert.equal(result.response.status,200);
  }
  for(const path of ['/api/trips','/api/trips/share']){
    const result=await hit(path);
    assert.equal(result.nextCalled,false,`${path} should remain protected`);
    assert.equal(result.response.status,401);
    assert.equal(result.response.headers.get('content-type').includes('application/json'),true);
  }
  const page=await hit('/settings');
  assert.equal(page.nextCalled,false);
  assert.equal(page.response.status,302);
  assert.equal(page.response.headers.get('location'),'/login');
});

test('legacy /api/login delegates to the canonical auth login handler',()=>{
  assert.equal(legacyLogin,authLogin);
});

test('share metadata API returns JSON for unsupported methods instead of falling through to HTML',async()=>{
  const response=await getShareMetadata();
  assert.equal(response.status,405);
  assert.equal(response.headers.get('allow'),'POST, DELETE');
  assert.equal(response.headers.get('content-type').includes('application/json'),true);
  assert.deepEqual(Object.keys(await response.json()),['error']);
});

function envWithShares(data){
  const db={doc:{data:JSON.stringify(data),updated_at:'2026-08-03 00:00:00',version:7},shares:new Map()};
  db.prepare=sql=>({bind(...args){return run(sql,args,db)},...run(sql,[],db)});
  return {DB:db};
}
function run(sql,args,db){
  return {
    async first(){
      if(sql.includes("FROM documents WHERE id = 'trips'"))return db.doc;
      if(sql.includes('FROM public_trip_shares WHERE token_hash = ?'))return db.shares.get(args[0])?{trip_id:db.shares.get(args[0])}:null;
      if(sql.includes('FROM public_trip_shares WHERE trip_id = ?'))return [...db.shares.values()].includes(args[0])?{1:1}:null;
      return null;
    },
    async all(){
      if(sql.includes('SELECT trip_id FROM public_trip_shares'))return {results:[...new Set(db.shares.values())].map(trip_id=>({trip_id}))};
      return {results:[]};
    },
    async run(){
      if(sql.startsWith('INSERT INTO public_trip_shares'))db.shares.set(args[0],args[1]);
      if(sql.startsWith('DELETE FROM public_trip_shares WHERE trip_id = ?'))for(const [hash,tripId] of db.shares)if(tripId===args[0])db.shares.delete(hash);
      if(sql.startsWith('DELETE FROM public_trip_shares WHERE token_hash = ?'))db.shares.delete(args[0]);
      return {meta:{changes:1}};
    }
  };
}
const shareDoc={active:'one',tab:'bookings',trips:[{id:'one',name:'公开旅行',categories:[],itinerary:[['2026-08-03','09:00','A','B','C','D']],transport:[],hotels:[],tickets:[['公开门票','2026-08-03','上午场','1','张三','¥88','凭二维码入园']],emergency:[['家人','139 **** 0000','备注','139 0000 0000']],tour:[['旧旅行团','仍保留']],readings:[{id:'r',title:'旅读'}]},{id:'two',name:'私有旅行',categories:[],itinerary:[['secret']],transport:[],hotels:[],tickets:[['私有门票']],emergency:[],tour:[],readings:[]}]};
const jsonReq=(method,body)=>new Request('https://example.test/api/trips/share',{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});

test('public trip share create, read, revoke and reshare lifecycle',async()=>{
  const env=envWithShares(shareDoc);
  let created=await createShare({request:jsonReq('POST',{tripId:'one'}),env});
  assert.equal(created.status,200);
  let firstToken=(await created.json()).token;
  assert.match(firstToken,/^[A-Za-z0-9_-]{43}$/);
  assert.equal(env.DB.shares.size,1,'only the token hash should be stored');
  assert.equal([...env.DB.shares.keys()][0].includes(firstToken),false,'stored value must not contain the bearer token');

  let duplicate=await createShare({request:jsonReq('POST',{tripId:'one'}),env});
  assert.equal(duplicate.status,409);
  let read=await readPublicTrip({params:{token:firstToken},env});
  assert.equal(read.status,200);
  let body=await read.json();
  assert.equal(body.data.trips.length,1,'public API must only expose the target trip');
  assert.equal(body.data.trips[0].name,'公开旅行');
  assert.deepEqual(body.data.trips[0].tickets,shareDoc.trips[0].tickets,'public API should retain ticket rows');
  assert.deepEqual(body.data.trips[0].tour,shareDoc.trips[0].tour,'public API should retain legacy tour data for compatibility');
  assert.deepEqual(body.data.trips[0].readings,shareDoc.trips[0].readings,'public API should retain reading metadata');
  assert.equal(body.data.trips[0].emergency[0][1],'139 **** 0000','public API should mask emergency phones');
  assert.equal(body.data.trips[0].emergency[0][3],'','public API should not expose full emergency phones');
  assert.equal(JSON.stringify(body).includes('私有旅行'),false,'public API leaked another trip');
  assert.equal(JSON.stringify(body).includes('私有门票'),false,'public API leaked another trip ticket');

  env.DB.doc.data=JSON.stringify({...shareDoc,trips:[{...shareDoc.trips[0],name:'公开旅行已更新'},shareDoc.trips[1]]});
  read=await readPublicTrip({params:{token:firstToken},env});
  assert.equal((await read.json()).data.trips[0].name,'公开旅行已更新','public reads should reflect current document data');

  let revoked=await revokeShare({request:jsonReq('DELETE',{tripId:'one'}),env});
  assert.equal(revoked.status,200);
  assert.equal((await readPublicTrip({params:{token:firstToken},env})).status,404,'revoked token should stop working immediately');
  created=await createShare({request:jsonReq('POST',{tripId:'one'}),env});
  let secondToken=(await created.json()).token;
  assert.notEqual(secondToken,firstToken,'reshare must issue a new token');
  assert.equal((await readPublicTrip({params:{token:firstToken},env})).status,404,'old token must remain invalid after reshare');
  assert.equal((await readPublicTrip({params:{token:secondToken},env})).status,200);
});

test('public trip share rejects missing trips and nonexistent tokens',async()=>{
  const env=envWithShares(shareDoc);
  assert.equal((await createShare({request:jsonReq('POST',{tripId:'missing'}),env})).status,404);
  assert.equal((await readPublicTrip({params:{token:'not-a-valid-token'},env})).status,404);
  assert.equal((await readPublicTrip({params:{token:'a'.repeat(43)},env})).status,404);
});
