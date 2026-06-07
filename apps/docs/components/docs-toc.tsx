import type { DocHeading } from "../lib/docs";

type DocsTocProps = {
  headings: DocHeading[];
};

export function DocsToc({ headings }: DocsTocProps) {
  return (
    <aside
      className="sticky top-16 hidden h-[calc(100vh-5rem)] overflow-y-auto lg:block"
      aria-label="Page headings"
    >
      <p className="mb-3 font-medium text-[11px] text-neutral-400 uppercase leading-none">
        On this page
      </p>
      <nav className="grid gap-1">
        {headings.length > 0 ? (
          headings.map((heading) => (
            <a
              className={[
                "block border-l border-transparent py-1 text-[13px] leading-5 hover:text-neutral-950",
                heading.depth === 3 ? "pl-5 text-neutral-500" : "pl-3 text-neutral-600",
              ].join(" ")}
              href={`#${heading.id}`}
              key={heading.id}
            >
              {heading.title}
            </a>
          ))
        ) : (
          <span className="text-[13px] text-neutral-400">No headings</span>
        )}
      </nav>
    </aside>
  );
}
