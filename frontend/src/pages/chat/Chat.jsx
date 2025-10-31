import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import "./Chat.css";
import { API_BASE } from "./config";
import { useNavigate } from "react-router-dom";

function Chat() {
  const [mensagem, setMensagem] = useState("");
  const [respostas, setRespostas] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const chatAreaRef = useRef(null);
  const bottomRef = useRef(null);
  const isAtBottomRef = useRef(true); // controla se devemos auto-rolar
  const navigate = useNavigate();

  // -------- Scroll helpers --------
  const scrollToBottom = (smooth = true) => {
    if (!bottomRef.current) return;
    bottomRef.current.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  };

  const handleScroll = () => {
    const el = chatAreaRef.current;
    if (!el) return;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    isAtBottomRef.current = dist < 12;
  };

  // rola para o fundo no primeiro render
  useLayoutEffect(() => {
    scrollToBottom(false);
  }, []);

  // mensagem inicial automática
  useEffect(() => {
    const mensagemInicial = {
      texto:
        " Olá, tudo bem?\n\n" +
        "Sou o assistente virtual da concessionária Toyota! 🚗\n\n" +
        "Me conte o que você está buscando pode ser algo como:\n" +
        "• Quero um carro econômico\n" +
        "• Procuro um SUV 0km\n" +
        "• Quero um modelo esportivo potente\n\n" +
        "Assim posso te recomendar os melhores veículos disponíveis 😉",
      autor: "bot",
    };
    setRespostas([mensagemInicial]);
  }, []);

  useEffect(() => {
    if (isAtBottomRef.current) scrollToBottom(true);
  }, [respostas, carregando]);

  // -------- Envio --------
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

  return (
    <div className="page gradient-bg">
      <div className="chat-card">
        <header className="chat-header">
          <div className="header-actions">
            <div />
            <button className="admin-cta" onClick={() => navigate("/login")}
              aria-label="Ir para área do funcionário">
              <span className="admin-cta__icon">🛡️</span>
              <span className="admin-cta__texts">
                <span className="admin-cta__title">Área do funcionário</span>
                <span className="admin-cta__subtitle">Acessar dashboard</span>
              </span>
              <span className="admin-cta__arrow">→</span>
            </button>
          </div>
          <div className="hero">
            <span className="badge">Beta</span>
            <h1>
              Assistente <span className="highlighted">Toyota</span>
            </h1>
            <p>Seu consultor virtual de veículos</p>
          </div>
        </header>

        {/* Área com scroll livre; onScroll atualiza isAtBottomRef */}
        <main className="chat-area" ref={chatAreaRef} onScroll={handleScroll}>
          {respostas.map((msg, i) => (
            <div
              key={i}
              className={`msg ${msg.autor === "user" ? "user" : "bot"}`}
            >
              {msg.html ? (
                <div dangerouslySetInnerHTML={{ __html: msg.texto }} />
              ) : (
                msg.texto.split("\n").map((linha, j) => <div key={j}>{linha}</div>)
              )}
            </div>
          ))}

          {carregando && <div className="msg bot">⏳ Pensando...</div>}

          <div ref={bottomRef} />
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
