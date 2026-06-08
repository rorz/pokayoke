import { renderMasthead } from "./brand";
import type { CheckResult } from "./engine";
import type { Finding } from "./types";

type ReporterOptions = {
  color?: boolean;
  width?: number;
};

type CheckOutputOptions = ReporterOptions & {
  format?: "json" | "stylish";
  verbose?: boolean;
};

type ColorName = "blue" | "bold" | "cyan" | "dim" | "green" | "magenta" | "red" | "yellow";

const codes: Record<ColorName, [number, number]> = {
  blue: [34, 39],
  bold: [1, 22],
  cyan: [36, 39],
  dim: [2, 22],
  green: [32, 39],
  magenta: [35, 39],
  red: [31, 39],
  yellow: [33, 39],
};

export function formatCheckOutput(result: CheckResult, options: CheckOutputOptions = {}): string {
  if (options.format === "json") {
    return `${JSON.stringify(result, null, 2)}\n`;
  }

  if (!options.verbose && result.findings.length === 0) {
    return "";
  }

  return formatStylish(result, options);
}

export function formatStylish(result: CheckResult, options: ReporterOptions = {}): string {
  const color = options.color ?? shouldUseColor();
  const paint = (name: ColorName, value: string) => formatColor(name, value, color);
  const errors = result.findings.filter((finding) => finding.severity === "error").length;
  const warnings = result.findings.length - errors;
  const passed = errors === 0;
  const separator = paint("green", "=".repeat(readTerminalWidth(options.width)));
  const masthead = paint("green", paint("bold", renderMasthead()));
  const lines = [
    separator,
    `${masthead} ${paint(passed ? "green" : "red", passed ? "PASS" : "FAIL")}`,
    separator,
    "",
    `${paint("blue", "Config")}   ${paint("cyan", result.configPath ?? "(none)")}`,
    `${paint("blue", "Files")}    ${paint("cyan", String(result.files.length))}`,
    `${paint("blue", "Rules")}    ${paint("cyan", String(result.rulesRun.length))}`,
    `${paint("blue", "Findings")} ${formatFindingCount(errors, warnings, paint)}`,
  ];

  if (result.findings.length === 0) {
    lines.push("");
    lines.push(paint("green", "No findings."));
    return `${lines.join("\n")}\n`;
  }

  lines.push("");
  lines.push(paint("dim", "Findings"));
  lines.push(paint("dim", "--------"));

  for (const [file, findings] of groupFindings(result.findings)) {
    lines.push("");
    lines.push(paint("blue", file));

    for (const finding of findings) {
      const severity =
        finding.severity === "error" ? paint("red", "error") : paint("yellow", "warn");
      const location = formatLocationSuffix(finding);
      lines.push(`  ${severity} ${paint("dim", finding.ruleId)} ${location}`);
      lines.push(`    ${finding.message}`);

      if (finding.advice) {
        lines.push(`    ${paint("cyan", "advice")} ${formatAdvice(finding.advice)}`);
      }
    }
  }

  lines.push("");
  lines.push(`${errors} errors, ${warnings} warnings`);

  return `${lines.join("\n")}\n`;
}

function groupFindings(findings: Finding[]): Map<string, Finding[]> {
  const groups = new Map<string, Finding[]>();

  for (const finding of findings) {
    const file = finding.file ?? "<repo>";
    const group = groups.get(file) ?? [];
    group.push(finding);
    groups.set(file, group);
  }

  return new Map([...groups.entries()].sort(([left], [right]) => left.localeCompare(right)));
}

function formatFindingCount(
  errors: number,
  warnings: number,
  paint: (name: ColorName, value: string) => string,
): string {
  if (errors === 0 && warnings === 0) {
    return paint("green", "0");
  }

  return `${paint("red", `${errors} errors`)} / ${paint("yellow", `${warnings} warnings`)}`;
}

function formatLocationSuffix(finding: Finding): string {
  if (finding.line && finding.column) {
    return `:${finding.line}:${finding.column}`;
  }

  if (finding.line) {
    return `:${finding.line}`;
  }

  return "";
}

function formatAdvice(advice: string): string {
  return advice.split("\n").slice(0, 8).join("\n           ");
}

function formatColor(name: ColorName, value: string, enabled: boolean): string {
  if (!enabled) {
    return value;
  }

  const [open, close] = codes[name];
  return `\u001b[${open}m${value}\u001b[${close}m`;
}

function shouldUseColor(): boolean {
  const env = process.env as { FORCE_COLOR?: string; NO_COLOR?: string };

  if (env.NO_COLOR) {
    return false;
  }

  if (env.FORCE_COLOR) {
    return true;
  }

  return (Bun.stdout as { isTTY?: boolean }).isTTY === true;
}

function readTerminalWidth(width?: number): number {
  if (width) {
    return Math.max(20, width);
  }

  const stdout = process.stdout as { columns?: number };
  return Math.max(20, stdout.columns ?? 80);
}
