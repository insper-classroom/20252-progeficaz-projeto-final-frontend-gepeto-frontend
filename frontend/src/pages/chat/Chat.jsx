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
    // distância até o fundo
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    // considera "no fundo" quando a distância é pequena
    isAtBottomRef.current = dist < 12;
  };

  // rola para o fundo no primeiro render
  useLayoutEffect(() => {
    scrollToBottom(false);
  }, []);

  // rola somente quando chega mensagem nova E usuário está no fundo
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
          <div className="hero">
            <span className="badge">Beta</span>
            <h1>
              Assistente <span className="highlighted">Toyota</span>
            </h1>
            <p>Seu consultor virtual de veículos</p>
          </div>

          <button className="admin-btn" onClick={() => navigate("/login")}>
            Área do Funcionário
          </button>
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

          {/* Âncora invisível para rolar até o fim com precisão */}
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
