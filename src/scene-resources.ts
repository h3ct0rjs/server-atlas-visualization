import * as T from 'three';
/** Dispose each scene-owned resource once; factories retain ownership of shared buffers. */
export function disposeSceneResources(root:T.Object3D){
 const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>(),textures=new Set<T.Texture>();
 root.traverse(o=>{
  if(o instanceof T.InstancedMesh)o.dispose();
  if(o instanceof T.Mesh||o instanceof T.Line||o instanceof T.Sprite){
   if('geometry' in o&&!o.userData.sharedServerGeometry)geometries.add(o.geometry);
   for(const material of Array.isArray(o.material)?o.material:[o.material])materials.add(material);
  }
 });
 for(const material of materials)for(const value of Object.values(material))if(value instanceof T.Texture)textures.add(value);
 geometries.forEach(g=>g.dispose());textures.forEach(t=>t.dispose());materials.forEach(m=>m.dispose());
}
