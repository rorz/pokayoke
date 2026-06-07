import { DocsShell } from "../components/docs-shell";
import { MarkdocRenderer } from "../components/markdoc-renderer";
import { getAdjacentDocs, getDoc, getHeadings } from "../lib/docs";

const overview = getDoc("overview");

export default function HomePage() {
  if (!overview) {
    return null;
  }

  const adjacent = getAdjacentDocs(overview.slug);

  return (
    <DocsShell
      current={overview}
      headings={getHeadings(overview.content)}
      next={adjacent.next}
      previous={adjacent.previous}
    >
      <MarkdocRenderer content={overview.content} />
    </DocsShell>
  );
}
