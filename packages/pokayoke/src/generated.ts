import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";

import type { Finding } from "./types";

export type GeneratedTextOptions = {
  actual: string | undefined;
  expected: string;
  file: string;
  ruleId: string;
  message?: string;
  syncCommand?: string;
};

export type GeneratedTextSyncResult = "created" | "updated" | "unchanged";

export function checkGeneratedText(options: GeneratedTextOptions): Finding[] {
  if (options.actual === options.expected) {
    return [];
  }

  return [
    {
      ruleId: options.ruleId,
      severity: "error",
      message: options.message ?? `${options.file} is out of sync with its source of truth.`,
      file: options.file,
      advice: options.syncCommand
        ? `Run ${options.syncCommand}, or run pokayoke check --fix when this rule supports fixes.`
        : "Regenerate the file from its source of truth.",
    },
  ];
}

export async function syncGeneratedText(
  root: string,
  file: string,
  expected: string,
): Promise<GeneratedTextSyncResult> {
  const path = `${root}/${file}`;
  const currentFile = Bun.file(path);
  const exists = await currentFile.exists();
  const current = exists ? await currentFile.text() : undefined;

  if (current === expected) {
    return "unchanged";
  }

  await mkdir(dirname(path), { recursive: true });
  await Bun.write(path, expected);

  return exists ? "updated" : "created";
}
