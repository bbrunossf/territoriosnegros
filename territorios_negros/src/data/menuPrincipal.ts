// src/data/menuPrincipal.ts
//
// O item "Mais" da barra de navegação do app abre esta lista: são as páginas que
// NÃO têm item próprio na barra e, sem ela, só se alcançava navegando dentro de
// outras telas (pedido da autoria, 02/10/2026).
//
// É dado puro: a barra (BottomNav.tsx) só desenha o que está aqui. Para incluir
// ou tirar uma página, mexa nesta lista — nada mais.

export interface PaginaDoMenu {
  nome: string;
  caminho: string;
  /** o mesmo tipo de símbolo usado nos itens fixos da barra */
  icone: string;
}

export const PAGINAS_DO_MENU: PaginaDoMenu[] = [
  { nome: "Apoiadores", caminho: "/apoiadores", icone: "✦" },
  { nome: "A cidade de Vitória - ES", caminho: "/vitoria", icone: "◈" },
  { nome: "Base teórica", caminho: "/conceito", icone: "◎" },
  { nome: "Enviar uma mensagem", caminho: "/contato", icone: "✉" },
];

/**
 * Página do próximo evento: entra na lista SÓ quando há um evento agendado (é a
 * informação com prazo — e sem evento a página só diria que não há nada).
 */
export const PAGINA_DO_EVENTO: PaginaDoMenu = {
  nome: "Próximo evento",
  caminho: "/evento",
  icone: "★",
};

/**
 * A lista como o visitante vê: as páginas fixas e, quando há evento agendado, o
 * evento no topo (é o que tem data marcada).
 */
export function paginasDoMenu(temEvento: boolean): PaginaDoMenu[] {
  return temEvento ? [PAGINA_DO_EVENTO, ...PAGINAS_DO_MENU] : [...PAGINAS_DO_MENU];
}

/** Nome do item da barra que abre a lista. */
export const NOME_DO_ITEM = "Mais";
