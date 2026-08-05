import test from 'node:test';import assert from 'node:assert/strict';import {pbkdf2Sync} from 'node:crypto';import {makeSession,readSession,verifyPassword,verifySession} from '../lib/auth.js';import {migrateTripDocument,validateDocument,MAX_BYTES,ZHANGJIAJIE_ORANGE_ROW,ZHANGJIAJIE_AUG5_ROWS,ZHANGJIAJIE_MAWANGDUI_ROW,ZHANGJIAJIE_MAWANGDUI_TICKET,ZHANGJIAJIE_JINBIANXI_ROW,ZHANGJIAJIE_JINBIANXI_TRANSFER_ROW,ZHANGJIAJIE_MENGDONG_ROW,ZHANGJIAJIE_JINQI_ROW,ZHANGJIAJIE_TIANMEN_ROW,ZHANGJIAJIE_MENGDONG_TICKET,ZHANGJIAJIE_TIANMEN_TICKET} from '../lib/trips.js';import {onRequestGet as readTrips} from '../functions/api/trips.js';import {onRequestPost as createShare,onRequestDelete as revokeShare,onRequestGet as getShareMetadata} from '../functions/api/trips/share.js';import {onRequestGet as readPublicTrip} from '../functions/api/public/trips/[token].js';import {onRequest as middleware} from '../functions/_middleware.js';import {onRequestPost as authLogin} from '../functions/api/auth/login.js';import {onRequestPost as legacyLogin} from '../functions/api/login.js';
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

function legacyZhangjiajieDocument(){
  return {active:'zhangjiajie',tab:'itinerary',trips:[{id:'zhangjiajie',name:'湘行记',categories:[],itinerary:[
    ['2026-08-04','15:00-预计17:00','岳麓山+岳麓书院讲解','岳麓山／岳麓书院','胡丽霞','保留原讲解行'],
    ['2026-08-05','预计 09:30-12:00／待预约确认','橘子洲','长沙','胡丽霞','旧错误：8/5 不应有橘子洲'],
    ['2026-08-05','12:30','用户自定义午餐','长沙','用户','必须保留'],
    ['2026-08-05','16:55-18:51','C7950 长沙→张家界西','长沙／张家界西','胡丽霞','铁路'],
    ['2026-08-06','预计 13:30-17:30／待确认','天子山','武陵源','胡丽霞','四日票含环保车'],
    ['2026-08-07','预计 08:30-11:30／待确认','金鞭溪','武陵源','胡丽霞','预计上午游览；需与 13:07 张家界西出发列车衔接核对'],
    ['2026-08-07','10:00','用户自定义咖啡','武陵源','用户','必须保留'],
    ['2026-08-07','13:07-13:30','G9679 张家界西→芙蓉镇','张家界西／芙蓉镇','胡丽霞','铁路（3张）；预订号 E222650634'],
    ['2026-08-07','预计 14:30-17:30／待预约确认','天门山A线','张家界','胡丽霞','门票 ¥576；2份；原行程写下午天门山，但同日列车到芙蓉镇，需复核预约时段和返程交通；以订单为准'],
    ['2026-08-07','预计 19:00-19:30／待确认','前往锦栖民宿(张家界高铁西站店)','张家界→宁邦广场二期文华里21栋702','胡丽霞','预计晚间抵达/入住，视路况；同日芙蓉镇、天门山安排需复核；全季天门山索道站订单不再单列为行程酒店'],
    ['2026-08-08','预计 09:00-15:00／待预约确认','猛洞河漂流','猛洞河','胡丽霞','门票 ¥680；2份；凭联系人手机或预留姓名取票使用；备换洗衣物；预计时段需预留 17:00 张家界西出发时间'],
    ['2026-08-08','17:00-18:52','C7769 张家界西→长沙','张家界西／长沙','胡丽霞','铁路（3张）；预订号 E297617576'],
    ['2026-08-09','预计 09:30-11:30／待预约确认','湖南省博物馆马王堆讲解','长沙','胡丽霞','旧错误：8/9 不应重复马王堆'],
    ['2026-08-09','预计 14:00-15:30／待确认','开福寺','长沙','胡丽霞','必须保留']
  ],transport:[['铁路（3张）','G9679','座位','2026-08-07','张家界西','13:07','芙蓉镇','13:30','E222650634'],['铁路（3张）','C7769','座位','2026-08-08','张家界西','17:00','长沙','18:52','E297617576']],hotels:[],tickets:[['湖南省博物馆马王堆讲解','待填写','待填写','2份','凭「身份证」集合使用','¥262','预订成功'],['猛洞河漂流','待填写','待填写','2份','凭「联系人手机或预留姓名」取票使用','¥680','预订成功'],['天门山A线','待填写','待填写','2份','凭「下单时预留的证件原件+电子凭证或纸质凭证」使用','¥576','预订成功']],emergency:[],tour:[]},{id:'custom',name:'自定义旅行',categories:[],itinerary:[['2026-08-05','09:00','橘子洲自定义','长沙','用户','非 zhangjiajie 不迁移']],transport:[],hotels:[],tickets:[],emergency:[],tour:[]}]};
}

test('zhangjiajie persisted itinerary migration fixes known stale rows and preserves unrelated edits',()=>{
  const original=legacyZhangjiajieDocument();
  const result=migrateTripDocument(original);
  assert.equal(result.changed,true);
  const trip=result.data.trips.find(t=>t.id==='zhangjiajie');
  assert.ok(trip.itinerary.some(row=>row[0]==='2026-08-04'&&row[2]===ZHANGJIAJIE_ORANGE_ROW[2]&&row[1]===ZHANGJIAJIE_ORANGE_ROW[1]),'8/4 Orange Isle evening row should be inserted');
  assert.ok(trip.itinerary.some(row=>row[0]==='2026-08-05'&&row[2]===ZHANGJIAJIE_MAWANGDUI_ROW[2]&&row[1]===ZHANGJIAJIE_MAWANGDUI_ROW[1]),'8/5 morning Mawangdui row should be inserted');
  assert.equal(trip.itinerary.some(row=>row[0]==='2026-08-05'&&row.join('').includes('橘子洲')),false,'8/5 Orange Isle rows must be removed from zhangjiajie');
  assert.equal(trip.itinerary.some(row=>row[0]==='2026-08-09'&&row.join('').includes('马王堆')),false,'8/9 Mawangdui duplicates must be removed from zhangjiajie');
  assert.ok(trip.itinerary.some(row=>row[2]==='用户自定义午餐'),'unrelated custom itinerary rows should be preserved');
  assert.ok(trip.itinerary.some(row=>row[2]==='用户自定义咖啡'),'same-date custom itinerary rows should be preserved');
  assert.ok(trip.itinerary.some(row=>row[2]==='开福寺'),'unrelated default rows should be preserved');
  for(const row of [ZHANGJIAJIE_JINBIANXI_ROW,ZHANGJIAJIE_JINBIANXI_TRANSFER_ROW,ZHANGJIAJIE_MENGDONG_ROW,ZHANGJIAJIE_JINQI_ROW,ZHANGJIAJIE_TIANMEN_ROW])assert.ok(trip.itinerary.some(actual=>actual.every((v,i)=>v===row[i])),`${row[2]} should be present`);
  assert.equal(trip.itinerary.some(row=>row[0]==='2026-08-07'&&row[2]==='天门山A线'),false,'8/7 Tianmen row must be removed');
  assert.equal(trip.itinerary.some(row=>row[0]==='2026-08-08'&&row[2]==='猛洞河漂流'),false,'8/8 Mengdong row must be removed');
  assert.equal(trip.itinerary.filter(row=>row[2]==='G9679 张家界西→芙蓉镇').length,1,'G9679 must not be duplicated');
  assert.equal(trip.itinerary.filter(row=>row[2]==='C7769 张家界西→长沙').length,1,'C7769 must not be duplicated');
  assert.deepEqual(trip.transport,original.trips[0].transport,'explicit train rows should not be modified');
  assert.deepEqual(trip.tickets[0].slice(0,7),ZHANGJIAJIE_MAWANGDUI_TICKET,'known old Mawangdui ticket row should be upgraded');
  assert.deepEqual(trip.tickets[1].slice(0,7),ZHANGJIAJIE_MENGDONG_TICKET,'Mengdong ticket should keep pending date/time and add planned date evidence note');
  assert.deepEqual(trip.tickets[2].slice(0,7),ZHANGJIAJIE_TIANMEN_TICKET,'Tianmen ticket should keep pending date/time and add planned date evidence note');
  assert.equal(trip.tickets[1][1],'待填写');
  assert.equal(trip.tickets[1][2],'待填写');
  assert.equal(trip.tickets[2][1],'待填写');
  assert.equal(trip.tickets[2][2],'待填写');
  assert.deepEqual(result.data.trips.find(t=>t.id==='custom').itinerary,original.trips.find(t=>t.id==='custom').itinerary,'other trips must not be migrated');
});

test('zhangjiajie persisted itinerary migration is idempotent',()=>{
  const once=migrateTripDocument(legacyZhangjiajieDocument());
  const twice=migrateTripDocument(once.data);
  assert.equal(twice.changed,false);
  assert.deepEqual(twice.data,once.data);
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
      if(sql.startsWith('UPDATE documents SET data=')){
        if(db.doc&&db.doc.version===args[1]){
          db.doc={data:args[0],updated_at:'2026-08-04 00:00:00',version:db.doc.version+1};
          return {meta:{changes:1}};
        }
        return {meta:{changes:0}};
      }
      if(sql.startsWith('INSERT INTO public_trip_shares'))db.shares.set(args[0],args[1]);
      if(sql.startsWith('DELETE FROM public_trip_shares WHERE trip_id = ?'))for(const [hash,tripId] of db.shares)if(tripId===args[0])db.shares.delete(hash);
      if(sql.startsWith('DELETE FROM public_trip_shares WHERE token_hash = ?'))db.shares.delete(args[0]);
      return {meta:{changes:1}};
    }
  };
}
const shareDoc={active:'one',tab:'bookings',trips:[{id:'one',name:'公开旅行',categories:[],itinerary:[['2026-08-03','09:00','A','B','C','D']],transport:[],hotels:[],tickets:[['公开门票','2026-08-03','上午场','1','张三','¥88','凭二维码入园']],emergency:[['家人','139 **** 0000','备注','139 0000 0000']],tour:[['旧旅行团','仍保留']],readings:[{id:'r',title:'旅读'}]},{id:'two',name:'私有旅行',categories:[],itinerary:[['secret']],transport:[],hotels:[],tickets:[['私有门票']],emergency:[],tour:[],readings:[]}]};
const jsonReq=(method,body)=>new Request('https://example.test/api/trips/share',{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});

test('trips API GET migrates stale zhangjiajie D1 document and persists it with version guard',async()=>{
  const env=envWithShares(legacyZhangjiajieDocument());
  const response=await readTrips({env});
  assert.equal(response.status,200);
  const body=await response.json();
  assert.equal(body.version,8,'successful migration should advance the document version');
  assert.equal(body.data.trips[0].itinerary.some(row=>row[0]==='2026-08-05'&&row.join('').includes('橘子洲')),false);
  assert.equal(body.data.trips[0].itinerary.some(row=>row[0]==='2026-08-09'&&row.join('').includes('马王堆')),false);
  const persisted=JSON.parse(env.DB.doc.data);
  assert.deepEqual(persisted,body.data,'migrated document should be written back to D1');
});

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

test('legacy booking details migrate into ticket and transport sources without duplicates',()=>{
  const original={active:'zhangjiajie',tab:'itinerary',trips:[{id:'zhangjiajie',name:'湘行记',categories:[],itinerary:structuredClone(ZHANGJIAJIE_AUG5_ROWS),transport:[['铁路（3张）','C7950','','2026-08-05','长沙','16:55','张家界西','18:51','E227154531']],hotels:[],tickets:[structuredClone(ZHANGJIAJIE_MAWANGDUI_TICKET)],emergency:[],tour:[],bookingDetails:[{id:'custom',type:'ticket',title:'自定义预订',platform:'自定义平台',orderNumber:'CUSTOM-1',privateNotes:'私密'}],itineraryLinks:[{date:'2026-08-05',activity:'自定义活动',bookingId:'custom'}]}]};
  const first=migrateTripDocument(original).data.trips[0];
  assert.equal(first.bookingDetails,undefined);
  assert.ok(first.tickets.some(row=>row[0]==='自定义预订'&&row[7]==='自定义平台'&&row[8]==='CUSTOM-1'&&row[11]==='私密'&&row[12]==='custom'));
  assert.ok(first.itineraryLinks.some(x=>x.targetType==='ticket'&&x.targetId==='ticket-mawangdui-20260805'));
  assert.ok(first.itineraryLinks.some(x=>x.targetType==='transport'&&x.targetId==='transport:0'));
  assert.equal(migrateTripDocument({active:'zhangjiajie',tab:'itinerary',trips:[first]}).changed,false);
});

test('zhangjiajie Ctrip details live in five ticket rows and remain idempotent',()=>{
  const original={active:'zhangjiajie',tab:'itinerary',trips:[{id:'zhangjiajie',name:'湘行记',categories:[],itinerary:[
    ['2026-08-06','','森林公园东门B线入园','','',''],['2026-08-06','','百龙天梯、袁家界','','',''],['2026-08-06','','天子山','','',''],
    ['2026-08-07','','芙蓉镇站衔接猛洞河漂流','','',''],['2026-08-08','','天门山A线','','','']
  ],transport:[],hotels:[],tickets:[['张家界森林公园四日票'],['百龙天梯'],['天子山'],['猛洞河漂流'],['天门山A线']],emergency:[],tour:[],bookingDetails:[],itineraryLinks:[]}]};
  const first=migrateTripDocument(original).data.trips[0];
  const expected=['ticket-forest-20260806','ticket-bailong-20260806','ticket-tianzishan-20260806','ticket-mengdong-20260807','ticket-tianmen-20260808'];
  assert.deepEqual(expected.map(id=>first.tickets.some(row=>row[12]===id&&row[7]==='携程'&&row[8])),[true,true,true,true,true]);
  assert.deepEqual(expected.map(id=>first.itineraryLinks.some(x=>x.targetType==='ticket'&&x.targetId===id)),[true,true,true,true,true]);
  assert.equal(first.bookingDetails,undefined);
  const second=migrateTripDocument({active:'zhangjiajie',tab:'itinerary',trips:[first]}).data.trips[0];
  assert.deepEqual(second,first);
});

test('public trip share strips booking order numbers and private auxiliary codes',async()=>{
  const sensitive={...shareDoc,trips:[{...shareDoc.trips[0],tickets:[['天门山A线','','','','','','公开使用说明','携程','1128148375850216','','','辅助码 ANWSK26080853374340612','ticket']] ,bookingDetails:[{id:'ticket',title:'天门山A线',orderNumber:'1128148375850216',privateNotes:'辅助码 ANWSK26080853374340612',credential:'公开使用说明'}]},shareDoc.trips[1]]};
  const env=envWithShares(sensitive);
  const created=await createShare({request:jsonReq('POST',{tripId:'one'}),env});
  const token=(await created.json()).token;
  const body=await (await readPublicTrip({params:{token},env})).json();
  const serialized=JSON.stringify(body);
  assert.equal(serialized.includes('1128148375850216'),false);
  assert.equal(serialized.includes('ANWSK26080853374340612'),false);
  assert.equal(serialized.includes('公开使用说明'),true);
});
