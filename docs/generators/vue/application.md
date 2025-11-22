---
title: Vue Generator - Application Structure
description: Core files generated for a Vue 3 application including App.vue structure,
    Vue Router configuration, and the client entry point used by Vite.
head:
  - - meta
    - name: keywords
      content: vue application structure, vue router, app.vue, entry point, client hydration, vite entry, kosmojs vue
---

To establish a reliable foundation for each source folder, the `Vue` generator
creates a small set of essential files automatically.

These files handle routing setup, typed navigation, and application bootstrap,
ensuring a consistent structure across all `KosmoJS`-powered `Vue` applications.

## 🎨 The App Component

The default generated minimal `App.vue` acts as the root component for the entire application:

```vue [App.vue]
<template>
  <RouterView />
</template>
```

This component forms your application shell. You can extend it with global
layouts, navigation, or shared providers as your project grows.

## 🛣️ Router Configuration

`router.ts` connects generated routes to `Vue` Router 4. It uses the configured
`baseurl` from the source folder's config to ensure correct path resolution.

```ts [router.ts]
import type { App } from "vue";
import {
  type RouteRecordRaw,
  createRouter,
  createWebHistory,
  createMemoryHistory,
} from "vue-router";

import { baseurl } from "./config";

export default async (
  app: App,
  routes: Array<RouteRecordRaw>,
  ssrProps?: { url: URL },
) => {
  const router = createRouter({
    history: ssrProps
      ? createMemoryHistory(baseurl)
      : createWebHistory(baseurl),
    routes,
  });

  if (ssrProps?.url) {
    await router.push(ssrProps.url.pathname);
    await router.isReady();
  }

  app.use(router);

  return router;
};
```

The `routes` value above is generated code that reflects your directory-based
routing structure. We will explore that generated output in upcoming sections.

Every page is rendered within `App.vue` - a shell for all your pages/components.

## 🎯 Client Entry Point

`entry/client.ts` is the first script loaded by `index.html`. It initializes the
`Vue` application and attaches it to the DOM.

```ts [entry/client.ts]
import { createApp, createSSRApp } from "vue";

import { routes, shouldHydrate } from "@src/{vue}/client";
import App from "../App.vue";
import createRouter from "../router";

const root = document.getElementById("app");

if (root) {
  if (shouldHydrate) {
    const app = createSSRApp(App);
    await createRouter(app, routes);
    app.mount(root, true);
  } else {
    const app = createApp(App);
    await createRouter(app, routes);
    app.mount(root);
  }
} else {
  console.error("Root element not found!");
}
```

And inside the `index.html` file created by `KosmoJS`:

```html
<script type="module" src="./entry/client.ts"></script>
```

This HTML document acts as Vite's entry point. From there, `Vite` builds your
application graph starting from the client script and router.

---

With these core files in place, each source folder becomes a fully structured
`Vue` application - ready for routing, layout, and data-loading capabilities
powered by `KosmoJS`.

