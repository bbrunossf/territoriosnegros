// src/data/menuPrincipal.ts
//
// O item "Mais" da barra de navegação do app abre esta lista: as páginas que NÃO
// têm item próprio na barra e que, sem ela, só se alcançavam navegando dentro de
// outras telas (pedido da autoria, 02/10/2026).
//
// Duas partes:
//   · CATALOGO_DE_PAGINAS — as páginas do app que PODEM entrar na lista. É fixo no
//     código de propósito: só endereços que existem de verdade, com o símbolo de
//     cada uma. (Não é texto livre: um endereço errado levaria o visitante a uma
//     tela em branco.)
//   · a lista em si, que a autoria monta no painel (aba Menu Mais) e fica gravada
//     em app_config, na chave "menu_mais".
//
// Nada vai ao ar sem "Salvar alterações" na aba. Enquanto nada estiver gravado, o
// app mostra a lista padrão (a que já está publicada).

/** Chave em app_config. */
export const CHAVE_MENU_MAIS = "menu_mais";

export interface PaginaDoCatalogo {
  caminho: string;
  nome: string;
  /** o mesmo tipo de símbolo usado nos itens fixos da barra */
  icone: string;
  /** recado para o painel: regra que essa página carrega */
  observacao?: string;
}

export interface ItemDoMenu {
  id: string;
  nome: string;
  caminho: string;
  icone: string;
  visivel: boolean;
}

/**
 * Páginas do app que podem entrar na lista. Inclui as que já estão na barra — se
 * a autoria quiser repetir ali, é escolha dela.
 */
export const CATALOGO_DE_PAGINAS: PaginaDoCatalogo[] = [
  { caminho: "/", nome: "Página inicial", icone: "⌂" },
  { caminho: "/intro", nome: "Antes de caminhar", icone: "⟲" },
  { caminho: "/roteiros", nome: "Rotas (percursos)", icone: "▱" },
  { caminho: "/territorios", nome: "Territórios", icone: "●" },
  { caminho: "/conceito", nome: "Base teórica", icone: "◎" },
  { caminho: "/vitoria", nome: "A cidade de Vitória - ES", icone: "◈" },
  { caminho: "/presenca-negra", nome: "Presença Negra na Cidade", icone: "✦" },
  { caminho: "/apoiadores", nome: "Apoiadores", icone: "✦" },
  {
    caminho: "/evento",
    nome: "Próximo evento",
    icone: "★",
    observacao: "aparece só quando há evento agendado",
  },
  { caminho: "/contato", nome: "Enviar uma mensagem", icone: "✉" },
];

/** Nome do item da barra que abre a lista. */
export const NOME_DO_ITEM = "Mais";

/** A lista como está publicada hoje (é o ponto de partida de quem abre a aba). */
export const ITENS_PADRAO: ItemDoMenu[] = [
  { id: "menu-evento", nome: "Próximo evento", caminho: "/evento", icone: "★", visivel: true },
  { id: "menu-apoiadores", nome: "Apoiadores", caminho: "/apoiadores", icone: "✦", visivel: true },
  {
    id: "menu-vitoria",
    nome: "A cidade de Vitória - ES",
    caminho: "/vitoria",
    icone: "◈",
    visivel: true,
  },
  {
    id: "menu-presenca-negra",
    nome: "Presença Negra na Cidade",
    caminho: "/presenca-negra",
    icone: "✦",
    visivel: true,
  },
  { id: "menu-conceito", nome: "Base teórica", caminho: "/conceito", icone: "◎", visivel: true },
  {
    id: "menu-contato",
    nome: "Enviar uma mensagem",
    caminho: "/contato",
    icone: "✉",
    visivel: true,
  },
];

/** A página do catálogo com aquele endereço (ou nada, se o endereço não existe). */
export function paginaDoCatalogo(caminho: string): PaginaDoCatalogo | undefined {
  return CATALOGO_DE_PAGINAS.find((p) => p.caminho === caminho);
}

/** Este endereço é uma página do app? (protege a lista de endereço inventado) */
export function caminhoDoApp(caminho: string): boolean {
  return !!paginaDoCatalogo(caminho);
}

/**
 * "Próximo evento" só vale quando há evento agendado: sem evento, a página só
 * diria que não há nada. A regra é do endereço, não da lista — assim a autoria
 * pode tirar e pôr o item, mas o app nunca manda o visitante para uma tela vazia.
 */
export function somenteComEvento(caminho: string): boolean {
  return caminho === "/evento";
}

function texto(valor: unknown, limite = 120): string {
  return typeof valor === "string" ? valor.trim().slice(0, limite) : "";
}

/** Uma linha da lista gravada virou item de verdade? (defensivo, campo por campo) */
function itemValido(bruto: unknown, indice: number): ItemDoMenu | null {
  if (!bruto || typeof bruto !== "object") return null;

  const registro = bruto as Record<string, unknown>;
  const caminho = texto(registro.caminho);
  const pagina = paginaDoCatalogo(caminho);

  // endereço que não é do app: fora (evita item que não leva a lugar nenhum)
  if (!pagina) return null;

  const nome = texto(registro.nome) || pagina.nome;
  const id = texto(registro.id) || `menu-${indice}-${caminho.replace(/\W+/g, "")}`;

  return {
    id,
    nome,
    caminho,
    icone: texto(registro.icone, 4) || pagina.icone,
    visivel: registro.visivel !== false,
  };
}

/**
 * Lê o que está gravado em app_config.menu_mais.
 * Lista vazia ou inválida cai na lista padrão — o app nunca fica sem menu.
 */
export function lerItens(bruto: unknown): ItemDoMenu[] {
  if (!Array.isArray(bruto) || bruto.length === 0) return ITENS_PADRAO.map((i) => ({ ...i }));

  const lidos = bruto
    .map((item, i) => itemValido(item, i))
    .filter((item): item is ItemDoMenu => item !== null);

  // nenhum item aproveitável: volta para a padrão em vez de deixar a lista vazia
  return lidos.length > 0 ? lidos : ITENS_PADRAO.map((i) => ({ ...i }));
}

/** Os itens ligados, na ordem — e o evento só quando há evento agendado. */
export function itensDoMenu(bruto: unknown, temEvento: boolean): ItemDoMenu[] {
  return lerItens(bruto)
    .filter((item) => item.visivel)
    .filter((item) => !somenteComEvento(item.caminho) || temEvento);
}

/** Contador para o id de cada item novo (dois itens criados no mesmo milissegundo
 *  não podem sair com o mesmo id). */
let ultimoContador = 0;

/** Item novo, em branco, para a aba do painel (a autoria escolhe a página depois). */
export function novoItemDoMenu(caminho = ""): ItemDoMenu {
  const pagina = paginaDoCatalogo(caminho);

  ultimoContador += 1;

  const id = `menu-${Date.now().toString(36)}-${ultimoContador}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;

  return {
    id,
    nome: pagina?.nome ?? "",
    caminho,
    icone: pagina?.icone ?? "•",
    visivel: true,
  };
}

/** Páginas do catálogo que ainda não estão na lista (para o seletor "acrescentar"). */
export function paginasLivres(itens: ItemDoMenu[]): PaginaDoCatalogo[] {
  const usados = itens.map((i) => i.caminho);

  return CATALOGO_DE_PAGINAS.filter((p) => !usados.includes(p.caminho));
}

/** Linha da lista no painel: "1. Apoiadores (/apoiadores) — aparecendo". */
export function resumoDoItem(item: ItemDoMenu, indice: number): string {
  const situacao = item.visivel ? "aparecendo" : "desligado";

  return `${indice + 1}. ${item.nome || "(sem nome)"} (${item.caminho || "sem página"}) — ${situacao}`;
}

/** Quantos itens estão ligados agora. */
export function quantosVisiveis(itens: ItemDoMenu[]): number {
  return itens.filter((i) => i.visivel).length;
}
