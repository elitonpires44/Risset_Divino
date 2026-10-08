import PublicShell from "../../components/PublicShell";
import Gallery from "../../components/Gallery";
import { publicRecords } from "../../lib/public";
export const dynamic = "force-dynamic";
export const metadata = { title: "Estudos e acervo | RISSET DIVINO" };
export default async function Contents() {
  return (
    <PublicShell title="Estudos, formação e acervo.">
      <Gallery
        records={(await publicRecords()).filter(
          (r) =>
            r.module !== "artworks" &&
            !["tasks", "forms", "seo"].includes(r.module),
        )}
      />
    </PublicShell>
  );
}
