import * as T from 'three';
/** Raycasting itself ignores Object3D.visible, including hidden descendants. */
export function pickVisible(ray:T.Raycaster,roots:readonly T.Object3D[]):T.Intersection|undefined {
 return ray.intersectObjects([...roots],true).find(hit=>{
  for(let object:T.Object3D|null=hit.object;object;object=object.parent)if(!object.visible)return false;
  return true;
 });
}
