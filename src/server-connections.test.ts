import {test} from 'node:test';
import assert from 'node:assert/strict';
import {serverParts} from './detail-models.ts';
import {componentNotes,serverConnections} from './server-connections.ts';

test('connection endpoints and component explanations stay aligned with the selectable assembly',()=>{
 const parts=new Set(serverParts.map(p=>p.id));
 assert.deepEqual(Object.keys(componentNotes).sort(),[...parts].sort());
 assert.equal(new Set(serverConnections.map(c=>c.id)).size,serverConnections.length);
 for(const c of serverConnections){
  assert.ok(parts.has(c.from)&&parts.has(c.to),`Unknown endpoint: ${c.id}`);
  assert.notEqual(c.from,c.to);
  assert.ok(c.medium.length&&c.description.length);
 }
});

test('illustrative storage and network paths reach the host while each drive has power',()=>{
 const reachable=(start:string,goal:string,kind:'data'|'power')=>{
  const seen=new Set([start]),queue=[start];
  for(const node of queue)for(const c of serverConnections.filter(c=>c.kind===kind)){
   const next=c.from===node?c.to:kind==='data'&&c.to===node?c.from:null;
   if(next&&!seen.has(next)){seen.add(next);queue.push(next);}
  }
  return seen.has(goal);
 };
 for(let n=0;n<6;n++){
  assert.ok(reachable('board',`drive-${n}`,'data'));
  for(const psu of ['psu-0','psu-1'])assert.ok(reachable(psu,`drive-${n}`,'power'));
 }
 assert.ok(reachable('board','nic','data'));
 assert.ok(reachable('psu-0','nic','power'));
});

test('passive components are not electrical endpoints and memory lines do not imply cables',()=>{
 const passive=new Set(['chassis','wall--1','wall-1','lid','shroud','sink-0','sink-1']);
 for(const c of serverConnections){
  assert.ok(!passive.has(c.from)&&!passive.has(c.to));
  if(c.to.startsWith('dimm-'))assert.match(c.medium,/Board traces/);
 }
 for(let n=0;n<2;n++)for(let j=0;j<4;j++){
  const memoryData=serverConnections.filter(c=>c.kind==='data'&&c.to===`dimm-${n}-${j}`);
  assert.equal(memoryData.length,1);
  assert.equal(memoryData[0].from,`cpu-${n}`);
 }
});
