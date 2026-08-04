export const MAX_BYTES=256*1024;
const plainObject=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
export const ZHANGJIAJIE_ITINERARY_MIGRATION='zhangjiajie-itinerary-20260804-v2';
export const ZHANGJIAJIE_ORANGE_TRANSFER_ROW=['2026-08-04','预计 17:00-18:30','岳麓山/岳麓书院讲解结束后前往橘子洲并晚餐衔接','岳麓山／岳麓书院→橘子洲','胡丽霞','预留讲解结束后的市内交通与晚餐衔接，实际以路况、景区入口和餐厅安排为准'];
export const ZHANGJIAJIE_ORANGE_ROW=['2026-08-04','预计 18:30-21:00','橘子洲晚间游览','橘子洲','胡丽霞','今晚 2026-08-04 前往橘子洲；预计晚间时段，待现场开放与交通确认；不声称预约已确认'];
export const ZHANGJIAJIE_MAWANGDUI_ROW=['2026-08-05','09:00集合；09:30-约11:00','湖南省博物馆马王堆基本陈列馆1.5小时深度讲解（含门票代预约）','湖南省博物馆','胡丽霞','09:30场；共4人（亲子票1大1小×2份）；09:00馆外集合；4人凭身份证；订单号登录后可见；限制以订单详情和馆方要求为准'];
export const ZHANGJIAJIE_MAWANGDUI_TICKET=['湖南省博物馆马王堆基本陈列馆1.5小时深度讲解（含门票代预约）亲子票1大1小-09:30场×2份','2026-08-05','09:30场','亲子票1大1小×2份（共4人）','4人凭身份证；09:00湖南省博物馆馆外集合','待登录核对','订单号登录后可见；限制以订单详情和馆方要求为准'];
export const ZHANGJIAJIE_JINBIANXI_ROW=['2026-08-07','建议 07:00前出发；约 07:30-09:30／待现场调整','金鞭溪缩短路线','武陵源','胡丽霞','必须赶 13:07 张家界西→芙蓉镇 G9679；从武陵源到张家界西需预留出景区、取行李和路况时间，完整 2.5-3h 游览很可能偏紧，建议只走近段并尽早返程'];
export const ZHANGJIAJIE_JINBIANXI_TRANSFER_ROW=['2026-08-07','建议 09:30-12:30／待确认','金鞭溪后取行李并前往张家界西','武陵源→张家界西','胡丽霞','衔接 13:07 G9679；交通时间以当日路况和景区出入口为准，宁早勿晚'];
export const ZHANGJIAJIE_MENGDONG_ROW=['2026-08-07','13:30后／接驳待确认','芙蓉镇站衔接猛洞河漂流','芙蓉镇→猛洞河漂流区域','胡丽霞','门票截图/订单仅见待填写，拟按 2026-08-07 下午执行；实际接驳时间、开漂/末班和取票规则必须以订单预约或景区确认为准'];
export const ZHANGJIAJIE_JINQI_ROW=['2026-08-07','漂流后／待确认','返回锦栖民宿(张家界高铁西站店)','猛洞河／芙蓉镇区域→张家界西站附近','胡丽霞','漂流后返回张家界西站附近锦栖民宿；返程接驳和到店时间以实际交通为准'];
export const ZHANGJIAJIE_TIANMEN_ROW=['2026-08-08','上午／预约时段待确认','天门山A线','张家界市区天门山','胡丽霞','门票截图/订单仅见待填写，拟按 2026-08-08 上午执行；需预留回锦栖民宿取行李、前往张家界西和 17:00 C7769，索道取票/入园时段以订单预约为准'];
export const ZHANGJIAJIE_MENGDONG_TICKET=['猛洞河漂流','待填写','待填写','2份','凭「联系人手机或预留姓名」取票使用','¥680','预订成功；拟定行程安排为 2026-08-07 下午，实际日期/时段以订单预约或景区确认为准'];
export const ZHANGJIAJIE_TIANMEN_TICKET=['天门山A线','待填写','待填写','2份','凭「下单时预留的证件原件+电子凭证或纸质凭证」使用','¥576','预订成功；拟定行程安排为 2026-08-08 上午，实际日期/时段以订单预约为准'];
const sameRow=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&a.every((v,i)=>String(v)===String(b[i]));
const rowText=row=>Array.isArray(row)?row.map(v=>String(v||'')).join(' '):'';
const has=row=>term=>rowText(row).includes(term);
const isZhangjiajieTrip=trip=>trip?.id==='zhangjiajie';
const isOrangeTransfer=row=>Array.isArray(row)&&row[0]==='2026-08-04'&&has(row)('岳麓山/岳麓书院讲解结束后前往橘子洲');
const isOrangeRow=row=>Array.isArray(row)&&row[0]==='2026-08-04'&&has(row)('橘子洲晚间游览');
const isWrongOrangeRow=row=>Array.isArray(row)&&row[0]==='2026-08-05'&&has(row)('橘子洲');
const isMawangduiRow=row=>Array.isArray(row)&&has(row)('马王堆')&&(has(row)('湖南省博物')||has(row)('湖南博物院'));
const isWrongMawangduiRow=row=>Array.isArray(row)&&row[0]==='2026-08-09'&&isMawangduiRow(row);
const isCurrentMawangduiRow=row=>Array.isArray(row)&&row[0]==='2026-08-05'&&isMawangduiRow(row);
const isOldJinbianxiRow=row=>Array.isArray(row)&&sameRow(row,['2026-08-07','预计 08:30-11:30／待确认','金鞭溪','武陵源','胡丽霞','预计上午游览；需与 13:07 张家界西出发列车衔接核对']);
const isOldTianmenRow=row=>Array.isArray(row)&&sameRow(row,['2026-08-07','预计 14:30-17:30／待预约确认','天门山A线','张家界','胡丽霞','门票 ¥576；2份；原行程写下午天门山，但同日列车到芙蓉镇，需复核预约时段和返程交通；以订单为准']);
const isOldJinqiRow=row=>Array.isArray(row)&&sameRow(row,['2026-08-07','预计 19:00-19:30／待确认','前往锦栖民宿(张家界高铁西站店)','张家界→宁邦广场二期文华里21栋702','胡丽霞','预计晚间抵达/入住，视路况；同日芙蓉镇、天门山安排需复核；全季天门山索道站订单不再单列为行程酒店']);
const isOldMengdongRow=row=>Array.isArray(row)&&sameRow(row,['2026-08-08','预计 09:00-15:00／待预约确认','猛洞河漂流','猛洞河','胡丽霞','门票 ¥680；2份；凭联系人手机或预留姓名取票使用；备换洗衣物；预计时段需预留 17:00 张家界西出发时间']);
const cloneRow=row=>row.slice();
function insertRows(rows,newRows,afterPredicate,beforePredicate){
  const after=rows.findIndex(afterPredicate);
  if(after>=0){rows.splice(after+1,0,...newRows.map(cloneRow));return}
  const before=rows.findIndex(beforePredicate);
  rows.splice(before>=0?before:rows.length,0,...newRows.map(cloneRow));
}
function migrateZhangjiajieTrip(trip){
  if(!isZhangjiajieTrip(trip)||!Array.isArray(trip.itinerary))return {trip,changed:false};
  let changed=false;
  const next={...trip,itinerary:trip.itinerary.map(row=>Array.isArray(row)?row.slice():row)};
  let rows=next.itinerary,filtered=[];
  for(const row of rows){
    if(isWrongOrangeRow(row)||isWrongMawangduiRow(row)||(isOrangeTransfer(row)&&!sameRow(row,ZHANGJIAJIE_ORANGE_TRANSFER_ROW))||(isOrangeRow(row)&&!sameRow(row,ZHANGJIAJIE_ORANGE_ROW))||(isCurrentMawangduiRow(row)&&!sameRow(row,ZHANGJIAJIE_MAWANGDUI_ROW))||isOldJinbianxiRow(row)||isOldTianmenRow(row)||isOldJinqiRow(row)||isOldMengdongRow(row)){changed=true;continue}
    filtered.push(row);
  }
  rows=filtered;
  const needsOrange=!rows.some(row=>sameRow(row,ZHANGJIAJIE_ORANGE_TRANSFER_ROW))||!rows.some(row=>sameRow(row,ZHANGJIAJIE_ORANGE_ROW));
  if(needsOrange){
    insertRows(rows,[ZHANGJIAJIE_ORANGE_TRANSFER_ROW,ZHANGJIAJIE_ORANGE_ROW],row=>Array.isArray(row)&&row[0]==='2026-08-04'&&row[2]==='岳麓山+岳麓书院讲解',row=>Array.isArray(row)&&String(row[0]||'')>'2026-08-04');
    changed=true;
  }
  if(!rows.some(row=>sameRow(row,ZHANGJIAJIE_MAWANGDUI_ROW))){
    insertRows(rows,[ZHANGJIAJIE_MAWANGDUI_ROW],row=>sameRow(row,ZHANGJIAJIE_ORANGE_ROW),row=>Array.isArray(row)&&String(row[0]||'')>'2026-08-05'||Array.isArray(row)&&row[0]==='2026-08-05'&&String(row[2]||'').startsWith('C7950'));
    changed=true;
  }
  if(!rows.some(row=>sameRow(row,ZHANGJIAJIE_JINBIANXI_ROW))||!rows.some(row=>sameRow(row,ZHANGJIAJIE_JINBIANXI_TRANSFER_ROW))){
    insertRows(rows,[ZHANGJIAJIE_JINBIANXI_ROW,ZHANGJIAJIE_JINBIANXI_TRANSFER_ROW].filter(newRow=>!rows.some(row=>sameRow(row,newRow))),row=>Array.isArray(row)&&row[0]==='2026-08-06'&&String(row[2]||'').includes('天子山'),row=>Array.isArray(row)&&row[0]==='2026-08-07'&&String(row[2]||'').startsWith('G9679'));
    changed=true;
  }
  if(!rows.some(row=>sameRow(row,ZHANGJIAJIE_MENGDONG_ROW))||!rows.some(row=>sameRow(row,ZHANGJIAJIE_JINQI_ROW))){
    insertRows(rows,[ZHANGJIAJIE_MENGDONG_ROW,ZHANGJIAJIE_JINQI_ROW].filter(newRow=>!rows.some(row=>sameRow(row,newRow))),row=>Array.isArray(row)&&row[0]==='2026-08-07'&&String(row[2]||'').startsWith('G9679'),row=>Array.isArray(row)&&String(row[0]||'')>'2026-08-07');
    changed=true;
  }
  if(!rows.some(row=>sameRow(row,ZHANGJIAJIE_TIANMEN_ROW))){
    insertRows(rows,[ZHANGJIAJIE_TIANMEN_ROW],row=>Array.isArray(row)&&row[0]==='2026-08-07'&&String(row[2]||'').includes('锦栖民宿'),row=>Array.isArray(row)&&row[0]==='2026-08-08'&&String(row[2]||'').startsWith('C7769'));
    changed=true;
  }
  next.itinerary=rows;
  if(Array.isArray(next.tickets)){
    const oldTicketIndex=next.tickets.findIndex(row=>Array.isArray(row)&&has(row)('湖南省博物馆马王堆讲解'));
    if(oldTicketIndex>=0&&!sameRow(next.tickets[oldTicketIndex],ZHANGJIAJIE_MAWANGDUI_TICKET)){
      next.tickets=next.tickets.slice();
      next.tickets[oldTicketIndex]=cloneRow(ZHANGJIAJIE_MAWANGDUI_TICKET);
      changed=true;
    }
    const oldMengdongTicketIndex=next.tickets.findIndex(row=>sameRow(row,['猛洞河漂流','待填写','待填写','2份','凭「联系人手机或预留姓名」取票使用','¥680','预订成功']));
    if(oldMengdongTicketIndex>=0){
      next.tickets=next.tickets.slice();
      next.tickets[oldMengdongTicketIndex]=cloneRow(ZHANGJIAJIE_MENGDONG_TICKET);
      changed=true;
    }
    const oldTianmenTicketIndex=next.tickets.findIndex(row=>sameRow(row,['天门山A线','待填写','待填写','2份','凭「下单时预留的证件原件+电子凭证或纸质凭证」使用','¥576','预订成功']));
    if(oldTianmenTicketIndex>=0){
      next.tickets=next.tickets.slice();
      next.tickets[oldTianmenTicketIndex]=cloneRow(ZHANGJIAJIE_TIANMEN_TICKET);
      changed=true;
    }
  }
  return {trip:changed?next:trip,changed};
}
export function migrateTripDocument(data){
  if(!plainObject(data)||!Array.isArray(data.trips))return {data,changed:false,migrations:[]};
  let changed=false;
  const trips=data.trips.map(trip=>{
    const result=migrateZhangjiajieTrip(trip);
    changed ||= result.changed;
    return result.trip;
  });
  if(!changed)return {data,changed:false,migrations:[]};
  return {data:{...data,trips},changed:true,migrations:[ZHANGJIAJIE_ITINERARY_MIGRATION]};
}
export function validateDocument(value){
  let size;try{size=new TextEncoder().encode(JSON.stringify(value)).length}catch{return '数据无法序列化'}
  if(size>MAX_BYTES)return `数据不得超过 ${MAX_BYTES} 字节`;
  if(!plainObject(value)||!Array.isArray(value.trips))return '必须包含 trips 数组';
  if(value.trips.length>50)return '旅行计划不得超过 50 个';
  if(typeof value.active!=='string'||typeof value.tab!=='string')return 'active 和 tab 必须为字符串';
  for(const trip of value.trips){if(!plainObject(trip)||typeof trip.id!=='string'||!trip.id||trip.id.length>100||typeof trip.name!=='string'||trip.name.length>200)return '旅行计划字段无效';for(const key of ['categories','itinerary','transport','hotels','emergency','tour'])if(!Array.isArray(trip[key]))return `${key} 必须为数组`;if(trip.tickets!==undefined&&!Array.isArray(trip.tickets))return 'tickets 必须为数组';if(trip.readings!==undefined&&!Array.isArray(trip.readings))return 'readings 必须为数组';}
  return null;
}
