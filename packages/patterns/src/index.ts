import { definePlugin, definePreset, defineRule } from "pokayoke";

const noFindings = async () => ({ findings: [] });

export const noBannedText = defineRule({
  meta: {
    id: "patterns/no-banned-text",
    docs: "Disallow configured text patterns in selected files.",
    kind: "file",
  },
  run: noFindings,
});

export const requiredText = defineRule({
  meta: {
    id: "patterns/required-text",
    docs: "Require configured text patterns in selected files.",
    kind: "file",
  },
  run: noFindings,
});

export const fileMustMatch = defineRule({
  meta: {
    id: "patterns/file-must-match",
    docs: "Require a file to match a configured regular expression or exact text block.",
    kind: "file",
  },
  run: noFindings,
});

export const rules = {
  [noBannedText.meta.id]: noBannedText,
  [requiredText.meta.id]: requiredText,
  [fileMustMatch.meta.id]: fileMustMatch,
};

export const recommended = definePreset({
  name: "@pokayoke/patterns/recommended",
  rules: {},
});

export default definePlugin({
  name: "@pokayoke/patterns",
  rules,
  presets: {
    recommended,
  },
});
