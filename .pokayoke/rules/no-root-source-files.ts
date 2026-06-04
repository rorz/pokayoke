import { defineRule } from "pokayoke";

export const noRootSourceFiles = defineRule({
  meta: {
    id: "repo/no-root-source-files",
    docs: "Keep source files inside packages instead of a root src folder.",
    kind: "project",
  },
  async run(context) {
    const findings = [];
    const patterns = ["src/**/*.ts", "src/**/*.tsx", "src/**/*.js", "src/**/*.jsx"];

    for (const pattern of patterns) {
      const glob = new Bun.Glob(pattern);

      for await (const file of glob.scan({ cwd: context.root, onlyFiles: true })) {
        findings.push({
          ruleId: "repo/no-root-source-files",
          severity: "error" as const,
          message: "Root source files are not allowed in this workspace.",
          file,
          advice: "Move source code into a package or remove the stale root src file.",
        });
      }
    }

    return { findings };
  },
});
