"use client";
export default function ErrorPage({ reset }) {
  return (
    <main
      style={{
        padding: 40,
        fontFamily: "Arial",
        background: "#f7f8fa",
        minHeight: "100vh",
      }}
    >
      <h1>Não foi possível carregar esta área.</h1>
      <p>
        O site aguarda a conexão ou a atualização da plataforma. Tente novamente
        em alguns instantes.
      </p>
      <button onClick={reset}>Tentar novamente</button>
      <p>
        <a href="/">Voltar ao início</a>
      </p>
    </main>
  );
}
