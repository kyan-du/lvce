import test from 'node:test';
import assert from 'node:assert/strict';
import {parseViewHash,formatViewHash} from '../lib/view-url.js';

test('logged-in view hash encodes trip, tab and reading',()=>{
  assert.deepEqual(parseViewHash('#/qiantang/reading/jiaxing-nanhu'),{tripId:'qiantang',tab:'reading',reading:'jiaxing-nanhu'});
  assert.equal(formatViewHash({tripId:'qiantang',tab:'reading',reading:'jiaxing-nanhu'}),'#/qiantang/reading/jiaxing-nanhu');
  assert.equal(formatViewHash({tripId:'qiantang',tab:'itinerary'}),'#/qiantang/itinerary');
  assert.deepEqual(parseViewHash(''),{tripId:'',tab:'itinerary',reading:''});
  assert.deepEqual(parseViewHash('#/bookings'),{tripId:'',tab:'bookings',reading:''});
});

test('public share hash does not include trip id',()=>{
  assert.deepEqual(parseViewHash('#/packing',{publicView:true}),{tripId:'',tab:'packing',reading:''});
  assert.deepEqual(parseViewHash('#/reading/juzizhou',{publicView:true}),{tripId:'',tab:'reading',reading:'juzizhou'});
  assert.equal(formatViewHash({publicView:true,tab:'reading',reading:'juzizhou'}),'#/reading/juzizhou');
  assert.equal(formatViewHash({publicView:true,tab:'itinerary'}),'#/itinerary');
  assert.deepEqual(parseViewHash('#/qiantang/reading/x',{publicView:true}),{tripId:'',tab:'itinerary',reading:''},'unknown first segment falls back to itinerary');
});

test('unknown tabs and leftover reading ids fall back cleanly',()=>{
  assert.deepEqual(parseViewHash('#/qiantang/notes'),{tripId:'qiantang',tab:'itinerary',reading:''});
  assert.equal(formatViewHash({tripId:'qiantang',tab:'notes',reading:'x'}),'#/qiantang/itinerary');
  assert.equal(formatViewHash({tripId:'qiantang',tab:'packing',reading:'leftover'}),'#/qiantang/packing');
});
