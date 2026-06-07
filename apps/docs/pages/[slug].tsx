import type { GetStaticPaths, GetStaticProps } from "next";

import { DocsShell } from "../components/docs-shell";
import { MarkdocRenderer } from "../components/markdoc-renderer";
import { docs, getAdjacentDocs, getDoc, getHeadings, slugFromRouteParam } from "../lib/docs";

type DocRouteProps = {
  slug: string;
};

export const getStaticPaths: GetStaticPaths = () => ({
  paths: docs
    .filter((doc) => doc.slug !== "overview")
    .map((doc) => ({
      params: { slug: doc.slug },
    })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<DocRouteProps> = (context) => {
  const slug = slugFromRouteParam(context.params?.["slug"]);
  const doc = getDoc(slug);

  if (!doc || doc.slug === "overview") {
    return { notFound: true };
  }

  return {
    props: {
      slug: doc.slug,
    },
  };
};

export default function DocRoute({ slug }: DocRouteProps) {
  const doc = getDoc(slug);

  if (!doc) {
    return null;
  }

  const adjacent = getAdjacentDocs(doc.slug);

  return (
    <DocsShell
      current={doc}
      headings={getHeadings(doc.content)}
      next={adjacent.next}
      previous={adjacent.previous}
    >
      <MarkdocRenderer content={doc.content} />
    </DocsShell>
  );
}
