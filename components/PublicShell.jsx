import "../app/platform.css";
export default function PublicShell({
  title,
  kicker = "PROJETO MILÊNIO - RISSET DIVINO",
  children,
}) {
  return (
    <div className="public-platform">
      <header>
        <a href="/" className="public-brand">
          <span>RD</span>
          <strong>
            RISSET DIVINO<small>Projeto Milênio</small>
          </strong>
        </a>
        <nav>
          <a href="/">Início</a>
          <a href="/galeria">Artes</a>
          <a href="/conteudos">Estudos e acervo</a>
          <a href="/contato">Participe</a>
        </nav>
      </header>
      <main>
        <p className="public-kicker">{kicker}</p>
        <h1>{title}</h1>
        {children}
      </main>
      <footer>
        Projeto Milênio - RISSET DIVINO
        <br />A Família de Deus Ativa em Movimento
      </footer>
    </div>
  );
}
