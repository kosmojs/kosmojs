---
title: Vue Generator - Routing
description: Automatic route generation from the pages directory with lazy-loaded Vue components,
    preload hooks, and Vue Router parameter mapping from KosmoJS directory structure.
head:
  - - meta
    - name: keywords
      content: vue routing, directory-based routing, lazy loading, route parameters, preload hook, vue router 4, kosmojs vue
---

The `Vue` generator continuously watches your `pages` directory for new or changed
components.

Whenever you add a page, the generator inspects its location in the folder
hierarchy and produces a matching route definition. Those generated routes are
written into your `lib` directory and then consumed by your `router.ts` file.

For example, if you create a page component at
`pages/users/[id]/index.vue`, the generator produces a route entry similar to:

```ts
{
  name: "users/[id]",
  path: "/users/:id",
  component: () => import("@src/pages/users/[id]/index.vue"),
}
```

Several important details are baked into this generated route.

First, the path uses `Vue Router`'s parameter syntax (`:id` instead of `[id]`).
The generator translates the directory-based convention that `KosmoJS` uses into
the format `Vue Router` expects, so you can think in terms of folders while the
router receives properly structured paths.

Second, the component is lazy-loaded. It isn't bundled into the initial
JavaScript payload; instead, it is loaded only when a user navigates to that
route. By lazy-loading every page component by default, the initial bundle stays
small and application startup times remain fast. Users download code only for
the screens they actually visit.

While it may eventually be helpful to support optional eager loading or
route-specific preload behavior, those features require deeper integration with
`Vue Router` and `Vue` component lifecycles. We are exploring the best approach for
`Vue` developers - without increasing complexity or sacrificing bundle-splitting
benefits.

> ⚙️ Preload hooks, hover prefetching, and other advanced patterns are currently
> under consideration for the `Vue` generator. If you're interested in helping
> shape this feature, **contributions are very welcome!** 🙌

