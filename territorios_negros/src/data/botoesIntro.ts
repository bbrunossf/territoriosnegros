// src/data/botoesIntro.ts
//
// Os botões de navegação do app — os mesmos seis em dois lugares:
//   · no fim da tela "Antes de caminhar"
//   · no fim da página "Base teórica"
// (o segundo, pedido da autoria em 02/10/2026, para o visitante não depender da
// barra para seguir viagem depois de ler a fundamentação)
//
// A ORDEM e os DESTINOS são do app — é uma ordem de navegação, fixa, e assim não
// depende do que estiver gravado no banco:
//
//   1. Base teórica        → /conceito
//   2. A cidade de Vitória → /vitoria
//   3. Presença Negra      → /presenca-negra
//   4. Roteiros            → /roteiros
//   5. Territórios         → /territorios
//   6. Apoiadores          → /apoiadores
//
// e, separado por um respiro maior, o "Enviar uma mensagem" do fim da página.
//
// Os NOMES são da autoria: ela renomeia no painel (aba Botões) e o painel grava
// em app_config, na chave "botoes_intro" — um objeto do tipo
// { "/conceito": "Base teórica", ... }. Nome em branco = volta ao nome padrão.
// Os nomes valem nas duas telas que usam esta lista.
//
// Os botões que a autoria criar no painel para caminhos FORA desta lista
// continuam aparecendo, logo depois destes: nada do painel é escondido.
import type { BotaoConteudo } from "./paginas";

/** Chave em app_config onde ficam os nomes escolhidos pela autoria. */
export const CHAVE_BOTOES_INTRO = "botoes_intro";

export const BOTOES_DA_INTRO: BotaoConteudo[] = [
  { texto: "Base teórica", url: "/conceito", estilo: "btn" },
  { texto: "A cidade de Vitória", url: "/vitoria", estilo: "btn" },
  { texto: "Presença Negra", url: "/presenca-negra", estilo: "btn" },
  { texto: "Roteiros", url: "/roteiros", estilo: "btn" },
  { texto: "Territórios", url: "/territorios", estilo: "btn" },
  { texto: "Apoiadores", url: "/apoiadores", estilo: "btn" },
];

/** Endereço sem a barra do fim, para comparar ("/rotas/" = "/rotas"). */
function limpar(url: string | undefined): string {
  return (url ?? "").trim().replace(/\/+$/, "");
}

/** Os endereços que já têm lugar fixo nesta tela. */
export function caminhosFixosDaIntro(): string[] {
  return BOTOES_DA_INTRO.map((b) => limpar(b.url));
}

/** Nome padrão de um endereço fixo. */
export function nomePadraoDoBotao(caminho: string): string {
  return BOTOES_DA_INTRO.find((b) => limpar(b.url) === limpar(caminho))?.texto ?? "";
}

/**
 * Lê os nomes gravados pelo painel. Defensivo: endereço que não é desta tela e
 * nome vazio são descartados — o app nunca fica com botão sem nome.
 */
export function lerNomes(bruto: unknown): Record<string, string> {
  if (!bruto || typeof bruto !== "object" || Array.isArray(bruto)) return {};

  const fixos = caminhosFixosDaIntro();
  const lidos: Record<string, string> = {};

  Object.entries(bruto as Record<string, unknown>).forEach(([caminho, valor]) => {
    const chave = limpar(caminho);

    if (!fixos.includes(chave)) return;
    if (typeof valor !== "string") return;

    const nome = valor.trim().slice(0, 40);

    if (nome) lidos[chave] = nome;
  });

  return lidos;
}

/**
 * A lista que a tela mostra: os seis botões fixos, na ordem do app, com os nomes
 * da autoria (quando houver) e, depois, os botões que ela criou no painel para
 * outros endereços.
 */
export function botoesDaIntro(
  doPainel: BotaoConteudo[] | undefined,
  nomes: Record<string, string> = {}
): BotaoConteudo[] {
  const fixos = BOTOES_DA_INTRO.map((b) => ({
    ...b,
    texto: nomes[limpar(b.url)] ?? b.texto,
  }));

  const usados = caminhosFixosDaIntro();
  const extras = (doPainel ?? []).filter((b) => !usados.includes(limpar(b.url)));

  return [...fixos, ...extras];
}
