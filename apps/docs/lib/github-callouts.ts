export type CalloutTone = "note" | "tip" | "success" | "important" | "warning" | "caution";

type GitHubCalloutKind = "NOTE" | "TIP" | "IMPORTANT" | "WARNING" | "CAUTION";

type GitHubCallout = {
  title: string;
  tone: CalloutTone;
};

type FenceState = {
  marker: "`" | "~";
  size: number;
};

const githubCallouts: Record<GitHubCalloutKind, GitHubCallout> = {
  CAUTION: { title: "Caution", tone: "caution" },
  IMPORTANT: { title: "Important", tone: "important" },
  NOTE: { title: "Note", tone: "note" },
  TIP: { title: "Tip", tone: "tip" },
  WARNING: { title: "Warning", tone: "warning" },
};

const githubCalloutStartPattern = /^\s*>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*$/i;
const blockquoteLinePattern = /^\s*>\s?(.*)$/;

export function normalizeGithubCallouts(content: string): string {
  const lines = content.split(/\r?\n/);
  const normalized: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? "";
    const fence = matchFence(line);

    if (fence) {
      normalized.push(line);
      index += 1;

      while (index < lines.length) {
        const fencedLine = lines[index] ?? "";

        normalized.push(fencedLine);
        index += 1;

        if (closesFence(fencedLine, fence)) {
          break;
        }
      }

      continue;
    }

    const startMatch = githubCalloutStartPattern.exec(line);

    if (!startMatch) {
      normalized.push(line);
      index += 1;
      continue;
    }

    const kind = startMatch[1]?.toUpperCase() as GitHubCalloutKind | undefined;
    const callout = kind ? githubCallouts[kind] : undefined;

    if (!callout) {
      normalized.push(line);
      index += 1;
      continue;
    }

    index += 1;
    const body: string[] = [];

    while (index < lines.length) {
      const bodyMatch = blockquoteLinePattern.exec(lines[index] ?? "");

      if (!bodyMatch) {
        break;
      }

      body.push(bodyMatch[1] ?? "");
      index += 1;
    }

    normalized.push(
      `{% callout title="${callout.title}" tone="${callout.tone}" %}`,
      ...trimBoundaryBlankLines(body),
      "{% /callout %}",
    );
  }

  return normalized.join("\n");
}

function trimBoundaryBlankLines(lines: string[]): string[] {
  let start = 0;
  let end = lines.length;

  while (start < end && !lines[start]?.trim()) {
    start += 1;
  }

  while (end > start && !lines[end - 1]?.trim()) {
    end -= 1;
  }

  return lines.slice(start, end);
}

function matchFence(line: string): FenceState | undefined {
  const match = /^\s*(`{3,}|~{3,})/.exec(line);
  const markerText = match?.[1];

  if (!markerText) {
    return undefined;
  }

  const marker = markerText[0];

  if (marker !== "`" && marker !== "~") {
    return undefined;
  }

  return {
    marker,
    size: markerText.length,
  };
}

function closesFence(line: string, fence: FenceState): boolean {
  const match = /^\s*(`{3,}|~{3,})\s*$/.exec(line);
  const markerText = match?.[1];

  return Boolean(markerText && markerText[0] === fence.marker && markerText.length >= fence.size);
}
