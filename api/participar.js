const MAX_BODY = 5000;

function clean(value, max) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Método não permitido." });
  }
  const body = request.body || {};
  if (JSON.stringify(body).length > MAX_BODY || body.website) {
    return response.status(400).json({ error: "Resposta inválida." });
  }
  const nome = clean(body.nome, 120);
  const localidade = clean(body.localidade, 120);
  const email = clean(body.email, 160).toLowerCase();
  const perfil = clean(body.perfil, 80);
  const interesses = Array.isArray(body.interesses)
    ? body.interesses.map((item) => clean(item, 80)).filter(Boolean).slice(0, 8)
    : [];
  if (!nome || !localidade || !perfil || !body.consentimento || !/^\S+@\S+\.\S+$/.test(email)) {
    return response.status(400).json({ error: "Confira os campos obrigatórios." });
  }
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return response.status(503).json({ error: "O formulário está em preparação. Tente novamente em breve." });
  }
  const upstream = await fetch(`${url}/rest/v1/participantes`, {
    method: "POST",
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
      prefer: "return=minimal",
    },
    body: JSON.stringify({
      nome, localidade, email, perfil, interesses,
      contribuicao: clean(body.contribuicao, 800),
      mensagem: clean(body.mensagem, 1200),
      consentimento: true,
      origem: "congresso-2026",
    }),
  });
  if (!upstream.ok) {
    console.error("Supabase insert failed", upstream.status);
    return response.status(502).json({ error: "Não foi possível registrar agora. Tente novamente." });
  }
  return response.status(201).json({ ok: true });
}
