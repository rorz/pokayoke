import type { GetStaticPaths, GetStaticProps } from "next";

import { DocsShell } from "../components/docs-shell";
import { MarkdocRenderer } from "../components/markdoc-renderer";
import type { HighlightedCodeBlocks } from "../lib/code-blocks";
import { docs, getAdjacentDocs, getDoc, getHeadings, slugFromRouteParam } from "../lib/docs";

type DocRouteProps = {
  slug: string;
  highlightedCodeBlocks: HighlightedCodeBlocks;
};

type DocRouteParams = {
  slug?: string[] | string;
};

export const getStaticPaths: GetStaticPaths = () => ({
  paths: docs.map((doc) => ({
    params: { slug: doc.slug.split("/") },
  })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<DocRouteProps> = async (context) => {
  const params = context.params as DocRouteParams | undefined;
  const slug = slugFromRouteParam(params?.slug);
  const doc = getDoc(slug);

  if (!doc) {
    return { notFound: true };
  }

  const { highlightCodeBlocks } = await import("../lib/highlight-code");

  return {
    props: {
      slug: doc.slug,
      highlightedCodeBlocks: await highlightCodeBlocks(doc.content),
    },
  };
};

export default function DocRoute({ slug, highlightedCodeBlocks }: DocRouteProps) {
  const doc = getDoc(slug);

  if (!doc) {
    return null;
  }

  const adjacent = getAdjacentDocs(doc.slug);
  const effectiveHighlightedCodeBlocks =
    highlightedCodeBlocks ?? readHighlightedCodeBlocksFromWindow(doc.slug);

  return (
    <>
      <HighlightedCodeBlocksScript highlightedCodeBlocks={highlightedCodeBlocks} slug={doc.slug} />
      <DocsShell
        current={doc}
        headings={getHeadings(doc.content)}
        next={adjacent.next}
        previous={adjacent.previous}
      >
        <MarkdocRenderer
          content={doc.content}
          highlightedCodeBlocks={effectiveHighlightedCodeBlocks}
        />
      </DocsShell>
    </>
  );
}

function HighlightedCodeBlocksScript({
  highlightedCodeBlocks,
  slug,
}: {
  highlightedCodeBlocks: HighlightedCodeBlocks | undefined;
  slug: string;
}) {
  if (!highlightedCodeBlocks) {
    return null;
  }

  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Data is JSON serialized and '<' escaped before writing the hydration script.
      dangerouslySetInnerHTML={{
        __html: `window.__POKAYOKE_HIGHLIGHTED_CODE_BLOCKS__=${serializeScriptData({
          blocks: highlightedCodeBlocks,
          slug,
        })};`,
      }}
    />
  );
}

function readHighlightedCodeBlocksFromWindow(slug: string): HighlightedCodeBlocks | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  const globalState = window as typeof window & {
    __POKAYOKE_HIGHLIGHTED_CODE_BLOCKS__?: {
      blocks: HighlightedCodeBlocks;
      slug: string;
    };
  };
  const highlightedCodeBlocks = globalState.__POKAYOKE_HIGHLIGHTED_CODE_BLOCKS__;

  return highlightedCodeBlocks?.slug === slug ? highlightedCodeBlocks.blocks : undefined;
}

function serializeScriptData(value: { blocks: HighlightedCodeBlocks; slug: string }): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
