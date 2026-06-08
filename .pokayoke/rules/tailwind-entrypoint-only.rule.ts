import type { Finding, Rule } from "pokayoke";

const ruleId = "docs/tailwind-entrypoint-only";
const docsTailwindEntrypoint = "apps/docs/styles/tailwind.css";
const allowedBlockAtRules = ["@theme", "@utility", "@variant", "@custom-variant"];
const tailwindDirectivePattern =
  /^[ \t]*(?:@import\s+["']tailwindcss["'];?|@source\s+["'][^"']+["'];?)[ \t]*$/gm;

export const tailwindEntrypointOnly: Rule = {
  meta: {
    id: ruleId,
    docs: "Keep the docs Tailwind entrypoint free of component CSS.",
    kind: "project",
  },
  async run(context) {
    const source = await readOptional(context.readFile, docsTailwindEntrypoint);
    const findings: Finding[] = [];
    const disallowedBlock = findFirstDisallowedBlock(source);

    if (disallowedBlock) {
      findings.push({
        ruleId,
        severity: "error",
        message: "The docs Tailwind entrypoint contains ordinary CSS.",
        file: docsTailwindEntrypoint,
        line: disallowedBlock.line,
        advice:
          "Move component styling into Tailwind utilities. Keep this file to @import, @source, and Tailwind override blocks such as @theme or @utility.",
      });
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

function findFirstDisallowedBlock(source: string): { line: number } | undefined {
  const scanSource = stripTailwindEntrypointDirectives(maskComments(source));
  let depth = 0;
  let segmentStart = 0;

  for (let index = 0; index < scanSource.length; index += 1) {
    const char = scanSource[index];

    if (char === '"' || char === "'") {
      index = skipString(scanSource, index, char);
      continue;
    }

    if (char === "{") {
      if (depth === 0) {
        const prelude = scanSource.slice(segmentStart, index).trim();

        if (!allowedBlockAtRules.some((atRule) => prelude.startsWith(atRule))) {
          return { line: lineFor(scanSource, index) };
        }
      }

      depth += 1;
      continue;
    }

    if (char === "}") {
      depth = Math.max(0, depth - 1);

      if (depth === 0) {
        segmentStart = index + 1;
      }
      continue;
    }

    if (char === ";" && depth === 0) {
      segmentStart = index + 1;
    }
  }

  return undefined;
}

function stripTailwindEntrypointDirectives(source: string): string {
  return source.replace(tailwindDirectivePattern, (match) => match.replace(/[^\n]/g, " "));
}

function maskComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, " "));
}

function skipString(source: string, start: number, quote: string): number {
  for (let index = start + 1; index < source.length; index += 1) {
    if (source[index] === "\\") {
      index += 1;
      continue;
    }

    if (source[index] === quote) {
      return index;
    }
  }

  return source.length - 1;
}

function lineFor(source: string, index: number): number {
  return source.slice(0, index).split("\n").length;
}
