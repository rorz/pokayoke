import { loadDocs } from "./docs-content";

type DocSection = string;
export type DocAudience = "docs" | "maintenance";

export type Doc = {
  slug: string;
  title: string;
  description: string;
  section: DocSection;
  content: string;
  audience: DocAudience;
};

export type NavSection = {
  section: DocSection;
  docs: Doc[];
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

const docsSource = loadDocs();

export const docs: Doc[] = docsSource;

function navSectionsForAudience(audience: DocAudience): NavSection[] {
  const sections = new Map<DocSection, Doc[]>();

  for (const doc of docs.filter((doc) => doc.audience === audience)) {
    const sectionDocs = sections.get(doc.section);

    if (sectionDocs) {
      sectionDocs.push(doc);
    } else {
      sections.set(doc.section, [doc]);
    }
  }

  return [...sections.entries()].map(([section, docs]) => ({
    docs,
    section,
  }));
}

export const docsNavSections = navSectionsForAudience("docs");
export const maintenanceNavSections = navSectionsForAudience("maintenance");

export function getDoc(slug: string): Doc | undefined {
  return docs.find((doc) => doc.slug === slug);
}

export function audienceForDoc(doc: Doc): DocAudience {
  return doc.audience;
}

export function getAdjacentDocs(slug: string): AdjacentDocs {
  const current = getDoc(slug);

  if (!current) {
    return {
      previous: undefined,
      next: undefined,
    };
  }

  const currentAudience = audienceForDoc(current);
  const adjacentDocs = docs.filter((doc) => audienceForDoc(doc) === currentAudience);
  const index = adjacentDocs.findIndex((doc) => doc.slug === slug);

  if (index < 0) {
    return {
      previous: undefined,
      next: undefined,
    };
  }

  return {
    previous: adjacentDocs[index - 1],
    next: adjacentDocs[index + 1],
  };
}

export function firstDocForAudience(audience: DocAudience): Doc | undefined {
  return docs.find((doc) => audienceForDoc(doc) === audience);
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
