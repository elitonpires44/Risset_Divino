(() => {
  const form = document.getElementById("participationForm");
  const status = document.getElementById("formStatus");
  if (!form || !status) return;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = form.querySelector("button[type='submit']");
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());
    payload.interesses = data.getAll("interesses");
    payload.consentimento = data.get("consentimento") === "on";
    button.disabled = true;
    status.className = "form-status";
    status.textContent = "Enviando sua resposta…";
    try {
      const response = await fetch("/api/participar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível enviar.");
      form.reset();
      status.className = "form-status success";
      status.textContent = "Resposta recebida. Gratidão por caminhar conosco!";
    } catch (error) {
      status.className = "form-status error";
      status.textContent = error.message || "Não foi possível enviar agora. Tente novamente.";
    } finally {
      button.disabled = false;
    }
  });
})();
