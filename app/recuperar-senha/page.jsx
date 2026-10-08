"use client";
import { useMemo, useEffect, useState } from "react";
import { makeClient } from "../../lib/supabase";
import PublicShell from "../../components/PublicShell";
export default function Recover() {
  const db = useMemo(() => makeClient(), []);
  const [ready, setReady] = useState(false),
    [message, setMessage] = useState(""),
    [password, setPassword] = useState("");
  useEffect(() => {
    if (!db) return;
    db.auth.getSession().then(({ data }) => setReady(!!data.session));
    const { data } = db.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, [db]);
  return (
    <PublicShell title="Recuperar seu acesso.">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!db) return;
          const { error } = await db.auth.updateUser({ password });
          setMessage(
            error
              ? "Não foi possível atualizar. Solicite um novo link de recuperação."
              : "Senha atualizada. Você já pode entrar no painel.",
          );
          if (!error) {
            setPassword("");
            await db.auth.signOut();
            setReady(false);
          }
        }}
      >
        <label>
          Nova senha
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={12}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button disabled={!ready}>Salvar nova senha</button>
        <p role="status">{message}</p>
        {!ready && <p>Abra o link de recuperação enviado ao seu e-mail.</p>}
        <a href="/admin">Voltar ao painel</a>
      </form>
    </PublicShell>
  );
}
