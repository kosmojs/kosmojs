---
title: Vue Generator
description: Integrate KosmoJS directory-based routing with Vue 3 Single File Components and Vue Router 4.
    Automatic route configuration, type-safe navigation, and optimized lazy loading for Vue applications.
head:
  - - meta
    - name: keywords
      content: vue generator, vue 3, vue router, typed navigation, lazy loading, vite vue, kosmojs vue
---

The `Vue` generator brings `KosmoJS`'s structured routing approach into the `Vue` 3
ecosystem - using Single File Components and `Vue Router` 4 under the hood.

Rather than maintaining manual route definitions, your file system becomes the
source of truth: folders map to URLs, and each component placed inside `pages/`
is automatically exposed as a route. This eliminates configuration overhead and
ensures the navigation structure always reflects your actual project layout.

Along with routing, the generator produces typed navigation helpers and
utilities designed for the Composition API and `<script setup>` style, fitting
naturally into how modern `Vue` applications are built today.

## 🛠 Installation and Setup

Add the `Vue` generator as a development dependency - it only runs during local
development and build-time code generation:

::: code-group

```sh [pnpm]
pnpm install -D @kosmojs/vue-generator
```

```sh [npm]
npm install -D @kosmojs/vue-generator
```

```sh [yarn]
yarn add -D @kosmojs/vue-generator
```

:::

Next, enable the generator inside your source folder's `vite.config.ts`.

```ts [vite.config.ts]
import vue from "@vitejs/plugin-vue";
import devPlugin from "@kosmojs/dev";
import vueGenerator from "@kosmojs/vue-generator";
import defineConfig from "../vite.base";

export default defineConfig(import.meta.dirname, {
  // ...other settings
  plugins: [
    vue(),
    devPlugin(apiurl, {
      generators: [
        vueGenerator(),
        // other generators ...
      ],
    }),
  ],
});
```

Once wired up, the generator adds a small set of foundation files into the root
of your source folder - these deliver a consistent bootstrapping model for
every Vue-powered area in your workspace.

## 🗂 Working with Multiple Source Folders

`KosmoJS` encourages organizing applications into **independent source folders** -
such as a customer-facing interface, an internal administrative console, or a
marketing site.

Each folder using the `Vue` generator:

- receives its own router instance
- builds its own set of typed navigation helpers
- maintains isolated component and route trees

This avoids the collision and complexity that can arise when unrelated areas of
an app share one giant routing table.

For example, your admin dashboard won't gain access to your public site's
navigation helpers. Each area remains autonomous while still benefiting from
shared conventions across the entire monorepo.

In short: every source folder is a cohesive `Vue` app - aligned to the same
structural principles, but independent where it matters most.

