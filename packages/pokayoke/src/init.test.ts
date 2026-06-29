import { describe, expect, test } from "bun:test";
import { mkdir, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";

import { runCheck } from "./engine";
import { initProject } from "./init";

describe("initProject", () => {
  test("creates a root JSONC config and local rule folder", async () => {
    const root = await mkdtemp(`${tmpdir()}/pokayoke-init-`);
    await Bun.write(`${root}/tsconfig.json`, "{}\n");
    const result = await initProject({ root });

    expect(result.files).toEqual([
      { path: "pokayoke.jsonc", status: "created" },
      { path: ".pokayoke/tsconfig.json", status: "created" },
      { path: ".pokayoke/rules/no-root-source-files.rule.ts", status: "created" },
      { path: ".pokayoke/rules/no-root-source-files.test.ts", status: "created" },
    ]);
    expect(await Bun.file(`${root}/pokayoke.jsonc`).text()).toContain('"localRules"');
    expect(await Bun.file(`${root}/.pokayoke/config.ts`).exists()).toBe(false);
    expect(JSON.parse(await Bun.file(`${root}/.pokayoke/tsconfig.json`).text())).toEqual({
      extends: "../tsconfig.json",
      compilerOptions: {
        noEmit: true,
        types: ["bun"],
      },
      include: ["rules/**/*.ts"],
    });
    expect(await Bun.file(`${root}/.pokayoke/rules/no-root-source-files.rule.ts`).text()).toContain(
      "repo/no-root-source-files",
    );
    expect(await Bun.file(`${root}/.pokayoke/rules/no-root-source-files.test.ts`).text()).toContain(
      "reports source files",
    );
  });

  test("does not overwrite existing files unless forced", async () => {
    const root = await mkdtemp(`${tmpdir()}/pokayoke-init-`);
    await initProject({ root });
    await Bun.write(`${root}/pokayoke.jsonc`, "custom");

    expect(await initProject({ root })).toEqual({
      files: [
        { path: "pokayoke.jsonc", status: "skipped" },
        { path: ".pokayoke/tsconfig.json", status: "skipped" },
        { path: ".pokayoke/rules/no-root-source-files.rule.ts", status: "skipped" },
        { path: ".pokayoke/rules/no-root-source-files.test.ts", status: "skipped" },
      ],
    });
    expect(await Bun.file(`${root}/pokayoke.jsonc`).text()).toBe("custom");

    await initProject({ root, force: true });
    expect(await Bun.file(`${root}/pokayoke.jsonc`).text()).toContain('"localRules"');
  });

  test("creates a standalone local rule tsconfig when the root has no tsconfig", async () => {
    const root = await mkdtemp(`${tmpdir()}/pokayoke-init-`);
    await initProject({ root });

    expect(JSON.parse(await Bun.file(`${root}/.pokayoke/tsconfig.json`).text())).toEqual({
      compilerOptions: {
        lib: ["ESNext"],
        target: "ESNext",
        module: "Preserve",
        moduleResolution: "bundler",
        strict: true,
        noEmit: true,
        types: ["bun"],
      },
      include: ["rules/**/*.ts"],
    });
  });

  test("generated starter config loads and runs the local rule", async () => {
    const root = await mkdtemp(`${tmpdir()}/pokayoke-init-`);
    await initProject({ root });
    await mkdir(`${root}/src`, { recursive: true });
    await Bun.write(`${root}/src/index.ts`, "export const value = 1;\n");

    const result = await runCheck({ root, ruleId: "repo/no-root-source-files" });

    expect(result.configPath).toBe("pokayoke.jsonc");
    expect(result.rulesRun).toEqual(["repo/no-root-source-files"]);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0]?.file).toBe("src/index.ts");
  });
});
