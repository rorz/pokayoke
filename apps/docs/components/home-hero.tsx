import { ArrowRight, Check, Copy, GithubLogo, Package } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";

import { PokayokeWordmark } from "./brand-assets";
import { HomeAppIcon } from "./home-app-icon";

const statusBadges = [
  {
    label: "npm version",
    href: "https://www.npmjs.com/package/pokayoke",
    src: "https://img.shields.io/npm/v/pokayoke?style=flat-square&label=npm",
  },
  // {
  //   label: "monthly npm downloads",
  //   href: "https://www.npmjs.com/package/pokayoke",
  //   src: "https://img.shields.io/npm/dm/pokayoke?style=flat-square&label=downloads",
  // },
  // {
  //   label: "GitHub release",
  //   href: "https://github.com/rorz/pokayoke/releases",
  //   src: "https://img.shields.io/github/v/release/rorz/pokayoke?style=flat-square&label=release",
  // },
  // {
  //   label: "publish workflow",
  //   href: "https://github.com/rorz/pokayoke/actions/workflows/publish.yml",
  //   src: "https://img.shields.io/github/actions/workflow/status/rorz/pokayoke/publish.yml?branch=main&style=flat-square&label=publish",
  // },
  {
    label: "license",
    href: "https://github.com/rorz/pokayoke/blob/main/LICENSE",
    src: "https://img.shields.io/npm/l/pokayoke?style=flat-square",
  },
];

const installCommand = "bunx skills add rorz/pokayoke";

const copyTextWithSelection = (text: string) => {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.left = "-9999px";
  textarea.style.position = "fixed";
  textarea.style.top = "0";

  document.body.append(textarea);
  textarea.select();
  const didCopy = document.execCommand("copy");
  textarea.remove();

  return didCopy;
};

export function HomeHero() {
  const [copiedInstallCommand, setCopiedInstallCommand] = useState(false);

  const copyInstallCommand = async () => {
    let didCopy = false;

    try {
      const writeText = navigator.clipboard?.writeText?.bind(navigator.clipboard);

      if (writeText) {
        await writeText(installCommand);
        didCopy = true;
      } else {
        didCopy = copyTextWithSelection(installCommand);
      }
    } catch (error) {
      console.warn("Clipboard API failed; falling back to selection copy.", error);
      didCopy = copyTextWithSelection(installCommand);
    }

    setCopiedInstallCommand(didCopy);

    if (didCopy) {
      window.setTimeout(() => setCopiedInstallCommand(false), 1600);
    }
  };

  return (
    <section className="border-neutral-200 border-b">
      <div className="mx-auto grid min-h-[80vh] max-w-[1440px] grid-cols-1 content-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8 lg:py-16">
        <div className="order-2 max-w-[860px] lg:order-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl text-neutral-600">
              ポカ<span className="text-red-400">ヨケ</span>
            </span>
            <span>•</span>
            <span className="font-light text-neutral-400 tracking-widest text-xl">
              /ˈpoʊ.kɑː <span className="text-red-300">ˈjoʊ.keɪ</span>/
            </span>
          </div>
          <h1 className="m-0 max-w-[820px]" aria-label="pokayoke">
            <PokayokeWordmark className="text-[54px] leading-[0.98] sm:text-[76px] lg:text-[92px]" />
          </h1>
          <p className="mt-6 max-w-[640px] text-[18px] text-neutral-600 leading-8 sm:text-[20px]">
            Turn your repo conventions into checks that humans and agents can run, understand, and
            repair. Designed to work harmoniously alongside your existing code analysis, linting,
            and formatting toolchains.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex h-10 items-center justify-center gap-2 border border-neutral-950 bg-neutral-950 px-4 font-medium text-[14px] text-white hover:bg-neutral-800"
              href="/getting-started"
            >
              Read the docs
              <ArrowRight aria-hidden="true" className="text-red-500" size={16} weight="duotone" />
            </Link>
            <a
              className="inline-flex h-10 items-center justify-center gap-2 border border-neutral-300 px-4 font-medium text-[14px] text-neutral-800 hover:border-neutral-950 hover:text-neutral-950"
              href="https://github.com/rorz/pokayoke"
              target="_blank"
              rel="noopener"
            >
              <GithubLogo aria-hidden="true" className="text-red-500" size={17} weight="duotone" />
              GitHub
            </a>
            <a
              className="inline-flex h-10 items-center justify-center gap-2 border border-neutral-300 px-4 font-medium text-[14px] text-neutral-800 hover:border-neutral-950 hover:text-neutral-950"
              href="https://www.npmjs.com/package/pokayoke"
              target="_blank"
              rel="noopener"
            >
              <Package aria-hidden="true" className="text-red-500" size={17} weight="duotone" />
              npm
            </a>
          </div>

          <div className="mt-8 w-full max-w-[460px]">
            <p className="m-0 mb-2 font-semibold text-[12px] text-neutral-500 uppercase leading-5">
              Get started now
            </p>
            <button
              aria-label={copiedInstallCommand ? "Copied install command" : "Copy install command"}
              className="group flex min-h-11 w-full items-center justify-between gap-3 border border-neutral-200 bg-neutral-50 px-3 py-2 text-left transition-colors hover:border-neutral-950 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              onClick={copyInstallCommand}
              type="button"
            >
              <code className="break-all font-mono text-[13px] text-neutral-950 leading-5 sm:whitespace-nowrap">
                {installCommand}
              </code>
              <span className="inline-flex h-7 shrink-0 items-center gap-1 border border-neutral-200 bg-white px-2 font-medium text-[12px] text-neutral-500 transition-colors group-hover:text-neutral-950">
                {copiedInstallCommand ? (
                  <Check aria-hidden="true" className="text-red-500" size={14} weight="bold" />
                ) : (
                  <Copy aria-hidden="true" className="text-red-500" size={14} weight="duotone" />
                )}
                {copiedInstallCommand ? "Copied" : "Copy"}
              </span>
            </button>
            <p className="mt-2 mb-0 text-[13px] text-neutral-500 leading-6">
              or{" "}
              <Link
                className="font-medium text-neutral-800 underline decoration-red-300 underline-offset-4 hover:text-neutral-950"
                href="/getting-started"
              >
                read the human instructions
              </Link>
            </p>
          </div>

          <nav className="mt-18 flex flex-wrap gap-2" aria-label="Project status">
            {statusBadges.map((badge) => (
              <a
                className="inline-flex h-[22px] items-center overflow-hidden border border-neutral-200 bg-white transition-opacity hover:opacity-80"
                href={badge.href}
                key={badge.label}
                target="_blank"
                rel="noopener"
              >
                {/* biome-ignore lint/performance/noImgElement: Shields.io badges are tiny remote status images outside the docs image pipeline. */}
                <img alt={badge.label} className="h-[20px] w-auto" src={badge.src} />
              </a>
            ))}
          </nav>
        </div>

        <div className="order-1 flex items-center lg:order-2 lg:justify-end" aria-hidden="true">
          <HomeAppIcon compact />
          <HomeAppIcon />
        </div>
      </div>
    </section>
  );
}
