import {
  ArrowRight,
  GithubLogo,
  Package,
  ShieldCheck,
  TerminalWindow,
} from "@phosphor-icons/react";
import Head from "next/head";
import Link from "next/link";

import { PokayokeWordmark } from "../components/brand-assets";
import { DocsFooter } from "../components/docs-footer";
import { DocsTopbar } from "../components/docs-topbar";
import { HomeAppIcon } from "../components/home-app-icon";

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

export default function HomePage() {
  return (
    <>
      <Head>
        <title>pokayoke docs</title>
        <meta
          name="description"
          content="Repo policy tooling for checks that sit between linting and project reachability."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="flex min-h-screen flex-col bg-white font-sans text-neutral-950 antialiased">
        <DocsTopbar />

        <main className="flex-1">
          <section className="border-neutral-200 border-b">
            <div className="mx-auto grid min-h-[80vh] max-w-[1440px] grid-cols-1 content-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8 lg:py-16">
              <div className="order-2 max-w-[860px] lg:order-1">
                <div className="flex items-center gap-2">

                <span className="text-2xl text-neutral-600">ポカ<span className="text-red-400">ヨケ</span></span><span>•</span><span className="font-light text-neutral-400 tracking-widest text-xl">/ˈpoʊ.kɑː <span className="text-red-300">ˈjoʊ.keɪ</span>/</span>
                </div>
                <h1 className="m-0 max-w-[820px]" aria-label="pokayoke">
                  <PokayokeWordmark className="text-[54px] leading-[0.98] sm:text-[76px] lg:text-[92px]" />
                </h1>
                <p className="mt-6 max-w-[640px] text-[18px] text-neutral-600 leading-8 sm:text-[20px]">
                  Turn your repo conventions into checks that humans and
                  agents can run, understand, and repair. Designed to work harmoniously alongside your existing code analysis, linting, and formatting toolchains.
                </p>

                <div className="mt-8 flex flex-wrap gap-2" aria-label="Project status">
                  {statusBadges.map((badge) => (
                    <a
                      className="inline-flex h-[22px] items-center overflow-hidden border border-neutral-200 bg-white transition-opacity hover:opacity-80"
                      href={badge.href}
                      key={badge.label}
                      target="_blank"
                    >
                      <img alt={badge.label} className="h-[20px] w-auto" src={badge.src} />
                    </a>
                  ))}
                </div>

                <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                  <Link
                    className="inline-flex h-10 items-center justify-center gap-2 border border-neutral-950 bg-neutral-950 px-4 font-medium text-[14px] text-white hover:bg-neutral-800"
                    href="/overview"
                  >
                    Read the docs
                    <ArrowRight aria-hidden="true" className="text-red-500" size={16} weight="duotone" />
                  </Link>
                  <a
                    className="inline-flex h-10 items-center justify-center gap-2 border border-neutral-300 px-4 font-medium text-[14px] text-neutral-800 hover:border-neutral-950 hover:text-neutral-950"
                    href="https://github.com/rorz/pokayoke"
                    target="_blank"
                  >
                    <GithubLogo aria-hidden="true" className="text-red-500" size={17} weight="duotone" />
                    GitHub
                  </a>
                  <a
                    className="inline-flex h-10 items-center justify-center gap-2 border border-neutral-300 px-4 font-medium text-[14px] text-neutral-800 hover:border-neutral-950 hover:text-neutral-950"
                    href="https://www.npmjs.com/package/pokayoke"
                    target="_blank"
                  >
                    <Package aria-hidden="true" className="text-red-500" size={17} weight="duotone" />
                    npm
                  </a>
                </div>
              </div>

              <div className="order-1 flex items-center lg:order-2 lg:justify-end" aria-hidden="true">
                <HomeAppIcon compact />
                <HomeAppIcon />
              </div>
            </div>
          </section>

          <section className="mx-auto grid max-w-[1440px] gap-4 px-4 py-8 sm:px-6 lg:grid-cols-3 lg:px-8">
            <Link
              className="group border border-neutral-200 p-5 hover:border-neutral-950"
              href="/configuration"
            >
              <ShieldCheck aria-hidden="true" className="mb-7 text-red-500" size={24} weight="duotone" />
              <h2 className="m-0 font-semibold text-[17px] leading-6">Configuration</h2>
              <p className="mt-2 mb-0 text-[14px] text-neutral-600 leading-6">
                Root config, local rules, ignores, suppressions, and presets.
              </p>
            </Link>
            <Link
              className="group border border-neutral-200 p-5 hover:border-neutral-950"
              href="/rule-authoring"
            >
              <TerminalWindow aria-hidden="true" className="mb-7 text-red-500" size={24} weight="duotone" />
              <h2 className="m-0 font-semibold text-[17px] leading-6">Rule authoring</h2>
              <p className="mt-2 mb-0 text-[14px] text-neutral-600 leading-6">
                Rule kinds, context helpers, fixtures, and implementation shape.
              </p>
            </Link>
            <Link
              className="group border border-neutral-200 p-5 hover:border-neutral-950"
              href="/agent-setup"
            >
              <Package aria-hidden="true" className="mb-7 text-red-500" size={24} weight="duotone" />
              <h2 className="m-0 font-semibold text-[17px] leading-6">Agent setup</h2>
              <p className="mt-2 mb-0 text-[14px] text-neutral-600 leading-6">
                Install pokayoke, add scripts, register local rules, and hand off cleanly.
              </p>
            </Link>
          </section>
        </main>
        <DocsFooter />
      </div>
    </>
  );
}
