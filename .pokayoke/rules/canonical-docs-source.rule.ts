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

        if (!isCanonicalMarkdownSpecifier(file, specifier)) {
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

      for (const globImport of source.matchAll(
        /import\.meta\.glob(?:<[^>]+>)?\(\s*["']([^"']+\.md[^"']*)["']/g,
      )) {
        const specifier = globImport[1];

        if (!specifier) {
          continue;
        }

        if (!isCanonicalMarkdownSpecifier(file, specifier)) {
          findings.push({
            ruleId,
            severity: "error",
            message: "The docs app globs markdown from outside its canonical content tree.",
            file,
            line: lineFor(source, globImport.index ?? 0),
            advice: `Move the markdown files into ${docsContentRoot}/ and glob them from there.`,
          });
        }
      }
    }

    return { findings };
  },
};

function isCanonicalMarkdownSpecifier(file: string, specifier: string): boolean {
  const markdownPath = path.posix.normalize(
    path.posix.join(path.posix.dirname(file), specifier.replace(/\?.*$/, "")),
  );

  return markdownPath === docsContentRoot || markdownPath.startsWith(`${docsContentRoot}/`);
}

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
