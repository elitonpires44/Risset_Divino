import { notFound } from "next/navigation";
import ContentDetail from "../../../components/ContentDetail";
import { detail, detailMetadata } from "../../../lib/detail";
import { withMedia } from "../../../lib/media";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }) {
  return detailMetadata((await params).slug, true);
}
export default async function Page({ params }) {
  const r = await detail((await params).slug, true);
  if (!r) notFound();
  return <ContentDetail record={(await withMedia([r]))[0]} />;
}
