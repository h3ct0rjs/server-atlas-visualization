// Unknown ratings remain null; none can be inferred from this schematic geometry.
export const floorLoadProperties = [
 {id:'slab',name:'Structural slab',capacity:null,description:'Building support, spans and the complete installation load.'},
 {id:'panel',name:'Access panel assembly',capacity:null,description:'Panel and understructure ratings for the installed floor system.'},
 {id:'concentrated',name:'Concentrated load',capacity:null,description:'Local forces at equipment feet or stationary caster contact points.'},
 {id:'rolling',name:'Rolling load',capacity:null,description:'Moving wheel loads along the delivery and service route.'},
] as const;
