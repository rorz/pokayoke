import type ts from "typescript";

export type RuleKind = "file" | "project" | "adapter";

export type RuleSeverity = "off" | "warn" | "error";

export type EnabledSeverity = Exclude<RuleSeverity, "off">;

export type RuleSetting<TOptions = unknown> = RuleSeverity | [RuleSeverity, TOptions];

export type NormalizedRuleSetting<TOptions = unknown> = {
  severity: RuleSeverity;
  options?: TOptions;
};

export type Finding = {
  ruleId: string;
  severity: EnabledSeverity;
  message: string;
  file?: string;
  line?: number;
  column?: number;
  excerpt?: string;
  advice?: string;
};

export type RuleResult = {
  findings: Finding[];
};

export type AdapterResult = {
  exitCode: number;
  stdout: string;
  stderr: string;
};

export type Workspace = {
  name: string;
  root: string;
};

export type RuleContext<TOptions = unknown> = {
  root: string;
  fix: boolean;
  options: TOptions;
  files: () => Promise<string[]>;
  glob: (patterns: string | string[]) => Promise<string[]>;
  readFile: (file: string) => Promise<string>;
  parseTypescript: (file: string) => Promise<ts.SourceFile>;
  packageJson: (workspace?: string) => Promise<unknown>;
  workspaces: () => Promise<Workspace[]>;
  report: (finding: Finding) => void;
  execAdapter: (command: string, args?: string[]) => Promise<AdapterResult>;
};

export type Rule<TOptions = unknown> = {
  meta: {
    id: string;
    docs: string;
    kind: RuleKind;
    fixable?: boolean;
    schema?: unknown;
  };
  run: (context: RuleContext<TOptions>) => Promise<RuleResult>;
};

export type RuleRegistry = Record<string, Rule>;

export type Preset = {
  name: string;
  rules: Record<string, RuleSetting>;
};

export type Plugin = {
  name: string;
  rules: RuleRegistry;
  presets?: Record<string, Preset>;
};
