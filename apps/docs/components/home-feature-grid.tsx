import { Package, ShieldCheck, TerminalWindow } from "@phosphor-icons/react";

export function HomeFeatureGrid() {
  return (
    <section className="mx-auto grid max-w-[1440px] gap-4 px-4 py-8 sm:px-6 lg:grid-cols-3 lg:px-8">
      <article className="border border-neutral-200 p-5">
        <TerminalWindow
          aria-hidden="true"
          className="mb-7 text-red-500"
          size={24}
          weight="duotone"
        />
        <h2 className="m-0 font-semibold text-[17px] leading-6">Fast setup</h2>
        <p className="mt-2 mb-0 text-[14px] text-neutral-600 leading-6">
          Install the `pokayoke` package with minimal configuration, and add it to your existing
          code-checking workflow easily.
        </p>
      </article>
      <article className="border border-neutral-200 p-5">
        <ShieldCheck aria-hidden="true" className="mb-7 text-red-500" size={24} weight="duotone" />
        <h2 className="m-0 font-semibold text-[17px] leading-6">Agent-first</h2>
        <p className="mt-2 mb-0 text-[14px] text-neutral-600 leading-6">
          Use the pokayoke agent `SKILL.md` to get started autonomously. The rules that pokayoke
          uses are designed to be written and maintained by agents.
        </p>
      </article>
      <article className="border border-neutral-200 p-5">
        <Package aria-hidden="true" className="mb-7 text-red-500" size={24} weight="duotone" />
        <h2 className="m-0 font-semibold text-[17px] leading-6">Unopinionated and extensible</h2>
        <p className="mt-2 mb-0 text-[14px] text-neutral-600 leading-6">
          Pokayoke sits alongside your existing linters, formatters, and analysis tooling. Local
          pokayoke TypeScript rules check against project invariants specific to your repo.
        </p>
      </article>
    </section>
  );
}
