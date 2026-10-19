// Título e subtítulo das páginas de lista (Rotas e Territórios), editáveis no
// painel desde 14/10/2026. Antes eram texto fixo no componente: a revisão geral
// apontou que eram as duas únicas telas do app sem controle de título.
export interface TituloDeLista {
  titulo: string;
  subtitulo: string;
}

export const LISTA_ROTAS_PADRAO: TituloDeLista = {
  titulo: "Rotas",
  subtitulo:
    "Escolha a rota conforme o contexto da visita, o público e as condições da rota.",
};

export const LISTA_TERRITORIOS_PADRAO: TituloDeLista = {
  titulo: "Territórios",
  subtitulo: "Consulta individual dos pontos do guia.",
};

const texto = (valor: unknown) => (typeof valor === "string" ? valor.trim() : "");

/**
 * Regras, iguais às das outras páginas do app:
 *  · nada gravado (chave ausente) → título e subtítulo padrão;
 *  · título em branco → volta ao padrão (a página nunca fica sem título);
 *  · subtítulo em branco → a frase desaparece (escolha da autoria).
 */
export function normalizarTituloDeLista(
  valor: unknown,
  padrao: TituloDeLista
): TituloDeLista {
  if (!valor || typeof valor !== "object") return padrao;

  const guardado = valor as Record<string, unknown>;

  return {
    titulo: texto(guardado.titulo) || padrao.titulo,
    subtitulo: texto(guardado.subtitulo),
  };
}
