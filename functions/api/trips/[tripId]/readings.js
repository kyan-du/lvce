import {json,listTripReadings,tripExists} from '../../../../lib/readings.js';

export async function onRequestGet({params,env}){
  const tripId=params.tripId;
  if(!tripId||typeof tripId!=='string')return json({error:'旅行计划不存在'},404);
  if(!await tripExists(env,tripId))return json({error:'旅行计划不存在'},404);
  return json({readings:await listTripReadings(env,tripId)});
}
