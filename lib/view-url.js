export const VIEW_TABS=['itinerary','bookings','packing','reading'];
const TAB=new Set(VIEW_TABS);

function segs(hash){
  try{
    return decodeURIComponent(String(hash||'').replace(/^#\/?/,'').replace(/\/+$/,'')).split('/').filter(Boolean);
  }catch{
    return [];
  }
}

export function parseViewHash(hash,{publicView=false}={}){
  const parts=segs(hash);
  if(publicView){
    const tab=TAB.has(parts[0])?parts[0]:'itinerary';
    return {tripId:'',tab,reading:tab==='reading'&&parts[1]?parts[1]:''};
  }
  const tripId=parts[0]&&!TAB.has(parts[0])?parts[0]:'';
  const rest=tripId?parts.slice(1):parts;
  const tab=TAB.has(rest[0])?rest[0]:'itinerary';
  return {tripId,tab,reading:tab==='reading'&&rest[1]?rest[1]:''};
}

export function formatViewHash({publicView=false,tripId='',tab='itinerary',reading=''}={}){
  const safeTab=TAB.has(tab)?tab:'itinerary';
  const article=safeTab==='reading'&&reading?reading:'';
  const parts=publicView?[safeTab,article]:[tripId,safeTab,article];
  return '#/'+parts.filter(Boolean).join('/');
}
