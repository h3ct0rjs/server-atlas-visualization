# Verification

- `npm test`: 3 passing checks for identifiers and relationships, search filtering, and rack containment.
- `npm run build`: TypeScript and production build pass. Vite reports a bundle-size advisory for the Three.js application bundle (approximately 690 kB uncompressed).
- In-app browser: 3D rendering, equipment search, rack selection, rack isolation (10 objects), network-path toggle, and top-view toggle exercised. No browser warnings or errors observed during these checks.
- Desktop screenshot checked at 1280 × 720. Fixed controls falling below the viewport.
- Narrow screenshot checked at 320 × 700. Improved camera fitting after observing clipped equipment.
- Physical touch devices and real multitouch gestures have not been tested.

The sample is schematic and has no live operational data.
- The browser session became unavailable during the final multi-width check; 375/414/768 px verification and the final camera-adjustment screenshot remain unverified.

## Server and floor explorer update

- Six model/data tests pass, including both floor architectures and removable server covers.
- TypeScript and production build pass.
- Local preview restarted on port 3017. Browser automation timed out and then reported no available browsers; visual and interaction checks for these new explorers remain unverified.
- No vendor CAD files were imported. All new geometry is separately authored and schematic.

## Detailed geometry and labels milestone

- Eleven tests pass: IDs/references, search filtering, rack containment, valid detail assemblies, floor architecture distinction, independent covers, DIMM/PSU separation, nested mesh picking/material contracts, fin/port geometry, and collision-aware label placement.
- TypeScript and production build pass; the large JavaScript bundle advisory remains.
- Browser checked: direct #server/#floor links and server refresh; floor mode switch and service selection; floor panels and airflow; server list/label selection, focus, return to assembly, front/rear/top and exploded/assembled presets, independent covers, labels, airflow, empty search and recovery.
- Desktop server screenshots inspected. Responsive bounds inspected at 320 / 375 / 414 / 768 px; measured document widths matched viewports, controls stayed within width, and sampled labels did not overlap.
- Corrected stylesheet order conflict that placed controls over the model. Added narrow-screen scroll restoration after camera actions; verified canvas returns to the top of the scroll area.
- No console errors observed in the sampled interactions. Physical-device multitouch, exhaustive keyboard/accessibility review, and long-run GPU/performance checks remain unverified.

## Internal connections milestone — 2026-09-10

- Fourteen tests and the production build pass. Added graph checks for endpoints, passive-part exclusion, complete component notes, and storage/network/memory relationships.
- Browser checked independent power/data toggles, selected-part filtering, exploded view, connection navigation from controller to backplane, and reset clearing all connection controls. Inspected the overlay in the live 593 px pane; document width matched the viewport and controls fit within it.
- Separated power/data route heights so links sharing endpoints remain distinguishable. Paths are relationship overlays, visible through covers; physical cable routing is not modeled.
- A temporary Vite missing-import overlay appeared while the agent was creating the data module; it cleared once integration completed. Exhaustive responsive, keyboard, physical-touch, and GPU-lifetime checks remain pending. The production bundle advisory remains (approximately 730 kB minified).

## Detailed models in the room — 2026-09-10

- All 48 compute/storage room nodes now use the authored server assembly, merged into material batches and shared across instances. Materials remain independent for equipment selection.
- Fifteen tests pass, including bounds/centering against all 48 inventory envelopes, bounded mesh count, shared geometry, independent highlight materials, and room-level picking IDs. Production build passes with the existing bundle-size advisory.
- Browser screenshots inspected for full room, isolated open server, and closed server. Checked inventory selection, cover toggle, compact inspector on isolation, and entry to internals/return preserving selection, isolation, and cover state. These checks used the live narrow preview pane.
- Picking now checks ancestor visibility for nested meshes, including hidden covers and filtered equipment. Geometry/material cleanup accounts for shared room templates. Long-run GPU and physical-device performance remain unmeasured.

## Room floor and rack detail — 2026-09-10

- Nineteen tests and the production build pass. Added checks for 42U assignments without overlaps, 28 blanked units per rack, numbered-rail geometry, cabinet bounds and foot contact, independent panel lifting, loaded-panel protection, slab surface height, and batched floor support geometry.
- Browser checked: room floor selector, slab mode disabling panel actions, raised-floor cutaway, selected panel lift/reseat, clearance toggle, rack occupancy map (42 entries, 14 occupied), navigation from a rack slot to its switch, isolation, and reset. Screenshots inspected for floor cutaway and isolated detailed rack. Live pane measured 593 px with no horizontal document overflow.
- Room servers/switches now align with their declared mounting units. Vertical PDUs are positioned behind the servers. Each rack has leveling feet; caster variants are not modeled.
- Floor panels under equipment remain seated. Floor and service guides hide during separation; the floor also hides during isolation. The standalone floor explorer remains a separate, more simplified teaching model.
- Long-run GPU behavior, physical-device gestures, exhaustive responsive/keyboard coverage, and direct canvas panel-picking regression remain pending. No structural capacities or approved service distances are assigned. Production bundle advisory remains (approximately 747 kB minified).

## Cloudflare CI/CD preparation — 2026-09-15

- Nineteen tests pass after upgrading Vite to 8.3.0 and adding pinned Wrangler 4.131.1. Production build and Wrangler dry-run pass; the existing large-bundle advisory remains. npm install's audit reports zero vulnerabilities.
- Wrangler local preview served the production build; scripts/check-deployment.mjs verified current HTML and both hashed JS/CSS assets at http://127.0.0.1:8788/.
- Workflow validates PRs without deployment credentials; main deploys the validated artifact with repository/environment secrets. Actions are pinned by SHA.
- Cloudflare authentication is unavailable locally and GitHub has no Cloudflare secrets yet. Production deployment, custom-domain binding, TLS, and browser smoke checks on the public hostname remain unverified. DNS resolves the hostname already; exact record versus wildcard ownership/conflict must be checked in the Cloudflare dashboard before activation.

## First Cloudflare deployment — 2026-09-16

- Wrangler OAuth login completed; h3ct0rjs.dev was verified active in the authenticated account, with no existing Worker custom-domain binding for the target hostname.
- Published version eda0b372-e890-4dae-ab64-5426b06612b1 to datacenter-atlas.h3ct0rjs.dev.
- HTTPS smoke script verified the current HTML and both hashed assets. Browser checked room → server → room → floor → room; inspected the rendered room screenshot.
- GitHub CLOUDFLARE_ACCOUNT_ID is configured. A dedicated CLOUDFLARE_API_TOKEN is still required for automatic deployments; PR #7 remains open. Local OAuth credentials have not been copied to GitHub.

## Airflow and containment — 2026-09-18

Added tests for inward rack orientation, rotated rear PDUs, pause/visibility and independent airflow controls, above-floor slab supply, and disposal across architecture changes. All 24 tests and the production build pass. In-app browser: raised/slab switching, pause/play, top/perspective views, aisle labels, and isolation checked. At 375 × 812 the controls remain within the viewport with no horizontal overflow. No browser console errors were recorded. Physical touch and exhaustive assistive-technology testing remain pending.
