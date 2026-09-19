# Scene loading and resource measurements

Measured 2026-09-19 for issue #3, starting from main ff460df. Production builds served locally by Vite preview, Codex in-app browser on macOS, 1280 × 720 viewport. Renderer pixel ratio is capped at 2. No network/CPU throttling was applied to timing samples. Device GPU, driver memory, total JS heap and absolute native listener counts were not collected. Results are local samples, not a cross-device benchmark.

## Loading comparison

| Build | Initial room JS | Deferred detail JS | Initial CSS | Deferred CSS |
| --- | ---: | ---: | ---: | ---: |
| Baseline with measurement instrumentation | 780.35 kB | none | 19.85 kB | none |
| Final | 760.59 kB | 22.56 kB | 17.04 kB | 2.98 kB |

Vite gzip estimates for initial JS: 214.82 → 209.31 kB. The change defers roughly 20 kB net initial JavaScript (2.5%). It does not remove the shared Three.js/server geometry needed by room hardware. Total code across all routes is slightly larger due to loading/error handling and resource utilities. The large-bundle advisory remains.

A lazy-room experiment produced a 217.8 kB shell, but added an extra loading stage before room rendering. Its local first-draw sample was 411.6 ms, versus 152.9 ms at baseline. The final implementation keeps the room eager and lazily imports only the detail explorer. The final first-draw sample was 133.8 ms. These are single, unthrottled samples with uncontrolled browser cache state; no repeatable startup speedup is claimed.

`npm run build` emits a manifest and runs `scripts/check-chunks.mjs`, which checks the detail explorer is a dynamic entry outside the eager import graph. It reports route totals including shared dependencies, using Node gzip compression (estimates differ slightly from Vite's compressor). `check-deployment.mjs` verifies all manifest JS/CSS assets, including lazy chunks, rather than only assets referenced by HTML. The manifest is at `dist/asset-manifest.json`, outside hidden directories so CI artifact transfer includes it.

## Resource results

Counts are unique objects reachable from the active scene; GPU columns are Three.js renderer.info counters, not allocated GPU bytes.

| View | Scene geometries | Materials | Scene textures | GPU geometries / textures | Draw calls | Triangles |
| --- | ---: | ---: | ---: | --- | ---: | ---: |
| Baseline room, airflow off | 869 | 888 | 3 | 827 / 0 | 1414 | 464844 |
| Final room, airflow never opened | 843 | 879 | 0 | 827 / 0 | 1414 | 464844 |
| Room with airflow opened | 869 | 888 | 3 | 853 / 3 | 1492 | 483914 |
| Server, default covers | 546 | 168 | 0 | 499 / 0 | 489 | 8532 |
| Raised floor, panels removed | 134 | 138 | 0 | 134 / 0 | 103 | 1236 |

Five baseline room → server → room → floor → room cycles ended at 23 mounts / 22 unmounts (including two floor mode changes). Five cycles after resource cleanup, including server cover and repeated floor mode toggles, ended at 31 mounts / 30 unmounts. Both ended with one renderer and one canvas, stable scene counts, and zero reported geometries, textures and shader programs in the last disposed renderer. A final-build round trip reproduced the final room counts. No sustained growth was observed in this bounded run.

Average render submission samples were approximately 14.6 ms baseline and 14.7 ms final room at startup; these include shader warmup and are CPU submission time, not GPU execution time or steady-state FPS. The change does not reduce room draw calls.

Airflow allocation is deferred until its first use: 26 geometry objects, nine materials and three label textures are avoided before opening the tour. Opening the tour retains these objects until the room unmounts; architecture changes replace and dispose them. This bounded cache is intentional.

## Cleanup and interaction checks

- Shared scene cleanup deduplicates geometry, materials and texture maps, calls InstancedMesh.dispose for instance buffers, and leaves factory-owned room geometry to its owner. Tests verify exact-once releases and shared ownership.
- Orbit change callbacks are explicitly removed before disposing controls. Pointer, context-loss, hash and Escape listeners have paired removal; RAF loops are cancelled and ResizeObservers disconnected. This is source review, not an absolute browser listener census.
- Profiling itself unregisters active scenes and stops its sampling timer when none remain. The diagnostics panel intentionally retains only the latest numeric disposed-renderer snapshot.
- Room cover/filter changes, floor architecture changes, airflow pause/mode changes and repeated explorer transitions were exercised. Selection/isolation survived a lazy detail round trip.
- Direct #server and #floor routes rendered after refresh. A temporary local server delayed explorer JS by two seconds: both routes exposed a status message and Return to room control, then rendered correctly. Error recovery has an alert, reload and return controls; failure injection was not performed.
- Browser console error log was empty. All 34 tests, build/chunk assertions, local four-asset HTTP verification and Wrangler dry-run pass.

## Reproduce

Run `npm run build`, then `npx vite preview --host 127.0.0.1 --port 3019`. Open `http://127.0.0.1:3019/?profile=1#room` and expand Scene diagnostics. Wait for the one-second sampler after each transition. Collapse the panel before interacting with controls beneath it. Cycle both explorers and both floor modes; inspect active/canvas counts and lastDisposed. Compare identical states, since enabling overlays intentionally changes counts.

Profiling is opt-in and sends no telemetry. firstDrawMs is relative to page navigation, so only a fresh page's first scene is a startup timing sample. Long-duration heap snapshots, physical-device GPU measurements and network-throttled distributions remain future profiling work.
