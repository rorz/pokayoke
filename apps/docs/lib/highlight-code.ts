import Markdoc from "@markdoc/markdoc";
import { createBundledHighlighter } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import type { BundledLanguage } from "shiki/langs";
import { bundledLanguages } from "shiki/langs";
import type { BundledTheme } from "shiki/themes";
import { bundledThemes } from "shiki/themes";
import type { HighlightedCodeBlocks } from "./code-blocks";
import { codeBlockKey, normalizeFenceLanguage } from "./code-blocks";
import { normalizeGithubCallouts } from "./github-callouts";

type FencedCodeBlock = {
  code: string;
  language: string | undefined;
};

const codeTheme = "github-dark-dimmed" satisfies BundledTheme;
const loadedLanguages = [
  "css",
  "html",
  "javascript",
  "json",
  "jsonc",
  "markdown",
  "sh",
  "typescript",
  "tsx",
  "yaml",
] as const satisfies BundledLanguage[];

type LoadedLanguage = (typeof loadedLanguages)[number];

const loadedLanguageSet = new Set<string>(loadedLanguages);

const createHighlighter = createBundledHighlighter({
  engine: createJavaScriptRegexEngine,
  langs: bundledLanguages,
  themes: bundledThemes,
});

let highlighterPromise: ReturnType<typeof createHighlighter> | undefined;

export async function highlightCodeBlocks(content: string): Promise<HighlightedCodeBlocks> {
  const blocks = collectFencedCodeBlocks(normalizeGithubCallouts(content));
  const highlightedBlocks: HighlightedCodeBlocks = {};

  if (blocks.length === 0) {
    return highlightedBlocks;
  }

  const highlighter = await getHighlighter();

  for (const block of blocks) {
    const key = codeBlockKey(block.code, block.language);

    if (highlightedBlocks[key]) {
      continue;
    }

    highlightedBlocks[key] = highlighter.codeToHtml(block.code, {
      lang: languageForHighlighter(normalizeFenceLanguage(block.language)),
      theme: codeTheme,
      structure: "inline",
      mergeSameStyleTokens: true,
    });
  }

  return highlightedBlocks;
}

function collectFencedCodeBlocks(content: string): FencedCodeBlock[] {
  const ast = Markdoc.parse(content);
  const blocks: FencedCodeBlock[] = [];

  for (const node of [ast, ...ast.walk()]) {
    if (node.type !== "fence") {
      continue;
    }

    const attributes = node.attributes as {
      content?: unknown;
      language?: unknown;
    };
    const code = attributes.content;

    if (typeof code !== "string") {
      continue;
    }

    const language = attributes.language;

    blocks.push({
      code,
      language: typeof language === "string" ? language : undefined,
    });
  }

  return blocks;
}

function getHighlighter() {
  highlighterPromise ??= createHighlighter({
    langs: [...loadedLanguages],
    themes: [codeTheme],
  });

  return highlighterPromise;
}

function languageForHighlighter(language: string): LoadedLanguage | "text" {
  if (loadedLanguageSet.has(language)) {
    return language as LoadedLanguage;
  }

  return "text";
}
