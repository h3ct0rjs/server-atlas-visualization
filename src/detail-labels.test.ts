import {test} from 'node:test';
import assert from 'node:assert/strict';
import {placeLabels} from './detail-labels.ts';
test('dense projections do not overlap, fit narrow viewports and prioritize selection',()=>{
 const anchors=Array.from({length:36},(_,i)=>({id:String(i),name:'Component',x:80,y:210,selected:i===35}));
 for(const width of [320,600,1200]){
  const labels=placeLabels(anchors,width,420);
  assert.equal(labels[0].id,'35');assert.ok(labels.length<anchors.length);
  for(const a of labels){assert.ok(a.left>=0&&a.left+a.width<=width&&a.top>=86&&a.top+a.height<=400);
   for(const b of labels)if(a!==b)assert.ok(a.left+a.width<=b.left||b.left+b.width<=a.left||a.top+a.height<=b.top||b.top+b.height<=a.top);
  }
 }
});
test('tiny unavailable label area is safe',()=>assert.deepEqual(placeLabels([{id:'x',name:'X',x:10,y:10,selected:true}],100,80),[]));
