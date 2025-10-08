export const dynamic = "error"; // forza SSG
import { getCvHtml } from "../../lib/read-cv";
import type { CSSProperties } from "react";

export default function Page() {
  const { html, meta } = getCvHtml();
  type AccentStyle = CSSProperties & { [key in "--accent"]?: string };
  const style: AccentStyle | undefined = meta?.accent ? { ["--accent"]: meta.accent } : undefined;
  return (
    <main
      className="prose mx-auto px-4 py-10"
      style={style}
    >
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  );
}
