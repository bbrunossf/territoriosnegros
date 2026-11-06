// src/context/dadosContext.ts
// O contexto em si fica neste arquivo (sem componentes) para não misturar
// componentes e hooks no mesmo módulo.

import { createContext } from "react";
import type { Categoria, Roteiro, TerritoriosMap } from "../data/types";
import type { Inscricoes, Tour } from "../data/tours";

export interface DadosContextType {
  /** todos os territórios (inclusive os desativados, o painel usa) */
  territorios: TerritoriosMap;
  /** somente as rotas ativas, na ordem do painel */
  roteiros: Roteiro[];
  /** todas as rotas (inclusive desativadas, o painel usa) */
  todosRoteiros: Roteiro[];
  categorias: Categoria[];
  config: Record<string, unknown>;
  /** aviso de próximo tour pronto para exibir (ou null) */
  proximoTour: Tour | null;
  /** agenda completa de tours (inclusive os que já passaram, o painel usa) */
  tours: Tour[];
  /** tours no ar agora, do mais próximo para o mais distante */
  toursEmCartaz: Tour[];
  /** regras dos botões de inscrição e o aviso de inscrições encerradas */
  inscricoes: Inscricoes;
  /** link da ficha de inscrição (geral) */
  inscricaoUrl: string;
  /** ids dos territórios visíveis, na ordem definida no painel */
  ordemTerritoriosVisual: string[];
  carregando: boolean;
  erro: string | null;
  recarregar: () => Promise<void>;
}

export const DadosCtx = createContext<DadosContextType>({
  territorios: {},
  roteiros: [],
  todosRoteiros: [],
  categorias: [],
  config: {},
  proximoTour: null,
  tours: [],
  toursEmCartaz: [],
  inscricoes: { cartao: true, ficha: true, encerradas: false, aviso: "Inscrições encerradas" },
  inscricaoUrl: "",
  ordemTerritoriosVisual: [],
  carregando: true,
  erro: null,
  recarregar: async () => {},
});
