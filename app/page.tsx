'use client';

import Portal from '@arcgis/core/portal/Portal';

// Any of these imports also cause loops
//import Basemap from '@arcgis/core/Basemap';
//import * as W from '@arcgis/core/webdoc/support/writeUtils';
//import { isFeatureCollectionLayer as i } from '@arcgis/core/layers/support/layerUtils.js';
//import { isLayerFromCatalog as i } from '@arcgis/core/layers/catalog/catalogUtils.js';
//import ElevationLayer from '@arcgis/core/ElevationLayer';
//import n from '@arcgis/core/layers/Layer';
//import { fromPortalItem as n } from '@arcgis/core/layers/support/fromPortalItem.js';
//import * as n from '@arcgis/core/portal/support/portalLayers.js';

export default function Home() {
  console.log(Portal);
  return <div>Home</div>;
}
