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

/** Gera o id (slug) a partir de um nome digitado no painel. */
export function gerarSlug(nome: string): string {
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
