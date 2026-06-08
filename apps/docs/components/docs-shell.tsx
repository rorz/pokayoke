import Head from "next/head";
import { useMemo, useState } from "react";

import {
  audienceForDoc,
  type Doc,
  type DocHeading,
  firstDocForAudience,
  docsNavSections,
  maintenanceNavSections,
  pathForDoc,
} from "../lib/docs";
import { DocsPager } from "./docs-pager";
import { DocsFooter } from "./docs-footer";
import { type SidebarHandoffLink, DocsSidebar } from "./docs-sidebar";
import { DocsToc } from "./docs-toc";
import { DocsTopbar } from "./docs-topbar";

type DocsShellProps = {
  current: Doc;
  headings: DocHeading[];
  previous: Doc | undefined;
  next: Doc | undefined;
  children: React.ReactNode;
};

export function DocsShell({ current, headings, previous, next, children }: DocsShellProps) {
  const [query, setQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const audience = audienceForDoc(current);
  const baseSections = audience === "maintenance" ? maintenanceNavSections : docsNavSections;
  const handoffLink = handoffLinkForAudience(audience);

  const filteredSections = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return baseSections;
    }

    return baseSections
      .map((section) => ({
        section: section.section,
        docs: section.docs.filter((doc) => {
          const haystack = `${doc.title} ${doc.description}`.toLowerCase();
          return haystack.includes(normalized);
        }),
      }))
      .filter((section) => section.docs.length > 0);
  }, [baseSections, query]);

  return (
    <>
      <Head>
        <title>{`${current.title} | pokayoke`}</title>
        <meta name="description" content={current.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="flex min-h-screen flex-col bg-white font-sans text-neutral-950 antialiased">
        <DocsTopbar onOpenSidebar={() => setSidebarOpen(true)} />
        <div className="mx-auto grid w-full max-w-[1440px] flex-1 grid-cols-1 px-4 py-6 sm:px-6 lg:grid-cols-[240px_minmax(0,760px)_200px] lg:gap-10 lg:px-8 lg:py-8">
          <DocsSidebar
            current={current}
            handoffLink={handoffLink}
            onClose={() => setSidebarOpen(false)}
            onQueryChange={setQuery}
            query={query}
            sections={filteredSections}
            sidebarOpen={sidebarOpen}
          />

          {sidebarOpen ? (
            <button
              className="fixed inset-0 z-40 bg-black/10 lg:hidden"
              type="button"
              aria-label="Close navigation"
              onClick={() => setSidebarOpen(false)}
            />
          ) : null}

          <main className="min-w-0 lg:col-start-2">
            <div className="mb-3 font-medium text-neutral-500 uppercase text-xs">{current.section}</div>
            <h1 className="m-0 max-w-[760px] font-semibold text-3xl leading-[1.08] tracking-normal sm:text-[40px] text-red-500 font-stretch-semi-expanded">
              {current.title}
            </h1>
            <p className="mt-2 mb-8 max-w-[680px] font-normal text-neutral-500 leading-7">
              {current.description}
            </p>
            {children}
            <DocsPager next={next} previous={previous} />
          </main>

          <DocsToc headings={headings} />
        </div>
        <DocsFooter />
      </div>
    </>
  );
}

function handoffLinkForAudience(audience: ReturnType<typeof audienceForDoc>): SidebarHandoffLink | undefined {
  if (audience === "docs") {
    const maintenanceDoc = firstDocForAudience("maintenance");
    return maintenanceDoc
      ? { direction: "forward", href: pathForDoc(maintenanceDoc), label: "For maintainers" }
      : undefined;
  }

  const docsDoc = firstDocForAudience("docs");
  return docsDoc ? { direction: "back", href: pathForDoc(docsDoc), label: "Back to docs" } : undefined;
}
