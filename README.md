# Turbopack: dynamic cyclical imports cause infinite loop

If a module dynamically imports another module, which in turn dynamically imports the first module, Turbopack gets into a loop (100% CPU usage, trace file grows indefinitely).

My best minimal reproduction is in `app/page.tsx`, where a single library entrypoint import causes the loop.

I also attached the trace-turbopack file: https://github.com/user-attachments/files/23006283/trace-turbopack.zip.
Note it grows indefinitely, so I killed the process shortly after starting it to make the file uploadable to GitHub.

## Reproduction

1. Clone the repository

   ```sh
   git clone https://github.com/maxpatiiuk/turbopack-dynamic-import-freeze.git
   cd turbopack-dynamic-import-freeze
   ```

   OR: [use the Stackblitz reproduction](https://stackblitz.com/edit/stackblitz-starters-zhr4zkta?file=app%2Fcomponents%2FTest.tsx,app%2Fpage.tsx,package.json,app%2Flayout.tsx) (but hard to debug in such environment):

2. Install dependencies

   ```sh
   npm install
   ```

3. Run the development server

   ```sh
   npx next dev --turbopack
   # or:
   # CAUTION: the tracing file grows quickly, without limits
   NEXT_TURBOPACK_TRACING=1 npx next dev --turbopack
   ```

   ![100% cpu usage](https://github.com/user-attachments/assets/1a6b73e2-392e-42d1-853e-d1b8b5a3b808)


## Debugging

I tried starting the server inside a debugger. The best I can tell the worker is idle while native code is stuck in a loop:

```ts
NEXT_TURBOPACK_TRACING=1 MallocNanoZone=0 NODE_ENV=development NEXT_RUNTIME=nodejs TURBOPACK=1 NEXT_PRIVATE_WORKER=1 NEXT_PRIVATE_TRACE_ID=cb4e155e9cf7b89b WATCHPACK_WATCHER_LIMIT=20 node --inspect-brk node_modules/next/dist/server/lib/start-server.js
```

By selectively commenting out imports, I see that this roughly caused by the following import chain:

- `app/page.tsx` imports `@arcgis/core/portal/Portal`
- `Portal.js` has `import("../Basemap")`
- `Basemap.js` has `import { getLayerJSON as _ } from './webdoc/support/writeUtils.js';`
- `writeUtils.js` has `import { isFeatureCollectionLayer as i } from '../../layers/support/layerUtils.js';`
- `layerUtils.js` has `import { isLayerFromCatalog as r } from '../catalog/catalogUtils.js';`
- `catalogUtils.js` has `import n from '../Layer.js';`
- `Layer.js` has `import { fromPortalItem as m } from './support/fromPortalItem.js';` and `import('./support/arcgisLayers.js')` - either causes the issue
- `fromPortalItem.js` has `import('../../portal/support/portalLayers.js')`
- `portalLayers.js` has `import { findAssociatedFeatureService as a } from '../../layers/support/associatedFeatureServiceUtils.js';`
- `associatedFeatureServiceUtils.js` has `import o from '../../portal/Portal.js';`

However, reducing the chain to a smaller reproduction is tricky. I hope the provided trace file can help you debug the root cause.
