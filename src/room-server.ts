import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {serverParts} from './detail-models.ts';
import {buildServerPart} from './server-geometry.ts';

/** Share merged geometry across room instances; keep selection materials independent. */
export function createRoomServerFactory(color:(id:string)=>string){
 const assembly=new T.Group();
 for(const part of serverParts){const group=buildServerPart(part,color);group.position.set(...part.at);assembly.add(group);}
 assembly.updateMatrixWorld(true);
 const bounds=new T.Box3().setFromObject(assembly),center=bounds.getCenter(new T.Vector3()),size=bounds.getSize(new T.Vector3());
 const buckets=new Map<string,{cover:boolean;material:T.MeshStandardMaterial;geometries:T.BufferGeometry[]}>();
 const originals=new Set<T.Material>();
 assembly.traverse(o=>{if(!(o instanceof T.Mesh))return;const material=o.material as T.MeshStandardMaterial;originals.add(material);
  const cover=o.userData.id==='lid'||o.userData.id==='shroud';
  const key=`${cover}:${material.color.getHex()}:${material.metalness}:${material.roughness}`;
  let bucket=buckets.get(key);if(!bucket){bucket={cover,material:material.clone(),geometries:[]};buckets.set(key,bucket);}
  bucket.geometries.push(o.geometry.clone().applyMatrix4(o.matrixWorld));o.geometry.dispose();
 });
 originals.forEach(m=>m.dispose());
 const templates=[...buckets.values()].map(bucket=>{const geometry=mergeGeometries(bucket.geometries)!;bucket.geometries.forEach(g=>g.dispose());geometry.translate(-center.x,-center.y,-center.z);return {...bucket,geometry};});
 return {
  create(id:string,target:[number,number,number]){
   const group=new T.Group();group.name='Detailed room server';group.scale.set(target[0]/size.x,target[1]/size.y,target[2]/size.z);
   for(const template of templates){const mesh=new T.Mesh(template.geometry,template.material.clone());mesh.userData.id=id;mesh.userData.sharedServerGeometry=true;mesh.userData.serverCover=template.cover;group.add(mesh);}
   return group;
  },
  dispose(){for(const template of templates){template.geometry.dispose();template.material.dispose();}}
 };
}
