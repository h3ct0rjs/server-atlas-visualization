import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createAirflowVisuals,type AirflowOptions} from './airflow-visuals.ts';
const defaults:AirflowOptions={mode:'raised',supply:true,returnAir:true,containment:true,active:true,playing:true};
const create=()=>createAirflowVisuals(()=> '#336699');

test('airflow respects pause, hidden state and separate circulation controls',()=>{
 const flow=create();assert.equal(flow.update(defaults,0),true);
 const cool=flow.group.getObjectByName('Cool supply')!;
 const particles=cool.children.find(o=>o instanceof T.InstancedMesh) as T.InstancedMesh;
 const initial=Array.from(particles.instanceMatrix.array);
 assert.equal(flow.update({...defaults,playing:false},.05),true);
 assert.deepEqual(Array.from(particles.instanceMatrix.array),initial);
 assert.equal(flow.update({...defaults,playing:false},.05),false);
 flow.update(defaults,.05);assert.notDeepEqual(Array.from(particles.instanceMatrix.array),initial);
 flow.update({...defaults,active:false},.05);assert.equal(flow.group.visible,false);
 const stopped=Array.from(particles.instanceMatrix.array);
 assert.equal(flow.update({...defaults,active:false},.05),false);
 assert.deepEqual(Array.from(particles.instanceMatrix.array),stopped);
 flow.update({...defaults,supply:false,containment:false},0);
 assert.equal(cool.visible,false);assert.equal(flow.group.getObjectByName('Warm return')!.visible,true);
 assert.equal(flow.group.getObjectByName('Cold aisle containment')!.visible,false);
 flow.dispose();
});

test('slab supply stays above floor and mode switches release previous geometry exactly once',()=>{
 const flow=create();flow.update(defaults,0);
 const geometries=new Set<T.BufferGeometry>();
 flow.group.traverse(o=>{if(o instanceof T.Mesh||o instanceof T.LineSegments)geometries.add(o.geometry);});
 const disposals=new Map<T.BufferGeometry,number>();
 geometries.forEach(g=>g.addEventListener('dispose',()=>disposals.set(g,(disposals.get(g)??0)+1)));
 flow.update({...defaults,mode:'slab'},0);
 geometries.forEach(g=>assert.equal(disposals.get(g),1));
 const cool=flow.group.getObjectByName('Cool supply')!;
 const trails=cool.children.filter(o=>o.userData.airflowKind==='supply') as T.Mesh[];
 assert.equal(trails.length,8);
 for(const trail of trails){trail.geometry.computeBoundingBox();assert.ok(trail.geometry.boundingBox!.min.y>0);}
 flow.dispose();flow.dispose();geometries.forEach(g=>assert.equal(disposals.get(g),1));
 assert.equal(flow.group.children.length,0);
});

test('supply approaches central-facing fronts and returns leave outer rears',()=>{
 const flow=create();flow.update(defaults,0);
 const supply=flow.group.getObjectByName('Cool supply')!.children.filter(o=>o.userData.airflowKind);
 const returns=flow.group.getObjectByName('Warm return')!.children.filter(o=>o.userData.airflowKind);
 for(const stream of supply){assert.equal(Math.abs(stream.userData.flowEnd[2]),1.37);assert.equal(stream.userData.flowStart[2],4.05);}
 for(const stream of returns){assert.equal(Math.abs(stream.userData.flowStart[2]),2.91);assert.equal(stream.userData.flowEnd[2],4.12);}
 flow.dispose();
});

test('aisle sprites face the camera and release label textures once across rebuilds',()=>{
 const previous=Object.getOwnPropertyDescriptor(globalThis,'document');
 const context={fillRect(){},fillText(){}};
 Object.defineProperty(globalThis,'document',{configurable:true,value:{createElement:()=>({getContext:()=>context})}});
 try{
  const flow=create();flow.update(defaults,0);
  const sprites:T.Sprite[]=[];flow.group.traverse(o=>{if(o instanceof T.Sprite)sprites.push(o);});
  assert.equal(sprites.length,3);assert.equal(sprites.filter(s=>s.name==='HOT AISLE').length,2);
  let releases=0;sprites.forEach(s=>s.material.map!.addEventListener('dispose',()=>releases++));
  flow.update({...defaults,mode:'slab'},0);assert.equal(releases,3);
  flow.dispose();flow.dispose();assert.equal(releases,3);
 }finally{if(previous)Object.defineProperty(globalThis,'document',previous);else Reflect.deleteProperty(globalThis,'document');}
});
