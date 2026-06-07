import path from "node:path";

import type { Finding, Rule } from "pokayoke";

const ruleId = "docs/canonical-source";
const docsContentRoot = "apps/docs/content";
const topLevelTextFiles = ["README.md", "AGENTS.md", "CLAUDE.md", "SKILL.md"];
const legacyRootDocsLinkPattern = /(?<![A-Za-z0-9_./-])docs\/[A-Za-z0-9._/-]+\.md\b/g;

export const canonicalDocsSource: Rule = {
  meta: {
    id: ruleId,
    docs: "Require long-form project docs to live under the docs app content tree.",
    kind: "project",
  },
  async run(context) {
    const findings: Finding[] = [];
    const rootDocsFiles = await context.glob(["docs/**/*"]);

    for (const file of rootDocsFiles) {
      findings.push({
        ruleId,
        severity: "error",
        message: "Root docs files are not canonical in this repository.",
        file,
        advice: `Move project documentation into ${docsContentRoot}/ and expose it through the docs app.`,
      });
    }

    for (const file of topLevelTextFiles) {
      const source = await readOptional(context.readFile, file);

      for (const legacyLink of source.matchAll(legacyRootDocsLinkPattern)) {
        findings.push({
          ruleId,
          severity: "error",
          message: "Top-level guidance links to the old root docs directory.",
          file,
          line: lineFor(source, legacyLink.index ?? 0),
          advice:
            "Link to a docs site route such as /configuration, or to apps/docs/content when naming source files.",
        });
      }
    }

    const docsAppFiles = await context.glob(["apps/docs/**/*.ts", "apps/docs/**/*.tsx"]);

    for (const file of docsAppFiles) {
      const source = await context.readFile(file);

      for (const rawImport of source.matchAll(/from\s+["']([^"']+\.md\?raw)["']/g)) {
        const specifier = rawImport[1];

        if (!specifier) {
          continue;
        }

        const importedFile = path.posix.normalize(
          path.posix.join(path.posix.dirname(file), specifier.replace(/\?raw$/, "")),
        );

        if (!importedFile.startsWith(`${docsContentRoot}/`)) {
          findings.push({
            ruleId,
            severity: "error",
            message: "The docs app imports markdown from outside its canonical content tree.",
            file,
            line: lineFor(source, rawImport.index ?? 0),
            advice: `Move the markdown file into ${docsContentRoot}/ and import it from there.`,
          });
        }
      }
    }

    return { findings };
  },
};

async function readOptional(
  readFile: (file: string) => Promise<string>,
  file: string,
): Promise<string> {
  try {
    return await readFile(file);
  } catch (error) {
    if (error instanceof Error) {
      return "";
    }

    return "";
  }
}

function lineFor(source: string, index: number): number {
  return source.slice(0, index).split("\n").length;
}
