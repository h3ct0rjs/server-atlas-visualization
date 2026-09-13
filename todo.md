# Datacenter Atlas — pending work

Updated: 2026-09-13

Server internals, room floor integration, and rack detail are complete. The next priorities are verification, floor-model consistency, airflow/containment, and service routing. The remaining items form the backlog; they are not all committed to the next development pass.

Six focused issues are published in [h3ct0rjs/server-atlas-visualization](https://github.com/h3ct0rjs/server-atlas-visualization/issues). See [the issue index](docs/github-issues/README.md) for links and local copies.

## Current baseline

- Room explorer: 88 schematic objects; all 48 compute/storage nodes now reuse the detailed server assembly with an open-cover toggle.
- Server explorer: 36 selectable components, removable covers, separation control, search, and explanatory airflow arrows.
- Floor explorer: raised-floor and slab examples with selectable components.
- Nineteen model/data/label/connection/room-integration tests and the production build pass.
- The updated server geometry, labels, presets, focus, search and cover controls have been checked in the browser. Responsive label bounds were checked at 320 / 375 / 414 / 768 px; physical touch and exhaustive accessibility checks remain pending.
- No external vendor CAD has been imported. Current geometry is separately authored and schematic.

## 1. Realistic server internals and labels

Completed the geometry/label milestone with two agents. Completed: schematic internal power/data relationships and fuller component explanations. Room floor/rack integration is also complete. Next: finish verification coverage, then develop airflow/containment and service routing. Geometry remains educational; no exact Dell configuration or collision-free mechanical disassembly is claimed.

- [x] Choose and document the reference configuration for the detailed server; distinguish generic geometry from any model-specific Dell R760 facts.
- [x] Improve the chassis: front bezel, mounting ears, lid, rear panel, rails, handles, and drive-carrier latches.
- [x] Improve motherboard detail and layout: processor sockets, heatsinks, DIMM slots, connectors, and management electronics.
- [x] Add recognizable drive carriers, backplane connections, fan cages, fan rotors, and air shrouds.
- [x] Improve PCIe risers, storage controller, NIC ports, transceiver openings, and PSU inlets/handles.
- [x] Add schematic internal data/power cable and interconnect relationships, with separate overlays and selected-part filtering; physical routes remain unspecified.
- [x] Add visible component labels with leader lines and a label visibility toggle.
- [x] Prevent label overlap and hide or group labels that are too small at the current zoom.
- [x] Highlight a component consistently from canvas selection and the searchable index.
- [x] Add focus-on-selection and a reliable return-to-assembly camera action.
- [x] Improve the exploded layout so components and their labels remain separated and easy to follow.
- [x] Give the lid and air shroud independent visibility controls.
- [x] Add front, rear, top, assembled, and exploded view presets.
- [x] Expand all 36 component descriptions with function, clickable connections, and configuration-dependent details.
- [x] Clearly label the geometry's accuracy, reference source, and any simplified component counts.

## 2. Verification and usability

- [x] Check server selection, search, independent covers, separation, airflow, presets, and focus in the browser.
- [ ] Complete reset and return-to-room state preservation regression coverage.
- [x] Check both floor modes, panel removal, service selection, and airflow in the browser.
- [ ] Complete floor search and reset regression coverage.
- [x] Inspect desktop screenshots and measure responsive control/label bounds at 320 / 375 / 414 / 768 px.
- [ ] Complete visual inspection of every open detail panel at narrow widths.
- [ ] Check keyboard navigation, focus visibility, control names, and component selection without a pointer.
- [ ] Check touch selection versus orbit/pinch gestures on a physical device when available.
- [ ] Check camera framing for isolated equipment and exploded assemblies at narrow aspect ratios.
- [ ] Inspect browser errors, rendering performance, and GPU resource cleanup during repeated explorer changes.
- [ ] Resolve meaningful regressions with targeted tests; rerun the build after changes.
- [x] Update `VERIFICATION.md` with actual outcomes and remaining limitations.

Browser access resumed for this update. Previous usage-limit interruption no longer blocks the recorded checks. Remaining unchecked verification items require further coverage, not a current approval request.

## 3. Floor and room integration

- [x] Reuse detailed server geometry across all 48 room compute/storage nodes, with shared geometry, independent selection, and an open-cover toggle.
- [x] Collapse the equipment inspector on isolation so the new model remains visible.

- [x] Integrate slab, raised panels, and support structure into the main datacenter scene.
- [x] Add a room-level raised-floor / slab selector and a cutaway control for unloaded panels.
- [x] Add a complete room support grid and perimeter supports with seated panels over equipment footprints.
- [ ] Improve service penetrations with real openings and synchronize the standalone floor detail model.
- [x] Lift and reseat individual unloaded room panels by clicking or using the service-panel selector.
- [ ] Show hot/cold aisle orientation and distinguish air supply from return paths.
- [ ] Add containment, sealed cable openings, and overhead versus underfloor routing.
- [x] Represent rack leveling feet and floor contact locations; caster variants remain optional.
- [ ] Keep slab, panel, concentrated-load, and rolling-load properties separate; leave unknown capacities unspecified.
- [ ] Add explanatory obstruction/leakage examples without presenting them as CFD or structural calculations.

## 4. Open model evaluation and import

- [ ] Inspect one OCP Project Olympus or DC-MHS mechanical assembly as the first import candidate.
- [ ] Verify the exact file's creator, revision, license, attribution, and redistribution conditions.
- [ ] Check units, dimensions, assembly hierarchy, internal detail, and named parts before selecting a model.
- [ ] Evaluate Rittal rack CAD terms separately from download availability.
- [ ] Continue looking for Dell server models only where download and reuse rights can be verified; do not treat a marketplace preview as an open asset.
- [ ] Convert an approved model to GLB while retaining component IDs and hierarchy.
- [ ] Simplify geometry and textures; use lightweight room models and load detailed internals on demand.
- [ ] Update `docs/asset-manifest.json` with source, license, modifications, scale, and validation notes for each imported asset.
- [ ] Preserve required attribution and license notices in the delivered project.

See `docs/model-and-floor-research.md` for the existing source shortlist and findings.

## 5. Broader datacenter detail — later backlog

- [ ] Add facility → room → row/aisle → rack → equipment → component → port navigation.
- [x] Add 42U numbered mounting positions, a clickable occupancy map, matching blanking panels, vertical cable managers, leveling feet, and schematic front/rear clearance guides.
- [ ] Distinguish physical port-to-port cable routes from logical leaf/spine links.
- [ ] Add management networking, patch panels, transceivers, and fiber/copper connections.
- [ ] Represent A/B power paths through rack PDUs and server PSUs, including shared upstream dependencies.
- [ ] Extend electrical equipment to distribution, UPS/batteries, transfer equipment, and generators.
- [ ] Extend cooling to containment, room/row equipment, and optional liquid-cooling CDUs, manifolds, pipes, and cold plates.
- [ ] Add temperature/humidity, leak, smoke, and access-control components with explanations.
- [ ] Define an inventory import format and validation rules before adding real infrastructure data.
- [ ] Consider live telemetry only after the static model and data mapping are established.

## 6. Delivery and maintenance

- [x] Add direct links to the server and floor explorers so users can open and refresh the intended view.
- [x] Make new explorer entry points easy to discover from the room and selected equipment.
- [ ] Review bundle splitting and lazy loading; the production build currently reports a large-bundle advisory.
- [ ] Keep the README, research notes, asset manifest, verification record, and this backlog aligned with shipped behavior.

Public hosting, purchasing models, and connecting live infrastructure are not part of the currently requested work.
