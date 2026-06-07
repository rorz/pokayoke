import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import Link from "next/link";

import { type Doc, pathForDoc } from "../lib/docs";

type DocsPagerProps = {
  previous: Doc | undefined;
  next: Doc | undefined;
};

export function DocsPager({ previous, next }: DocsPagerProps) {
  return (
    <nav
      className="mt-12 grid grid-cols-2 gap-4 border-neutral-200 border-t pt-5"
      aria-label="Previous and next pages"
    >
      {previous ? (
        <Link
          href={pathForDoc(previous)}
          className="group inline-flex min-w-0 items-center gap-2 text-left text-[14px] text-neutral-600 hover:text-neutral-950"
        >
          <ArrowLeft
            aria-hidden="true"
            className="shrink-0 transition-transform group-hover:-translate-x-0.5"
            size={16}
          />
          <span className="min-w-0 truncate">{previous.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={pathForDoc(next)}
          className="group inline-flex min-w-0 items-center justify-end gap-2 text-right text-[14px] text-neutral-600 hover:text-neutral-950"
        >
          <span className="min-w-0 truncate">{next.title}</span>
          <ArrowRight
            aria-hidden="true"
            className="shrink-0 transition-transform group-hover:translate-x-0.5"
            size={16}
          />
        </Link>
      ) : null}
    </nav>
  );
}
