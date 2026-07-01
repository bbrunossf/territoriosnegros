// RoteirosAdmin.tsx
import "../styles.css";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Roteiro } from "../data/types";

// ── Helpers para arrays ↔ textarea ───────────────────────────

function arrayParaTexto(arr: string[]): string {
  return arr.join("\n");
}

function textoParaArray(txt: string): string[] {
  return txt
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

// ── Estado inicial do formulário ─────────────────────────────

const FORM_VAZIO = {
  nome: "",
  nivel: "",
  subtitulo: "",
  acessibilidade: "",
  experiencia: "",
  pontos: "",
};

// ── Componente ───────────────────────────────────────────────

export default function RoteirosAdmin() {
  const [roteiros, setRoteiros] = useState<Roteiro[]>([]);
  const [editando, setEditando] = useState<string | null>(null);

  const [form, setForm] = useState(FORM_VAZIO);

  // ── Carregar lista ──────────────────────────────────────

  async function carregar() {
    const { data, error } = await supabase
      .from("roteiros")
      .select("*")
      .order("nome");

    if (error) {
      console.error(error);
      return;
    }

    setRoteiros((data as Roteiro[]) || []);
  }

  useEffect(() => {
    carregar();
  }, []);

  // ── Helpers de formulário ───────────────────────────────

  function setCampo(campo: string, valor: string) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function preencherForm(r: Roteiro) {
    setForm({
      nome: r.nome,
      nivel: r.nivel,
      subtitulo: r.subtitulo,
      acessibilidade: r.acessibilidade,
      experiencia: arrayParaTexto(r.experiencia ?? []),
      pontos: arrayParaTexto(r.pontos ?? []),
    });
    setEditando(r.id);
  }

  function limparForm() {
    setForm(FORM_VAZIO);
    setEditando(null);
  }

  // ── Montar payload ──────────────────────────────────────

  function montarPayload() {
    return {
      nome: form.nome,
      nivel: form.nivel,
      subtitulo: form.subtitulo,
      acessibilidade: form.acessibilidade,
      experiencia: textoParaArray(form.experiencia),
      pontos: textoParaArray(form.pontos),
    };
  }

  // ── CRUD: Criar ─────────────────────────────────────────

  async function criarRoteiro(e: React.FormEvent) {
    e.preventDefault();

    const id = form.nome
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const { error } = await supabase.from("roteiros").insert({
      id,
      ...montarPayload(),
    });

    if (error) {
      console.error(error);
      alert("Erro ao criar roteiro: " + error.message);
      return;
    }

    limparForm();
    carregar();
  }

  // ── CRUD: Atualizar ────────────────────────────────────

  async function salvarEdicao(e: React.FormEvent) {
    e.preventDefault();
    if (!editando) return;

    const { error } = await supabase
      .from("roteiros")
      .update(montarPayload())
      .eq("id", editando);

    if (error) {
      console.error(error);
      alert("Erro ao salvar: " + error.message);
      return;
    }

    limparForm();
    carregar();
  }

  // ── CRUD: Excluir ──────────────────────────────────────

  async function excluirRoteiro(id: string, nome: string) {
    if (!window.confirm(`Excluir "${nome}"? Esta ação não pode ser desfeita.`))
      return;

    const { error } = await supabase.from("roteiros").delete().eq("id", id);

    if (error) {
      console.error(error);
      alert("Erro ao excluir: " + error.message);
      return;
    }

    if (editando === id) limparForm();
    carregar();
  }

  // ── Render ─────────────────────────────────────────────

  const estaEditando = editando !== null;

  return (
    <div>
      <h1>Roteiros</h1>

      {/* ─── Formulário (criar / editar) ─── */}
      <form
        className="admin-form"
        onSubmit={estaEditando ? salvarEdicao : criarRoteiro}
      >
        <h2>{estaEditando ? `Editando: ${form.nome}` : "Novo roteiro"}</h2>

        <div className="admin-form-grid">
          <input
            type="text"
            placeholder="Nome *"
            value={form.nome}
            onChange={(e) => setCampo("nome", e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Nível (ex: Fácil, Intermediário, Avançado) *"
            value={form.nivel}
            onChange={(e) => setCampo("nivel", e.target.value)}
            required
          />
        </div>

        <textarea
          placeholder="Subtítulo * (ex: Início: MUCANE | Conclusão: Chafariz)"
          value={form.subtitulo}
          onChange={(e) => setCampo("subtitulo", e.target.value)}
          required
        />
        <textarea
          placeholder="Acessibilidade *"
          value={form.acessibilidade}
          onChange={(e) => setCampo("acessibilidade", e.target.value)}
          required
        />
        <textarea
          placeholder="Experiências (uma por linha)"
          value={form.experiencia}
          onChange={(e) => setCampo("experiencia", e.target.value)}
          rows={4}
        />
        <textarea
          placeholder="Pontos (IDs dos territórios, um por linha)"
          value={form.pontos}
          onChange={(e) => setCampo("pontos", e.target.value)}
          rows={4}
        />
        <small style={{ color: "#8f611d" }}>
          IDs válidos: mucane, praca, dona, chafariz, rua13, vilarubim, moscoso,
          grilhoes, mariasaraiva, zilda, congo, piedade, sambao, saogoncalo,
          rosario, pelourinho
        </small>

        <div className="admin-form-botoes">
          <button type="submit" className="btn">
            {estaEditando ? "💾 Salvar alterações" : "➕ Criar roteiro"}
          </button>
          {estaEditando && (
            <button type="button" className="outline" onClick={limparForm}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* ─── Tabela de roteiros ─── */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Nível</th>
            <th>Subtítulo</th>
            <th>Pontos</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {roteiros.map((r) => (
            <tr key={r.id}>
              <td>{r.nome}</td>
              <td>{r.nivel}</td>
              <td style={{ fontSize: 13, color: "#563827" }}>
                {r.subtitulo}
              </td>
              <td>{r.pontos?.length ?? 0} territórios</td>

              <td className="admin-acoes">
                <button
                  className="outline"
                  onClick={() => preencherForm(r)}
                  title="Editar"
                >
                  ✏️
                </button>
                <button
                  className="outline"
                  onClick={() => excluirRoteiro(r.id, r.nome)}
                  title="Excluir"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}

          {roteiros.length === 0 && (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", padding: 24 }}>
                Nenhum roteiro cadastrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
