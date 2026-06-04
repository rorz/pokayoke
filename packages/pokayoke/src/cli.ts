#!/usr/bin/env bun

import { formatStylish, initProject, renderProjectSummary, runCheck } from "./index";

function readOption(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);

  if (index === -1) {
    return undefined;
  }

  return args[index + 1];
}

function readRuleId(args: string[]): string | undefined {
  for (let index = 1; index < args.length; index += 1) {
    const arg = args[index];

    if (!arg) {
      continue;
    }

    if (arg === "--format") {
      index += 1;
      continue;
    }

    if (arg === "--fix") {
      continue;
    }

    if (!arg.startsWith("--")) {
      return arg;
    }
  }

  return undefined;
}

const args = Bun.argv.slice(2);
const command = args[0];

if (!command) {
  await Bun.write(Bun.stdout, renderProjectSummary());
} else if (command === "check") {
  const format = readOption(args, "--format") ?? "stylish";
  const ruleId = readRuleId(args);
  const fix = args.includes("--fix");
  const result = await runCheck({ ...(ruleId ? { ruleId } : {}), fix });

  if (format === "json") {
    await Bun.write(Bun.stdout, `${JSON.stringify(result, null, 2)}\n`);
  } else {
    await Bun.write(Bun.stdout, formatStylish(result));
  }

  if (result.findings.some((finding) => finding.severity === "error")) {
    process.exitCode = 1;
  }
} else if (command === "init") {
  const result = await initProject({ force: args.includes("--force") });
  const created = result.files.filter((file) => file.status === "created").length;
  const skipped = result.files.length - created;
  const lines = ["pokayoke init", ""];

  for (const file of result.files) {
    lines.push(`${file.status.padEnd(7)} ${file.path}`);
  }

  lines.push("");
  lines.push(`${created} created, ${skipped} skipped`);
  await Bun.write(Bun.stdout, `${lines.join("\n")}\n`);
} else {
  await Bun.write(Bun.stderr, `Unknown command: ${command}\n`);
  process.exitCode = 1;
}
