// src/components/BotoesFinaisDaTela.tsx
//
// Desenha, no fim do conteúdo de cada tela, os botões de navegação que a autoria
// escolheu no painel (aba Botões, seção "Em cada tela").
//
// Por que existe: a aba Botões nasceu cobrindo só as páginas de texto, e as telas
// criadas depois (evento, ficha, personalidade, percurso, território, fim) não
// tinham onde receber botões — no painel apareciam sem efeito. Aqui a escolha da
// autoria passa a valer em qualquer tela, num lugar só, sem precisar repetir a
// chamada em cada componente.
//
// Regras:
//   · telas de texto (intro, conceito, vitória, presença negra) desenham os
//     próprios botões logo abaixo do título — não recebem os daqui, senão
//     apareceriam duas vezes;
//   · a tela inicial não rola e tem os próprios botões no cartão do evento —
//     fica de fora;
//   · sem nada configurado, `BotoesDaTela` devolve null: nada muda no app.
import BotoesDaTela from "./BotoesDaTela";

const REGRAS: Array<[RegExp, string]> = [
  [/^\/$/, "inicio-nao-usada"],
  [/^\/intro\/?$/, "intro"],
  [/^\/conceito\/?$/, "conceito"],
  [/^\/vitoria\/?$/, "vitoria"],
  [/^\/presenca-negra\/?$/, "presenca-negra"],
  [/^\/roteiros\/?$/, "roteiros"],
  [/^\/territorios\/?$/, "territorios"],
  [/^\/territorio\//, "territorio"],
  [/^\/personalidades\/?$/, "personalidades"],
  [/^\/personalidade\//, "personalidade"],
  [/^\/apoiadores\/?$/, "apoiadores"],
  [/^\/contato\/?$/, "contato"],
  [/^\/evento\/ficha\/?$/, "ficha"],
  [/^\/evento\/?$/, "evento"],
  [/^\/percurso\//, "percurso"],
  [/^\/fim\/?$/, "fim"],
];

/** Telas que já desenham os próprios botões finais. */
const JA_DESENHAM = new Set(["intro", "conceito", "vitoria", "presenca-negra"]);

/** Telas sem espaço para botões de navegação. */
const SEM_ESPACO = new Set(["inicio-nao-usada"]);

export default function BotoesFinaisDaTela({ endereco }: { endereco: string }) {
  const tela = REGRAS.find(([regra]) => regra.test(endereco))?.[1];

  if (!tela || JA_DESENHAM.has(tela) || SEM_ESPACO.has(tela)) return null;

  return <BotoesDaTela tela={tela} posicao="final" />;
}
