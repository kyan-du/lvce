export const MAX_BYTES=256*1024;
const plainObject=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
export const ZHANGJIAJIE_ITINERARY_MIGRATION='zhangjiajie-itinerary-20260807-v13-actual-aug7-9';
export const ZHANGJIAJIE_BOOKING_DETAILS=[
{id:'ticket-forest-20260806',type:'ticket',title:'张家界森林公园四日票',match:'张家界森林公园四日票',platform:'携程',orderNumber:'1128148373333027',credential:'2026-08-06至08-09；首次入园 08-06 06:30-07:00 东门B线；成人：胡丽霞、杜万；儿童：杜暄妍、杜明远；证件原件+人脸核验；再次入园需通过“张家界旅游小助手”或现场预约',amount:'¥484',openWith:'携程App→我的→全部订单'},
{id:'ticket-bailong-20260806',type:'ticket',title:'百龙天梯单程票',match:'百龙天梯',platform:'携程',orderNumber:'1128148482038756',credential:'2026-08-06；成人2人：胡丽霞、杜万；单程；上站/下站闸机使用',amount:'¥130',openWith:'携程App→我的→全部订单'},
{id:'ticket-tianzishan-20260806',type:'ticket',title:'天子山索道票',match:'天子山',platform:'携程',orderNumber:'1128148482044863',credential:'2026-08-06；成人2人：杜万、胡丽霞；可用时段 08:00-18:00',amount:'¥144',openWith:'携程App→我的→全部订单'},
{id:'ticket-mengdong-20260807',type:'ticket',title:'猛洞河漂流双人票×2',match:'猛洞河漂流',platform:'携程',orderNumber:'1128148396887951',credential:'2026-08-07；双人票×2，共4人；凭联系人手机号或预留姓名取票；开放 08:00-16:00，15:30停止入场；工作人员将联系；景区电话 133-8744-8888',amount:'¥680',openWith:'携程App→我的→全部订单'},
{id:'ticket-tianmen-20260808',type:'ticket',title:'天门山A线成人票',match:'天门山A线',platform:'携程',orderNumber:'1128148375850216',credential:'2026-08-08 07:00-08:00；成人2人：杜万、胡丽霞；索道上山→天门洞快线索道下山；证件原件+电子凭证或纸质凭证；不补儿童票',amount:'¥576',privateNotes:'辅助码：ANWSK26080853374340612；AWSK26080853391211161',openWith:'携程App→我的→全部订单'},
{id:'ticket-mawangdui-20260805',type:'ticket',title:'湖南博物院马王堆讲解预约',match:'湖南省博物馆马王堆基本陈列馆',platform:'未记录',credential:'4人凭身份证；09:00湖南博物院馆外集合',openWith:'待补充'},{id:'rail-c7950-20260805',type:'transport',title:'C7950 长沙→张家界西',match:'C7950',platform:'未记录',credential:'乘车人身份证',openWith:'待补充'}];
export const ZHANGJIAJIE_ITINERARY_LINKS=[{date:'2026-08-05',activity:'湖南博物院 3 小时重点游览',bookingId:'ticket-mawangdui-20260805'},{date:'2026-08-05',activity:'C7950 长沙→张家界西',bookingId:'rail-c7950-20260805'},{date:'2026-08-06',activity:'森林公园东门B线入园',bookingId:'ticket-forest-20260806'},{date:'2026-08-06',activity:'百龙天梯、袁家界',bookingId:'ticket-bailong-20260806'},{date:'2026-08-06',activity:'天子山',bookingId:'ticket-tianzishan-20260806'},{date:'2026-08-07',activity:'猛洞河漂流',bookingId:'ticket-mengdong-20260807'},{date:'2026-08-08',activity:'天门山A线',bookingId:'ticket-tianmen-20260808'}];
export const ZHANGJIAJIE_ORANGE_TRANSFER_ROW=['2026-08-04','预计 17:00-18:30','岳麓山/岳麓书院讲解结束后前往橘子洲并晚餐衔接','岳麓山／岳麓书院→橘子洲','胡丽霞','预留讲解结束后的市内交通与晚餐衔接，实际以路况、景区入口和餐厅安排为准'];
export const ZHANGJIAJIE_ORANGE_ROW=['2026-08-04','预计 18:30-21:00','橘子洲晚间游览','橘子洲','胡丽霞','今晚 2026-08-04 前往橘子洲；预计晚间时段，待现场开放与交通确认；不声称预约已确认'];
export const ZHANGJIAJIE_AUG5_ROWS=[
['2026-08-05','09:30-12:30','湖南博物院 3 小时重点游览','湖南博物院','胡丽霞','订单事实：09:30场、09:00馆外集合、共4人凭身份证。路线：入口→马王堆汉墓陈列（重点）→辛追夫人→T型帛画→素纱襌衣→湖南历史文化展→青铜器。不要一进去就从一楼慢慢看，避免提前消耗体力；展品开放以现场为准。'],
['2026-08-05','12:30-约13:00','打车前往五一广场','湖南博物院→五一广场','胡丽霞','12:30离馆，预计约13:00抵达；车程受中午实时路况与上车点影响。抵达后按“五一广场→长沙IFS→黄兴路步行街→坡子街→太平街”顺序游览。'],
['2026-08-05','约13:00-13:10','五一广场','五一广场','胡丽霞','建议停留约10分钟，完成广场地标打卡后前往长沙IFS；不在此处久留。'],
['2026-08-05','约13:10-13:40','长沙IFS（KAWS，7楼）','长沙IFS 7楼','胡丽霞','建议停留约30分钟，包含上楼、KAWS打卡和下楼；客流大时控制拍照时间，约13:40前转往黄兴路步行街。'],
['2026-08-05','约13:40-14:00','黄兴路步行街','黄兴路步行街','胡丽霞','建议停留约20分钟，顺路步行游览；约14:00转往坡子街，不删除后续吃东西安排。'],
['2026-08-05','约14:00-14:35','坡子街吃东西','坡子街','胡丽霞','建议停留约35分钟，优先选择出餐快、可边走边吃的食物；最迟约14:35转往太平街。'],
['2026-08-05','约14:35-15:55','太平街逛老街','太平街','胡丽霞','可逛到15:55；约15:45先查看实时路况并提前叫车。15:55乘车返回酒店，不要步行；如前段延误，压缩各点停留时间，但不要删坡子街或太平街。'],
['2026-08-05','约15:55-16:05','乘车回酒店取寄存行李','太平街→长沙IFS国金中心·异国印象酒店(五一广场店)','胡丽霞','行李已寄存在酒店，不是办理退房。酒店订单现有地址：湘江中路2段18号。15:55从太平街乘车返回，不要步行；预计约16:05到酒店，取寄存行李即走。'],
['2026-08-05','约16:05-16:35','取行李后前往长沙站（地铁优先／打车备选）','湘江中路2段18号→湘江中路站→长沙火车站','胡丽霞','约16:05取到寄存行李即走，约16:10前进湘江中路站。从酒店（湘江中路2段18号）步行约3-5分钟到湘江中路站；乘地铁2号线往光达方向，经五一广场、芙蓉广场、迎宾路口、袁家岭至长沙火车站，车上约12-15分钟，全程含步行、安检、等车按约25分钟，约16:30-16:35抵达长沙站。地铁为稳定方案，无需换乘。打车仅在实时导航显示路况顺畅时采用。'],
['2026-08-05','15:45实时导航决策','确认地铁或打车方案','太平街／酒店→长沙站','胡丽霞','15:45查看实时导航：打车仅在路况顺畅时采用；若预计车程超过25分钟，就优先选择地铁。无论采用哪种方案，仍按15:55离开太平街、16:05取到寄存行李执行。车票现有事实：C7950于16:55从长沙站发车（不是长沙南站）。'],
['2026-08-05','约16:30-16:55','安检、进站与乘车','长沙站','胡丽霞','目标约16:30-16:35抵站，C7950于16:55发车；到站后直接安检进站，停止检票时间以车站公告为准。'],
['2026-08-05','16:55-18:51','C7950 长沙→张家界西','长沙／张家界西','胡丽霞','铁路（3张）；预订号 E227154531']];
export const ZHANGJIAJIE_MAWANGDUI_ROW=ZHANGJIAJIE_AUG5_ROWS[0];
export const ZHANGJIAJIE_MAWANGDUI_TICKET=['湖南省博物馆马王堆基本陈列馆1.5小时深度讲解（含门票代预约）亲子票1大1小-09:30场×2份','2026-08-05','09:30场','亲子票1大1小×2份（共4人）','4人凭身份证；09:00湖南省博物馆馆外集合','待登录核对','订单号登录后可见；限制以订单详情和馆方要求为准'];
export const ZHANGJIAJIE_JINBIANXI_ROW=['2026-08-09','上午','金鞭溪','张家界国家森林公园','胡丽霞','上午游览金鞭溪，之后返回民宿取行李并前往张家界西站。'];
export const ZHANGJIAJIE_JINBIANXI_TRANSFER_ROW=['2026-08-09','中午／按14:27发车倒推','返回锦栖民宿取行李并前往张家界西站','金鞭溪→锦栖民宿→张家界西','胡丽霞','衔接14:27 C7947，预留景区交通、取行李、进站安检时间。'];
export const ZHANGJIAJIE_MENGDONG_ROW=['2026-08-07','08:00-16:00开放时段内','猛洞河漂流','猛洞河漂流景区','胡丽霞','当日只安排猛洞河漂流；双人票×2，共4人，¥680；15:30停止入场，以景区当天安排为准。'];
export const ZHANGJIAJIE_JINQI_ROW=['2026-08-07','漂流后／待确认','返回锦栖民宿(张家界高铁西站店)','猛洞河漂流景区→张家界西站附近','胡丽霞','漂流后返回张家界西站附近锦栖民宿；返程接驳和到店时间以实际交通为准'];
export const ZHANGJIAJIE_TIANMEN_ROW=['2026-08-08','07:00-08:00入园','天门山A线','张家界市区天门山','胡丽霞','成人票2张共¥576，不补儿童票；索道上山→天门洞快线索道下山。'];
export const ZHANGJIAJIE_MENGDONG_TICKET=['猛洞河漂流','待填写','待填写','2份','凭「联系人手机或预留姓名」取票使用','¥680','预订成功；拟定行程安排为 2026-08-07 下午，实际日期/时段以订单预约或景区确认为准'];
export const ZHANGJIAJIE_TIANMEN_TICKET=['天门山A线','2026-08-08','07:00-08:00','成人票2张（杜万、胡丽霞）；不补儿童票','凭「下单时预留的证件原件+电子凭证或纸质凭证」使用','¥576','预订成功；A线：索道上山→天门洞快线索道下山'];
export const ZHANGJIAJIE_C7947_ROW=['铁路（3张）','C7947','杜万 二等座 03车12A号\n胡丽霞 二等座 03车12B号\n杜暄妍 二等座 03车12C号','2026-08-09','张家界西','14:27','长沙','16:36',''];
export const ZHANGJIAJIE_G206_ROW=['铁路（3张）','G206','杜万 二等座 03车02B号\n胡丽霞 二等座 03车02A号\n杜暄妍 二等座 03车02C号','2026-08-09','长沙南','18:01','上海虹桥','22:01','E285155420'];
export const ZHANGJIAJIE_C7947_ITINERARY=['2026-08-09','14:27-16:36','C7947 张家界西→长沙','张家界西／长沙','胡丽霞','铁路（3张）；二等座；杜万03车12A、胡丽霞03车12B、杜暄妍03车12C'];
export const ZHANGJIAJIE_CHANGSHA_TRANSFER=['2026-08-09','16:36后立即换乘；地铁约20-23分钟','长沙站乘地铁前往长沙南站','长沙站→长沙南站','胡丽霞','C7947于16:36抵达长沙站，G206于18:01从长沙南站发车，两车仅间隔85分钟。下车后立即前往长沙火车站地铁站，乘地铁2号线往光达方向直达长沙火车南站（无需换乘，公开路线资料显示车程约20-23分钟）；务必预留步行、候车、进站安检及停止检票时间，衔接时间紧张。'];
export const ZHANGJIAJIE_G206_ITINERARY=['2026-08-09','18:01-22:01','G206 长沙南→上海虹桥','长沙南／上海虹桥','胡丽霞','铁路（3张）；二等座；杜万03车02B、胡丽霞03车02A、杜暄妍03车02C'];
const sameRow=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&a.every((v,i)=>String(v)===String(b[i]));
const rowText=row=>Array.isArray(row)?row.map(v=>String(v||'')).join(' '):'';
const has=row=>term=>rowText(row).includes(term);
const isZhangjiajieTrip=trip=>trip?.id==='zhangjiajie';
const isOrangeTransfer=row=>Array.isArray(row)&&row[0]==='2026-08-04'&&has(row)('岳麓山/岳麓书院讲解结束后前往橘子洲');
const isOrangeRow=row=>Array.isArray(row)&&row[0]==='2026-08-04'&&has(row)('橘子洲晚间游览');
const isWrongOrangeRow=row=>Array.isArray(row)&&row[0]==='2026-08-05'&&has(row)('橘子洲');
const isMawangduiRow=row=>Array.isArray(row)&&has(row)('马王堆')&&(has(row)('湖南省博物')||has(row)('湖南博物院'));
const isWrongMawangduiRow=row=>Array.isArray(row)&&row[0]==='2026-08-09'&&isMawangduiRow(row);
const isManagedAug5Row=row=>Array.isArray(row)&&row[0]==='2026-08-05'&&(isMawangduiRow(row)||has(row)('五一广场')||has(row)('长沙IFS')||has(row)('黄兴路步行街')||has(row)('坡子街')||has(row)('太平街')||has(row)('返回酒店取行李')||has(row)('前往酒店取寄存行李')||has(row)('打车前往长沙站')||has(row)('取行李后打车前往长沙站')||has(row)('取行李后前往长沙站')||has(row)('确认地铁或打车方案')||has(row)('进站、安检与候车缓冲')||has(row)('安检、进站与候车')||String(row[2]||'').startsWith('C7950'));
const isOldJinbianxiRow=row=>Array.isArray(row)&&sameRow(row,['2026-08-07','预计 08:30-11:30／待确认','金鞭溪','武陵源','胡丽霞','预计上午游览；需与 13:07 张家界西出发列车衔接核对']);
const isOldTianmenRow=row=>Array.isArray(row)&&sameRow(row,['2026-08-07','预计 14:30-17:30／待预约确认','天门山A线','张家界','胡丽霞','门票 ¥576；2份；原行程写下午天门山，但同日列车到芙蓉镇，需复核预约时段和返程交通；以订单为准']);
const isOldJinqiRow=row=>Array.isArray(row)&&sameRow(row,['2026-08-07','预计 19:00-19:30／待确认','前往锦栖民宿(张家界高铁西站店)','张家界→宁邦广场二期文华里21栋702','胡丽霞','预计晚间抵达/入住，视路况；同日芙蓉镇、天门山安排需复核；全季天门山索道站订单不再单列为行程酒店']);
const isOldMengdongRow=row=>Array.isArray(row)&&sameRow(row,['2026-08-08','预计 09:00-15:00／待预约确认','猛洞河漂流','猛洞河','胡丽霞','门票 ¥680；2份；凭联系人手机或预留姓名取票使用；备换洗衣物；预计时段需预留 17:00 张家界西出发时间']);
const cloneRow=row=>row.slice();
function insertRows(rows,newRows,afterPredicate,beforePredicate){
  const after=rows.findIndex(afterPredicate);
  if(after>=0){rows.splice(after+1,0,...newRows.map(cloneRow));return}
  const before=rows.findIndex(beforePredicate);
  rows.splice(before>=0?before:rows.length,0,...newRows.map(cloneRow));
}
function migrateZhangjiajieTrip(trip){
  if(!isZhangjiajieTrip(trip)||!Array.isArray(trip.itinerary))return {trip,changed:false};
  const originalJson=JSON.stringify(trip);
  let changed=false;
  const next={...trip,itinerary:trip.itinerary.map(row=>Array.isArray(row)?row.slice():row)};
  let rows=next.itinerary,filtered=[];
  for(const row of rows){
    if(isWrongOrangeRow(row)||isWrongMawangduiRow(row)||(isOrangeTransfer(row)&&!sameRow(row,ZHANGJIAJIE_ORANGE_TRANSFER_ROW))||(isOrangeRow(row)&&!sameRow(row,ZHANGJIAJIE_ORANGE_ROW))||(isManagedAug5Row(row)&&!ZHANGJIAJIE_AUG5_ROWS.some(expected=>sameRow(row,expected)))||isOldJinbianxiRow(row)||isOldTianmenRow(row)||isOldJinqiRow(row)||isOldMengdongRow(row)){changed=true;continue}
    filtered.push(row);
  }
  rows=filtered;
  const needsOrange=!rows.some(row=>sameRow(row,ZHANGJIAJIE_ORANGE_TRANSFER_ROW))||!rows.some(row=>sameRow(row,ZHANGJIAJIE_ORANGE_ROW));
  if(needsOrange){
    insertRows(rows,[ZHANGJIAJIE_ORANGE_TRANSFER_ROW,ZHANGJIAJIE_ORANGE_ROW],row=>Array.isArray(row)&&row[0]==='2026-08-04'&&row[2]==='岳麓山+岳麓书院讲解',row=>Array.isArray(row)&&String(row[0]||'')>'2026-08-04');
    changed=true;
  }
  if(ZHANGJIAJIE_AUG5_ROWS.some(expected=>!rows.some(row=>sameRow(row,expected)))){
    rows=rows.filter(row=>!(Array.isArray(row)&&row[0]==='2026-08-05'&&ZHANGJIAJIE_AUG5_ROWS.some(expected=>String(row[2]||'')===String(expected[2]||''))));
    insertRows(rows,ZHANGJIAJIE_AUG5_ROWS,row=>sameRow(row,ZHANGJIAJIE_ORANGE_ROW),row=>Array.isArray(row)&&String(row[0]||'')>'2026-08-05');
    changed=true;
  }
  if(!rows.some(row=>sameRow(row,ZHANGJIAJIE_JINBIANXI_ROW))||!rows.some(row=>sameRow(row,ZHANGJIAJIE_JINBIANXI_TRANSFER_ROW))){
    insertRows(rows,[ZHANGJIAJIE_JINBIANXI_ROW,ZHANGJIAJIE_JINBIANXI_TRANSFER_ROW].filter(newRow=>!rows.some(row=>sameRow(row,newRow))),row=>Array.isArray(row)&&row[0]==='2026-08-06'&&String(row[2]||'').includes('天子山'),row=>Array.isArray(row)&&row[0]==='2026-08-07'&&String(row[2]||'').startsWith('G9679'));
    changed=true;
  }
  if(!rows.some(row=>sameRow(row,ZHANGJIAJIE_MENGDONG_ROW))||!rows.some(row=>sameRow(row,ZHANGJIAJIE_JINQI_ROW))){
    insertRows(rows,[ZHANGJIAJIE_MENGDONG_ROW,ZHANGJIAJIE_JINQI_ROW].filter(newRow=>!rows.some(row=>sameRow(row,newRow))),row=>Array.isArray(row)&&row[0]==='2026-08-07'&&String(row[2]||'').startsWith('G9679'),row=>Array.isArray(row)&&String(row[0]||'')>'2026-08-07');
    changed=true;
  }
  if(!rows.some(row=>sameRow(row,ZHANGJIAJIE_TIANMEN_ROW))){
    insertRows(rows,[ZHANGJIAJIE_TIANMEN_ROW],row=>Array.isArray(row)&&row[0]==='2026-08-07'&&String(row[2]||'').includes('锦栖民宿'),row=>Array.isArray(row)&&row[0]==='2026-08-08'&&String(row[2]||'').startsWith('C7769'));
    changed=true;
  }
  rows=rows.filter(row=>!(Array.isArray(row)&&((row[0]==='2026-08-07'&&(has(row)('金鞭溪')||has(row)('G9679')||has(row)('芙蓉镇')))||(row[0]==='2026-08-08'&&(has(row)('C7769')||has(row)('猛洞河')))||(row[0]==='2026-08-09'&&(has(row)('开福寺')||String(row[2]||'').startsWith('C7947')||String(row[2]||'').startsWith('G206')||String(row[2]||'')==='长沙站乘地铁前往长沙南站'||has(row)('金鞭溪'))))));
  for(const row of [ZHANGJIAJIE_MENGDONG_ROW,ZHANGJIAJIE_JINQI_ROW,ZHANGJIAJIE_TIANMEN_ROW,ZHANGJIAJIE_JINBIANXI_ROW,ZHANGJIAJIE_JINBIANXI_TRANSFER_ROW,ZHANGJIAJIE_C7947_ITINERARY,ZHANGJIAJIE_CHANGSHA_TRANSFER,ZHANGJIAJIE_G206_ITINERARY])if(!rows.some(existing=>sameRow(existing,row)))rows.push(cloneRow(row));
  rows.sort((a,b)=>String(a?.[0]||'').localeCompare(String(b?.[0]||'')));
  next.itinerary=rows;
  if(Array.isArray(next.transport)){
    next.transport=next.transport.filter(row=>!['G9679','C7769','C7947','G206'].includes(String(row?.[1]||'')));
    next.transport.push(cloneRow(ZHANGJIAJIE_C7947_ROW),cloneRow(ZHANGJIAJIE_G206_ROW));changed=true;
  }
  if(Array.isArray(next.hotels)){
    next.hotels=next.hotels.filter(row=>!has(row)('全季')&&!has(row)('湖南新闻国际大酒店'));
    const hotel=next.hotels.find(row=>has(row)('锦栖民宿'));
    if(hotel){hotel[2]='2026-08-09';hotel[6]='2';changed=true}
  }
  if(Array.isArray(next.tickets)){
    const oldTicketIndex=next.tickets.findIndex(row=>Array.isArray(row)&&has(row)('湖南省博物馆马王堆讲解'));
    if(oldTicketIndex>=0&&!sameRow(next.tickets[oldTicketIndex].slice(0,7),ZHANGJIAJIE_MAWANGDUI_TICKET)){
      next.tickets=next.tickets.slice();
      next.tickets[oldTicketIndex]=cloneRow(ZHANGJIAJIE_MAWANGDUI_TICKET);
      changed=true;
    }
    const oldMengdongTicketIndex=next.tickets.findIndex(row=>sameRow(row,['猛洞河漂流','待填写','待填写','2份','凭「联系人手机或预留姓名」取票使用','¥680','预订成功']));
    if(oldMengdongTicketIndex>=0){
      next.tickets=next.tickets.slice();
      next.tickets[oldMengdongTicketIndex]=cloneRow(ZHANGJIAJIE_MENGDONG_TICKET);
      changed=true;
    }
    const oldTianmenTicketIndex=next.tickets.findIndex(row=>sameRow(row,['天门山A线','待填写','待填写','2份','凭「下单时预留的证件原件+电子凭证或纸质凭证」使用','¥576','预订成功']));
    if(oldTianmenTicketIndex>=0){
      next.tickets=next.tickets.slice();
      next.tickets[oldTianmenTicketIndex]=cloneRow(ZHANGJIAJIE_TIANMEN_TICKET);
      changed=true;
    }
  }
  if(!Array.isArray(next.tickets)){next.tickets=[];changed=true}
  const legacyDetails=[...(Array.isArray(next.bookingDetails)?next.bookingDetails:[]),...ZHANGJIAJIE_BOOKING_DETAILS.filter(detail=>!(next.bookingDetails||[]).some(item=>item?.id===detail.id))];
  const detailTargets=new Map();
  for(const detail of legacyDetails){
    if(!detail?.id)continue;
    if(detail.type==='transport'){
      const index=next.transport?.findIndex(row=>has(row)(detail.match||detail.title||''))??-1;
      if(index>=0)detailTargets.set(detail.id,{targetType:'transport',targetId:`transport:${index}`,index});
      continue;
    }
    let index=next.tickets.findIndex(row=>has(row)(detail.match||detail.title||''));
    if(index<0&&detail.type!=='transport'){
      next.tickets.push([detail.title||'自定义门票','','','','',detail.amount||'','',detail.platform||'',detail.orderNumber||'',detail.openWith||'',detail.credential||'',detail.privateNotes||'',detail.id]);
      index=next.tickets.length-1;changed=true;
    }
    if(index>=0){
      const row=next.tickets[index].slice();while(row.length<13)row.push('');
      const values=[detail.platform,detail.orderNumber,detail.openWith,detail.credential,detail.privateNotes,detail.id];
      for(let i=0;i<values.length;i++)if(values[i]&&!row[7+i]){row[7+i]=values[i];changed=true}
      if(detail.amount&&!row[5]){row[5]=detail.amount;changed=true}
      next.tickets[index]=row;detailTargets.set(detail.id,{targetType:'ticket',targetId:row[12],index});
    }
  }
  if(next.bookingDetails!==undefined){delete next.bookingDetails;changed=true}
  const oldLinks=Array.isArray(next.itineraryLinks)?next.itineraryLinks:[];
  const desired=[...oldLinks,...ZHANGJIAJIE_ITINERARY_LINKS.filter(link=>!oldLinks.some(item=>item?.date===link.date&&item?.activity===link.activity))];
  const links=[];
  for(const link of desired){
    if(!next.itinerary.some(row=>row?.[0]===link.date&&row?.[2]===link.activity)&&!oldLinks.includes(link))continue;
    const target=link.targetType?link:detailTargets.get(link.bookingId);
    if(!target)continue;
    const normalized={date:link.date,activity:link.activity,targetType:target.targetType,targetId:target.targetId};
    if(!links.some(item=>item.date===normalized.date&&item.activity===normalized.activity))links.push(normalized);
  }
  if(JSON.stringify(links)!==JSON.stringify(next.itineraryLinks||[])){next.itineraryLinks=links;changed=true}
  changed=JSON.stringify(next)!==originalJson;
  return {trip:changed?next:trip,changed};
}
export function migrateTripDocument(data){
  if(!plainObject(data)||!Array.isArray(data.trips))return {data,changed:false,migrations:[]};
  let changed=false;
  const trips=data.trips.map(trip=>{
    const result=migrateZhangjiajieTrip(trip);
    changed ||= result.changed;
    return result.trip;
  });
  if(!changed)return {data,changed:false,migrations:[]};
  return {data:{...data,trips},changed:true,migrations:[ZHANGJIAJIE_ITINERARY_MIGRATION]};
}
export function validateDocument(value){
  let size;try{size=new TextEncoder().encode(JSON.stringify(value)).length}catch{return '数据无法序列化'}
  if(size>MAX_BYTES)return `数据不得超过 ${MAX_BYTES} 字节`;
  if(!plainObject(value)||!Array.isArray(value.trips))return '必须包含 trips 数组';
  if(value.trips.length>50)return '旅行计划不得超过 50 个';
  if(typeof value.active!=='string'||typeof value.tab!=='string')return 'active 和 tab 必须为字符串';
  for(const trip of value.trips){if(!plainObject(trip)||typeof trip.id!=='string'||!trip.id||trip.id.length>100||typeof trip.name!=='string'||trip.name.length>200)return '旅行计划字段无效';for(const key of ['categories','itinerary','transport','hotels','emergency','tour'])if(!Array.isArray(trip[key]))return `${key} 必须为数组`;for(const key of ['tickets','readings','bookingDetails','itineraryLinks'])if(trip[key]!==undefined&&!Array.isArray(trip[key]))return `${key} 必须为数组`;}
  return null;
}
