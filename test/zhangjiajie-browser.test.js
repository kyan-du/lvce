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
