import test from 'node:test';
import assert from 'node:assert/strict';
import {splitHotelRoomAndNotes,parseHotelContact,formatHotelContact,normalizeHotelRow} from '../lib/hotel-fields.js';

test('qiantang room blobs keep beds in 房型 and send cancel/check-in copy to 备注',()=>{
  assert.deepEqual(splitHotelRoomAndNotes('高级双床房 1间；26㎡；2张1.2*2米床；外景窗；早餐赠1份（限金会员入住）；与另一家嘉兴酒店同夜'),{
    room:'高级双床房 1间；26㎡；2张1.2*2米床；外景窗；早餐赠1份（限金会员入住）',
    notes:'与另一家嘉兴酒店同夜'
  });
  assert.deepEqual(splitHotelRoomAndNotes('高级双床房 1间；25-30㎡；2张1.2*2米床；外景窗；早餐赠1份（限金会员入住）；入住 12:00、离店 14:00；9月25日 20:00前可免费取消'),{
    room:'高级双床房 1间；25-30㎡；2张1.2*2米床；外景窗；早餐赠1份（限金会员入住）',
    notes:'入住 12:00、离店 14:00；9月25日 20:00前可免费取消'
  });
});

test('order-only hotel blobs are notes, not a room type',()=>{
  const raw='携程订单 1128150964876747；房间已预留，到店报住客姓名并出示证件即可入住；入住 14:00后、离店 14:00前；9月24日12:00前免费取消；与另一家嘉兴酒店同夜';
  assert.deepEqual(splitHotelRoomAndNotes(raw),{room:'',notes:raw});
});

test('short room names stay in 房型',()=>{
  assert.deepEqual(splitHotelRoomAndNotes('房型：标准双床房'),{room:'标准双床房',notes:''});
  assert.deepEqual(splitHotelRoomAndNotes('观IFS·豪华双床房'),{room:'观IFS·豪华双床房',notes:''});
});

test('hotel contact stores phone and email on separate lines',()=>{
  assert.deepEqual(parseHotelContact('0573-82091333\nfront@example.com'),{phone:'0573-82091333',email:'front@example.com'});
  assert.deepEqual(parseHotelContact('待填写'),{phone:'',email:''});
  assert.equal(formatHotelContact({phone:'0573-82091333',email:''}),'0573-82091333');
});

test('normalizeHotelRow splits 房型 blobs into notes and keeps 9 fields',()=>{
  assert.deepEqual(normalizeHotelRow(['酒店','2026-08-03','前台','138 0000 0000','测试地址 1 号','房型：标准双床房','1','¥1']),['酒店','2026-08-03','','138 0000 0000','测试地址 1 号','标准双床房','1','¥1','']);
  assert.deepEqual(normalizeHotelRow({name:'对象酒店',checkin:'2026-08-04',checkout:'2026-08-06',contact:'139 0000 0001',address:'对象地址 2 号',roomType:'对象房型',nights:'99',totalCost:'¥2'}),['对象酒店','2026-08-04','2026-08-06','139 0000 0001','对象地址 2 号','对象房型','2','¥2','']);
  assert.deepEqual(normalizeHotelRow(['嘉兴南湖桔子水晶酒店','2026-09-24','2026-09-25','','九曲路','高级双床房 1间；26㎡；2张1.2*2米床；外景窗；早餐赠1份（限金会员入住）；与另一家嘉兴酒店同夜','1','在线付 ¥322.32']),['嘉兴南湖桔子水晶酒店','2026-09-24','2026-09-25','','九曲路','高级双床房 1间；26㎡；2张1.2*2米床；外景窗；早餐赠1份（限金会员入住）','1','在线付 ¥322.32','与另一家嘉兴酒店同夜']);
});
