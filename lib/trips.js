import {normalizeHotelRow,splitHotelRoomAndNotes} from './hotel-fields.js';
export const MAX_BYTES=256*1024;
const plainObject=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
export const ZHANGJIAJIE_ITINERARY_MIGRATION='zhangjiajie-itinerary-20260920-v16-rail-times';
export const ZHANGJIAJIE_BOOKING_DETAILS=[
{id:'ticket-forest-20260806',type:'ticket',title:'张家界国家森林公园门票（4天有效）',match:'张家界森林公园四日票',platform:'携程',orderNumber:'1128148373333027',credential:'门票4天有效；本次从张家界国家森林公园南门入园；金鞭溪包含在该门票内；成人：胡丽霞、杜万；儿童：杜暄妍、杜明远；证件原件+人脸核验；再次入园需通过“张家界旅游小助手”或现场预约',amount:'¥484',openWith:'携程App→我的→全部订单'},
{id:'ticket-bailong-20260806',type:'ticket',title:'百龙天梯单程票',match:'百龙天梯',platform:'携程',orderNumber:'1128148482038756',credential:'用于已经发生的森林公园B线；园内另购交通票；订单截图未显示精确人数或使用时间；已使用',amount:'¥130',openWith:'携程App→我的→全部订单'},
{id:'ticket-tianzishan-20260806',type:'ticket',title:'天子山索道票',match:'天子山',platform:'携程',orderNumber:'1128148482044863',credential:'用于已经发生的森林公园B线；园内另购交通票；订单截图未显示精确人数或使用时间；已使用',amount:'¥144',openWith:'携程App→我的→全部订单'},
{id:'ticket-mengdong-20260807',type:'ticket',title:'猛洞河漂流双人票×2',match:'猛洞河漂流',platform:'携程',orderNumber:'1128148396887951',credential:'2026-08-07；双人票×2，共4人；凭联系人手机号或预留姓名取票；开放 08:00-16:00，15:30停止入场；工作人员将联系；景区电话 133-8744-8888',amount:'¥680',openWith:'携程App→我的→全部订单'},
{id:'ticket-tianmen-20260808',type:'ticket',title:'天门山A线成人票',match:'天门山A线',platform:'携程',orderNumber:'1128148375850216',credential:'2026-08-08 07:00-08:00；成人2人：杜万、胡丽霞；索道上山→天门洞快线索道下山；证件原件+电子凭证或纸质凭证；不补儿童票',amount:'¥576',privateNotes:'辅助码：ANWSK26080853374340612；AWSK26080853391211161',openWith:'携程App→我的→全部订单'},
{id:'ticket-mawangdui-20260805',type:'ticket',title:'湖南博物院马王堆讲解预约',match:'湖南省博物馆马王堆基本陈列馆',platform:'未记录',credential:'4人凭身份证；09:00湖南博物院馆外集合',openWith:'待补充'},{id:'rail-c7950-20260805',type:'transport',title:'C7950 长沙→张家界西',match:'C7950',platform:'未记录',credential:'乘车人身份证',openWith:'待补充'}];
export const ZHANGJIAJIE_ITINERARY_LINKS=[{date:'2026-08-05',activity:'湖南博物院 3 小时重点游览',bookingId:'ticket-mawangdui-20260805'},{date:'2026-08-05',activity:'C7950 长沙→张家界西',bookingId:'rail-c7950-20260805'},{date:'2026-08-06',activity:'森林公园东门B线入园',bookingId:'ticket-forest-20260806'},{date:'2026-08-06',activity:'百龙天梯、袁家界',bookingId:'ticket-bailong-20260806'},{date:'2026-08-06',activity:'天子山',bookingId:'ticket-tianzishan-20260806'},{date:'2026-08-07',activity:'猛洞河漂流',bookingId:'ticket-mengdong-20260807'},{date:'2026-08-08',activity:'天门山A线',bookingId:'ticket-tianmen-20260808'},{date:'2026-08-09',activity:'金鞭溪',bookingId:'ticket-forest-20260806'}];
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
export const ZHANGJIAJIE_JINBIANXI_ROW=['2026-08-09','上午','金鞭溪','张家界国家森林公园南门→金鞭溪','胡丽霞','从张家界国家森林公园南门入园；使用张家界国家森林公园门票，门票4天有效，金鞭溪包含在该门票内，不另购金鞭溪门票。之后返回民宿取行李并前往张家界西站；具体入园时段以景区确认和现场安排为准。'];
export const ZHANGJIAJIE_JINBIANXI_TRANSFER_ROW=['2026-08-09','中午／按14:27发车倒推','返回锦栖民宿取行李并前往张家界西站','金鞭溪→锦栖民宿→张家界西','胡丽霞','衔接14:27 C7947，预留景区交通、取行李、进站安检时间。'];
export const ZHANGJIAJIE_MENGDONG_ROW=['2026-08-07','08:00-16:00开放时段内','猛洞河漂流','猛洞河漂流景区','胡丽霞','当日只安排猛洞河漂流；双人票×2，共4人，¥680；15:30停止入场，以景区当天安排为准。'];
export const ZHANGJIAJIE_JINQI_ROW=['2026-08-07','漂流后／待确认','返回锦栖民宿(张家界高铁西站店)','猛洞河漂流景区→张家界西站附近','胡丽霞','漂流后返回张家界西站附近锦栖民宿；返程接驳和到店时间以实际交通为准'];
export const ZHANGJIAJIE_TIANMEN_ROW=['2026-08-08','07:00-08:00入园','天门山A线','张家界市区天门山','胡丽霞','成人票2张共¥576，不补儿童票；索道上山→天门洞快线索道下山。'];
export const ZHANGJIAJIE_MENGDONG_TICKET=['猛洞河漂流','待填写','待填写','2份','凭「联系人手机或预留姓名」取票使用','¥680','预订成功；拟定行程安排为 2026-08-07 下午，实际日期/时段以订单预约或景区确认为准'];
export const ZHANGJIAJIE_TIANMEN_TICKET=['天门山A线','2026-08-08','07:00-08:00','成人票2张（杜万、胡丽霞）；不补儿童票','凭「下单时预留的证件原件+电子凭证或纸质凭证」使用','¥576','预订成功；A线：索道上山→天门洞快线索道下山'];
export const ZHANGJIAJIE_C7947_ROW=['铁路（3张）','C7947','杜万 二等座 03车12A号 ¥166 已出站\n胡丽霞 二等座 03车12B号 ¥166 已出站\n杜暄妍 儿童票 二等座 03车12C号 ¥83 5折 已出站','2026-08-09','张家界西','14:27','长沙','16:36','E297617576'];
export const ZHANGJIAJIE_G206_ROW=['铁路（3张）已取消','G206','杜万 二等座 03车02B号\n胡丽霞 二等座 03车02A号\n杜暄妍 二等座 03车02C号\n已取消（8月9日列车停运，12306自动退票；改乘 G4312）','2026-08-09','长沙南','18:01','上海虹桥','22:01','E285155420'];
export const ZHANGJIAJIE_G4312_ROW=['铁路（3张）','G4312','杜万 二等座 11车13B号 ¥179\n胡丽霞 二等座 11车13C号 ¥179\n杜暄妍 儿童票 二等座 15车12C号 ¥90\n另有补票 EBZ7701402 长沙南至南昌西 二等座无座 ¥90','2026-08-09','长沙南','17:54','南昌西','19:36','E858707763'];
export const ZHANGJIAJIE_G1382_AUG10_ROW=['铁路（1张）已取消','G1382','杜万 购票成功后改签 G1384\n已取消（与 G1384 冲突，以新票为准）','2026-08-10','南昌','07:32','上海虹桥','11:23',''];
export const ZHANGJIAJIE_G1384_NANCHANG_ROW=['铁路（3张）','G1384','胡丽霞 二等座 15车05A号 ¥121 9.6折 已进站\n杜暄妍 儿童票 二等座 15车05C号 ¥61 4.8折 已进站\n杜万 二等座 15车05B号 ¥121 9.6折 已进站','2026-08-10','南昌','13:43','上饶','14:49','E287466436'];
export const ZHANGJIAJIE_G1384_SHANGRAO_ROW=['铁路补票（无座）','G1384','列车补票 EBZ6054772；上饶至杭州东；二等座无座；补差价 ¥179','2026-08-10','上饶','14:55','杭州东','16:32','EBZ6054772'];
export const ZHANGJIAJIE_G1384_HANGZHOU_ROW=['铁路（3张）','G1384','杜暄妍 儿童票 二等座 15车12C号 ¥39 4.6折 已出站\n胡丽霞 二等座 15车12A号 ¥77 9折 已出站\n杜万 二等座 15车12B号 ¥77 9折 已出站','2026-08-10','杭州东','16:34','上海南','17:40','E272246782'];
export const ZHANGJIAJIE_G1382_AUG11_ROW=['铁路（1张）','G1382','杜万 购票成功','2026-08-11','南昌','07:32','上海虹桥','11:23',''];
export const ZHANGJIAJIE_C7947_ITINERARY=['2026-08-09','14:27-16:36','C7947 张家界西→长沙','张家界西／长沙','胡丽霞','铁路（3张）；杜万二等座03车12A ¥166 已出站、胡丽霞03车12B ¥166 已出站、杜暄妍儿童票03车12C ¥83 已出站；订单号 E297617576。'];
export const ZHANGJIAJIE_CHANGSHA_TRANSFER=['2026-08-09','16:36后立即换乘；地铁约20-23分钟','长沙站乘地铁前往长沙南站','长沙站→长沙南站','胡丽霞','C7947于16:36抵达长沙站，G4312于17:54从长沙南站发车，两车间隔约78分钟。G206原18:01长沙南→上海虹桥因停运取消。下车后立即前往长沙火车站地铁站，乘地铁2号线往光达方向直达长沙火车南站（无需换乘，公开路线资料显示车程约20-23分钟）；务必预留步行、候车、进站安检及停止检票时间。'];
export const ZHANGJIAJIE_G4312_ITINERARY=['2026-08-09','17:54-19:36','G4312 长沙南→南昌西','长沙南／南昌西','胡丽霞','铁路（3张）；杜万二等座11车13B、胡丽霞二等座11车13C、杜暄妍儿童票二等座15车12C；订单号 E858707763；检票口20B。另有列车补票 EBZ7701402 长沙南至南昌西 二等座无座 ¥90。'];
export const ZHANGJIAJIE_G1384_NANCHANG_ITINERARY=['2026-08-10','13:43-14:49','G1384 南昌→上饶','南昌／上饶','胡丽霞','铁路（3张）；改签票；胡丽霞二等座15车05A、杜暄妍儿童票二等座15车05C、杜万二等座15车05B；订单号 E287466436；检票口A4。'];
export const ZHANGJIAJIE_G1384_SHANGRAO_ITINERARY=['2026-08-10','14:55-16:32','G1384 上饶→杭州东（补票无座）','上饶／杭州东','胡丽霞','列车补票 EBZ6054772；二等座无座；补差价 ¥179。'];
export const ZHANGJIAJIE_G1384_HANGZHOU_ITINERARY=['2026-08-10','16:34-17:40','G1384 杭州东→上海南','杭州东／上海南','胡丽霞','铁路（3张）；杜暄妍儿童票二等座15车12C、胡丽霞二等座15车12A、杜万二等座15车12B；订单号 E272246782。'];
export const ZHANGJIAJIE_G1382_AUG11_ITINERARY=['2026-08-11','07:32-11:23','G1382 南昌→上海虹桥','南昌／上海虹桥','杜万','购票成功。'];
export const ZHANGJIAJIE_RAIL_TRANSPORT_ROWS=[ZHANGJIAJIE_C7947_ROW,ZHANGJIAJIE_G206_ROW,ZHANGJIAJIE_G4312_ROW,ZHANGJIAJIE_G1382_AUG10_ROW,ZHANGJIAJIE_G1384_NANCHANG_ROW,ZHANGJIAJIE_G1384_SHANGRAO_ROW,ZHANGJIAJIE_G1384_HANGZHOU_ROW,ZHANGJIAJIE_G1382_AUG11_ROW];
export const ZHANGJIAJIE_RAIL_ITINERARY_ROWS=[ZHANGJIAJIE_C7947_ITINERARY,ZHANGJIAJIE_CHANGSHA_TRANSFER,ZHANGJIAJIE_G4312_ITINERARY,ZHANGJIAJIE_G1384_NANCHANG_ITINERARY,ZHANGJIAJIE_G1384_SHANGRAO_ITINERARY,ZHANGJIAJIE_G1384_HANGZHOU_ITINERARY,ZHANGJIAJIE_G1382_AUG11_ITINERARY];
export const QIANTANG_TRIP_MIGRATION='qiantang-trip-20260920-v3-order';
export const QIANTANG_G1347_ROW=['铁路（4张）','G1347','杜明远 儿童票 靠窗 二等座 14车05A ¥23 5折\n杜万 成人票 靠窗 二等座 14车04A ¥45\n杜暄妍 儿童票 过道 二等座 14车05C ¥23 5折\n胡丽霞 成人票 靠窗 二等座 14车01F','2026-09-24','上海南','17:23','嘉兴南','17:53','E292090250'];
export const QIANTANG_G7305_ROW=['铁路（3张）','G7305','胡丽霞 成人票 过道 二等座 07车11D ¥27\n杜万 成人票 靠窗 二等座 07车07F ¥27\n杜暄妍 儿童票 过道 二等座 04车15D ¥14 5折','2026-09-25','嘉兴南','18:02','海宁西','18:17','E227044392'];
export const QIANTANG_C406_ROW=['铁路（4张）','C406','杜明远 儿童票 过道 二等座 03车08C ¥16 4.8折\n杜暄妍 儿童票 过道 二等座 03车08D ¥16 4.8折\n杜万 成人票 二等座 03车08B ¥31 9.2折\n胡丽霞 成人票 靠窗 二等座 03车08A','2026-09-26','海宁','19:42','上海南','20:54','E275946591'];
export const QIANTANG_TRANSPORT_ROWS=[QIANTANG_G1347_ROW,QIANTANG_G7305_ROW,QIANTANG_C406_ROW];
export const QIANTANG_EMERGENCY=[['胡丽霞','186 **** 5057','',''],['杜万','185 **** 6420','','']];
export const QIANTANG_V1_ITINERARY_ROWS=[['2026-09-24','17:23-17:53','G1347 上海南→嘉兴南','上海南／嘉兴南','胡丽霞','铁路（4张）；订单号 E292090250；检票口5A5B；下单 2026.09.14。'],['2026-09-24','','入住嘉兴','嘉兴','胡丽霞','两家酒店订单均预订成功：嘉兴南湖桔子水晶酒店、嘉兴月河历史街区中山路亚朵酒店；与另一家嘉兴酒店同夜。'],['2026-09-25','18:02-18:17','G7305 嘉兴南→海宁西','嘉兴南／海宁西','胡丽霞','铁路（3张）；订单号 E227044392；检票口二层检票口；下单 2026.09.15。'],['2026-09-25','','入住汉庭海宁盐仓酒店','海宁','胡丽霞','高级双床房 1间；在线付 ¥315.92。'],['2026-09-26','19:42-20:54','C406 海宁→上海南','海宁／上海南','胡丽霞','铁路（4张）；订单号 E275946591；候车室 01；下单 2026.09.17。']];
export const QIANTANG_ITINERARY_ROWS=[['2026-09-24','17:23-17:53','G1347 上海南→嘉兴南','上海南／嘉兴南','胡丽霞','铁路（4张）；订单号 E292090250；检票口5A5B；下单 2026.09.14。'],['2026-09-24','入住后／晚饭','入住嘉兴南湖桔子水晶酒店','嘉兴南湖桔子水晶酒店','胡丽霞','实际入住南湖桔子水晶，含早餐。当晚只吃饭，有余力再就近看月河，不排夜游。'],['2026-09-25','上午 约2-2.5小时','南湖环湖并坐船登湖心岛／烟雨楼','嘉兴南湖','胡丽霞','环湖免费；登岛看烟雨楼需现场买往返船票，近年公开价约成人20元上下，儿童规则以码头为准。值得坐船。末班船常见约16:30，以现场为准。'],['2026-09-25','中午','子城过渡','嘉兴子城','胡丽霞','南湖步行约1公里；免费。室内展或周一闭馆则以现场为准，走城垣轮廓即可。'],['2026-09-25','下午','月河历史街区','嘉兴月河','胡丽霞','免费。选一段河、两座桥即可，不按景区清单打卡。预留回酒店取行李和去嘉兴南的时间，衔接 18:02 G7305。不去西塘、乌镇。'],['2026-09-25','18:02-18:17','G7305 嘉兴南→海宁西','嘉兴南／海宁西','胡丽霞','铁路（3张）；胡丽霞、杜万、杜暄妍；杜明远免票随行。订单号 E227044392；检票口二层检票口。海宁西在许村，不是海宁站。'],['2026-09-25','到店后','入住汉庭海宁盐仓酒店','长安镇锦带湾／老盐仓附近','胡丽霞','高级双床房 1间；在线付 ¥315.92。18:17 到海宁西，下午潮基本赶不上；当晚可靠近塘，主场在 26 日白天老盐仓。'],['2026-09-26','白天；提前 60-90 分钟到塘','老盐仓观潮','老盐仓丁字坝','胡丽霞','看一线潮与回头潮。精确来潮钟点以当日海宁潮汛／景区广播为准，不把参考潮时写成列车时刻。不下水、不站丁字坝外侧。带望远镜×2。不去盐官、八堡。'],['2026-09-26','按 19:42 发车倒推','前往海宁站（硖石）','老盐仓→海宁站','胡丽霞','C406 从海宁站发车，不是海宁西。西站（许村）与硖石约 30 公里，不要跑错站。'],['2026-09-26','19:42-20:54','C406 海宁→上海南','海宁／上海南','胡丽霞','铁路（4张）；订单号 E275946591；候车室 01；下单 2026.09.17。']];
export const QIANTANG_HOTEL_ROWS=[];
function maskedPhoneValue(value){return /\*|•/.test(String(value||''))}
function maskPhone(value=''){const digits=String(value).replace(/\D/g,'');return digits.length>=7?`${digits.slice(0,3)} **** ${digits.slice(-4)}`:String(value)}
function emergencyFullPhone(row){const shown=String(row?.[1]||'').trim(),full=String(row?.[3]||'').trim();if(shown&&!maskedPhoneValue(shown))return shown;return full&&!maskedPhoneValue(full)?full:''}
export function normalizeEmergencyContactRow(row){let r;if(row&&typeof row==='object'&&!Array.isArray(row))r=[row.name||row.contact||'',row.maskedPhone||row.phone||'',row.note||row.remark||'',row.fullPhone||''];else r=Array.isArray(row)?row.slice():[];while(r.length<4)r.push('');r=r.slice(0,4);if(String(r[2]||'').trim()==='紧急联系人')r[2]='';const full=emergencyFullPhone(r),shown=String(r[1]||'').trim();if(full){r[3]=full;r[1]=maskPhone(full)}else{r[3]='';r[1]=shown}return r}
export const QIANTANG_READINGS=[{id:'jiaxing-nanhu',title:'嘉兴南湖：湖心岛、烟雨楼与红船记忆',venue:'嘉兴南湖',category:'城市湖泊'},{id:'jiaxing-yuehe-zicheng',title:'嘉兴子城与月河：城垣、运河与市井街区',venue:'子城／月河',category:'古城街区'},{id:'laoyancang-tide',title:'老盐仓观潮：丁字坝、一线潮与回头潮',venue:'老盐仓',category:'观潮现场'},{id:'qiantang-tide-cause',title:'钱塘潮成因：喇叭口、沙坎与望朔大潮',venue:'钱塘江／杭州湾',category:'水文科普'},{id:'qiantang-tide-literature',title:'观潮诗文：潘阆、周密与苏轼',venue:'钱塘潮文学',category:'历史文献'},{id:'yancang-vs-yanguan',title:'盐仓与盐官：两个观潮点，不要走错',venue:'海宁',category:'地点对照'}];
export const QIANTANG_PACKING=[['衣物鞋帽',[['薄外套／防风衣',4],['长袖',4],['长裤',4],['内衣袜子',8],['运动鞋',4],['轻薄雨衣',4]]],['洗护',[['纸巾／湿巾',2],['洗漱用品',4]]],['药品护理',[['常用药',1],['创可贴',1],['降压药',1],['优甲乐',1]]],['证件凭证',[['身份证／儿童证件',4],['12306／酒店订单',1]]],['户外装备',[['折叠伞',2],['防水袋',2],['水杯',4],['坐垫',2],['望远镜',2]]],['数码',[['手机',4],['充电宝',2],['充电器',2],['充电线',4]]]].map(([name,items],i)=>({id:'qiantang-c'+i,name,items:items.map(([name,qty],j)=>({id:`qiantang-i${i}-${j}`,name,qty,packed:false}))}));
function cloneReadings(rows){return rows.map(row=>({...row}))}
function cloneCategories(rows){return rows.map(cat=>({...cat,items:cat.items.map(item=>({...item}))}))}
function refreshQiantangPacking(categories){
  const next=Array.isArray(categories)?categories.map(cat=>({...cat,items:Array.isArray(cat.items)?cat.items.map(item=>({...item})):[]})):cloneCategories(QIANTANG_PACKING);
  const moved=[];
  for(const cat of next){
    if(cat.name==='江塘'||cat.name==='观潮')cat.name='户外装备';
    if(cat.name==='证件行程')cat.name='证件凭证';
    cat.items=cat.items.filter(item=>{
      if(item.name!=='充电宝')return true;
      moved.push(item);
      return false;
    });
  }
  let digital=next.find(cat=>cat.name==='数码');
  if(!digital){
    digital={id:'qiantang-c-digital',name:'数码',items:[]};
    next.push(digital);
  }
  if(!digital.items.some(item=>item.name==='充电宝')){
    const power=moved[0]||{id:'qiantang-i-powerbank',name:'充电宝',qty:2,packed:false};
    const phones=digital.items.findIndex(item=>item.name==='手机');
    if(phones>=0)digital.items.splice(phones+1,0,power);
    else digital.items.unshift(power);
  }
  return next;
}
const ZHANGJIAJIE_READING_IDS=new Set(['yuelu-mountain','yuelu-academy','juzizhou','zhangjiajie-forest-overview','yuanjiajie-bailong-tianzishan','jinbianxi','tianmen-mountain','mengdong-river-furong-town','mawangdui-laozi','kaifu-temple']);
const QIANTANG_V1_ITINERARY_BY_KEY=new Map(QIANTANG_V1_ITINERARY_ROWS.map(row=>[`${row[0]}\0${row[2]}`,row]));
const QIANTANG_ITINERARY_ORDER=new Map(QIANTANG_ITINERARY_ROWS.map((row,i)=>[`${row[0]}\0${row[2]}`,i]));
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
  rows=rows.filter(row=>!(Array.isArray(row)&&((row[0]==='2026-08-07'&&(has(row)('金鞭溪')||has(row)('G9679')||has(row)('芙蓉镇')))||(row[0]==='2026-08-08'&&(has(row)('C7769')||has(row)('猛洞河')))||(row[0]==='2026-08-09'&&(has(row)('开福寺')||String(row[2]||'').startsWith('C7947')||String(row[2]||'').startsWith('G206')||String(row[2]||'').startsWith('G4312')||String(row[2]||'')==='长沙站乘地铁前往长沙南站'||has(row)('金鞭溪')))||(row[0]==='2026-08-10'&&(String(row[2]||'').startsWith('G1382')||String(row[2]||'').startsWith('G1384')))||(row[0]==='2026-08-11'&&String(row[2]||'').startsWith('G1382')))));
  for(const row of [ZHANGJIAJIE_MENGDONG_ROW,ZHANGJIAJIE_JINQI_ROW,ZHANGJIAJIE_TIANMEN_ROW,ZHANGJIAJIE_JINBIANXI_ROW,ZHANGJIAJIE_JINBIANXI_TRANSFER_ROW,...ZHANGJIAJIE_RAIL_ITINERARY_ROWS])if(!rows.some(existing=>sameRow(existing,row)))rows.push(cloneRow(row));
  rows.sort((a,b)=>String(a?.[0]||'').localeCompare(String(b?.[0]||'')));
  next.itinerary=rows;
  if(Array.isArray(next.transport)){
    const keep=row=>!['G9679','C7769','C7947','G206','G4312','G1382','G1384'].includes(String(row?.[1]||''));
    next.transport=next.transport.filter(keep).concat(ZHANGJIAJIE_RAIL_TRANSPORT_ROWS.map(cloneRow));changed=true;
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
    let index=next.tickets.findIndex(row=>row?.[12]===detail.id||has(row)(detail.match||detail.title||''));
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
  const confirmedTickets={
    'ticket-forest-20260806':['张家界国家森林公园门票（4天有效）','2026-08-06至2026-08-09','成人票2份；儿童票2份','胡丽霞、杜万、杜暄妍、杜明远','证件原件+人脸核验','¥484','预订成功；金鞭溪包含在该门票内；8月9日从南门入园，再次入园按小助手或现场预约'],
    'ticket-bailong-20260806':['百龙天梯单程票','森林公园B线（已发生）','园内另购交通票；单程票','订单截图未显示','订单截图未显示','¥130','已使用；关联森林公园B线'],
    'ticket-tianzishan-20260806':['天子山索道票','森林公园B线（已发生）','园内另购交通票','订单截图未显示','订单截图未显示','¥144','已使用；关联森林公园B线'],
    'ticket-tianmen-20260808':['天门山A线成人票','2026-08-08','07:00-08:00；A线套票','成人2份：杜万、胡丽霞','凭下单时预留的证件原件入园','¥576','预订成功；索道上山→天门洞快线索道下山；儿童票截图未显示']
  };
  for(const row of next.tickets){const values=confirmedTickets[row?.[12]];if(values)for(let i=0;i<7;i++)if(String(row[i]||'').trim()===''||String(row[i]).includes('待填写')){if(row[i]!==values[i]){row[i]=values[i];changed=true}}}
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
function fillEmptyCells(existing,canonical){
  const next=Array.isArray(existing)?existing.slice():cloneRow(canonical);
  let changed=!Array.isArray(existing);
  while(next.length<canonical.length)next.push('');
  for(let i=0;i<canonical.length;i++){
    if(!String(next[i]||'').trim()&&String(canonical[i]||'').trim()){
      next[i]=canonical[i];
      changed=true;
    }
  }
  return {row:next,changed};
}
function upsertFillRow(rows,canonical,matchFn){
  const index=rows.findIndex(matchFn);
  if(index>=0){
    const filled=fillEmptyCells(rows[index],canonical);
    if(!filled.changed)return false;
    rows[index]=filled.row;
    return true;
  }
  rows.push(cloneRow(canonical));
  return true;
}
function itineraryKey(row){return `${row?.[0]||''}\0${row?.[2]||''}`}
function refreshKnownPlanCells(existing,canonical,stale){
  const next=Array.isArray(existing)?existing.slice():cloneRow(canonical);
  let changed=!Array.isArray(existing);
  while(next.length<canonical.length)next.push('');
  for(let i=0;i<canonical.length;i++){
    const current=String(next[i]??'');
    const wanted=String(canonical[i]??'');
    const old=String(stale?.[i]??'');
    if(!current.trim()&&wanted.trim()){next[i]=canonical[i];changed=true;continue}
    if(wanted&&current===old&&current!==wanted){next[i]=canonical[i];changed=true}
  }
  return {row:next,changed};
}
function sortQiantangItinerary(rows){
  return rows.map((row,index)=>({row,index})).sort((a,b)=>{
    const date=String(a.row?.[0]||'').localeCompare(String(b.row?.[0]||''));
    if(date)return date;
    const ao=QIANTANG_ITINERARY_ORDER.get(itineraryKey(a.row));
    const bo=QIANTANG_ITINERARY_ORDER.get(itineraryKey(b.row));
    if(ao!==undefined||bo!==undefined)return (ao??1e9)-(bo??1e9);
    return a.index-b.index;
  }).map(item=>item.row);
}
export function buildQiantangTrip(){
  return {id:'qiantang',name:'钱江潮',meta:'2026年9月 · 嘉兴／海宁',categories:cloneCategories(QIANTANG_PACKING),itinerary:QIANTANG_ITINERARY_ROWS.map(cloneRow),transport:QIANTANG_TRANSPORT_ROWS.map(cloneRow),hotels:QIANTANG_HOTEL_ROWS.map(cloneRow),tickets:[],emergency:QIANTANG_EMERGENCY.map(cloneRow),tour:[],readings:cloneReadings(QIANTANG_READINGS)};
}
function migrateQiantangTrip(trip){
  if(trip?.id!=='qiantang')return {trip,changed:false};
  const originalJson=JSON.stringify(trip);
  const next={...trip,categories:Array.isArray(trip.categories)?trip.categories.map(cat=>({...cat,items:Array.isArray(cat.items)?cat.items.map(item=>({...item})):[]})):[],tickets:Array.isArray(trip.tickets)?trip.tickets.map(row=>Array.isArray(row)?row.slice():row):[],tour:Array.isArray(trip.tour)?trip.tour.map(row=>Array.isArray(row)?row.slice():row):[],transport:Array.isArray(trip.transport)?trip.transport.map(row=>Array.isArray(row)?row.slice():row):[],hotels:Array.isArray(trip.hotels)?trip.hotels.map(row=>Array.isArray(row)?row.slice():row):[],itinerary:Array.isArray(trip.itinerary)?trip.itinerary.map(row=>Array.isArray(row)?row.slice():row):[],emergency:Array.isArray(trip.emergency)?trip.emergency.map(row=>Array.isArray(row)?row.slice():row):[],readings:Array.isArray(trip.readings)?trip.readings.map(row=>({...row})):[]};
  if(!String(next.name||'').trim())next.name='钱江潮';
  if(!String(next.meta||'').trim())next.meta='2026年9月 · 嘉兴／海宁';
  next.hotels=next.hotels.map(row=>{
    if(!Array.isArray(row))return row;
    const name=String(row[0]||'');
    const canonical=QIANTANG_HOTEL_ROWS.find(item=>item[0]===name);
    if(!canonical)return row;
    const nextRow=row.slice();
    while(nextRow.length<9)nextRow.push('');
    const truncatedAddress=/…$/.test(String(nextRow[4]||''));
    if(truncatedAddress||!String(nextRow[4]||'').trim())nextRow[4]=canonical[4];
    if(!String(nextRow[3]||'').trim()&&canonical[3])nextRow[3]=canonical[3];
    if(!String(nextRow[8]||'').trim()){
      const split=splitHotelRoomAndNotes(nextRow[5]);
      if(split.notes){
        nextRow[5]=split.room;
        nextRow[8]=canonical[8]||split.notes;
      }
    }
    return nextRow.slice(0,9);
  });
  for(const row of QIANTANG_TRANSPORT_ROWS)upsertFillRow(next.transport,row,existing=>String(existing?.[1]||'')===row[1]&&String(existing?.[3]||'')===row[3]);
  for(const row of QIANTANG_HOTEL_ROWS)upsertFillRow(next.hotels,row,existing=>String(existing?.[0]||'')===row[0]);
  for(const row of QIANTANG_ITINERARY_ROWS){
    const key=itineraryKey(row);
    const index=next.itinerary.findIndex(existing=>itineraryKey(existing)===key);
    if(index>=0){
      const refreshed=refreshKnownPlanCells(next.itinerary[index],row,QIANTANG_V1_ITINERARY_BY_KEY.get(key));
      next.itinerary[index]=refreshed.row;
    }else next.itinerary.push(cloneRow(row));
  }
  next.itinerary=next.itinerary.filter(row=>!(Array.isArray(row)&&row[0]==='2026-09-24'&&row[2]==='入住嘉兴'));
  next.itinerary=sortQiantangItinerary(next.itinerary);
  for(const row of QIANTANG_EMERGENCY)upsertFillRow(next.emergency,row,existing=>String(existing?.[0]||'')===row[0]);
  next.readings=(Array.isArray(next.readings)?next.readings:[]).filter(row=>row&&!ZHANGJIAJIE_READING_IDS.has(row.id));
  if(next.readings.length===0)next.readings=cloneReadings(QIANTANG_READINGS);
  else{
    const byId=new Map(next.readings.map(row=>[row.id,row]));
    for(const row of QIANTANG_READINGS)if(!byId.has(row.id))next.readings.push({...row});
  }
  if(!Array.isArray(next.categories)||next.categories.length===0)next.categories=cloneCategories(QIANTANG_PACKING);
  else next.categories=refreshQiantangPacking(next.categories);
  const changed=JSON.stringify(next)!==originalJson;
  return {trip:changed?next:trip,changed};
}
export function migrateTripDocument(data){
  if(!plainObject(data)||!Array.isArray(data.trips))return {data,changed:false,migrations:[]};
  let changed=false;
  const migrations=[];
  const trips=data.trips.map(trip=>{
    const result=migrateZhangjiajieTrip(trip);
    changed ||= result.changed;
    return result.trip;
  });
  if(changed)migrations.push(ZHANGJIAJIE_ITINERARY_MIGRATION);
  const qiantangIndex=trips.findIndex(trip=>trip?.id==='qiantang');
  let qiantangChanged=false;
  if(qiantangIndex<0){
    trips.push(buildQiantangTrip());
    qiantangChanged=true;
  }else{
    const result=migrateQiantangTrip(trips[qiantangIndex]);
    trips[qiantangIndex]=result.trip;
    qiantangChanged=result.changed;
  }
  if(qiantangChanged)migrations.push(QIANTANG_TRIP_MIGRATION);
  changed ||= qiantangChanged;
  const nextTrips=trips.map(trip=>{
    let next=trip;
    if(Array.isArray(trip.emergency)){
      const emergency=trip.emergency.map(normalizeEmergencyContactRow);
      if(JSON.stringify(emergency)!==JSON.stringify(trip.emergency)){
        next={...next,emergency};
        changed=true;
      }
    }
    if(Array.isArray(next.categories)){
      const categories=next.categories.map(cat=>{
        const row={...cat,items:Array.isArray(cat.items)?cat.items.map(item=>({...item})):[]};
        if(row.name==='证件行程')row.name='证件凭证';
        return row;
      });
      if(JSON.stringify(categories)!==JSON.stringify(next.categories)){
        next={...next,categories};
        changed=true;
      }
    }
    if(Array.isArray(next.hotels)){
      const hotels=next.hotels.map(normalizeHotelRow);
      if(JSON.stringify(hotels)!==JSON.stringify(next.hotels)){
        next={...next,hotels};
        changed=true;
      }
    }
    if(Array.isArray(next.readings)&&next.readings.some(row=>row&&Object.prototype.hasOwnProperty.call(row,'source'))){
      next={...next,readings:next.readings.map(row=>{
        if(!row||typeof row!=='object'||!Object.prototype.hasOwnProperty.call(row,'source'))return row;
        const {source,...rest}=row;
        return rest;
      })};
      changed=true;
    }
    return next;
  });
  if(!changed)return {data,changed:false,migrations:[]};
  return {data:{...data,trips:nextTrips},changed:true,migrations};
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
