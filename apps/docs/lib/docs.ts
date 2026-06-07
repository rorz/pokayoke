import adaptersContent from "../content/adapters.md?raw";
import agentRulesContent from "../content/agent-rules.md?raw";
import agentSetupContent from "../content/agent-setup.md?raw";
import configurationContent from "../content/configuration.md?raw";
import homeContent from "../content/home.md?raw";
import publishingContent from "../content/publishing.md?raw";
import ruleAuthoringContent from "../content/rule-authoring.md?raw";
import suppressionsContent from "../content/suppressions.md?raw";
import whyPokayokeContent from "../content/why-pokayoke.md?raw";

type DocSection = "Start" | "Concepts" | "Reference" | "Operations";

export type Doc = {
  slug: string;
  title: string;
  description: string;
  section: DocSection;
  content: string;
};

export type DocHeading = {
  id: string;
  title: string;
  depth: 2 | 3;
};

export type AdjacentDocs = {
  previous: Doc | undefined;
  next: Doc | undefined;
};

const docsSource: Doc[] = [
  {
    slug: "overview",
    title: "Overview",
    description: "The short version of what pokayoke is for and how to start.",
    section: "Start",
    content: homeContent,
  },
  {
    slug: "why-pokayoke",
    title: "Why pokayoke",
    description: "The policy layer pokayoke is meant to own.",
    section: "Concepts",
    content: whyPokayokeContent,
  },
  {
    slug: "agent-setup",
    title: "Agent setup",
    description: "A setup checklist for adding pokayoke to repositories.",
    section: "Concepts",
    content: agentSetupContent,
  },
  {
    slug: "configuration",
    title: "Configuration",
    description: "Config lookup, local rules, ignores, suppressions, and presets.",
    section: "Reference",
    content: configurationContent,
  },
  {
    slug: "suppressions",
    title: "Suppressions",
    description: "Local, justified suppression directives and unused suppression reporting.",
    section: "Reference",
    content: suppressionsContent,
  },
  {
    slug: "rule-authoring",
    title: "Rule authoring",
    description: "Rule kinds, context helpers, and implementation shape.",
    section: "Reference",
    content: ruleAuthoringContent,
  },
  {
    slug: "agent-rules",
    title: "Agent rules",
    description: "Checks for stale or drifted agent-facing instructions.",
    section: "Reference",
    content: agentRulesContent,
  },
  {
    slug: "adapters",
    title: "Adapters",
    description: "How existing tools can report through pokayoke.",
    section: "Operations",
    content: adaptersContent,
  },
  {
    slug: "publishing",
    title: "Publishing",
    description: "Trusted publishing and package release flow.",
    section: "Operations",
    content: publishingContent,
  },
];

const sectionOrder: DocSection[] = ["Start", "Concepts", "Reference", "Operations"];

export const docs = docsSource;

export const navSections = sectionOrder.map((section) => ({
  section,
  docs: docs.filter((doc) => doc.section === section),
}));

export function getDoc(slug: string): Doc | undefined {
  return docs.find((doc) => doc.slug === slug);
}

export function getAdjacentDocs(slug: string): AdjacentDocs {
  const index = docs.findIndex((doc) => doc.slug === slug);

  if (index < 0) {
    return {
      previous: undefined,
      next: undefined,
    };
  }

  return {
    previous: docs[index - 1],
    next: docs[index + 1],
  };
}

export function pathForDoc(doc: Doc): string {
  return `/${doc.slug}`;
}

export function slugFromRouteParam(slug: string[] | string | undefined): string {
  if (typeof slug === "string") {
    return slug;
  }

  if (Array.isArray(slug) && slug.length > 0) {
    return slug.join("/");
  }

  return "overview";
}

export function getHeadings(content: string): DocHeading[] {
  const headings: DocHeading[] = [];
  const pattern = /^(#{2,3})\s+(.+)$/gm;
  let match = pattern.exec(content);

  while (match) {
    const marker = match[1];
    const rawTitle = match[2];

    if (marker && rawTitle) {
      const depth = marker.length === 2 ? 2 : 3;
      const title = cleanHeading(rawTitle);

      if (title) {
        headings.push({
          id: slugify(title),
          title,
          depth,
        });
      }
    }

    match = pattern.exec(content);
  }

  return headings;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/`([^`]+)`/g, "$1")
    .replace(/&[a-z0-9#]+;/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cleanHeading(value: string): string {
  return value
    .replace(/\s+\{#[^}]+\}\s*$/, "")
    .replace(/[`*_~]/g, "")
    .trim();
}
