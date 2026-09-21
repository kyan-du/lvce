const NOTE_HINT=/(入住|离店|取消|订单|预留|到店|同夜|报住客|出示证件)/;
const ROOM_HINT=/(双床|大床|家庭房|套房|㎡|m²|外景窗|早餐|床房)/;
const EMAIL=/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const PHONE=/(?:\+?86[-\s]?)?(?:1\d{10}|0\d{2,3}-?\d{7,8})/;

export function splitHotelRoomAndNotes(raw=''){
  let text=String(raw||'').replace(/^房型[：:]\s*/,'').trim();
  if(!text)return {room:'',notes:''};
  const parts=text.split(/[；;]/).map(s=>s.trim()).filter(Boolean);
  if(parts.length<=1)return {room:text,notes:''};
  const room=[],notes=[];
  for(const part of parts){
    const isNote=NOTE_HINT.test(part)&&!ROOM_HINT.test(part);
    (isNote?notes:room).push(part);
  }
  if(!room.length)return {room:'',notes:parts.join('；')};
  return {room:room.join('；'),notes:notes.join('；')};
}

export function parseHotelContact(raw=''){
  const text=String(raw||'').replace(/待填写/g,'').trim();
  const email=(text.match(EMAIL)||[''])[0];
  const withoutEmail=email?text.replace(email,''):text;
  const phoneMatch=withoutEmail.match(PHONE);
  const phone=phoneMatch?phoneMatch[0].replace(/\s+/g,''):withoutEmail.replace(/[；;\n]+/g,' ').trim();
  return {phone:phone&&phone!==email?phone:'',email:email||''};
}

export function formatHotelContact({phone='',email=''}={}){
  return [phone,email].map(v=>String(v||'').trim()).filter(Boolean).join('\n');
}

export function stripRoomType(v){
  return String(v||'').replace(/^房型[：:]\s*/,'').trim();
}

export function normalizeHotelRow(row){
  let r;
  if(row&&typeof row==='object'&&!Array.isArray(row)){
    r=[row.name||row.hotel||'',row.checkin||row.checkIn||'',row.checkout||row.checkOut||'',row.contact||row.phoneEmail||'',row.address||'',row.roomType||row.confirmation||'',row.nights||row.days||'',row.totalCost||row.cost||'',row.notes||row.remark||''];
  }else{
    r=Array.isArray(row)?row.slice():[];
    const legacyThird=String(r[2]||'').trim();
    if(r.length>=10)r=[r[0],r[1],r[8],r[3],r[4],r[5],r[6],r[7],r[9]];
    else if(r.length>=9&&/^\d{4}-\d{2}-\d{2}$/.test(String(r[8]||'')))r=[r[0],r[1],r[8],r[3],r[4],r[5],r[6],r[7],''];
    else if(r.length===8&&legacyThird&&!/^\d{4}-\d{2}-\d{2}$/.test(legacyThird))r=[r[0],r[1],'',r[3],r[4],r[5],r[6],r[7],''];
  }
  while(r.length<9)r.push('');
  r=r.slice(0,9);
  r[2]=String(r[2]||'').trim()==='待填写'?'':r[2];
  const split=splitHotelRoomAndNotes(r[5]);
  r[5]=split.room;
  if(!String(r[8]||'').trim()&&split.notes)r[8]=split.notes;
  const n=diffDays(r[1],r[2]);
  if(n)r[6]=n;
  return r;
}

function diffDays(start,end){
  const a=new Date(start+'T00:00:00'),b=new Date(end+'T00:00:00');
  if(Number.isNaN(a.getTime())||Number.isNaN(b.getTime()))return '';
  const n=Math.round((b-a)/864e5);
  return n>0?String(n):'';
}
