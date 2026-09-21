import {deleteTripReading,getTripReading,json,listTripReadings,parseReadingBody,putTripReading,readingFull,tripExists,validReadingId} from '../../../lib/readings.js';

function partsFrom(params,request){
  const path=Array.isArray(params?.path)?params.path:[];
  if(path.length>=2&&path[1]==='readings')return {tripId:path[0],readingId:path[2]||''};
  try{
    const pathname=new URL(request.url).pathname;
    const one=pathname.match(/^\/api\/trips\/([^/]+)\/readings\/([^/]+)\/?$/);
    if(one)return {tripId:decodeURIComponent(one[1]),readingId:decodeURIComponent(one[2])};
    const list=pathname.match(/^\/api\/trips\/([^/]+)\/readings\/?$/);
    if(list)return {tripId:decodeURIComponent(list[1]),readingId:''};
  }catch{}
  return {tripId:'',readingId:''};
}

export async function onRequestGet({params,env,request}){
  const {tripId,readingId}=partsFrom(params,request);
  if(!tripId)return json({error:'旅行计划不存在'},404);
  if(!await tripExists(env,tripId))return json({error:'旅行计划不存在'},404);
  if(readingId){
    if(!validReadingId(readingId))return json({error:'旅读不存在'},404);
    const row=await getTripReading(env,tripId,readingId);
    if(!row)return json({error:'旅读不存在'},404);
    return json(readingFull(row));
  }
  return json({readings:await listTripReadings(env,tripId)});
}

export async function onRequestPut({params,request,env}){
  const {tripId,readingId}=partsFrom(params,request);
  if(!tripId||!validReadingId(readingId))return json({error:'旅读 id 无效'},400);
  if(!await tripExists(env,tripId))return json({error:'旅行计划不存在'},404);
  let body;try{body=await request.json()}catch{return json({error:'JSON 格式错误'},400)}
  let reading;try{reading=parseReadingBody(body,readingId)}catch(error){return json({error:error.message},error.message.includes('过大')?413:400)}
  const row=await putTripReading(env,tripId,reading);
  return json(readingFull(row));
}

export async function onRequestDelete({params,request,env}){
  const {tripId,readingId}=partsFrom(params,request);
  if(!tripId||!validReadingId(readingId))return json({error:'旅读不存在'},404);
  if(!await tripExists(env,tripId))return json({error:'旅行计划不存在'},404);
  if(!await deleteTripReading(env,tripId,readingId))return json({error:'旅读不存在'},404);
  return json({ok:true});
}
