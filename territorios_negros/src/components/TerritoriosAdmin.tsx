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
  definirVisibilidadeTodasMidias,
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

/** Quantas mídias de uma lista estão habilitadas (campo ausente = habilitada). */
function habilitadasEm(itens: { visivel?: boolean }[] | undefined | null): number {
  return (itens ?? []).filter((item) => item.visivel !== false).length;
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

  const [videos, setVideos] = useState<VideoTerritorio[]>([]);
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
    setVideos(t.videos ?? []);
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
    setVideos([]);
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
      videos,
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

  /**
   * Habilita/desabilita TODAS as fotos (ou todos os vídeos) de apoio de um
   * território, gravando na hora — é o botão "todas" do bloco do formulário e o
   * da lista de territórios.
   *
   * Não existe mais um "conjunto" separado do item: grava o `visivel` de cada
   * mídia (o app olha isso) e espelha na coluna antiga do conjunto.
   */
  async function alternarTodasMidias(
    id: string,
    campo: "fotos" | "videos",
    visivel: boolean
  ) {
    setErro("");
    setOk("");

    const ehFoto = campo === "fotos";

    try {
      await definirVisibilidadeTodasMidias(id, campo, visivel);

      // espelha no formulário, quando é o território que está aberto
      if (editando === id) {
        if (ehFoto) setFotos(fotos.map((f) => ({ ...f, visivel })));
        else setVideos(videos.map((v) => ({ ...v, visivel })));
      }

      await carregar();
      setOk(
        `Todas as ${ehFoto ? "fotos" : "vídeos"} de apoio foram ${
          visivel ? "habilitadas" : "desabilitadas"
        } para os visitantes (gravado).`
      );
    } catch (e) {
      console.error(e);
      const mensagem = e instanceof Error ? e.message : "";

      setErro(
        /column .* does not exist/i.test(mensagem)
          ? "As mídias de apoio ainda não estão ativadas no banco: falta rodar " +
              "supabase/migrations/20261001_videos_apoio_territorios.sql no SQL " +
              "Editor do Supabase."
          : mensagem || "Falha ao alterar a visibilidade das mídias."
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

  // ── Render ──────────────────────────────────────────────────

  const estaEditando = editando !== null;

  // Quantas mídias de apoio estão habilitadas: alimenta a linha "Situação" dos
  // dois blocos e a coluna da tabela.
  const fotosHabilitadas = habilitadasEm(fotos);
  const videosHabilitados = habilitadasEm(videos);

  function nomeCategoria(id: string | null) {
    if (!id) return "— sem categoria —";
    return categorias.find((c) => c.id === id)?.nome ?? id;
  }

  return (
    <div>
      <h1>Territórios</h1>

      <p className="admin-ajuda">
        Tudo que é <b>mostrar ou esconder</b> grava na hora, e vale igual para o
        território e para as mídias de apoio dele: o <b>habilitar/desabilitar</b> da
        tabela, o <b>Habilitar todas / Desabilitar todas</b> de cada bloco e o{" "}
        <b>Habilitar/Desabilitar</b> de cada foto e de cada vídeo. São os botões para
        usar durante a visita guiada. O resto (textos, legendas, créditos, ordem,
        envio de arquivos, foto principal) só é publicado quando você clica em{" "}
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

        <hr className="admin-divisor" />
        <h3 className="admin-form-secao">Identificação</h3>

        <div className="admin-form-grid">
          <label className="admin-campo">
            <b>Nome do território *</b>
            <span className="admin-campo-dica">
              Título grande da página do território e o nome que aparece na lista.
            </span>
            <input
              type="text"
              placeholder="Ex: Igreja do Rosário dos Homens Pretos"
              value={form.nome}
              onChange={(e) => setCampo("nome", e.target.value)}
              required
            />
          </label>

          <label className="admin-campo">
            <b>Local *</b>
            <span className="admin-campo-dica">
              Endereço ou bairro, em letra menor embaixo do nome — e também no item
              da lista.
            </span>
            <input
              type="text"
              placeholder="Ex: Centro de Vitória - ES"
              value={form.local}
              onChange={(e) => setCampo("local", e.target.value)}
              required
            />
          </label>

          <label className="admin-campo">
            <b>Palavra-chave *</b>
            <span className="admin-campo-dica">
              Uma palavra que resume o território. Aparece na seção{" "}
              <b>Palavra-chave</b>, perto do fim da página, antes das imagens de
              apoio.
            </span>
            <input
              type="text"
              placeholder="Ex: RESISTÊNCIA"
              value={form.palavra}
              onChange={(e) => setCampo("palavra", e.target.value)}
              required
            />
          </label>

          <label className="admin-campo">
            <b>Ano</b>
            <span className="admin-campo-dica">
              Só o número. O app usa este ano para calcular a idade mostrada nas{" "}
              <b>Informações rápidas</b>; ano errado = idade errada.
            </span>
            <input
              type="number"
              placeholder="Ex: 1767"
              value={form.ano}
              onChange={(e) => setCampo("ano", e.target.value)}
            />
          </label>

          <label className="admin-campo">
            <b>Categoria</b>
            <span className="admin-campo-dica">
              Grupo em que o território aparece na lista. As categorias são criadas e
              ordenadas na aba <b>Categorias</b>.
            </span>
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
            <b>Ordem na lista</b>
            <span className="admin-campo-dica">
              Menor número aparece antes na lista, dentro da categoria.
            </span>
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
          <span className="admin-check-texto">
            <b>Visível para os visitantes</b>
            <span className="admin-campo-dica">
              Desmarcado, o território sai da lista e do percurso do dia (nada é
              apagado); quem abrir um link antigo lê “não faz parte do percurso de
              hoje”.
            </span>
          </span>
        </label>

        <hr className="admin-divisor" />
        <h3 className="admin-form-secao">
          Ficha do território (cartões de “Informações rápidas”)
        </h3>

        <label className="admin-campo">
          <b>Camadas</b>
          <span className="admin-campo-dica">
            Faixa de tempo do território, do mais antigo ao mais recente. É o
            primeiro cartão das Informações rápidas.
          </span>
          <textarea
            placeholder="Ex: Antes de 1765: irmandade → 1767–1768: construção → ampliações nos séculos XVIII e XIX"
            value={form.camadas}
            onChange={(e) => setCampo("camadas", e.target.value)}
          />
        </label>

        <label className="admin-campo">
          <b>Contexto</b>
          <span className="admin-campo-dica">
            O que acontecia em volta na época, em uma frase. Cartão “Contexto”.
          </span>
          <textarea
            placeholder="Ex: Organização negra religiosa, social e política no período colonial."
            value={form.contexto}
            onChange={(e) => setCampo("contexto", e.target.value)}
          />
        </label>

        <label className="admin-campo">
          <b>Criação</b>
          <span className="admin-campo-dica">
            Quem ou o que deu origem ao território. Cartão “Criação”.
          </span>
          <input
            type="text"
            placeholder="Ex: Irmandade do Rosário"
            value={form.criacao}
            onChange={(e) => setCampo("criacao", e.target.value)}
          />
        </label>

        <label className="admin-campo">
          <b>Função</b>
          <span className="admin-campo-dica">
            Para que servia ou serve hoje. Cartão “Função”.
          </span>
          <input
            type="text"
            placeholder="Ex: Culto, organização social, alforria e sepultamento"
            value={form.funcao}
            onChange={(e) => setCampo("funcao", e.target.value)}
          />
        </label>

        <label className="admin-campo">
          <b>Transformações</b>
          <span className="admin-campo-dica">
            O que mudou com o tempo. Cartão “Transformações”.
          </span>
          <input
            type="text"
            placeholder="Ex: Ampliações → tombamento → patrimônio histórico."
            value={form.transformacoes}
            onChange={(e) => setCampo("transformacoes", e.target.value)}
          />
        </label>

        <label className="admin-campo">
          <b>Status</b>
          <span className="admin-campo-dica">
            Como o território está hoje. Cartão “Status”.
          </span>
          <input
            type="text"
            placeholder="Ex: Igreja preservada e ativa"
            value={form.status}
            onChange={(e) => setCampo("status", e.target.value)}
          />
        </label>

        <label className="admin-campo">
          <b>Observação</b>
          <span className="admin-campo-dica">
            Um detalhe extra, quando houver. Cartão “Observação” — se ficar vazio, o
            cartão não aparece no app.
          </span>
          <textarea
            placeholder="Opcional: um detalhe que não cabe nos outros campos"
            value={form.observacao}
            onChange={(e) => setCampo("observacao", e.target.value)}
          />
        </label>

        <hr className="admin-divisor" />
        <h3 className="admin-form-secao">Textos que o visitante lê</h3>

        <label className="admin-campo">
          <b>Descrição do território *</b>
          <span className="admin-campo-dica">
            O texto principal, na seção “O que é este território?”. Escreva em
            parágrafos livres, como num texto corrido.
          </span>
          <textarea
            placeholder="Escreva aqui o que o visitante lê sobre este território."
            value={form.descricao}
            onChange={(e) => setCampo("descricao", e.target.value)}
            required
          />
        </label>

        <label className="admin-campo">
          <b>Para observar durante a visita</b>
          <span className="admin-campo-dica">
            Seção “Para observar durante a visita”. Um item por linha: cada linha vira
            um item da lista que o visitante lê no app — se ficar vazio, essa parte da
            página aparece em branco.
          </span>

          <textarea
            placeholder="Ex: A escadaria como parte da experiência de acesso ao território"
            value={form.observar}
            onChange={(e) => setCampo("observar", e.target.value)}
            rows={4}
          />
        </label>

        <label className="admin-campo">
          <b>Pergunta para reflexão</b>
          <span className="admin-campo-dica">
            Aparece em itálico na seção “Para refletir”. Pode ser uma pergunta ou uma
            frase curta.
          </span>
          <textarea
            placeholder="Ex: Quem construiu este lugar e quem ficou fora da história oficial?"
            value={form.pergunta}
            onChange={(e) => setCampo("pergunta", e.target.value)}
          />
        </label>

        <label className="admin-campo">
          <b>Idade das camadas (cartões de tempo)</b>
          <span className="admin-campo-dica">
            Uma linha por camada, no formato “ano: rótulo”. Cada linha vira um cartão
            “Camada temporal” nas Informações rápidas.
          </span>
          <textarea
            placeholder={'Ex:\n1767: construção da igreja\n1890: ampliação da nave'}
            value={form.idadeCamadas}
            onChange={(e) => setCampo("idadeCamadas", e.target.value)}
            rows={3}
          />
        </label>
        <label className="admin-campo">
          <b>Vídeo no topo — opcional</b>
          <span className="admin-campo-dica">
            Toca no lugar da foto principal, no alto da página. Cole o link direto do
            arquivo, terminando em .mp4. Para vídeos com botão de{" "}
            <b>liberar/bloquear</b> (e também links do YouTube), use o bloco{" "}
            <b>Vídeos de apoio</b>, logo abaixo das fotos de apoio.
          </span>

          <input
            type="text"
            placeholder="https://.../video.mp4"
            value={form.video}
            onChange={(e) => setCampo("video", e.target.value)}
          />
        </label>


        {/* ─── Foto principal ─── */}
        <div className="admin-form-upload">
          <label>
            <b>Foto principal{!estaEditando ? " *" : ""}</b>
            <span className="admin-campo-dica">
              É a imagem que abre a página do território.{" "}
              {estaEditando
                ? "Escolha um arquivo apenas se quiser trocar: sem escolher nada, a foto atual continua."
                : ""}{" "}
              As demais imagens vão no bloco <b>Fotos de apoio</b>, mais abaixo.
            </span>
          </label>

          {imagemAtual && (
            <img
              src={imagemAtual}
              alt=""
              className="admin-thumb"
              title="Foto principal que está no app hoje"
            />
          )}

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

          <label>
            <b>Crédito da foto principal</b>
            <span className="admin-campo-dica">
              Aparece em letra pequena logo abaixo da foto, no app e na imagem
              ampliada. Se deixar vazio, o app usa o crédito da foto de apoio com a
              mesma imagem.
            </span>
          </label>

          <input
            type="text"
            placeholder="Ex: Foto: Maria Souza · Acervo pessoal"
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
                imagens aparecem no fim da página, para os visitantes que estiverem{" "}
                <b>habilitadas</b>. Cada imagem tem o seu <b>Habilitar/Desabilitar</b> —
                e o <b>Habilitar todas / Desabilitar todas</b> resolve o conjunto de uma
                vez. Os dois <b>gravam na hora</b>: é o botão para usar durante a visita
                guiada, sem precisar salvar. O resto — legenda, crédito, ordem, envio
                de novas fotos e a escolha da principal — só é publicado no{" "}
                <b>Salvar alterações</b>. O <b>crédito</b> aparece embaixo da imagem,
                no app e quando ela é ampliada; na foto principal, vale o crédito da
                foto marcada como principal. A <b>legenda</b> de cada foto enviada já
                vem com o nome do arquivo — ajuste só o que precisar.
              </p>

              <div className="admin-fotos-estado">
                <b>Situação:</b> <b>{fotosHabilitadas}</b> de {fotos.length}{" "}
                imagem(ns) habilitada(s) para os visitantes{" "}
                <button
                  type="button"
                  className={fotosHabilitadas < fotos.length ? "btn" : "outline"}
                  onClick={() => editando && alternarTodasMidias(editando, "fotos", true)}
                >
                  Habilitar todas
                </button>
                <button
                  type="button"
                  className={fotosHabilitadas > 0 ? "btn" : "outline"}
                  onClick={() => editando && alternarTodasMidias(editando, "fotos", false)}
                >
                  Desabilitar todas
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

                      <label className="admin-galeria-campo">
                        <span>Legenda da imagem</span>
                        <input
                          type="text"
                          placeholder="Ex: Fachada da igreja em 2024"
                          value={foto.legenda ?? ""}
                          onChange={(e) => alterarLegenda(i, e.target.value)}
                        />
                      </label>

                      <label className="admin-galeria-campo">
                        <span>Crédito</span>
                        <input
                          type="text"
                          placeholder="Ex: Foto: Maria Souza · Acervo pessoal"
                          value={foto.credito ?? ""}
                          onChange={(e) => alterarCredito(i, e.target.value)}
                        />
                      </label>

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
                imagens de apoio, para os visitantes que estiverem <b>habilitados</b>.
                Cada vídeo tem o seu <b>Habilitar/Desabilitar</b> (grava na hora) e o{" "}
                <b>Habilitar todos / Desabilitar todos</b> resolve o conjunto de uma
                vez. Você pode enviar o arquivo do aparelho (até {LIMITE_VIDEO_MB} MB
                por vídeo) <b>ou</b> colar o link (YouTube, Vimeo, Google Drive): os
                dois funcionam, e o app monta o player sozinho. A legenda, o crédito,
                a ordem e o envio de novos vídeos valem no{" "}
                <b>Salvar alterações</b>.
              </p>

              <div className="admin-fotos-estado">
                <b>Situação:</b> <b>{videosHabilitados}</b> de {videos.length}{" "}
                vídeo(s) habilitado(s) para os visitantes{" "}
                <button
                  type="button"
                  className={videosHabilitados < videos.length ? "btn" : "outline"}
                  onClick={() => editando && alternarTodasMidias(editando, "videos", true)}
                >
                  Habilitar todos
                </button>
                <button
                  type="button"
                  className={videosHabilitados > 0 ? "btn" : "outline"}
                  onClick={() => editando && alternarTodasMidias(editando, "videos", false)}
                >
                  Desabilitar todos
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

                      <label className="admin-galeria-campo">
                        <span>Legenda do vídeo</span>
                        <input
                          type="text"
                          placeholder="Ex: Festa de São Benedito, 2024"
                          value={video.legenda ?? ""}
                          onChange={(e) => alterarLegendaVideo(i, e.target.value)}
                        />
                      </label>

                      <label className="admin-galeria-campo">
                        <span>Crédito</span>
                        <input
                          type="text"
                          placeholder="Ex: Vídeo: Maria Souza · Acervo pessoal"
                          value={video.credito ?? ""}
                          onChange={(e) => alterarCreditoVideo(i, e.target.value)}
                        />
                      </label>

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
                {habilitadasEm(t.fotos)} habilitada(s)
                <br />
                <button
                  className="outline"
                  onClick={() => alternarTodasMidias(t.id, "fotos", true)}
                >
                  habilitar todas
                </button>{" "}
                <button
                  className="outline"
                  onClick={() => alternarTodasMidias(t.id, "fotos", false)}
                >
                  desabilitar todas
                </button>
              </td>
              <td>
                {t.videos?.length ?? 0} vídeo(s) ·{" "}
                {habilitadasEm(t.videos)} habilitado(s)
                <br />
                <button
                  className="outline"
                  onClick={() => alternarTodasMidias(t.id, "videos", true)}
                >
                  habilitar todos
                </button>{" "}
                <button
                  className="outline"
                  onClick={() => alternarTodasMidias(t.id, "videos", false)}
                >
                  desabilitar todos
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
