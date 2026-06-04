import type { Finding } from "pokayoke";
import { defineRule } from "pokayoke";

export const agentInstructionsInSync = defineRule({
  meta: {
    id: "agents/instructions-in-sync",
    docs: "Keep mirrored agent instruction files synchronized.",
    kind: "project",
  },
  async run(context) {
    const sourcePath = "AGENTS.md";
    const mirrorPaths = ["CLAUDE.md"];
    const source = await readOptional(context.root, sourcePath);
    const findings: Finding[] = [];

    if (!source) {
      return { findings };
    }

    for (const mirrorPath of mirrorPaths) {
      const mirror = await readOptional(context.root, mirrorPath);

      if (!mirror) {
        findings.push({
          ruleId: "agents/instructions-in-sync",
          severity: "error" as const,
          message: `${mirrorPath} is missing but ${sourcePath} exists.`,
          file: mirrorPath,
          advice: `Create ${mirrorPath} or remove it from the local agent mirror policy.`,
        });
        continue;
      }

      if (normalize(source) !== normalize(mirror)) {
        findings.push({
          ruleId: "agents/instructions-in-sync",
          severity: "error" as const,
          message: `${mirrorPath} has drifted from ${sourcePath}.`,
          file: mirrorPath,
          advice: "Update the mirrored agent instructions so agents read the same repo contract.",
        });
      }
    }

    return { findings };
  },
});

async function readOptional(root: string, path: string): Promise<string | undefined> {
  const file = Bun.file(`${root}/${path}`);

  if (!(await file.exists())) {
    return undefined;
  }

  return file.text();
}

function normalize(source: string): string {
  return source.replace(/\r\n/g, "\n").trim();
}
