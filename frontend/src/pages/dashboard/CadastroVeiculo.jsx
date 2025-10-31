import React, { useState, useMemo } from "react";
import "./CadastroVeiculo.css";
import { API_BASE } from "../chat/config";
import { useNavigate } from "react-router-dom";

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

export default function CadastroVeiculo() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    marca: "",
    modelo: "",
    ano: "",
    km: 0,
    categoria: "",
    motor: "",
    potencia: "",
    torque: "",
    transmissao: "",
    tracao: "",
    combustivel: "flex",
    // Consumo — controlaremos por combustivel
    consumo_cidade_etanol: "",
    consumo_cidade_gasolina: "",
    consumo_estrada_etanol: "",
    consumo_estrada_gasolina: "",
    consumo_cidade: "",
    consumo_estrada: "",
    preco_estimado: "",
    descricao: "",
    estoque: 1,
  });

  const isFlex = useMemo(() => form.combustivel === "flex", [form.combustivel]);

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  function toNumberOrNull(v) {
    if (v === "" || v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  function validar() {
    const obrig = ["marca", "modelo", "ano", "categoria", "motor", "transmissao", "tracao", "combustivel", "preco_estimado", "estoque"];
    for (const k of obrig) {
      if (!String(form[k]).trim()) return `Preencha o campo "${k}"`;
    }
    const ano = toNumberOrNull(form.ano);
    if (!ano || ano < 1900 || ano > 2100) return "Ano inválido";

    if (isFlex) {
      const c1 = toNumberOrNull(form.consumo_cidade_etanol);
      const c2 = toNumberOrNull(form.consumo_cidade_gasolina);
      const e1 = toNumberOrNull(form.consumo_estrada_etanol);
      const e2 = toNumberOrNull(form.consumo_estrada_gasolina);
      if (!c1 || !c2 || !e1 || !e2) return "Preencha os consumos de cidade/estrada para etanol e gasolina";
    } else {
      const c = toNumberOrNull(form.consumo_cidade);
      const e = toNumberOrNull(form.consumo_estrada);
      if (!c || !e) return "Preencha os consumos de cidade e estrada";
    }

    const preco = toNumberOrNull(form.preco_estimado);
    if (!preco || preco <= 0) return "Preço estimado inválido";

    const estoque = toNumberOrNull(form.estoque);
    if (!Number.isInteger(estoque) || estoque < 0) return "Estoque inválido";
    return null;
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
      consumo: undefined, // preenche abaixo
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
    const erro = validar();
    if (erro) {
      alert(erro);
      return;
    }
    const body = montarPayload();

    try {
      const token = localStorage.getItem("token");
      const resp = await fetch(`${API_BASE}/api/veiculos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(body),
      });

      if (resp.status === 401) {
        navigate("/login");
        return;
      }
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(txt || "Erro ao cadastrar");
      }

      alert("Veículo cadastrado com sucesso!");
      navigate("/dashboard"); // ajuste se quiser ir para outra rota
    } catch (err) {
      console.error(err);
      alert("Falha no cadastro: " + err.message);
    }
  }

  return (
    <div className="page gradient-bg">
      <div className="chat-card centered">
        <h1 className="titulo">Cadastro de Novo Veículo</h1>
        <p className="subtitulo">Preencha todos os campos para manter o padrão do banco.</p>

        <form className="form-grid" onSubmit={handleSubmit}>
          {/* Linha 1 */}
          <div className="form-row">
            <div className="field">
              <label>Marca</label>
              <input value={form.marca} onChange={(e) => setField("marca", e.target.value)} placeholder="Toyota" />
            </div>
            <div className="field">
              <label>Modelo</label>
              <input value={form.modelo} onChange={(e) => setField("modelo", e.target.value)} placeholder="Yaris" />
            </div>
            <div className="field">
              <label>Ano</label>
              <input type="number" value={form.ano} onChange={(e) => setField("ano", e.target.value)} placeholder="2025" />
            </div>
            <div className="field">
              <label>KM</label>
              <input type="number" value={form.km} onChange={(e) => setField("km", e.target.value)} placeholder="0" />
            </div>
          </div>

          {/* Linha 2 */}
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
              <input value={form.motor} onChange={(e) => setField("motor", e.target.value)} placeholder='Ex.: "1.5L Dual VVT-i Flex"' />
            </div>
            <div className="field">
              <label>Potência</label>
              <input value={form.potencia} onChange={(e) => setField("potencia", e.target.value)} placeholder='Ex.: "110 cv (etanol) / 105 cv (gasolina)"' />
            </div>
            <div className="field">
              <label>Torque</label>
              <input value={form.torque} onChange={(e) => setField("torque", e.target.value)} placeholder='Ex.: "14,9 kgfm"' />
            </div>
          </div>

          {/* Linha 3 */}
          <div className="form-row">
            <div className="field">
              <label>Transmissão</label>
              <input value={form.transmissao} onChange={(e) => setField("transmissao", e.target.value)} placeholder='Ex.: "CVT com simulação de 7 marchas"' />
            </div>
            <div className="field">
              <label>Tração</label>
              <select value={form.tracao} onChange={(e) => setField("tracao", e.target.value)}>
                <option value="">Selecione…</option>
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
              <>
                <div className="form-row">
                  <div className="field">
                    <label>Cidade (Etanol)</label>
                    <input type="number" step="0.1" value={form.consumo_cidade_etanol} onChange={(e) => setField("consumo_cidade_etanol", e.target.value)} placeholder="8.9" />
                  </div>
                  <div className="field">
                    <label>Cidade (Gasolina)</label>
                    <input type="number" step="0.1" value={form.consumo_cidade_gasolina} onChange={(e) => setField("consumo_cidade_gasolina", e.target.value)} placeholder="12.6" />
                  </div>
                  <div className="field">
                    <label>Estrada (Etanol)</label>
                    <input type="number" step="0.1" value={form.consumo_estrada_etanol} onChange={(e) => setField("consumo_estrada_etanol", e.target.value)} placeholder="10.4" />
                  </div>
                  <div className="field">
                    <label>Estrada (Gasolina)</label>
                    <input type="number" step="0.1" value={form.consumo_estrada_gasolina} onChange={(e) => setField("consumo_estrada_gasolina", e.target.value)} placeholder="14.8" />
                  </div>
                </div>
              </>
            ) : (
              <div className="form-row">
                <div className="field">
                  <label>Cidade</label>
                  <input type="number" step="0.1" value={form.consumo_cidade} onChange={(e) => setField("consumo_cidade", e.target.value)} placeholder="8.5" />
                </div>
                <div className="field">
                  <label>Estrada</label>
                  <input type="number" step="0.1" value={form.consumo_estrada} onChange={(e) => setField("consumo_estrada", e.target.value)} placeholder="11.2" />
                </div>
              </div>
            )}
          </div>

          {/* Preço / Descrição / Estoque */}
          <div className="form-row">
            <div className="field">
              <label>Preço estimado (R$)</label>
              <input type="number" value={form.preco_estimado} onChange={(e) => setField("preco_estimado", e.target.value)} placeholder="165000" />
            </div>
            <div className="field">
              <label>Estoque</label>
              <input type="number" value={form.estoque} onChange={(e) => setField("estoque", e.target.value)} placeholder="10" />
            </div>
          </div>

          <div className="field">
            <label>Descrição</label>
            <textarea rows={4} value={form.descricao} onChange={(e) => setField("descricao", e.target.value)} placeholder="Resumo do veículo, público ideal, diferenciais, etc." />
          </div>

          <div className="actions">
            <button type="button" className="btn ghost" onClick={() => navigate(-1)}>Voltar</button>
            <button type="submit" className="btn primary">Cadastrar veículo</button>
          </div>
        </form>
      </div>
    </div>
  );
}
