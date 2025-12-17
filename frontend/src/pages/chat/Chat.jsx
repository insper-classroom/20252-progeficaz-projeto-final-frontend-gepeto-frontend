import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import "./Chat.css";
import { API_BASE } from "./config";
import { useNavigate } from "react-router-dom";

function Chat() {
  const [mensagem, setMensagem] = useState("");
  const [respostas, setRespostas] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [sessionId, setSessionId] = useState(null);

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

  // Inicializar session_id e carregar conversa existente
  useEffect(() => {
    async function inicializarConversa() {
      try {
        // Tentar recuperar session_id do localStorage
        let sessionIdLocal = localStorage.getItem("chat_session_id");
        
        if (sessionIdLocal) {
          // Tentar carregar histórico da conversa
          try {
            const resp = await fetch(`${API_BASE}/api/conversa/${sessionIdLocal}`);
            if (resp.ok) {
              const data = await resp.json();
              setSessionId(sessionIdLocal);
              
              // Carregar histórico se existir (filtrar respostas genéricas antigas)
              if (data.mensagens && data.mensagens.length > 0) {
                const historicoFormatado = data.mensagens
                  .filter((msg) => {
                    // Filtrar respostas genéricas antigas do bot
                    if (msg.autor === "bot") {
                      const textoLower = msg.texto.toLowerCase();
                      const respostasGenericas = ["certo! anotei", "anotei sua resposta"];
                      return !respostasGenericas.some(gen => textoLower.includes(gen));
                    }
                    return true;
                  })
                  .map((msg) => ({
                    texto: msg.texto,
                    autor: msg.autor === "user" ? "user" : "bot",
                    html: msg.autor === "bot" && msg.texto.includes("<b>"),
                  }));
                
                // Só carregar se houver mensagens válidas após filtro
                if (historicoFormatado.length > 0) {
                  setRespostas(historicoFormatado);
                  return;
                }
              }
            }
          } catch (err) {
            console.log("Conversa não encontrada, criando nova");
          }
        }
        
        // Criar nova conversa
        const resp = await fetch(`${API_BASE}/api/conversa/nova`, {
          method: "POST",
        });
        const data = await resp.json();
        
        if (data.session_id) {
          setSessionId(data.session_id);
          localStorage.setItem("chat_session_id", data.session_id);
        }
        
        // Mensagem inicial
        const mensagemInicial = {
          texto:
            "Olá, tudo bem? 👋\n\n" +
            "Sou o assistente virtual da concessionária Toyota! 🚗\n\n" +
            "Estou aqui para te ajudar a encontrar o veículo perfeito! Pode me contar o que você está buscando?\n\n" +
            "Por exemplo:\n" +
            "• Quero um carro econômico\n" +
            "• Procuro um SUV 0km\n" +
            "• Quero um modelo esportivo potente\n\n" +
            "Vou te recomendar os melhores veículos disponíveis! 😉",
          autor: "bot",
        };
        setRespostas([mensagemInicial]);
      } catch (err) {
        console.error("Erro ao inicializar conversa:", err);
        // Mensagem inicial mesmo em caso de erro
        const mensagemInicial = {
          texto:
            "Olá, tudo bem? 👋\n\n" +
            "Sou o assistente virtual da concessionária Toyota! 🚗\n\n" +
            "Estou aqui para te ajudar a encontrar o veículo perfeito!",
          autor: "bot",
        };
        setRespostas([mensagemInicial]);
      }
    }
    
    inicializarConversa();
  }, []);

  useEffect(() => {
    if (isAtBottomRef.current) scrollToBottom(true);
  }, [respostas, carregando]);

  // -------- Envio --------
  async function handleEnviar() {
    if (mensagem.trim() === "") return;

    const mensagemUsuario = mensagem.trim();
    setRespostas((prev) => [...prev, { texto: mensagemUsuario, autor: "user" }]);
    setMensagem("");
    setCarregando(true);

    try {
      const resp = await fetch(`${API_BASE}/api/recomendacao`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          texto: mensagemUsuario,
          session_id: sessionId 
        }),
      });
      if (!resp.ok) {
        throw new Error(`HTTP error! status: ${resp.status}`);
      }
      
      const data = await resp.json();
      
      // Debug: log da resposta
      console.log("Resposta da API:", data);

      // Atualizar session_id se retornado
      if (data.session_id && data.session_id !== sessionId) {
        setSessionId(data.session_id);
        localStorage.setItem("chat_session_id", data.session_id);
      }

      if (data.error) {
        // Se houver erro, mostrar mensagem de erro
        setRespostas((prev) => [
          ...prev,
          { texto: `Desculpe, ocorreu um erro: ${data.error} 😕`, autor: "bot" },
        ]);
      } else if (data.recomendacao) {
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
        // Fallback melhorado - não usar resposta genérica
        setRespostas((prev) => [
          ...prev,
          { texto: "Desculpe, não consegui processar sua mensagem. Pode reformular? 😊", autor: "bot" },
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
