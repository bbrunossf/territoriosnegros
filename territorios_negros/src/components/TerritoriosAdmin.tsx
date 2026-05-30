// TerritoriosAdmin.tsx
import "../styles.css";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Territorio } from "../data/types";

// ── Helpers para campos de array ─────────────────────────────

/** Converte string[] ↔ textarea (uma linha por item) */
function arrayParaTexto(arr: string[]): string {
  return arr.join("\n");
}

function textoParaArray(txt: string): string[] {
  return txt
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Converte IdadeCamada[] ↔ textarea (formato "ano: label" por linha) */
function idadeCamadasParaTexto(
  arr: Territorio["idadeCamadas"]
): string {
  if (!arr) return "";
  return arr.map((ic) => `${ic.ano}: ${ic.label}`).join("\n");
}

function textoParaIdadeCamadas(
  txt: string
): Territorio["idadeCamadas"] {
  return txt
    .split("\n")
    .map((linha) => linha.trim())
    .filter(Boolean)
    .map((linha) => {
      const [anoStr, ...resto] = linha.split(":");
      const ano = Number(anoStr.trim());
      const label = resto.join(":").trim();
      return isNaN(ano) ? null : { ano, label };
    })
    .filter((ic): ic is { ano: number; label: string } => ic !== null);
}

// ── Estado inicial do formulário (valores vazios) ────────────

const FORM_VAZIO = {
  nome: "",
  local: "",
  palavra: "",
  ano: "",
  camadas: "",
  contexto: "",
  criacao: "",
  funcao: "",
  transformacoes: "",
  status: "",
  observacao: "",
  descricao: "",
  observar: "",
  pergunta: "",
  video: "",
  idadeCamadas: "",
};

// ── Componente ───────────────────────────────────────────────

export default function TerritoriosAdmin() {
  const [territorios, setTerritorios] = useState<Territorio[]>([]);
  const [editando, setEditando] = useState<string | null>(null); // ID sendo editado

  // Campos do formulário
  const [form, setForm] = useState(FORM_VAZIO);
  const [imagemFile, setImagemFile] = useState<File | null>(null);

  // ── Carregar lista ──────────────────────────────────────────

  async function carregar() {
    const { data, error } = await supabase
      .from("territorios")
      .select("*")
      .order("nome");

    if (error) {
      console.error(error);
      return;
    }

    setTerritorios(
      (data as any[]).map((item) => ({
        ...item,
        idadeCamadas: item.idade_camadas ?? item.idadeCamadas,
      }))
    );
  }

  useEffect(() => {
    carregar();
  }, []);

  // ── Helpers de formulário ──────────────────────────────────

  function setCampo(campo: string, valor: string) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function preencherForm(t: Territorio) {
    setForm({
      nome: t.nome,
      local: t.local,
      palavra: t.palavra,
      ano: String(t.ano ?? ""),
      camadas: t.camadas ?? "",
      contexto: t.contexto ?? "",
      criacao: t.criacao ?? "",
      funcao: t.funcao ?? "",
      transformacoes: t.transformacoes ?? "",
      status: t.status ?? "",
      observacao: t.observacao ?? "",
      descricao: t.descricao ?? "",
      observar: arrayParaTexto(t.observar ?? []),
      pergunta: t.pergunta ?? "",
      video: t.video ?? "",
      idadeCamadas: idadeCamadasParaTexto(t.idadeCamadas),
    });
    setImagemFile(null);
    setEditando(t.id);
  }

  function limparForm() {
    setForm(FORM_VAZIO);
    setImagemFile(null);
    setEditando(null);
  }

  // ── Upload de imagem → retorna a URL pública ────────────────

  async function uploadImagem(
    territorioId: string,
    file: File
  ): Promise<string | null> {
    const extensao = file.name.split(".").pop();
    const nomeArquivo = `${territorioId}-${Date.now()}.${extensao}`;
    const caminho = `territorios/${nomeArquivo}`;

    const { error } = await supabase.storage
      .from("dados_site")
      .upload(caminho, file);

    if (error) {
      console.error("Erro no upload:", error);
      alert("Erro ao fazer upload da imagem.");
      return null;
    }

    const { data } = supabase.storage
      .from("dados_site")
      .getPublicUrl(caminho);

    return data.publicUrl;
  }

  // ── Montar objeto para INSERT/UPDATE ────────────────────────

  function montarPayload(imagemUrl?: string) {
    return {
      nome: form.nome,
      local: form.local,
      palavra: form.palavra,
      ano: Number(form.ano) || null,
      camadas: form.camadas || null,
      contexto: form.contexto || null,
      criacao: form.criacao || null,
      funcao: form.funcao || null,
      transformacoes: form.transformacoes || null,
      status: form.status || null,
      observacao: form.observacao || null,
      descricao: form.descricao,
      observar: textoParaArray(form.observar),
      pergunta: form.pergunta || null,
      video: form.video || null,
      idade_camadas: textoParaIdadeCamadas(form.idadeCamadas),
      ...(imagemUrl !== undefined && { imagem: imagemUrl }),
    };
  }

  // ── CRUD: Criar ─────────────────────────────────────────────

  async function criarTerritorio(e: React.FormEvent) {
    e.preventDefault();

    if (!imagemFile) {
      alert("Selecione uma imagem para o território.");
      return;
    }

    const id = form.nome
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const imagemUrl = await uploadImagem(id, imagemFile);
    if (!imagemUrl) return;

    const { error } = await supabase.from("territorios").insert({
      id,
      ...montarPayload(imagemUrl),
    });

    if (error) {
      console.error(error);
      alert("Erro ao criar território: " + error.message);
      return;
    }

    limparForm();
    carregar();
  }

  // ── CRUD: Atualizar ─────────────────────────────────────────

  async function salvarEdicao(e: React.FormEvent) {
    e.preventDefault();

    if (!editando) return;

    let imagemUrl: string | undefined;

    if (imagemFile) {
      const url = await uploadImagem(editando, imagemFile);
      if (!url) return;
      imagemUrl = url;
    }

    const payload = montarPayload(imagemUrl);

    const { error } = await supabase
      .from("territorios")
      .update(payload)
      .eq("id", editando);

    if (error) {
      console.error(error);
      alert("Erro ao salvar: " + error.message);
      return;
    }

    limparForm();
    carregar();
  }

  // ── CRUD: Excluir ───────────────────────────────────────────

  async function excluirTerritorio(id: string, nome: string) {
    if (!window.confirm(`Excluir "${nome}"? Esta ação não pode ser desfeita.`))
      return;

    const { error } = await supabase.from("territorios").delete().eq("id", id);

    if (error) {
      console.error(error);
      alert("Erro ao excluir: " + error.message);
      return;
    }

    if (editando === id) limparForm();
    carregar();
  }

  // ── Render ──────────────────────────────────────────────────

  const estaEditando = editando !== null;

  return (
    <div>
      <h1>Territórios</h1>

      {/* ─── Formulário (criar / editar) ─── */}
      <form
        className="admin-form"
        onSubmit={estaEditando ? salvarEdicao : criarTerritorio}
      >
        <h2>{estaEditando ? `Editando: ${form.nome}` : "Novo território"}</h2>

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
            placeholder="Local *"
            value={form.local}
            onChange={(e) => setCampo("local", e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Palavra-chave *"
            value={form.palavra}
            onChange={(e) => setCampo("palavra", e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Ano"
            value={form.ano}
            onChange={(e) => setCampo("ano", e.target.value)}
          />
        </div>

        <textarea
          placeholder="Camadas (ex: 1912: construção → 1993: museu)"
          value={form.camadas}
          onChange={(e) => setCampo("camadas", e.target.value)}
        />
        <textarea
          placeholder="Contexto"
          value={form.contexto}
          onChange={(e) => setCampo("contexto", e.target.value)}
        />
        <input
          type="text"
          placeholder="Criação"
          value={form.criacao}
          onChange={(e) => setCampo("criacao", e.target.value)}
        />
        <input
          type="text"
          placeholder="Função"
          value={form.funcao}
          onChange={(e) => setCampo("funcao", e.target.value)}
        />
        <input
          type="text"
          placeholder="Transformações"
          value={form.transformacoes}
          onChange={(e) => setCampo("transformacoes", e.target.value)}
        />
        <input
          type="text"
          placeholder="Status"
          value={form.status}
          onChange={(e) => setCampo("status", e.target.value)}
        />
        <textarea
          placeholder="Observação"
          value={form.observacao}
          onChange={(e) => setCampo("observacao", e.target.value)}
        />
        <textarea
          placeholder="Descrição *"
          value={form.descricao}
          onChange={(e) => setCampo("descricao", e.target.value)}
          required
        />
        <textarea
          placeholder="Observar (um item por linha)"
          value={form.observar}
          onChange={(e) => setCampo("observar", e.target.value)}
          rows={4}
        />
        <textarea
          placeholder="Pergunta para reflexão"
          value={form.pergunta}
          onChange={(e) => setCampo("pergunta", e.target.value)}
        />
        <input
          type="text"
          placeholder="URL do vídeo (opcional)"
          value={form.video}
          onChange={(e) => setCampo("video", e.target.value)}
        />
        <textarea
          placeholder='Idade das camadas (formato: "ano: label", uma por linha)'
          value={form.idadeCamadas}
          onChange={(e) => setCampo("idadeCamadas", e.target.value)}
          rows={3}
        />

        <div className="admin-form-upload">
          <label>
            Imagem{!estaEditando ? " *" : " (selecione apenas para alterar)"}:
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setImagemFile(file);
            }}
            required={!estaEditando}
          />
        </div>

        <div className="admin-form-botoes">
          <button type="submit" className="btn">
            {estaEditando ? "💾 Salvar alterações" : "➕ Criar território"}
          </button>
          {estaEditando && (
            <button type="button" className="outline" onClick={limparForm}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* ─── Tabela de territórios cadastrados ─── */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Local</th>
            <th>Palavra</th>
            <th>Imagem</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {territorios.map((t) => (
            <tr key={t.id}>
              <td>{t.nome}</td>
              <td>{t.local}</td>
              <td>{t.palavra}</td>
              <td>
                {t.imagem && (
                  <img src={t.imagem} alt="" className="admin-thumb" />
                )}
              </td>
              <td className="admin-acoes">
                <button
                  className="outline"
                  onClick={() => preencherForm(t)}
                  title="Editar"
                >
                  ✏️
                </button>
                <button
                  className="outline"
                  onClick={() => excluirTerritorio(t.id, t.nome)}
                  title="Excluir"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}

          {territorios.length === 0 && (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", padding: 24 }}>
                Nenhum território cadastrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
