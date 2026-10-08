"use client";
import { useState, useMemo } from "react";
import { makeClient } from "../lib/supabase";
export default function ContactForm({ privacy }) {
  const db = useMemo(() => makeClient(), []);
  const [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const values = new FormData(form);
    if (values.get("website")) return;
    if (!db) {
      setMessage(
        "O formulário será disponibilizado após a ativação dos canais oficiais.",
      );
      return;
    }
    setBusy(true);
    const { error } = await db.rpc("submit_contact", {
      p_name: values.get("name"),
      p_email: values.get("email"),
      p_phone: values.get("phone"),
      p_city: values.get("city"),
      p_state: values.get("state"),
      p_interest: values.get("interest"),
      p_message: values.get("message"),
      p_consent: values.get("consent") === "on",
    });
    setBusy(false);
    setMessage(
      error
        ? "Não foi possível enviar. Confira os campos e aguarde um minuto antes de tentar novamente."
        : "Mensagem recebida. Obrigado por participar desta obra.",
    );
    if (!error) form.reset();
  }
  return (
    <>
      <form onSubmit={submit}>
        <label>
          Nome
          <input
            name="name"
            required
            minLength={2}
            maxLength={150}
            autoComplete="name"
          />
        </label>
        <label>
          E-mail
          <input
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
          />
        </label>
        <label>
          WhatsApp / telefone
          <input name="phone" type="tel" maxLength={30} autoComplete="tel" />
        </label>
        <div className="form-row">
          <label>
            Cidade
            <input name="city" maxLength={120} autoComplete="address-level2" />
          </label>
          <label>
            Estado
            <input name="state" maxLength={120} autoComplete="address-level1" />
          </label>
        </div>
        <label>
          Interesse
          <select name="interest">
            {[
              "Contato",
              "Quero participar",
              "Colaborador",
              "Parceiro",
              "Igreja / Instituição",
              "Pedido de material",
              "Newsletter",
              "Semente / Doação",
            ].map((i) => (
              <option key={i}>{i}</option>
            ))}
          </select>
        </label>
        <label>
          Mensagem
          <textarea name="message" maxLength={5000} rows={5} />
        </label>
        <label style={{ display: "none" }} aria-hidden="true">
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
        <label>
          <input type="checkbox" name="consent" required /> Concordo com o uso
          dos meus dados para responder a esta solicitação, conforme a política
          de privacidade.
        </label>
        <button disabled={busy || !db || !privacy}>
          {busy ? "Enviando…" : "Enviar mensagem"}
        </button>
        {!privacy && (
          <p>O formulário aguarda a publicação da política de privacidade.</p>
        )}
      </form>
      <p role="status">{message}</p>
      {privacy && (
        <details>
          <summary>Política de privacidade</summary>
          <p style={{ whiteSpace: "pre-wrap" }}>{privacy}</p>
        </details>
      )}
    </>
  );
}
