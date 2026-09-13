export type LabelAnchor={id:string;name:string;x:number;y:number;selected:boolean};
export type PlacedLabel=LabelAnchor & {left:number;top:number;width:number;height:number};
/** Selected component wins; remaining labels are omitted when space runs out. */
export function placeLabels(anchors:LabelAnchor[],width:number,height:number,topInset=86,bottomInset=20):PlacedLabel[]{
 const labelWidth=Math.min(154,Math.max(110,width*.32)),labelHeight=44,gap=8,result:PlacedLabel[]=[];
 const bottom=height-bottomInset-labelHeight;
 if(bottom<topInset||width<labelWidth+16)return result;
 for(const anchor of [...anchors].sort((a,b)=>Number(b.selected)-Number(a.selected))){
  const left=anchor.x<width/2?8:width-labelWidth-8;
  const desired=Math.max(topInset,Math.min(bottom,anchor.y-labelHeight/2));
  const slots=[desired];for(let step=1;step<Math.ceil(height/(labelHeight+gap));step++)slots.push(desired-step*(labelHeight+gap),desired+step*(labelHeight+gap));
  const top=slots.find(y=>y>=topInset&&y<=bottom&&!result.some(p=>left<p.left+p.width+gap&&left+labelWidth+gap>p.left&&y<p.top+p.height+gap&&y+labelHeight+gap>p.top));
  if(top!==undefined)result.push({...anchor,left,top,width:labelWidth,height:labelHeight});
 }
 return result;
}
