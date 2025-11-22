import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { load } from "cheerio";
import crc from "crc/crc32";
import { afterAll, describe, expect, inject, it } from "vitest";

import { setupTestProject, testRoutes } from "../setup";

const ssr = inject("SSR" as never);

describe(
  `Vue Generator - Critical CSS: { ssr: ${ssr} }`,
  { skip: !ssr },
  async () => {
    const routeMap = [...new Set(testRoutes.map((e) => e.name))].map((name) => {
      return {
        name,
        cssFile: `assets/${name}/base.css`,
        css: `a[data-test="${crc(name)}"]{content:"${name}"}`,
      };
    });

    const {
      //
      withRouteContent,
      teardown,
    } = await setupTestProject(
      {
        framework: "vue",
        frameworkOptions: {
          templates: routeMap.reduce(
            (map: Record<string, string>, { name, cssFile }) => {
              map[name] = `
              <script setup>
              import "@front/${cssFile}";
              </script>
              <template>
                <div>${name}</div>
              </template>
            `;
              return map;
            },
            {},
          ),
        },
        ssr,
      },
      async ({ sourceFolderPath }) => {
        for (const { cssFile, css } of routeMap) {
          await mkdir(dirname(resolve(sourceFolderPath, cssFile)), {
            recursive: true,
          });
          await writeFile(resolve(sourceFolderPath, cssFile), css, "utf8");
        }
      },
    );

    afterAll(async () => {
      await teardown();
    });

    for (const { name, params } of testRoutes) {
      it(`should inline critical css - ${name}`, async () => {
        const route = routeMap.find((e) => e.name === name);
        expect(route).toBeTruthy();
        await withRouteContent(name, params, async ({ content }) => {
          expect(content).toMatch(route?.css ?? "");
          const $ = load(content);
          await expect(
            $("style")
              .map((_, el) => $.html(el).trim())
              .get()
              .sort()
              .join("\n"),
          ).toMatchFileSnapshot(
            `snapshots/css/${name}/${params.join("/")}/index.html`,
          );
        });
      });
    }
  },
);
