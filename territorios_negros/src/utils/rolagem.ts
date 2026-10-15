// src/utils/rolagem.ts
//
// Ajustar a rolagem depois que uma seção abre ou recolhe.
//
// Por que existe: quando um tópico grande (a Biografia, por exemplo) recolhe e
// outro abre logo abaixo, a página encolhe de uma vez e a rolagem fica onde
// estava — o visitante passa a ver o que vem DEPOIS da seção que ele acabou de
// abrir (as fotografias da galeria, no caso relatado pela autoria em 14/10/2026).
//
// A saída é trazer a seção aberta para logo abaixo da barra fixa do app, onde
// ela é lida sem que ninguém precise rolar para se achar.

/** Altura da barra fixa do app (o Header mede e grava em --header-altura). */
function alturaDaBarra(): number {
  const medida = parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("--header-altura")
  );

  return Number.isFinite(medida) && medida > 0 ? medida : 58;
}

/** Põe o elemento (uma seção que acabou de abrir) no alto da tela, abaixo da barra. */
export function trazerParaVista(elemento: HTMLElement | null | undefined) {
  if (!elemento) return;

  // sem rolagem suave quando o visitante pediu menos movimento
  const semAnimacao =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const topo = elemento.getBoundingClientRect().top + window.scrollY - alturaDaBarra() - 8;

  window.scrollTo({ top: Math.max(topo, 0), behavior: semAnimacao ? "auto" : "smooth" });
}
