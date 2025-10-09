import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import type { Tokens } from "marked";

// Configure Markdown rendering for better headings/anchors and typography
marked.setOptions({
  gfm: true,
  breaks: false,
});

const MIME_BY_EXTENSION: Record<string, string> = {
  ".apng": "image/apng",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".jfif": "image/jpeg",
  ".pjp": "image/jpeg",
  ".pjpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function isExternalLink(target: string) {
  return /^(?:[a-z][a-z\d+\-.]*:)?\/\//i.test(target) || target.startsWith("data:");
}

function tryLoadMediaAsDataUri(mediaPath: string) {
  try {
    const stats = fs.statSync(mediaPath);
    if (!stats.isFile()) return undefined;
  } catch {
    return undefined;
  }

  const ext = path.extname(mediaPath).toLowerCase();
  const mimeType = MIME_BY_EXTENSION[ext] ?? "application/octet-stream";
  const buffer = fs.readFileSync(mediaPath);
  const base64 = buffer.toString("base64");
  return `data:${mimeType};base64,${base64}`;
}

export function getCvHtml() {
  const mdPath = path.join(process.cwd(), "..", "content", "RaffaeleTurra_CV.md");
  const contentDir = path.dirname(mdPath);
  const raw = fs.readFileSync(mdPath, "utf8");
  const { content, data } = matter(raw); // front-matter opzionale

  const renderer = new marked.Renderer();
  const originalImageRenderer =
    renderer.image?.bind(renderer) ??
    ((token: Tokens.Image) => {
      const safeSrc = token.href ?? "";
      const safeAlt = token.text ?? "";
      const titleAttr = token.title ? ` title="${token.title}"` : "";
      return `<img src="${safeSrc}" alt="${safeAlt}"${titleAttr}>`;
    });

  renderer.image = (token: Tokens.Image) => {
    const href = token.href;
    if (!href) return originalImageRenderer(token);
    if (isExternalLink(href) || path.isAbsolute(href)) {
      return originalImageRenderer(token);
    }

    const resolvedPath = path.resolve(contentDir, href);
    const relative = path.relative(contentDir, resolvedPath);

    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      return originalImageRenderer(token);
    }

    const dataUri = tryLoadMediaAsDataUri(resolvedPath);
    const finalToken: Tokens.Image = {
      ...token,
      href: dataUri ?? href,
    };
    return originalImageRenderer(finalToken);
  };

  const html = marked.parse(content, { renderer });
  return { html, meta: data };
}
