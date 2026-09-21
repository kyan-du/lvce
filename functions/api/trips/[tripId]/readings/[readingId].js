import {deleteTripReading,getTripReading,json,parseReadingBody,putTripReading,readingFull,tripExists,validReadingId} from '../../../../../lib/readings.js';

export async function onRequestGet({params,env}){
  const {tripId,readingId}=params;
  if(!tripId||!validReadingId(readingId))return json({error:'旅读不存在'},404);
  if(!await tripExists(env,tripId))return json({error:'旅行计划不存在'},404);
  const row=await getTripReading(env,tripId,readingId);
  if(!row)return json({error:'旅读不存在'},404);
  return json(readingFull(row));
}

export async function onRequestPut({params,request,env}){
  const {tripId,readingId}=params;
  if(!tripId||!validReadingId(readingId))return json({error:'旅读 id 无效'},400);
  if(!await tripExists(env,tripId))return json({error:'旅行计划不存在'},404);
  let body;try{body=await request.json()}catch{return json({error:'JSON 格式错误'},400)}
  let reading;try{reading=parseReadingBody(body,readingId)}catch(error){return json({error:error.message},error.message.includes('过大')?413:400)}
  const row=await putTripReading(env,tripId,reading);
  return json(readingFull(row));
}

export async function onRequestDelete({params,env}){
  const {tripId,readingId}=params;
  if(!tripId||!validReadingId(readingId))return json({error:'旅读不存在'},404);
  if(!await tripExists(env,tripId))return json({error:'旅行计划不存在'},404);
  if(!await deleteTripReading(env,tripId,readingId))return json({error:'旅读不存在'},404);
  return json({ok:true});
}
