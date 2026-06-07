import { GithubLogo, List, Package } from "@phosphor-icons/react";
import Link from "next/link";

type DocsTopbarProps = {
  onOpenSidebar: () => void;
};

export function DocsTopbar({ onOpenSidebar }: DocsTopbarProps) {
  return (
    <header className="sticky top-0 z-40 border-neutral-200 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-12 max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          className="inline-flex size-8 items-center justify-center text-neutral-700 hover:text-neutral-950 lg:hidden"
          type="button"
          aria-label="Open navigation"
          onClick={onOpenSidebar}
        >
          <List aria-hidden="true" size={19} />
        </button>

        <Link className="font-semibold text-[15px] leading-none" href="/">
          pokayoke
        </Link>
        <span className="hidden text-neutral-500 text-xs sm:inline">docs</span>

        <nav className="ml-auto flex items-center gap-1 text-xs" aria-label="Project links">
          <a
            className="inline-flex h-8 items-center gap-1.5 px-2 font-medium text-neutral-600 hover:text-neutral-950"
            href="https://github.com/rorz/pokayoke"
          >
            <GithubLogo aria-hidden="true" size={16} />
            <span>GitHub</span>
          </a>
          <a
            className="inline-flex h-8 items-center gap-1.5 px-2 font-medium text-neutral-600 hover:text-neutral-950"
            href="https://www.npmjs.com/package/pokayoke"
          >
            <Package aria-hidden="true" size={16} />
            <span>npm</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
