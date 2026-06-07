import type { Doc, DocAudience } from "./docs";
import { parseMarkdownSource } from "./docs-frontmatter";

type OrderedSegment = {
  order: number;
  name: string;
};

type DocInternal = Doc & {
  orderPath: OrderedSegment[];
};
const sectionLabels: Record<string, string> = {
  concepts: "Concepts",
  maintainers: "Maintainers",
  reference: "Reference",
  start: "Start",
};

const maintenanceSectionKeys = new Set(["maintainers"]);

function orderedSegment(segment: string): OrderedSegment {
  const match = /^(\d+)[-_](.+)$/.exec(segment);

  if (!match) {
    return {
      name: segment,
      order: Number.POSITIVE_INFINITY,
    };
  }

  return {
    name: match[2] ?? segment,
    order: Number(match[1]),
  };
}

function titleize(value: string): string {
  const words = value.replace(/[-_]+/g, " ");

  return words.charAt(0).toUpperCase() + words.slice(1);
}

function normalizeContentPath(modulePath: string): string {
  const contentPath = modulePath.replace(/^\.\.\/content\//, "");

  if (contentPath === modulePath) {
    throw new Error(`Unexpected docs module path: ${modulePath}`);
  }

  return contentPath;
}

function slugForPath(pathSegments: string[], audience: DocAudience): string {
  const slugSegments = pathSegments.slice(1).map((segment) => orderedSegment(segment).name);

  if (audience === "maintenance") {
    return ["maintenance", ...slugSegments].join("/");
  }

  return slugSegments.join("/");
}

function compareDocs(left: DocInternal, right: DocInternal): number {
  const length = Math.max(left.orderPath.length, right.orderPath.length);

  for (let index = 0; index < length; index += 1) {
    const leftSegment = left.orderPath[index];
    const rightSegment = right.orderPath[index];

    if (!leftSegment) {
      return -1;
    }

    if (!rightSegment) {
      return 1;
    }

    if (leftSegment.order !== rightSegment.order) {
      return leftSegment.order - rightSegment.order;
    }

    const nameComparison = leftSegment.name.localeCompare(rightSegment.name);

    if (nameComparison !== 0) {
      return nameComparison;
    }
  }

  return left.slug.localeCompare(right.slug);
}

function docFromModule(modulePath: string, source: string): DocInternal {
  const contentPath = normalizeContentPath(modulePath);
  const pathWithoutExtension = contentPath.replace(/\.md$/, "");
  const pathSegments = pathWithoutExtension.split("/").filter(Boolean);
  const sectionSegment = pathSegments[0];

  if (!sectionSegment || pathSegments.length < 2) {
    throw new Error(`Docs content must live in a section folder: ${contentPath}`);
  }

  const sectionKey = orderedSegment(sectionSegment).name;
  const parsed = parseMarkdownSource(source, contentPath);
  const audience: DocAudience = maintenanceSectionKeys.has(sectionKey) ? "maintenance" : "docs";

  return {
    audience,
    content: parsed.content,
    description: parsed.description,
    orderPath: pathSegments.map(orderedSegment),
    section: sectionLabels[sectionKey] ?? titleize(sectionKey),
    slug: slugForPath(pathSegments, audience),
    title: parsed.title,
  };
}

function buildDocs(modules: Record<string, string>): DocInternal[] {
  const docs = Object.entries(modules)
    .map(([modulePath, source]) => docFromModule(modulePath, source))
    .sort(compareDocs);
  const seenSlugs = new Set<string>();

  for (const doc of docs) {
    if (seenSlugs.has(doc.slug)) {
      throw new Error(`Duplicate docs slug: ${doc.slug}`);
    }

    seenSlugs.add(doc.slug);
  }

  return docs;
}

const contentModules = import.meta.glob<string>("../content/**/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
});

export function loadDocs(): Doc[] {
  return buildDocs(contentModules);
}
