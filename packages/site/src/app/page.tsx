export const dynamic = "error"; // forza SSG
import { getCvHtml } from "../../lib/read-cv";
import type { CSSProperties } from "react";

export default function Page() {
  const { html, meta } = getCvHtml();
  type AccentStyle = CSSProperties & { [key in "--accent"]?: string };
  const style: AccentStyle | undefined = meta?.accent ? { ["--accent"]: meta.accent } : undefined;

  // Insert video after LinkedIn link
  const htmlWithVideo = (html as string).replace(
    /(<a href="https:\/\/www\.linkedin\.com\/in\/datacurious\/">.*?<\/a>)/,
    '$1\n\n<video width="100%" controls style="margin-top: 1rem; max-width: 800px;">\n  <source src="https://www.dropbox.com/scl/fi/6d197pfkj0wjbh8k7e0lk/raffaele.mp4?rlkey=a64a2941zi5sblt6egdrp1m6j&st=dmy0wfwg&raw=1" type="video/mp4">\n  Your browser does not support the video tag.\n</video>'
  );

  return (
    <main
      className="prose mx-auto px-4 py-10"
      style={style}
    >
      <div dangerouslySetInnerHTML={{ __html: htmlWithVideo }} />
    </main>
  );
}
