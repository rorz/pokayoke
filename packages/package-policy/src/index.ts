import { definePlugin, definePreset, defineRule } from "pokayoke";

const noFindings = async () => ({ findings: [] });

type PackageJson = Record<string, unknown> & {
  scripts?: Record<string, unknown>;
  dependencies?: Record<string, unknown>;
  devDependencies?: Record<string, unknown>;
  peerDependencies?: Record<string, unknown>;
  optionalDependencies?: Record<string, unknown>;
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
  run: noFindings,
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
      const dependencyGroups = [
        "dependencies",
        "devDependencies",
        "peerDependencies",
        "optionalDependencies",
      ] as const;

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

export const rules = {
  [catalog.meta.id]: catalog,
  [workspaceProtocol.meta.id]: workspaceProtocol,
  [noNpxInScripts.meta.id]: noNpxInScripts,
};

export const bunWorkspaces = definePreset({
  name: "@pokayoke/package-policy/bun-workspaces",
  rules: {
    [catalog.meta.id]: "error",
    [workspaceProtocol.meta.id]: ["error", { protocol: "workspace:*" }],
    [noNpxInScripts.meta.id]: "warn",
  },
});

export default definePlugin({
  name: "@pokayoke/package-policy",
  rules,
  presets: {
    "bun-workspaces": bunWorkspaces,
  },
});

function readRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function packageJsonPath(workspaceRoot: string): string {
  return workspaceRoot === "." ? "package.json" : `${workspaceRoot}/package.json`;
}
