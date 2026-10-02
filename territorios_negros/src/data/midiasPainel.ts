// src/data/midiasPainel.ts
//
// Monta o "resumo rápido" de fotos e vídeos da aba "Fotos e vídeos" do painel:
// só o que tem mídia, agrupado por página e por território, na ordem em que
// aparece no app. É o que a autoria usa durante o guia, no celular — por isso
// aqui é só dado: nenhuma tela, nenhum acesso ao banco.
//
// Não confundir com `somenteVisiveis`: aqui precisamos das mídias OCULTAS
// também (é justamente para ligar e desligar cada uma).

import {
  normalizarPagina,
  PAGINAS_DO_APP,
  type ImagemBloco,
  type PaginaConteudo,
} from "./paginas";
import type { Roteiro, Territorio } from "./types";
import { estaVisivel } from "../utils/visibilidade";

export type TipoDeMidia = "foto" | "video";

/** Onde a mídia mora: numa página de texto, na ficha de um território ou numa rota. */
export type OrigemDaMidia = "pagina" | "territorio" | "rota";

export interface ItemMidiaPainel {
  tipo: TipoDeMidia;
  url: string;
  /** legenda cadastrada; vazia vira "foto 3"/"mapa 1" para a lista não ficar cega */
  legenda: string;
  /** onde a mídia aparece: "seção O centro histórico" (página) ou "foto 3" */
  onde: string;
  visivel: boolean;
}

export interface GrupoMidias {
  /** onde vive a mídia: numa página de texto, num território ou numa rota */
  origem: OrigemDaMidia;
  /** chave do registro no banco (ex.: pagina_vitoria, mucane, rota-1) */
  chave: string;
  nome: string;
  /** rota no app, para abrir e conferir */
  caminho?: string;
  /** território ou rota desativados no painel: a mídia não aparece no app */
  foraDoAr?: boolean;
  fotos: ItemMidiaPainel[];
  videos: ItemMidiaPainel[];
}

/** Legenda vazia ganha um nome pela posição ("foto 3"), como nas galerias. */
function legenda(
  legendaBruta: string | undefined,
  indice: number,
  rotulo: "foto" | "vídeo" | "mapa"
): string {
  const texto = (legendaBruta ?? "").trim();
  if (texto) return texto;
  return `${rotulo} ${indice + 1}`;
}

function itensDasFotos(
  fotos: { url: string; legenda?: string; visivel?: boolean }[] | undefined,
  onde: string,
  rotulo: "foto" | "mapa" = "foto"
): ItemMidiaPainel[] {
  return (fotos ?? [])
    .filter((foto) => !!foto?.url)
    .map((foto, i) => ({
      tipo: "foto" as TipoDeMidia,
      url: foto.url,
      legenda: legenda(foto.legenda, i, rotulo),
      onde,
      visivel: estaVisivel(foto),
    }));
}

function itensDosVideos(
  videos: { url: string; legenda?: string; visivel?: boolean }[] | undefined
): ItemMidiaPainel[] {
  return (videos ?? [])
    .filter((video) => !!video?.url)
    .map((video, i) => ({
      tipo: "video" as TipoDeMidia,
      url: video.url,
      legenda: legenda(video.legenda, i, "vídeo"),
      onde: "vídeo de apoio",
      visivel: estaVisivel(video),
    }));
}

/** Páginas do app que têm imagem, com as imagens de cada seção (bloco). */
export function gruposDasPaginas(config: Record<string, unknown>): GrupoMidias[] {
  const grupos: GrupoMidias[] = [];

  for (const definicao of PAGINAS_DO_APP) {
    const pagina: PaginaConteudo = normalizarPagina(config[definicao.chave], definicao.padrao);

    const fotos: ItemMidiaPainel[] = [];
    pagina.blocos.forEach((bloco, i) => {
      const onde = (bloco.titulo || "").trim() || `seção ${i + 1}`;
      fotos.push(...itensDasFotos(bloco.imagens as ImagemBloco[], onde));
    });

    if (fotos.length === 0) continue;

    grupos.push({
      origem: "pagina",
      chave: definicao.chave,
      nome: definicao.nome,
      caminho: definicao.caminho,
      fotos,
      videos: [],
    });
  }

  return grupos;
}

/** Territórios que têm foto ou vídeo de apoio, na ordem da aba Territórios. */
export function gruposDosTerritorios(
  territorios: Record<string, Territorio>
): GrupoMidias[] {
  return gruposDeTodosOsTerritorios(territorios).filter(temMidia);
}

/** O grupo tem alguma mídia? (grupo de território sem mídia também é listado) */
export function temMidia(grupo: GrupoMidias): boolean {
  return grupo.fotos.length + grupo.videos.length > 0;
}

/**
 * TODOS os territórios, na ordem da aba Territórios — inclusive os que ainda
 * não têm mídia (a autoria precisa achá-los na lista para saber o que falta,
 * sem contar com o resumo do fim da tela).
 */
export function gruposDeTodosOsTerritorios(
  territorios: Record<string, Territorio>
): GrupoMidias[] {
  const comOrdem = Object.values(territorios ?? {}).map((territorio) => ({
    grupo: {
      origem: "territorio" as const,
      chave: territorio.id,
      nome: territorio.nome,
      caminho: `/territorio/${territorio.id}`,
      foraDoAr: territorio.ativo === false,
      fotos: itensDasFotos(territorio.fotos, "foto de apoio"),
      videos: itensDosVideos(territorio.videos),
    },
    ordem: territorio.ordem ?? 0,
  }));

  return comOrdem
    .sort((a, b) => a.ordem - b.ordem || a.grupo.nome.localeCompare(b.grupo.nome, "pt-BR"))
    .map(({ grupo }) => grupo);
}

/** "10 fotos (3 ocultas) · 1 vídeo" — o que está ligado e o que está desligado. */
export function resumoDoGrupo(grupo: GrupoMidias): string {
  const partes: string[] = [];
  const unidade = grupo.origem === "rota" ? "mapa" : "foto";

  if (grupo.fotos.length > 0) {
    const ocultas = grupo.fotos.filter((f) => !f.visivel).length;
    partes.push(
      `${grupo.fotos.length} ${unidade}${grupo.fotos.length === 1 ? "" : "s"}` +
        (ocultas > 0
          ? ` (${ocultas} ${grupo.origem === "rota" ? "oculto" : "oculta"}${ocultas > 1 ? "s" : ""})`
          : "")
    );
  }

  if (grupo.videos.length > 0) {
    const ocultos = grupo.videos.filter((v) => !v.visivel).length;
    partes.push(
      `${grupo.videos.length} ${grupo.videos.length === 1 ? "vídeo" : "vídeos"}` +
        (ocultos > 0 ? ` (${ocultos} oculto${ocultos > 1 ? "s" : ""})` : "")
    );
  }

  // território (ou rota) sem mídia também ganha grupo: o resumo diz o que falta
  if (partes.length === 0) {
    return grupo.origem === "rota" ? "sem mapa" : "sem foto nem vídeo de apoio";
  }

  return partes.join(" · ");
}

/**
 * Rotas com as imagens de mapa de cada uma, na ordem do painel — inclusive as
 * que ainda não têm mapa (a autoria precisa achá-las na lista).
 *
 * A logo da rota NÃO entra: ela é um endereço só (`logo`), sem controle de
 * visibilidade item por item — para tirá-la do ar existe o "Remover logo" na
 * aba Rotas.
 */
export function gruposDasRotas(roteiros: Roteiro[] | undefined): GrupoMidias[] {
  return (roteiros ?? [])
    .slice()
    .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0) || a.nome.localeCompare(b.nome, "pt-BR"))
    .map((roteiro) => ({
      origem: "rota" as const,
      chave: roteiro.id,
      nome: roteiro.nome,
      caminho: `/percurso/${roteiro.id}`,
      foraDoAr: roteiro.ativo === false,
      fotos: itensDasFotos(roteiro.mapas, "mapa da rota", "mapa"),
      videos: [],
    }));
}

/** Todas as mídias do grupo, com a foto antes do vídeo (ordem de leitura). */
export function itensDoGrupo(grupo: GrupoMidias): ItemMidiaPainel[] {
  return [...grupo.fotos, ...grupo.videos];
}

/** Contagem do topo da tela: quantas mídias existem e quantas estão ocultas. */
export function totalDasMidias(grupos: GrupoMidias[]): {
  fotos: number;
  videos: number;
  ocultas: number;
} {
  const itens = grupos.flatMap(itensDoGrupo);

  return {
    fotos: itens.filter((i) => i.tipo === "foto").length,
    videos: itens.filter((i) => i.tipo === "video").length,
    ocultas: itens.filter((i) => !i.visivel).length,
  };
}

/** Nomes dos territórios que não têm nenhuma mídia (para avisar no fim da tela). */
export function territoriosSemMidia(territorios: Record<string, Territorio>): string[] {
  return Object.values(territorios ?? {})
    .filter((t) => itensDasFotos(t.fotos, "").length + itensDosVideos(t.videos).length === 0)
    .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0) || a.nome.localeCompare(b.nome, "pt-BR"))
    .map((t) => t.nome);
}

/** Identificador estável de um item (chave do grupo + endereço da mídia). */
export function idDoItem(grupo: GrupoMidias, item: ItemMidiaPainel): string {
  return `${grupo.chave}|${item.tipo}|${item.url}`;
}
