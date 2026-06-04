export type PokayokeMode = "warning" | "control";

export type PokayokePrinciple = {
  name: string;
  description: string;
};

export const principles: PokayokePrinciple[] = [
  {
    name: "Catch mistakes where they are made",
    description:
      "A convention failure is cheaper to fix at authoring time than after review, merge, deploy, or agent handoff.",
  },
  {
    name: "Prefer forcing functions over reminders",
    description:
      "When a rule matters, encode it into the workflow so people and agents cannot casually bypass it.",
  },
  {
    name: "Keep rules explainable",
    description:
      "Every check should say what failed, why the convention exists, and how to move forward.",
  },
];

export function describeMode(mode: PokayokeMode): string {
  if (mode === "warning") {
    return "Warning checks point out mistakes while leaving the author in control.";
  }

  return "Control checks block progress until the required convention is satisfied.";
}

export function renderProjectSummary(): string {
  const lines = [
    "Pokayoke",
    "",
    "Convention forcing functions for humans and agents.",
    "",
    "Modes:",
    `- warning: ${describeMode("warning")}`,
    `- control: ${describeMode("control")}`,
    "",
    "Principles:",
    ...principles.map((principle) => `- ${principle.name}: ${principle.description}`),
  ];

  return `${lines.join("\n")}\n`;
}

if (import.meta.main) {
  await Bun.write(Bun.stdout, renderProjectSummary());
}
