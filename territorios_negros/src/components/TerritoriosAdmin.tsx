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
  definirVisibilidadeMidia,
  excluirTerritorio,
  fetchCategorias,
  fetchTerritorioBruto,
  fetchTerritorios,
  LIMITE_VIDEO_MB,
  salvarTerritorio,
  uploadFoto,
  uploadVideo,
} from "../data/api";
import type { Categoria, FotoTerritorio, Territorio, VideoTerritorio } from "../data/types";
import PlayerVideo from "../components/PlayerVideo";
import { gerarSlug } from "../utils/catalogo";
import { formatarDataHoraBR } from "../utils/data";
import { legendaDoArquivo } from "../utils/legendas";
import {
  avisoDeApagamento,
  camposQueSeraoApagados,
} from "../utils/protecaoEdicao";

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
  imagemCredito: "",
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

  const [videos, setVideos] = useState<VideoTerritorio[]>([]);
  const [videosLiberados, setVideosLiberados] = useState(false);
  /** link que a autoria colou para adicionar um vídeo (YouTube, Drive...) */
  const [linkVideo, setLinkVideo] = useState("");

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
      imagemCredito: t.imagemCredito ?? "",
    });
    setImagemFile(null);
    setImagemAtual(t.imagem ?? "");
    setFotos(t.fotos ?? []);
    setFotosLiberadas(t.fotosLiberadas === true);
    setVideos(t.videos ?? []);
    setVideosLiberados(t.videosLiberados === true);
    setLinkVideo("");
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
    setVideos([]);
    setVideosLiberados(false);
    setLinkVideo("");
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
      videos,
      videos_liberados: videosLiberados,
      imagem_credito: form.imagemCredito || null,
      ...(imagemFinal && { imagem: imagemFinal }),
    };
  }

  // ── Salvar (única forma de publicar uma edição) ─────────────

  /**
   * Relê a linha do banco agora e avisa quando a gravação for apagar conteúdo
   * que já está lá (ex.: painel aberto desde antes de uma correção no banco).
   * Devolve false quando a autoria decide não salvar.
   */
  async function podeApagarConteudo(
    id: string,
    corpo: Record<string, unknown>
  ): Promise<boolean> {
    try {
      const banco = await fetchTerritorioBruto(id);
      if (!banco) return true; // linha não encontrada: deixa o salvamento responder

      const aviso = avisoDeApagamento(camposQueSeraoApagados(banco, corpo));
      if (!aviso) return true;

      return window.confirm(aviso);
    } catch (e) {
      // falha só na conferência: não trava a edição
      console.error(e);
      return true;
    }
  }

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

      const corpo = { ...(editando ? {} : { id }), ...montarPayload(imagemUrl) };

      if (editando && !(await podeApagarConteudo(editando, corpo))) {
        setOk("Nada foi gravado: você cancelou o aviso de conteúdo apagado.");
        return;
      }

      try {
        await salvarTerritorio(editando, corpo);
      } catch (e) {
        const mensagem = e instanceof Error ? e.message : "";

        // janela de transição: sem alguma coluna nova no banco, salva o resto
        if (/column .* does not exist/i.test(mensagem)) {
          const reduzido: Record<string, unknown> = { ...corpo };
          delete reduzido.imagem_credito;
          delete reduzido.videos;
          delete reduzido.videos_liberados;

          await salvarTerritorio(editando, reduzido);

          setEditando(id);
          setPendente(false);
          await carregar();
          setErro(
            "O território foi salvo, mas os campos novos (crédito da foto principal " +
              "e vídeos de apoio) não: falta rodar no SQL Editor do Supabase os " +
              "arquivos supabase/migrations/20260927_creditos_imagens.sql e " +
              "supabase/migrations/20261001_videos_apoio_territorios.sql."
          );
          return;
        }

        throw e;
      }

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
        // a legenda já entra com o nome do arquivo (editável depois)
        novas.push({ url, legenda: legendaDoArquivo(file.name) });
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

  /**
   * Reordena a galeria (↑ = -1, ↓ = +1). A ordem daqui é a ordem em que as
   * imagens aparecem no fim da página do território, para o visitante.
   */
  function moverFoto(indice: number, delta: number) {
    const destino = indice + delta;
    if (destino < 0 || destino >= fotos.length) return;

    const reordenadas = [...fotos];
    [reordenadas[indice], reordenadas[destino]] = [
      reordenadas[destino],
      reordenadas[indice],
    ];

    setFotos(reordenadas);
    setPendente(true);
    setOk("Ordem alterada. Clique em \"Salvar alterações\" para publicar.");
  }

  function alterarLegenda(indice: number, legenda: string) {
    setFotos(fotos.map((f, i) => (i === indice ? { ...f, legenda } : f)));
    setPendente(true);
  }

  function alterarCredito(indice: number, credito: string) {
    setFotos(fotos.map((f, i) => (i === indice ? { ...f, credito } : f)));
    setPendente(true);
  }

  // ── Vídeos de apoio (mesma regra das fotos) ─────────────────

  function avisoParaPublicar(acao: string) {
    setPendente(true);
    setOk(`${acao} Clique em "Salvar alterações" para publicar.`);
  }

  /**
   * Envia os vídeos escolhidos no aparelho da autoria. Vídeo acima do limite do
   * armazenamento não quebra o resto: fica de fora e o painel explica o motivo,
   * sugerindo publicar no YouTube e usar o campo de link.
   */
  async function adicionarVideos(files: FileList | null) {
    if (!files || !editando) return;

    setErro("");
    setOk("");

    const grandes: string[] = [];

    try {
      const novas: VideoTerritorio[] = [];

      for (const file of Array.from(files)) {
        if (file.size > LIMITE_VIDEO_MB * 1024 * 1024) {
          grandes.push(file.name);
          continue;
        }

        const url = await uploadVideo(editando, file);
        // a legenda já entra com o nome do arquivo (editável depois)
        novas.push({ url, legenda: legendaDoArquivo(file.name) });
      }

      if (novas.length > 0) {
        setVideos([...videos, ...novas]);
        avisoParaPublicar(`${novas.length} vídeo(s) enviado(s).`);
      }

      if (grandes.length > 0) {
        setErro(
          `Estes vídeos passaram de ${LIMITE_VIDEO_MB} MB e não foram enviados: ` +
            `${grandes.join(", ")}. Para vídeos maiores, publique no YouTube ` +
            `(pode ser como "não listado") e use o campo de link aqui embaixo.`
        );
      }
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao enviar o vídeo.");
    }
  }

  /** Adiciona um vídeo por link (YouTube, Vimeo, Google Drive ou arquivo direto). */
  function adicionarVideoPorLink() {
    const url = linkVideo.trim();

    if (!url) {
      setErro("Cole o link do vídeo (YouTube, Vimeo, Google Drive ou link do arquivo).");
      return;
    }

    setErro("");
    setVideos([...videos, { url, link: true }]);
    setLinkVideo("");
    avisoParaPublicar("Vídeo adicionado à lista.");
  }

  function removerVideo(indice: number) {
    setVideos(videos.filter((_, i) => i !== indice));
    avisoParaPublicar("Vídeo marcado para remoção.");
  }

  /** A ordem daqui é a ordem dos vídeos no fim da página do território. */
  function moverVideo(indice: number, delta: number) {
    const destino = indice + delta;
    if (destino < 0 || destino >= videos.length) return;

    const reordenados = [...videos];
    [reordenados[indice], reordenados[destino]] = [
      reordenados[destino],
      reordenados[indice],
    ];

    setVideos(reordenados);
    avisoParaPublicar("Ordem alterada.");
  }

  function alterarLegendaVideo(indice: number, legenda: string) {
    setVideos(videos.map((v, i) => (i === indice ? { ...v, legenda } : v)));
    setPendente(true);
  }

  function alterarCreditoVideo(indice: number, credito: string) {
    setVideos(videos.map((v, i) => (i === indice ? { ...v, credito } : v)));
    setPendente(true);
  }

  /**
   * Liga/desliga UMA foto ou UM vídeo de apoio, gravando na hora.
   *
   * É o botão de uso durante a visita guiada: não publica nem descarta o que
   * ainda está pendente no formulário — grava só a visibilidade daquele item,
   * direto no banco, e espelha no formulário para o "Salvar alterações"
   * seguinte não desfazer o que foi gravado.
   */
  async function alternarVisibilidadeMidia(
    campo: "fotos" | "videos",
    url: string,
    visivel: boolean
  ) {
    if (!editando) return;

    setErro("");
    setOk("");

    const ehFoto = campo === "fotos";

    try {
      const gravado = await definirVisibilidadeMidia(editando, campo, url, visivel);

      if (!gravado) {
        setErro(
          "Este item ainda não está publicado no banco: clique em \"Salvar " +
            "alterações\" e depois use o botão outra vez."
        );
        return;
      }

      if (ehFoto) {
        setFotos(fotos.map((f) => (f.url === url ? { ...f, visivel } : f)));
      } else {
        setVideos(videos.map((v) => (v.url === url ? { ...v, visivel } : v)));
      }

      await carregar();
      setOk(
        `${ehFoto ? "Foto" : "Vídeo"} de apoio ${
          visivel ? "habilitado" : "desabilitado"
        } para os visitantes (gravado).`
      );
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao alterar a visibilidade.");
    }
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

  async function alternarVideosTabela(id: string, liberar: boolean) {
    setErro("");
    setOk("");

    try {
      await atualizarTerritorio(id, { videos_liberados: liberar });
      if (editando === id) setVideosLiberados(liberar);
      setOk(
        liberar
          ? "Vídeos de apoio liberados para os visitantes (gravado)."
          : "Vídeos de apoio bloqueados para os visitantes (gravado)."
      );
      await carregar();
    } catch (e) {
      console.error(e);
      const mensagem = e instanceof Error ? e.message : "";

      setErro(
        /column .* does not exist/i.test(mensagem)
          ? "Os vídeos de apoio ainda não estão ativados no banco: falta rodar " +
              "supabase/migrations/20261001_videos_apoio_territorios.sql no SQL " +
              "Editor do Supabase."
          : mensagem || "Falha ao alterar os vídeos."
      );
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

  /** Liberar/bloquear TODAS as fotos do território aberto (grava na hora). */
  async function alternarFotosConjunto(liberar: boolean) {
    if (editando) await alternarFotosTabela(editando, liberar);
  }

  /** Liberar/bloquear TODOS os vídeos do território aberto (grava na hora). */
  async function alternarVideosConjunto(liberar: boolean) {
    if (editando) await alternarVideosTabela(editando, liberar);
  }

  // ── Render ──────────────────────────────────────────────────

  const estaEditando = editando !== null;

  // Quantas mídias de apoio estão habilitadas individualmente: alimenta a linha
  // "Situação" dos dois blocos e a coluna da tabela.
  const fotosHabilitadas = fotos.filter((f) => f.visivel !== false).length;
  const videosHabilitados = videos.filter((v) => v.visivel !== false).length;

  function nomeCategoria(id: string | null) {
    if (!id) return "— sem categoria —";
    return categorias.find((c) => c.id === id)?.nome ?? id;
  }

  return (
    <div>
      <h1>Territórios</h1>

      <p className="admin-ajuda">
        Tudo que é <b>mostrar ou esconder</b> grava na hora: os botões{" "}
        <b>habilitar/desabilitar</b>, <b>liberar/bloquear fotos</b> e{" "}
        <b>liberar/bloquear vídeos</b> da tabela, o <b>Liberar/Bloquear todas</b> de
        cada bloco e o <b>Habilitar/Desabilitar</b> de cada foto e de cada vídeo.
        São os botões para usar durante a visita guiada. O resto (textos, legendas,
        créditos, ordem, envio de arquivos, foto principal) só é publicado quando
        você clica em <b>Salvar alterações</b>.
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
        <label className="admin-campo">
          Para observar durante a visita
          <span className="admin-campo-dica">
            Um item por linha. Cada linha vira um item na lista que o visitante lê
            no app — se ficar vazio, essa parte da página aparece em branco.
          </span>

          <textarea
            placeholder="Ex: A escadaria como parte da experiência de acesso ao território"
            value={form.observar}
            onChange={(e) => setCampo("observar", e.target.value)}
            rows={4}
          />
        </label>
        <textarea
          placeholder="Pergunta para reflexão"
          value={form.pergunta}
          onChange={(e) => setCampo("pergunta", e.target.value)}
        />
        <label className="admin-campo">
          Vídeo no topo — opcional (toca no lugar da foto principal)
          <span className="admin-campo-dica">
            Cole aqui o link direto do arquivo, terminando em .mp4. Para vídeos com
            botão de <b>liberar/bloquear</b> (e também links do YouTube), use o bloco{" "}
            <b>Vídeos de apoio</b>, logo abaixo das fotos de apoio.
          </span>

          <input
            type="text"
            placeholder="https://.../video.mp4 (opcional)"
            value={form.video}
            onChange={(e) => setCampo("video", e.target.value)}
          />
        </label>
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

          <input
            type="text"
            placeholder="Crédito da foto principal (ex: Foto: Maria Souza)"
            value={form.imagemCredito}
            onChange={(e) => setCampo("imagemCredito", e.target.value)}
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
                <b>libera</b> a visualização — ideal para o momento do tour. O{" "}
                <b>Liberar todas / Bloquear todas</b> e o <b>Habilitar/Desabilitar</b>{" "}
                de cada imagem <b>gravam na hora</b>, para você usar durante a visita
                guiada. O resto — legenda, crédito, ordem, envio de novas fotos e a
                escolha da principal — só é publicado no <b>Salvar alterações</b>. O{" "}
                <b>crédito</b> aparece embaixo da imagem, no app e quando ela é
                ampliada; na foto principal, vale o crédito da foto marcada como
                principal. A <b>legenda</b> de cada foto enviada já vem com o nome
                do arquivo — ajuste só o que precisar.
              </p>

              <div className="admin-fotos-estado">
                <b>Situação:</b>{" "}
                {fotosLiberadas ? (
                  <>
                    conjunto liberado para os visitantes ·{" "}
                    <b>
                      {fotosHabilitadas} de {fotos.length}
                    </b>{" "}
                    imagem(ns) habilitada(s)
                  </>
                ) : (
                  <>
                    conjunto bloqueado — nenhuma aparece, nem as {fotosHabilitadas}{" "}
                    habilitada(s) abaixo
                  </>
                )}{" "}
                <button
                  type="button"
                  className={fotosLiberadas ? "outline" : "btn"}
                  onClick={() => alternarFotosConjunto(!fotosLiberadas)}
                >
                  {fotosLiberadas ? "Bloquear todas" : "Liberar todas"}
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
                {fotos.map((foto, i) => {
                  const principal = foto.url === imagemAtual;
                  const desabilitada = foto.visivel === false;

                  return (
                    <div
                      key={`${foto.url}-${i}`}
                      className={`admin-galeria-item ${
                        desabilitada ? "admin-galeria-bloqueada" : ""
                      }`}
                    >
                      {principal ? (
                        <span className="admin-galeria-principal">
                          foto principal (sempre no topo)
                        </span>
                      ) : (
                        <span className="admin-galeria-apoio">
                          foto de apoio {i + 1} ·{" "}
                          {desabilitada ? "desabilitada" : "habilitada"}
                        </span>
                      )}

                      <img src={foto.url} alt="" />

                      <input
                        type="text"
                        placeholder="Legenda da imagem"
                        value={foto.legenda ?? ""}
                        onChange={(e) => alterarLegenda(i, e.target.value)}
                      />

                      <input
                        type="text"
                        placeholder="Crédito (ex: Foto: Maria Souza · Acervo pessoal)"
                        value={foto.credito ?? ""}
                        onChange={(e) => alterarCredito(i, e.target.value)}
                      />

                      <div className="admin-galeria-acoes">
                        <button
                          type="button"
                          className="outline"
                          onClick={() => moverFoto(i, -1)}
                          title="Mover para cima (aparece antes no app)"
                        >
                          ↑
                        </button>

                        <button
                          type="button"
                          className="outline"
                          onClick={() => moverFoto(i, 1)}
                          title="Mover para baixo (aparece depois no app)"
                        >
                          ↓
                        </button>

                        {/* a foto principal não entra no controle individual: ela
                            aparece sempre no topo; troque a principal se quiser
                            outra imagem ali */}
                        {!principal && (
                          <button
                            type="button"
                            className={desabilitada ? "btn" : "outline"}
                            onClick={() =>
                              alternarVisibilidadeMidia("fotos", foto.url, desabilitada)
                            }
                            title={
                              desabilitada
                                ? "Mostrar esta imagem para os visitantes (grava na hora)"
                                : "Esconder esta imagem dos visitantes (grava na hora)"
                            }
                          >
                            {desabilitada ? "Habilitar" : "Desabilitar"}
                          </button>
                        )}

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
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* ─── Vídeos de apoio ─── */}
        <div className="admin-fotos">
          <b>Vídeos de apoio (vídeos extras do território)</b>

          {!estaEditando ? (
            <p className="admin-ajuda">
              Salve o território primeiro. Depois de salvo, este bloco libera o envio
              de vídeos do aparelho ou por link, com o mesmo liberar/bloquear das fotos.
            </p>
          ) : (
            <>
              <p className="admin-ajuda">
                Os vídeos aparecem no fim da página do território, logo depois das
                imagens de apoio, e só para os visitantes quando você <b>libera</b> —
                igual às fotos. Você pode enviar o arquivo do aparelho (até{" "}
                {LIMITE_VIDEO_MB} MB por vídeo) <b>ou</b> colar o link (YouTube,
                Vimeo, Google Drive): os dois funcionam, e o app monta o player
                sozinho. O <b>Liberar todos / Bloquear todos</b> e o{" "}
                <b>Habilitar/Desabilitar</b> de cada vídeo <b>gravam na hora</b>,
                para você usar durante a visita guiada. A legenda, o crédito, a ordem
                e o envio de novos vídeos valem no <b>Salvar alterações</b>.
              </p>

              <div className="admin-fotos-estado">
                <b>Situação:</b>{" "}
                {videosLiberados
                  ? `conjunto liberado para os visitantes · ${videosHabilitados} de ${videos.length} vídeo(s) habilitado(s)`
                  : `conjunto bloqueado — nenhum aparece, nem os ${videosHabilitados} habilitado(s) abaixo`}{" "}
                <button
                  type="button"
                  className={videosLiberados ? "outline" : "btn"}
                  onClick={() => alternarVideosConjunto(!videosLiberados)}
                >
                  {videosLiberados ? "Bloquear todos" : "Liberar todos"}
                </button>
              </div>

              <div className="admin-form-upload">
                <label>Adicionar vídeo do aparelho (pode escolher vários):</label>
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={(e) => {
                    adicionarVideos(e.target.files);
                    e.target.value = "";
                  }}
                />
              </div>

              <div className="admin-form-upload">
                <label>ou cole o link do vídeo (YouTube, Vimeo, Google Drive):</label>

                <div className="admin-video-link">
                  <input
                    type="text"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={linkVideo}
                    onChange={(e) => setLinkVideo(e.target.value)}
                  />

                  <button
                    type="button"
                    className="outline"
                    onClick={adicionarVideoPorLink}
                  >
                    Adicionar link
                  </button>
                </div>
              </div>

              {videos.length === 0 && (
                <p className="admin-ajuda">Nenhum vídeo de apoio cadastrado ainda.</p>
              )}

              <div className="admin-galeria">
                {videos.map((video, i) => {
                  const desabilitado = video.visivel === false;

                  return (
                    <div
                      key={`${video.url}-${i}`}
                      className={`admin-galeria-item ${
                        desabilitado ? "admin-galeria-bloqueada" : ""
                      }`}
                    >
                      <span className="admin-galeria-apoio">
                        vídeo {i + 1} · {video.link ? "por link" : "enviado"} ·{" "}
                        {desabilitado ? "desabilitado" : "habilitado"}
                      </span>

                      <PlayerVideo
                        url={video.url}
                        titulo={video.legenda || `Vídeo ${i + 1}`}
                        compacto
                      />

                      <input
                        type="text"
                        placeholder="Legenda do vídeo"
                        value={video.legenda ?? ""}
                        onChange={(e) => alterarLegendaVideo(i, e.target.value)}
                      />

                      <input
                        type="text"
                        placeholder="Crédito (ex: Vídeo: Maria Souza · Acervo pessoal)"
                        value={video.credito ?? ""}
                        onChange={(e) => alterarCreditoVideo(i, e.target.value)}
                      />

                      <div className="admin-galeria-acoes">
                        <button
                          type="button"
                          className="outline"
                          onClick={() => moverVideo(i, -1)}
                          title="Mover para cima (aparece antes no app)"
                        >
                          ↑
                        </button>

                        <button
                          type="button"
                          className="outline"
                          onClick={() => moverVideo(i, 1)}
                          title="Mover para baixo (aparece depois no app)"
                        >
                          ↓
                        </button>

                        <button
                          type="button"
                          className={desabilitado ? "btn" : "outline"}
                          onClick={() =>
                            alternarVisibilidadeMidia("videos", video.url, desabilitado)
                          }
                          title={
                            desabilitado
                              ? "Mostrar este vídeo para os visitantes (grava na hora)"
                              : "Esconder este vídeo dos visitantes (grava na hora)"
                          }
                        >
                          {desabilitado ? "Habilitar" : "Desabilitar"}
                        </button>

                        <button
                          type="button"
                          className="outline"
                          onClick={() => removerVideo(i)}
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  );
                })}
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
            <th>Vídeos de apoio (grava na hora)</th>
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
                {(t.fotos?.length ?? 0) > 0 && (
                  <>
                    <br />
                    <small>
                      {t.fotos.filter((f) => f.visivel !== false).length} de{" "}
                      {t.fotos.length} habilitada(s)
                    </small>
                  </>
                )}
                <br />
                <button
                  className="outline"
                  onClick={() => alternarFotosTabela(t.id, !t.fotosLiberadas)}
                >
                  {t.fotosLiberadas ? "bloquear fotos" : "liberar fotos"}
                </button>
              </td>
              <td>
                {t.videos?.length ?? 0} vídeo(s) ·{" "}
                {t.videosLiberados ? "liberados" : "bloqueados"}
                {(t.videos?.length ?? 0) > 0 && (
                  <>
                    <br />
                    <small>
                      {t.videos.filter((v) => v.visivel !== false).length} de{" "}
                      {t.videos.length} habilitado(s)
                    </small>
                  </>
                )}
                <br />
                <button
                  className="outline"
                  onClick={() => alternarVideosTabela(t.id, !t.videosLiberados)}
                >
                  {t.videosLiberados ? "bloquear vídeos" : "liberar vídeos"}
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
              <td colSpan={7} style={{ textAlign: "center", padding: 24 }}>
                Nenhum território cadastrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
