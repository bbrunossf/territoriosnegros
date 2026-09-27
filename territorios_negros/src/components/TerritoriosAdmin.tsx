// TerritoriosAdmin.tsx
//
// Regra de gravação (combinada com a autoria):
//  • botões da TABELA (habilitar/desabilitar, liberar/bloquear fotos, excluir)
//    gravam na hora -- são os que ela usa durante o tour;
//  • tudo que é EDIÇÃO (textos, fotos de apoio, foto principal, legenda,
//    categoria, ordem) só vale depois de clicar em "Salvar alterações".
import "../styles.css";

import { useCallback, useEffect, useState } from "react";
import {
  atualizarTerritorio,
  excluirTerritorio,
  fetchCategorias,
  fetchTerritorios,
  salvarTerritorio,
  uploadFoto,
} from "../data/api";
import type { Categoria, FotoTerritorio, Territorio } from "../data/types";
import { gerarSlug } from "../utils/catalogo";
import { formatarDataHoraBR } from "../utils/data";

// ── Helpers para campos de array ─────────────────────────────

function arrayParaTexto(arr: string[]): string {
  return arr.join("\n");
}

function textoParaArray(txt: string): string[] {
  return txt
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function idadeCamadasParaTexto(arr: Territorio["idadeCamadas"]): string {
  if (!arr) return "";
  return arr.map((ic) => `${ic.ano}: ${ic.label}`).join("\n");
}

function textoParaIdadeCamadas(txt: string): Territorio["idadeCamadas"] {
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

// ── Estado inicial do formulário ─────────────────────────────

const FORM_VAZIO = {
  nome: "",
  local: "",
  palavra: "",
  ano: "",
  categoria: "",
  ordem: "0",
  ativo: true,
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
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [editando, setEditando] = useState<string | null>(null);

  const [form, setForm] = useState(FORM_VAZIO);
  const [imagemFile, setImagemFile] = useState<File | null>(null);
  const [imagemAtual, setImagemAtual] = useState<string>("");

  const [fotos, setFotos] = useState<FotoTerritorio[]>([]);
  const [fotosLiberadas, setFotosLiberadas] = useState(false);

  // há alteração no formulário que ainda não foi gravada?
  const [pendente, setPendente] = useState(false);

  const [salvando, setSalvando] = useState(false);
  const [ok, setOk] = useState("");
  const [erro, setErro] = useState("");

  // ── Carregar lista ──────────────────────────────────────────

  const carregar = useCallback(async () => {
    try {
      const [mapa, cats] = await Promise.all([fetchTerritorios(), fetchCategorias()]);

      setTerritorios(
        Object.values(mapa).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
      );
      setCategorias(cats);
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao carregar os territórios.");
    }
  }, []);

  useEffect(() => {
    let ativo = true;

    (async () => {
      try {
        const [mapa, cats] = await Promise.all([fetchTerritorios(), fetchCategorias()]);
        if (!ativo) return;
        setTerritorios(
          Object.values(mapa).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
        );
        setCategorias(cats);
      } catch (e) {
        console.error(e);
        if (ativo) {
          setErro(e instanceof Error ? e.message : "Falha ao carregar os territórios.");
        }
      }
    })();

    return () => {
      ativo = false;
    };
  }, []);

  // ── Helpers de formulário ──────────────────────────────────

  function setCampo(campo: string, valor: string | boolean) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setPendente(true);
  }

  function preencherForm(t: Territorio) {
    setForm({
      nome: t.nome,
      local: t.local,
      palavra: t.palavra,
      ano: String(t.ano ?? ""),
      categoria: t.categoria ?? "",
      ordem: String(t.ordem ?? 0),
      ativo: t.ativo !== false,
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
    setImagemAtual(t.imagem ?? "");
    setFotos(t.fotos ?? []);
    setFotosLiberadas(t.fotosLiberadas === true);
    setEditando(t.id);
    setPendente(false);
    setOk("");
    setErro("");
  }

  function limparForm() {
    setForm(FORM_VAZIO);
    setImagemFile(null);
    setImagemAtual("");
    setFotos([]);
    setFotosLiberadas(false);
    setEditando(null);
    setPendente(false);
  }

  // ── Montar objeto para INSERT/UPDATE ────────────────────────

  function montarPayload(imagemEnviada?: string) {
    // a foto principal pode ter sido trocada na galeria (sem upload novo)
    const imagemFinal = imagemEnviada ?? (imagemAtual || undefined);

    return {
      nome: form.nome,
      local: form.local,
      palavra: form.palavra,
      ano: Number(form.ano) || null,
      categoria: form.categoria || null,
      ordem: Number(form.ordem) || 0,
      ativo: form.ativo,
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
      fotos,
      fotos_liberadas: fotosLiberadas,
      ...(imagemFinal && { imagem: imagemFinal }),
    };
  }

  // ── Salvar (única forma de publicar uma edição) ─────────────

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setOk("");

    if (!editando && !imagemFile) {
      setErro("Selecione a imagem principal do território.");
      return;
    }

    setSalvando(true);

    try {
      const id = editando ?? gerarSlug(form.nome);

      let imagemUrl: string | undefined;
      if (imagemFile) {
        imagemUrl = await uploadFoto(id, imagemFile);
      }

      await salvarTerritorio(editando, {
        ...(editando ? {} : { id }),
        ...montarPayload(imagemUrl),
      });

      setEditando(id);
      if (imagemUrl) {
        setImagemAtual(imagemUrl);
        setImagemFile(null);
      }

      setPendente(false);
      await carregar();
      setOk(`Alterações publicadas em ${formatarDataHoraBR(new Date().toISOString())}.`);
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao salvar.");
    } finally {
      setSalvando(false);
    }
  }

  // ── Fotos de apoio (edição local: publica no "Salvar alterações") ──

  async function adicionarFotos(files: FileList | null) {
    if (!files || !editando) return;

    setErro("");
    setOk("");

    try {
      const novas: FotoTerritorio[] = [];

      for (const file of Array.from(files)) {
        const url = await uploadFoto(editando, file);
        novas.push({ url, legenda: "" });
      }

      setFotos([...fotos, ...novas]);
      setPendente(true);
      setOk(
        `${novas.length} foto(s) enviada(s). Clique em "Salvar alterações" para publicar.`
      );
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao enviar a foto.");
    }
  }

  function removerFoto(indice: number) {
    setFotos(fotos.filter((_, i) => i !== indice));
    setPendente(true);
    setOk("Foto marcada para remoção. Clique em \"Salvar alterações\" para confirmar.");
  }

  function definirPrincipal(url: string) {
    setImagemAtual(url);
    setPendente(true);
    setOk(
      "Foto marcada como principal. Clique em \"Salvar alterações\" para confirmar."
    );
  }

  function alterarLegenda(indice: number, legenda: string) {
    setFotos(fotos.map((f, i) => (i === indice ? { ...f, legenda } : f)));
    setPendente(true);
  }

  function alterarFotosLiberadas(liberar: boolean) {
    setFotosLiberadas(liberar);
    setPendente(true);
    setOk(
      liberar
        ? "Fotos marcadas como liberadas. Clique em \"Salvar alterações\" para publicar."
        : "Fotos marcadas como bloqueadas. Clique em \"Salvar alterações\" para publicar."
    );
  }

  // ── Ações instantâneas da tabela (usadas durante o tour) ────

  async function alternarAtivo(id: string, ativo: boolean) {
    setErro("");
    setOk("");

    try {
      await atualizarTerritorio(id, { ativo });
      if (editando === id) setForm((prev) => ({ ...prev, ativo }));
      setOk(
        ativo
          ? "Território habilitado para os visitantes (gravado)."
          : "Território desabilitado para os visitantes (gravado)."
      );
      await carregar();
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao alterar a visibilidade.");
    }
  }

  async function alternarFotosTabela(id: string, liberar: boolean) {
    setErro("");
    setOk("");

    try {
      await atualizarTerritorio(id, { fotos_liberadas: liberar });
      if (editando === id) setFotosLiberadas(liberar);
      setOk(
        liberar
          ? "Fotos de apoio liberadas para os visitantes (gravado)."
          : "Fotos de apoio bloqueadas para os visitantes (gravado)."
      );
      await carregar();
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao alterar as fotos.");
    }
  }

  async function excluir(id: string, nome: string) {
    if (!window.confirm(`Excluir "${nome}"? Esta ação não pode ser desfeita.`)) return;

    setErro("");
    setOk("");

    try {
      await excluirTerritorio(id);
      if (editando === id) limparForm();
      await carregar();
      setOk("Território excluído.");
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao excluir.");
    }
  }

  // ── Render ──────────────────────────────────────────────────

  const estaEditando = editando !== null;

  function nomeCategoria(id: string | null) {
    if (!id) return "— sem categoria —";
    return categorias.find((c) => c.id === id)?.nome ?? id;
  }

  return (
    <div>
      <h1>Territórios</h1>

      <p className="admin-ajuda">
        Os botões <b>habilitar/desabilitar</b> e <b>liberar/bloquear fotos</b> da
        tabela gravam na hora — são para usar durante o tour. Todo o resto (textos,
        fotos, foto principal) só é publicado quando você clica em{" "}
        <b>Salvar alterações</b>.
      </p>

      {ok && <p className="admin-ok">{ok}</p>}
      {erro && <p className="admin-erro">{erro}</p>}

      {/* ─── Formulário (criar / editar) ─── */}
      <form className="admin-form" onSubmit={salvar}>
        <h2>
          {estaEditando ? `Editando: ${form.nome} (${editando})` : "Novo território"}
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

          <label className="admin-campo">
            Categoria
            <select
              value={form.categoria}
              onChange={(e) => setCampo("categoria", e.target.value)}
            >
              <option value="">— sem categoria —</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-campo">
            Ordem na lista (menor aparece antes)
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
          Visível para os visitantes (desmarque para esconder durante o tour)
        </label>

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

        {/* ─── Foto principal ─── */}
        <div className="admin-form-upload">
          <label>
            Foto principal{!estaEditando ? " *" : " (selecione apenas para trocar)"}:
          </label>

          {imagemAtual && <img src={imagemAtual} alt="" className="admin-thumb" />}

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setImagemFile(file);
                setPendente(true);
              }
            }}
            required={!estaEditando}
          />
        </div>

        {/* ─── Fotos de apoio ─── */}
        <div className="admin-fotos">
          <b>Fotos de apoio (imagens extras do território)</b>

          {!estaEditando ? (
            <p className="admin-ajuda">
              Salve o território primeiro. Depois de salvo, este bloco libera o envio
              de várias fotos, mapas e imagens de apoio.
            </p>
          ) : (
            <>
              <p className="admin-ajuda">
                A foto principal aparece sempre no topo da página do território. Estas
                imagens aparecem no fim da página e só para os visitantes quando você{" "}
                <b>libera</b> a visualização — ideal para o momento do tour. Nada aqui
                é publicado antes de você clicar em <b>Salvar alterações</b>.
              </p>

              <div className="admin-fotos-estado">
                <b>Situação:</b>{" "}
                {fotosLiberadas
                  ? "fotos liberadas para os visitantes"
                  : "fotos bloqueadas"}{" "}
                <button
                  type="button"
                  className={fotosLiberadas ? "outline" : "btn"}
                  onClick={() => alterarFotosLiberadas(!fotosLiberadas)}
                >
                  {fotosLiberadas ? "Bloquear" : "Liberar"}
                </button>
              </div>

              <div className="admin-form-upload">
                <label>Adicionar fotos (pode escolher várias):</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    adicionarFotos(e.target.files);
                    e.target.value = "";
                  }}
                />
              </div>

              {fotos.length === 0 && (
                <p className="admin-ajuda">Nenhuma foto de apoio cadastrada ainda.</p>
              )}

              <div className="admin-galeria">
                {fotos.map((foto, i) => (
                  <div key={`${foto.url}-${i}`} className="admin-galeria-item">
                    {foto.url === imagemAtual ? (
                      <span className="admin-galeria-principal">
                        foto principal
                      </span>
                    ) : (
                      <span className="admin-galeria-apoio">foto de apoio</span>
                    )}

                    <img src={foto.url} alt="" />

                    <input
                      type="text"
                      placeholder="Legenda da imagem"
                      value={foto.legenda ?? ""}
                      onChange={(e) => alterarLegenda(i, e.target.value)}
                    />

                    <div className="admin-galeria-acoes">
                      <button
                        type="button"
                        className="outline"
                        onClick={() => definirPrincipal(foto.url)}
                      >
                        Tornar principal
                      </button>

                      <button
                        type="button"
                        className="outline"
                        onClick={() => removerFoto(i)}
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
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
                  window.confirm("Descartar as alterações não salvas deste território?")
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

      {/* ─── Tabela de territórios cadastrados ─── */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Categoria</th>
            <th>Ordem</th>
            <th>Visível (grava na hora)</th>
            <th>Fotos de apoio (grava na hora)</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {territorios.map((t) => (
            <tr key={t.id} className={t.ativo === false ? "admin-linha-inativa" : ""}>
              <td>
                <b>{t.nome}</b>
                <br />
                <small>{t.id}</small>
              </td>
              <td>{nomeCategoria(t.categoria)}</td>
              <td>{t.ordem}</td>
              <td>
                <button
                  className={t.ativo === false ? "outline" : "btn"}
                  onClick={() => alternarAtivo(t.id, t.ativo === false)}
                  title="Mostrar/esconder para os visitantes"
                >
                  {t.ativo === false ? "habilitar" : "desabilitar"}
                </button>
              </td>
              <td>
                {t.fotos?.length ?? 0} foto(s) ·{" "}
                {t.fotosLiberadas ? "liberadas" : "bloqueadas"}
                <br />
                <button
                  className="outline"
                  onClick={() => alternarFotosTabela(t.id, !t.fotosLiberadas)}
                >
                  {t.fotosLiberadas ? "bloquear fotos" : "liberar fotos"}
                </button>
              </td>
              <td className="admin-acoes">
                <button
                  className="outline"
                  onClick={() => {
                    if (
                      !pendente ||
                      window.confirm(
                        "Você tem alterações não salvas em outro território. Abrir este e descartar?"
                      )
                    ) {
                      preencherForm(t);
                    }
                  }}
                  title="Editar"
                >
                  ✏️
                </button>
                <button
                  className="outline"
                  onClick={() => excluir(t.id, t.nome)}
                  title="Excluir"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}

          {territorios.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", padding: 24 }}>
                Nenhum território cadastrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
