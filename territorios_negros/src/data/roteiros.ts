// src/data/roteiros.ts
// Mantido apenas como ponte: a leitura agora vive em src/data/api.ts
export { fetchRoteiros, fetchCategorias, fetchConfig, salvarRoteiro, atualizarRoteiro, excluirRoteiro } from "./api";

/** sem acento e em minúsculas, para comparar o que a autoria escreveu. */
function semAcento(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * A qual faixa pertence o nível escrito no painel — só isso decide a COR da
 * pílula; o texto que a autoria escreveu nunca é alterado.
 *
 * Verde = **Fácil**, amarelo = **Médio**, vermelho = **Difícil** (pedido da
 * autoria, 14/10/2026). O campo é livre: no banco ele está como
 * "Dificuldade: Médio", então o rótulo "Dificuldade:" é descartado antes de
 * olhar o valor. Nível que não bate com nenhuma faixa volta "" — e a pílula fica
 * na cor neutra de antes.
 */
export function nivelDaRota(nivel: string): "facil" | "medio" | "dificil" | "" {
  const limpo = semAcento(nivel).replace(/^dificuldade\s*[:\-–—]?\s*/, "");

  if (!limpo) return "";

  if (/dificil|dificul|exigente|pesad/.test(limpo)) return "dificil";
  if (/medi|moderad/.test(limpo)) return "medio";
  if (/facil|leve|tranquil/.test(limpo)) return "facil";

  return "";
}

/** A classe CSS da pílula do nível — vazia quando o nível não é conhecido. */
export function classeDoNivel(nivel: string): string {
  const faixa = nivelDaRota(nivel);

  return faixa ? `nivel-${faixa}` : "";
}
