import Markdoc from "@markdoc/markdoc";
import { Check, Copy } from "@phosphor-icons/react";
import React, { useMemo, useState } from "react";

import { codeBlockKey, type HighlightedCodeBlocks } from "../lib/code-blocks";
import { slugify } from "../lib/docs";
import { normalizeGithubCallouts } from "../lib/github-callouts";
import { Callout } from "./callout";

type MarkdocRendererProps = {
  content: string;
  highlightedCodeBlocks?: HighlightedCodeBlocks;
};

type FenceProps = {
  content?: string;
  language?: string;
  highlightedCodeBlocks?: HighlightedCodeBlocks | undefined;
  children?: React.ReactNode;
};

type HeadingProps = {
  level?: number;
  children: React.ReactNode;
};

type InlineCodeProps = {
  content?: string;
  children?: React.ReactNode;
};

type LinkProps = {
  href?: string;
  title?: string;
  children?: React.ReactNode;
};

const proseClassName = [
  "max-w-[760px] text-[15px] leading-7 text-neutral-800",
  "[&_a]:text-neutral-950 [&_a]:underline [&_a]:decoration-neutral-300 [&_a]:underline-offset-4 [&_a:hover]:decoration-neutral-950",
  "[&_blockquote]:my-5 [&_blockquote]:border-neutral-300 [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_blockquote]:text-neutral-600",
  "[&_em]:text-neutral-800",
  "[&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:scroll-mt-20 [&_h2]:font-bold [&_h2]:text-2xl [&_h2]:text-neutral-950 [&_h2]:leading-tight",
  "[&_h2_a]:decoration-dotted",
  "[&_h3]:mt-8 [&_h3]:mb-2 [&_h3]:scroll-mt-20 [&_h3]:font-normal [&_h3]:text-xl [&_h3]:text-neutral-950 [&_h3]:leading-snug",
  "[&_h3_a]:decoration-dotted",
  "[&_h4]:mt-6 [&_h4]:mb-2 [&_h4]:scroll-mt-20 [&_h4]:font-medium [&_h4]:text-[15px] [&_h4]:text-neutral-950",
  "[&_hr]:my-8 [&_hr]:border-neutral-200",
  "[&_li]:my-1.5 [&_li]:pl-1",
  "[&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-5",
  "[&_p]:my-4",
  "[&_strong]:font-semibold [&_strong]:text-neutral-950",
  "[&_table]:my-6 [&_table]:w-full [&_table]:border-collapse [&_table]:text-left [&_table]:text-[14px]",
  "[&_td]:border-neutral-100 [&_td]:border-b [&_td]:py-2 [&_td]:pr-4 [&_td]:align-top",
  "[&_th]:border-neutral-200 [&_th]:border-b [&_th]:py-2 [&_th]:pr-4 [&_th]:text-left [&_th]:font-medium [&_th]:text-neutral-950",
  "[&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-5",
].join(" ");

const markdocConfig = {
  tags: {
    callout: {
      render: "Callout",
      attributes: {
        title: { type: String },
        tone: {
          type: String,
          default: "note",
          matches: ["note", "tip", "success", "important", "warning", "caution"],
        },
      },
    },
  },
  nodes: {
    code: {
      render: "InlineCode",
      attributes: {
        content: { type: String },
      },
    },
    fence: {
      render: "Fence",
      attributes: {
        content: { type: String },
        language: { type: String },
      },
    },
    heading: {
      render: "Heading",
      attributes: {
        level: { type: Number, required: true, default: 1 },
      },
    },
    link: {
      render: "DocLink",
      attributes: {
        href: { type: String, required: true },
        title: { type: String },
      },
    },
  },
};

export function MarkdocRenderer({ content, highlightedCodeBlocks }: MarkdocRendererProps) {
  const rendered = useMemo(() => {
    const ast = Markdoc.parse(normalizeGithubCallouts(content));
    const tree = Markdoc.transform(ast, markdocConfig);
    const FenceWithHighlights = (props: FenceProps) => (
      <Fence {...props} highlightedCodeBlocks={highlightedCodeBlocks} />
    );

    return Markdoc.renderers.react(tree, React, {
      components: {
        Callout,
        Fence: FenceWithHighlights,
        DocLink,
        Heading,
        InlineCode,
      },
    });
  }, [content, highlightedCodeBlocks]);

  return <div className={proseClassName}>{rendered}</div>;
}

function Fence({ content, language, highlightedCodeBlocks, children }: FenceProps) {
  const [copied, setCopied] = useState(false);
  const code = content ?? textFromReact(children);
  const highlightedCode = highlightedCodeBlocks?.[codeBlockKey(code, language)];

  async function copyCode() {
    if (!code || typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <figure className="my-5 overflow-hidden border border-[#373e47] bg-[#22272e]">
      <figcaption className="flex h-9 items-center justify-between border-[#373e47] border-b px-3 text-[#768390] text-xs">
        <span className="font-mono">{language || "text"}</span>
        <button
          className="inline-flex h-7 items-center gap-1.5 px-1.5 font-medium text-[#adbac7] hover:text-white"
          type="button"
          onClick={copyCode}
          aria-label="Copy code"
        >
          {copied ? <Check aria-hidden="true" size={14} /> : <Copy aria-hidden="true" size={14} />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </figcaption>
      <pre className="m-0 overflow-auto p-4 font-mono text-[13px] text-[#adbac7] leading-6 [tab-size:2]">
        {highlightedCode ? (
          <code className="whitespace-pre" dangerouslySetInnerHTML={{ __html: highlightedCode }} />
        ) : (
          <code className="whitespace-pre">{code}</code>
        )}
      </pre>
    </figure>
  );
}

function Heading({ level = 2, children }: HeadingProps) {
  const safeLevel = Math.min(Math.max(level, 1), 4);

  if (safeLevel === 1) {
    return null;
  }

  const id = slugify(textFromReact(children));
  const tagName = `h${safeLevel}` as "h2" | "h3" | "h4";

  return React.createElement(tagName, { id }, <a href={`#${id}`}>{children}</a>);
}

function InlineCode({ content, children }: InlineCodeProps) {
  return (
    <code className="border border-neutral-200 bg-neutral-50 px-1 py-0.5 font-mono text-[0.9em] text-neutral-950">
      {content ?? children}
    </code>
  );
}

function DocLink({ href = "", title, children }: LinkProps) {
  const isExternal = isExternalHref(href);

  return (
    <a
      href={href}
      title={title}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  );
}

function isExternalHref(href: string): boolean {
  return /^(https?:)?\/\//i.test(href);
}

function textFromReact(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(textFromReact).join("");
  }

  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return textFromReact(node.props.children);
  }

  return "";
}
