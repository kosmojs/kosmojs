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

`App.vue` acts as the root component for the entire application. It wraps all
pages rendered by the router and provides a default `<Suspense>` boundary to
handle async state gracefully.

```vue
<template>
  <Suspense>
    <template #default>
      <RouterView />
    </template>
    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>
</template>
```

This component forms your application shell. You can extend it with global
layouts, navigation, or shared providers as your project grows.

## 🛣️ Router Configuration

`router.ts` connects generated routes to `Vue Router` 4. It uses the configured
`baseurl` from the source folder's config to ensure correct path resolution.

```ts [router.ts]
import { createRouter, createWebHistory, createMemoryHistory } from "vue-router";

import { routes } from "@src/{vue}";
import { baseurl } from "./config";

export default async function AppRouter(ssrCtx?: { url: string }) {
  const router = createRouter({
    history: ssrCtx ? createMemoryHistory(baseurl) : createWebHistory(baseurl),
    routes,
  });

  if (ssrCtx?.url) {
    await router.push(ssrCtx.url.replace(baseurl, ""));
    await router.isReady();
  }

  return router;
}
```

The `routes` value above is generated code that reflects your directory-based
routing structure. We will explore that generated output in upcoming sections.

Every page is rendered within `App.vue`, which provides the Suspense boundary
shown earlier.

## 🎯 Client Entry Point

`entry/client.ts` is the first script loaded by `index.html`. It initializes the
`Vue` application and attaches it to the DOM.

```ts [entry/client.ts]
import { createApp, createSSRApp } from "vue";

import App from "../App.vue";
import createRouter from "../router";
import { shouldHydrate } from "@vue/{vue}";

if (shouldHydrate) {
  const app = createSSRApp(App);
  const router = await createRouter({ url: location.pathname });
  app.use(router);
  app.mount("#app", true);
} else {
  const app = createApp(App);
  const router = await createRouter();
  app.use(router);
  app.mount("#app");
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

