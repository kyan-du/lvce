const SEAT=/(\d{1,2}车\s*(?:\d{2}[A-Fa-f]|无座))/;
const NAME=/^([\u4e00-\u9fff]{2,4})(?=\s|[票座靠过成儿]|$)/;

function splitPassengers(raw){
  return String(raw||'')
    .split(/[；;\n]+/)
    .map(s=>s.replace(/\s+/g,' ').trim())
    .filter(s=>s&&s!=='待填写');
}

function compactSeat(seat){
  return String(seat||'').replace(/\s+/g,'').replace(/号$/,'');
}

export function formatSeatPassengers(raw){
  return splitPassengers(raw).map(detail=>{
    const seatMatch=detail.match(SEAT);
    const seat=seatMatch?compactSeat(seatMatch[1]):'';
    const name=seat&&NAME.test(detail)?detail.match(NAME)[1]:'';
    const summary=[name,seat].filter(Boolean).join(' ')||detail;
    return {summary,detail};
  });
}
