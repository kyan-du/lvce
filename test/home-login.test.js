import test from 'node:test';import assert from 'node:assert/strict';
import {generateKeyPairSync,sign} from 'node:crypto';
import {verifyHomeTicket,HOME_LOGIN_PUBLIC_KEY} from '../lib/home-login.js';
import {onRequestGet as homeLogin} from '../functions/api/auth/home.js';
import {onRequest as middleware} from '../functions/_middleware.js';
import {makeSession,readSession} from '../lib/auth.js';

const {publicKey,privateKey}=generateKeyPairSync('ed25519');
const rawPublic=publicKey.export({format:'jwk'}).x; // base64url raw key
const NOW=1_800_000_000_000;
function ticket({aud='lvce',exp=NOW/1000+60,nonce='AAAAAAAAAAAAAAAAAAAAAA',key=privateKey}={}){
  const payload=`home1.${aud}.${Math.floor(exp)}.${nonce}`;
  return `${payload}.${sign(null,Buffer.from(payload),key).toString('base64url')}`;
}
const opts={now:NOW,publicKey:rawPublic};

test('home ticket: valid signature, audience and time',async()=>{
  assert.deepEqual(await verifyHomeTicket(ticket(),'lvce',opts),{nonce:'AAAAAAAAAAAAAAAAAAAAAA',exp:NOW/1000+60});
});
test('home ticket: rejects other audience, expired, far future, tampered, foreign key, junk',async()=>{
  assert.equal(await verifyHomeTicket(ticket({aud:'gongzu'}),'lvce',opts),null);
  assert.equal(await verifyHomeTicket(ticket({exp:NOW/1000-31}),'lvce',opts),null);
  assert.equal(await verifyHomeTicket(ticket({exp:NOW/1000+181}),'lvce',opts),null);
  const t=ticket();assert.equal(await verifyHomeTicket(t.replace('.AAAA','.BAAA'),'lvce',opts),null);
  const other=generateKeyPairSync('ed25519').privateKey;
  assert.equal(await verifyHomeTicket(ticket({key:other}),'lvce',opts),null);
  for(const junk of [null,'','home1.lvce','a.b.c.d.e',ticket()+'x'])assert.equal(await verifyHomeTicket(junk,'lvce',opts),null);
});
test('home ticket: the shipped public key is a 32-byte Ed25519 key',()=>{
  assert.equal(Buffer.from(HOME_LOGIN_PUBLIC_KEY,'base64url').length,32);
});

function fakeDB(){
  const sessions=new Map();
  return {sessions,prepare(sql){return {bind(...args){return {
    async first(){if(sql.startsWith('SELECT')){const exp=sessions.get(args[0]);return exp&&exp>Date.now()/1000?{valid:1}:null}return null},
    async run(){if(sql.startsWith('INSERT OR IGNORE INTO sessions')){if(sessions.has(args[0]))return {meta:{changes:0}};sessions.set(args[0],args[1]);return {meta:{changes:1}}}return {meta:{changes:0}}}
  }}}}};
}
test('GET /api/auth/home: a signed ticket logs in once, then is refused',async()=>{
  const env={SESSION_SECRET:'x'.repeat(40),DB:fakeDB(),HOME_LOGIN_PUBLIC_KEY:rawPublic};
  const t=ticket({exp:Math.floor(Date.now()/1000)+60});
  const url=`https://lvce.pages.dev/api/auth/home?t=${t}`;
  const ok=await homeLogin({request:new Request(url),env});
  assert.match(await ok.text(),/location\.replace\("\/"\)/);
  const set=ok.headers.get('Set-Cookie');
  assert.match(set,/^lvce_session=[^;]+; Path=\/; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000$/);
  assert.equal(ok.headers.get('Cache-Control'),'no-store');
  const session=await readSession(set.split(';')[0].split('=')[1],env.SESSION_SECRET);
  assert.equal(session.sid,'home-AAAAAAAAAAAAAAAAAAAAAA');
  assert.ok(env.DB.sessions.has(session.sid));
  const again=await homeLogin({request:new Request(url),env});
  assert.match(await again.text(),/location\.replace\("\/login"\)/);
  assert.equal(again.headers.get('Set-Cookie'),null);
  const foreign=await homeLogin({request:new Request(`https://lvce.pages.dev/api/auth/home?t=${ticket({exp:Math.floor(Date.now()/1000)+60,nonce:'BBBBBBBBBBBBBBBBBBBBBB',key:generateKeyPairSync('ed25519').privateKey})}`),env});
  assert.match(await foreign.text(),/location\.replace\("\/login"\)/);
});
test('GET /api/auth/home passes the middleware without a session',async()=>{
  let passed=false;
  const res=await middleware({request:new Request('https://lvce.pages.dev/api/auth/home?t=x'),env:{},next:async()=>{passed=true;return new Response('ok',{headers:{'content-type':'text/html'}})}});
  assert.equal(passed,true);assert.equal(res.status,200);
});
test('GET /api/auth/home with an existing valid session skips the ticket',async()=>{
  const env={SESSION_SECRET:'x'.repeat(40),DB:fakeDB()};
  env.DB.sessions.set('s1',Math.floor(Date.now()/1000)+100);
  const token=await makeSession(env.SESSION_SECRET,Date.now(),'s1');
  const res=await homeLogin({request:new Request('https://lvce.pages.dev/api/auth/home?t=junk',{headers:{Cookie:`lvce_session=${token}`}}),env});
  assert.match(await res.text(),/location\.replace\("\/"\)/);
  assert.equal(res.headers.get('Set-Cookie'),null);
  assert.ok(await readSession(token,env.SESSION_SECRET));
});
