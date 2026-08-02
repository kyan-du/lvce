import {makeSession,verifyPassword} from '../../../lib/auth.js';
export async function onRequestPost({request,env}){
 if(!env.FAMILY_PASSWORD_HASH||!env.SESSION_SECRET)return Response.json({error:'服务端尚未配置登录密钥'},{status:503});
 let body;try{body=await request.json()}catch{return Response.json({error:'请求格式错误'},{status:400})}
 if(typeof body.password!=='string'||body.password.length>256||!(await verifyPassword(body.password,env.FAMILY_PASSWORD_HASH)))return Response.json({error:'口令错误'},{status:401});
 const token=await makeSession(env.SESSION_SECRET);
 return new Response(null,{status:204,headers:{'Set-Cookie':`lvce_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000`,'Cache-Control':'no-store'}});
}
