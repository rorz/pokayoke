import { describe, expect, test } from "bun:test";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";

import { initProject } from "./init";

describe("initProject", () => {
  test("creates a .pokayoke TypeScript policy folder", async () => {
    const root = await mkdtemp(`${tmpdir()}/pokayoke-init-`);
    const result = await initProject({ root });

    expect(result.files).toEqual([
      { path: ".pokayoke/config.ts", status: "created" },
      { path: ".pokayoke/rules/no-root-source-files.ts", status: "created" },
      { path: ".pokayoke/rules/no-root-source-files.test.ts", status: "created" },
    ]);
    expect(await Bun.file(`${root}/.pokayoke/config.ts`).text()).toContain("defineConfig");
    expect(await Bun.file(`${root}/.pokayoke/rules/no-root-source-files.ts`).text()).toContain(
      "repo/no-root-source-files",
    );
    expect(await Bun.file(`${root}/.pokayoke/rules/no-root-source-files.test.ts`).text()).toContain(
      "reports source files",
    );
  });

  test("does not overwrite existing files unless forced", async () => {
    const root = await mkdtemp(`${tmpdir()}/pokayoke-init-`);
    await initProject({ root });
    await Bun.write(`${root}/.pokayoke/config.ts`, "custom");

    expect(await initProject({ root })).toEqual({
      files: [
        { path: ".pokayoke/config.ts", status: "skipped" },
        { path: ".pokayoke/rules/no-root-source-files.ts", status: "skipped" },
        { path: ".pokayoke/rules/no-root-source-files.test.ts", status: "skipped" },
      ],
    });
    expect(await Bun.file(`${root}/.pokayoke/config.ts`).text()).toBe("custom");

    await initProject({ root, force: true });
    expect(await Bun.file(`${root}/.pokayoke/config.ts`).text()).toContain("defineConfig");
  });
});
