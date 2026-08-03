import {cookie,readSession} from '../lib/auth.js';
const PUBLIC=new Set(['/login','/login.html','/style.css','/api/auth/login']);
export async function onRequest(context){
 const {request,env}=context,url=new URL(request.url);
 if(PUBLIC.has(url.pathname))return context.next();
 if(!env.SESSION_SECRET)return new Response('服务端尚未配置 SESSION_SECRET',{status:503});
 const session=await readSession(cookie(request,'lvce_session'),env.SESSION_SECRET);
 if(session){const row=await env.DB.prepare('SELECT 1 AS valid FROM sessions WHERE id = ? AND expires_at > unixepoch()').bind(session.sid).first();if(row)return context.next()}
 if(url.pathname.startsWith('/api/'))return Response.json({error:'未登录'},{status:401});
 return Response.redirect(new URL('/login',url),302);
}
