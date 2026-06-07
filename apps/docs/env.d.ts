/// <reference types="vite/client" />

declare module "*.md?raw" {
  const content: string;
  export default content;
}

declare module "virtual:vinext-server-entry" {
  type VinextVirtualMiddlewareResult = {
    continue?: boolean;
    redirectStatus?: number;
    redirectUrl?: string;
    response?: Response;
    responseHeaders?: Iterable<[string, string]>;
    rewriteStatus?: number;
    rewriteUrl?: string;
    waitUntilPromises?: Promise<unknown>[];
  };

  type VinextVirtualPageMatch = {
    route: {
      isDynamic?: boolean;
    };
  };

  type VinextVirtualConfig = {
    assetPrefix?: string;
    basePath?: string;
    headers?: import("vinext/config/next-config").NextHeader[];
    i18n?: import("vinext/config/next-config").NextI18nConfig;
    images?: NonNullable<import("vinext/config/next-config").NextConfig["images"]>;
    redirects?: import("vinext/config/next-config").NextRedirect[];
    rewrites?: {
      afterFiles?: import("vinext/config/next-config").NextRewrite[];
      beforeFiles?: import("vinext/config/next-config").NextRewrite[];
      fallback?: import("vinext/config/next-config").NextRewrite[];
    };
    trailingSlash?: boolean;
  };

  export const handleApiRoute: ((...args: unknown[]) => Promise<Response>) | undefined;
  export const matchPageRoute: ((...args: unknown[]) => VinextVirtualPageMatch | null) | undefined;
  export const renderPage: ((...args: unknown[]) => Promise<Response>) | undefined;
  export const runMiddleware:
    | ((...args: unknown[]) => Promise<VinextVirtualMiddlewareResult>)
    | undefined;
  export const vinextConfig: VinextVirtualConfig;
}
