import {cookie,readSession} from '../lib/auth.js';
const PUBLIC=new Set(['/login','/login.html','/style.css','/app.js','/favicon.ico','/site.webmanifest','/api/login','/api/auth/login']);
const NO_STORE='no-store, no-cache, must-revalidate, max-age=0';
function shouldDisableCache(url,response){
 const type=(response.headers.get('content-type')||'').toLowerCase();
 return url.pathname==='/'||url.pathname==='/login'||url.pathname.endsWith('.html')||url.pathname.endsWith('.js')||url.pathname.endsWith('.css')||type.includes('text/html')||type.includes('javascript')||type.includes('text/css');
}
async function nextWithStaticCacheHeaders(context,url){
 const response=await context.next();
 if(!shouldDisableCache(url,response))return response;
 const headers=new Headers(response.headers);
 headers.set('Cache-Control',NO_STORE);
 return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}
export async function onRequest(context){
 const {request,env}=context,url=new URL(request.url);
 if(PUBLIC.has(url.pathname)||url.pathname.startsWith('/assets/')||url.pathname.startsWith('/api/public/trips/')||url.pathname.startsWith('/share/'))return nextWithStaticCacheHeaders(context,url);
 if(!env.SESSION_SECRET)return new Response('服务端尚未配置 SESSION_SECRET',{status:503});
 const session=await readSession(cookie(request,'lvce_session'),env.SESSION_SECRET);
 if(session){const row=await env.DB.prepare('SELECT 1 AS valid FROM sessions WHERE id = ? AND expires_at > unixepoch()').bind(session.sid).first();if(row)return nextWithStaticCacheHeaders(context,url)}
 if(url.pathname.startsWith('/api/'))return Response.json({error:'未登录'},{status:401});
 return new Response(null,{status:302,headers:{Location:'/login'}});
}
