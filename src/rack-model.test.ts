import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {equipment,rackSlots,rackMountHeight,RACK_UNIT_HEIGHT} from './atlas.ts';
import {buildRackModel} from './rack-model.ts';

test('42U rack assignments are unique, align with equipment, and leave exactly 28U blank',()=>{
 for(const rack of equipment.filter(e=>e.system==='racks')){
  const slots=rackSlots(rack.id);assert.equal(slots.length,42);assert.equal(slots.filter(s=>s.equipmentId).length,14);
  for(const slot of slots){
   const occupants=equipment.filter(e=>e.rack===rack.id&&e.rackU!==undefined&&slot.u>=e.rackU&&slot.u<e.rackU+(e.rackUnits??1));
   assert.ok(occupants.length<=1);assert.equal(slot.equipmentId,occupants[0]?.id);
  }
  for(const mounted of equipment.filter(e=>e.rack===rack.id&&e.rackU!==undefined)){
   assert.equal(mounted.position[1],rackMountHeight(mounted.rackU!,mounted.rackUnits!));
   assert.ok(mounted.size[1]<mounted.rackUnits!*RACK_UNIT_HEIGHT);
  }
 }
 assert.deepEqual(rackSlots('missing'),[]);
});
test('rack details preserve cabinet bounds, floor contact, correct blanking and picking',()=>{
 const rack=equipment.find(e=>e.id==='A01')!,model=buildRackModel(rack,()=> '#627d87');
 const bounds=new T.Box3();let blanks=0,guides=0,numbers=0;
 model.updateMatrixWorld(true);
 model.traverse(object=>{
  if(!(object instanceof T.Mesh))return;
  assert.equal(object.userData.id,rack.id);assert.ok(object.material instanceof T.MeshStandardMaterial);
  if(object.userData.serviceClearance){assert.equal(object.visible,false);guides++;return;}
  bounds.union(new T.Box3().setFromObject(object));
  if(object.name==='Blanking panel'){blanks++;assert.equal(rackSlots(rack.id)[object.userData.rackUnit-1].equipmentId,undefined);}
  if(object instanceof T.InstancedMesh){numbers++;assert.ok(object.count>42);}
 });
 assert.equal(blanks,28);assert.equal(guides,2);assert.equal(numbers,1);
 for(let axis=0;axis<3;axis++){assert.ok(bounds.min.getComponent(axis)>=-rack.size[axis]/2-1e-6);assert.ok(bounds.max.getComponent(axis)<=rack.size[axis]/2+1e-6);}
 assert.ok(Math.abs(bounds.min.y+rack.position[1])<1e-6);
});
