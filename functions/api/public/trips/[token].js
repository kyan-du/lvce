import {hashShareToken,publicTripDocument,validShareToken} from '../../../../lib/share.js';

const headers={'Cache-Control':'no-store'};
export async function onRequestGet({params,env}){
  const token=params.token;
  if(!validShareToken(token))return Response.json({error:'分享不存在'},{status:404,headers});
  const hash=await hashShareToken(token);
  const share=await env.DB.prepare('SELECT trip_id FROM public_trip_shares WHERE token_hash = ?').bind(hash).first();
  if(!share)return Response.json({error:'分享不存在'},{status:404,headers});
  const row=await env.DB.prepare("SELECT data, updated_at, version FROM documents WHERE id = 'trips'").first();
  const data=row?JSON.parse(row.data):null,publicData=publicTripDocument(data,share.trip_id);
  if(!publicData){
    await env.DB.prepare('DELETE FROM public_trip_shares WHERE token_hash = ?').bind(hash).run();
    return Response.json({error:'分享已失效'},{status:410,headers});
  }
  return Response.json({data:publicData,updatedAt:row.updated_at,version:row.version},{headers});
}
