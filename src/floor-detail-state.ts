import type {Part} from './detail-models.ts';
export function floorPartVisible(part:Part,parts:readonly Part[],removed:boolean,selected:string):boolean {
 const selectedPart=parts.find(p=>p.id===selected);
 const panel=part.parentPanel?parts.find(p=>p.id===part.parentPanel):part;
 return !panel?.cover||!removed||selected===panel.id||selectedPart?.parentPanel===panel.id;
}
