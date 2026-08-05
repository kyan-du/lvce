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
function maskPhone(value=''){
  const digits=String(value).replace(/\D/g,'');
  return digits.length>=7?`${digits.slice(0,3)} **** ${digits.slice(-4)}`:String(value);
}
function publicTrip(trip){
  const copy=structuredClone(trip);
  if(Array.isArray(copy.bookingDetails))copy.bookingDetails=copy.bookingDetails.map(({orderNumber,privateNotes,...detail})=>detail);
  if(Array.isArray(copy.tickets))copy.tickets=copy.tickets.map(row=>{const next=Array.isArray(row)?row.slice():row;if(Array.isArray(next)){if(next.length>8)next[8]='';if(next.length>11)next[11]=''}return next});
  if(Array.isArray(copy.emergency))copy.emergency=copy.emergency.map(row=>{
    if(row&&typeof row==='object'&&!Array.isArray(row))return {...row,phone:maskPhone(row.maskedPhone||row.phone||row.fullPhone||''),maskedPhone:maskPhone(row.maskedPhone||row.phone||row.fullPhone||''),fullPhone:''};
    const next=Array.isArray(row)?row.slice():[];
    next[1]=maskPhone(next[1]||next[3]||'');
    if(next.length>3)next[3]='';
    return next;
  });
  return copy;
}
export function publicTripDocument(data,tripId){
  const trip=data?.trips?.find(t=>t?.id===tripId);
  return trip?{active:trip.id,tab:data.tab||'itinerary',trips:[publicTrip(trip)]}:null;
}
