import PublicShell from "../../components/PublicShell";
import ContactForm from "../../components/ContactForm";
import { siteSettings } from "../../lib/public";
export const dynamic = "force-dynamic";
export const metadata = { title: "Contato e participação | RISSET DIVINO" };
export default async function Page() {
  const settings = await siteSettings();
  return (
    <PublicShell title="Sua participação faz parte do propósito.">
      <p>
        Converse conosco, conheça a obra e encontre seu caminho de participação.
      </p>
      <ContactForm privacy={settings?.privacy || ""} />
    </PublicShell>
  );
}
