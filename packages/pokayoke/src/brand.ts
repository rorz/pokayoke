export const masthead = {
  icon: "🧩",
  name: "pokayoke",
} as const;

export function renderMasthead(): string {
  return `${masthead.icon}  ${masthead.name}`;
}
