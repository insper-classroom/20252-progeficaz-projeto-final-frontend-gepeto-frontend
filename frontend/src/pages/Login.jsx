import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "./chat/config"; // ajuste o caminho se necessário
import "./Login.css";

function Login() {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const resp = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: usuario,
          password: senha,
        }),
      });

      const data = await resp.json();

      if (resp.ok && data.token) {
        // ✅ Salva o token JWT localmente
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
      } else {
        // ❌ Exibe erro do backend
        setErro(data.error || "Usuário ou senha incorretos.");
      }
    } catch (error) {
      setErro("Erro de conexão com o servidor.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Login de Funcionário</h1>
        <p>Acesse o painel administrativo da concessionária</p>

        <form onSubmit={handleLogin} className="login-form">
          <input
            type="text"
            placeholder="Usuário"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <button type="submit" disabled={carregando}>
            {carregando ? "Entrando..." : "Entrar"}
          </button>
          {erro && <p className="erro">{erro}</p>}
        </form>

        <button className="back-btn" onClick={() => navigate("/")}>
          ⬅️ Voltar ao Chat
        </button>
      </div>
    </div>
  );
}

export default Login;
