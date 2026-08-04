import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {join,extname} from 'node:path';
import {existsSync} from 'node:fs';
import {chromium} from 'playwright-core';

const root=new URL('..',import.meta.url).pathname;
const localBrowser=join(process.env.HOME,'Library/Caches/ms-playwright/chromium_headless_shell-1217/chrome-headless-shell-mac-arm64/chrome-headless-shell');
const browserPath=process.env.PLAYWRIGHT_CHROMIUM_PATH||(existsSync(localBrowser)?localBrowser:chromium.executablePath());
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.ico':'image/x-icon','.webmanifest':'application/manifest+json'};

const staleTrip={active:'zhangjiajie',tab:'itinerary',trips:[{id:'zhangjiajie',name:'湘行记',meta:'2026年8月 · 长沙／张家界',categories:[],itinerary:[
  ['2026-08-05','09:00集合；09:30-约11:00','湖南省博物馆马王堆基本陈列馆1.5小时深度讲解（含门票代预约）','湖南省博物馆','胡丽霞','09:30场；09:00馆外集合'],
  ['2026-08-05','12:00','用户自定义午餐','长沙','用户','保留'],
  ['2026-08-05','16:55-18:51','C7950 长沙→张家界西','长沙／张家界西','胡丽霞','铁路（3张）；预订号 E227154531'],
  ['2026-08-06','预计 13:30-17:30／待确认','天子山','武陵源','胡丽霞','四日票含环保车'],
  ['2026-08-07','预计 08:30-11:30／待确认','金鞭溪','武陵源','胡丽霞','预计上午游览；需与 13:07 张家界西出发列车衔接核对'],
  ['2026-08-07','10:00','用户自定义补给','武陵源','用户','保留'],
  ['2026-08-07','13:07-13:30','G9679 张家界西→芙蓉镇','张家界西／芙蓉镇','胡丽霞','铁路（3张）；预订号 E222650634'],
  ['2026-08-07','预计 14:30-17:30／待预约确认','天门山A线','张家界','胡丽霞','门票 ¥576；2份；原行程写下午天门山，但同日列车到芙蓉镇，需复核预约时段和返程交通；以订单为准'],
  ['2026-08-07','预计 19:00-19:30／待确认','前往锦栖民宿(张家界高铁西站店)','张家界→宁邦广场二期文华里21栋702','胡丽霞','预计晚间抵达/入住，视路况；同日芙蓉镇、天门山安排需复核；全季天门山索道站订单不再单列为行程酒店'],
  ['2026-08-08','预计 09:00-15:00／待预约确认','猛洞河漂流','猛洞河','胡丽霞','门票 ¥680；2份；凭联系人手机或预留姓名取票使用；备换洗衣物；预计时段需预留 17:00 张家界西出发时间'],
  ['2026-08-08','17:00-18:52','C7769 张家界西→长沙','张家界西／长沙','胡丽霞','铁路（3张）；预订号 E297617576']
],transport:[
  ['铁路（3张）','G9679','座位','2026-08-07','张家界西','13:07','芙蓉镇','13:30','E222650634'],
  ['铁路（3张）','C7769','座位','2026-08-08','张家界西','17:00','长沙','18:52','E297617576']
],hotels:[],tickets:[
  ['猛洞河漂流','待填写','待填写','2份','凭「联系人手机或预留姓名」取票使用','¥680','预订成功'],
  ['天门山A线','待填写','待填写','2份','凭「下单时预留的证件原件+电子凭证或纸质凭证」使用','¥576','预订成功']
],emergency:[],tour:[]}]};

test('zhangjiajie stale browser document migrates August 7 and 8 into executable order',async()=>{
  const server=createServer(async(req,res)=>{
    const url=new URL(req.url,'http://127.0.0.1');
    if(url.pathname==='/api/trips'){
      res.setHeader('content-type','application/json');
      res.end(JSON.stringify({version:1,data:staleTrip,shares:{}}));
      return;
    }
    const file=url.pathname==='/'?'index.html':url.pathname.slice(1);
    try{
      const data=await readFile(join(root,file));
      res.setHeader('content-type',mime[extname(file)]||'application/octet-stream');
      res.end(data);
    }catch{
      res.statusCode=404;
      res.end();
    }
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  const browser=await chromium.launch({executablePath:browserPath,headless:true});
  const page=await browser.newPage({viewport:{width:1180,height:900}});
  try{
    await page.goto(base);
    await page.waitForSelector('.itinerary-block tbody tr');
    const rows=await page.locator('.itinerary-block tbody tr').evaluateAll(rows=>{
      let date='';
      return rows.map(row=>{
        const dateText=row.querySelector('td[data-label="日期"] .cell-view')?.textContent.trim();
        if(dateText)date=dateText;
        return {date,activity:row.querySelector('td[data-label="活动"] .cell-view')?.textContent.trim()};
      });
    });
    const aug5Rows=rows.filter(row=>row.date==='2026-08-05').map(row=>row.activity);
    assert.deepEqual(aug5Rows,[
      '湖南博物院 3 小时重点游览',
      '打车前往五一广场',
      '五一广场',
      '长沙IFS（KAWS，7楼）',
      '黄兴路步行街',
      '坡子街吃东西',
      '太平街逛老街',
      '乘车回酒店取寄存行李',
      '取行李后打车前往长沙站',
      '安检、进站与乘车',
      'C7950 长沙→张家界西',
      '用户自定义午餐'
    ]);
    assert.equal(aug5Rows.filter(name=>name==='C7950 长沙→张家界西').length,1);
    const itineraryText=await page.locator('.itinerary-block tbody').innerText();
    assert.match(itineraryText,/入口→马王堆汉墓陈列（重点）→辛追夫人→T型帛画→素纱襌衣/);
    assert.match(itineraryText,/不要一进去就从一楼慢慢看/);
    assert.match(itineraryText,/五一广场→长沙IFS→黄兴路步行街→坡子街→太平街/);
    assert.match(itineraryText,/不删除后续吃东西安排/);
    assert.match(itineraryText,/不要删坡子街或太平街/);
    assert.match(itineraryText,/15:55乘车返回酒店，不要步行/);
    assert.match(itineraryText,/行李已寄存在酒店，不是办理退房/);
    assert.match(itineraryText,/约15:45先查看实时路况并提前叫车/);
    assert.match(itineraryText,/约16:05到酒店，取寄存行李即走/);
    assert.match(itineraryText,/目标约16:35抵达长沙站/);
    assert.doesNotMatch(itineraryText,/14:40-16:20|取行李并退房|16:00-16:05|16:15-16:25|15:20开始返回|15:30离开|30-40分钟|50-55分钟/);
    const zjjRows=rows.filter(row=>row.date>='2026-08-06').map(row=>row.activity);
    assert.deepEqual(zjjRows,[
      '天子山',
      '金鞭溪缩短路线',
      '金鞭溪后取行李并前往张家界西',
      '用户自定义补给',
      'G9679 张家界西→芙蓉镇',
      '芙蓉镇站衔接猛洞河漂流',
      '返回锦栖民宿(张家界高铁西站店)',
      '天门山A线',
      'C7769 张家界西→长沙'
    ]);
    assert.equal(zjjRows.filter(name=>name==='G9679 张家界西→芙蓉镇').length,1);
    assert.equal(zjjRows.filter(name=>name==='C7769 张家界西→长沙').length,1);
    assert.equal(await page.getByText('原行程写下午天门山').count(),0);
    assert.equal(await page.getByText('预计时段需预留 17:00 张家界西出发时间').count(),0);
    await page.locator('#tabs [data-tab="bookings"]').click();
    const tickets=await page.locator('.tickets-block tbody tr').evaluateAll(rows=>rows.map(row=>Array.from(row.querySelectorAll('.cell-view')).map(cell=>cell.textContent.trim())));
    assert.deepEqual(tickets.map(row=>row.slice(0,3)),[['猛洞河漂流','待填写','待填写'],['天门山A线','待填写','待填写']]);
    assert.match(tickets[0][6],/拟定行程安排为 2026-08-07 下午/);
    assert.match(tickets[1][6],/拟定行程安排为 2026-08-08 上午/);
  }finally{
    await page.close();
    await browser.close();
    await new Promise(resolve=>server.close(resolve));
  }
});
