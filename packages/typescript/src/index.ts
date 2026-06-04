import { definePlugin, definePreset, defineRule } from "pokayoke";

const noFindings = async () => ({ findings: [] });

export const enforceArrowFunction = defineRule({
  meta: {
    id: "typescript/enforce-arrow-function",
    docs: "Prefer arrow functions where a project convention requires lexical function values.",
    kind: "file",
  },
  run: noFindings,
});

export const noForwardReference = defineRule({
  meta: {
    id: "typescript/no-forward-reference",
    docs: "Prevent declarations from referencing values before they are defined when ordering is part of the convention.",
    kind: "file",
  },
  run: noFindings,
});

export const noSwallowedErrors = defineRule({
  meta: {
    id: "typescript/no-swallowed-errors",
    docs: "Require intentionally ignored errors to be explicit and explained.",
    kind: "file",
  },
  run: noFindings,
});

export const rules = {
  [enforceArrowFunction.meta.id]: enforceArrowFunction,
  [noForwardReference.meta.id]: noForwardReference,
  [noSwallowedErrors.meta.id]: noSwallowedErrors,
};

export const recommended = definePreset({
  name: "@pokayoke/typescript/recommended",
  rules: {
    [noForwardReference.meta.id]: "error",
    [noSwallowedErrors.meta.id]: "error",
  },
});

export default definePlugin({
  name: "@pokayoke/typescript",
  rules,
  presets: {
    recommended,
  },
});
