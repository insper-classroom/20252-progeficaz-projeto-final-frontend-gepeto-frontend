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
      const resp = await fetch(`${API_BASE}/api/recomendar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: mensagem }),
      });

      const data = await resp.json();

      if (Array.isArray(data) && data.length > 0) {
        const respostaFormatada = data
          .map(
            (v) =>
              `🚗 ${v.modelo} — R$${v.preco_estimado.toLocaleString()} (score: ${
                v.score ?? "–"
              })`
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
    <div className="App">
      <h1>Assistente Toyota 🤖</h1>

      <div className="chat">
        {respostas.map((msg, i) => (
          <div
            key={i}
            className={`mensagem ${msg.autor === "user" ? "user" : "bot"}`}
          >
            {msg.texto.split("\n").map((linha, j) => (
              <div key={j}>{linha}</div>
            ))}
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
