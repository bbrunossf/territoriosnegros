// src/data/botoesDoApp.ts
//
// Os botões de navegação do app — todos os que são do app (não os que a autoria
// cria em Páginas). Cada grupo tem a sua chave em app_config, com os NOMES que a
// autoria escolhe no painel (aba Botões):
//
//   · botoes_intro        — os seis botões que fecham as páginas de texto
//   · barra_navegacao     — os itens da barra do pé da tela
//   · atalhos_paginas     — os atalhos fixos dentro das telas
//
// A ORDEM e os DESTINOS são do app (o painel não muda para onde cada botão leva:
// isso é navegação, e um ajuste de texto não pode deixar o visitante em tela
// errada). O que a autoria muda é o NOME de cada botão.
//
// Nome em branco = volta ao padrão. Nada é gravado sem "Salvar alterações".
import { ordenarIds } from "../utils/ordem";
import { BOTOES_DA_INTRO, CHAVE_BOTOES_INTRO } from "./botoesIntro";

export { CHAVE_BOTOES_INTRO };

/** Nomes dos itens da barra de navegação (pé da tela). */
export const CHAVE_BARRA_NAVEGACAO = "barra_navegacao";

/** Nomes dos atalhos fixos dentro das telas. */
export const CHAVE_ATALHOS_PAGINAS = "atalhos_paginas";

/**
 * A ORDEM dos botões, por grupo (pedido da autoria, 02/10/2026): ela move os
 * botões com ↑ ↓ na aba Botões e o app desenha naquela ordem.
 * Formato: { paginas: ["/roteiros", "/conceito", ...], barra: [...], atalhos: [...] }
 * Id que não estiver na lista entra depois dos listados, na ordem padrão — nada
 * desaparece por causa de uma ordem antiga.
 */
export const CHAVE_ORDEM_BOTOES = "ordem_botoes";

export interface ItemDeBotoes {
  /** o que fica gravado em app_config (chave do item dentro do grupo) */
  id: string;
  /** nome padrão, o que está publicado hoje */
  padrao: string;
  /** para onde o botão leva */
  destino: string;
  /** onde ele aparece no app (dica cinza do painel) */
  onde: string;
  /** exemplo de outro nome, para o campo não parecer o nome do campo */
  exemplo?: string;
}

export interface GrupoDeBotoes {
  id: string;
  chave: string;
  titulo: string;
  ajuda: string;
  itens: ItemDeBotoes[];
}

const FIM_DAS_PAGINAS = "no fim da tela Antes de caminhar, da Base teórica e da Presença Negra na Cidade";
const TOPO_DA_CIDADE = "no topo da página A cidade de Vitória";

export const GRUPOS_DE_BOTOES: GrupoDeBotoes[] = [
  {
    id: "paginas",
    chave: CHAVE_BOTOES_INTRO,
    titulo: "Botões que fecham as páginas",
    ajuda:
      "Os seis botões que aparecem no fim das páginas de leitura, sempre nesta ordem — e depois deles, separado por um respiro maior, o “Enviar uma mensagem”. Cada um leva para a sua página; aqui você muda só o nome que o visitante lê.",
    itens: BOTOES_DA_INTRO.map((botao) => ({
      id: botao.url,
      padrao: botao.texto,
      destino: botao.url,
      onde: FIM_DAS_PAGINAS,
      exemplo: "Ex: Teoria e fundamentos",
    })),
  },
  {
    id: "barra",
    chave: CHAVE_BARRA_NAVEGACAO,
    titulo: "Barra de navegação (pé da tela)",
    ajuda:
      "Os itens da barra que o visitante vê em toda tela. Os símbolos e a ordem são do app; aqui você muda o nome de cada um.",
    itens: [
      { id: "/", padrao: "Início", destino: "/", onde: "primeiro item da barra", exemplo: "Ex: Começo" },
      {
        id: "/presenca-negra",
        padrao: "Vitória Negra",
        destino: "/presenca-negra",
        onde: "segundo item da barra",
        exemplo: "Ex: Negritude capixaba",
      },
      { id: "/conceito", padrao: "Conceito", destino: "/conceito", onde: "terceiro item da barra", exemplo: "Ex: Fundamentos" },
      { id: "/roteiros", padrao: "Rotas", destino: "/roteiros", onde: "quarto item da barra", exemplo: "Ex: Percursos" },
      {
        id: "/territorios",
        padrao: "Territórios",
        destino: "/territorios",
        onde: "quinto item da barra",
        exemplo: "Ex: Lugares de memória",
      },
      { id: "mais", padrao: "Mais", destino: "abre a lista de páginas", onde: "último item da barra", exemplo: "Ex: Outras páginas" },
    ],
  },
  {
    id: "atalhos",
    chave: CHAVE_ATALHOS_PAGINAS,
    titulo: "Atalhos dentro das telas",
    ajuda:
      "Os botões fixos que aparecem no alto de algumas telas para o visitante seguir viagem. Cada um leva para a sua página; aqui você muda só o nome.",
    itens: [
      {
        id: "ir-para-base-teorica",
        padrao: "Ir para base teórica",
        destino: "/conceito",
        onde: TOPO_DA_CIDADE,
        exemplo: "Ex: Ver a base teórica",
      },
      {
        id: "presenca-na-cidade-de-vitoria",
        padrao: "Presença Negra na Cidade de Vitória",
        destino: "/presenca-negra",
        onde: TOPO_DA_CIDADE,
        exemplo: "Ex: A cidade negra",
      },
      {
        id: "ir-para-os-territorios",
        padrao: "Ir para os territórios",
        destino: "/territorios",
        onde: TOPO_DA_CIDADE,
        exemplo: "Ex: Ver os territórios",
      },
      {
        id: "cidade-de-vitoria",
        padrao: "A cidade de Vitória - ES",
        destino: "/vitoria",
        onde: "nas telas Rotas e Territórios",
        exemplo: "Ex: Conhecer a cidade",
      },
      {
        id: "presenca-negra",
        padrao: "Presença Negra na Cidade",
        destino: "/presenca-negra",
        onde: "nas telas Rotas e Territórios",
        exemplo: "Ex: Vitória negra",
      },
      {
        id: "cidade-no-topo-da-presenca",
        padrao: "A cidade de Vitória",
        destino: "/vitoria",
        onde: "no topo da página Presença Negra na Cidade",
        exemplo: "Ex: Voltar para a cidade",
      },
      {
        id: "apoiadores",
        padrao: "Apoiadores",
        destino: "/apoiadores",
        onde: "nas telas Rotas e Territórios",
        exemplo: "Ex: Quem apoia",
      },
    ],
  },
];

/** O grupo com aquele id (ou nada). */
export function grupoDeBotoes(id: string): GrupoDeBotoes | undefined {
  return GRUPOS_DE_BOTOES.find((g) => g.id === id);
}

/**
 * Lê os nomes gravados pelo painel em um grupo. Defensivo: valor que não é texto
 * e nome vazio são descartados — o app nunca fica com botão sem nome.
 */
export function lerNomesDeBotoes(bruto: unknown): Record<string, string> {
  if (!bruto || typeof bruto !== "object" || Array.isArray(bruto)) return {};

  const lidos: Record<string, string> = {};

  Object.entries(bruto as Record<string, unknown>).forEach(([id, valor]) => {
    if (typeof valor !== "string") return;

    const chave = id.trim();
    const nome = valor.trim().slice(0, 60);

    if (chave && nome) lidos[chave] = nome;
  });

  return lidos;
}

/** O nome daquele botão: o da autoria quando houver, senão o padrão. */
export function nomeDoBotao(
  nomes: Record<string, string>,
  id: string,
  padrao: string
): string {
  return nomes[id] ?? padrao;
}

/** Atalho para os componentes: lê direto do config do app. */
export function rotuloDe(
  config: Record<string, unknown> | undefined,
  chave: string,
  id: string,
  padrao: string
): string {
  return nomeDoBotao(lerNomesDeBotoes(config?.[chave]), id, padrao);
}

/** A ordem gravada para um grupo (lista de ids). Vazio = ordem padrão. */
export function lerOrdemDoGrupo(bruto: unknown, grupoId: string): string[] {
  if (!bruto || typeof bruto !== "object" || Array.isArray(bruto)) return [];

  const valor = (bruto as Record<string, unknown>)[grupoId];

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

/** Os itens de um grupo, já na ordem gravada. */
export function itensNaOrdem(grupo: GrupoDeBotoes, ordem: string[]): ItemDeBotoes[] {
  const ids = ordenarIds(
    grupo.itens.map((i) => i.id),
    ordem
  );

  return ids
    .map((id) => grupo.itens.find((i) => i.id === id))
    .filter((i): i is ItemDeBotoes => !!i);
}

/** A ordem dos itens de um grupo, partindo da ordem padrão. */
export function ordemPadraoDoGrupo(grupo: GrupoDeBotoes): string[] {
  return grupo.itens.map((i) => i.id);
}
