import {test} from 'node:test';
import assert from 'node:assert/strict';
import {floorParts,partPosition} from './detail-models.ts';
import {floorPartVisible} from './floor-detail-state.ts';
import {floorLoadProperties} from './floor-loads.ts';
test('service seals follow panel removal, selection and separation',()=>{
 const parts=floorParts('raised'),seal=parts.find(p=>p.id==='grommet')!,panel=parts.find(p=>p.id===seal.parentPanel)!;
 assert.ok(panel);
 for(const selected of ['',panel.id,seal.id]){
  assert.equal(floorPartVisible(seal,parts,true,selected),Boolean(selected));
  assert.equal(floorPartVisible(panel,parts,true,selected),Boolean(selected));
 }
 assert.equal(floorPartVisible(seal,parts,false,''),true);
 for(const amount of [0,.5,1]){
  const a=partPosition(panel,amount),b=partPosition(seal,amount);
  assert.equal(a[0],b[0]);assert.equal(a[2],b[2]);
  assert.ok(Math.abs((b[1]-a[1])-(seal.at[1]-panel.at[1]))<1e-9);
 }
});
test('floor capacity categories remain separate and explicitly unknown',()=>{
 assert.deepEqual(floorLoadProperties.map(p=>p.id),['slab','panel','concentrated','rolling']);
 assert.ok(floorLoadProperties.every(p=>p.capacity===null));
});
