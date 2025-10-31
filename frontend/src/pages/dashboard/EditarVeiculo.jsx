import React, { useState, useEffect, useMemo } from "react";
import "./CadastroVeiculo.css";
import { API_BASE } from "../chat/config";
import { useParams, useNavigate } from "react-router-dom";

const CATEGORIAS = [
  "hatch compacto",
  "sedã compacto",
  "sedã médio",
  "SUV compacto",
  "SUV médio",
  "SUV grande",
  "picape média",
  "cupê esportivo",
];

const TRACOES = ["dianteira", "traseira", "4x4", "4x4 reduzida"];
const COMBUSTIVEIS = ["flex", "gasolina", "etanol", "diesel", "híbrido", "elétrico"];

export default function EditarVeiculo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);

  useEffect(() => {
    async function fetchVeiculo() {
      try {
        const resp = await fetch(`${API_BASE}/api/veiculos/${id}`);
        if (!resp.ok) throw new Error("Erro ao buscar veículo");
        const data = await resp.json();

        // Converter estrutura de consumo para o formato do formulário
        const novoForm = {
          ...data,
          consumo_cidade_etanol: data.consumo?.cidade_km_l?.etanol ?? "",
          consumo_cidade_gasolina: data.consumo?.cidade_km_l?.gasolina ?? "",
          consumo_estrada_etanol: data.consumo?.estrada_km_l?.etanol ?? "",
          consumo_estrada_gasolina: data.consumo?.estrada_km_l?.gasolina ?? "",
          consumo_cidade: typeof data.consumo?.cidade_km_l === "number" ? data.consumo.cidade_km_l : "",
          consumo_estrada: typeof data.consumo?.estrada_km_l === "number" ? data.consumo.estrada_km_l : "",
        };
        setForm(novoForm);
      } catch (err) {
        alert("Erro ao carregar veículo: " + err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchVeiculo();
  }, [id]);

  const isFlex = useMemo(() => form?.combustivel === "flex", [form]);

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  function toNumberOrNull(v) {
    if (v === "" || v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  function montarPayload() {
    const payload = {
      marca: form.marca.trim(),
      modelo: form.modelo.trim(),
      ano: Number(form.ano),
      km: toNumberOrNull(form.km) ?? 0,
      categoria: form.categoria.trim(),
      motor: form.motor.trim(),
      potencia: form.potencia.trim(),
      torque: form.torque.trim(),
      transmissao: form.transmissao.trim(),
      tracao: form.tracao.trim(),
      combustivel: form.combustivel,
      consumo: undefined,
      preco_estimado: Number(form.preco_estimado),
      descricao: form.descricao.trim(),
      estoque: Number(form.estoque),
    };

    if (isFlex) {
      payload.consumo = {
        cidade_km_l: {
          etanol: Number(form.consumo_cidade_etanol),
          gasolina: Number(form.consumo_cidade_gasolina),
        },
        estrada_km_l: {
          etanol: Number(form.consumo_estrada_etanol),
          gasolina: Number(form.consumo_estrada_gasolina),
        },
      };
    } else {
      payload.consumo = {
        cidade_km_l: Number(form.consumo_cidade),
        estrada_km_l: Number(form.consumo_estrada),
      };
    }

    return payload;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const body = montarPayload();

      const resp = await fetch(`${API_BASE}/api/veiculos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!resp.ok) throw new Error("Erro ao atualizar veículo");

      alert("Veículo atualizado com sucesso!");
      navigate("/dashboard");
    } catch (err) {
      alert("Erro: " + err.message);
    }
  }

  if (loading || !form) return <div className="page gradient-bg"><div className="chat-card centered"><p>Carregando dados...</p></div></div>;

  return (
    <div className="page gradient-bg">
      <div className="chat-card centered">
        <h1 className="titulo">Editar Veículo</h1>
        <p className="subtitulo">Atualize as informações do veículo e salve as alterações.</p>

        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="field">
              <label>Marca</label>
              <input value={form.marca} onChange={(e) => setField("marca", e.target.value)} />
            </div>
            <div className="field">
              <label>Modelo</label>
              <input value={form.modelo} onChange={(e) => setField("modelo", e.target.value)} />
            </div>
            <div className="field">
              <label>Ano</label>
              <input type="number" value={form.ano} onChange={(e) => setField("ano", e.target.value)} />
            </div>
            <div className="field">
              <label>KM</label>
              <input type="number" value={form.km} onChange={(e) => setField("km", e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label>Categoria</label>
              <select value={form.categoria} onChange={(e) => setField("categoria", e.target.value)}>
                <option value="">Selecione…</option>
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Motor</label>
              <input value={form.motor} onChange={(e) => setField("motor", e.target.value)} />
            </div>
            <div className="field">
              <label>Potência</label>
              <input value={form.potencia} onChange={(e) => setField("potencia", e.target.value)} />
            </div>
            <div className="field">
              <label>Torque</label>
              <input value={form.torque} onChange={(e) => setField("torque", e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label>Transmissão</label>
              <input value={form.transmissao} onChange={(e) => setField("transmissao", e.target.value)} />
            </div>
            <div className="field">
              <label>Tração</label>
              <select value={form.tracao} onChange={(e) => setField("tracao", e.target.value)}>
                {TRACOES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Combustível</label>
              <select value={form.combustivel} onChange={(e) => setField("combustivel", e.target.value)}>
                {COMBUSTIVEIS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Consumo */}
          <div className="form-section">
            <h2>Consumo (km/l)</h2>
            {isFlex ? (
              <div className="form-row">
                <div className="field">
                  <label>Cidade (Etanol)</label>
                  <input type="number" value={form.consumo_cidade_etanol} onChange={(e) => setField("consumo_cidade_etanol", e.target.value)} />
                </div>
                <div className="field">
                  <label>Cidade (Gasolina)</label>
                  <input type="number" value={form.consumo_cidade_gasolina} onChange={(e) => setField("consumo_cidade_gasolina", e.target.value)} />
                </div>
                <div className="field">
                  <label>Estrada (Etanol)</label>
                  <input type="number" value={form.consumo_estrada_etanol} onChange={(e) => setField("consumo_estrada_etanol", e.target.value)} />
                </div>
                <div className="field">
                  <label>Estrada (Gasolina)</label>
                  <input type="number" value={form.consumo_estrada_gasolina} onChange={(e) => setField("consumo_estrada_gasolina", e.target.value)} />
                </div>
              </div>
            ) : (
              <div className="form-row">
                <div className="field">
                  <label>Cidade</label>
                  <input type="number" value={form.consumo_cidade} onChange={(e) => setField("consumo_cidade", e.target.value)} />
                </div>
                <div className="field">
                  <label>Estrada</label>
                  <input type="number" value={form.consumo_estrada} onChange={(e) => setField("consumo_estrada", e.target.value)} />
                </div>
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="field">
              <label>Preço estimado (R$)</label>
              <input type="number" value={form.preco_estimado} onChange={(e) => setField("preco_estimado", e.target.value)} />
            </div>
            <div className="field">
              <label>Estoque</label>
              <input type="number" value={form.estoque} onChange={(e) => setField("estoque", e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label>Descrição</label>
            <textarea rows={4} value={form.descricao} onChange={(e) => setField("descricao", e.target.value)} />
          </div>

          <div className="actions">
            <button type="button" className="btn ghost" onClick={() => navigate(-1)}>Cancelar</button>
            <button type="submit" className="btn primary">Salvar alterações</button>
          </div>
        </form>
      </div>
    </div>
  );
}
