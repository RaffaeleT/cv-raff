import { getCvHtml } from "../../../lib/read-cv";
import "./print.css"; // definisci margini, nascondi elementi non stampabili
import type { CSSProperties } from "react";

export default function PrintPage() {
  const { html, meta } = getCvHtml();
  type AccentStyle = CSSProperties & { [key in "--accent"]?: string };
  const style: AccentStyle | undefined = meta?.accent ? { ["--accent"]: meta.accent } : undefined;
  return (
    <main
      className="prose mx-auto px-4"
      style={style}
    >
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  );
}
