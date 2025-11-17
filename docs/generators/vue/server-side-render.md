---
title: Vue Generator - Server-Side Rendering (SSR)
description: Enable production-ready SSR for Vue 3 applications using KosmoJS structure and tooling.
    Includes server entry point and best practices for hydration and deployment.
head:
  - - meta
    - name: keywords
      content: vue ssr, server-side rendering, hydration, vue router ssr, production ssr, kosmojs ssr
---

By default, `KosmoJS` source folders render on the client using `Vite`'s fast dev
server and instant HMR. When your application requires improved SEO,
faster-perceived loading, or better performance on low-end devices, **SSR**
becomes beneficial - especially for public-facing pages and marketing content.

The `Vue` SSR generator provides the required server runtime for production SSR,
while keeping your development workflow unchanged.

## 🎯 Default Rendering Mode

Every source folder contains a `entry/client.ts` file responsible for starting
your application in the browser. It runs in **both** client-side and server-
rendered modes.

- In pure client-side rendering (CSR), it creates a standard `Vue` app instance
  and mounts it directly to the DOM.
- In server-side rendering (SSR), it hydrates HTML that was produced on the
  server, preserving the existing markup and attaching interactivity.

Here is the default implementation:

```ts [entry/client.ts]
import { createApp, createSSRApp } from "vue";

import App from "../App.vue";
import createRouter from "../router";
import { shouldHydrate } from "@src/{vue}";

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

When SSR is active, `shouldHydrate` is set by the generated runtime. The client
entry hydrates the server-rendered markup **without re-rendering it**, preserving
the content the server already delivered.

During development, hydration is typically disabled so the workflow remains fast
and relies entirely on Vite's dev server and hot-module replacement.


## 🛠️ Enabling SSR

First, install the SSR generator:

::: code-group

```sh [pnpm]
pnpm install -D @kosmojs/ssr-generator
```

```sh [npm]
npm install -D @kosmojs/ssr-generator
```

```sh [yarn]
yarn add -D @kosmojs/ssr-generator
```

:::

Then update your source folder's `vite.config.ts`:

```ts [vite.config.ts]
import vue from "@vitejs/plugin-vue";
import devPlugin from "@kosmojs/dev";
import vueGenerator from "@kosmojs/vue-generator";
import ssrGenerator from "@kosmojs/ssr-generator";
import defineConfig from "../vite.base";

export default defineConfig(import.meta.dirname, {
  plugins: [
    vue({ ssr: true }),
    devPlugin(apiurl, {
      generators: [
        vueGenerator(),
        ssrGenerator(),
      ],
    }),
  ],
});
```

## 📄 Server Entry Point

When SSR is activated, `KosmoJS` generates `entry/server.ts` with the default
implementation:

```ts [entry/server.ts]
import { createSSRApp } from "vue";
import { renderToString } from "vue/server-renderer";

import App from "../App.vue";
import createRouter from "../router";

const renderFactory: import("@kosmojs/dev").SSRFactory =
  async (url) => {
    return {
      async renderToString() {
        const app = createSSRApp(App);

        const router = await createRouter({ url });

        app.use(router);

        const html = await renderToString(app);

        return { html };
      },
    };
  };

export default renderFactory;
```

This factory:

1. receives the request URL
2. creates a fresh SSR app instance
3. prepares the router at the correct navigation state
4. renders HTML markup for the client to hydrate

`Vue` injects hydration markers automatically.

## 🌊 Streaming Rendering

For advanced use cases - such as sending HTML to the client while rendering is
still in progress - the SSR factory may export a `renderToStream` method.
Vue's server renderer supports streaming via Node and Web streams.

If both `renderToString` and `renderToStream` are defined, `KosmoJS` will call
`renderToString` by default. To prioritize streaming, export only
`renderToStream`.

Below is an example implementation matching the `SSRStream` signature used by `KosmoJS`:

```ts [entry/server.ts]
import { createSSRApp } from "vue";
import { renderToNodeStream } from "vue/server-renderer";

import App from "../App.vue";
import createRouter from "../router";

const renderFactory: import("@kosmojs/dev").SSRFactory = async (url) => {
    return {
      async renderToStream(req, res, { template, manifest }) {
        const app = createSSRApp(App);

        const router = await createRouter({ url });

        app.use(router);

        const [htmlStart, htmlEnd] = template.split("<!--app-html-->");

        res.write(htmlStart);

        const stream = renderToNodeStream(app);

        stream.on("data", (chunk) => res.write(chunk));

        stream.on("end", () => {
          res.write(htmlEnd);
          res.end();
        });

        stream.on("error", (err) => {
          console.error("SSR stream error:", err);
          res.statusCode = 500;
          res.end();
        });
      },
    };
};

export default renderFactory;
```

> 💡 The streaming pattern and where you inject styles, preload links, or other
> head content depends on your HTML template structure. `KosmoJS` gives you the
> controls - you choose the right strategy for your environment.

Streaming is particularly useful when:

- pages load large amounts of async content
- first paint time matters for user experience
- reducing server memory pressure on large HTML payloads


## 🏗️ Production Builds

Trigger a production SSR build with:

```sh
pnpm build
```

This produces two outputs:

```text
dist/SOURCE_FOLDER/client/  → static browser assets
dist/SOURCE_FOLDER/ssr/     → server entry bundle
```

The server bundle can be executed on any Node.js environment.

## 🧪 Local Testing

Start the SSR server locally:

```sh
node dist/@front/ssr --port 4000
```

Then open:

```text
http://localhost:4000
```

Verify that:

- HTML is rendered server-side
- Interactivity appears after hydration

## 🚀 Deployment

Deploy behind a reverse proxy such as nginx, Caddy, Traefik, or a managed load
balancer. Serve static assets from a CDN or your hosting provider for optimal
latency and throughput.

## 🔄 Development Experience

Your workflow remains fully client-side during development:

- `pnpm dev`
- `Vite` dev server handles requests + HMR
- No SSR server running locally

SSR is a **production-only** concern.

---

**Server runtime constraints**<br />
Avoid accessing browser-only globals (`window`, `document`) in SSR mode.
Use guards or client-entry hooks instead.

---

SSR unlocks real performance and SEO gains for `Vue` apps - and `KosmoJS` makes the
setup lightweight, predictable, and aligned with modern `Vue` best practices.

