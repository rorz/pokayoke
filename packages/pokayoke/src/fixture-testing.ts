import { describe, expect, test } from "bun:test";
import { readdirSync, statSync } from "node:fs";
import { relative, resolve } from "node:path";

import { parseTypescriptSource } from "./ast";
import type { Finding, Rule, RuleContext } from "./types";
import { collectFiles, discoverWorkspaces, readPackageJson } from "./workspace";

export type RuleFixtureOptions<TOptions = unknown> = {
  bad?: string;
  good?: string;
  name?: string;
  options?: TOptions;
  root: string;
  rule: Rule<TOptions>;
};

export function testRuleFixtures<TOptions = unknown>(options: RuleFixtureOptions<TOptions>): void {
  const name = options.name ?? options.rule.meta.id;

  describe(name, () => {
    for (const file of listFixtureFiles(options.good)) {
      test(`${relative(options.root, file)} has no findings`, async () => {
        const findings = await runFixtureRule(options, file);

        expect(findings).toEqual([]);
      });
    }

    for (const file of listFixtureFiles(options.bad)) {
      test(`${relative(options.root, file)} has findings`, async () => {
        const findings = await runFixtureRule(options, file);

        expect(findings.length).toBeGreaterThan(0);
      });
    }
  });
}

async function runFixtureRule<TOptions>(
  options: RuleFixtureOptions<TOptions>,
  absoluteFile: string,
) {
  const root = options.root;
  const file = relative(root, absoluteFile);
  const reported: Finding[] = [];
  const context: RuleContext<TOptions> = {
    files: async () => [file],
    fix: false,
    glob: async (patterns: string | string[]) =>
      collectFiles(root, Array.isArray(patterns) ? patterns : [patterns]),
    options: options.options as TOptions,
    packageJson: async (workspace?: string) => readPackageJson(root, workspace),
    parseTypescript: async (target: string) =>
      parseTypescriptSource(target, await Bun.file(`${root}/${target}`).text()),
    readFile: async (target: string) => Bun.file(`${root}/${target}`).text(),
    report: (finding) => {
      reported.push(finding);
    },
    root,
    workspaces: async () => discoverWorkspaces(root),
  };
  const result = await options.rule.run(context);

  return [...reported, ...result.findings];
}

function listFixtureFiles(path: string | undefined): string[] {
  if (!path) {
    return [];
  }

  const absolute = resolve(path);
  const stat = statSync(absolute);

  if (stat.isFile()) {
    return [absolute];
  }

  return readdirSync(absolute, { withFileTypes: true })
    .flatMap((entry) => {
      const next = `${absolute}/${entry.name}`;

      if (entry.isDirectory()) {
        return listFixtureFiles(next);
      }

      return /\.(c|m)?tsx?$/.test(entry.name) ? [next] : [];
    })
    .sort();
}
