import packagePolicyPlugin from "./package-policy";
import patternsPlugin from "./patterns";
import typescriptPlugin from "./typescript";

export {
  catalog,
  noNpxInScripts,
  workspaceProtocol,
} from "./package-policy";
export {
  fileMustMatch,
  noBannedText,
  requiredText,
} from "./patterns";
export {
  enforceArrowFunction,
  noForwardReference,
  noOptionalEnv,
  noSwallowedErrors,
} from "./typescript";

export const bundledPlugins = [typescriptPlugin, packagePolicyPlugin, patternsPlugin];
