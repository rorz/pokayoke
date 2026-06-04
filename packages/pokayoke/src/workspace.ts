import type { Workspace } from "./types";

type PackageJson = {
  name?: string;
  workspaces?: string[] | { packages?: string[] };
};

export async function collectFiles(
  root: string,
  patterns: string[] = ["**/*"],
  ignores: string[] = [],
): Promise<string[]> {
  const files = new Set<string>();
  const ignoreGlobs = ignores.map((pattern) => new Bun.Glob(pattern));

  for (const pattern of patterns) {
    const glob = new Bun.Glob(pattern);

    for await (const file of glob.scan({ cwd: root, onlyFiles: true })) {
      if (!ignoreGlobs.some((ignore) => ignore.match(file))) {
        files.add(file);
      }
    }
  }

  return [...files].sort();
}

export async function readPackageJson(
  root: string,
  workspace = ".",
): Promise<Record<string, unknown>> {
  const path = workspace === "." ? `${root}/package.json` : `${root}/${workspace}/package.json`;
  const file = Bun.file(path);

  if (!(await file.exists())) {
    throw new Error(`No package.json found at ${path}.`);
  }

  return JSON.parse(await file.text()) as Record<string, unknown>;
}

export async function discoverWorkspaces(root: string): Promise<Workspace[]> {
  const rootPackageJson = (await readPackageJson(root)) as PackageJson;
  const workspacePatterns = normalizeWorkspacePatterns(rootPackageJson.workspaces);
  const workspaces: Workspace[] = [{ name: rootPackageJson.name ?? ".", root: "." }];

  for (const pattern of workspacePatterns) {
    const glob = new Bun.Glob(`${pattern}/package.json`);

    for await (const packageJsonPath of glob.scan({ cwd: root, onlyFiles: true })) {
      const workspaceRoot = packageJsonPath.replace(/\/package\.json$/, "");
      const packageJson = (await readPackageJson(root, workspaceRoot)) as PackageJson;

      workspaces.push({
        name: packageJson.name ?? workspaceRoot,
        root: workspaceRoot,
      });
    }
  }

  return workspaces.sort((left, right) => left.root.localeCompare(right.root));
}

function normalizeWorkspacePatterns(workspaces: PackageJson["workspaces"]): string[] {
  if (Array.isArray(workspaces)) {
    return workspaces;
  }

  if (workspaces && Array.isArray(workspaces.packages)) {
    return workspaces.packages;
  }

  return [];
}
