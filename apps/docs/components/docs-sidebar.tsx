import { ArrowLeft, ArrowRight, MagnifyingGlass, X } from "@phosphor-icons/react";
import Link from "next/link";

import { type Doc, type NavSection, pathForDoc } from "../lib/docs";

export type SidebarHandoffLink = {
  direction: "back" | "forward";
  href: string;
  label: string;
};

type DocsSidebarProps = {
  current: Doc;
  sections: NavSection[];
  handoffLink: SidebarHandoffLink | undefined;
  query: string;
  sidebarOpen: boolean;
  onQueryChange: (query: string) => void;
  onClose: () => void;
};

export function DocsSidebar({
  current,
  sections,
  handoffLink,
  query,
  sidebarOpen,
  onQueryChange,
  onClose,
}: DocsSidebarProps) {
  return (
    <aside
      className={[
        "fixed inset-y-0 left-0 z-50 w-[min(84vw,280px)] overflow-y-auto border-neutral-200 border-r bg-white p-4",
        "lg:sticky lg:top-16 lg:z-auto lg:block lg:h-[calc(100vh-5rem)] lg:w-auto lg:border-r-0 lg:p-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      ].join(" ")}
    >
      <div className="mb-7 flex items-center gap-3">
        <label className="flex h-9 flex-1 items-center gap-2 border-neutral-300 border-b text-neutral-500 focus-within:border-neutral-950">
          <MagnifyingGlass aria-hidden="true" size={16} />
          <input
            className="min-w-0 flex-1 border-0 bg-transparent text-[14px] text-neutral-950 outline-none placeholder:text-neutral-400"
            type="search"
            placeholder="Search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </label>
        <button
          className="inline-flex size-8 items-center justify-center text-neutral-700 hover:text-neutral-950 lg:hidden"
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
        >
          <X aria-hidden="true" size={18} />
        </button>
      </div>

      <nav className="flex min-h-[calc(100%-4rem)] flex-col" aria-label="Documentation">
        <div className="grid gap-6">
          {sections.map((section) => (
            <NavSectionLinks
              current={current}
              key={section.section}
              onClose={onClose}
              section={section}
            />
          ))}
        </div>

        {handoffLink ? (
          <Link
            className="mt-4 inline-flex items-center gap-1.5 border-transparent border-l-2 py-1.5 pr-2 pl-3 text-[13px] text-neutral-400 leading-5 hover:border-neutral-200 hover:text-neutral-700"
            href={handoffLink.href}
            onClick={onClose}
          >
            {handoffLink.direction === "back" ? <ArrowLeft aria-hidden="true" size={14} /> : null}
            <span>{handoffLink.label}</span>
            {handoffLink.direction === "forward" ? <ArrowRight aria-hidden="true" size={14} /> : null}
          </Link>
        ) : null}
      </nav>
    </aside>
  );
}

type NavSectionLinksProps = {
  current: Doc;
  section: NavSection;
  onClose: () => void;
};

function NavSectionLinks({ current, section, onClose }: NavSectionLinksProps) {
  return (
    <div>
      <p className="mb-2 font-medium text-[11px] text-neutral-400 uppercase leading-none">
        {section.section}
      </p>
      <div className="grid gap-0.5">
        {section.docs.map((doc) => (
          <Link
            className={[
              "block border-l-2 py-1.5 pr-2 pl-3 text-[14px] leading-5",
              doc.slug === current.slug
                ? "border-neutral-950 font-medium text-neutral-950"
                : "border-transparent text-neutral-600 hover:border-neutral-300 hover:text-neutral-950",
            ].join(" ")}
            href={pathForDoc(doc)}
            key={doc.slug}
            onClick={onClose}
          >
            {doc.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
