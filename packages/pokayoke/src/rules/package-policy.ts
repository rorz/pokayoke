import { definePlugin, definePreset, defineRule } from "../define";
import type { Finding } from "../types";

type PackageJson = Record<string, unknown> & {
  scripts?: Record<string, unknown>;
  dependencies?: Record<string, unknown>;
  devDependencies?: Record<string, unknown>;
  optionalDependencies?: Record<string, unknown>;
  workspaces?: {
    catalog?: Record<string, string>;
    catalogs?: Record<string, Record<string, string>>;
  };
};

type WorkspaceProtocolOptions = {
  protocol?: string;
};

const catalogId = "package/catalog";
const workspaceProtocolId = "package/workspace-protocol";
const noNpxInScriptsId = "package/no-npx-in-scripts";

export const catalog = defineRule({
  meta: {
    id: catalogId,
    docs: "Keep dependency versions aligned with the configured package catalog.",
    kind: "project",
  },
  async run(context) {
    const rootPackageJson = (await context.packageJson(".")) as PackageJson;
    const catalogues = readCatalogues(rootPackageJson);

    if (catalogues.size === 0) {
      return { findings: [] };
    }

    const workspaces = await context.workspaces();
    const workspaceNames = new Set(workspaces.map((workspace) => workspace.name));
    const findings: Finding[] = [];
    const dependencyGroups = ["dependencies", "devDependencies", "optionalDependencies"] as const;

    for (const workspace of workspaces) {
      const packageJson = (await context.packageJson(workspace.root)) as PackageJson;

      for (const group of dependencyGroups) {
        for (const [name, version] of Object.entries(readRecord(packageJson[group]))) {
          if (workspaceNames.has(name)) {
            continue;
          }

          const spec = String(version);
          const catalogue = spec === "catalog:" ? "" : spec.replace(/^catalog:/, "");
          const entries = spec.startsWith("catalog:") ? catalogues.get(catalogue) : undefined;

          if (entries?.has(name)) {
            continue;
          }

          findings.push({
            ruleId: catalogId,
            severity: "warn" as const,
            message: spec.startsWith("catalog:")
              ? `${name} references missing catalog "${catalogue || "(default)"}.`
              : `${name} uses ${spec} instead of a catalog reference.`,
            file: packageJsonPath(workspace.root),
            advice: `Declare ${name} in the root workspace catalog and use "catalog:".`,
          });
        }
      }
    }

    return { findings };
  },
});

export const workspaceProtocol = defineRule({
  meta: {
    id: workspaceProtocolId,
    docs: "Require internal workspace dependencies to use the configured workspace protocol.",
    kind: "project",
  },
  async run(context) {
    const options = (context.options ?? {}) as WorkspaceProtocolOptions;
    const protocol = options.protocol ?? "workspace:*";
    const workspaces = await context.workspaces();
    const workspaceNames = new Set(workspaces.map((workspace) => workspace.name));
    const findings = [];

    for (const workspace of workspaces) {
      const packageJson = (await context.packageJson(workspace.root)) as PackageJson;
      const dependencyGroups = ["dependencies", "devDependencies", "optionalDependencies"] as const;

      for (const group of dependencyGroups) {
        for (const [name, version] of Object.entries(readRecord(packageJson[group]))) {
          if (!workspaceNames.has(name) || version === protocol) {
            continue;
          }

          findings.push({
            ruleId: workspaceProtocolId,
            severity: "warn" as const,
            message: `${workspace.name} depends on ${name} using ${String(version)} instead of ${protocol}.`,
            file: packageJsonPath(workspace.root),
            advice: `Use "${protocol}" for internal workspace dependencies.`,
          });
        }
      }
    }

    return { findings };
  },
});

export const noNpxInScripts = defineRule({
  meta: {
    id: noNpxInScriptsId,
    docs: "Avoid npx in package scripts so tool execution stays package-manager consistent.",
    kind: "project",
  },
  async run(context) {
    const findings = [];

    for (const workspace of await context.workspaces()) {
      const packageJson = (await context.packageJson(workspace.root)) as PackageJson;

      for (const [scriptName, script] of Object.entries(readRecord(packageJson.scripts))) {
        if (typeof script !== "string" || !/(^|\s)npx(\s|$)/.test(script)) {
          continue;
        }

        findings.push({
          ruleId: noNpxInScriptsId,
          severity: "warn" as const,
          message: `Script "${scriptName}" uses npx.`,
          file: packageJsonPath(workspace.root),
          advice: "Use the package manager's native runner for this workspace.",
        });
      }
    }

    return { findings };
  },
});

const rules = {
  [catalog.meta.id]: catalog,
  [workspaceProtocol.meta.id]: workspaceProtocol,
  [noNpxInScripts.meta.id]: noNpxInScripts,
};

const bunWorkspaces = definePreset({
  name: "pokayoke/package-policy/bun-workspaces",
  rules: {
    [catalog.meta.id]: "error",
    [workspaceProtocol.meta.id]: ["error", { protocol: "workspace:*" }],
    [noNpxInScripts.meta.id]: "warn",
  },
});

export default definePlugin({
  name: "pokayoke/package-policy",
  rules,
  presets: {
    bunWorkspaces,
  },
});

function readRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function readCatalogues(packageJson: PackageJson): Map<string, Set<string>> {
  const catalogues = new Map<string, Set<string>>();
  const workspaces = packageJson.workspaces;

  if (!workspaces) {
    return catalogues;
  }

  if (workspaces.catalog) {
    catalogues.set("", new Set(Object.keys(workspaces.catalog)));
  }

  for (const [name, entries] of Object.entries(workspaces.catalogs ?? {})) {
    catalogues.set(name, new Set(Object.keys(entries)));
  }

  return catalogues;
}

function packageJsonPath(workspaceRoot: string): string {
  return workspaceRoot === "." ? "package.json" : `${workspaceRoot}/package.json`;
}
