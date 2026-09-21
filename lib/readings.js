const headers={'Cache-Control':'no-store'};
export const MAX_READING_BYTES=64*1024;
export const READING_ID=/^[A-Za-z0-9][A-Za-z0-9_-]{0,99}$/;

export function json(body,status=200){
  return Response.json(body,{status,headers});
}

export async function ensureReadingsTable(env){
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS readings (
    trip_id TEXT NOT NULL,
    reading_id TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    venue TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT '',
    markdown TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (trip_id, reading_id)
  )`).run();
}

export function validReadingId(id){
  return typeof id==='string'&&READING_ID.test(id);
}

function clip(value,label,max=200){
  if(value==null)return '';
  if(typeof value!=='string')throw Error(`${label} 必须为字符串`);
  if(value.length>max)throw Error(`${label} 过长`);
  return value;
}

export function parseReadingBody(body,readingId){
  if(!validReadingId(readingId))throw Error('旅读 id 无效');
  if(!body||typeof body!=='object'||Array.isArray(body))throw Error('JSON 格式错误');
  const title=clip(body.title,'标题')||'未命名旅读';
  const venue=clip(body.venue,'地点');
  const category=clip(body.category,'分类');
  if(typeof body.markdown!=='string')throw Error('缺少正文');
  if(body.markdown.length>MAX_READING_BYTES)throw Error('正文过大');
  return {id:readingId,title,venue,category,markdown:body.markdown};
}

export function readingPublic(row){
  return {id:row.reading_id,title:row.title,venue:row.venue,category:row.category,updatedAt:row.updated_at};
}

export function readingFull(row){
  return {...readingPublic(row),markdown:row.markdown};
}

export async function tripExists(env,tripId){
  const row=await env.DB.prepare("SELECT data FROM documents WHERE id = 'trips'").first();
  if(!row)return false;
  try{
    const data=JSON.parse(row.data);
    return Array.isArray(data?.trips)&&data.trips.some(t=>t?.id===tripId);
  }catch{
    return false;
  }
}

export async function listTripReadings(env,tripId){
  await ensureReadingsTable(env);
  const result=await env.DB.prepare('SELECT trip_id, reading_id, title, venue, category, updated_at FROM readings WHERE trip_id = ? ORDER BY reading_id').bind(tripId).all();
  return (result.results||[]).map(readingPublic);
}

export async function getTripReading(env,tripId,readingId){
  await ensureReadingsTable(env);
  const row=await env.DB.prepare('SELECT trip_id, reading_id, title, venue, category, markdown, updated_at FROM readings WHERE trip_id = ? AND reading_id = ?').bind(tripId,readingId).first();
  return row||null;
}

export async function putTripReading(env,tripId,reading){
  await ensureReadingsTable(env);
  await env.DB.prepare('INSERT OR REPLACE INTO readings (trip_id, reading_id, title, venue, category, markdown, updated_at) VALUES (?,?,?,?,?,?,datetime(\'now\'))').bind(tripId,reading.id,reading.title,reading.venue,reading.category,reading.markdown).run();
  return getTripReading(env,tripId,reading.id);
}

export async function deleteTripReading(env,tripId,readingId){
  await ensureReadingsTable(env);
  const result=await env.DB.prepare('DELETE FROM readings WHERE trip_id = ? AND reading_id = ?').bind(tripId,readingId).run();
  return result.meta.changes===1;
}
