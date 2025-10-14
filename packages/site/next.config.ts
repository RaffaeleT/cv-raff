import fs from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

// Configure basePath/assetPrefix dynamically for GitHub Pages project sites
const isGithub = process.env.GITHUB_PAGES === "true" || process.env.GITHUB_ACTIONS === "true";
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];
const isUserOrOrgSite = !!repo && repo.endsWith(".github.io");

const explicitBasePath = process.env.NEXT_BASE_PATH ?? process.env.NEXT_PUBLIC_BASE_PATH;
const forceBasePath = process.env.NEXT_FORCE_BASE_PATH === "true";
const hasCustomDomain = fs.existsSync(path.join(__dirname, "public", "CNAME"));

const sanitizeBasePath = (value?: string) => {
  if (!value) return undefined;
  const normalized = value.startsWith("/") ? value : `/${value}`;
  return normalized.replace(/\/+$/, "");
};

const sanitizedExplicit = sanitizeBasePath(explicitBasePath);
const repoBasePath = repo ? `/${repo}` : undefined;

const computedBasePath = forceBasePath
  ? sanitizedExplicit ?? repoBasePath
  : sanitizedExplicit !== undefined
    ? hasCustomDomain && sanitizedExplicit === repoBasePath
      ? undefined
      : sanitizedExplicit
    : !hasCustomDomain && isGithub && repo && !isUserOrOrgSite
      ? repoBasePath
      : undefined;

const nextConfig: NextConfig = {
  // Static export to `out/`
  output: "export",
  // Make image handling compatible with pure static export
  images: { unoptimized: true },
  // Ensure routes map to folders with index.html (friendlier on Pages)
  trailingSlash: true,
  // Prefix assets and routes when deploying to a project page (e.g., /cv-raff)
  basePath: computedBasePath,
  assetPrefix: computedBasePath ? `${computedBasePath}/` : undefined,
};

export default nextConfig;
