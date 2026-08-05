import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {join,extname} from 'node:path';
import {existsSync} from 'node:fs';
import {chromium} from 'playwright-core';
import {PDFDocument} from 'pdf-lib';

const root=new URL('..',import.meta.url).pathname;
const localBrowser=join(process.env.HOME,'Library/Caches/ms-playwright/chromium_headless_shell-1217/chrome-headless-shell-mac-arm64/chrome-headless-shell');
const browserPath=process.env.PLAYWRIGHT_CHROMIUM_PATH||(existsSync(localBrowser)?localBrowser:chromium.executablePath());
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.ico':'image/x-icon','.webmanifest':'application/manifest+json'};
let server,browser,base,putBodies=[],sharedTrips,publicTokens,shareCounter,shareHtmlFallback=false,shareRequests=[],syncConflictNext=false,loginMode='success';
function shanghaiDate(date=new Date()){
  const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date).map(p=>[p.type,p.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}
const today=shanghaiDate();
const defaultReadingTitles=[
  '岳麓山：山水名胜、古寺宫亭与湖湘文化',
  '岳麓书院：千年学府与中国知识传统',
  '橘子洲：湘江中的千年洲岛与长沙文化地标',
  '张家界国家森林公园：石英砂岩峰林与世界自然遗产总览',
  '袁家界、百龙天梯与天子山：峰林地貌的观察路线',
  '金鞭溪：峡谷溪流生态与地貌观察',
  '天门山：天门洞、索道、地质与地方文化',
  '猛洞河与芙蓉镇：酉水流域、土家族文化与漂流安全',
  '马王堆《老子》帛书及相关考古发现',
  '开福寺：长沙佛教史、建筑与参观礼仪'
];
const newDefaultReadings=[
  ['yuelu-mountain','assets/readings/yuelu-mountain.md','岳麓山','麓山寺','爱晚亭'],
  ['zhangjiajie-forest-overview','assets/readings/zhangjiajie-forest-overview.md','张家界国家森林公园','石英砂岩峰林','世界自然遗产'],
  ['yuanjiajie-bailong-tianzishan','assets/readings/yuanjiajie-bailong-tianzishan.md','袁家界、百龙天梯与天子山','峰林地貌','百龙天梯'],
  ['jinbianxi','assets/readings/jinbianxi.md','金鞭溪','峡谷溪流生态','金鞭岩'],
  ['tianmen-mountain','assets/readings/tianmen-mountain.md','天门山','天门洞','索道'],
  ['mengdong-river-furong-town','assets/readings/mengdong-river-furong-town.md','猛洞河与芙蓉镇','区域背景','不声称行程已经安排芙蓉镇游览'],
  ['kaifu-temple','assets/readings/kaifu-temple.md','开福寺','长沙佛教史','参观礼仪']
];
const document={active:'one',tab:'itinerary',trips:[{id:'one',name:'验收旅行',meta:'自动化测试',categories:[{id:'c',name:'清单',items:[{id:'i',name:'雨衣',qty:1,packed:false}]}],itinerary:[[today,'23:00','今日活动','地点','联系人','备注'],[today,'23:30','同日活动','地点','联系人','备注']],transport:[['铁路·已支付（3张）','G123','2026-08-03','甲地','09:00','乙地','10:00','BOOKING-20260803-ABC123'],['铁路（3张）','G456','张三 二等座 01车01A号；李四 二等座 01车01B号；王五 二等座 01车01C号','2026-08-04','丙地','11:00','丁地','12:00','BOOKING-20260804-XYZ789']],hotels:[['酒店','2026-08-03','前台','138 0000 0000','测试地址 1 号','房型：标准双床房','1','¥1'],{name:'对象酒店',checkin:'2026-08-04',checkout:'2026-08-06',concierge:'对象礼宾',contact:'139 0000 0001',address:'对象地址 2 号',roomType:'对象房型',nights:'99',totalCost:'¥2'}],tickets:[['超长中文门票名称用于验证移动端可以自然换行且不会撑破布局的张家界国家森林公园联票','2026-08-04','成人票 08:00-10:00','2','张三 / QR123','¥288','凭身份证或二维码入园，提前 30 分钟到达']],emergency:[['家人','139 **** 0000','', '139 0000 0000'],['胡丽霞','186 **** 5057','紧急联系人']],tour:[['旧旅行团联系人','旧旅行团电话','旧旅行团备注保留但不展示']],readings:[{id:'test-reading',title:'测试旅读',venue:'测试场馆',category:'测试分类',markdown:'# 测试旅读\n\n## 标题\n\n- 列表项\n\n> 引用内容\n\n```js\nconst a=1;\n```\n\n---\n\n| 列 A | 列 B |\n|---|---|\n| 甲 | 乙 |'}]},{id:'two',name:'可删除旅行',meta:'',categories:[],itinerary:[],transport:[],hotels:[],emergency:[],tour:[],readings:[]}]};
function pngSize(buffer){
  assert.equal(buffer.toString('ascii',1,4),'PNG','asset is not a PNG');
  return {width:buffer.readUInt32BE(16),height:buffer.readUInt32BE(20),colorType:buffer[25]};
}
function icoSizes(buffer){
  assert.equal(buffer.readUInt16LE(0),0,'ICO reserved field should be zero');
  assert.equal(buffer.readUInt16LE(2),1,'ICO type should be icon');
  const count=buffer.readUInt16LE(4),sizes=[];
  for(let i=0;i<count;i++){
    const offset=6+i*16,width=buffer[offset]||256,height=buffer[offset+1]||256;
    sizes.push(`${width}x${height}`);
  }
  return sizes.sort();
}
test.before(async()=>{await mkdir(join(root,'docs/evidence'),{recursive:true});sharedTrips=new Set();publicTokens=new Map();shareCounter=0;server=createServer(async(req,res)=>{let url=new URL(req.url,'http://127.0.0.1');if(url.pathname==='/api/auth/login'||url.pathname==='/api/login'){for await(const _ of req);if(loginMode==='html'){res.statusCode=502;res.setHeader('content-type','text/html');res.end('<!doctype html><main>fallback</main>');return}if(loginMode==='unauthorized'){res.statusCode=401;res.setHeader('content-type','application/json');res.end(JSON.stringify({error:'口令错误'}));return}res.statusCode=204;res.setHeader('set-cookie','lvce_session=test-session; Path=/; HttpOnly; SameSite=Strict; Max-Age=2592000');res.end();return}if(url.pathname==='/api/trips'){res.setHeader('content-type','application/json');if(req.method==='GET')res.end(JSON.stringify({version:1,data:document,shares:Object.fromEntries([...sharedTrips].map(id=>[id,true]))}));else{let body='';for await(const chunk of req)body+=chunk;putBodies.push(JSON.parse(body));if(syncConflictNext){syncConflictNext=false;res.statusCode=409;res.end(JSON.stringify({error:'数据已在其他设备更新，请刷新后重试',version:9}));return}res.end(JSON.stringify({version:2}))}return}if(url.pathname==='/api/trips/share'){let body='';for await(const chunk of req)body+=chunk;let payload=JSON.parse(body||'{}');shareRequests.push({method:req.method,payload});if(shareHtmlFallback){res.statusCode=404;res.setHeader('content-type','text/html');res.end('<!DOCTYPE html><main>SPA fallback</main>');return}res.setHeader('content-type','application/json');if(req.method==='POST'){if(sharedTrips.has(payload.tripId)){res.statusCode=409;res.end(JSON.stringify({error:'旅行计划已分享'}));return}let token=String.fromCharCode(97+shareCounter++).repeat(43);sharedTrips.add(payload.tripId);publicTokens.set(token,payload.tripId);res.end(JSON.stringify({token}));return}if(req.method==='DELETE'){sharedTrips.delete(payload.tripId);for(const [token,tripId] of publicTokens)if(tripId===payload.tripId)publicTokens.delete(token);res.end(JSON.stringify({ok:true}));return}}if(url.pathname.startsWith('/api/public/trips/')){res.setHeader('content-type','application/json');let token=decodeURIComponent(url.pathname.split('/').pop()),tripId=publicTokens.get(token),trip=document.trips.find(t=>t.id===tripId);if(!trip){res.statusCode=404;res.end(JSON.stringify({error:'分享不存在'}));return}res.end(JSON.stringify({version:1,data:{active:trip.id,tab:document.tab,trips:[trip]}}));return}let p=url.pathname==='/'||url.pathname.startsWith('/share/')?'index.html':url.pathname.slice(1);try{let data=await readFile(join(root,p));res.setHeader('content-type',mime[extname(p)]||'application/octet-stream');res.end(data)}catch{res.statusCode=404;res.end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));base=`http://127.0.0.1:${server.address().port}`;browser=await chromium.launch({executablePath:browserPath,headless:true})});
test.after(async()=>{await browser?.close();await new Promise(r=>server.close(r))});

async function submitLogin(page,value='test-password'){
  await page.goto(`${base}/login.html`);
  await page.locator('#password').fill(value);
  await page.getByRole('button',{name:'登录'}).click();
}

test('login page reports non-json, network and password failures with concise Chinese messages',async()=>{
  loginMode='html';
  let page=await browser.newPage();
  await submitLogin(page);
  await page.waitForFunction(()=>document.querySelector('#error').textContent.length>0);
  let text=await page.locator('#error').textContent();
  assert.equal(text,'登录服务响应异常，请刷新后重试');
  assert.doesNotMatch(text,/Unexpected|JSON|DOCTYPE|</);
  await page.close();

  loginMode='unauthorized';
  page=await browser.newPage();
  await submitLogin(page);
  await page.waitForFunction(()=>document.querySelector('#error').textContent.length>0);
  text=await page.locator('#error').textContent();
  assert.equal(text,'密码不正确');
  await page.close();

  loginMode='success';
  const context=await browser.newContext();
  await context.route(`${base}/api/auth/login`,route=>route.abort());
  page=await context.newPage();
  await submitLogin(page);
  await page.waitForFunction(()=>document.querySelector('#error').textContent.length>0);
  text=await page.locator('#error').textContent();
  assert.equal(text,'网络连接失败，请稍后重试');
  await context.close();
});

test('login page treats 204 session response as success and enters the main page',async()=>{
  loginMode='success';
  const context=await browser.newContext();
  const page=await context.newPage();
  await submitLogin(page);
  await page.waitForURL(base+'/');
  await page.waitForSelector('tr.today');
  const cookies=await context.cookies(base);
  const session=cookies.find(cookie=>cookie.name==='lvce_session');
  assert.ok(session,'successful login should store a session cookie');
  assert.equal(session.httpOnly,true);
  assert.equal(session.sameSite,'Strict');
  assert.ok(session.expires>Date.now()/1000,'session cookie should have an expiry');
  await context.close();
});

test('brand logo and favicon assets exist with expected transparent-friendly sizes',async()=>{
  const pngAssets=[
    ['assets/lvce-logo-4e7ee0e9.png',512,512],
    ['assets/favicon-32-4e7ee0e9.png',32,32],
    ['assets/apple-touch-icon-180-4e7ee0e9.png',180,180],
    ['assets/icon-192-4e7ee0e9.png',192,192],
    ['assets/icon-512-4e7ee0e9.png',512,512]
  ];
  for(const [file,width,height] of pngAssets){
    const size=pngSize(await readFile(join(root,file)));
    assert.deepEqual(size,{width,height,colorType:6},`${file} should be ${width}x${height} RGBA PNG`);
  }
  assert.deepEqual(icoSizes(await readFile(join(root,'favicon.ico'))),['16x16','32x32','48x48'],'favicon.ico should contain 16/32/48 icons');
  const manifest=JSON.parse(await readFile(join(root,'site.webmanifest'),'utf8'));
  assert.equal(manifest.start_url,'/');
  assert.equal(manifest.scope,'/');
  assert.deepEqual(manifest.icons.map(icon=>[icon.src,icon.sizes,icon.type]),[
    ['/assets/icon-192-4e7ee0e9.png','192x192','image/png'],
    ['/assets/icon-512-4e7ee0e9.png','512x512','image/png']
  ]);
});

test('Orange Isle reading contains checked full Qinyuanchun text and annotation data',async()=>{
  const markdown=await readFile(join(root,'assets/readings/orange-isle.md'),'utf8');
  assert.match(markdown,/## 三、《沁园春·长沙》完整词文与联机注释/,'橘子洲正式文章应包含完整词文与联机注释章节');
  assert.doesNotMatch(markdown,/contentReference/,'橘子洲正式文章不应包含 contentReference 残留');
  assert.match(markdown,/百度百科（访问日期 2026-08-04）/,'橘子洲文章应注明指定底本和访问日期');
  assert.match(markdown,/作者为“毛泽东”/,'橘子洲文章应记录作者核对结果');
  assert.match(markdown,/独立寒秋.*谁\[\[主沉浮\|n13\]\]？/s,'上阕关键首尾和标点应存在');
  assert.match(markdown,/携来百侣曾游.*\[\[浪遏飞舟\|n23\]\]。/s,'下阕关键首尾和句号应存在');
  assert.equal([...markdown.matchAll(/^\[\^n\d{2}\]:/gm)].length,23,'应录入 23 条百度百科词句注释');
  for(const phrase of ['湘江：一名湘水','层林尽染：山上一层层的树林经霜打变红','挥斥方遒（qiú）','遏（e）：阻止'])assert.ok(markdown.includes(phrase),`注释应包含 ${phrase}`);
  assert.match(markdown,/解析部分为家庭内部阅读场景下的原创解析/,'应说明赏析为原创解析');
});

test('default reading registry follows itinerary order and source markdown is clean',async()=>{
  const app=await readFile(join(root,'app.js'),'utf8');
  const registry=Function(`return ${app.match(/const defaultReadings=(\[.*?\]);/s)[1]}`)();
  assert.equal(registry.length,10,'湘行记 should expose ten default readings after adding the remaining real sights');
  assert.deepEqual(registry.map(reading=>reading.title),defaultReadingTitles,'default readings should follow the trip order');
  assert.deepEqual(registry.map(reading=>reading.source),[
    '/assets/readings/yuelu-mountain.md',
    '/assets/readings/yuelu-academy.md',
    '/assets/readings/orange-isle.md',
    '/assets/readings/zhangjiajie-forest-overview.md',
    '/assets/readings/yuanjiajie-bailong-tianzishan.md',
    '/assets/readings/jinbianxi.md',
    '/assets/readings/tianmen-mountain.md',
    '/assets/readings/mengdong-river-furong-town.md',
    '/assets/readings/mawangdui-laozi.md',
    '/assets/readings/kaifu-temple.md'
  ]);
  for(const [id,file,h1,...phrases] of newDefaultReadings){
    const reading=registry.find(item=>item.id===id);
    assert.ok(reading,`${id} should be registered`);
    const md=await readFile(join(root,file),'utf8');
    assert.match(md,new RegExp(`^# ${h1.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}`),`${file} should start with its key title`);
    assert.match(md,/## 资料来源/,`${file} should include a source section`);
    assert.doesNotMatch(md,/contentReference/,`${file} should not contain contentReference residue`);
    for(const phrase of phrases)assert.ok(md.includes(phrase),`${file} should mention ${phrase}`);
  }
});

async function assertLoginLogo(page,name,{desktop=false}={}){
  const metrics=await page.evaluate(()=>{
    const rect=selector=>{
      const r=document.querySelector(selector).getBoundingClientRect();
      return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height,centerY:r.top+r.height/2};
    };
    const logo=document.querySelector('.login .brand-logo');
    const style=logo?getComputedStyle(logo):null;
    return {
      logoCount:document.querySelectorAll('.login .brand-logo').length,
      logoSrc:logo?.getAttribute('src')||'',
      logoAlt:logo?.getAttribute('alt')||'',
      logoVisible:!!logo&&style.display!=='none'&&style.visibility!=='hidden'&&style.opacity!=='0'&&logo.getClientRects().length>0,
      naturalWidth:logo?.naturalWidth||0,
      naturalHeight:logo?.naturalHeight||0,
      card:rect('.login'),
      eyebrow:rect('.login .eyebrow'),
      brand:rect('.login-brand'),
      logo:rect('.login .brand-logo'),
      title:rect('.login-brand h1'),
      label:rect('.login label')
    };
  });
  assert.equal(metrics.logoCount,1,`${name} login page should render exactly one logo`);
  assert.equal(metrics.logoSrc,'/assets/lvce-logo-4e7ee0e9.png',`${name} login logo should reuse the main cache-busted logo`);
  assert.equal(metrics.logoAlt,'LVCE logo',`${name} login logo alt text is incorrect`);
  assert.equal(metrics.logoVisible,true,`${name} login logo is not visible`);
  assert.equal(metrics.naturalWidth,512,`${name} login logo natural width should match the shared asset`);
  assert.equal(metrics.naturalHeight,512,`${name} login logo natural height should match the shared asset`);
  assert.equal(metrics.logo.width,metrics.logo.height,`${name} login logo should keep a square box without distortion`);
  assert.ok(Math.abs(metrics.logo.centerY-metrics.title.centerY)<=1,`${name} login logo/title vertical centers differ by more than 1px`);
  assert.ok(metrics.logo.right<metrics.title.left,`${name} login logo should sit to the left of the title`);
  const gap=metrics.title.left-metrics.logo.right;
  if(desktop)assert.ok(gap>=12&&gap<=16,`${name} login logo/title gap should be 12-16px`);
  else assert.ok(gap>=9&&gap<=11,`${name} narrow login logo/title gap should shrink without crowding`);
  assert.ok(Math.abs(metrics.eyebrow.left-metrics.brand.left)<=1,`${name} eyebrow and brand group should share the left edge`);
  assert.ok(Math.abs(metrics.label.left-metrics.brand.left)<=1,`${name} password label and brand group should share the left edge`);
  assert.ok(metrics.brand.left>=metrics.card.left&&metrics.brand.right<=metrics.card.right,`${name} login brand group overflows the card`);
  assert.ok(metrics.logo.left>=metrics.card.left&&metrics.title.right<=metrics.card.right,`${name} login logo/title content overflows the card`);
}

test('login page reuses the main logo in a left-aligned brand group',async()=>{
  const mainPage=await browser.newPage();
  await mainPage.goto(base);
  await mainPage.waitForSelector('header .brand-logo');
  const mainLogoSrc=await mainPage.locator('header .brand-logo').getAttribute('src');
  await mainPage.close();
  assert.equal(mainLogoSrc,'/assets/lvce-logo-4e7ee0e9.png','main header logo source changed unexpectedly');

  for(const [name,viewport,desktop,screenshot] of [
    ['desktop',{width:1440,height:1000},true,'login-desktop.png'],
    ['mobile',{width:390,height:844},false,'login-mobile.png']
  ]){
    const page=await browser.newPage({viewport});
    await page.goto(`${base}/login.html`);
    await page.screenshot({path:join(root,'docs/evidence',screenshot),fullPage:true});
    await assertLoginLogo(page,name,{desktop});
    await page.close();
  }
});

async function assertHeaderLogo(page,name){
  const logo=page.locator('header .brand-logo');
  assert.equal(await logo.count(),1,`${name} should render one header logo`);
  assert.equal(await logo.getAttribute('alt'),'LVCE logo',`${name} logo alt text is incorrect`);
  assert.equal(await logo.getAttribute('src'),'/assets/lvce-logo-4e7ee0e9.png',`${name} logo should use the cache-busted asset`);
  assert.equal(await page.locator('header .eyebrow').count(),0,`${name} should not render the removed English eyebrow`);
  assert.equal(await page.locator('header').textContent().then(text=>text.includes('TRAVEL PLANNER')),false,`${name} should not include the old English eyebrow copy`);
  const metrics=await page.evaluate(()=>{
    const rect=selector=>{
      const r=document.querySelector(selector).getBoundingClientRect();
      return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height,centerX:r.left+r.width/2,centerY:r.top+r.height/2};
    };
    return {
      header:rect('header'),
      brand:rect('header .brand'),
      logo:rect('header .brand-logo'),
      title:rect('header h1'),
      subtitle:rect('#subtitle'),
      brandLine:rect('header .brand-line'),
      brandCopy:rect('header .brand-copy'),
      main:rect('main'),
      workspace:rect('.workspace'),
      aside:document.querySelector('aside')?rect('aside'):null,
      workspacePaddingLeft:parseFloat(getComputedStyle(document.querySelector('.workspace')).paddingLeft),
      asidePaddingLeft:document.querySelector('aside')?parseFloat(getComputedStyle(document.querySelector('aside')).paddingLeft):0,
      publicView:document.body.classList.contains('public-view'),
      mobileAsideBorderRight:matchMedia('(max-width: 680px)').matches?getComputedStyle(document.querySelector('aside')).borderRightWidth:null,
      headerBottomElement:document.elementFromPoint(innerWidth/2,document.querySelector('header').getBoundingClientRect().bottom-1)?.closest('header')?.tagName||'',
      logout:document.querySelector('#logout')?.getClientRects().length?rect('#logout'):null
    };
  });
  const targetLeft=metrics.workspace.left+metrics.workspacePaddingLeft;
  assert.equal(metrics.logo.width,metrics.logo.height,`${name} logo should keep a square box without distortion`);
  assert.ok(Math.abs(metrics.brand.left-targetLeft)<=1,`${name} brand left edge does not align with the page content`);
  assert.ok(Math.abs(metrics.brand.left-metrics.brandLine.left)<=1,`${name} brand line is not left-aligned with the brand`);
  assert.ok(Math.abs(metrics.logo.left-metrics.brandLine.left)<=1,`${name} logo column is not the left edge of the brand line`);
  assert.ok(metrics.logo.right<metrics.brandCopy.left,`${name} logo should occupy the left column before the text stack`);
  const logoCopyGap=metrics.brandCopy.left-metrics.logo.right;
  assert.ok(logoCopyGap>=9&&logoCopyGap<=20,`${name} logo/text gap should stay balanced`);
  assert.ok(Math.abs(metrics.title.left-metrics.subtitle.left)<=1,`${name} title and subtitle are not left-aligned in the text stack`);
  assert.ok(metrics.title.top<metrics.subtitle.top,`${name} title should stack above the subtitle`);
  assert.ok(metrics.brandCopy.left>=metrics.logo.right+9,`${name} text stack is crowding the logo column`);
  assert.ok(metrics.subtitle.left>=metrics.brandCopy.left-1&&metrics.subtitle.right<=metrics.brandLine.right+1,`${name} subtitle overflows the brand line`);
  assert.ok(metrics.logo.height>=44,`${name} header logo should remain visually prominent`);
  assert.ok(Math.abs(metrics.header.bottom-metrics.main.top)<=0.5,`${name} header and page body do not meet cleanly`);
  assert.equal(metrics.headerBottomElement,'HEADER',`${name} header bottom is not fully painted by the header`);
  if(metrics.mobileAsideBorderRight!==null)assert.equal(metrics.mobileAsideBorderRight,'0px',`${name} mobile header area shows a vertical aside rule`);
  if(metrics.logout)assert.ok(metrics.brandLine.right<=metrics.logout.left-8,`${name} brand line collides with logout`);
}

test('header brand logo is reused on main and public share pages without layout collisions',async()=>{
  sharedTrips.clear();
  publicTokens.clear();
  const token='l'.repeat(43);
  sharedTrips.add('one');
  publicTokens.set(token,'one');
  for(const [name,url,viewport] of [
    ['desktop main',base,{width:1440,height:1000}],
    ['mobile main',base,{width:390,height:844}],
    ['public share',`${base}/share/${token}`,{width:1024,height:800}],
    ['mobile public share',`${base}/share/${token}`,{width:390,height:844}]
  ]){
    const page=await browser.newPage({viewport});
    await page.goto(url);
    await page.waitForSelector('tr.today');
    await page.screenshot({path:join(root,'docs/evidence',`header-${name.replaceAll(' ','-')}.png`),fullPage:false});
    await assertHeaderLogo(page,name);
    await page.close();
  }
});

async function assertProgressHidden(page,name){
  assert.equal(await page.locator('.progress').evaluate(el=>getComputedStyle(el).display),'none',`${name} progress is visible on non-packing tab`);
  assert.equal(await page.locator('.progress').evaluate(el=>el.offsetHeight),0,`${name} hidden progress still takes vertical space`);
  assert.equal(await page.locator('.progress').boundingBox(),null,`${name} hidden progress has a layout box`);
}

async function assertProgressVisible(page,name){
  assert.notEqual(await page.locator('.progress').evaluate(el=>getComputedStyle(el).display),'none',`${name} packing progress is missing`);
  assert.ok(await page.locator('.progress').evaluate(el=>el.offsetHeight>0),`${name} packing progress has no height`);
}

async function assertTripMenuDismissal(page,name){
  const summary=page.locator('summary[aria-label="更多操作"]');
  const menu=page.locator('.trip-actions details.menu');
  await summary.click();
  await page.waitForFunction(()=>{let menu=document.querySelector('.trip-actions details.menu'),summary=menu?.querySelector('summary');return menu?.open&&summary?.getAttribute('aria-expanded')==='true'});
  assert.equal(await menu.evaluate(el=>el.open),true,`${name} menu did not open`);
  await page.mouse.click(20,20);
  assert.equal(await menu.evaluate(el=>el.open),false,`${name} menu did not close on outside click`);
  assert.equal(await summary.getAttribute('aria-expanded'),'false',`${name} menu aria-expanded did not close after outside click`);
  await summary.click();
  await page.locator('#deleteTrip').focus();
  await page.waitForTimeout(50);
  assert.equal(await menu.evaluate(el=>el.open),true,`${name} menu closed while focus stayed inside`);
  await page.locator('#tabs [data-tab="bookings"]').focus();
  await page.waitForFunction(()=>!document.querySelector('.trip-actions details.menu').open);
  assert.equal(await summary.getAttribute('aria-expanded'),'false',`${name} menu aria-expanded did not close after focus left`);
  await summary.click();
  await page.waitForFunction(()=>document.querySelector('.trip-actions details.menu')?.open);
  await summary.press('Escape');
  assert.equal(await menu.evaluate(el=>el.open),false,`${name} menu did not close on Escape`);
  assert.equal(await summary.getAttribute('aria-expanded'),'false',`${name} menu aria-expanded did not close after Escape`);
  await summary.click();
  await page.getByRole('button',{name:'复制',exact:true}).click();
  await page.waitForFunction(()=>!document.querySelector('.trip-actions details.menu').open);
  await expectActiveTripCopy(page,name);
}

async function expectActiveTripCopy(page,name){
  assert.match(await page.locator('#tripName').inputValue(),/副本$/,`${name} duplicate action did not complete from inside the menu`);
}

async function assertReadableCellEditor(locator,name){
  const metrics=await locator.evaluate(el=>{
    const s=getComputedStyle(el),line=parseFloat(s.lineHeight),padding=parseFloat(s.paddingTop)+parseFloat(s.paddingBottom);
    return {display:s.display,offsetHeight:el.offsetHeight,clientHeight:el.clientHeight,scrollHeight:el.scrollHeight,line,padding};
  });
  assert.equal(metrics.display,'block',`${name} editor is not visible while editing`);
  assert.ok(metrics.offsetHeight>=42,`${name} editor is shorter than one comfortable mobile line`);
  assert.ok(metrics.clientHeight+1>=metrics.line+metrics.padding,`${name} editor clips a single line`);
}

async function assertCellEditorAutogrows(locator,name){
  await locator.fill('第一行\n第二行内容需要完整显示\n第三行');
  const metrics=await locator.evaluate(el=>({offsetHeight:el.offsetHeight,clientHeight:el.clientHeight,scrollHeight:el.scrollHeight,resize:getComputedStyle(el).resize,overflowY:getComputedStyle(el).overflowY}));
  assert.ok(metrics.offsetHeight>42,`${name} editor did not grow for multiline content`);
  assert.ok(metrics.clientHeight+1>=metrics.scrollHeight,`${name} editor scroll height exceeds visible height`);
  assert.equal(metrics.resize,'none',`${name} editor should not expose manual resize handles`);
  assert.equal(metrics.overflowY,'hidden',`${name} editor should not show a vertical scrollbar`);
}

async function assertEditorRowAutogrows(page,locator,name){
  await locator.fill('');
  const empty=await locator.evaluate(el=>{
    const td=el.closest('td').getBoundingClientRect(),row=el.closest('tr').getBoundingClientRect(),s=getComputedStyle(el);
    return {editor:el.getBoundingClientRect().height,td:td.height,row:row.height,minHeight:parseFloat(s.minHeight),clientHeight:el.clientHeight,scrollHeight:el.scrollHeight};
  });
  assert.ok(empty.editor>=empty.minHeight,`${name} empty editor is below its minimum height`);
  assert.ok(empty.clientHeight+1>=empty.scrollHeight,`${name} empty editor has an internal vertical scroll`);
  await locator.fill('第一行\n第二行内容比较长用于触发换行和撑高\n第三行\n第四行\n第五行');
  await page.waitForFunction(el=>el.clientHeight+1>=el.scrollHeight,await locator.elementHandle());
  const grown=await locator.evaluate(el=>{
    const td=el.closest('td').getBoundingClientRect(),row=el.closest('tr').getBoundingClientRect(),s=getComputedStyle(el);
    return {editor:el.getBoundingClientRect().height,td:td.height,row:row.height,clientHeight:el.clientHeight,scrollHeight:el.scrollHeight,overflowY:s.overflowY};
  });
  assert.ok(grown.editor>empty.editor+30,`${name} editor height did not follow multiline content`);
  assert.ok(grown.td>empty.td+30,`${name} table cell/card section did not grow with editor content`);
  assert.ok(grown.row>empty.row+30,`${name} table row/card did not grow with editor content`);
  assert.ok(grown.clientHeight+1>=grown.scrollHeight,`${name} grown editor has an internal vertical scroll`);
  assert.equal(grown.overflowY,'hidden',`${name} grown editor should keep vertical overflow hidden`);
  await locator.fill('');
}

async function categoryTitleMetrics(page){
  return page.locator('.card').first().evaluate(card=>{
    const head=card.querySelector('.card-head').getBoundingClientRect();
    const name=card.querySelector('.category-name').getBoundingClientRect();
    const remove=card.querySelector('.remove-category').getBoundingClientRect();
    const first=card.querySelector('.items .item').getBoundingClientRect();
    const nameStyle=getComputedStyle(card.querySelector('.category-name'));
    return {
      headHeight:head.height,
      nameHeight:name.height,
      namePaddingY:parseFloat(nameStyle.paddingTop)+parseFloat(nameStyle.paddingBottom),
      nameCenterDelta:Math.abs((name.top+name.height/2)-(head.top+head.height/2)),
      removeCenterDelta:Math.abs((remove.top+remove.height/2)-(head.top+head.height/2)),
      firstItemGap:first.top-head.bottom
    };
  });
}

async function assertMenuDotsGeometry(page,name){
  const metrics=await page.locator('.trip-actions summary').evaluate(el=>{
    const rect=el.getBoundingClientRect(),dot=getComputedStyle(el,'::before');
    return {
      width:rect.width,
      height:rect.height,
      fontSize:getComputedStyle(el).fontSize,
      lineHeight:getComputedStyle(el).lineHeight,
      dotWidth:parseFloat(dot.width),
      dotHeight:parseFloat(dot.height),
      dotLeft:parseFloat(dot.left),
      dotTop:parseFloat(dot.top),
      borderX:parseFloat(getComputedStyle(el).borderLeftWidth)+parseFloat(getComputedStyle(el).borderRightWidth),
      borderY:parseFloat(getComputedStyle(el).borderTopWidth)+parseFloat(getComputedStyle(el).borderBottomWidth),
      dotShadow:dot.boxShadow
    };
  });
  assert.equal(metrics.fontSize,'0px',`${name} menu trigger still relies on visible text dots`);
  assert.equal(metrics.lineHeight,'0px',`${name} menu trigger text line box can affect dot centering`);
  assert.equal(metrics.dotWidth,4,`${name} menu dot width changed`);
  assert.equal(metrics.dotHeight,4,`${name} menu dot height changed`);
  assert.ok(Math.abs(metrics.dotLeft-(metrics.width-metrics.borderX)/2)<=0.5,`${name} menu dots are not horizontally centered`);
  assert.ok(Math.abs(metrics.dotTop-((metrics.height-metrics.borderY)/2-1))<=0.5,`${name} menu dots need the 1px optical lift`);
  assert.ok(metrics.dotShadow.includes('-9px')&&metrics.dotShadow.includes('9px'),`${name} menu trigger is missing geometric side dots`);
}

async function assertMobileTripMenuGaps(page,name){
  const gaps=await page.evaluate(()=>{
    const trip=document.querySelector('.trip-switcher nav button.active').getBoundingClientRect();
    const summary=document.querySelector('.trip-switcher .trip-actions summary').getBoundingClientRect();
    return {
      top:summary.top-trip.top,
      right:trip.right-summary.right,
      bottom:trip.bottom-summary.bottom,
      summaryHeight:summary.height
    };
  });
  assert.equal(gaps.summaryHeight,40,`${name} mobile menu trigger should keep a stable 40px box`);
  assert.ok(Math.abs(gaps.top-gaps.bottom)<=1,`${name} menu trigger is not vertically centered in the active trip card`);
  assert.ok(Math.abs(gaps.top-gaps.right)<=1,`${name} menu trigger right gap does not match the top gap`);
}

async function controlVisualState(locator){
  return locator.evaluate(el=>{
    const s=getComputedStyle(el),r=el.getBoundingClientRect();
    return {
      borderColor:s.borderColor,
      backgroundColor:s.backgroundColor,
      color:s.color,
      boxShadow:s.boxShadow,
      transitionProperty:s.transitionProperty,
      transitionDuration:s.transitionDuration,
      box:{x:r.x,y:r.y,width:r.width,height:r.height}
    };
  });
}

function assertStableBox(before,after,name){
  for(const key of ['x','y','width','height']){
    assert.ok(Math.abs(before.box[key]-after.box[key])<=0.01,`${name} ${key} changed on hover`);
  }
}

function assertSameRect(before,after,name){
  for(const key of ['left','right','top','bottom','width','height']){
    assert.ok(Math.abs(before[key]-after[key])<=1,`${name} ${key} moved`);
  }
}

async function desktopActionRightEdges(page,name){
  return page.evaluate(()=>{
    const rectOf=el=>{
      const r=el.getBoundingClientRect();
      return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};
    };
    const logout=document.querySelector('#logout');
    const summary=document.querySelector('.desktop-toolbar .trip-actions summary');
    const actions=document.querySelector('.desktop-toolbar .trip-actions');
    const toolbar=document.querySelector('.desktop-toolbar');
    return {
      logout:rectOf(logout),
      summary:rectOf(summary),
      actions:rectOf(actions),
      toolbar:rectOf(toolbar)
    };
  });
}

function assertDesktopActionRightBaseline(metrics,name){
  assert.ok(Math.abs(metrics.logout.right-metrics.summary.right)<=1,`${name} logout and desktop menu right edges are not aligned`);
  assert.ok(Math.abs(metrics.actions.right-metrics.summary.right)<=1,`${name} edit action row does not use the menu right edge as its baseline`);
  assert.ok(Math.abs(metrics.toolbar.right-metrics.summary.right)<=1,`${name} desktop toolbar right edge does not match the menu baseline`);
}

async function assertDesktopActionRightAlignment(page,name){
  const before=await desktopActionRightEdges(page,name);
  assertDesktopActionRightBaseline(before,name);
  await page.locator('.desktop-toolbar .trip-actions summary').hover();
  const menuHover=await desktopActionRightEdges(page,name);
  assertDesktopActionRightBaseline(menuHover,`${name} menu hover`);
  assertSameRect(before.summary,menuHover.summary,`${name} menu hover summary`);
  assertSameRect(before.logout,menuHover.logout,`${name} menu hover logout`);
  await page.locator('#logout').hover();
  const logoutHover=await desktopActionRightEdges(page,name);
  assertDesktopActionRightBaseline(logoutHover,`${name} logout hover`);
  assertSameRect(before.summary,logoutHover.summary,`${name} logout hover summary`);
  assertSameRect(before.logout,logoutHover.logout,`${name} logout hover logout`);
}

async function tabUntilFocused(page,selector,name){
  for(let i=0;i<10;i++){
    await page.keyboard.press('Tab');
    if(await page.locator(selector).evaluate(el=>el===document.activeElement))return;
  }
  assert.fail(`${name} was not reachable by keyboard tab`);
}

async function assertTripMenuFeedback(page,name,{compareNewTrip=false}={}){
  await page.goto(base);
  await page.waitForSelector('tr.today');
  const newTrip=page.locator('.aside-title #newTrip');
  const summary=page.locator('.trip-actions summary');
  const green='rgb(53, 95, 86)';
  const highlight='rgb(221, 233, 229)';
  const shadow='rgba(32, 59, 48, 0.07) 0px 2px 7px 0px';
  let plusHover,plusFocus;

  if(compareNewTrip){
    const plusBefore=await controlVisualState(newTrip);
    await newTrip.hover();
    await page.waitForFunction(([selector,border,background])=>{
      const s=getComputedStyle(document.querySelector(selector));
      return s.borderColor===border&&s.backgroundColor===background;
    },['.aside-title #newTrip',green,highlight]);
    plusHover=await controlVisualState(newTrip);
    assert.equal(plusHover.borderColor,green,`${name} new trip hover border color changed from the expected highlight`);
    assert.equal(plusHover.backgroundColor,highlight,`${name} new trip hover background changed from the expected highlight`);
    assert.equal(plusHover.boxShadow,shadow,`${name} new trip hover shadow changed from the expected highlight`);
    assertStableBox(plusBefore,plusHover,`${name} new trip button`);
  }

  await page.mouse.move(0,0);
  const menuBefore=await controlVisualState(summary);
  await summary.hover();
  await page.waitForFunction(([selector,border,background])=>{
    const s=getComputedStyle(document.querySelector(selector));
    return s.borderColor===border&&s.backgroundColor===background;
  },['.trip-actions summary',green,highlight]);
  const menuHover=await controlVisualState(summary);
  assert.equal(menuHover.borderColor,compareNewTrip?plusHover.borderColor:green,`${name} menu hover border color should highlight`);
  assert.equal(menuHover.backgroundColor,compareNewTrip?plusHover.backgroundColor:highlight,`${name} menu hover background should highlight`);
  assert.equal(menuHover.boxShadow,compareNewTrip?plusHover.boxShadow:shadow,`${name} menu hover shadow should highlight`);
  if(compareNewTrip){
    assert.equal(menuHover.transitionProperty,plusHover.transitionProperty,`${name} menu transition should match new trip transition`);
    assert.equal(menuHover.transitionDuration,plusHover.transitionDuration,`${name} menu transition duration should match new trip transition duration`);
  }
  assertStableBox(menuBefore,menuHover,`${name} trip menu trigger`);

  await page.mouse.move(0,0);
  if(compareNewTrip){
    await tabUntilFocused(page,'.aside-title #newTrip',`${name} new trip button`);
    await page.waitForFunction(([selector,border,background])=>{
      const s=getComputedStyle(document.querySelector(selector));
      return s.borderColor===border&&s.backgroundColor===background;
    },['.aside-title #newTrip',green,highlight]);
    plusFocus=await controlVisualState(newTrip);
    assert.equal(plusFocus.borderColor,green,`${name} new trip focus-visible border color is not visible`);
    assert.equal(plusFocus.backgroundColor,highlight,`${name} new trip focus-visible background is not visible`);
  }

  await tabUntilFocused(page,'.trip-actions summary',`${name} trip menu trigger`);
  await page.waitForFunction(([selector,border,background])=>{
    const s=getComputedStyle(document.querySelector(selector));
    return s.borderColor===border&&s.backgroundColor===background;
  },['.trip-actions summary',green,highlight]);
  const menuFocus=await controlVisualState(summary);
  assert.equal(menuFocus.borderColor,compareNewTrip?plusFocus.borderColor:green,`${name} menu focus-visible border color should highlight`);
  assert.equal(menuFocus.backgroundColor,compareNewTrip?plusFocus.backgroundColor:highlight,`${name} menu focus-visible background should highlight`);
  assert.equal(menuFocus.boxShadow,compareNewTrip?plusFocus.boxShadow:shadow,`${name} menu focus-visible shadow should highlight`);
  assertStableBox(menuBefore,menuFocus,`${name} trip menu trigger focus-visible`);
}

test('public shared trip page is read-only and omits management controls',async()=>{
  sharedTrips.clear();
  publicTokens.clear();
  const token='p'.repeat(43);
  sharedTrips.add('one');
  publicTokens.set(token,'one');
  let page=await browser.newPage({viewport:{width:1024,height:800}});
  await page.goto(`${base}/share/${token}`);
  await page.waitForSelector('tr.today');
  assert.equal(await page.locator('#tripList button').count(),0,'public page must not show trip switcher entries');
  assert.equal(await page.locator('#logout').isVisible(),false,'public page must not show account/logout action');
  assert.equal(await page.locator('#newTrip').isVisible(),false,'public page must not show new trip action');
  assert.equal(await page.locator('.trip-actions').isVisible(),false,'public page must not show trip management menu');
  assert.equal(await page.locator('#editTrip,#deleteTrip,#duplicate,#shareTrip,.copy-value,.add-category,.add-item,.remove-row,.remove-item').evaluateAll(nodes=>nodes.some(n=>n.getClientRects().length>0)),false,'public page leaked edit/delete/copy/share controls');
  assert.equal(await page.locator('#tripName').inputValue(),'验收旅行');
  assert.equal(await page.locator('#tripName').getAttribute('readonly'),'','public title must be readonly');
  await page.locator('#tabs [data-tab="bookings"]').click();
  assert.equal(await page.locator('.tickets-block').count(),1,'public page should show tickets');
  assert.equal(await page.locator('.transport-block td[data-label="座位号"] .cell-view').first().textContent(),'待填写','public page should render migrated empty transport seats');
  assert.equal(await page.locator('.transport-block td[data-label="预订号"] .cell-view').first().textContent(),'BOOKING-20260803-ABC123','public page should show full booking numbers');
  assert.equal(await page.locator('.booking-grid .table-block').nth(1).locator('td[data-label="入住/离店"] .cell-view').first().textContent(),'入住 2026-08-03\n离店 待填写','public page should not guess checkout dates for legacy hotel rows');
  assert.equal(await page.locator('.tickets-block .cell-view').first().textContent(),document.trips[0].tickets[0][0],'public page should render ticket names');
  assert.equal(await page.getByText('旅行团').count(),0,'public page should not show legacy tour section');
  assert.equal(await page.getByText('可删除旅行').count(),0,'public page leaked another trip');
  await page.close();
});

test('reading tab renders safe markdown and emergency phones follow auth visibility',async()=>{
  sharedTrips.clear();
  publicTokens.clear();
  const token='r'.repeat(43);
  sharedTrips.add('one');
  publicTokens.set(token,'one');

  const context=await browser.newContext({viewport:{width:1024,height:800}});
  await context.grantPermissions(['clipboard-read','clipboard-write'],{origin:base});
  let page=await context.newPage();
  await page.goto(base);
  await page.waitForSelector('tr.today');
  assert.deepEqual(await page.locator('#tabs button').evaluateAll(nodes=>nodes.map(n=>n.dataset.tab)),['itinerary','bookings','packing','reading'],'reading tab must be last');

  await page.locator('#tabs [data-tab="bookings"]').click();
  const privatePhoneCell=page.locator('.booking-grid .table-block').last().locator('td[data-label="电话"] .cell-view').first();
  assert.equal((await privatePhoneCell.textContent()).replace('复制','').trim(),'139 0000 0000','logged-in app should show the full emergency phone');
  await page.locator('.booking-grid .table-block').last().locator('button[aria-label="复制电话"]').click();
  assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),'139 0000 0000','logged-in copy should use the full emergency phone');
  const legacyPrivatePhoneCell=page.locator('.booking-grid .table-block').last().locator('td[data-label="电话"] .cell-view').nth(1);
  assert.equal((await legacyPrivatePhoneCell.textContent()).trim(),'待补全完整号码','logged-in app should not render a masked-only emergency phone as if it were complete');
  assert.equal(await legacyPrivatePhoneCell.locator('button[aria-label="复制电话"]').count(),0,'logged-in copy should not copy masked-only emergency phones');

  await page.locator('#tabs [data-tab="reading"]').click();
  assert.equal(await page.locator('.reading-card').count(),11,'normalization should keep existing readings and all default source readings');
  assert.deepEqual(await page.locator('.reading-card strong').evaluateAll(nodes=>nodes.map(n=>n.textContent)),[...defaultReadingTitles,'测试旅读'],'default readings should render before custom readings and follow the trip order');
  const readingListLayout=await page.evaluate(()=>{
    const rect=selector=>{
      const box=document.querySelector(selector).getBoundingClientRect();
      return {x:box.x,y:box.y,width:box.width,height:box.height};
    };
    return {
      tabs:rect('.tabs'),
      firstCard:rect('.reading-card'),
      moduleBarDisplay:getComputedStyle(document.querySelector('.module-bar')).display
    };
  });
  assert.equal(readingListLayout.moduleBarDisplay,'none','reading list should remove the duplicate 旅读 title');
  assert.ok(readingListLayout.firstCard.y>=readingListLayout.tabs.y+readingListLayout.tabs.height,'reading list cards should start below tabs');
  assert.ok(readingListLayout.firstCard.y-(readingListLayout.tabs.y+readingListLayout.tabs.height)<=10,'reading list has too much blank space after tabs');
  assert.ok(Math.abs(readingListLayout.firstCard.x-readingListLayout.tabs.x)<=1,'reading list cards should align with tabs');
  await page.screenshot({path:join(root,'docs/evidence/reading-list-desktop.png'),fullPage:true});
  const mawangduiCard=page.locator('.reading-card').filter({hasText:'马王堆《老子》帛书及相关考古发现'});
  assert.equal(await mawangduiCard.locator('small').textContent(),'湖南博物院');
  const yueluCard=page.locator('.reading-card').filter({hasText:'岳麓书院：千年学府与中国知识传统'});
  assert.equal(await yueluCard.locator('span').textContent(),'历史文献');
  assert.equal(await yueluCard.locator('small').textContent(),'岳麓书院');
  const juzizhouCard=page.locator('.reading-card').filter({hasText:'橘子洲：湘江中的千年洲岛与长沙文化地标'});
  assert.equal(await juzizhouCard.locator('span').textContent(),'历史文献');
  assert.equal(await juzizhouCard.locator('small').textContent(),'橘子洲');
  await mawangduiCard.click();
  await page.waitForSelector('.markdown-body table');
  assert.equal(await page.locator('.reading-back').textContent(),'← 返回文章列表');
  assert.equal(await page.getByRole('button',{name:'返回旅读'}).count(),0,'old stroked reading back button label should be removed');
  assert.equal(await page.locator('.module-bar').boundingBox(),null,'reading detail should not show the duplicate module title');
  assert.equal(await page.locator('.reading-head h2').textContent(),'马王堆《老子》帛书及相关考古发现');
  assert.equal(await page.locator('.reading-head p').textContent(),'湖南博物院');
  const readingLayout=await page.evaluate(()=>{
    const rect=selector=>{
      const box=document.querySelector(selector).getBoundingClientRect();
      return {x:box.x,y:box.y,width:box.width,height:box.height};
    };
    const back=document.querySelector('.reading-back'),backStyle=getComputedStyle(back);
    return {
      tabs:rect('.tabs'),
      back:rect('.reading-back'),
      category:rect('.reading-head span'),
      title:rect('.reading-head h2'),
      venue:rect('.reading-head p'),
      body:rect('.markdown-body > :first-child'),
      backStyle:{
        borderTopWidth:backStyle.borderTopWidth,
        backgroundColor:backStyle.backgroundColor,
        paddingLeft:backStyle.paddingLeft
      }
    };
  });
  assert.ok(readingLayout.back.y>=readingLayout.tabs.y+readingLayout.tabs.height, 'reading return link should sit directly below tabs');
  assert.ok(readingLayout.back.y-(readingLayout.tabs.y+readingLayout.tabs.height)<=18, 'reading detail has too much blank space after tabs');
  assert.ok(readingLayout.category.y>readingLayout.back.y, 'reading category should follow the return link');
  assert.ok(readingLayout.title.y>readingLayout.category.y, 'reading title should follow the category');
  assert.ok(readingLayout.venue.y>readingLayout.title.y, 'reading venue should follow the article title');
  assert.ok(readingLayout.body.y>readingLayout.venue.y, 'reading body should follow the venue');
  for(const [label,box] of [['back',readingLayout.back],['category',readingLayout.category],['title',readingLayout.title],['venue',readingLayout.venue],['body',readingLayout.body]]){
    assert.ok(Math.abs(box.x-readingLayout.tabs.x)<=1,`reading ${label} left edge should align with tabs`);
  }
  assert.equal(readingLayout.backStyle.borderTopWidth,'0px','reading return should render as a text link without stroke');
  assert.equal(readingLayout.backStyle.backgroundColor,'rgba(0, 0, 0, 0)','reading return should not use a filled button background');
  assert.equal(readingLayout.backStyle.paddingLeft,'0px','reading return should not keep button padding');
  assert.ok(await page.locator('.markdown-body h2').count()>0,'markdown headings should render');
  assert.ok(await page.locator('.markdown-body ul li').count()>0,'markdown lists should render');
  assert.ok(await page.locator('.markdown-body blockquote').count()>0,'markdown quotes should render');
  assert.ok(await page.locator('.markdown-body pre code').count()>0,'markdown code blocks should render');
  assert.ok(await page.locator('.markdown-body hr').count()>0,'markdown horizontal rules should render');
  assert.ok(await page.locator('.markdown-table-scroll table').count()>0,'markdown tables should render in scroll wrappers');
  assert.equal(await page.evaluate(()=>document.querySelector('.markdown-body script')===null),true,'markdown must not create script elements');
  await page.screenshot({path:join(root,'docs/evidence/reading-desktop.png'),fullPage:true});
  await page.locator('.reading-back').click();
  await page.locator('.reading-card').filter({hasText:'岳麓书院：千年学府与中国知识传统'}).click();
  await page.waitForSelector('.markdown-body table');
  assert.equal(await page.locator('.reading-head h2').textContent(),'岳麓书院：千年学府与中国知识传统');
  assert.equal(await page.locator('.reading-head p').textContent(),'岳麓书院');
  assert.ok(await page.getByText('宋代著名书院很多，“天下四大书院”的名单在不同文献和不同地方叙述中并不完全一致。').count()>0,'岳麓 article should include the corrected four-academies caveat');
  assert.ok(await page.getByText('两人讲学论道两月有余').count()>0,'岳麓 article should include the corrected 朱张会讲 duration');
  assert.ok(await page.getByText('古代书院 -> 近代学校 -> 现代大学').count()>0,'岳麓 article should render the ASCII transition line');
  assert.ok(await page.locator('.markdown-body strong').filter({hasText:'千年学府'}).count()>0,'markdown strong text should render inside the 岳麓 article');
  assert.ok(await page.locator('.markdown-table-scroll table').filter({hasText:'经世致用'}).count()>0,'岳麓 article tables should render');
  assert.ok(await page.getByText('资料说明').count()>0,'岳麓 article should include source notes');
  await page.locator('.reading-back').click();
  await juzizhouCard.click();
  await page.waitForSelector('.markdown-body table');
  assert.equal(await page.locator('.reading-head h2').textContent(),'橘子洲：湘江中的千年洲岛与长沙文化地标');
  assert.equal(await page.locator('.reading-head p').textContent(),'橘子洲');
  const juzizhouTables=page.locator('.markdown-table-scroll table');
  assert.deepEqual(await juzizhouTables.first().locator('th').evaluateAll(nodes=>nodes.map(n=>n.textContent)),['方向','现场景物','阅读提示'],'橘子洲 first table should render expected headers');
  assert.equal(await juzizhouTables.first().locator('tbody tr').nth(3).locator('td').nth(2).textContent(),'“北去”“争流”“中流”的动态感','橘子洲 first table should preserve the field-reading cue');
  assert.ok(await page.getByText('文本与注释核对来源：百度百科（访问日期 2026-08-04）').count()>0,'橘子洲 article should cite the checked Baidu source date');
  assert.ok(await page.locator('.markdown-body blockquote').filter({hasText:'谁主沉浮？'}).filter({hasText:'浪遏飞舟。'}).count()>0,'橘子洲 article should render complete upper and lower stanzas');
  assert.equal(await page.locator('.inline-note').count(),23,'橘子洲 poem should expose 23 inline annotation buttons');
  assert.equal(await page.locator('.inline-note-print li').count(),23,'print fallback should include all annotation notes');
  assert.equal(await page.locator('.inline-note').first().getAttribute('aria-expanded'),'false','annotation trigger should start collapsed');
  const firstNote=page.locator('.inline-note').filter({hasText:'沁园春'}).first();
  await firstNote.hover();
  await page.waitForSelector('.inline-note-tip:not([hidden])');
  assert.match(await page.locator('.inline-note-tip').textContent(),/词牌名/,'desktop hover should show the annotation tooltip');
  assert.equal(await firstNote.getAttribute('aria-expanded'),'true','hovered annotation should update aria-expanded');
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>document.querySelector('.inline-note-tip')?.hidden);
  assert.equal(await firstNote.getAttribute('aria-expanded'),'false','Escape should close the annotation tooltip');
  await firstNote.focus();
  await page.waitForSelector('.inline-note-tip:not([hidden])');
  await page.keyboard.press('Space');
  await page.waitForFunction(()=>document.querySelector('.inline-note-tip')?.hidden);
  await page.keyboard.press('Enter');
  await page.waitForSelector('.inline-note-tip:not([hidden])');
  const tipState=await page.evaluate(()=>{
    const tip=document.querySelector('.inline-note-tip'),btn=document.querySelector('.inline-note[aria-expanded="true"]'),r=tip.getBoundingClientRect();
    return {role:tip.getAttribute('role'),describedBy:btn.getAttribute('aria-describedby'),left:r.left,right:r.right,top:r.top,bottom:r.bottom,html:tip.innerHTML};
  });
  assert.equal(tipState.role,'tooltip','desktop annotation popup should use tooltip role');
  assert.equal(tipState.describedBy,'inline-note-tip','active note should point at the popup');
  assert.ok(tipState.left>=0&&tipState.right<=1440&&tipState.top>=0&&tipState.bottom<=1000,'annotation popup should stay inside the desktop viewport');
  assert.equal(tipState.html.includes('<script'),false,'annotation popup content must remain escaped');
  await page.mouse.click(12,12);
  await page.waitForFunction(()=>document.querySelector('.inline-note-tip')?.hidden);
  assert.notEqual(await page.evaluate(()=>getComputedStyle(document.querySelector('.inline-note-print')).display),'none','annotation notes should remain available as a print fallback');
  assert.equal(await page.getByText('contentReference').count(),0,'橘子洲 article should not contain contentReference residue');
  await page.locator('.reading-back').click();
  for(const [,file,title,...phrases] of newDefaultReadings){
    const card=page.locator('.reading-card').filter({hasText:title});
    await card.click();
    await page.waitForSelector('.markdown-body h2');
    assert.equal(await page.locator('.reading-head h2').textContent(),defaultReadingTitles.find(x=>x.startsWith(title))||title,`${file} should load through the reading UI`);
    assert.ok(await page.locator('.markdown-body').getByText('资料来源').count()>0,`${file} should render its source section`);
    assert.equal(await page.getByText('contentReference').count(),0,`${file} should not render contentReference residue`);
    const bodyText=await page.locator('.markdown-body').textContent();
    for(const phrase of phrases)assert.ok(bodyText.includes(phrase),`${file} should render ${phrase}`);
    await page.locator('.reading-back').click();
  }
  await page.close();
  await context.close();

  page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await page.goto(base);
  await page.locator('#tabs [data-tab="reading"]').click();
  const mobileReadingListLayout=await page.evaluate(()=>{
    const rect=selector=>{
      const box=document.querySelector(selector).getBoundingClientRect();
      return {x:box.x,y:box.y,width:box.width,height:box.height};
    };
    return {
      tabs:rect('.tabs'),
      firstCard:rect('.reading-card'),
      moduleBarDisplay:getComputedStyle(document.querySelector('.module-bar')).display,
      pageOverflow:document.documentElement.scrollWidth>document.documentElement.clientWidth
    };
  });
  assert.equal(mobileReadingListLayout.moduleBarDisplay,'none','mobile reading list should remove the duplicate 旅读 title');
  assert.ok(mobileReadingListLayout.firstCard.y-mobileReadingListLayout.tabs.y-mobileReadingListLayout.tabs.height<=10,'mobile reading list has too much blank space after tabs');
  assert.ok(Math.abs(mobileReadingListLayout.firstCard.x-mobileReadingListLayout.tabs.x)<=1,'mobile reading list cards should align with tabs');
  assert.equal(mobileReadingListLayout.pageOverflow,false,'mobile reading list should not overflow horizontally');
  await page.screenshot({path:join(root,'docs/evidence/reading-list-mobile.png'),fullPage:true});
  await page.locator('.reading-card').filter({hasText:'橘子洲：湘江中的千年洲岛与长沙文化地标'}).click();
  await page.waitForSelector('.markdown-body table');
  assert.equal(await page.locator('.reading-head h2').textContent(),'橘子洲：湘江中的千年洲岛与长沙文化地标','mobile reading detail should open the third Orange Isle article');
  assert.ok(await page.locator('.markdown-table-scroll table').filter({hasText:'现场景物'}).count()>0,'mobile 橘子洲 detail should render its table content');
  const mobileNote=page.locator('.inline-note').filter({hasText:'中流击水'}).first();
  await mobileNote.evaluate(button=>button.click());
  await page.waitForSelector('.inline-note-tip:not([hidden])');
  const mobileTip=await page.evaluate(()=>{
    const tip=document.querySelector('.inline-note-tip'),r=tip.getBoundingClientRect();
    return {role:tip.getAttribute('role'),text:tip.textContent,left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:innerWidth,height:innerHeight,expanded:document.querySelector('.inline-note[aria-expanded="true"]')?.textContent};
  });
  assert.equal(mobileTip.role,'dialog','mobile tap annotation popup should use dialog role');
  assert.match(mobileTip.text,/江心水深流急/,'mobile tap should show the target annotation');
  assert.equal(mobileTip.expanded,'中流击水','mobile tap should update aria-expanded on the target note');
  assert.ok(mobileTip.left>=0&&mobileTip.right<=mobileTip.width&&mobileTip.top>=0&&mobileTip.bottom<=mobileTip.height,`mobile annotation popup should stay inside the viewport: ${JSON.stringify(mobileTip)}`);
  await page.mouse.click(4,4);
  await page.waitForFunction(()=>document.querySelector('.inline-note-tip')?.hidden);
  await mobileNote.dispatchEvent('touchstart');
  await page.waitForTimeout(520);
  await page.waitForSelector('.inline-note-tip:not([hidden])');
  await page.locator('.inline-note-close').click();
  await page.waitForFunction(()=>document.querySelector('.inline-note-tip')?.hidden);
  const tableMetrics=await page.locator('.markdown-table-scroll').first().evaluate(el=>({scrollWidth:el.scrollWidth,clientWidth:el.clientWidth,pageOverflow:document.documentElement.scrollWidth>document.documentElement.clientWidth}));
  assert.ok(tableMetrics.scrollWidth>tableMetrics.clientWidth,'narrow 橘子洲 markdown tables should scroll inside their own wrapper');
  assert.equal(tableMetrics.pageOverflow,false,'橘子洲 reading page should not overflow horizontally on mobile');
  const mobileReadingLayout=await page.evaluate(()=>{
    const rect=selector=>{
      const box=document.querySelector(selector).getBoundingClientRect();
      return {x:box.x,y:box.y,width:box.width,height:box.height};
    };
    return {
      tabs:rect('.tabs'),
      back:rect('.reading-back'),
      category:rect('.reading-head span'),
      title:rect('.reading-head h2'),
      venue:rect('.reading-head p'),
      body:rect('.markdown-body > :first-child'),
      moduleBarDisplay:getComputedStyle(document.querySelector('.module-bar')).display
    };
  });
  assert.equal(mobileReadingLayout.moduleBarDisplay,'none','mobile reading detail should remove the duplicate 旅读 title');
  assert.ok(mobileReadingLayout.back.y-mobileReadingLayout.tabs.y-mobileReadingLayout.tabs.height<=14,'mobile reading detail has too much blank space after tabs');
  assert.ok(mobileReadingLayout.category.y>mobileReadingLayout.back.y&&mobileReadingLayout.title.y>mobileReadingLayout.category.y&&mobileReadingLayout.venue.y>mobileReadingLayout.title.y&&mobileReadingLayout.body.y>mobileReadingLayout.venue.y,'mobile reading detail order should be return, category, title, venue, body');
  for(const [label,box] of [['back',mobileReadingLayout.back],['category',mobileReadingLayout.category],['title',mobileReadingLayout.title],['venue',mobileReadingLayout.venue],['body',mobileReadingLayout.body]]){
    assert.ok(Math.abs(box.x-mobileReadingLayout.tabs.x)<=1,`mobile reading ${label} left edge should align with tabs`);
  }
  await page.screenshot({path:join(root,'docs/evidence/reading-mobile.png'),fullPage:true});
  await page.locator('.reading-back').click();
  await page.locator('.reading-card').filter({hasText:'张家界国家森林公园：石英砂岩峰林与世界自然遗产总览'}).click();
  await page.waitForSelector('.markdown-table-scroll table');
  const zhangjiajieTableMetrics=await page.locator('.markdown-table-scroll').first().evaluate(el=>({scrollWidth:el.scrollWidth,clientWidth:el.clientWidth,pageOverflow:document.documentElement.scrollWidth>document.documentElement.clientWidth}));
  assert.ok(zhangjiajieTableMetrics.scrollWidth>zhangjiajieTableMetrics.clientWidth,'narrow 张家界 markdown tables should scroll inside their own wrapper');
  assert.equal(zhangjiajieTableMetrics.pageOverflow,false,'张家界 reading page should not overflow horizontally on mobile');
  await page.close();

  page=await browser.newPage({viewport:{width:1024,height:800}});
  await page.goto(`${base}/share/${token}`);
  await page.waitForSelector('tr.today');
  await page.locator('#tabs [data-tab="bookings"]').click();
  const publicPhones=await page.locator('.booking-grid .table-block').last().locator('td[data-label="电话"] .cell-view').evaluateAll(nodes=>nodes.map(n=>n.textContent.trim()));
  assert.deepEqual(publicPhones,['139 **** 0000','186 **** 5057'],'public share should keep emergency phones masked');
  await page.close();
});

test('tickets render, edit, persist, clone, create and keep legacy tour hidden',async()=>{
  putBodies=[];
  let page=await browser.newPage({viewport:{width:1024,height:800}});
  await page.goto(base);
  await page.waitForSelector('tr.today');
  await page.locator('#tabs [data-tab="bookings"]').click();
  assert.deepEqual(await page.locator('.booking-grid .section-title h2').evaluateAll(nodes=>nodes.map(n=>n.textContent)),['交通','住宿','门票','紧急联系人']);
  assert.deepEqual(await page.locator('.transport-block th').evaluateAll(nodes=>nodes.map(n=>n.textContent)),['客运公司','航班/车次','座位号','日期','出发地','出发时间','目的地','抵达时间','预订号']);
  assert.deepEqual(await page.locator('.transport-block tbody tr').first().locator('td').evaluateAll(nodes=>nodes.map((n,index)=>[index,n.dataset.label,n.querySelector('.cell-view')?.textContent])),[[0,'客运公司','铁路（3张）'],[1,'航班/车次','G123 复制'],[2,'座位号','待填写'],[3,'日期','2026-08-03'],[4,'出发地','甲地'],[5,'出发时间','09:00'],[6,'目的地','乙地'],[7,'抵达时间','10:00'],[8,'预订号','BOOKING-20260803-ABC123']]);
  assert.equal(await page.locator('.transport-block tbody tr').count(),2,'transport rows must not be split by passenger seats');
  assert.equal(await page.locator('.transport-block tbody tr').nth(1).locator('td').count(),9,'each transport trip should keep exactly nine cells');
  assert.equal(await page.locator('.transport-block td[data-label="座位号"] .cell-view').nth(1).textContent(),'张三 二等座 01车01A号\n李四 二等座 01车01B号\n王五 二等座 01车01C号','multi-passenger seats should render as three lines inside one cell');
  assert.equal(await page.locator('.transport-block td[data-label="预订号"] .cell-view').nth(1).textContent(),'BOOKING-20260804-XYZ789','multi-passenger row should keep its full booking number');
  assert.equal(await page.locator('.transport-block td[data-label="客运公司"] .cell-view').first().textContent(),'铁路（3张）','paid copy should be stripped from carrier values');
  assert.equal(await page.locator('.transport-block td[data-label="座位号"] .cell-view').first().textContent(),'待填写','legacy transport rows should get a seat placeholder');
  assert.equal(await page.locator('.transport-block td[data-label="预订号"] .cell-view').first().textContent(),'BOOKING-20260803-ABC123','full booking number should render without masking');
  assert.equal(await page.getByText('已支付').count(),0,'transport should not render paid status text');
  assert.deepEqual(await page.locator('.booking-grid .table-block').nth(1).locator('th').evaluateAll(nodes=>nodes.map(n=>n.textContent)),['住宿','入住/离店','电话/邮箱','地址','房型','晚数','总成本']);
  assert.deepEqual(await page.locator('.booking-grid .table-block').nth(1).locator('tbody tr').first().locator('td').evaluateAll(nodes=>nodes.map((n,index)=>[index,n.dataset.label])),[[0,'住宿'],[1,'入住/离店'],[2,'电话/邮箱'],[3,'地址'],[4,'房型'],[5,'晚数'],[6,'总成本']]);
  assert.equal(await page.getByText('礼宾部').count(),0,'hotel concierge column should not render');
  assert.equal(await page.locator('.booking-grid .table-block').nth(1).locator('td[data-label="入住/离店"] .cell-view').first().textContent(),'入住 2026-08-03\n离店 待填写','legacy hotel row without checkout should render checkout as pending');
  assert.equal(await page.locator('.booking-grid .table-block').nth(1).locator('td[data-label="房型"] .cell-view').first().textContent(),'标准双床房','legacy room type prefix should be removed');
  assert.equal(await page.locator('.booking-grid .table-block').nth(1).locator('td[data-label="入住/离店"] .cell-view').nth(1).textContent(),'入住 2026-08-04\n离店 2026-08-06','object hotel rows should render explicit checkin and checkout');
  assert.equal(await page.locator('.booking-grid .table-block').nth(1).locator('td[data-label="晚数"] .cell-view').nth(1).textContent(),'2','object hotel nights should be calculated from checkout minus checkin');
  assert.equal(await page.getByText('旅行团').count(),0,'legacy tour section should be hidden on bookings');
  assert.equal(await page.getByText('旧旅行团备注保留但不展示').count(),0,'legacy tour data should not render');
  assert.equal(await page.locator('.tickets-block .cell-view').first().textContent(),document.trips[0].tickets[0][0]);

  await page.locator('summary[aria-label="更多操作"]').click();
  await page.getByRole('button',{name:'修改',exact:true}).click();
  assert.equal(await page.locator('.booking-grid .table-block').nth(1).locator('textarea[aria-label="离店日期"]').first().inputValue(),'','legacy hotel checkout should edit as empty instead of saving placeholder text');
  await page.locator('.transport-block textarea[aria-label="座位号"]').first().fill('03车 05A');
  await page.locator('.booking-grid .table-block').nth(1).locator('textarea[aria-label="离店日期"]').first().fill('2026-08-05');
  await page.locator('#tripMeta').focus();
  assert.equal(await page.locator('.booking-grid .table-block').nth(1).locator('textarea[aria-label="晚数"]').first().inputValue(),'2');
  await page.locator('.tickets-block textarea[aria-label="景点/项目"]').first().fill('取消门票');
  await page.locator('#tripMeta').focus();
  await page.getByRole('button',{name:'取消',exact:true}).click();
  await page.waitForFunction(()=>!document.body.classList.contains('editing'));
  assert.equal(await page.locator('.tickets-block .cell-view').first().textContent(),document.trips[0].tickets[0][0],'cancel should roll back ticket edits');
  assert.equal(await page.locator('.transport-block td[data-label="座位号"] .cell-view').first().textContent(),'待填写','cancel should roll back seat edits');
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('lvce-v1')).trips[0].tour),document.trips[0].tour,'cancel should not drop legacy tour data');

  await page.locator('summary[aria-label="更多操作"]').click();
  await page.getByRole('button',{name:'修改',exact:true}).click();
  await page.locator('.transport-block textarea[aria-label="座位号"]').first().fill('03车 05A');
  await page.locator('.booking-grid .table-block').nth(1).locator('textarea[aria-label="离店日期"]').first().fill('2026-08-05');
  await page.locator('#tripMeta').focus();
  await page.locator('.tickets-block .section-title button').click();
  let newRow=page.locator('.tickets-block tbody tr').last();
  const ticket=['夜游门票','2026-08-05','亲子票 19:30 场','3','李四 / VOUCHER-9','¥366','凭短信凭证换票'];
  for(const [i,label] of ['景点/项目','使用日期','票种/场次','数量','游客','订单金额','退改/临场提示'].entries())await newRow.locator(`textarea[aria-label="${label}"]`).fill(ticket[i]);
  await page.locator('#saveEdit').focus();
  await page.getByRole('button',{name:'保存',exact:true}).click();
  await page.getByText('修改已保存').waitFor();
  await page.waitForTimeout(850);
  assert.deepEqual(putBodies.at(-1).trips[0].transport[0],['铁路（3张）','G123','03车 05A','2026-08-03','甲地','09:00','乙地','10:00','BOOKING-20260803-ABC123'],'seat and full booking number should sync through the API document');
  assert.deepEqual(putBodies.at(-1).trips[0].hotels[0],['酒店','2026-08-03','2026-08-05','138 0000 0000','测试地址 1 号','标准双床房','2','¥1'],'saved hotel should permanently remove concierge, normalize room type and sync explicit checkout in the canonical schema');
  assert.deepEqual(putBodies.at(-1).trips[0].tickets.at(-1).slice(0,7),ticket,'saved ticket should sync through the API document');
  assert.deepEqual(putBodies.at(-1).trips[0].tour,document.trips[0].tour,'saving tickets should preserve legacy tour data');

  await page.locator('summary[aria-label="更多操作"]').click();
  await page.getByRole('button',{name:'修改',exact:true}).click();
  await page.locator('.tickets-block tbody tr').last().locator('.remove-row').click();
  await page.getByRole('button',{name:'保存',exact:true}).click();
  await page.getByText('修改已保存').waitFor();
  await page.waitForTimeout(850);
  assert.equal(putBodies.at(-1).trips[0].tickets.length,1,'deleted ticket row should be removed on save');

  await page.locator('summary[aria-label="更多操作"]').click();
  await page.getByRole('button',{name:'复制',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('#tripName').value.endsWith('副本'));
  assert.deepEqual(await page.evaluate(()=>{let s=JSON.parse(localStorage.getItem('lvce-v1')),t=s.trips.find(x=>x.id===s.active);return {transport:t.transport,tickets:t.tickets.map(row=>row.slice(0,7)),tour:t.tour}}),{transport:[['铁路（3张）','G123','03车 05A','2026-08-03','甲地','09:00','乙地','10:00','BOOKING-20260803-ABC123'],['铁路（3张）','G456','张三 二等座 01车01A号\n李四 二等座 01车01B号\n王五 二等座 01车01C号','2026-08-04','丙地','11:00','丁地','12:00','BOOKING-20260804-XYZ789']],tickets:document.trips[0].tickets,tour:document.trips[0].tour},'duplicate should retain migrated transport, tickets and legacy tour data');

  await page.locator('#newTrip').click();
  await page.locator('#newName').fill('无票新旅行');
  await page.getByRole('button',{name:'创建'}).click();
  await page.waitForFunction(()=>document.querySelector('#tripName').value==='无票新旅行');
  assert.deepEqual(await page.evaluate(()=>{let s=JSON.parse(localStorage.getItem('lvce-v1')),t=s.trips.find(x=>x.id===s.active);return {tickets:t.tickets,tour:t.tour}}),{tickets:[],tour:[]},'new trips should start with empty tickets and tour arrays');
  await page.close();

  page=await browser.newPage({viewport:{width:390,height:844}});
  await page.goto(base);
  await page.waitForSelector('tr.today');
  await page.locator('#tabs [data-tab="bookings"]').click();
  const mobileTicket=await page.locator('.tickets-block td[data-label="景点/项目"]').first().evaluate(el=>{
    const text=el.querySelector('.cell-view').getBoundingClientRect(),cell=el.getBoundingClientRect();
    return {height:text.height,width:text.width,cellWidth:cell.width,scrollWidth:el.scrollWidth,clientWidth:el.clientWidth};
  });
  assert.ok(mobileTicket.height>42,'long Chinese ticket name should wrap on mobile');
  assert.ok(mobileTicket.scrollWidth<=mobileTicket.clientWidth+1,'ticket cell should not overflow horizontally on mobile');
  await page.close();
});

test('share menu creates copied public URL and revoke requires confirmation',async()=>{
  sharedTrips.clear();
  publicTokens.clear();
  shareHtmlFallback=false;
  shareCounter=0;
  putBodies=[];
  let context=await browser.newContext({viewport:{width:1024,height:800}});
  await context.grantPermissions(['clipboard-read','clipboard-write'],{origin:base});
  let page=await context.newPage();
  let dialogs=[];
  page.on('dialog',async d=>{dialogs.push(d.message());await d.dismiss()});
  await page.goto(base);
  await page.waitForSelector('tr.today');
  await page.locator('summary[aria-label="更多操作"]').click();
  assert.equal(await page.locator('#shareTrip').textContent(),'分享','initial menu state should offer sharing');
  await page.locator('#shareTrip').click();
  await page.getByText('分享链接已复制').waitFor();
  const copied=await page.evaluate(()=>navigator.clipboard.readText());
  assert.match(copied,new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}/share/[A-Za-z0-9_-]{43}$`),'share should copy a public URL');
  assert.equal(sharedTrips.has('one'),true,'mock share state should be created');
  assert.equal(putBodies.length,0,'share metadata changes must not write the trip document when it is not dirty');
  assert.deepEqual(dialogs,[],'share metadata changes must not show trip version conflict dialogs');
  let publicPage=await context.newPage();
  await publicPage.goto(copied);
  await publicPage.waitForSelector('tr.today');
  assert.equal(await publicPage.locator('#tripName').inputValue(),'验收旅行','copied share URL should open without login');
  await publicPage.close();
  await page.locator('summary[aria-label="更多操作"]').click();
  assert.equal(await page.locator('#shareTrip').textContent(),'取消分享','shared menu state should switch to revoke');

  page.removeAllListeners('dialog');
  page.once('dialog',d=>{assert.match(d.message(),/旧链接将立即失效/);d.dismiss()});
  await page.locator('#shareTrip').click();
  assert.equal(sharedTrips.has('one'),true,'dismissed revoke confirmation should keep sharing active');
  await page.locator('summary[aria-label="更多操作"]').click();
  page.once('dialog',d=>d.accept());
  await page.locator('#shareTrip').click();
  await page.getByText('已取消分享').waitFor();
  assert.equal(sharedTrips.has('one'),false,'accepted revoke should remove sharing');
  await page.locator('summary[aria-label="更多操作"]').click();
  assert.equal(await page.locator('#shareTrip').textContent(),'分享','revoked menu state should switch back to share');
  publicPage=await context.newPage();
  await publicPage.goto(copied);
  await publicPage.getByText('分享已失效').waitFor();
  await publicPage.close();
  await context.close();
});

test('share API HTML fallback becomes concise Chinese toast',async()=>{
  sharedTrips.clear();
  publicTokens.clear();
  shareRequests=[];
  shareHtmlFallback=true;
  let context=await browser.newContext({viewport:{width:1024,height:800}});
  let page=await context.newPage();
  let consoleText=[];
  page.on('console',msg=>consoleText.push(msg.text()));
  await page.goto(base);
  await page.waitForSelector('tr.today');
  await page.locator('summary[aria-label="更多操作"]').click();
  await page.locator('#shareTrip').click();
  const text=await page.locator('#toast.show.failed').textContent();
  assert.match(text,/分享服务暂不可用，请刷新后重试/,'HTML fallback should be reported as a concise share API problem');
  assert.doesNotMatch(text,/Unexpected token|DOCTYPE|</,'HTML parser details must not leak to the toast');
  assert.equal(sharedTrips.has('one'),false,'HTML POST fallback must not create share state');
  assert.deepEqual(shareRequests.map(r=>r.method),['POST'],'POST fallback should issue only the intended share request');

  sharedTrips.add('one');
  await page.reload();
  await page.waitForSelector('tr.today');
  await page.locator('summary[aria-label="更多操作"]').click();
  assert.equal(await page.locator('#shareTrip').textContent(),'取消分享','reloaded mock should expose revoke state');
  page.once('dialog',d=>d.accept());
  await page.locator('#shareTrip').click();
  const deleteText=await page.locator('#toast.show.failed').textContent();
  assert.match(deleteText,/分享服务暂不可用，请刷新后重试/,'HTML DELETE fallback should use the same share service toast');
  assert.doesNotMatch(deleteText,/Unexpected token|DOCTYPE|</,'HTML parser details must not leak from DELETE fallback');
  assert.deepEqual(shareRequests.map(r=>r.method),['POST','DELETE'],'HTML fallback test should cover share POST and DELETE');
  assert.doesNotMatch(consoleText.join('\n'),/Unexpected token|<!DOCTYPE|<main>/,'console should avoid raw parser and HTML details');
  shareHtmlFallback=false;
  await context.close();
});

test('share creation stops when pending sync hits a version conflict',async()=>{
  sharedTrips.clear();
  publicTokens.clear();
  shareHtmlFallback=false;
  shareRequests=[];
  putBodies=[];
  syncConflictNext=true;
  let context=await browser.newContext({viewport:{width:1024,height:800}});
  let page=await context.newPage();
  page.once('dialog',d=>{assert.match(d.message(),/数据已在其他设备更新/);d.accept()});
  await page.goto(base);
  await page.waitForSelector('tr.today');
  putBodies=[];
  await page.locator('summary[aria-label="更多操作"]').click();
  await page.getByRole('button',{name:'修改',exact:true}).click();
  await page.locator('#tripName').fill('冲突旅行');
  await page.locator('#tripMeta').focus();
  await page.getByRole('button',{name:'保存',exact:true}).click();
  await page.getByText('修改已保存').waitFor();
  await page.locator('summary[aria-label="更多操作"]').click();
  await page.locator('#shareTrip').click();
  await page.getByText('数据已在其他设备更新，请刷新后重试').waitFor();
  assert.equal(putBodies.filter(body=>body.trips[0].name==='冲突旅行').length,1,'pending local edit should attempt one sync before share');
  assert.equal(shareRequests.length,0,'share POST must not run after sync conflict');
  assert.equal(sharedTrips.has('one'),false,'sync conflict must not create share state');
  await context.close();
});

async function assertEditActionAlignment(page,name){
  const metrics=await page.locator('.trip-actions').evaluate(el=>{
    const boxes=Array.from(el.children).map(child=>{
      const rect=(child.tagName==='DETAILS'?child.querySelector('summary'):child).getBoundingClientRect();
      return {left:rect.left,right:rect.right,centerY:rect.top+rect.height/2,height:rect.height};
    });
    return {
      centerDeltas:boxes.slice(1).map(box=>Math.abs(box.centerY-boxes[0].centerY)),
      gaps:boxes.slice(1).map((box,i)=>box.left-boxes[i].right),
      heights:boxes.map(box=>box.height)
    };
  });
  assert.ok(metrics.centerDeltas.every(delta=>delta<=1),`${name} edit actions do not share a visual baseline`);
  assert.ok(metrics.gaps.every(gap=>Math.abs(gap-7)<=1),`${name} edit action gaps are uneven`);
  assert.ok(metrics.heights.every(height=>Math.abs(height-metrics.heights.at(-1))<=2),`${name} edit actions have mismatched control heights`);
}

test('trip menu trigger hover and focus-visible feedback stays stable across desktop and narrow layouts',async()=>{
  for(const [name,viewport,compareNewTrip] of [['desktop',{width:1024,height:800},false],['narrow',{width:390,height:844},true]]){
    let page=await browser.newPage({viewport});
    await assertTripMenuFeedback(page,name,{compareNewTrip});
    await page.close();
  }
});

test('desktop new trip button is a lighter text action with stable hover and focus-visible states',async()=>{
  let page=await browser.newPage({viewport:{width:1440,height:1000}});
  await page.goto(base);
  await page.waitForSelector('tr.today');
  const newTrip=page.locator('.aside-title #newTrip');
  const green='rgb(53, 95, 86)';
  const lightBorder='rgb(203, 217, 212)';
  const white='rgb(255, 255, 255)';

  assert.equal(await newTrip.evaluate(el=>el.classList.contains('primary')),false,'desktop new trip button must not use primary styling');
  assert.equal(await newTrip.getAttribute('aria-label'),'新建','desktop new trip accessible name should be shortened');
  assert.equal(await newTrip.locator('.new-trip-label').textContent(),'新建','desktop new trip label should be visually shortened');
  assert.equal(await newTrip.locator('svg.new-trip-icon').count(),1,'desktop new trip needs an SVG plus icon');
  assert.match(await newTrip.locator('svg.new-trip-icon path').getAttribute('d'),/M12 5v14M5 12h14/,'desktop new trip plus icon should be geometric SVG strokes');
  assert.equal(await page.locator('#tripDialog h2').textContent(),'新建旅行','dialog title should remain unchanged');

  const before=await controlVisualState(newTrip);
  assert.equal(before.borderColor,lightBorder,'desktop new trip default border should be light');
  assert.equal(before.color,green,'desktop new trip default text should be green');
  assert.notEqual(before.backgroundColor,green,'desktop new trip default background should be lighter than primary');
  assert.ok(before.transitionProperty.includes('background-color')&&before.transitionProperty.includes('color'),'desktop new trip should transition color changes smoothly');

  await newTrip.hover();
  await page.waitForFunction(([selector,border,background,color])=>{
    const s=getComputedStyle(document.querySelector(selector));
    return s.borderColor===border&&s.backgroundColor===background&&s.color===color;
  },['.aside-title #newTrip',green,green,white]);
  const hover=await controlVisualState(newTrip);
  assert.equal(hover.borderColor,green,'desktop new trip hover border should deepen to green');
  assert.equal(hover.backgroundColor,green,'desktop new trip hover background should deepen to green');
  assert.equal(hover.color,white,'desktop new trip hover text should turn white');
  assertStableBox(before,hover,'desktop new trip hover');

  await page.mouse.move(0,0);
  await tabUntilFocused(page,'.aside-title #newTrip','desktop new trip button');
  await page.waitForFunction(([selector,border,background,color])=>{
    const s=getComputedStyle(document.querySelector(selector));
    return s.borderColor===border&&s.backgroundColor===background&&s.color===color;
  },['.aside-title #newTrip',green,green,white]);
  const focus=await controlVisualState(newTrip);
  assert.equal(focus.borderColor,green,'desktop new trip focus-visible border should deepen to green');
  assert.equal(focus.backgroundColor,green,'desktop new trip focus-visible background should deepen to green');
  assert.equal(focus.color,white,'desktop new trip focus-visible text should turn white');
  assertStableBox(before,focus,'desktop new trip focus-visible');
  await page.close();
});

test('packing category title editor has readable height without changing view mode density',async()=>{
  for(const [name,viewport,minEditHead,minEditInput] of [['desktop',{width:1024,height:800},56,40],['mobile',{width:390,height:844},58,42]]){
    let page=await browser.newPage({viewport});
    await page.goto(base);
    await page.locator('#tabs [data-tab="packing"]').click();
    const view=await categoryTitleMetrics(page);

    await page.locator('summary[aria-label="更多操作"]').click();
    await page.getByRole('button',{name:'修改',exact:true}).click();
    await page.waitForFunction(()=>document.body.classList.contains('editing'));
    const edit=await categoryTitleMetrics(page);
    await assertEditActionAlignment(page,name);

    assert.ok(edit.headHeight>=minEditHead,`${name} editing category header is too short`);
    assert.ok(edit.nameHeight>=minEditInput,`${name} editing category name input is too short`);
    assert.ok(edit.namePaddingY>=16,`${name} editing category name input needs more vertical padding`);
    assert.ok(edit.headHeight>=view.headHeight+10,`${name} editing category header did not grow from compact view mode`);
    assert.ok(edit.nameCenterDelta<=2,`${name} category name input is not vertically centered`);
    assert.ok(edit.removeCenterDelta<=2,`${name} remove category button is not vertically centered`);
    assert.ok(edit.firstItemGap>=-0.5,`${name} category header overlaps the first item`);
    assert.ok(view.headHeight<minEditHead,`${name} view mode category header should remain compact`);
    await page.close();
  }
});

test('new trip dialog cancel, escape and create flows',async()=>{
  let page=await browser.newPage({viewport:{width:1024,height:800}});
  await page.goto(base);
  await page.waitForSelector('tr.today');
  const tripCount=()=>page.locator('#tripList button').count();
  const initialCount=await tripCount();
  const dialogOpen=()=>page.locator('#tripDialog').evaluate(el=>el.open);

  await page.locator('#newTrip').click();
  await page.waitForFunction(()=>document.querySelector('#tripDialog')?.open);
  await page.getByRole('button',{name:'创建'}).click();
  assert.equal(await dialogOpen(),true,'empty required name should keep new trip dialog open');
  assert.equal(await tripCount(),initialCount,'invalid create should not add a trip');
  await page.getByRole('button',{name:'取消'}).click();
  await page.waitForFunction(()=>!document.querySelector('#tripDialog')?.open);
  assert.equal(await tripCount(),initialCount,'cancel should not add a trip');

  await page.locator('#newTrip').click();
  await page.waitForFunction(()=>document.querySelector('#tripDialog')?.open);
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>!document.querySelector('#tripDialog')?.open);
  assert.equal(await tripCount(),initialCount,'Escape should not add a trip');

  await page.locator('#newTrip').click();
  await page.waitForFunction(()=>document.querySelector('#tripDialog')?.open);
  await page.locator('#newName').fill('厦门秋游');
  await page.locator('#newMonth').fill('2026-10');
  await page.locator('#newPlace').fill('厦门');
  await page.getByRole('button',{name:'创建'}).click();
  await page.waitForFunction(()=>!document.querySelector('#tripDialog')?.open);
  assert.equal(await tripCount(),initialCount+1,'successful create should add a trip');
  assert.equal(await page.locator('#tripName').inputValue(),'厦门秋游');
  assert.equal(await page.locator('#tripMeta').inputValue(),'2026年10月 · 厦门');
  await page.close();
});

test('mobile itinerary and booking cell editors keep text readable',async()=>{
  let page=await browser.newPage({viewport:{width:390,height:844}});
  await page.goto(base);
  await page.waitForSelector('tr.today');
  await page.locator('summary[aria-label="更多操作"]').click();
  await page.getByRole('button',{name:'修改',exact:true}).click();
  await page.waitForFunction(()=>document.body.classList.contains('editing'));

  assert.equal(await page.locator('.itinerary-block textarea[aria-label="日期"]').count(),2,'editing should keep a date editor for every itinerary row');
  assert.equal(await page.locator('.itinerary-block textarea[aria-label="联系人"]').count(),0,'editing should not expose the itinerary contact field');
  const itineraryEditor=page.locator('.itinerary-block textarea[aria-label="活动"]').first();
  await assertReadableCellEditor(itineraryEditor,'mobile itinerary');
  await assertCellEditorAutogrows(itineraryEditor,'mobile itinerary');

  await page.locator('#tabs [data-tab="bookings"]').click();
  const bookingEditor=page.locator('.booking-grid textarea[aria-label="地址"]').first();
  await assertReadableCellEditor(bookingEditor,'mobile booking');
  await assertCellEditorAutogrows(bookingEditor,'mobile booking');
  await page.close();
});

test('booking textarea editors expand rows and cards without internal vertical scrolling',async()=>{
  putBodies=[];
  for(const [name,viewport] of [['desktop',{width:1024,height:800}],['mobile',{width:390,height:844}]]){
    const page=await browser.newPage({viewport});
    await page.goto(base);
    await page.waitForSelector('tr.today');
    await page.locator('#tabs [data-tab="bookings"]').click();
    await page.locator('summary[aria-label="更多操作"]').click();
    await page.getByRole('button',{name:'修改',exact:true}).click();
    await page.waitForFunction(()=>document.body.classList.contains('editing'));

    for(const label of ['航班/车次','座位号','日期','出发地']){
      await assertEditorRowAutogrows(page,page.locator(`.transport-block textarea[aria-label="${label}"]`).first(),`${name} transport ${label}`);
    }

    await assertEditorRowAutogrows(page,page.locator('.booking-grid textarea[aria-label="地址"]').first(),`${name} hotel address`);
    await page.close();
  }
  putBodies=[];
});

test('edit actions snapshot, cancel, save and trip switching',async()=>{
  putBodies=[];
  let page=await browser.newPage({viewport:{width:1024,height:800}});
  await page.goto(base);
  await page.waitForSelector('tr.today');
  assert.equal(await page.locator('#cancelEdit').evaluate(el=>getComputedStyle(el).display),'none','cancel should only show while editing');
  assert.equal(await page.locator('#saveEdit').evaluate(el=>getComputedStyle(el).display),'none','save should only show while editing');

  await page.locator('summary[aria-label="更多操作"]').click();
  await page.getByRole('button',{name:'修改',exact:true}).click();
  await page.waitForFunction(()=>document.body.classList.contains('editing'));
  assert.equal(await page.locator('.module-bar button').count(),0,'module bar must not contain the old save entry');
  assert.deepEqual(await page.locator('.trip-actions').evaluate(el=>Array.from(el.children).map(n=>n.id||n.tagName)),['cancelEdit','saveEdit','DETAILS'],'edit actions must be ordered cancel, save, menu');
  assert.notEqual(await page.locator('#cancelEdit').evaluate(el=>getComputedStyle(el).display),'none','cancel is hidden while editing');
  assert.notEqual(await page.locator('#saveEdit').evaluate(el=>getComputedStyle(el).display),'none','save is hidden while editing');
  await assertEditActionAlignment(page,'desktop');
  await assertDesktopActionRightAlignment(page,'desktop editing');

  await page.locator('#tripName').fill('临时旅行');
  await page.locator('#tripMeta').focus();
  assert.match(await page.locator('#tripList button.active').textContent(),/临时旅行/,'editing should update the visible trip copy');
  await page.waitForTimeout(850);
  assert.equal(putBodies.length,0,'editing changes should not sync before save');
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('lvce-v1')).trips[0].name),'验收旅行','editing changes should not persist to localStorage before save');
  await page.getByRole('button',{name:'取消',exact:true}).click();
  await page.waitForFunction(()=>!document.body.classList.contains('editing'));
  assert.equal(await page.locator('#tripName').inputValue(),'验收旅行','cancel should restore the edit snapshot');

  await page.locator('summary[aria-label="更多操作"]').click();
  await page.getByRole('button',{name:'修改',exact:true}).click();
  await page.locator('#tripName').fill('保存旅行');
  await page.locator('#tripMeta').focus();
  await page.getByRole('button',{name:'保存',exact:true}).click();
  await page.getByText('修改已保存').waitFor();
  await page.waitForTimeout(850);
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('lvce-v1')).trips[0].name),'保存旅行','save should persist current edits');
  assert.equal(putBodies.at(-1).trips[0].name,'保存旅行','save should sync current edits');

  await page.locator('summary[aria-label="更多操作"]').click();
  await page.getByRole('button',{name:'修改',exact:true}).click();
  await page.locator('#tripName').fill('切换未保存');
  await page.locator('#tripMeta').focus();
  page.once('dialog',d=>{assert.match(d.message(),/放弃本轮未保存修改/);d.dismiss()});
  await page.getByRole('button',{name:/可删除旅行/}).click();
  assert.equal(await page.locator('#tripName').inputValue(),'切换未保存','dismissed switch should keep the current edit session');
  page.once('dialog',d=>d.accept());
  await page.getByRole('button',{name:/可删除旅行/}).click();
  await page.waitForFunction(()=>!document.body.classList.contains('editing'));
  assert.equal(await page.locator('#tripName').inputValue(),'可删除旅行','accepted switch should move to the selected trip');
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('lvce-v1')).trips[0].name),'保存旅行','accepted switch should restore the pre-switch snapshot before persisting active trip');
  await page.close();
});

test('desktop/mobile UX, delete guard, current day and copy feedback',async()=>{
  for(const [name,viewport] of [['desktop',{width:1440,height:1000}],['tablet',{width:768,height:900}],['mobile',{width:390,height:844}]]){
    let context=await browser.newContext({viewport});
    await context.grantPermissions(['clipboard-read','clipboard-write'],{origin:base});
    let page=await context.newPage();
    await page.goto(base);
    await page.waitForSelector('tr.today');
    assert.equal(await page.locator('tr.today').count(),1);
    assert.equal(await page.locator('#logout .logout-icon').count(),1,'logout icon is missing');
    assert.equal(await page.locator('.aside-title #newTrip').evaluate(el=>getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden'),true,`${name} new trip action is not visible`);
    assert.equal(await page.locator('.trip-actions').count(),1,'active trip menu must appear once');
    assert.equal(await page.locator('.trip-actions .menu-panel #newTrip').count(),0,'new trip must not be inside active trip menu');
    await assertProgressHidden(page,`${name} itinerary`);
    await page.locator('summary[aria-label="更多操作"]').click();
    assert.equal(await page.locator('.trip-actions .menu-panel button').evaluateAll(nodes=>nodes.map(n=>n.textContent.trim()).join('|')),'修改|复制|分享|删除','active trip menu actions are incorrect');
    assert.equal(await page.locator('.trip-actions .menu-panel button svg').count(),4,'each active trip menu action needs an icon');
    await assertMenuDotsGeometry(page,name);
    const menuBox=await page.locator('.trip-actions .menu-panel').boundingBox(),summaryBox=await page.locator('.trip-actions summary').boundingBox(),viewportSize=page.viewportSize();
    assert.ok(menuBox&&summaryBox,'active trip menu is not visible');
    assert.equal(menuBox.x+menuBox.width<=viewportSize.width,true,`${name} menu overflows viewport`);
    if(viewport.width>680){
      const toolbarBox=await page.locator('.desktop-toolbar').boundingBox();
      assert.ok(toolbarBox,'desktop/tablet detail header toolbar is missing');
      assert.equal(await page.locator('.desktop-toolbar .trip-actions').count(),1,`${name} active trip menu is not in the detail toolbar`);
      assert.equal(await page.locator('.trip-switcher .trip-actions').count(),0,`${name} active trip menu stayed in the trip switcher`);
      assert.ok(summaryBox.y>=toolbarBox.y&&summaryBox.y<=toolbarBox.y+toolbarBox.height,`${name} menu trigger is not aligned to the detail header`);
      assert.ok(summaryBox.x>=toolbarBox.x+toolbarBox.width/2,`${name} menu trigger is not in the detail header right side`);
      assert.ok(menuBox.x>=toolbarBox.x+toolbarBox.width/2,`${name} menu panel is not in the detail header right side`);
      await assertDesktopActionRightAlignment(page,name);
    }else{
      const tripBox=await page.locator('.trip-switcher nav button.active').boundingBox(),switcherBox=await page.locator('.trip-switcher').boundingBox(),tabsBox=await page.locator('.tabs').boundingBox(),workspaceBox=await page.locator('.workspace').boundingBox();
      assert.equal(await page.locator('.trip-switcher .trip-actions').count(),1,`${name} active trip menu is not in the trip switcher`);
      assert.equal(await page.locator('.desktop-toolbar').boundingBox(),null,'mobile detail toolbar creates a standalone action row');
      assert.ok(tripBox&&switcherBox&&tabsBox&&workspaceBox,'mobile compact trip header is incomplete');
      assert.ok(summaryBox.x>=tripBox.x+tripBox.width-summaryBox.width-12&&summaryBox.x+summaryBox.width<=tripBox.x+tripBox.width,`${name} trip actions are not inside the active trip card right edge`);
      assert.ok(summaryBox.y>=tripBox.y&&summaryBox.y+summaryBox.height<=tripBox.y+tripBox.height,`${name} trip actions are not inside the active trip card`);
      await assertMobileTripMenuGaps(page,name);
      assert.ok(switcherBox.height-tripBox.height<=2,`${name} trip actions create a standalone row in the switcher`);
      assert.ok(tabsBox.y-workspaceBox.y<=1,`${name} trip actions create blank space before tabs`);
    }
    await page.locator('summary[aria-label="更多操作"]').click();
    await assertTripMenuDismissal(page,name);
    assert.equal(await page.locator('.itinerary-block .section-title h2').evaluate(el=>getComputedStyle(el).display),'none','redundant itinerary heading is visible');
    assert.equal(await page.locator('.itinerary-day-row').count(),0,'itinerary must not render synthetic day header rows');
    assert.deepEqual(await page.locator('.itinerary-block thead th').evaluateAll(nodes=>nodes.map(n=>n.textContent.trim())),['日期','时间','活动','位置','备注'],'itinerary should only show the requested five columns');
    assert.equal(await page.locator('.itinerary-block [data-label="联系人"]').count(),0,'itinerary contact column must not be rendered');
    assert.equal(await page.locator('.itinerary-block tbody tr').first().locator('td').count(),5,'first itinerary row should render five cells');
    if(viewport.width>680){
      assert.equal(await page.locator('.itinerary-date-cell').first().evaluate(el=>el.rowSpan),2,'desktop itinerary date cell should merge same-day rows with rowspan');
      assert.equal(await page.locator('.itinerary-block tbody tr').nth(1).locator('td[data-label="日期"]').evaluateAll(nodes=>nodes.filter(el=>getComputedStyle(el).display!=='none').length),0,'desktop repeated date cell should stay hidden after rowspan');
      assert.equal(await page.locator('.itinerary-block tbody tr').nth(1).locator('td.mobile-itinerary-date-cell').evaluate(el=>getComputedStyle(el).display),'none','desktop mobile-only date cell must not break rowspan rendering');
      if(name==='desktop')await page.screenshot({path:join(root,'docs/evidence','local-itinerary-responsive-date-desktop-20260804.png'),fullPage:true});
    }else{
      assert.equal(await page.locator('.itinerary-block tbody tr').nth(0).locator('td[data-label="日期"]').count(),1,'mobile first same-day card should show the date');
      assert.equal(await page.locator('.itinerary-block tbody tr').nth(1).locator('td[data-label="日期"]').count(),1,'mobile repeated same-day card should repeat the full date');
      assert.deepEqual(await page.locator('.itinerary-block tbody tr').evaluateAll(rows=>rows.slice(0,2).map(row=>row.querySelector('td[data-label="日期"] .cell-view')?.textContent.trim())),[today,today],'mobile same-day itinerary cards should each include the full date');
      await page.screenshot({path:join(root,'docs/evidence','local-itinerary-responsive-date-mobile-20260804.png'),fullPage:true});
    }
    await page.locator('summary[aria-label="更多操作"]').click();
    await page.locator('#editTrip').click();
    assert.equal(await page.locator('.itinerary-block .mobile-itinerary-date-cell').count(),0,'editing itinerary should not render duplicate mobile-only date cells');
    assert.equal(await page.locator('.itinerary-block textarea[aria-label="联系人"]').count(),0,'editing itinerary must not expose contact editors');
    assert.equal(await page.locator('.itinerary-block textarea[aria-label="日期"]').count(),2,'editing itinerary should keep one clear date editor per itinerary row');
    assert.equal(await page.locator('.itinerary-block textarea[aria-label="备注"]').first().inputValue(),'备注','itinerary notes editor must use row index 5');
    await page.locator('.itinerary-block .section-title button').evaluate(button=>button.click());
    await page.locator('#saveEdit').click();
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('lvce-v1')).trips[0].itinerary.at(-1).length),6,'new itinerary rows must retain the six-field storage shape');
    await page.locator('#tabs [data-tab="bookings"]').click();
    await assertProgressHidden(page,`${name} bookings`);
    let copy=page.locator('.transport-block tbody tr').first().getByRole('button',{name:'复制航班/车次'});
    await copy.click();
    assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),'G123');
    await page.getByText('已复制到剪贴板').waitFor();
    await page.locator('#tabs [data-tab="packing"]').click();
    await assertProgressVisible(page,name);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth),true,`${name} has page-level horizontal overflow`);
    if(name==='mobile'){
      assert.equal(await page.locator('.column-head').first().evaluate(el=>getComputedStyle(el).display),'none');
      assert.equal(await page.locator('.mobile-check').first().evaluate(el=>getComputedStyle(el).display),'block');
      assert.equal(await page.locator('.item-qty').first().textContent(),'×1');
      assert.equal(await page.locator('aside').evaluate(el=>getComputedStyle(el).overflowY),'visible','trip switcher creates nested scrolling');
      const tabsBox=await page.locator('.tabs').boundingBox(),progressBox=await page.locator('.progress').boundingBox();
      assert.ok(tabsBox&&progressBox&&progressBox.y>tabsBox.y+tabsBox.height,'packing progress must follow tabs');
      await page.locator('#toast').evaluate(el=>el.className='');
      await page.screenshot({path:join(root,'docs/evidence/ux-mobile-packing.png'),fullPage:true});
    }
    if(name!=="tablet")await page.screenshot({path:join(root,`docs/evidence/ux-${name}.png`),fullPage:true});
    await context.close();
  }
  let page=await browser.newPage();
  await page.goto(base);
  await page.getByRole('button',{name:/可删除旅行/}).click();
  await page.locator('summary[aria-label="更多操作"]').click();
  await page.getByRole('button',{name:'删除',exact:true}).click();
  await page.getByText('此操作无法撤销').waitFor();
  await page.getByRole('button',{name:'永久删除'}).click();
  await page.getByText('旅行已删除').waitFor();
  assert.equal(await page.getByRole('button',{name:/可删除旅行/}).count(),0);
  page.once('dialog',d=>{assert.match(d.message(),/唯一一份旅行/);d.accept()});
  await page.locator('summary[aria-label="更多操作"]').click();
  await page.getByRole('button',{name:'删除',exact:true}).click();
});

async function pageWithMockedNow(iso,viewport={width:1024,height:800}){
  const page=await browser.newPage({viewport});
  await page.addInitScript(value=>{
    const fixed=Date.parse(value),RealDate=Date;
    class MockDate extends RealDate{
      constructor(...args){super(...(args.length?args:[fixed]))}
      static now(){return fixed}
      static parse(value){return RealDate.parse(value)}
      static UTC(...args){return RealDate.UTC(...args)}
    }
    Object.setPrototypeOf(MockDate,RealDate);
    window.Date=MockDate;
  },iso);
  return page;
}

async function assertSingleNextItinerary(page,activity){
  await page.waitForSelector('tr.next-itinerary');
  assert.equal(await page.locator('tr.next-itinerary').count(),1,'only one row should be marked as the next itinerary item');
  assert.equal(await page.locator('tr.today').count(),1,'legacy today class should only remain on the next itinerary row');
  assert.equal(await page.locator('tr.next-itinerary').locator('td.itinerary-date-cell.next-itinerary').count(),0,'date rowspan cell must not carry the next class');
  assert.equal(await page.locator('tr.next-itinerary td[data-label="活动"] .cell-view').textContent(),activity);
}

test('itinerary next-item highlight follows Asia/Shanghai time without coloring the rowspan date cell',async()=>{
  const oldItinerary=structuredClone(document.trips[0].itinerary),oldTab=document.tab;
  document.tab='itinerary';
  document.trips[0].itinerary=[
    ['2026-08-04','09:00-09:20','第一项','地点A','联系人','备注A'],
    ['2026-08-04','10:00-10:20','第二项','地点B','联系人','备注B'],
    ['2026-08-04','白天','同日模糊项','地点C','联系人','不应抢在明确未来时刻前'],
    ['2026-08-05','08:00-08:30','未来首项','地点D','联系人','备注D']
  ];
  try{
    let page=await pageWithMockedNow('2026-08-04T00:30:00.000Z');
    await page.goto(base);
    await assertSingleNextItinerary(page,'第一项');
    await page.locator('summary[aria-label="更多操作"]').click();
    await page.getByRole('button',{name:'修改',exact:true}).click();
    assert.equal(await page.locator('tr.next-itinerary,tr.today').count(),0,'edit mode must not show or mark the next itinerary item');
    assert.equal(await page.getByText('下一程').count(),0,'edit mode must not expose a next-itinerary label');
    assert.equal(await page.getByText('下一件').count(),0,'old next-itinerary label must not be exposed');
    await page.getByRole('button',{name:'取消',exact:true}).click();
    await assertSingleNextItinerary(page,'第一项');
    assert.equal(await page.locator('tr.next-itinerary[aria-label="下一程"]').count(),1,'next itinerary row should use the updated accessible label');
    assert.equal(await page.getByText('下一件').count(),0,'old next-itinerary label must not be exposed after leaving edit mode');
    let colors=await page.evaluate(()=>{
      const date=document.querySelector('td.itinerary-date-cell'),time=document.querySelector('tr.next-itinerary td[data-label="时间"]');
      return {date:getComputedStyle(date).backgroundColor,time:getComputedStyle(time).backgroundColor,rowspan:date.rowSpan};
    });
    assert.equal(colors.rowspan,3,'same-day date cell should remain merged with rowspan');
    assert.notEqual(colors.date,'rgb(255, 247, 215)','date rowspan cell should not use the desktop yellow highlight');
    assert.equal(colors.time,'rgb(255, 247, 215)','time cell should receive the desktop yellow highlight');
    await page.close();

    page=await pageWithMockedNow('2026-08-04T01:30:00.000Z');
    await page.goto(base);
    await assertSingleNextItinerary(page,'第二项');
    await page.close();

    page=await pageWithMockedNow('2026-08-04T15:00:00.000Z');
    await page.goto(base);
    await assertSingleNextItinerary(page,'未来首项');
    await page.close();
  }finally{
    document.trips[0].itinerary=oldItinerary;
    document.tab=oldTab;
  }
});

test('editing tables put delete actions in a centered no-wrap operation column on desktop and mobile',async()=>{
  const oldTab=document.tab;
  document.tab='bookings';
  try{
    for(const viewport of [{width:1024,height:800},{width:390,height:844}]){
      const page=await browser.newPage({viewport});
      await page.goto(base);
      await page.locator('summary[aria-label="更多操作"]').click();
      await page.getByRole('button',{name:'修改',exact:true}).click();
      const row=page.locator('.tickets-block tbody tr').first(),action=row.locator('td.row-action'),button=action.locator('.remove-row');
      assert.equal(await page.locator('.tickets-block th.row-action-head').textContent(),'操作');
      assert.equal(await action.getAttribute('data-label'),'操作');
      assert.equal(await row.locator('td[data-label="使用说明"] .remove-row').count(),0,'delete action should not remain inside the notes cell');
      const metrics=await button.evaluate(btn=>{
        const cell=btn.closest('td'),br=btn.getBoundingClientRect(),cr=cell.getBoundingClientRect(),vw=document.documentElement.clientWidth;
        return {
          buttonWhiteSpace:getComputedStyle(btn).whiteSpace,
          cellWhiteSpace:getComputedStyle(cell).whiteSpace,
          centerDelta:Math.abs((br.left+br.width/2)-(cr.left+cr.width/2)),
          overflowsViewport:br.left<0||br.right>vw,
          wraps:br.height>32
        };
      });
      assert.equal(metrics.buttonWhiteSpace,'nowrap','delete button text should stay on one line');
      assert.equal(metrics.cellWhiteSpace,'nowrap','operation cell should prevent wrapping');
      assert.ok(metrics.centerDelta<=2,'delete button should be horizontally centered in the operation cell');
      assert.equal(metrics.overflowsViewport,false,'delete button should fit inside the viewport');
      assert.equal(metrics.wraps,false,'delete button should remain a single-line control');
      await page.close();
    }
  }finally{
    document.tab=oldTab;
  }
});

test('xiangxingji August 4 itinerary keeps taxi legs plus Orange Isle evening span',async()=>{
  const oldItinerary=structuredClone(document.trips[0].itinerary),oldTab=document.tab;
  document.tab='itinerary';
  document.trips[0].itinerary=[
    ['2026-08-04','09:00-13:01','G225 上海虹桥→长沙南','上海虹桥／长沙南','胡丽霞','铁路（3张）；预订号 E207924155；13:01抵达长沙南'],
    ['2026-08-04','预计 13:15-13:30','长沙南打车前往长沙IFS国金中心·异国印象酒店(五一广场店)','长沙南→湘江中路2段18号','胡丽霞','预计打车约15分钟，视路况；到店寄存/入住衔接，酒店订单信息以订单为准'],
    ['2026-08-04','预计 14:10-14:35','从酒店打车前往岳麓山+岳麓书院讲解集合点','湘江中路2段18号→岳麓山/岳麓书院讲解集合点','胡丽霞','预计打车约25分钟，视路况；集合点以订单为准'],
    ['2026-08-04','15:00-预计17:00','岳麓山+岳麓书院讲解','岳麓山／岳麓书院','胡丽霞','15:00为订单场次，结束时间为预计；门票 ¥224；1份；预订成功；使用说明以订单详情页为准'],
    ['2026-08-04','预计 17:00-18:30','岳麓山/岳麓书院讲解结束后前往橘子洲并晚餐衔接','岳麓山／岳麓书院→橘子洲','胡丽霞','预留讲解结束后的市内交通与晚餐衔接，实际以路况、景区入口和餐厅安排为准'],
    ['2026-08-04','预计 18:30-21:00','橘子洲晚间游览','橘子洲','胡丽霞','今晚 2026-08-04 前往橘子洲；预计晚间时段，待现场开放与交通确认；不声称预约已确认'],
    ['2026-08-05','09:00集合；09:30-约11:00','湖南省博物馆马王堆基本陈列馆1.5小时深度讲解（含门票代预约）','湖南省博物馆','胡丽霞','09:30场；共4人（亲子票1大1小×2份）；09:00馆外集合；4人凭身份证；订单号登录后可见；限制以订单详情和馆方要求为准']
  ];
  assert.ok(document.trips[0].itinerary.some(row=>row[0]==='2026-08-04'&&row.join('').includes('橘子洲')),'2026-08-04 itinerary data must include Orange Isle');
  assert.equal(document.trips[0].itinerary.some(row=>row[0]==='2026-08-05'&&row.join('').includes('橘子洲')),false,'2026-08-05 itinerary data must not include Orange Isle');
  try{
    let page=await browser.newPage({viewport:{width:1024,height:800}});
    await page.goto(base);
    assert.equal(await page.locator('.itinerary-date-cell').first().evaluate(el=>el.rowSpan),6,'2026-08-04 date cell must span rail, taxi, Yuelu and Orange Isle rows');
    assert.deepEqual(await page.locator('.itinerary-block tbody tr').evaluateAll(rows=>rows.slice(0,6).map(row=>row.querySelector('td[data-label="时间"] .cell-view')?.textContent.trim())),['09:00-13:01','预计 13:15-13:30','预计 14:10-14:35','15:00-预计17:00','预计 17:00-18:30','预计 18:30-21:00']);
    assert.deepEqual(await page.locator('.itinerary-block tbody tr').evaluateAll(rows=>rows.slice(0,6).map(row=>row.querySelector('td[data-label="活动"] .cell-view')?.textContent.trim())),[
      'G225 上海虹桥→长沙南',
      '长沙南打车前往长沙IFS国金中心·异国印象酒店(五一广场店)',
      '从酒店打车前往岳麓山+岳麓书院讲解集合点',
      '岳麓山+岳麓书院讲解',
      '岳麓山/岳麓书院讲解结束后前往橘子洲并晚餐衔接',
      '橘子洲晚间游览'
    ],'2026-08-04 itinerary must keep rail arrival, taxi legs, Yuelu tour and Orange Isle evening in order');
    assert.equal(await page.locator('.itinerary-block tbody tr').nth(6).locator('td[data-label="活动"] .cell-view').textContent(),'湖南省博物馆马王堆基本陈列馆1.5小时深度讲解（含门票代预约）');
    await page.close();
    page=await browser.newPage({viewport:{width:390,height:844}});
    await page.goto(base);
    assert.deepEqual(await page.locator('.itinerary-block tbody tr').evaluateAll(rows=>rows.map(row=>row.querySelector('td[data-label="日期"] .cell-view')?.textContent.trim())),['2026-08-04','2026-08-04','2026-08-04','2026-08-04','2026-08-04','2026-08-04','2026-08-05'],'mobile itinerary cards should repeat same-day dates and keep the next date distinct');
    await page.screenshot({path:join(root,'docs/evidence','local-xiangxingji-responsive-dates-mobile-20260804.png'),fullPage:true});
    await page.close();
  }finally{
    document.trips[0].itinerary=oldItinerary;
    document.tab=oldTab;
  }
});

test('A4 landscape print PDF stays within printable page',async()=>{let page=await browser.newPage({viewport:{width:1440,height:1000}});await page.goto(base);for(const [tab,label] of [['itinerary','行程'],['bookings','预订与联系人'],['packing','装箱清单']]){await page.locator(`#tabs [data-tab="${tab}"]`).click();let file=join(root,`docs/evidence/print-${label}.pdf`);await page.pdf({path:file,format:'A4',landscape:true,printBackground:true,preferCSSPageSize:true});let pdf=await PDFDocument.load(await readFile(file));assert.ok(pdf.getPageCount()>=1);for(const p of pdf.getPages()){let {width,height}=p.getSize();assert.ok(width>height);assert.ok(Math.abs(width-841.89)<3&&Math.abs(height-595.28)<3)}}});
