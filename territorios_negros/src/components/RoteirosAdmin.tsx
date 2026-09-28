// RoteirosAdmin.tsx
//
// Regra de gravação (igual à de Territórios):
//  • botões da TABELA (habilitar/desabilitar, excluir) gravam na hora;
//  • edição (textos, ordem de visitação, logo e mapas) só vale depois de
//    clicar em "Salvar alterações".
import "../styles.css";

import { useCallback, useEffect, useState } from "react";
import {
  atualizarRoteiro,
  excluirRoteiro,
  fetchRoteiros,
  fetchTerritorios,
  salvarRoteiro,
  uploadFoto,
} from "../data/api";
import type { FotoTerritorio, Roteiro, Territorio, TerritoriosMap } from "../data/types";
import { gerarSlug } from "../utils/catalogo";
import { formatarDataHoraBR } from "../utils/data";
import { legendaDoArquivo } from "../utils/legendas";

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

/** dica quando a coluna nova ainda não existe no banco */
function explicarErro(mensagem: string): string {
  if (/column .* does not exist/i.test(mensagem)) {
    return (
      `${mensagem} — a coluna nova ainda não existe no banco: falta rodar ` +
      `supabase/migrations/20260927_roteiros_logo_mapas.sql no SQL Editor do Supabase.`
    );
  }
  return mensagem;
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
  const [pontos, setPontos] = useState<string[]>([]);
  const [novoPonto, setNovoPonto] = useState("");

  const [logoAtual, setLogoAtual] = useState("");
  const [mapas, setMapas] = useState<FotoTerritorio[]>([]);

  const [pendente, setPendente] = useState(false);
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
    setPendente(true);
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
    setLogoAtual(r.logo ?? "");
    setMapas(r.mapas ?? []);
    setEditando(r.id);
    setPendente(false);
    setOk("");
    setErro("");
  }

  function limparForm() {
    setForm(FORM_VAZIO);
    setPontos([]);
    setLogoAtual("");
    setMapas([]);
    setEditando(null);
    setPendente(false);
  }

  // ── Ordem de visitação ──────────────────────────────────

  function adicionarPonto(id: string) {
    if (!id || pontos.includes(id)) return;
    setPontos([...pontos, id]);
    setPendente(true);
  }

  function moverPonto(indice: number, delta: number) {
    const destino = indice + delta;
    if (destino < 0 || destino >= pontos.length) return;

    const lista = [...pontos];
    [lista[indice], lista[destino]] = [lista[destino], lista[indice]];
    setPontos(lista);
    setPendente(true);
  }

  function removerPonto(indice: number) {
    setPontos(pontos.filter((_, i) => i !== indice));
    setPendente(true);
  }

  // ── Logo e mapas (upload imediato no storage, publica no Salvar) ──

  async function enviarLogo(file: File | null) {
    if (!file) return;
    if (!editando) {
      setErro("Salve a rota primeiro para enviar a logo.");
      return;
    }

    setErro("");
    setOk("");

    try {
      const url = await uploadFoto(editando, file, "roteiros");
      setLogoAtual(url);
      setPendente(true);
      setOk('Logo enviada. Clique em "Salvar alterações" para publicar.');
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao enviar a logo.");
    }
  }

  async function adicionarMapas(files: FileList | null) {
    if (!files || !editando) return;

    setErro("");
    setOk("");

    try {
      const novas: FotoTerritorio[] = [];

      for (const file of Array.from(files)) {
        const url = await uploadFoto(editando, file, "roteiros");
        // a legenda já entra com o nome do arquivo (editável depois)
        novas.push({ url, legenda: legendaDoArquivo(file.name) });
      }

      setMapas([...mapas, ...novas]);
      setPendente(true);
      setOk(
        `${novas.length} mapa(s) enviado(s). Clique em "Salvar alterações" para publicar.`
      );
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao enviar o mapa.");
    }
  }

  function moverMapa(indice: number, delta: number) {
    const destino = indice + delta;
    if (destino < 0 || destino >= mapas.length) return;

    const lista = [...mapas];
    [lista[indice], lista[destino]] = [lista[destino], lista[indice]];
    setMapas(lista);
    setPendente(true);
  }

  function alterarCreditoMapa(indice: number, credito: string) {
    setMapas(mapas.map((f, i) => (i === indice ? { ...f, credito } : f)));
    setPendente(true);
  }

  function alterarLegendaMapa(indice: number, legenda: string) {
    setMapas(mapas.map((m, i) => (i === indice ? { ...m, legenda } : m)));
    setPendente(true);
  }

  function removerMapa(indice: number) {
    setMapas(mapas.filter((_, i) => i !== indice));
    setPendente(true);
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
        logo: logoAtual || null,
        mapas,
        pontos,
      };

      const corpo = { ...(editando ? {} : { id }), ...payload };

      try {
        await salvarRoteiro(editando, corpo);
      } catch (e) {
        const mensagem = e instanceof Error ? e.message : "";

        // janela de transição: se a coluna nova ainda não existe no banco,
        // grava o resto da rota em vez de perder a edição inteira
        if (/column .* does not exist/i.test(mensagem)) {
          const semArquivos: Record<string, unknown> = { ...corpo };
          const tinhaLogo = !!semArquivos.logo;
          delete semArquivos.logo;
          delete semArquivos.mapas;

          await salvarRoteiro(editando, semArquivos);

          setEditando(id);
          setPendente(false);
          await carregar();
          setErro(
            `A rota foi salva, mas a logo e os mapas não: a coluna nova ainda não ` +
              `existe no banco. Falta rodar ` +
              `supabase/migrations/20260927_roteiros_logo_mapas.sql no SQL Editor do ` +
              `Supabase (logo atual: ${tinhaLogo ? "sim" : "não"}).`
          );
          return;
        }

        throw e;
      }

      setEditando(id);
      setPendente(false);
      await carregar();
      setOk(`Alterações publicadas em ${formatarDataHoraBR(new Date().toISOString())}.`);
    } catch (e) {
      console.error(e);
      setErro(
        e instanceof Error ? explicarErro(e.message) : "Falha ao salvar."
      );
    } finally {
      setSalvando(false);
    }
  }

  // ── Ações instantâneas (tabela) ─────────────────────────

  async function alternarAtivo(id: string, ativo: boolean) {
    setErro("");
    setOk("");

    try {
      await atualizarRoteiro(id, { ativo });
      if (editando === id) setForm((prev) => ({ ...prev, ativo }));
      setOk(
        ativo
          ? "Rota habilitada para os visitantes (gravado)."
          : "Rota desabilitada para os visitantes (gravado)."
      );
      await carregar();
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? explicarErro(e.message) : "Falha ao alterar a visibilidade.");
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
      setErro(e instanceof Error ? explicarErro(e.message) : "Falha ao excluir.");
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
        Quando estiver guiando, deixe habilitada apenas a rota do dia. A ordem da lista
        abaixo é a ordem de visitação. Logo e mapas só são publicados ao clicar em{" "}
        <b>Salvar alterações</b>; os botões da tabela gravam na hora.
      </p>

      {ok && <p className="admin-ok">{ok}</p>}
      {erro && <p className="admin-erro">{erro}</p>}

      {/* ─── Formulário (criar / editar) ─── */}
      <form className="admin-form" onSubmit={salvar}>
        <h2>
          {estaEditando ? `Editando: ${form.nome} (${editando})` : "Nova rota"}
          {pendente && <span className="admin-pendente"> · alterações não salvas</span>}
        </h2>

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
          No Google My Maps: crie o mapa com o traçado, clique em Compartilhar →
          “Qualquer pessoa com o link” → copie o link e cole aqui. Ele aparece embutido
          na tela da rota, antes das suas imagens de mapa.
        </small>

        <input
          type="text"
          placeholder="Link da ficha de inscrição desta rota — opcional"
          value={form.inscricaoUrl}
          onChange={(e) => setCampo("inscricaoUrl", e.target.value)}
        />

        {/* ─── Logo da rota ─── */}
        <div className="admin-fotos">
          <b>Logo da rota / do evento</b>

          {!estaEditando ? (
            <p className="admin-ajuda">
              Salve a rota primeiro. Depois de salva, este bloco libera o envio da logo.
            </p>
          ) : (
            <>
              <p className="admin-ajuda">
                Aparece na tela da rota (topo) e na lista de rotas. Publica ao clicar em{" "}
                <b>Salvar alterações</b>.
              </p>

              {logoAtual && (
                <div className="admin-logo-preview">
                  <img src={logoAtual} alt="" />
                  <button
                    type="button"
                    className="outline"
                    onClick={() => {
                      setLogoAtual("");
                      setPendente(true);
                      setOk('Logo marcada para remoção. Clique em "Salvar alterações".');
                    }}
                  >
                    Remover logo
                  </button>
                </div>
              )}

              <div className="admin-form-upload">
                <label>{logoAtual ? "Trocar a logo:" : "Enviar a logo:"}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    enviarLogo(e.target.files?.[0] ?? null);
                    e.target.value = "";
                  }}
                />
              </div>
            </>
          )}
        </div>

        {/* ─── Mapas do percurso ─── */}
        <div className="admin-fotos">
          <b>Imagens de mapa do percurso</b>

          {!estaEditando ? (
            <p className="admin-ajuda">
              Salve a rota primeiro. Depois de salva, este bloco libera o envio das
              imagens de mapa que você produziu.
            </p>
          ) : (
            <>
              <p className="admin-ajuda">
                Podem ser vários mapas (o antigo, o atual, recortes etc.). A ordem aqui é
                a ordem em que aparecem no app. Publica ao clicar em{" "}
                <b>Salvar alterações</b>.
              </p>

              <div className="admin-form-upload">
                <label>Adicionar mapas (pode escolher vários):</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    adicionarMapas(e.target.files);
                    e.target.value = "";
                  }}
                />
              </div>

              {mapas.length === 0 && (
                <p className="admin-ajuda">Nenhum mapa cadastrado ainda.</p>
              )}

              <div className="admin-galeria">
                {mapas.map((mapa, i) => (
                  <div key={`${mapa.url}-${i}`} className="admin-galeria-item">
                    <span className="admin-galeria-apoio">mapa {i + 1}</span>

                    <img src={mapa.url} alt="" />

                    <input
                      type="text"
                      placeholder="Legenda do mapa"
                      value={mapa.legenda ?? ""}
                      onChange={(e) => alterarLegendaMapa(i, e.target.value)}
                    />

                    <input
                      type="text"
                      placeholder="Crédito (ex: Cartografia: Maria Souza)"
                      value={mapa.credito ?? ""}
                      onChange={(e) => alterarCreditoMapa(i, e.target.value)}
                    />

                    <div className="admin-galeria-acoes">
                      <button type="button" className="outline" onClick={() => moverMapa(i, -1)}>
                        ↑
                      </button>
                      <button type="button" className="outline" onClick={() => moverMapa(i, 1)}>
                        ↓
                      </button>
                      <button type="button" className="outline" onClick={() => removerMapa(i)}>
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

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
            {salvando ? "Salvando..." : "Salvar alterações"}
          </button>

          {estaEditando && (
            <button
              type="button"
              className="outline"
              onClick={() => {
                if (
                  !pendente ||
                  window.confirm("Descartar as alterações não salvas desta rota?")
                ) {
                  limparForm();
                }
              }}
            >
              Fechar / descartar
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
            <th>Logo</th>
            <th>Mapas</th>
            <th>Visível (grava na hora)</th>
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
              <td>{r.logo ? "sim" : "não"}</td>
              <td>{r.mapas?.length ?? 0}</td>
              <td>
                <button
                  className={r.ativo === false ? "outline" : "btn"}
                  onClick={() => alternarAtivo(r.id, r.ativo === false)}
                >
                  {r.ativo === false ? "habilitar" : "desabilitar"}
                </button>
              </td>
              <td className="admin-acoes">
                <button
                  className="outline"
                  onClick={() => {
                    if (
                      !pendente ||
                      window.confirm(
                        "Você tem alterações não salvas em outra rota. Abrir esta e descartar?"
                      )
                    ) {
                      preencherForm(r);
                    }
                  }}
                  title="Editar"
                >
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
              <td colSpan={7} style={{ textAlign: "center", padding: 24 }}>
                Nenhuma rota cadastrada.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
