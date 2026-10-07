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

/** Nome do item da barra que abre a lista. */
export const NOME_DO_ITEM = "Mais";
