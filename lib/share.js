const enc=new TextEncoder();
const TOKEN_BYTES=32;
export function randomShareToken(){
  const bytes=new Uint8Array(TOKEN_BYTES);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
export function validShareToken(token){
  return typeof token==='string'&&/^[A-Za-z0-9_-]{43}$/.test(token);
}
export async function hashShareToken(token){
  const digest=await crypto.subtle.digest('SHA-256',enc.encode(token));
  return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
}
export function publicTripDocument(data,tripId){
  const trip=data?.trips?.find(t=>t?.id===tripId);
  return trip?{active:trip.id,tab:data.tab||'itinerary',trips:[trip]}:null;
}
