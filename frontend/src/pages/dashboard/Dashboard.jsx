import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { API_BASE } from "../chat/config";

function Dashboard() {
  const [veiculos, setVeiculos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/api/veiculos`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    })
      .then(async (res) => {
        if (res.status === 401) {
          navigate("/login");
          return [];
        }
        return res.json();
      })
      .then((data) => setVeiculos(data))
      .catch((err) => console.error("Erro ao buscar veículos:", err));
  }, [navigate]);

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja deletar este veículo?")) return;
    const token = localStorage.getItem("token");
    const resp = await fetch(`${API_BASE}/api/veiculos/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    if (resp.status === 401) {
      navigate("/login");
      return;
    }
    setVeiculos((prev) => prev.filter((v) => v._id !== id));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleEdit = (id) => navigate(`/dashboard/editar/${id}`);

  return (
    <div className="page gradient-bg">
      <div className="chat-card dashboard-card">
        <div className="dashboard-header">
          <button className="back-btn" onClick={handleLogout}>🚪 Sair</button>
          <h1>🚗 Veículos Cadastrados</h1>
        </div>

        <div className="dashboard-list">
          {veiculos.length === 0 ? (
            <p className="empty">Nenhum veículo encontrado.</p>
          ) : (
            veiculos.map((v) => (
              <div className="vehicle-row" key={v._id}>
                <div className="info">
                  <h3>{v.modelo}</h3>
                  <p>
                    <strong>Marca:</strong> {v.marca} — <strong>Ano:</strong> {v.ano}
                    <br />
                    <strong>Preço:</strong> R${v.preco_estimado?.toLocaleString()}
                  </p>
                </div>
                <div className="actions">
                  <button className="edit" onClick={() => handleEdit(v._id)}>✏️</button>
                  <button className="delete" onClick={() => handleDelete(v._id)}>🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Botão flutuante de adicionar */}
        <button className="floating-add-btn" onClick={() => navigate("/dashboard/cadastro")}>
          ＋
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
