export const MAX_BYTES=256*1024;
const plainObject=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
export const ZHANGJIAJIE_ITINERARY_MIGRATION='zhangjiajie-itinerary-20260804-v1';
export const ZHANGJIAJIE_ORANGE_TRANSFER_ROW=['2026-08-04','预计 17:00-18:30','岳麓山/岳麓书院讲解结束后前往橘子洲并晚餐衔接','岳麓山／岳麓书院→橘子洲','胡丽霞','预留讲解结束后的市内交通与晚餐衔接，实际以路况、景区入口和餐厅安排为准'];
export const ZHANGJIAJIE_ORANGE_ROW=['2026-08-04','预计 18:30-21:00','橘子洲晚间游览','橘子洲','胡丽霞','今晚 2026-08-04 前往橘子洲；预计晚间时段，待现场开放与交通确认；不声称预约已确认'];
export const ZHANGJIAJIE_MAWANGDUI_ROW=['2026-08-05','09:00集合；09:30-约11:00','湖南省博物馆马王堆基本陈列馆1.5小时深度讲解（含门票代预约）','湖南省博物馆','胡丽霞','09:30场；共4人（亲子票1大1小×2份）；09:00馆外集合；4人凭身份证；订单号登录后可见；限制以订单详情和馆方要求为准'];
export const ZHANGJIAJIE_MAWANGDUI_TICKET=['湖南省博物馆马王堆基本陈列馆1.5小时深度讲解（含门票代预约）亲子票1大1小-09:30场×2份','2026-08-05','09:30场','亲子票1大1小×2份（共4人）','4人凭身份证；09:00湖南省博物馆馆外集合','待登录核对','订单号登录后可见；限制以订单详情和馆方要求为准'];
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
    if(isWrongOrangeRow(row)||isWrongMawangduiRow(row)||(isOrangeTransfer(row)&&!sameRow(row,ZHANGJIAJIE_ORANGE_TRANSFER_ROW))||(isOrangeRow(row)&&!sameRow(row,ZHANGJIAJIE_ORANGE_ROW))||(isCurrentMawangduiRow(row)&&!sameRow(row,ZHANGJIAJIE_MAWANGDUI_ROW))){changed=true;continue}
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
  next.itinerary=rows;
  if(Array.isArray(next.tickets)){
    const oldTicketIndex=next.tickets.findIndex(row=>Array.isArray(row)&&has(row)('湖南省博物馆马王堆讲解'));
    if(oldTicketIndex>=0&&!sameRow(next.tickets[oldTicketIndex],ZHANGJIAJIE_MAWANGDUI_TICKET)){
      next.tickets=next.tickets.slice();
      next.tickets[oldTicketIndex]=cloneRow(ZHANGJIAJIE_MAWANGDUI_TICKET);
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
