import { describe, expect, test } from "bun:test";

import { normalizeGithubCallouts } from "./github-callouts";

describe("normalizeGithubCallouts", () => {
  test("converts GitHub note callouts into Markdoc callout tags", () => {
    expect(
      normalizeGithubCallouts(
        [
          "Before",
          "",
          "> [!NOTE]",
          "> This docs app accepts GitHub-style callouts.",
          ">",
          "> They can include multiple paragraphs.",
          "",
          "After",
        ].join("\n"),
      ),
    ).toBe(
      [
        "Before",
        "",
        '{% callout title="Note" tone="note" %}',
        "This docs app accepts GitHub-style callouts.",
        "",
        "They can include multiple paragraphs.",
        "{% /callout %}",
        "",
        "After",
      ].join("\n"),
    );
  });

  test("supports every GitHub callout type", () => {
    expect(
      normalizeGithubCallouts(
        [
          "> [!TIP]",
          "> Prefer concise examples.",
          "",
          "> [!IMPORTANT]",
          "> Keep docs canonical.",
          "",
          "> [!WARNING]",
          "> Run checks before publishing.",
          "",
          "> [!CAUTION]",
          "> Do not publish stale package contents.",
        ].join("\n"),
      ),
    ).toBe(
      [
        '{% callout title="Tip" tone="tip" %}',
        "Prefer concise examples.",
        "{% /callout %}",
        "",
        '{% callout title="Important" tone="important" %}',
        "Keep docs canonical.",
        "{% /callout %}",
        "",
        '{% callout title="Warning" tone="warning" %}',
        "Run checks before publishing.",
        "{% /callout %}",
        "",
        '{% callout title="Caution" tone="caution" %}',
        "Do not publish stale package contents.",
        "{% /callout %}",
      ].join("\n"),
    );
  });

  test("leaves ordinary blockquotes alone", () => {
    const content = ["> This is just a blockquote.", ">", "> It should remain Markdown."].join(
      "\n",
    );

    expect(normalizeGithubCallouts(content)).toBe(content);
  });

  test("leaves callout markers inside fenced code blocks alone", () => {
    const content = ["```md", "> [!NOTE]", "> This is documentation about the syntax.", "```"].join(
      "\n",
    );

    expect(normalizeGithubCallouts(content)).toBe(content);
  });
});
