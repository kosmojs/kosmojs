#!/usr/bin/env -S node --enable-source-maps --no-warnings=ExperimentalWarning

import { dirname } from "node:path";
import { parseArgs, styleText } from "node:util";

import concurrently from "concurrently";
import { globby } from "globby";

const usage = [
  "",
  `🚀 ${styleText(["bold", "underline", "cyan"], "KosmoJS CLI")}`,
  "",
  styleText("bold", "BASIC USAGE"),
  "",
  `  ${styleText("blue", "kosmo")} ${styleText("magenta", "-h")}`,
  `  ${styleText("blue", "kosmo")} ${styleText("magenta", "--help")}`,
  "  Display this help message and exit",
  "",
  styleText("bold", "DEV COMMAND"),
  "",
  `  ${styleText("blue", "kosmo dev")}`,
  "  Start dev server for all source folders",
  "",
  `  ${styleText("blue", "kosmo dev")} ${styleText("magenta", "@admin")}`,
  "  Start dev server for single source folder",
  "",
  `  ${styleText("blue", "kosmo dev")} ${styleText("magenta", "@admin @front")}`,
  "  Start dev server for multiple source folders",
  "",
  styleText("bold", "BUILD COMMAND"),
  "",
  `  ${styleText("blue", "kosmo build")}`,
  "  Build all source folders",
  "",
  `  ${styleText("blue", "kosmo build")} ${styleText("magenta", "@admin")}`,
  "  Build single source folder",
  "",
  `  ${styleText("blue", "kosmo build")} ${styleText("magenta", "@admin @front")}`,
  "  Build multiple source folders",
  "",
];

const printUsage = () => {
  for (const line of usage) {
    console.log(line);
  }
};

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    help: { type: "boolean", short: "h" },
  },
});

if (!positionals.length || values.help) {
  printUsage();
  process.exit(0);
}

const [command, ...optedFolders] = positionals;

const prefixColors = ["cyan", "magenta", "yellow", "green", "blue", "auto"];

const handlers: Record<string, (f: Array<string>) => Promise<void>> = {
  async dev(folders) {
    const { result, commands } = concurrently(
      folders.map((name) => {
        return { name, command: "vite", cwd: name };
      }),
      {
        prefixColors,
        handleInput: true,
      },
    );

    let manualShutdown = false;

    process.stdin.on("end", async () => {
      manualShutdown = true;
      console.log("\nEOF detected - stopping all processes...");
      for (const cmd of commands) {
        cmd.kill();
      }
      // Give processes time to cleanup
      await new Promise((resolve) => setTimeout(resolve, 500));
    });

    return result.then(
      () => process.exit(0),
      () => process.exit(manualShutdown ? 0 : 1),
    );
  },
  async build(folders) {
    const { result } = concurrently(
      folders.map((name) => {
        return { name, command: "vite build", cwd: name };
      }),
      { prefixColors },
    );
    await result;
  },
};

try {
  const handler = handlers[command];

  if (!handler) {
    throw new Error(
      `Unknown command ${command}; use one of ${Object.keys(handlers).join(", ")}`,
    );
  }

  const configs = await globby(
    optedFolders.length
      ? optedFolders.map((e) => `${e}/vite.config.*`)
      : "**/vite.config.*",
    {
      absolute: false,
      deep: 2,
    },
  );

  const sourceFolders = configs.map(dirname);

  if (optedFolders.length) {
    if (optedFolders.length !== sourceFolders.length) {
      throw new Error(
        "Some of opted names does not contain a valid KosmoJS source folder",
      );
    }
  } else if (!sourceFolders.length) {
    throw new Error("No source folders detected");
  }

  await handler(sourceFolders);
} catch (
  // biome-ignore lint: any
  error: any
) {
  console.error(`${styleText("red", "✗ ERROR")}: ${error.message}`);
  process.exit(1);
}
