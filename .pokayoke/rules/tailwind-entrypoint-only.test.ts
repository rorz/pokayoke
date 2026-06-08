import { describe, expect, test } from "bun:test";

import { tailwindEntrypointOnly } from "./tailwind-entrypoint-only.rule";

describe("docs/tailwind-entrypoint-only", () => {
  test("allows Tailwind entrypoint directives and override blocks", async () => {
    const result = await tailwindEntrypointOnly.run(
      contextWithCss(`@import "tailwindcss";

@source "../components"
@source "../lib"
@source "../pages"

@theme {
  --font-sans: "Inter";
}

@utility content-auto {
  content-visibility: auto;
}
`),
    );

    expect(result.findings).toHaveLength(0);
  });

  test("reports component styles in the docs CSS entrypoint", async () => {
    const result = await tailwindEntrypointOnly.run(
      contextWithCss(`@import "tailwindcss";

.home-app-icon {
  color: red;
}
`),
    );

    expect(result.findings).toHaveLength(1);
    expect(result.findings[0]?.file).toBe("apps/docs/styles/tailwind.css");
    expect(result.findings[0]?.line).toBe(3);
  });

  test("reports media-query wrapped component styles", async () => {
    const result = await tailwindEntrypointOnly.run(
      contextWithCss(`@import "tailwindcss";

@media (min-width: 1024px) {
  .home-app-icon {
    display: grid;
  }
}
`),
    );

    expect(result.findings).toHaveLength(1);
    expect(result.findings[0]?.line).toBe(3);
  });
});

function contextWithCss(source: string) {
  return {
    execAdapter: async () => ({ exitCode: 0, stderr: "", stdout: "" }),
    files: async () => [],
    fix: false,
    glob: async () => [],
    options: undefined,
    packageJson: async () => ({}),
    parseTypescript: async () => {
      throw new Error("parseTypescript is not used by this rule.");
    },
    readFile: async () => source,
    report: () => {},
    root: "/tmp/pokayoke-local-rule",
    workspaces: async () => [],
  };
}
