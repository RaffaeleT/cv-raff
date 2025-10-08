import { getCvHtml } from "../../../lib/read-cv";
import "./print.css"; // definisci margini, nascondi elementi non stampabili

export default function PrintPage() {
  const { html, meta } = getCvHtml();
  return (
    <main
      className="prose mx-auto px-4"
      style={meta?.accent ? ({ ['--accent' as any]: meta.accent } as any) : undefined}
    >
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  );
}
