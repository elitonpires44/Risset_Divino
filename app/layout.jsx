export const metadata = {
  title: "Projeto Milênio - RISSET DIVINO",
  description: "A Família de Deus Ativa em Movimento",
};
export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
