# Datacenter Atlas

An interactive 3D explorer for datacenter infrastructure, inspired by the exploration patterns in the local Human Atlas project. This is a separate implementation with procedural equipment geometry; no anatomy code or model assets are copied.

## Run

Use Node.js 22.18+ (Node.js 24 recommended).

```sh
npm ci
npm run dev
```

Open http://localhost:3017. Direct explorer links: http://localhost:3017/#server and http://localhost:3017/#floor. The active explorer survives a refresh, and browser Back/Forward follows view changes. Build with `npm run build`; static output is in `dist/`.

## Explore

- Orbit and zoom around a sample room with 8 racks and 88 selectable objects.
- All 48 compute/storage nodes reuse the detailed server assembly. Toggle **Open servers** for an interior view, or isolate equipment for a close look; the inspector collapses to keep the model visible. Room models are scaled to the schematic inventory envelope, not manufacturer dimensions.
- Show or hide racks, compute, networking, power, and cooling.
- Search by name, equipment type, or rack ID.
- Select equipment in the model or accessible inventory to inspect its role.
- Isolate a component or a rack with its contents.
- Separate equipment, switch to a top view, and reveal logical leaf-to-spine links.
- Reset the camera and filters together.

All data is illustrative. There is no live telemetry, vendor-specific CAD, capacity calculation, thermal simulation, or actual cable routing. Dimensions are schematic. Spine switches float above the room to make the topology readable.

## Room floor and racks

Open **Room settings** to switch between raised access floor and structural slab, cut away unloaded panels, lift/reseat individual panels, and show front/rear service guides. Clicking an unloaded panel also toggles its lifted position. Panels beneath equipment remain seated. The support structure includes the perimeter grid; capacities are unspecified. Floor and guide layers hide during equipment separation; the floor also hides when isolating equipment.

Racks have numbered 42U rails, 14U of mounted equipment, 28U of blanking panels, vertical cable managers, and leveling feet. Open **Rack unit map** in a rack's inspector to select mounted equipment by unit. Amber front and green rear guides are qualitative; they do not certify service distances. All equipment sizes and U spacing are schematic scene units.

## Detailed explorers

Use **Inside a server** for a separately authored schematic 2U assembly: 36 selectable parts with detailed subgeometry, leader labels, independent lid/shroud visibility, front/rear/top presets, exploded positions, focus controls, search, explanatory airflow, and independent power/data relationship overlays. Select a component to read its connection medium and configuration notes, follow a connected component, or restrict the overlay to that part. Dashed lines remain visible through covers and describe relationships rather than physical cable routes. It uses Dell R760 documentation as a factual reference; it is not official Dell CAD or an exact R760 configuration.

Use **Floor systems** to compare raised-access and slab-floor examples. Inspect panels, pedestals, stringers, slab, cable routes, and rack contact points. Panels can be removed or separated. Airflow arrows are illustrative and load capacity is deliberately unspecified.

Return with **Room atlas** or Escape. The selected room equipment and filters are retained.

## Project structure

- `src/atlas.ts`: typed equipment catalogue, relationships, and search.
- `src/room-floor.ts`: room floor panels, support structure, and lift/cutaway state.
- `src/rack-model.ts`: numbered racks, blanking, cable managers, feet, and clearance guides.
- `src/room-server.ts`: shared, material-batched server geometry for the room.
- `src/Scene.tsx`: procedural Three.js models, orbit controls, picking, and system visibility.
- `src/App.tsx`: explorer controls and inspector.
- `src/DetailExplorer.tsx`: component explorer and detail renderer.
- `src/detail-models.ts`: procedural server and floor components.
- `src/server-connections.ts`: illustrative power/data relationships and configuration notes.
- `src/server-geometry.ts`: detailed meshes for server components.
- `src/detail-labels.ts`: collision-aware label placement.
- `tokens.css` and `src/styles.css`: visual system and responsive interface.

Add equipment and specifications in `src/atlas.ts`. Future extensions could add rack-unit placement, dual power feeds, physical ports and cable paths, site/building/room hierarchy, and an inventory import adapter.

## Validate

```sh
npm test
npm run build
```

Tests validate equipment references, redundant logical fabric endpoints, search filtering, and server containment within rack bounds. Browser verification details are recorded in `VERIFICATION.md`.
