import {validateDocument,MAX_BYTES} from '../../lib/trips.js';
const headers={'Cache-Control':'no-store'};
export async function onRequestGet({env}){const row=await env.DB.prepare("SELECT data, updated_at, version FROM documents WHERE id = 'trips'").first();let shares={};try{let result=await env.DB.prepare('SELECT trip_id FROM public_trip_shares').all();shares=Object.fromEntries((result.results||[]).map(r=>[r.trip_id,true]))}catch{}return Response.json(row?{data:JSON.parse(row.data),updatedAt:row.updated_at,version:row.version,shares}:{data:null,version:0,shares:{}},{headers})}
export async function onRequestPut({request,env}){
 const length=Number(request.headers.get('content-length')||0);if(length>MAX_BYTES)return Response.json({error:'数据过大'},{status:413,headers});
 let data;try{data=await request.json()}catch{return Response.json({error:'JSON 格式错误'},{status:400,headers})}
 const error=validateDocument(data);if(error)return Response.json({error},{status:error.includes('字节')?413:400,headers});
 const expected=Number(request.headers.get('If-Match'));if(!Number.isInteger(expected)||expected<0)return Response.json({error:'缺少有效的数据版本'},{status:428,headers});
 const json=JSON.stringify(data);let result;if(expected===0)result=await env.DB.prepare("INSERT OR IGNORE INTO documents (id,data,updated_at,version) VALUES ('trips',?,datetime('now'),1)").bind(json).run();else result=await env.DB.prepare("UPDATE documents SET data=?, updated_at=datetime('now'), version=version+1 WHERE id='trips' AND version=?").bind(json,expected).run();
 if(result.meta.changes!==1){const current=await env.DB.prepare("SELECT version FROM documents WHERE id='trips'").first();return Response.json({error:'数据已在其他设备更新，请刷新后重试',version:current?.version||0},{status:409,headers})}
 return Response.json({version:expected+1},{headers});
}
