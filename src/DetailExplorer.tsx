import {useEffect,useMemo,useRef,useState} from 'react';
import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {ArrowLeft,Search,RotateCcw,ExternalLink} from 'lucide-react';
import {serverParts,floorParts,partPosition,references,type Part} from './detail-models';
import {buildServerPart} from './server-geometry';
import {serverConnections,componentNotes} from './server-connections';
import {placeLabels} from './detail-labels';
import './detail-explorer.css';
type ViewState={selected:string;separation:number;open:boolean;shroud:boolean;labels:boolean;air:boolean;power:boolean;data:boolean;connectionsOnly:boolean;reset:number;preset:'perspective'|'front'|'rear'|'top';focus:boolean};
function DetailScene({parts,state,onSelect,kind,mode}:{parts:Part[];state:ViewState;onSelect:(id:string)=>void;kind:'server'|'floor';mode:'raised'|'slab'}){
 const host=useRef<HTMLDivElement>(null),latest=useRef(state),pick=useRef(onSelect),[error,setError]=useState('');latest.current=state;pick.current=onSelect;
 useEffect(()=>{
 const el=host.current!;let renderer:T.WebGLRenderer;
 try{renderer=new T.WebGLRenderer({antialias:true});}catch{setError('3D is unavailable. You can still inspect every component in the list.');return;}
 setError('');renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=T.SRGBColorSpace;el.appendChild(renderer.domElement);
 renderer.domElement.setAttribute('aria-label',`${kind==='server'?'Server internals':'Floor cutaway'} model. Drag to orbit and scroll to zoom. Use the component list for keyboard selection.`);
 const css=getComputedStyle(document.documentElement),color=(id:string)=>css.getPropertyValue(`--color-${id}`).trim();
 const scene=new T.Scene();scene.background=new T.Color(color('canvas'));
 scene.add(new T.HemisphereLight(0xffffff,0x83909b,2.6));const sun=new T.DirectionalLight(0xffffff,3);sun.position.set(3,9,6);scene.add(sun);
 const camera=new T.PerspectiveCamera(38,1,.1,200),orbit=new OrbitControls(camera,renderer.domElement);orbit.minDistance=3;orbit.maxDistance=80;orbit.maxPolarAngle=Math.PI*.8;
 const objects=new Map<string,T.Group>(),hits:T.Mesh[]=[];
 const overlay=document.createElement('div');overlay.className='component-labels';el.appendChild(overlay);
 const leaders=document.createElementNS('http://www.w3.org/2000/svg','svg');overlay.appendChild(leaders);
 const labelButtons=new Map<string,HTMLButtonElement>();
 if(kind==='server')for(const p of parts){const button=document.createElement('button');button.textContent=p.name;button.title=p.name;button.onclick=()=>pick.current(p.id);button.style.display='none';overlay.appendChild(button);labelButtons.set(p.id,button);}
 function box(g:T.Group,size:number[],at:number[],c:string,id:string){const mesh=new T.Mesh(new T.BoxGeometry(...size as [number,number,number]),new T.MeshStandardMaterial({color:c,metalness:.2,roughness:.65}));mesh.position.set(...at as [number,number,number]);mesh.userData.id=id;g.add(mesh);hits.push(mesh);return mesh;}
 for(const p of parts){const g=kind==='server'?buildServerPart(p,color):new T.Group();objects.set(p.id,g);scene.add(g);
 if(kind==='server'){g.traverse(o=>{if(o instanceof T.Mesh){o.userData.id=p.id;hits.push(o);}});}
 else{box(g,p.size,[0,0,0],color(p.color),p.id);if(p.name.startsWith('Perforated'))for(let i=0;i<5;i++)box(g,[1.1,.008,.07],[0,.05,-.44+i*.22],color('inset'),p.id);}
 }
 const connectionLines=kind==='server'?serverConnections.map(connection=>{
  const line=new T.Line(new T.BufferGeometry(),new T.LineDashedMaterial({color:color(connection.kind==='power'?'power':'network'),dashSize:.12,gapSize:.06,depthTest:false,transparent:true,opacity:.9}));
  line.renderOrder=2;line.visible=false;scene.add(line);return {connection,line};
 }):[];
 function updateConnections(s:ViewState){
  for(const {connection,line} of connectionLines){
   line.visible=s[connection.kind]&&(!s.connectionsOnly||connection.from===s.selected||connection.to===s.selected);
   if(!line.visible)continue;
   const a=objects.get(connection.from)!,b=objects.get(connection.to)!;
   const start=new T.Box3().setFromObject(a).getCenter(new T.Vector3()),end=new T.Box3().setFromObject(b).getCenter(new T.Vector3());
   const lift=Math.max(start.y,end.y)+(connection.kind==='power'?.52:.35);
   const points=[start,new T.Vector3(start.x,lift,start.z),new T.Vector3(end.x,lift,end.z),end];
   line.geometry.dispose();line.geometry=new T.BufferGeometry().setFromPoints(points);line.computeLineDistances();
  }
 }
 const arrows=new T.Group();scene.add(arrows);
 for(let n=0;n<3;n++){const direction=kind==='server'?new T.Vector3(0,0,-1):mode==='raised'?new T.Vector3(0,1,0):new T.Vector3(-1,0,0);const origin=kind==='server'?new T.Vector3((n-1)*1.3,1.1,3):mode==='raised'?new T.Vector3(0,-.85,(n-1)*2):new T.Vector3(2,1,(n-1)*1.6);arrows.add(new T.ArrowHelper(direction,origin,kind==='server'?5.8:2.5,new T.Color(color('cooling')), .3,.18));}
 let previous:ViewState|undefined,frame=0;
 function fit(preserveDirection=false){
  camera.aspect=el.clientWidth/Math.max(1,el.clientHeight);camera.updateProjectionMatrix();const s=latest.current;const previousDirection=camera.position.clone().sub(orbit.target).normalize();const focused=s.focus?objects.get(s.selected):undefined;const bounds=new T.Box3();for(const group of focused?[focused]:[...objects.values()].filter(g=>g.visible))bounds.union(new T.Box3().setFromObject(group));
  const center=bounds.isEmpty()?new T.Vector3():bounds.getCenter(new T.Vector3());const radius=bounds.isEmpty()?5:bounds.getBoundingSphere(new T.Sphere()).radius;const halfFov=T.MathUtils.degToRad(camera.fov/2);const limitingFov=Math.min(halfFov,Math.atan(Math.tan(halfFov)*camera.aspect));const distance=Math.max(3,radius/Math.sin(limitingFov)*1.18);orbit.target.copy(center);
  const direction=preserveDirection?previousDirection:s.preset==='front'?new T.Vector3(0,.13,1):s.preset==='rear'?new T.Vector3(0,.13,-1):s.preset==='top'?new T.Vector3(0,1,.001):new T.Vector3(.8,1.15,1.3);camera.position.copy(center).add(direction.normalize().multiplyScalar(distance));orbit.update();
 }

 function updateLabels(){
  if(kind!=='server')return;const s=latest.current;for(const button of labelButtons.values())button.style.display='none';leaders.replaceChildren();if(!s.labels)return;
  const representatives=new Set(['drive-0','fan-0','board','sink-0','dimm-0-0','psu-0','nic','backplane','controller']);
  const anchors=parts.filter(p=>(p.id===s.selected||representatives.has(p.id))&&objects.get(p.id)!.visible).flatMap(p=>{const v=new T.Box3().setFromObject(objects.get(p.id)!).getCenter(new T.Vector3()).project(camera);if(v.z< -1||v.z>1||Math.abs(v.x)>1.2||Math.abs(v.y)>1.2)return [];return [{id:p.id,name:p.name,x:(v.x+1)*el.clientWidth/2,y:(1-v.y)*el.clientHeight/2,selected:p.id===s.selected}];});
  for(const label of placeLabels(anchors,el.clientWidth,el.clientHeight)){const button=labelButtons.get(label.id)!;button.style.cssText=`left:${label.left}px;top:${label.top}px;width:${label.width}px;height:${label.height}px`;button.setAttribute('aria-pressed',String(label.selected));const line=document.createElementNS('http://www.w3.org/2000/svg','line');line.setAttribute('x1',String(label.x));line.setAttribute('y1',String(label.y));line.setAttribute('x2',String(label.left+label.width/2));line.setAttribute('y2',String(label.top+label.height/2));if(label.selected)line.classList.add('selected');leaders.appendChild(line);}
 }
 function draw(){renderer.render(scene,camera);updateLabels();}orbit.addEventListener('change',draw);
 const resize=new ResizeObserver(()=>{renderer.setSize(el.clientWidth,el.clientHeight);fit();draw();});resize.observe(el);
 const ray=new T.Raycaster();let down=[0,0],downAt=0;
 const onDown=(e:PointerEvent)=>{down=[e.clientX,e.clientY];downAt=Date.now();};
 const onUp=(e:PointerEvent)=>{if(Math.hypot(e.clientX-down[0],e.clientY-down[1])>6||Date.now()-downAt>600)return;const r=el.getBoundingClientRect();ray.setFromCamera(new T.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);const hit=ray.intersectObjects(hits.filter(h=>{let o:T.Object3D|null=h;while(o){if(!o.visible)return false;o=o.parent;}return true;}),false)[0];if(hit)pick.current(hit.object.userData.id);};
 renderer.domElement.addEventListener('pointerdown',onDown);renderer.domElement.addEventListener('pointerup',onUp);
 function tick(){frame=requestAnimationFrame(tick);const s=latest.current;if(s===previous)return;for(const p of parts){const g=objects.get(p.id)!;g.position.set(...partPosition(p,s.separation));g.visible=kind==='server'?(p.id==='lid'?!s.open:p.id==='shroud'?s.shroud:true):!(p.cover&&s.open);if(kind==='floor'&&s.selected===p.id)g.visible=true;g.traverse(o=>{if(o instanceof T.Mesh){const materials=Array.isArray(o.material)?o.material:[o.material];for(const material of materials)if(material instanceof T.MeshStandardMaterial){material.emissive.set(s.selected===p.id?color('selected'):0x000000);material.emissiveIntensity=.35;}}});}updateConnections(s);arrows.visible=s.air;if(s.reset!==previous?.reset||s.separation!==previous?.separation||(s.focus&&s.selected!==previous?.selected))fit(s.reset===previous?.reset);previous=s;draw();}fit();tick();

 return()=>{cancelAnimationFrame(frame);resize.disconnect();orbit.dispose();renderer.domElement.removeEventListener('pointerdown',onDown);renderer.domElement.removeEventListener('pointerup',onUp);scene.traverse(o=>{if(o instanceof T.Mesh||o instanceof T.Line){o.geometry.dispose();const materials=Array.isArray(o.material)?o.material:[o.material];materials.forEach(m=>m.dispose());}});renderer.dispose();renderer.domElement.remove();overlay.remove();};
 },[parts,kind,mode]);
 return <div ref={host} className="detail-canvas">{error&&<p className="scene-error" role="alert">{error}</p>}</div>;
}
export default function DetailExplorer({kind,onClose}:{kind:'server'|'floor';onClose:()=>void}){
 const body=useRef<HTMLDivElement>(null);
 const revealModel=()=>{if(window.innerWidth<960)requestAnimationFrame(()=>body.current?.scrollTo({top:0,behavior:'instant'}));};
 const [mode,setMode]=useState<'raised'|'slab'>('raised'),[query,setQuery]=useState('');
 const [state,setState]=useState<ViewState>({selected:'',separation:0,open:true,shroud:false,labels:true,air:false,power:false,data:false,connectionsOnly:false,reset:0,preset:'perspective',focus:false});
 const selectPart=(id:string)=>setState(s=>({...s,selected:id,open:id==='lid'?false:s.open,shroud:id==='shroud'?true:s.shroud}));
 const parts=useMemo(()=>kind==='server'?serverParts:floorParts(mode),[kind,mode]);const selected=parts.find(p=>p.id===state.selected),results=parts.filter(p=>`${p.name} ${p.group}`.toLowerCase().includes(query.toLowerCase()));
 useEffect(()=>{const handler=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose();};window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler);},[onClose]);
 return <main className="detail-explorer"><header className="detail-header"><button onClick={onClose}><ArrowLeft size={16}/>Room atlas</button><div><h1>{kind==='server'?'Inside a server':'Floor systems'}</h1><p>{kind==='server'?'Generic 2U anatomy · informed by Dell R760 documentation':'Structure, services & air distribution'}</p></div><span className="demo">Educational model</span></header>
 <div className="detail-body" ref={body}><section className="detail-stage" aria-label="Component visualization"><DetailScene parts={parts} state={state} onSelect={selectPart} kind={kind} mode={mode}/>
 <div className="detail-caption"><span className="eyebrow">{kind==='server'?'FRONT DRIVES → FANS → PROCESSORS → REAR I/O':mode==='raised'?'RAISED ACCESS FLOOR':'STRUCTURAL SLAB'}</span><p>{kind==='server'?'Open the enclosure. Follow each component.':mode==='raised'?'Lift the panels to reveal the supporting structure.':'A raised floor is not required for every cooling design.'}</p></div>
 {kind==='floor'&&<div className="floor-tabs"><button aria-pressed={mode==='raised'} onClick={()=>{setMode('raised');setState(s=>({...s,selected:'',reset:s.reset+1}));}}>Raised floor</button><button aria-pressed={mode==='slab'} onClick={()=>{setMode('slab');setState(s=>({...s,selected:'',reset:s.reset+1}));}}>Slab floor</button></div>}
 <div className="detail-controls" onClick={e=>{if((e.target as HTMLElement).closest('button'))revealModel();}}>{kind==='server'&&<><div className="inspection-presets" aria-label="View presets">{(['front','rear','top'] as const).map(preset=><button key={preset} aria-pressed={state.preset===preset} onClick={()=>setState(s=>({...s,preset,reset:s.reset+1}))}>{preset[0].toUpperCase()+preset.slice(1)}</button>)}<button onClick={()=>setState(s=>({...s,separation:0,open:false,shroud:true,focus:false,reset:s.reset+1}))}>Assembled</button><button onClick={()=>setState(s=>({...s,separation:1,open:true,shroud:false,focus:false,preset:'perspective',reset:s.reset+1}))}>Exploded</button></div><div className="inspection-actions"><button disabled={!selected} onClick={()=>setState(s=>({...s,focus:true,reset:s.reset+1}))}>Focus selected</button><button onClick={()=>setState(s=>({...s,focus:false,reset:s.reset+1}))}>Show assembly</button><label><input type="checkbox" checked={state.labels} onChange={e=>setState(s=>({...s,labels:e.target.checked}))}/>Labels</label><label><input type="checkbox" checked={state.shroud} onChange={e=>setState(s=>({...s,shroud:e.target.checked,selected:!e.target.checked&&s.selected==='shroud'?'':s.selected}))}/>Show shroud</label></div><div className="inspection-actions connection-controls" aria-label="Internal connections"><label className="power-key"><input type="checkbox" checked={state.power} onChange={e=>setState(s=>({...s,power:e.target.checked}))}/>Power paths</label><label className="data-key"><input type="checkbox" checked={state.data} onChange={e=>setState(s=>({...s,data:e.target.checked}))}/>Data paths</label><label><input type="checkbox" checked={state.connectionsOnly} onChange={e=>setState(s=>({...s,connectionsOnly:e.target.checked}))}/>Selected part only</label></div></>}{(kind==='server'||mode==='raised')&&<label><input type="checkbox" checked={state.open} onChange={e=>setState(s=>({...s,open:e.target.checked,selected:''}))}/>{kind==='server'?'Remove lid':'Remove panels'}</label>}<label className="detail-range">Separate parts<input type="range" min="0" max="1" step=".01" value={state.separation} onChange={e=>setState(s=>({...s,separation:Number(e.target.value)}))}/></label><label><input type="checkbox" checked={state.air} onChange={e=>setState(s=>({...s,air:e.target.checked}))}/>Airflow</label><button aria-label="Reset component view" onClick={()=>setState(s=>({...s,selected:'',open:true,shroud:false,labels:true,separation:0,air:false,power:false,data:false,connectionsOnly:false,preset:'perspective',focus:false,reset:s.reset+1}))}><RotateCcw size={16}/></button></div><div className="detail-note">{kind==='server'&&(state.power||state.data)?'Dashed paths show relationships through covers, not physical cable routes or a wiring guide':state.air?'Arrows explain direction only · no thermal simulation':'Drag to orbit · Scroll to zoom · Select a part'} · Schematic geometry</div>
 </section><aside className="detail-sidebar" aria-label="Component catalogue"><div className="detail-description" aria-live="polite"><span className="eyebrow">{selected?.group??'EXPLORER GUIDE'}</span><h2>{selected?.name??(kind==='server'?'Anatomy of a 2U server':'The floor is a system')}</h2><p>{selected?.description??(kind==='server'?'Select a part in the model or index. Use Separate parts to spread the assembly apart. Labels identify key parts; select any indexed component to label and highlight it. Use Focus selected for a closer view. Enable Power paths or Data paths to trace relationships; Selected part only limits them to your selection.':'Compare two floor architectures. Select the slab, a panel, support, service route, or rack contact to learn its role.')}</p>{selected&&<p className="part-role">Function: {selected.role}</p>}{kind==='server'&&selected&&<div className="component-connections"><p>{componentNotes[selected.id]}</p><h3>Connections</h3>{serverConnections.filter(c=>c.from===selected.id||c.to===selected.id).map(c=>{const other=parts.find(p=>p.id===(c.from===selected.id?c.to:c.from))!;return <div key={c.id} className="connection-entry"><button onClick={()=>selectPart(other.id)}>{other.name}</button><small className={c.kind==='power'?'power-key':'data-key'}>{c.kind==='power'?'Power':'Data'} · {c.medium}</small><p>{c.description}</p></div>;})}{!serverConnections.some(c=>c.from===selected.id||c.to===selected.id)&&<p>No electrical path is illustrated for this mechanical or thermal component.</p>}</div>}<a href={references[kind]} target="_blank" rel="noreferrer">{kind==='server'?'Dell technical reference':'Floor architecture reference'}<ExternalLink size={12}/></a></div>
 {kind==='floor'&&<div className="load-note"><strong>Load capacity: not specified</strong><p>Slab, panel, concentrated and rolling loads require a site-specific assessment.</p></div>}
 <label htmlFor="part-search" className="search-label">Find a component · {results.length}</label><div className="search"><Search size={15}/><input id="part-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Fans, memory, slab…"/></div><div className="part-index">{results.map(p=><button key={p.id} aria-pressed={p.id===state.selected} onClick={()=>selectPart(p.id)}><span className={`dot tone-${p.color}`}/><span>{p.name}<small>{p.group}</small></span></button>)}{!results.length&&<div className="empty"><p>No components match “{query}”.</p><button onClick={()=>setQuery('')}>Clear search</button></div>}</div></aside></div></main>;
}
