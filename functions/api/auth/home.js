import {cookie,makeSession,readSession} from '../../../lib/auth.js';
import {continuePage,verifyHomeTicket} from '../../../lib/home-login.js';
// GET /api/auth/home?t=<ticket from the home gateway> → logged in, like the family password.
export async function onRequestGet({request,env}){
 if(!env.SESSION_SECRET)return continuePage('/login');
 const existing=await readSession(cookie(request,'lvce_session'),env.SESSION_SECRET);
 if(existing){const row=await env.DB.prepare('SELECT 1 AS valid FROM sessions WHERE id = ? AND expires_at > unixepoch()').bind(existing.sid).first();if(row)return continuePage('/')}
 const ticket=await verifyHomeTicket(new URL(request.url).searchParams.get('t'),'lvce',{publicKey:env.HOME_LOGIN_PUBLIC_KEY||undefined});
 if(!ticket)return continuePage('/login');
 // The session id comes from the ticket's nonce, so a ticket opens at most one session.
 const sid=`home-${ticket.nonce}`;
 const result=await env.DB.prepare('INSERT OR IGNORE INTO sessions (id, expires_at) VALUES (?, ?)').bind(sid,Math.floor(Date.now()/1000)+2592000).run();
 if((result.meta?.changes??0)!==1)return continuePage('/login');
 const token=await makeSession(env.SESSION_SECRET,Date.now(),sid);
 return continuePage('/',`lvce_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000`);
}
