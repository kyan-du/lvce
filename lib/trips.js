export const MAX_BYTES=256*1024;
const plainObject=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
export function validateDocument(value){
  let size;try{size=new TextEncoder().encode(JSON.stringify(value)).length}catch{return '数据无法序列化'}
  if(size>MAX_BYTES)return `数据不得超过 ${MAX_BYTES} 字节`;
  if(!plainObject(value)||!Array.isArray(value.trips))return '必须包含 trips 数组';
  if(value.trips.length>50)return '旅行计划不得超过 50 个';
  if(typeof value.active!=='string'||typeof value.tab!=='string')return 'active 和 tab 必须为字符串';
  for(const trip of value.trips){if(!plainObject(trip)||typeof trip.id!=='string'||!trip.id||trip.id.length>100||typeof trip.name!=='string'||trip.name.length>200)return '旅行计划字段无效';for(const key of ['categories','itinerary','transport','hotels','emergency','tour'])if(!Array.isArray(trip[key]))return `${key} 必须为数组`;if(trip.tickets!==undefined&&!Array.isArray(trip.tickets))return 'tickets 必须为数组';}
  return null;
}
