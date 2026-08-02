import {cookie,verifySession} from '../lib/auth.js';
const PUBLIC=new Set(['/login.html','/style.css','/api/auth/login']);
export async function onRequest(context){
 const {request,env}=context,url=new URL(request.url);
 if(PUBLIC.has(url.pathname))return context.next();
 if(!env.SESSION_SECRET)return new Response('服务端尚未配置 SESSION_SECRET',{status:503});
 if(await verifySession(cookie(request,'lvce_session'),env.SESSION_SECRET))return context.next();
 if(url.pathname.startsWith('/api/'))return Response.json({error:'未登录'},{status:401});
 return Response.redirect(new URL('/login.html',url),302);
}
