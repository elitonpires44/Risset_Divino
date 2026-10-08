import PublicShell from "../../components/PublicShell";
import Gallery from "../../components/Gallery";
import { publicRecords } from "../../lib/public";
import { withMedia } from "../../lib/media";
export const dynamic = "force-dynamic";
export const metadata = { title: "Galeria de artes | RISSET DIVINO" };
export default async function GalleryPage() {
  return (
    <PublicShell title="Artes que comunicam o propósito.">
      <p>Uma coleção para conhecer, contemplar e conferir.</p>
      <Gallery records={await withMedia(await publicRecords("artworks"))} art />
    </PublicShell>
  );
}
