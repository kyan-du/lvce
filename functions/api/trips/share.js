import {hashShareToken,randomShareToken} from '../../../lib/share.js';

const headers={'Cache-Control':'no-store'};
function methodNotAllowed(){
  return Response.json({error:'请求方法不支持'},{status:405,headers:{...headers,Allow:'POST, DELETE'}});
}
async function readTrips(env){
  const row=await env.DB.prepare("SELECT data FROM documents WHERE id = 'trips'").first();
  return row?JSON.parse(row.data):null;
}
async function requireTrip(env,tripId){
  const data=await readTrips(env);
  return data?.trips?.some(t=>t?.id===tripId)?data:null;
}
export async function onRequestPost({request,env}){
  let body;try{body=await request.json()}catch{return Response.json({error:'JSON 格式错误'},{status:400,headers})}
  const tripId=typeof body?.tripId==='string'?body.tripId:'';
  if(!tripId)return Response.json({error:'缺少旅行计划'},{status:400,headers});
  if(!await requireTrip(env,tripId))return Response.json({error:'旅行计划不存在'},{status:404,headers});
  const exists=await env.DB.prepare('SELECT 1 FROM public_trip_shares WHERE trip_id = ?').bind(tripId).first();
  if(exists)return Response.json({error:'旅行计划已分享'},{status:409,headers});
  const token=randomShareToken(),hash=await hashShareToken(token);
  await env.DB.prepare('INSERT INTO public_trip_shares (token_hash,trip_id) VALUES (?,?)').bind(hash,tripId).run();
  return Response.json({token},{headers});
}
export async function onRequestDelete({request,env}){
  let body;try{body=await request.json()}catch{return Response.json({error:'JSON 格式错误'},{status:400,headers})}
  const tripId=typeof body?.tripId==='string'?body.tripId:'';
  if(!tripId)return Response.json({error:'缺少旅行计划'},{status:400,headers});
  await env.DB.prepare('DELETE FROM public_trip_shares WHERE trip_id = ?').bind(tripId).run();
  return Response.json({ok:true},{headers});
}
export const onRequestGet=methodNotAllowed;
export const onRequestPut=methodNotAllowed;
export const onRequestPatch=methodNotAllowed;
