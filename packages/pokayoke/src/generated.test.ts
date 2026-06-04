import { describe, expect, test } from "bun:test";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";

import { checkGeneratedText, syncGeneratedText } from "./generated";

describe("generated text helpers", () => {
  test("reports drift with a sync command hint", () => {
    expect(
      checkGeneratedText({
        actual: "old\n",
        expected: "new\n",
        file: "generated.txt",
        ruleId: "demo/generated",
        syncCommand: "bun run sync",
      }),
    ).toEqual([
      {
        ruleId: "demo/generated",
        severity: "error",
        message: "generated.txt is out of sync with its source of truth.",
        file: "generated.txt",
        advice: "Run bun run sync, or run pokayoke check --fix when this rule supports fixes.",
      },
    ]);
  });

  test("writes expected text for fix-capable rules", async () => {
    const root = await mkdtemp(`${tmpdir()}/pokayoke-generated-`);

    expect(await syncGeneratedText(root, "nested/generated.txt", "next\n")).toBe("created");
    expect(await Bun.file(`${root}/nested/generated.txt`).text()).toBe("next\n");
    expect(await syncGeneratedText(root, "nested/generated.txt", "next\n")).toBe("unchanged");
  });
});
