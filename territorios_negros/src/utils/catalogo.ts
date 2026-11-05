// src/utils/catalogo.ts
// Regras de exibição do catálogo (ordem, agrupamento por categoria e
// quais pontos de uma rota estão visíveis para o público).

import type { Categoria, Roteiro, Territorio, TerritoriosMap } from "../data/types";

/** Ordem das categorias por `ordem` (empate: nome) */
export function ordenarCategorias(categorias: Categoria[]): Categoria[] {
  return [...categorias].sort(
    (a, b) => (a.ordem ?? 0) - (b.ordem ?? 0) || a.nome.localeCompare(b.nome, "pt-BR")
  );
}

/**
 * Territórios como devem aparecer para o visitante:
 * só os ativos, agrupados pela ordem da categoria, depois `ordem`, depois nome.
 */
export function ordenarTerritorios(
  territorios: TerritoriosMap,
  categorias: Categoria[]
): Territorio[] {
  const ordemCategoria = new Map<string, number>();
  ordenarCategorias(categorias).forEach((c, i) => ordemCategoria.set(c.id, c.ordem ?? i));

  return Object.values(territorios)
    .filter((t) => t.ativo !== false)
    .sort((a, b) => {
      const ca = a.categoria ? ordemCategoria.get(a.categoria) ?? 999 : 999;
      const cb = b.categoria ? ordemCategoria.get(b.categoria) ?? 999 : 999;
      return (
        ca - cb ||
        (a.ordem ?? 0) - (b.ordem ?? 0) ||
        a.nome.localeCompare(b.nome, "pt-BR")
      );
    });
}

export interface GrupoTerritorios {
  id: string;
  titulo: string;
  /** imagem da categoria, quando a autoria enviou uma no painel */
  simbolo?: string | null;
  territorios: Territorio[];
}

/** Agrupa os territórios visíveis por categoria, na ordem definida no painel. */
export function agruparPorCategoria(
  territorios: TerritoriosMap,
  categorias: Categoria[]
): GrupoTerritorios[] {
  const visiveis = ordenarTerritorios(territorios, categorias);

  const grupos: GrupoTerritorios[] = ordenarCategorias(categorias)
    .map((c) => ({
      id: c.id,
      titulo: c.nome,
      territorios: visiveis.filter((t) => t.categoria === c.id),
    }))
    .filter((g) => g.territorios.length > 0);

  const semCategoria = visiveis.filter(
    (t) => !t.categoria || !categorias.some((c) => c.id === t.categoria)
  );

  if (semCategoria.length > 0) {
    grupos.push({
      id: "sem-categoria",
      titulo: "Outros territórios",
      territorios: semCategoria,
    });
  }

  return grupos;
}

/** Rotas visíveis para o público (ativas), na ordem do painel. */
export function roteirosVisiveis(roteiros: Roteiro[]): Roteiro[] {
  return roteiros
    .filter((r) => r.ativo !== false)
    .sort(
      (a, b) => (a.ordem ?? 0) - (b.ordem ?? 0) || a.nome.localeCompare(b.nome, "pt-BR")
    );
}

/**
 * Pontos de uma rota que devem aparecer: mantém a ordem de visitação definida
 * no painel e ignora territórios desativados (para o índice da rota não quebrar).
 */
export function pontosVisiveis(
  pontos: string[] | undefined,
  territorios: TerritoriosMap
): Territorio[] {
  return (pontos ?? [])
    .map((id) => territorios[id])
    .filter((t): t is Territorio => !!t && t.ativo !== false);
}

/**
 * Ids dos territórios que o visitante encontra em alguma rota ativa.
 * Sai da mesma lista que o percurso numera (`pontosVisiveis`), então território
 * desabilitado não conta.
 */
export function idsDasRotasAtivas(
  roteiros: Roteiro[],
  territorios: TerritoriosMap
): Set<string> {
  const ids = new Set<string>();

  for (const rota of roteirosVisiveis(roteiros)) {
    for (const territorio of pontosVisiveis(rota.pontos, territorios)) {
      ids.add(territorio.id);
    }
  }

  return ids;
}

/**
 * Territórios que a lista de Territórios mostra (14/10/2026, relato da autoria:
 * um território habilitado fora da rota apareceu no meio do guia).
 *
 * Regra: havendo QUALQUER rota ativa, só entram os territórios dela(s) — o guia
 * não pode misturar pontos que a visita não percorre. Sem rota ativa, todos os
 * habilitados aparecem, livres.
 */
export function territoriosNoAr(
  territorios: TerritoriosMap,
  roteiros: Roteiro[]
): TerritoriosMap {
  const temRotaAtiva = roteirosVisiveis(roteiros).length > 0;
  const ids = temRotaAtiva ? idsDasRotasAtivas(roteiros, territorios) : null;

  const saida: TerritoriosMap = {};

  for (const [id, territorio] of Object.entries(territorios)) {
    if (territorio.ativo === false) continue;
    if (ids && !ids.has(id)) continue;

    saida[id] = territorio;
  }

  return saida;
}

/**
 * Endereço de um território para o visitante (14/10/2026, pedido da autoria).
 *
 * Se o território faz parte de alguma rota ativa, o link abre o território
 * DENTRO do percurso (`/percurso/{rota}/{indice}`) — o visitante chega pela
 * visita guiada, com a ordem e o contexto da rota. Só quando ele não está em
 * nenhuma rota ativa o link cai na página do território (`/territorio/{id}`).
 *
 * O índice é o da lista que o percurso realmente mostra (`pontosVisiveis`):
 * território desativado sai da lista e não desloca o número dos outros.
 */
export function enderecoDoTerritorio(
  territorioId: string,
  roteiros: Roteiro[],
  territorios: TerritoriosMap
): string {
  const rota = roteiros
    .filter((r) => r.ativo !== false)
    .map((r) => ({ id: r.id, pontos: pontosVisiveis(r.pontos, territorios) }))
    .find(({ pontos }) => pontos.some((t) => t.id === territorioId));

  if (rota) {
    const indice = rota.pontos.findIndex((t) => t.id === territorioId);

    if (indice >= 0) return `/percurso/${rota.id}/${indice}`;
  }

  return `/territorio/${territorioId}`;
}

/** Gera o id (slug) a partir de um nome digitado no painel. */
export function gerarSlug(nome: string): string {
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
