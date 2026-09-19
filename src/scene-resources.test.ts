import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {disposeSceneResources} from './scene-resources.ts';
test('scene cleanup releases shared materials, texture maps and instanced buffers once',()=>{
 const scene=new T.Scene(),geometry=new T.BoxGeometry(),texture=new T.Texture();
 const material=new T.MeshStandardMaterial({map:texture,normalMap:texture}),instances=new T.InstancedMesh(geometry,material,2);
 scene.add(instances,new T.Mesh(geometry,material),new T.Line(geometry,new T.LineBasicMaterial()));
 const counts={geometry:0,material:0,texture:0,instances:0};
 geometry.addEventListener('dispose',()=>counts.geometry++);material.addEventListener('dispose',()=>counts.material++);texture.addEventListener('dispose',()=>counts.texture++);instances.addEventListener('dispose',()=>counts.instances++);
 disposeSceneResources(scene);assert.deepEqual(counts,{geometry:1,material:1,texture:1,instances:1});
});
test('factory-owned room geometry survives scene cleanup until its owner releases it',()=>{
 const scene=new T.Scene(),geometry=new T.BoxGeometry(),mesh=new T.Mesh(geometry,new T.MeshStandardMaterial());mesh.userData.sharedServerGeometry=true;scene.add(mesh);let disposed=0;geometry.addEventListener('dispose',()=>disposed++);
 disposeSceneResources(scene);assert.equal(disposed,0);geometry.dispose();assert.equal(disposed,1);
});
