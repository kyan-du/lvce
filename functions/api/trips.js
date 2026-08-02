import {validateDocument,MAX_BYTES} from '../../lib/trips.js';
const headers={'Cache-Control':'no-store'};
export async function onRequestGet({env}){const row=await env.DB.prepare("SELECT data, updated_at FROM documents WHERE id = 'trips'").first();return Response.json(row?{data:JSON.parse(row.data),updatedAt:row.updated_at}:{data:null},{headers})}
export async function onRequestPut({request,env}){
 const length=Number(request.headers.get('content-length')||0);if(length>MAX_BYTES)return Response.json({error:'数据过大'},{status:413,headers});
 let data;try{data=await request.json()}catch{return Response.json({error:'JSON 格式错误'},{status:400,headers})}
 const error=validateDocument(data);if(error)return Response.json({error},{status:error.includes('字节')?413:400,headers});
 const json=JSON.stringify(data);await env.DB.prepare("INSERT INTO documents (id,data,updated_at) VALUES ('trips',?,datetime('now')) ON CONFLICT(id) DO UPDATE SET data=excluded.data, updated_at=excluded.updated_at").bind(json).run();return new Response(null,{status:204,headers});
}
