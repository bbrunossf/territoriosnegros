// simbolosCategoria.ts — imagens das categorias de territórios.
//
// A tabela `categorias` tem só id, nome e ordem (sem coluna para imagem), e
// criar coluna é alteração de banco — o que a autoria faz por conta própria,
// nunca por aqui. Então o símbolo vive em `app_config`, na chave
// `simbolos_categorias`, no formato { "id-da-categoria": "https://…" }.
//
// Vantagens: grava com o mesmo `salvarConfig` que o resto do painel já usa,
// chega ao app na mesma leitura e some do app na hora em que é removido.

/** chave em app_config onde ficam as imagens das categorias */
export const CHAVE_SIMBOLOS_CATEGORIA = "simbolos_categorias";

export type SimbolosDeCategoria = Record<string, string>;

/** Lê o mapa de símbolos da configuração do app (tolerante a dados antigos). */
export function lerSimbolosDeCategoria(
  config: Record<string, unknown>
): SimbolosDeCategoria {
  const bruto = config?.[CHAVE_SIMBOLOS_CATEGORIA];

  if (!bruto || typeof bruto !== "object" || Array.isArray(bruto)) return {};

  const saida: SimbolosDeCategoria = {};

  for (const [id, valor] of Object.entries(bruto as Record<string, unknown>)) {
    if (typeof valor === "string" && valor.trim() !== "") saida[id] = valor;
  }

  return saida;
}

/** Imagem da categoria, ou null quando a autoria não enviou nenhuma. */
export function simboloDaCategoria(
  config: Record<string, unknown>,
  categoriaId: string | null | undefined
): string | null {
  if (!categoriaId) return null;
  return lerSimbolosDeCategoria(config)[categoriaId] ?? null;
}
