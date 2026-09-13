import {useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {equipment,networkLinks,positionFor,type System} from './atlas';
import {buildRoomFloor,type RoomFloorMode} from './room-floor';
import {buildRackModel} from './rack-model';
import {createRoomServerFactory} from './room-server';
export type SceneState={visible:System[];selected:string|null;isolate:boolean;explode:number;paths:boolean;openServers:boolean;floorMode:RoomFloorMode;floorCutaway:boolean;liftedPanels:string[];clearances:boolean;view:'perspective'|'top';reset:number};
export default function Scene({state,onSelect,onPanel}:{state:SceneState;onSelect:(id:string)=>void;onPanel:(id:string)=>void}){
 const host=useRef<HTMLDivElement>(null),current=useRef(state),select=useRef(onSelect),panelPick=useRef(onPanel),[error,setError]=useState('');
 current.current=state;select.current=onSelect;panelPick.current=onPanel;
 useEffect(()=>{
  const el=host.current!;let renderer:T.WebGLRenderer;
  try{renderer=new T.WebGLRenderer({antialias:true,alpha:true});}catch{setError('3D rendering is unavailable. You can still explore equipment using the inventory.');return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=T.SRGBColorSpace;el.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-label','Interactive datacenter model. Drag to orbit, scroll to zoom. Select equipment in the inventory for keyboard access.');
  const styles=getComputedStyle(document.documentElement),color=(name:string)=>styles.getPropertyValue(`--color-${name}`).trim();
  const scene=new T.Scene();scene.background=new T.Color(color('canvas'));
  const camera=new T.PerspectiveCamera(38,1,.1,150),controls=new OrbitControls(camera,renderer.domElement);
  controls.enableDamping=false;controls.minDistance=4;controls.maxDistance=42;controls.maxPolarAngle=Math.PI*.49;
  scene.add(new T.HemisphereLight(0xffffff,0x8d99a5,2.4));const light=new T.DirectionalLight(0xffffff,3);light.position.set(5,12,7);scene.add(light);
  const grid=new T.GridHelper(22,44,color('grid'),color('grid'));grid.position.y=-.9;scene.add(grid);
  const floor=buildRoomFloor(color);scene.add(floor.group);
  const meshes:T.Mesh[]=[],groups=new Map<string,T.Group>(),materials:T.MeshStandardMaterial[]=[];
  function box(group:T.Group,size:number[],pos:number[],c:string,id?:string){const mat=new T.MeshStandardMaterial({color:c,roughness:.65,metalness:.25});materials.push(mat);const mesh=new T.Mesh(new T.BoxGeometry(...size as [number,number,number]),mat);mesh.position.set(...pos as [number,number,number]);group.add(mesh);if(id){mesh.userData.id=id;meshes.push(mesh);}return mesh;}
  const servers=createRoomServerFactory(color);
  for(const e of equipment){const group=new T.Group();group.userData.equipment=e;groups.set(e.id,group);scene.add(group);const [w,h,d]=e.size,c=color(e.system);
   if(e.system==='racks'){
    const rack=buildRackModel(e,color);group.add(rack);rack.traverse(o=>{if(o instanceof T.Mesh){meshes.push(o);materials.push(o.material as T.MeshStandardMaterial);}});
   }else if(e.system==='compute'){
    const server=servers.create(e.id,e.size);group.add(server);server.traverse(o=>{if(o instanceof T.Mesh){meshes.push(o);materials.push(o.material as T.MeshStandardMaterial);}});
   }else{
    box(group,e.size,[0,0,0],c,e.id);
    if(e.system==='network'){
     const ports=12;
     for(let p=0;p<ports;p++)box(group,[.049,h*.43,.025],[-w*.42+p*(w*.84/(ports-1)),0,d/2+.02],color('inset'),e.id);
     box(group,[.028,.028,.03],[w*.46,0,d/2+.025],color('led'),e.id);
    }
    if(e.system==='cooling')for(let n=0;n<9;n++)box(group,[w*.78,.04,.025],[0,-h*.3+n*h*.075,-d/2-.01],color('inset'),e.id);
    if(e.kind==='Uninterruptible power supply')box(group,[.45,.25,.03],[0,.5,d/2+.01],color('inset'),e.id);
   }
  }
  const lineMaterial=new T.LineBasicMaterial({color:color('network'),transparent:true,opacity:.45}),lineGeometry=new T.BufferGeometry(),lines=new T.LineSegments(lineGeometry,lineMaterial);scene.add(lines);
  let last:SceneState|undefined,frame=0;
  function fit(){controls.target.set(0,1.4,.3);const scale=Math.max(1,1/camera.aspect);camera.position.set(...(current.current.view==='top'?[0,24*scale,.31]:[15*scale,13*scale,19*scale]) as [number,number,number]);controls.update();}
  const resize=new ResizeObserver(()=>{const w=el.clientWidth,h=el.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();fit();draw();});resize.observe(el);
  const ray=new T.Raycaster(),pointer=new T.Vector2();let down={x:0,y:0},downTime=0;
  const onDown=(e:PointerEvent)=>{down={x:e.clientX,y:e.clientY};downTime=Date.now();};
  const onUp=(e:PointerEvent)=>{if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>6||Date.now()-downTime>500)return;const rect=el.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects([...meshes,...floor.tiles.values()].filter(m=>{let o:T.Object3D|null=m;while(o){if(!o.visible)return false;o=o.parent;}return true;}),false)[0];if(hit){if(hit.object.userData.floorPanel)panelPick.current(hit.object.userData.floorPanel);else select.current(hit.object.userData.id);}};
  renderer.domElement.addEventListener('pointerdown',onDown);renderer.domElement.addEventListener('pointerup',onUp);
  function draw(){renderer.render(scene,camera);}controls.addEventListener('change',draw);
  function tick(){frame=requestAnimationFrame(tick);const s=current.current;if(s===last)return;
   if(!last||s.reset!==last.reset||s.view!==last.view)fit();
   if(s.isolate&&s.selected&&(!last?.isolate||last.selected!==s.selected)){const e=equipment.find(e=>e.id===s.selected)!;const target=new T.Vector3(...positionFor(e,s.explode));const distance=Math.max(...e.size,1.6)*2.5*Math.max(1,.75/camera.aspect);controls.target.copy(target);camera.position.copy(target).add(new T.Vector3(1,.6,1.2).normalize().multiplyScalar(distance));controls.update();}else if(last?.isolate&&!s.isolate)fit();
   for(const e of equipment){const g=groups.get(e.id)!;g.visible=s.visible.includes(e.system)&&(!s.isolate||s.selected===e.id||e.rack===s.selected);g.position.set(...positionFor(e,s.explode));g.traverse(o=>{if(o instanceof T.Mesh){if(o.userData.serverCover)o.visible=!s.openServers;if(o.userData.serviceClearance)o.visible=s.clearances&&s.explode===0;const m=o.material as T.MeshStandardMaterial;m.emissive.set(s.selected===e.id&&!o.userData.serviceClearance?color('selected'):0x000000);m.emissiveIntensity=e.system==='compute'||e.system==='racks'?.12:.35;}});}
   floor.update(s.floorMode,s.floorCutaway,s.liftedPanels,!s.isolate&&s.explode===0);
   const vertices:number[]=[];if(s.paths&&s.visible.includes('network'))for(const link of networkLinks){const a=groups.get(link.source)!,b=groups.get(link.target)!;if(a.visible&&b.visible)vertices.push(...a.position.toArray(),...b.position.toArray());}
   lineGeometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));lineGeometry.computeBoundingSphere();last=s;draw();
  }fit();tick();
  const lost=(event:Event)=>{event.preventDefault();setError('The 3D graphics context was lost. Reload the page to restore the model.');};renderer.domElement.addEventListener('webglcontextlost',lost);
  return()=>{cancelAnimationFrame(frame);resize.disconnect();controls.dispose();renderer.domElement.removeEventListener('pointerdown',onDown);renderer.domElement.removeEventListener('pointerup',onUp);renderer.domElement.removeEventListener('webglcontextlost',lost);const geometries=new Set<T.BufferGeometry>();scene.traverse(o=>{if((o instanceof T.Mesh||o instanceof T.LineSegments)&&!o.userData.sharedServerGeometry)geometries.add(o.geometry);});geometries.forEach(g=>g.dispose());servers.dispose();const allMaterials=new Set<T.Material>(materials);scene.traverse(o=>{if(o instanceof T.Mesh){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>allMaterials.add(m));}});const textures=new Set<T.Texture>();allMaterials.forEach(m=>{if(m instanceof T.MeshStandardMaterial&&m.map)textures.add(m.map);m.dispose();});textures.forEach(t=>t.dispose());lineMaterial.dispose();(grid.material as T.Material).dispose();renderer.dispose();renderer.domElement.remove();};
 },[]);
 return <div className="scene" ref={host}>{error&&<p className="scene-error" role="alert">{error}</p>}</div>;
}
