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

export function DocsFooter() {
  return (
    <footer className="border-neutral-200 border-t bg-neutral-100 text-neutral-500 pt-2 pb-10">
      <div className="mx-auto flex min-h-14 max-w-[1440px] justify-start items-center px-4 sm:px-6 lg:px-8 gap-1">
        <div className="flex gap-1 text-sm">
          <span>pokayoke ©</span>
          <a
            href="https://rorz.io"
            target="_blank"
            className="text-red-600 underline"
            rel="noopener"
          >
            Rory McMeekin
          </a>
        </div>
        <span>2026</span>
        <nav className="ml-auto flex flex-wrap gap-2" aria-label="Project status">
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
    </footer>
  );
}
