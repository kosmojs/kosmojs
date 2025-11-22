---
title: React - Application Foundation
description: Generator-produced React files including App.tsx with Suspense,
  router.tsx connecting React Router, and entry/client.tsx with StrictMode for
  DOM rendering initiation.
head:
  - - meta
    - name: keywords
      content: react app foundation, suspense setup, react router integration,
        createRoot hydration, app entry point, vite react entry, react project
        structure, strictmode setup
---

The `React` generator automates foundational file creation, establishing routing
infrastructure and application structure. This includes router integration,
type-safe navigation components, and lazy-loaded route definitions forming a
production-ready foundation.

## 🎨 Root Application Component

The generator creates a minimal `App.tsx` as your application's root wrapper:

```tsx [App.tsx]
import { Outlet } from "react-router";

export default function App() {
  return <Outlet />;
}
```

Customize this component to your needs - add global layouts, error boundaries,
or other application-wide concerns.

## 🛣️ Router Integration

The `router.tsx` file bridges `KosmoJS`'s generated routes with `React` Router:

```tsx [router.tsx]
import type { ComponentType, PropsWithChildren } from "react";
import {
  createBrowserRouter,
  createStaticHandler,
  createStaticRouter,
  type RouteObject,
  RouterProvider,
  StaticRouterProvider,
} from "react-router";

import { baseurl } from "./config";

export default async (
  App: ComponentType<PropsWithChildren>,
  routes: Array<RouteObject>,
  ssrProps?: { url?: URL },
) => {
  const routeStack = [
    {
      path: "/",
      Component: App,
      children: routes,
    },
  ];

  if (ssrProps?.url) {
    const handler = createStaticHandler(routeStack, { basename: baseurl });

    const result = await handler.query(new Request(ssrProps.url.href));

    if (result instanceof Response) {
      // handled by SSR server
      throw result;
    }

    const router = createStaticRouter(routeStack, result);

    return <StaticRouterProvider router={router} context={result} />;
  }

  const router = createBrowserRouter(routeStack, { basename: baseurl });
  return <RouterProvider router={router} />;
};
```

This configuration utilizes your source folder's `baseurl` from configuration
files, ensuring correct path-based route serving.

The `routes` import originates from generated code within your `lib`
directory, explored in subsequent sections.

## 🎯 Application Entry

The `entry/client.tsx` file serves as your application's DOM rendering entry
point:

```tsx [entry/client.tsx]
import { hydrateRoot, createRoot } from "react-dom/client";

import { routes, shouldHydrate } from "@src/{react}/client";
import App from "../App";
import createRouter from "../router";

const root = document.getElementById("app");

if (root) {
  const router = await createRouter(App, routes);
  if (shouldHydrate) {
    hydrateRoot(root, router);
  } else {
    createRoot(root).render(router);
  }
} else {
  console.error("Root element not found!");
}
```

Your `index.html` file references this entry point, created during source
folder initialization:

```html
<script type="module" src="./entry/client.tsx"></script>
```

The `index.html` file serves as Vite's processing entry point. `Vite` begins
from this HTML file, follows the script import to `entry/client.tsx`, and
constructs your complete application graph from there.
