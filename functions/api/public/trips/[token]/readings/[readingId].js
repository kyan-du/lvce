import {hashShareToken,validShareToken} from '../../../../../../lib/share.js';
import {getTripReading,json,readingFull,validReadingId} from '../../../../../../lib/readings.js';

export async function onRequestGet({params,env}){
  const {token,readingId}=params;
  if(!validShareToken(token)||!validReadingId(readingId))return json({error:'分享不存在'},404);
  const hash=await hashShareToken(token);
  const share=await env.DB.prepare('SELECT trip_id FROM public_trip_shares WHERE token_hash = ?').bind(hash).first();
  if(!share)return json({error:'分享不存在'},404);
  const row=await getTripReading(env,share.trip_id,readingId);
  if(!row)return json({error:'旅读不存在'},404);
  return json(readingFull(row));
}
