import {hashShareToken,validShareToken} from '../../../../lib/share.js';
import {getTripReading,json,readingFull,validReadingId} from '../../../../lib/readings.js';

function partsFrom(params,request){
  const path=Array.isArray(params?.path)?params.path:[];
  if(path.length>=3&&path[1]==='readings')return {token:path[0],readingId:path[2]};
  try{
    const match=new URL(request.url).pathname.match(/^\/api\/public\/trips\/([^/]+)\/readings\/([^/]+)\/?$/);
    if(match)return {token:decodeURIComponent(match[1]),readingId:decodeURIComponent(match[2])};
  }catch{}
  return {token:params?.token||'',readingId:''};
}

export async function onRequestGet({params,env,request}){
  const {token,readingId}=partsFrom(params,request);
  if(!validShareToken(token)||!validReadingId(readingId))return json({error:'分享不存在'},404);
  const hash=await hashShareToken(token);
  const share=await env.DB.prepare('SELECT trip_id FROM public_trip_shares WHERE token_hash = ?').bind(hash).first();
  if(!share)return json({error:'分享不存在'},404);
  const row=await getTripReading(env,share.trip_id,readingId);
  if(!row)return json({error:'旅读不存在'},404);
  return json(readingFull(row));
}
