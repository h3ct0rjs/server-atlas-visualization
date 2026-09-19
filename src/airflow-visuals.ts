import * as T from 'three';

export type AirflowOptions={mode:'raised'|'slab';supply:boolean;returnAir:boolean;containment:boolean;active:boolean;playing:boolean};
type Stream={curve:T.CatmullRomCurve3;kind:'supply'|'return';offset:number};
const lanes=[-2.7,-.9,.9,2.7],particlesPerStream=9;

/** Illustrative circulation paths, not a CFD result or a physical duct layout. */
export function createAirflowVisuals(color:(id:string)=>string){
 const group=new T.Group();group.name='Room airflow';
 let mode:AirflowOptions['mode']|undefined,last:AirflowOptions|undefined,phase=0,disposed=false;
 let supplyGroup=new T.Group(),returnGroup=new T.Group(),containmentGroup=new T.Group();
 let streams:Stream[]=[],supplyParticles:T.InstancedMesh,returnParticles:T.InstancedMesh;
 const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>(),textures=new Set<T.Texture>();
 const dummy=new T.Object3D(),up=new T.Vector3(0,1,0);
 function geometry<G extends T.BufferGeometry>(value:G){geometries.add(value);return value;}
 function material<M extends T.Material>(value:M){materials.add(value);return value;}
 function clear(){
  group.traverse(object=>{if(object instanceof T.InstancedMesh)object.dispose();});
  geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());
  geometries.clear();materials.clear();textures.clear();group.clear();streams=[];
 }
 function rebuild(nextMode:AirflowOptions['mode']){
  clear();mode=nextMode;
  supplyGroup=new T.Group();supplyGroup.name='Cool supply';
  returnGroup=new T.Group();returnGroup.name='Warm return';
  containmentGroup=new T.Group();containmentGroup.name='Cold aisle containment';
  group.add(supplyGroup,returnGroup,containmentGroup);
  const supplyColor=color('airflow-supply'),returnColor=color('airflow-return');
  function aisleLabel(title:string,caption:string,tint:string,at:[number,number,number],parent:T.Group){
   // Canvas textures are created only in the browser; the rest of the geometry
   // remains usable by headless structural tests without a DOM shim.
   if(typeof document==='undefined')return;
   const canvas=document.createElement('canvas');canvas.width=512;canvas.height=144;
   const ctx=canvas.getContext('2d');if(!ctx)return;
   ctx.fillStyle=color('paper');ctx.globalAlpha=.94;ctx.fillRect(0,0,512,144);ctx.globalAlpha=1;
   ctx.fillStyle=tint;ctx.fillRect(0,0,6,144);
   ctx.textAlign='center';ctx.textBaseline='middle';
   ctx.font='600 43px sans-serif';ctx.fillStyle=color('ink');ctx.fillText(title,256,49);
   ctx.font='32px sans-serif';ctx.fillStyle=color('muted');ctx.fillText(caption,256,103);
   const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;textures.add(texture);
   const sprite=new T.Sprite(material(new T.SpriteMaterial({map:texture,transparent:true,depthWrite:false,depthTest:false,toneMapped:false})));
   sprite.name=title;sprite.userData.aisle=caption;sprite.position.set(...at);sprite.scale.set(3,.844,1);sprite.renderOrder=20;parent.add(sprite);
  }
  aisleLabel('COLD AISLE','Server fronts',supplyColor,[0,.65,0],supplyGroup);
  aisleLabel('HOT AISLE','Server rears',returnColor,[0,.65,-3.75],returnGroup);
  aisleLabel('HOT AISLE','Server rears',returnColor,[0,.65,3.55],returnGroup);
  const supplyMaterial=material(new T.MeshBasicMaterial({color:supplyColor}));
  const returnMaterial=material(new T.MeshBasicMaterial({color:returnColor}));
  const supplyTrail=material(new T.MeshBasicMaterial({color:supplyColor,transparent:true,opacity:.28,depthWrite:false}));
  const returnTrail=material(new T.MeshBasicMaterial({color:returnColor,transparent:true,opacity:.28,depthWrite:false}));
  const arrowGeometry=geometry(new T.ConeGeometry(.055,.17,5));
  function addStream(points:number[][],kind:Stream['kind'],offset:number){
   const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p as [number,number,number])),false,'centripetal');
   const stream={curve,kind,offset};streams.push(stream);
   const parent=kind==='supply'?supplyGroup:returnGroup;
   const trail=new T.Mesh(geometry(new T.TubeGeometry(curve,100,.009,4,false)),kind==='supply'?supplyTrail:returnTrail);
   trail.userData.airflowKind=kind;trail.userData.flowStart=points[0];trail.userData.flowEnd=points[points.length-1];parent.add(trail);
   // Direction remains legible with reduced motion or when paused.
   for(const t of [.24,.55,.83]){
    const arrow=new T.Mesh(arrowGeometry,kind==='supply'?supplyMaterial:returnMaterial);
    arrow.position.copy(curve.getPointAt(t));arrow.quaternion.setFromUnitVectors(up,curve.getTangentAt(t));parent.add(arrow);
   }
  }
  lanes.forEach((x,index)=>{
   for(const side of [-1,1]){
    const front=side*1.37,rear=side*2.91;
    const supply=mode==='raised'
     ?[[x,.25,4.05],[x,-.43,3.6],[x,-.43,.45],[x,.25,side*.4],[x,1.23,side*.75],[x,1.23,front]]
     :[[x,2.45,4.1],[x,3.9,3.8],[x,4.12,.2],[x,2.3,side*.45],[x,1.23,side*.8],[x,1.23,front]];
    addStream(supply,'supply',index*.11+(side===1?.05:0));
    // Return rises behind each rack, then travels above the row to the cooler.
    const returnX=x+(side===1?.13:-.13);
    const returns=side===-1
     ?[[x,1.35,rear],[returnX,2.3,-3.25],[returnX,4.6,-3.45],[returnX,4.6,3.65],[x,2.15,4.12]]
     :[[x,1.35,rear],[returnX,2.2,3.25],[returnX,3.4,3.62],[x,2.15,4.12]];
    addStream(returns,'return',index*.09+(side===1?.07:0));
   }
  });
  supplyParticles=new T.InstancedMesh(geometry(new T.SphereGeometry(.035,7,5)),supplyMaterial,8*particlesPerStream);
  // Warm paths use elongated dashes as a second cue beyond color.
  returnParticles=new T.InstancedMesh(geometry(new T.CylinderGeometry(.023,.023,.15,5)),returnMaterial,8*particlesPerStream);
  supplyParticles.instanceMatrix.setUsage(T.DynamicDrawUsage);returnParticles.instanceMatrix.setUsage(T.DynamicDrawUsage);
  supplyParticles.frustumCulled=false;returnParticles.frustumCulled=false;
  supplyGroup.add(supplyParticles);returnGroup.add(returnParticles);
  const glazing=material(new T.MeshBasicMaterial({color:supplyColor,transparent:true,opacity:.055,side:T.DoubleSide,depthWrite:false}));
  const frameMaterial=material(new T.LineBasicMaterial({color:supplyColor,transparent:true,opacity:.38,depthWrite:false}));
  function panel(size:[number,number,number],at:[number,number,number]){
   const shape=geometry(new T.BoxGeometry(...size)),pane=new T.Mesh(shape,glazing);
   pane.position.set(...at);containmentGroup.add(pane);
   const edges=new T.LineSegments(geometry(new T.EdgesGeometry(shape)),frameMaterial);edges.position.copy(pane.position);containmentGroup.add(edges);
  }
  panel([6.8,.035,2.75],[0,3.45,0]);
  panel([.025,3.45,2.75],[-3.4,1.725,0]);panel([.025,3.45,2.75],[3.4,1.725,0]);
  placeParticles();
 }
 function placeParticles(){
  let coolIndex=0,warmIndex=0;
  for(const stream of streams){
   const particles=stream.kind==='supply'?supplyParticles:returnParticles;
   for(let i=0;i<particlesPerStream;i++){
    const t=(phase+stream.offset+i/particlesPerStream)%1;
    dummy.position.copy(stream.curve.getPointAt(t));dummy.quaternion.setFromUnitVectors(up,stream.curve.getTangentAt(t));dummy.updateMatrix();
    particles.setMatrixAt(stream.kind==='supply'?coolIndex++:warmIndex++,dummy.matrix);
   }
  }
  supplyParticles.instanceMatrix.needsUpdate=true;returnParticles.instanceMatrix.needsUpdate=true;
 }
 return {group,update(options:AirflowOptions,deltaSeconds:number){
  if(disposed)return false;
  if(!options.active&&mode===undefined){group.visible=false;return false;}
  const rebuilt=mode!==options.mode;if(rebuilt)rebuild(options.mode);
  const changed=!last||Object.keys(options).some(k=>options[k as keyof AirflowOptions]!==last![k as keyof AirflowOptions]);
  group.visible=options.active;
  supplyGroup.visible=options.supply;returnGroup.visible=options.returnAir;containmentGroup.visible=options.containment;
  const moving=options.active&&options.playing&&(options.supply||options.returnAir)&&deltaSeconds>0;
  if(moving){phase=(phase+Math.min(deltaSeconds,.1)*.065)%1;placeParticles();}
  last={...options};return rebuilt||changed||moving;
 },dispose(){if(disposed)return;disposed=true;clear();group.removeFromParent();}};
}
