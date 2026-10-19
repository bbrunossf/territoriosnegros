// src/utils/iconeDoEndereco.ts
//
// Qual símbolo usar num botão criado pela autoria no painel (aba Páginas): os
// botões livremente escritos apontam para endereços do app, então dá para dar a
// eles o mesmo ícone do botão de catálogo — a barra de ações fica coerente
// (14/10/2026). Endereço externo ou desconhecido recebe o ícone de link.
const ICONE_POR_ENDERECO: Array<[RegExp, string]> = [
  [/^\/$/, "inicio"],
  [/^\/(conceito|base-teorica)/, "base-teorica"],
  [/^\/vitoria/, "cidade-de-vitoria"],
  [/^\/presenca-negra/, "presenca-negra"],
  [/^\/roteiros/, "roteiros"],
  [/^\/territorios?(\/|$)/, "territorios"],
  [/^\/apoiadores/, "apoiadores"],
  [/^\/personalidades?(\/|$)/, "personalidades"],
];

export function iconeDoEndereco(url: string | undefined): string {
  const endereco = (url ?? "").trim();

  if (!endereco || /^https?:/i.test(endereco)) return "link";

  return ICONE_POR_ENDERECO.find(([regra]) => regra.test(endereco))?.[1] ?? "link";
}
