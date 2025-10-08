export const dynamic = "error"; // forza SSG
import { getCvHtml } from "../../lib/read-cv";

export default function Page() {
  const { html, meta } = getCvHtml();
  return (
    <main
      className="prose mx-auto px-4 py-10"
      style={meta?.accent ? ({ ['--accent' as any]: meta.accent } as any) : undefined}
    >
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  );
}
