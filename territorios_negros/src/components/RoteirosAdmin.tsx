// RoteirosAdmin.tsx
import "../styles.css";

import { useCallback, useEffect, useState } from "react";
import {
  atualizarRoteiro,
  excluirRoteiro,
  fetchRoteiros,
  fetchTerritorios,
  salvarRoteiro,
} from "../data/api";
import type { Roteiro, Territorio, TerritoriosMap } from "../data/types";
import { gerarSlug } from "../utils/catalogo";
import { formatarDataHoraBR } from "../utils/data";

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
  ativo: true,
  ordem: "0",
  mapaUrl: "",
  inscricaoUrl: "",
};

// ── Componente ───────────────────────────────────────────────

export default function RoteirosAdmin() {
  const [roteiros, setRoteiros] = useState<Roteiro[]>([]);
  const [territorios, setTerritorios] = useState<TerritoriosMap>({});
  const [editando, setEditando] = useState<string | null>(null);

  const [form, setForm] = useState(FORM_VAZIO);
  // ordem de visitação (ids), editada como lista
  const [pontos, setPontos] = useState<string[]>([]);
  const [novoPonto, setNovoPonto] = useState("");

  const [salvando, setSalvando] = useState(false);
  const [ok, setOk] = useState("");
  const [erro, setErro] = useState("");

  // ── Carregar ────────────────────────────────────────────

  const carregar = useCallback(async () => {
    try {
      const [rs, ts] = await Promise.all([fetchRoteiros(), fetchTerritorios()]);
      setRoteiros(rs.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")));
      setTerritorios(ts);
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao carregar as rotas.");
    }
  }, []);

  useEffect(() => {
    let ativo = true;

    (async () => {
      try {
        const [rs, ts] = await Promise.all([fetchRoteiros(), fetchTerritorios()]);
        if (!ativo) return;
        setRoteiros(rs.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")));
        setTerritorios(ts);
      } catch (e) {
        console.error(e);
        if (ativo) {
          setErro(e instanceof Error ? e.message : "Falha ao carregar as rotas.");
        }
      }
    })();

    return () => {
      ativo = false;
    };
  }, []);

  // ── Helpers de formulário ───────────────────────────────

  function setCampo(campo: string, valor: string | boolean) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function preencherForm(r: Roteiro) {
    setForm({
      nome: r.nome,
      nivel: r.nivel,
      subtitulo: r.subtitulo,
      acessibilidade: r.acessibilidade,
      experiencia: arrayParaTexto(r.experiencia ?? []),
      ativo: r.ativo !== false,
      ordem: String(r.ordem ?? 0),
      mapaUrl: r.mapaUrl ?? "",
      inscricaoUrl: r.inscricaoUrl ?? "",
    });
    setPontos(r.pontos ?? []);
    setEditando(r.id);
    setOk("");
    setErro("");
  }

  function limparForm() {
    setForm(FORM_VAZIO);
    setPontos([]);
    setEditando(null);
  }

  // ── Lista de pontos (ordem de visitação) ────────────────

  function adicionarPonto(id: string) {
    if (!id || pontos.includes(id)) return;
    setPontos([...pontos, id]);
  }

  function moverPonto(indice: number, delta: number) {
    const destino = indice + delta;
    if (destino < 0 || destino >= pontos.length) return;

    const lista = [...pontos];
    [lista[indice], lista[destino]] = [lista[destino], lista[indice]];
    setPontos(lista);
  }

  function removerPonto(indice: number) {
    setPontos(pontos.filter((_, i) => i !== indice));
  }

  // ── Salvar ──────────────────────────────────────────────

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setOk("");

    setSalvando(true);

    try {
      const id = editando ?? gerarSlug(form.nome);

      const payload = {
        nome: form.nome,
        nivel: form.nivel,
        subtitulo: form.subtitulo,
        acessibilidade: form.acessibilidade,
        experiencia: textoParaArray(form.experiencia),
        ativo: form.ativo,
        ordem: Number(form.ordem) || 0,
        mapa_url: form.mapaUrl || null,
        inscricao_url: form.inscricaoUrl || null,
        pontos,
      };

      await salvarRoteiro(editando, { ...(editando ? {} : { id }), ...payload });

      setEditando(id);
      await carregar();
      setOk(`Salvo em ${formatarDataHoraBR(new Date().toISOString())}.`);
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao salvar.");
    } finally {
      setSalvando(false);
    }
  }

  async function alternarAtivo(id: string, ativo: boolean) {
    setErro("");
    setOk("");

    try {
      await atualizarRoteiro(id, { ativo });
      if (editando === id) setForm((prev) => ({ ...prev, ativo }));
      setOk(ativo ? "Rota habilitada para os visitantes." : "Rota desabilitada.");
      await carregar();
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao alterar a visibilidade.");
    }
  }

  async function excluir(id: string, nome: string) {
    if (!window.confirm(`Excluir "${nome}"? Esta ação não pode ser desfeita.`)) return;

    setErro("");
    setOk("");

    try {
      await excluirRoteiro(id);
      if (editando === id) limparForm();
      await carregar();
      setOk("Rota excluída.");
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao excluir.");
    }
  }

  // ── Render ─────────────────────────────────────────────

  const estaEditando = editando !== null;
  const disponiveis = Object.values(territorios).sort((a: Territorio, b: Territorio) =>
    a.nome.localeCompare(b.nome, "pt-BR")
  );

  return (
    <div>
      <h1>Rotas</h1>

      <p className="admin-ajuda">
        Quando estiver guiando, deixe habilitada apenas a rota do dia — as outras
        desaparecem para os visitantes. A ordem da lista abaixo é a ordem de visitação.
      </p>

      {ok && <p className="admin-ok">{ok}</p>}
      {erro && <p className="admin-erro">{erro}</p>}

      {/* ─── Formulário (criar / editar) ─── */}
      <form className="admin-form" onSubmit={salvar}>
        <h2>{estaEditando ? `Editando: ${form.nome} (${editando})` : "Nova rota"}</h2>

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

          <label className="admin-campo">
            Ordem na lista de rotas
            <input
              type="number"
              value={form.ordem}
              onChange={(e) => setCampo("ordem", e.target.value)}
            />
          </label>
        </div>

        <label className="admin-check">
          <input
            type="checkbox"
            checked={form.ativo}
            onChange={(e) => setCampo("ativo", e.target.checked)}
          />
          Visível para os visitantes
        </label>

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

        <input
          type="text"
          placeholder="Link do mapa do percurso (Google My Maps) — opcional"
          value={form.mapaUrl}
          onChange={(e) => setCampo("mapaUrl", e.target.value)}
        />
        <small className="admin-ajuda">
          No Google My Maps: crie o mapa com o traçado do percurso, clique em
          Compartilhar → “Qualquer pessoa com o link” → copie o link e cole aqui. Ele
          aparece embutido na tela da rota.
        </small>

        <input
          type="text"
          placeholder="Link da ficha de inscrição desta rota — opcional"
          value={form.inscricaoUrl}
          onChange={(e) => setCampo("inscricaoUrl", e.target.value)}
        />

        {/* ─── Ordem de visitação ─── */}
        <div className="admin-pontos">
          <b>Ordem de visitação</b>

          {pontos.length === 0 && (
            <p className="admin-ajuda">Nenhum território nesta rota ainda.</p>
          )}

          {pontos.map((id, i) => {
            const t = territorios[id];
            return (
              <div key={`${id}-${i}`} className="admin-ponto">
                <span className="admin-ponto-num">{i + 1}.</span>

                <span className="admin-ponto-nome">
                  {t ? t.nome : id}
                  {t?.ativo === false && (
                    <small className="admin-ponto-aviso"> (desabilitado no momento)</small>
                  )}
                </span>

                <button type="button" className="outline" onClick={() => moverPonto(i, -1)}>
                  ↑
                </button>
                <button type="button" className="outline" onClick={() => moverPonto(i, 1)}>
                  ↓
                </button>
                <button type="button" className="outline" onClick={() => removerPonto(i)}>
                  ✕
                </button>
              </div>
            );
          })}

          <div className="admin-ponto-add">
            <select value={novoPonto} onChange={(e) => setNovoPonto(e.target.value)}>
              <option value="">— escolher território —</option>
              {disponiveis.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                  {t.ativo === false ? " (desabilitado)" : ""}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="outline"
              onClick={() => {
                adicionarPonto(novoPonto);
                setNovoPonto("");
              }}
            >
              Adicionar ao fim
            </button>
          </div>
        </div>

        <div className="admin-form-botoes">
          <button type="submit" className="btn" disabled={salvando}>
            {salvando ? "Salvando..." : estaEditando ? "Salvar alterações" : "Criar rota"}
          </button>
          {estaEditando && (
            <button type="button" className="outline" onClick={limparForm}>
              Fechar / limpar
            </button>
          )}
        </div>
      </form>

      {/* ─── Tabela ─── */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Nível</th>
            <th>Territórios</th>
            <th>Mapa</th>
            <th>Visível</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {roteiros.map((r) => (
            <tr key={r.id} className={r.ativo === false ? "admin-linha-inativa" : ""}>
              <td>
                <b>{r.nome}</b>
                <br />
                <small>{r.id}</small>
              </td>
              <td>{r.nivel}</td>
              <td>{r.pontos?.length ?? 0}</td>
              <td>{r.mapaUrl ? "sim" : "não"}</td>
              <td>
                <button
                  className={r.ativo === false ? "outline" : "btn"}
                  onClick={() => alternarAtivo(r.id, r.ativo === false)}
                >
                  {r.ativo === false ? "habilitar" : "desabilitar"}
                </button>
              </td>
              <td className="admin-acoes">
                <button className="outline" onClick={() => preencherForm(r)} title="Editar">
                  ✏️
                </button>
                <button className="outline" onClick={() => excluir(r.id, r.nome)} title="Excluir">
                  🗑️
                </button>
              </td>
            </tr>
          ))}

          {roteiros.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", padding: 24 }}>
                Nenhuma rota cadastrada.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
