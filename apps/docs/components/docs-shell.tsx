import Head from "next/head";
import { useMemo, useState } from "react";

import { type Doc, type DocHeading, navSections } from "../lib/docs";
import { DocsPager } from "./docs-pager";
import { DocsSidebar } from "./docs-sidebar";
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

  const filteredSections = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return navSections;
    }

    return navSections
      .map((section) => ({
        section: section.section,
        docs: section.docs.filter((doc) => {
          const haystack = `${doc.title} ${doc.description}`.toLowerCase();
          return haystack.includes(normalized);
        }),
      }))
      .filter((section) => section.docs.length > 0);
  }, [query]);

  return (
    <>
      <Head>
        <title>{`${current.title} | pokayoke`}</title>
        <meta name="description" content={current.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-white text-neutral-950">
        <DocsTopbar onOpenSidebar={() => setSidebarOpen(true)} />
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 px-4 py-6 sm:px-6 lg:grid-cols-[240px_minmax(0,760px)_200px] lg:gap-10 lg:px-8 lg:py-8">
          <DocsSidebar
            current={current}
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
            <div className="mb-3 font-medium text-neutral-500 text-xs">{current.section}</div>
            <h1 className="m-0 max-w-[760px] font-semibold text-[34px] leading-[1.08] tracking-normal sm:text-[40px]">
              {current.title}
            </h1>
            <p className="mt-4 mb-8 max-w-[680px] text-[15px] text-neutral-600 leading-7">
              {current.description}
            </p>
            {children}
            <DocsPager next={next} previous={previous} />
          </main>

          <DocsToc headings={headings} />
        </div>
      </div>
    </>
  );
}
