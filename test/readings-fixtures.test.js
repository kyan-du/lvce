import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {join} from 'node:path';

const root=new URL('..',import.meta.url).pathname;
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
  ['yuelu-mountain','岳麓山','麓山寺','爱晚亭'],
  ['zhangjiajie-forest-overview','张家界国家森林公园','石英砂岩峰林','世界自然遗产'],
  ['yuanjiajie-bailong-tianzishan','袁家界、百龙天梯与天子山','峰林地貌','百龙天梯'],
  ['jinbianxi','金鞭溪','峡谷溪流生态','金鞭岩'],
  ['tianmen-mountain','天门山','天门洞','索道'],
  ['mengdong-river-furong-town','猛洞河与芙蓉镇','区域背景','不声称行程已经安排芙蓉镇游览'],
  ['kaifu-temple','开福寺','长沙佛教史','参观礼仪']
];

test('Orange Isle reading contains checked full Qinyuanchun text and annotation data',async()=>{
  const markdown=await readFile(join(root,'test/fixtures/readings/juzizhou.md'),'utf8');
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

test('default reading registry follows itinerary order without static markdown sources',async()=>{
  const app=await readFile(join(root,'app.js'),'utf8');
  const registry=Function(`return ${app.match(/const defaultReadings=(\[.*?\]);/s)[1]}`)();
  assert.equal(registry.length,10,'湘行记 should expose ten default readings after adding the remaining real sights');
  assert.deepEqual(registry.map(reading=>reading.title),defaultReadingTitles,'default readings should follow the trip order');
  assert.equal(registry.every(reading=>!reading.source),true,'catalog cards must not keep static markdown paths after D1 write-back');
  for(const [id,...phrases] of newDefaultReadings){
    const reading=registry.find(item=>item.id===id);
    assert.ok(reading,`${id} should be registered`);
    const md=await readFile(join(root,'test/fixtures/readings',`${id}.md`),'utf8');
    assert.match(md,new RegExp(`^# ${phrases[0].replace(/[.*+?^${}()|[\\]\\\\]/g,'\\\\$&')}`),`${id} should start with its key title`);
    assert.match(md,/## 资料来源/,`${id} should include a source section`);
    assert.doesNotMatch(md,/contentReference/,`${id} should not contain contentReference residue`);
    for(const phrase of phrases)assert.ok(md.includes(phrase),`${id} should mention ${phrase}`);
  }
  assert.equal(existsSync(join(root,'assets/readings')),false,'static reading markdown must be removed after API write-back');
});
