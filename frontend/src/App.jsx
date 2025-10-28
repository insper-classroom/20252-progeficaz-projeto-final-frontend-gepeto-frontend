import React, { useState } from "react";
import "./App.css";
import { API_BASE } from "./config";

function App() {
  const [mensagem, setMensagem] = useState("");
  const [respostas, setRespostas] = useState([]);
  const [carregando, setCarregando] = useState(false);

  async function handleEnviar() {
    if (mensagem.trim() === "") return;

    setRespostas([...respostas, { texto: mensagem, autor: "user" }]);
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
      }

  
      else if (Array.isArray(data) && data.length > 0) {
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
      }

    
      else {
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
    <div className="App">
      <h1>Assistente Toyota 🤖</h1>

      <div className="chat">
        {respostas.map((msg, i) => (
          <div
            key={i}
            className={`mensagem ${msg.autor === "user" ? "user" : "bot"}`}
          >
            {}
            {msg.html ? (
              <div dangerouslySetInnerHTML={{ __html: msg.texto }} />
            ) : (
              msg.texto.split("\n").map((linha, j) => <div key={j}>{linha}</div>)
            )}
          </div>
        ))}

        {carregando && <div className="mensagem bot">⏳ Pensando...</div>}
      </div>

      <div className="input-area">
        <input
          type="text"
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Digite sua mensagem..."
        />
        <button onClick={handleEnviar}>Enviar</button>
      </div>
    </div>
  );
}

export default App;
