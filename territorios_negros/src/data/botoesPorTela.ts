// src/data/botoesPorTela.ts
//
// Botões de navegação DENTRO das telas, com controle por tela (pedido da
// autoria, 02/10/2026): *"em todas as páginas do app eu possa ter no topo da
// página ou no final da página botões que direcionem os usuários para as outras
// páginas e sessões disponíveis, porem eu podendo habilitar e desabilitar quais
// aparecem em cada página"*.
//
// Modelo, em uma frase: existe UM catálogo de botões de navegação; a autoria
// liga/desliga cada um (vale no app inteiro) e escolhe, em cada tela, quais
// aparecem — no topo, no final, ou nos dois — e em que ordem.
//
// O que está gravado em app_config:
//   · "botoes_desligados"  → ["personalidades", ...]        (botões fora do ar)
//   · "atalhos_por_tela"   → { vitoria: { topo: [...], final: [...] }, ... }
// Sem nada gravado, vale o padrão — que é exatamente o que está publicado hoje.

import {
  CHAVE_ATALHOS_PAGINAS,
  CHAVE_BOTOES_INTRO,
  lerNomesDeBotoes,
  type GrupoDeBotoes,
} from "./botoesDoApp";
import type { BotaoConteudo } from "./paginas";

export const CHAVE_ATALHOS_POR_TELA = "atalhos_por_tela";
export const CHAVE_BOTOES_DESLIGADOS = "botoes_desligados";

export interface BotaoDoCatalogo {
  /** id usado nas listas por tela */
  id: string;
  /** nome quando ninguém renomeou nada */
  padrao: string;
  /** para onde leva */
  destino: string;
  /** id dentro de app_config.atalhos_paginas (o nome da aba Botões) */
  idDoNome: string;
  /** quando o mesmo botão é um dos que fecham as páginas, o caminho em botoes_intro */
  caminhoNoIntro?: string;
  exemplo?: string;
}

/**
 * Os botões de navegação que podem ser colocados em qualquer tela.
 * A ordem aqui é só a ordem em que o painel os apresenta.
 */
export const CATALOGO_DE_NAVEGACAO: BotaoDoCatalogo[] = [
  {
    id: "inicio",
    padrao: "Início",
    destino: "/",
    idDoNome: "inicio",
    exemplo: "Ex: Começo",
  },
  {
    id: "base-teorica",
    padrao: "Base teórica",
    destino: "/conceito",
    idDoNome: "ir-para-base-teorica",
    caminhoNoIntro: "/conceito",
    exemplo: "Ex: Conceitos",
  },
  {
    id: "cidade-de-vitoria",
    padrao: "A cidade de Vitória",
    destino: "/vitoria",
    idDoNome: "cidade-de-vitoria",
    caminhoNoIntro: "/vitoria",
    exemplo: "Ex: A cidade",
  },
  {
    id: "presenca-negra",
    padrao: "Presença Negra",
    destino: "/presenca-negra",
    idDoNome: "presenca-negra",
    caminhoNoIntro: "/presenca-negra",
    exemplo: "Ex: Vitória Negra",
  },
  {
    id: "roteiros",
    padrao: "Rotas",
    destino: "/roteiros",
    idDoNome: "roteiros",
    caminhoNoIntro: "/roteiros",
    exemplo: "Ex: Rotas guiadas",
  },
  {
    id: "territorios",
    padrao: "Territórios",
    destino: "/territorios",
    idDoNome: "ir-para-os-territorios",
    caminhoNoIntro: "/territorios",
    exemplo: "Ex: Lugares",
  },
  {
    id: "apoiadores",
    padrao: "Apoiadores",
    destino: "/apoiadores",
    idDoNome: "apoiadores",
    caminhoNoIntro: "/apoiadores",
    exemplo: "Ex: Quem apoia",
  },
  {
    id: "personalidades",
    padrao: "Personalidades",
    destino: "/personalidades",
    idDoNome: "personalidades",
    exemplo: "Ex: Trajetórias negras",
  },
];

export function catalogoPorId(id: string): BotaoDoCatalogo | undefined {
  return CATALOGO_DE_NAVEGACAO.find((b) => b.id === id);
}

/** O botão de navegação que leva a este endereço (se houver). */
export function catalogoPeloDestino(destino: string): BotaoDoCatalogo | undefined {
  const limpar = (valor: string) => (valor ?? "").replace(/\/+$/, "").toLowerCase();

  const alvo = limpar(destino);

  return CATALOGO_DE_NAVEGACAO.find((b) => limpar(b.destino) === alvo);
}

export interface TelaDoApp {
  id: string;
  nome: string;
  onde: string;
  /** onde os botões cabem nesta tela. Desde 14/10/2026 **todas** as telas
   *  recebem as duas posições: o "topo" é desenhado logo abaixo do título e o
   *  "final" antes do "Enviar uma mensagem" (ver `BotoesFinaisDaTela`). */
  slots: ("topo" | "final")[];
  /** aviso extra mostrado no painel, só quando a tela precisa (opcional) */
  aviso?: string;
}

/**
 * As telas do app que podem receber botões de navegação. Até 14/10/2026 estavam
 * aqui só as páginas de texto (o passeio guiado ficava de fora de propósito). A
 * autoria pediu controle sobre **todas** as páginas — inclusive as criadas depois
 * da aba Botões (evento, ficha, personalidades, percurso, território, fim) e as
 * que hoje não têm botões, para poder inserir botões nelas no futuro. As telas
 * novas entram com o slot **final** e sem padrão (vazio = nada muda no app).
 */
export const TELAS_DO_APP: TelaDoApp[] = [
  { id: "intro", nome: "Antes de caminhar", onde: "página de abertura do passeio", slots: ["topo", "final"] },
  { id: "conceito", nome: "Base teórica", onde: "o texto que sustenta o projeto", slots: ["topo", "final"] },
  { id: "vitoria", nome: "A cidade de Vitória", onde: "a página da cidade", slots: ["topo", "final"] },
  {
    id: "presenca-negra",
    nome: "Presença Negra na Cidade",
    onde: "a página da presença negra",
    slots: ["topo", "final"],
  },
  { id: "roteiros", nome: "Rotas", onde: "a lista de rotas", slots: ["topo", "final"] },
  { id: "territorios", nome: "Territórios", onde: "a lista de territórios", slots: ["topo", "final"] },
  {
    id: "personalidades",
    nome: "Personalidades",
    onde: "a lista de personalidades negras",
    slots: ["topo", "final"],
  },
  { id: "apoiadores", nome: "Apoiadores", onde: "quem apoia o projeto", slots: ["topo", "final"] },
  { id: "contato", nome: "Contato", onde: "a página de contato", slots: ["topo", "final"] },
  // telas criadas depois da aba Botões — também recebem topo e final desde
  // 14/10/2026 (pedido da autoria: inserir e remover em todas as páginas)
  { id: "evento", nome: "Próximo evento", onde: "a página do evento e da inscrição", slots: ["topo", "final"] },
  { id: "ficha", nome: "Ficha de inscrição", onde: "o formulário aberto dentro do app", slots: ["topo", "final"] },
  {
    id: "personalidade",
    nome: "Página de uma personalidade",
    onde: "a ficha de cada personalidade",
    slots: ["topo", "final"],
    aviso:
      "Esta ficha não tem botão fixo no topo: o caminho de volta fica no menu e na barra de navegação. Se quiser um botão ali, adicione “Personalidades” em NO TOPO DA PÁGINA.",
  },
  { id: "percurso", nome: "Percurso de uma rota", onde: "o caminho de cada rota", slots: ["topo", "final"] },
  { id: "territorio", nome: "Página de um território", onde: "a ficha de cada território", slots: ["topo", "final"] },
  { id: "fim", nome: "Fim do passeio", onde: "a tela de encerramento", slots: ["topo", "final"] },
];

export interface ListaDaTela {
  topo: string[];
  final: string[];
}

/**
 * O padrão de cada tela — é exatamente o que o app mostra hoje, para nada mudar
 * sem a autoria mandar.
 */
export const PADRAO_POR_TELA: Record<string, ListaDaTela> = {
  intro: {
    topo: [],
    final: [
      "base-teorica",
      "cidade-de-vitoria",
      "presenca-negra",
      "roteiros",
      "territorios",
      "apoiadores",
    ],
  },
  conceito: {
    topo: [],
    final: [
      "base-teorica",
      "cidade-de-vitoria",
      "presenca-negra",
      "roteiros",
      "territorios",
      "apoiadores",
    ],
  },
  "presenca-negra": {
    topo: ["cidade-de-vitoria", "personalidades"],
    final: [
      "base-teorica",
      "cidade-de-vitoria",
      "presenca-negra",
      "roteiros",
      "territorios",
      "apoiadores",
    ],
  },
  vitoria: {
    topo: ["base-teorica", "presenca-negra", "territorios"],
    final: [],
  },
  roteiros: {
    topo: ["cidade-de-vitoria", "presenca-negra", "apoiadores"],
    final: [],
  },
  territorios: {
    topo: ["cidade-de-vitoria", "presenca-negra", "apoiadores"],
    final: [],
  },
  personalidades: { topo: [], final: [] },
  apoiadores: { topo: [], final: [] },
  contato: { topo: ["inicio", "roteiros"], final: [] },
};

/** O nome do botão: o que a autoria gravou (na aba Botões) ou o padrão. */
export function nomeDoCatalogo(
  config: Record<string, unknown> | undefined,
  entrada: BotaoDoCatalogo
): string {
  const dasPaginas = entrada.caminhoNoIntro
    ? lerNomesDeBotoes(config?.[CHAVE_BOTOES_INTRO])[entrada.caminhoNoIntro]
    : undefined;

  const dosAtalhos = lerNomesDeBotoes(config?.[CHAVE_ATALHOS_PAGINAS])[entrada.idDoNome];

  return (dasPaginas?.trim() || dosAtalhos?.trim() || entrada.padrao).trim();
}

// ── leitura defensiva ─────────────────────────────────────────────────

function listaDeIds(valor: unknown): string[] {
  if (!Array.isArray(valor)) return [];

  const ids: string[] = [];

  valor.forEach((id) => {
    if (typeof id === "string") {
      const limpo = id.trim();
      if (limpo && !ids.includes(limpo)) ids.push(limpo);
    }
  });

  return ids;
}

/** Os botões desligados (fora do ar no app inteiro). */
export function lerDesligados(bruto: unknown): string[] {
  return listaDeIds(bruto).filter((id) => !!catalogoPorId(id));
}

export function estaDesligado(
  config: Record<string, unknown> | undefined,
  id: string
): boolean {
  return lerDesligados(config?.[CHAVE_BOTOES_DESLIGADOS]).includes(id);
}

/** As listas gravadas por tela (só o que a autoria mexeu). */
export function lerAtalhosPorTela(
  bruto: unknown
): Record<string, ListaDaTela> {
  if (!bruto || typeof bruto !== "object" || Array.isArray(bruto)) return {};

  const saida: Record<string, ListaDaTela> = {};

  Object.keys(bruto as Record<string, unknown>).forEach((tela) => {
    const valor = (bruto as Record<string, unknown>)[tela];

    if (!valor || typeof valor !== "object" || Array.isArray(valor)) return;

    const o = valor as Record<string, unknown>;

    saida[tela] = { topo: listaDeIds(o.topo), final: listaDeIds(o.final) };
  });

  return saida;
}

/** Deixa só o que existe no catálogo e não está desligado. */
function limparLista(ids: string[], desligados: string[]): string[] {
  return ids.filter((id) => !!catalogoPorId(id) && !desligados.includes(id));
}

/**
 * O que aparece numa tela, num dos dois lugares (topo ou final).
 * Prioridade: o que a autoria gravou; sem nada gravado, o padrão do app.
 * Botão desligado nunca aparece; botão que levaria para a própria tela também
 * não (ver `filtrarPropriaTela`).
 */
export function atalhosDaTela(
  config: Record<string, unknown> | undefined,
  tela: string,
  posicao: "topo" | "final"
): string[] {
  const gravado = lerAtalhosPorTela(config?.[CHAVE_ATALHOS_POR_TELA])[tela];
  const desligados = lerDesligados(config?.[CHAVE_BOTOES_DESLIGADOS]);

  const lista = gravado ? gravado[posicao] : PADRAO_POR_TELA[tela]?.[posicao] ?? [];

  return limparLista(lista, desligados);
}

/** Tira o botão que levaria para a tela em que o visitante já está. */
export function filtrarPropriaTela(
  ids: string[],
  destinoDaTela: string
): string[] {
  const alvo = destinoDaTela.replace(/\/+$/, "").toLowerCase();

  return ids.filter((id) => (catalogoPorId(id)?.destino ?? "").replace(/\/+$/, "").toLowerCase() !== alvo);
}

/** Endereço de cada tela — para não desenhar um botão que leva a ela mesma. */
export const DESTINO_DA_TELA: Record<string, string> = {
  intro: "/intro",
  conceito: "/conceito",
  vitoria: "/vitoria",
  "presenca-negra": "/presenca-negra",
  roteiros: "/roteiros",
  territorios: "/territorios",
  personalidades: "/personalidades",
  apoiadores: "/apoiadores",
  contato: "/contato",
  // telas do passeio guiado e as criadas depois da aba Botões
  evento: "/evento",
  ficha: "/evento/ficha",
  personalidade: "/personalidade",
  percurso: "/percurso",
  territorio: "/territorio",
  fim: "/fim",
};

/** Os botões que ainda não estão nesta lista (para o seletor do painel). */
export function disponiveisPara(lista: string[]): BotaoDoCatalogo[] {
  return CATALOGO_DE_NAVEGACAO.filter((b) => !lista.includes(b.id));
}

/** Reescreve uma lista (usada pelo painel ao adicionar, remover e reordenar). */
export function comBotao(lista: string[], id: string): string[] {
  return lista.includes(id) ? lista : [...lista, id];
}

export function semBotao(lista: string[], id: string): string[] {
  return lista.filter((i) => i !== id);
}

/**
 * O nome de um botão que veio do painel (Páginas), já no padrão do app:
 *   · se ele leva a um destino do catálogo, vale o NOME do catálogo (é o que faz
 *     o botão ficar igual aos da Base teórica — nada de "Ir para…" sobrando);
 *   · se leva a outro lugar, tira o "Ir para…" do começo e deixa a inicial
 *     maiúscula ("Ir para a linha do tempo" → "Linha do tempo").
 */
export function rotuloDeBotaoDaPagina(
  config: Record<string, unknown> | undefined,
  url: string,
  texto: string
): string {
  const doCatalogo = catalogoPeloDestino(url ?? "");

  if (doCatalogo) return nomeDoCatalogo(config, doCatalogo);

  return semIrPara(texto ?? "");
}

/** Tira o "Ir para…" do começo do rótulo, sem deixar artigo solto. */
export function semIrPara(texto: string): string {
  const limpo = (texto ?? "").trim();

  const semPrefixo = limpo
    .replace(/^\s*ir\s+para\s+(o\s+|a\s+|os\s+|as\s+|ao\s+|à\s+)?/i, "")
    .trim();

  if (!semPrefixo || semPrefixo === limpo) return limpo;

  // devolve a inicial maiúscula e, com ela, acentuação que a autoria já escreveu
  return semPrefixo.charAt(0).toUpperCase() + semPrefixo.slice(1);
}

/** Quantos lugares (telas × topo/final) usam este botão — resumo do painel. */
export function ondeAparece(
  config: Record<string, unknown> | undefined,
  id: string
): string[] {
  const gravado = lerAtalhosPorTela(config?.[CHAVE_ATALHOS_POR_TELA]);
  const desligados = lerDesligados(config?.[CHAVE_BOTOES_DESLIGADOS]);

  if (desligados.includes(id)) return [];

  const lugares: string[] = [];

  TELAS_DO_APP.forEach((tela) => {
    const doPainel = gravado[tela.id];
    const padrao = PADRAO_POR_TELA[tela.id] ?? { topo: [], final: [] };

    const topo = filtrarPropriaTela(
      limparLista(doPainel ? doPainel.topo : padrao.topo, desligados),
      DESTINO_DA_TELA[tela.id] ?? ""
    );

    const final = filtrarPropriaTela(
      limparLista(doPainel ? doPainel.final : padrao.final, desligados),
      DESTINO_DA_TELA[tela.id] ?? ""
    );

    if (topo.includes(id)) lugares.push(`${tela.nome} (topo)`);
    if (final.includes(id)) lugares.push(`${tela.nome} (final)`);
  });

  return lugares;
}

/** Um grupo de nomes, como o painel mostra (usado na aba Botões). */
export type GrupoDeNomes = GrupoDeBotoes;

/**
 * O nome de um botão pelo seu id, sem precisar da entrada inteira.
 * Id fora do catálogo (os antigos, que continuam válidos na aba Botões) cai no
 * nome gravado em atalhos_paginas.
 */
export function rotuloDoCatalogo(
  config: Record<string, unknown> | undefined,
  id: string,
  padrao = ""
): string {
  const entrada = catalogoPorId(id);

  if (entrada) return nomeDoCatalogo(config, entrada);

  return lerNomesDeBotoes(config?.[CHAVE_ATALHOS_PAGINAS])[id]?.trim() || padrao;
}

/**
 * Os botões que fecham uma página (Antes, Base teórica, Presença Negra): o que a
 * autoria escolheu no painel, mais os botões que ela criou em Páginas para outros
 * endereços — sem repetir destino e sem o "Enviar uma mensagem" (esse é do app).
 */
export function botoesDaPagina(
  config: Record<string, unknown> | undefined,
  tela: string,
  extras: BotaoConteudo[] = []
): BotaoConteudo[] {
  const ids = filtrarPropriaTela(
    atalhosDaTela(config, tela, "final"),
    DESTINO_DA_TELA[tela] ?? ""
  );

  const fixos: BotaoConteudo[] = ids
    .map((id) => catalogoPorId(id))
    .filter((e): e is BotaoDoCatalogo => !!e)
    .map((e) => ({ texto: nomeDoCatalogo(config, e), url: e.destino, estilo: "btn" as const }));

  // um botão do painel que repetiria um destino que já está na tela (no topo ou
  // no final) não entra de novo — o visitante não vê dois botões iguais
  const jaNaTela = [
    ...fixos.map((b) => b.url),
    ...atalhosDaTela(config, tela, "topo")
      .map((id) => catalogoPorId(id)?.destino ?? "")
      .filter(Boolean),
  ];

  const outros = (extras ?? []).filter((b) => {
    const destino = (b.url ?? "").trim().toLowerCase();

    if (!destino || destino === "/contato") return false;
    if (jaNaTela.some((d) => d.toLowerCase() === destino)) return false;

    return true;
  });

  return [...fixos, ...outros];
}
