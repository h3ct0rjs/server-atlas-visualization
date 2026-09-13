# Educational 2U server geometry

The server explorer is a separately authored schematic implemented in `src/server-geometry.ts`. It contains 36 selectable components described in `src/detail-models.ts`. It is not imported Dell CAD, a measured PowerEdge assembly, or a service procedure.

## Reference and fidelity

The component taxonomy follows the [Dell PowerEdge R760 inside-the-system reference](https://www.dell.com/support/manuals/en-us/poweredge-r760/per760_ism_pub/inside-the-system?guid=guid-043d9f52-a16e-4494-a65a-128c47fd4ea4&lang=en-us), as recorded in [the prior research](model-and-floor-research.md). This reference establishes recognizable categories: system board, processors and memory, fans and air shrouds, storage backplane, PCIe expansion and power supplies. The scene's counts, proportions, placements and connectors are illustrative. No source mesh, vendor logo or texture is bundled.

The authored geometry adds:

- A metal tray, folded side flanges, mounting ears, rail tracks, rear ventilation and removable cover latch.
- Front drive carriers with housings, release handles, vent slots, status indicators and rear connectors.
- A PCB with socket shapes, board logic and edge connectors; processor packages with heat spreaders; heatsinks with longitudinal fins; DIMMs with memory packages, gold contacts and retaining clips.
- Fan frames with hubs, blades and lift tabs; a removable shroud with guide walls.
- Backplane drive connectors, a PCIe riser, a network adapter with two schematic port openings and a storage controller with cable sockets.
- Rear power modules with inlet recesses, ventilation, extraction handles and output connectors.

The illustrations do not specify port speed, connector pinouts, certified dimensions, cable wiring, supported drive protocol, or model-specific memory population rules. Eight illustrated DIMMs, six carriers and six fan modules are teaching choices. Atlas coordinates are arbitrary display units. Airflow arrows describe front-to-rear direction, not a calculated thermal field.

## Interaction and implementation

`buildServerPart(part, color)` returns a group centered on the component's local origin. The scene applies `partPosition` to assemble or separate it. Every descendant mesh carries the owning component ID, so selecting a fin, handle or chip selects the correct catalog item. Detailed subgeometry is decorative within the selectable parent assembly; it does not imply each surface is independently serviceable.

The default view removes the lid and shroud for visibility. The assembled depth positions separate the rear power modules from the DIMMs. Exploded offsets are teaching positions, not a removal sequence or collision-free mechanical animation. The rear ventilation panels are simplified; connector apertures are not machined CAD cutouts.

Validation covers finite mesh bounds, component IDs on all pickable descendants, the material contract used by selection, recognizable fin/port structure and the assembled DIMM/PSU non-intersection. A browser check is still needed for visual framing and interaction after changes.

## Internal connections

`src/server-connections.ts` defines generic power and data relationships plus configuration notes for all 36 components. The explorer draws dashed overlays with separate power/data controls and optional selected-component filtering. The paths move with exploded parts and remain visible through covers. Their shape is a diagram layout, not a physical harness route. Descriptions distinguish illustrative cables from PCB traces, slot contacts, and mating connectors. Intermediate distribution hardware and detailed lane/channel assignments are omitted. No vendor-specific wiring or redundancy behavior is asserted.
