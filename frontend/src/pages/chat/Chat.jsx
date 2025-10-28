import React, { useState, useRef, useEffect } from "react";
import "./Chat.css";
import { API_BASE } from "./config";
import { useNavigate } from "react-router-dom";

function Chat() {
  const [mensagem, setMensagem] = useState("");
  const [respostas, setRespostas] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const chatAreaRef = useRef(null);
  const navigate = useNavigate();

  async function handleEnviar() {
    if (mensagem.trim() === "") return;

    setRespostas((prev) => [...prev, { texto: mensagem, autor: "user" }]);
    setMensagem("");
    setCarregando(true);

    try {
      const resp = await fetch(`${API_BASE}/api/recomendacao`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: mensagem }),
      });

      const data = await resp.json();

      if (data.recomendacao) {
        const textoHTML = data.recomendacao
          .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
          .replace(/\n/g, "<br />");
        setRespostas((prev) => [
          ...prev,
          { texto: textoHTML, autor: "bot", html: true },
        ]);
      } else if (Array.isArray(data) && data.length > 0) {
        const respostaFormatada = data
          .map(
            (v) =>
              `🚗 ${v.modelo} — R$${Number(v.preco_estimado).toLocaleString(
                "pt-BR"
              )} (score: ${v.score ?? "–"})`
          )
          .join("\n");

        setRespostas((prev) => [
          ...prev,
          { texto: "Essas são as melhores opções:", autor: "bot" },
          { texto: respostaFormatada, autor: "bot" },
        ]);
      } else {
        setRespostas((prev) => [
          ...prev,
          { texto: "Certo! Anotei sua resposta 👍", autor: "bot" },
        ]);
      }
    } catch (err) {
      console.error(err);
      setRespostas((prev) => [
        ...prev,
        { texto: "Erro ao conectar ao servidor 😕", autor: "bot" },
      ]);
    } finally {
      setCarregando(false);
    }
  }

  function handleKeyPress(e) {
    if (e.key === "Enter") handleEnviar();
  }

  useEffect(() => {
    const el = chatAreaRef.current;
    if (!el) return;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    const nearBottom = dist < 80;
    if (nearBottom) el.scrollTop = el.scrollHeight;
  }, [respostas, carregando]);

  return (
    <div className="page gradient-bg">
      <div className="chat-card">
        <header className="chat-header">
          <div className="hero">
            <span className="badge">Beta</span>
            <h1>
              Assistente <span className="highlighted">Toyota</span>
            </h1>
            <p>Seu consultor virtual de veículos</p>
          </div>

          {/* 🔹 Botão para funcionários */}
          <button className="admin-btn" onClick={() => navigate("/login")}>
            Área do Funcionário
          </button>
        </header>

        <main className="chat-area" ref={chatAreaRef}>
          {respostas.map((msg, i) => (
            <div
              key={i}
              className={`msg ${msg.autor === "user" ? "user" : "bot"}`}
            >
              {msg.html ? (
                <div dangerouslySetInnerHTML={{ __html: msg.texto }} />
              ) : (
                msg.texto
                  .split("\n")
                  .map((linha, j) => <div key={j}>{linha}</div>)
              )}
            </div>
          ))}
          {carregando && <div className="msg bot">⏳ Pensando...</div>}
        </main>

        <footer className="input-box">
          <input
            type="text"
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Digite sua mensagem..."
          />
          <button onClick={handleEnviar}>Enviar</button>
        </footer>
      </div>
    </div>
  );
}

export default Chat;
