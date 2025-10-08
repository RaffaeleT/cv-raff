import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

// Configure Markdown rendering for better headings/anchors and typography
marked.setOptions({
  gfm: true,
  breaks: false,
});

export function getCvHtml() {
  const mdPath = path.join(process.cwd(), "..", "content", "RaffaeleTurra_CV.md");
  const raw = fs.readFileSync(mdPath, "utf8");
  const { content, data } = matter(raw); // front-matter opzionale
  const html = marked.parse(content);
  return { html, meta: data };
}
