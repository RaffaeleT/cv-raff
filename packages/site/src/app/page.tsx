export const dynamic = "error"; // forza SSG
import { getCvHtml } from "../../lib/read-cv";
import type { CSSProperties } from "react";

export default function Page() {
  const { html, meta } = getCvHtml();
  type AccentStyle = CSSProperties & { [key in "--accent"]?: string };
  const style: AccentStyle | undefined = meta?.accent ? { ["--accent"]: meta.accent } : undefined;

  const videoSrc =
    process.env.NEXT_PUBLIC_VIDEO_SAS_URL ??
    process.env.NEXT_VIDEO_BLOB_SAS_URL ??
    "";
  const htmlString = typeof html === "string" ? html : String(html ?? "");

  // Insert Azure-hosted video (if configured) right after the LinkedIn link
  const htmlWithVideo =
    videoSrc !== ""
      ? htmlString.replace(
          /(<a href="https:\/\/www\.linkedin\.com\/in\/datacurious\/">.*?<\/a>)/,
          `$1\n\n<video width="100%" controls playsinline preload="metadata" style="margin-top: 1rem; max-width: 800px;">\n  <source src="${videoSrc}" type="video/mp4">\n  Your browser does not support the video tag.\n</video>`
        )
      : htmlString;

  return (
    <main
      className="prose mx-auto px-4 py-10"
      style={style}
    >
      <div dangerouslySetInnerHTML={{ __html: htmlWithVideo }} />
    </main>
  );
}
