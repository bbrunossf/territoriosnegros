// src/data/botoesIntro.ts
//
// Os botões da tela "Antes de caminhar", na ordem fixada pela autoria
// (02/10/2026):
//
//   1. Ir para base teórica
//   2. A cidade de Vitória - ES
//   3. Presença Negra na Cidade
//   4. Ir para Roteiros
//   5. Ir para Territórios
//   6. Apoiadores
//
// e, separado por um respiro maior, o botão "Enviar uma mensagem" do fim da
// página (esse é do app, desenhado depois deste grupo).
//
// A ordem é do app (não do painel) porque é uma ordem fixa, de navegação — e
// assim ela não depende do que estiver gravado no banco. Os botões que a autoria
// criar no painel para caminhos FORA desta lista continuam aparecendo, logo
// depois destes: nada do painel é escondido.
import type { BotaoConteudo } from "./paginas";

export const BOTOES_DA_INTRO: BotaoConteudo[] = [
  { texto: "Ir para base teórica", url: "/conceito", estilo: "btn" },
  { texto: "A cidade de Vitória - ES", url: "/vitoria", estilo: "btn" },
  { texto: "Presença Negra na Cidade", url: "/presenca-negra", estilo: "btn" },
  { texto: "Ir para Roteiros", url: "/roteiros", estilo: "btn" },
  { texto: "Ir para Territórios", url: "/territorios", estilo: "btn" },
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

/**
 * A lista que a tela mostra: os seis botões fixos, na ordem pedida, e depois os
 * botões que a autoria criou no painel para outros endereços (os que repetem um
 * caminho já fixo não entram — o visitante não vê dois botões iguais).
 */
export function botoesDaIntro(doPainel: BotaoConteudo[] | undefined): BotaoConteudo[] {
  const fixos = BOTOES_DA_INTRO.map((b) => ({ ...b }));
  const usados = caminhosFixosDaIntro();

  const extras = (doPainel ?? []).filter((b) => !usados.includes(limpar(b.url)));

  return [...fixos, ...extras];
}
