// Passwordless login from the home network.
// The home gateway (lvce.local on the family NAS) signs a one-minute ticket with its private
// Ed25519 key and sends the browser to /api/auth/home?t=<ticket>. Only the public key lives here,
// so the repository and Cloudflare hold no secret for this. Ticket: home1.<aud>.<exp>.<nonce>.<sig>
export const HOME_LOGIN_PUBLIC_KEY='BgUkP_Og1ngMadxFyF9xCanriapdNa4ZCirTUFcMjbY';
const enc=new TextEncoder();
const unb64u=text=>Uint8Array.from(atob(text.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-text.length%4)%4)),c=>c.charCodeAt(0));
export async function verifyHomeTicket(ticket,aud,{now=Date.now(),publicKey=HOME_LOGIN_PUBLIC_KEY}={}){
 try{
  const parts=String(ticket||'').split('.');
  if(parts.length!==5)return null;
  const [version,audience,expText,nonce,sig]=parts;
  if(version!=='home1'||audience!==aud||!/^\d{9,11}$/.test(expText)||!/^[A-Za-z0-9_-]{16,64}$/.test(nonce)||!/^[A-Za-z0-9_-]{80,90}$/.test(sig))return null;
  const exp=Number(expText),seconds=now/1000;
  if(exp<seconds-30||exp>seconds+180)return null; // one-minute tickets, half a minute of clock skew
  const key=await crypto.subtle.importKey('raw',unb64u(publicKey),{name:'Ed25519'},false,['verify']);
  const ok=await crypto.subtle.verify({name:'Ed25519'},key,unb64u(sig),enc.encode(parts.slice(0,4).join('.')));
  return ok?{nonce,exp}:null;
 }catch{return null}
}
// The session cookie is SameSite=Strict, and a browser arriving through a redirect from lvce.local
// would not send it on a further redirect. A tiny page that moves on by itself makes the next
// request a same-site one, and location.replace keeps the ticket URL out of the history.
export function continuePage(to,setCookie){
 const headers=new Headers({'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer'});
 if(setCookie)headers.append('Set-Cookie',setCookie);
 const target=JSON.stringify(to);
 return new Response(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=${to}"><title>旅册</title><script>location.replace(${target})</script>`,{headers});
}
