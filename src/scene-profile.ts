import * as T from 'three';
const enabled=typeof location!=='undefined'&&new URLSearchParams(location.search).get('profile')==='1';
const live=new Map<number,()=>unknown>();
let nextId=0,mounts=0,unmounts=0,panel:HTMLPreElement|undefined,timer:ReturnType<typeof setInterval>|undefined,lastDisposed:unknown;
function publish(){
 if(!panel){const details=document.createElement('details');details.style.cssText='position:fixed;left:8px;bottom:8px;z-index:100;background:white;color:#172b36;max-width:calc(100vw - 16px);max-height:50vh;overflow:auto;border:1px solid #71808a;padding:8px;font:11px monospace';const summary=document.createElement('summary');summary.textContent='Scene diagnostics';details.append(summary);panel=document.createElement('pre');panel.style.whiteSpace='pre-wrap';details.append(panel);document.body.append(details);}
 panel.textContent=JSON.stringify({active:live.size,mounts,unmounts,canvasCount:document.querySelectorAll('canvas').length,scenes:[...live.values()].map(read=>read()),lastDisposed},null,2);
}
/** Opt-in local/browser measurement surface; no telemetry is transmitted. */
export function profileScene(name:string,renderer:T.WebGLRenderer,scene:T.Scene){
 if(!enabled)return {draw:()=>{},dispose:()=>{}};
 const id=++nextId;mounts++;let draws=0,drawMs=0,firstDrawMs=0;
 const read=()=>{const geometries=new Set(),materials=new Set(),textures=new Set();scene.traverse(o=>{if(o instanceof T.Mesh||o instanceof T.Line||o instanceof T.Sprite){if('geometry' in o)geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material]){materials.add(m);for(const value of Object.values(m))if(value instanceof T.Texture)textures.add(value);}}});return {name,firstDrawMs,geometries:geometries.size,materials:materials.size,textures:textures.size,gpu:{...renderer.info.memory},programs:renderer.info.programs?.length,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,draws,averageSubmitMs:draws?Number((drawMs/draws).toFixed(2)):0};};
 live.set(id,read);if(!timer)timer=setInterval(publish,1000);publish();
 return {draw(ms:number){if(!draws)firstDrawMs=Number(performance.now().toFixed(1));draws++;drawMs+=ms;},dispose(){lastDisposed={name,gpu:{...renderer.info.memory},programs:renderer.info.programs?.length};live.delete(id);unmounts++;if(!live.size){clearInterval(timer);timer=undefined;}publish();}};
}
