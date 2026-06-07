import { definePlugin, definePreset } from "../../define";

import { enforceArrowFunction } from "./enforce-arrow-function";
import { noForwardReference } from "./no-forward-reference";
import { noOptionalEnv } from "./no-optional-env";
import { noSwallowedErrors } from "./no-swallowed-errors";

export { enforceArrowFunction } from "./enforce-arrow-function";
export { noForwardReference } from "./no-forward-reference";
export { noOptionalEnv } from "./no-optional-env";
export { noSwallowedErrors } from "./no-swallowed-errors";

const rules = {
  [enforceArrowFunction.meta.id]: enforceArrowFunction,
  [noForwardReference.meta.id]: noForwardReference,
  [noOptionalEnv.meta.id]: noOptionalEnv,
  [noSwallowedErrors.meta.id]: noSwallowedErrors,
};

const recommended = definePreset({
  name: "pokayoke/typescript/recommended",
  rules: {
    [noForwardReference.meta.id]: "error",
    [noOptionalEnv.meta.id]: "warn",
    [noSwallowedErrors.meta.id]: "error",
  },
});

export default definePlugin({
  name: "pokayoke/typescript",
  rules,
  presets: {
    recommended,
  },
});
