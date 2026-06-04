import { describe, expect, test } from "bun:test";

import { describeMode, principles, renderProjectSummary } from "./index";

describe("Pokayoke project scaffold", () => {
  test("describes both check modes", () => {
    expect(describeMode("warning")).toContain("leaving the author in control");
    expect(describeMode("control")).toContain("block progress");
  });

  test("renders a readable project summary", () => {
    const summary = renderProjectSummary();

    expect(summary).toContain("Pokayoke");
    expect(summary).toContain("Convention forcing functions");
    expect(summary).toContain(principles[0]!.name);
  });
});
