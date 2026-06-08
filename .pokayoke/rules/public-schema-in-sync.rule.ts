import type { Rule } from "pokayoke";
import { checkGeneratedText, syncGeneratedText } from "pokayoke";

const ruleId = "docs/public-schema-in-sync";
const sourcePath = "packages/pokayoke/schema.json";
const targetPath = "apps/docs/public/schema.json";

export const publicSchemaInSync: Rule = {
  meta: {
    id: ruleId,
    docs: "Keep the public docs schema in sync with the package schema.",
    kind: "project",
    fixable: true,
  },
  async run(context) {
    const expected = await context.readFile(sourcePath);
    const actual = await readOptional(context.readFile, targetPath);

    if (context.fix) {
      await syncGeneratedText(context.root, targetPath, expected);
      return { findings: [] };
    }

    return {
      findings: checkGeneratedText({
        actual,
        expected,
        file: targetPath,
        ruleId,
        message: "The public docs schema is out of sync with the package schema.",
        syncCommand: "bun run dogfood --fix",
      }),
    };
  },
};

async function readOptional(
  readFile: (file: string) => Promise<string>,
  file: string,
): Promise<string | undefined> {
  try {
    return await readFile(file);
  } catch (error) {
    if (error instanceof Error) {
      return undefined;
    }

    return undefined;
  }
}
