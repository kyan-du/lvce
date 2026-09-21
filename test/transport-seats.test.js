import test from 'node:test';
import assert from 'node:assert/strict';
import {formatSeatPassengers} from '../lib/transport-seats.js';

test('qiantang 12306 lines collapse to name and carriage seat',()=>{
  const rows=formatSeatPassengers('杜明远 儿童票 靠窗 二等座 14车05A ¥23 5折；杜万 成人票 靠窗 二等座 14车04A ¥45；杜暄妍 儿童票 过道 二等座 14车05C ¥23 5折；胡丽霞 成人票 靠窗 二等座 14车01F');
  assert.deepEqual(rows.map(r=>r.summary),['杜明远 14车05A','杜万 14车04A','杜暄妍 14车05C','胡丽霞 14车01F']);
  assert.equal(rows[0].detail,'杜明远 儿童票 靠窗 二等座 14车05A ¥23 5折');
  assert.equal(rows[3].detail,'胡丽霞 成人票 靠窗 二等座 14车01F');
});

test('zhangjiajie semicolon seats keep one trip as several underlined summaries',()=>{
  const rows=formatSeatPassengers('张三 二等座 01车01A号；李四 二等座 01车01B号；王五 二等座 01车01C号');
  assert.deepEqual(rows.map(r=>r.summary),['张三 01车01A','李四 01车01B','王五 01车01C']);
  assert.equal(rows[1].detail,'李四 二等座 01车01B号');
});

test('seat-only and empty values stay usable',()=>{
  assert.deepEqual(formatSeatPassengers(''),[]);
  assert.deepEqual(formatSeatPassengers('待填写'),[]);
  assert.deepEqual(formatSeatPassengers('03车 05A'),[{summary:'03车05A',detail:'03车 05A'}]);
});

test('unparsed 12306 leftovers keep the full line as the label',()=>{
  const rows=formatSeatPassengers('列车补票 EBZ6054772；上饶至杭州东；二等座无座；补差价 ¥179');
  assert.deepEqual(rows.map(r=>r.summary),['列车补票 EBZ6054772','上饶至杭州东','二等座无座','补差价 ¥179']);
  assert.equal(rows[2].detail,rows[2].summary);
});
