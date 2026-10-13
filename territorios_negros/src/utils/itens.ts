// src/utils/itens.ts
//
// Helpers da "Lista de itens" do painel (uma linha digitada = um item no app).

/** O que aparece no campo do painel: uma linha por item. */
export function itensParaTexto(itens: string[]): string {
  return itens.join("\n");
}

/**
 * Converte o que foi digitado no campo em lista de itens.
 *
 * NÃO apara espaços nem descarta linhas em branco. Este texto volta para o campo
 * a cada tecla digitada, então qualquer limpeza aqui apagaria o espaço (ou a
 * linha nova) que a autoria acabou de digitar, debaixo do cursor — era o defeito
 * de "não consigo digitar duas palavras na mesma linha" na Lista de itens,
 * corrigido em 02/10/2026. Os espaços das pontas não incomodam no app (não
 * aparecem) e a linha em branco vira um respiro entre os grupos de itens.
 */
export function textoParaItens(txt: string): string[] {
  return txt.split("\n");
}

/** Os itens que saem com travessão — as linhas em branco ficam de fora. */
export function itensComTexto(itens: string[]): string[] {
  return itens.filter((item) => item.trim() !== "");
}
