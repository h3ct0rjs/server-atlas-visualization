# Datacenter Atlas: detailed equipment and floor research

Research date: 2026-09-09. This document records web findings and proposes the next implementation. No external model has been downloaded, converted, or integrated.

## Current status

The initial application uses 88 schematic objects and five systems. Its floor is a visual grid, not an infrastructure model. Server boxes do not yet expose internal components. Previous tests and production build passed; the final multi-width browser checks were incomplete.

## Model candidates and evidence

| Candidate | Verified evidence | Integration assessment |
| --- | --- | --- |
| Dell PowerEdge R760 official service manual | Labels backplanes, PERC, fans, air shrouds, DIMM sockets, risers, system board, and two PSUs; shows air and liquid-cooled configurations. | Strong primary reference for a separately authored educational model. Documentation availability does not establish an open CAD license. |
| Dell PowerEdge R630 by a third-party seller on 3DExport | A model listing and Basic/Extended royalty-free licenses exist. Listing explicitly restricts redistribution of the purchased resource. | Not an open asset for bundling into a public model repository. No purchase made. Internal component separation not validated. |
| Dell PowerEdge model by nando59 on Sketchfab | Search-indexed creator listing reports 355.2k triangles. Direct page retrieval failed. | Download availability, license, named server generation, and internal structure remain unverified. Do not treat as approved for integration. |
| OCP DC-MHS | Official catalogue lists STP mechanical CAD for host processor module forms and supporting specifications. | Strong engineering candidate; these are modular server interfaces/components, not complete Dell-branded machines. Inspect the actual contribution's license and assembly structure before import. |
| OCP Project Olympus | Official repository describes open server hardware and mechanical assemblies. README states OWFa 1.0 for specifications/designs and subdirectories. | Candidate for an open engineering reference. Confirm the specific assembly files and attached notices before converting. |
| OCP Open Rack V3 | Official catalogue includes rack/power mechanical references. IT Gear Design Guide identifies reference chassis CAD collateral and carries CC BY-SA 4.0 for the guide. | Useful rack, power shelf, and liquid-cooling interface reference. The guide's license must not be assumed to cover every linked CAD archive. |
| Rittal VX IT | Manufacturer CAD catalogue exposes product configurations and a Download CAD action. | Useful vendor rack reference. Availability alone does not establish open redistribution rights; terms and file formats still need inspection. |

No official openly redistributable Dell PowerEdge 3D assembly was verified in this search. This is a bounded search result, not a claim that none exists.

Sources:
- [Dell R760 internals](https://www.dell.com/support/manuals/en-us/poweredge-r760/per760_ism_pub/inside-the-system?guid=guid-043d9f52-a16e-4494-a65a-128c47fd4ea4&lang=en-us)
- [R630 model listing and license summary](https://3dexport.com/3d-model-dell-poweredge-r630-134516)
- [Sketchfab creator listing](https://sketchfab.com/3d-models/server-dell-poweredge-1a605b3fb42c4c78a06380bfdca0d453)
- [OCP DC-MHS CAD catalogue](https://www.opencompute.org/wiki/Server/MHS/DC-MHS-Specs-and-Designs)
- [Project Olympus repository and license notice](https://github.com/opencomputeproject/Project_Olympus/blob/master/README.md)
- [Open Rack specifications and designs](https://www.opencompute.org/wiki/Open_Rack/SpecsAndDesigns)
- [ORv3 IT Gear Design Guide](https://www.opencompute.org/documents/ocp-orv3-it-gear-design-guide-rev-02-june032024-pdf)
- [Rittal VX IT manufacturer CAD catalogue](https://rittal-usa.partcommunity.com/3d-cad-models/?info=rittal_usa%2Fit_solutions%2F0_it_gehaeuse%2Fvx_it_13x_asmtab.prj)

## Proposed exploration hierarchy

Facility → room → row/aisle → rack → equipment → replaceable component → port/connection.

The following is a proposed atlas scope, not a claim that every datacenter contains every item.

| System | Components to expose | Useful interactions |
| --- | --- | --- |
| Server | Chassis/lid, drive carriers, backplane, motherboard, CPU/heatsinks, DIMMs, fan wall, shrouds, PCIe risers, NIC, storage controller, management interface, PSUs | Remove lid; explode components; select a part; trace power, data, and airflow independently |
| Rack | Posts/rails, numbered U positions, doors/panels, blanking panels, cable managers, A/B PDUs, grounding points, feet/casters | Front/rear views; slide a server on its rails; show occupied U slots and service clearance |
| Networking | Leaf/spine switches, management switches, patch panels, transceivers, fiber/copper leads | Port-to-port selection; distinguish physical routing from logical topology |
| Electrical | Utility entry, switchgear, transfer equipment, generator, UPS/batteries, distribution, busway, rack PDU, server PSU | Trace a documented A/B power path; identify shared dependencies |
| Cooling | Air handler, fan, coil, hot/cold aisles, containment; optional CDU, pipes, manifolds and cold plates | Show supply/return paths; compare air and liquid configurations; distinguish explanation from simulation |
| Floor/building | Slab, optional raised floor tiles, stringers, pedestals, plenum, perforated tiles, sealed cable openings, overhead trays | Cutaway; lift an unloaded example tile; compare raised-floor and slab configurations |
| Monitoring/protection | Temperature/humidity sensors, leak sensors, smoke detection, suppression, access control | Inspect sensor purpose and placement; connect to live data only in a later integration |

The Dell R760 manual above supports the server breakdown. Dell's [installation documentation](https://www.dell.com/support/kbdoc/en-us/000203859/install-and-setup-poweredge-rack-and-tower-servers-and-configure-idrac-and-ism-documentation-videos) distinguishes sliding/static rails and cable management accessories.

## Why the floor matters

A structural floor is fundamental; a raised access floor is an optional architecture. Both raised-floor and non-raised-floor cooling designs exist. [Schneider Electric comparison](https://download.schneider-electric.com/files?p_Doc_Ref=SPD_SADE-5TNQYN_EN&p_File_Name=SADE-5TNQYN_R3_EN.pdf&p_enDocType=White+Paper), [Vertiv non-raised-floor cooling paper](https://www.vertiv.com/en-us/about/news-and-events/articles/white-papers/overcoming-the-challenges-in-cooling-non-raised-floor-data-centers/).

1. **Structural support and movement.** The atlas should distinguish equipment mass, contact locations at feet/casters, concentrated load, and rolling load along a delivery route. Average rack weight divided by footprint is not a complete floor assessment. Dell's product-specific planning guidance treats concentrated and rolling loads separately; its numerical limits must not be reused as universal datacenter limits. [Dell floor load guidance](https://www.dell.com/support/manuals/en-us/disk-library-for-mainframe-dlm2700/dlm70_plang/site-floor-load-bearing-requirements?guid=guid-7f583abc-56e0-4087-9826-4493fa445f2a&lang=en-us).
2. **Air distribution.** In an underfloor supply design, the plenum and perforated tiles are part of the cooling path. Tile placement, leakage, and obstructions matter. A raised floor used only for services should not automatically display cooling airflow. [Schneider containment scenarios](https://blog.se.com/datacenter/architecture/2013/07/18/4-scenarios-and-solutions-for-air-containment-systems-in-existing-data-centers/).
3. **Cabling and service access.** Underfloor cable congestion can obstruct supply airflow; unsealed cutouts allow bypass leakage. Show routes and penetrations explicitly, with overhead distribution as an alternative. Do not generalize example efficiency percentages into this model. [Schneider underfloor cabling explanation](https://blog.se.com/datacenter/architecture/2012/06/26/3-ways-that-under-floor-cabling-causes-data-center-energy-loss/).

Recommended floor comparison:

| Raised-floor example | Slab-floor example |
| --- | --- |
| Structural slab plus pedestals, stringers and removable panels | Exposed structural slab beneath equipment |
| Optional underfloor cooling plenum | Room/row/overhead cooling arrangement |
| Supply tiles in cold aisles if the plenum carries supply air | Explicit supply/return paths and containment |
| Sealed penetrations and visible service congestion | Overhead cable trays/busways and visible service routes |
| Panel, support structure and slab load properties | Slab load properties and equipment contact points |

Actual suitability depends on the building and equipment configuration. Keep numerical capacity fields unknown until supplied from a site-specific assessment; the atlas should not certify structural safety.

## Recommended next implementation

1. Add a detailed, separately authored 2U educational server with selectable internals, using Dell's R760 manual as a factual reference and labeling schematic geometry honestly.
2. Add a floor cutaway with raised-floor/slab modes and linked hot/cold aisle explanations.
3. Evaluate one OCP mechanical assembly for license, named subassemblies, units, physical size, and conversion quality.
4. Convert approved CAD to GLB for the viewer; retain part IDs and hierarchy. Use simplified room-level geometry and load detailed internals only when inspecting a server.
5. Keep an asset manifest: creator, original URL, exact model/revision, license text, redistribution status, modifications, units, triangle count, and validation notes. Do not infer that a realistic exterior mesh includes explodable internals.

This research does not change the running scene. The recommended sequence is ready for the next development pass.
