// src/utils/ordem.ts
//
// Helpers de ordem de listas de ids (usados pelos botões do app e pelo painel).

/**
 * Devolve os ids na ordem gravada pela autoria. O que ela não listou (botão novo,
 * ordem antiga) entra depois, na ordem padrão do app — nada desaparece.
 */
export function ordenarIds(padrao: string[], ordem: string[]): string[] {
  const listados = ordem.filter((id) => padrao.includes(id));
  const restantes = padrao.filter((id) => !listados.includes(id));

  return [...listados, ...restantes];
}

/** Move um item na lista (delta -1 sobe, +1 desce). Fora do limite, não mexe. */
export function moverNaLista(ids: string[], id: string, delta: number): string[] {
  const de = ids.indexOf(id);
  const para = de + delta;

  if (de < 0 || para < 0 || para >= ids.length) return ids;

  const copia = [...ids];
  [copia[de], copia[para]] = [copia[para], copia[de]];

  return copia;
}
