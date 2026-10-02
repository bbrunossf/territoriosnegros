// src/data/descricao.ts
//
// Alinhamento por PARÁGRAFO da descrição do território.
//
// Por que a marca no texto (e não uma coluna nova): a descrição é uma coluna de
// texto, e criar coluna exige migração do Bruno. A marca no começo do parágrafo
// mora no próprio texto, sobrevive a edição e não pede SQL. O painel escreve a
// marca sozinho (a autoria só escolhe no <select>), e o app tira a marca da
// tela — o visitante nunca lê "[esq]".
//
// Marca reconhecida: [esq] · [centro] · [dir] · [just] (sem marca = padrão do app)

export type AlinhamentoParagrafo =
  | "padrao"
  | "esquerda"
  | "centro"
  | "direita"
  | "justificado";

export interface ParagrafoDescricao {
  /** texto do parágrafo, SEM a marca de alinhamento */
  texto: string;
  alinhamento: AlinhamentoParagrafo;
}

/** o que a autoria pode digitar (aceita algumas variações) */
const MARCAS: Record<string, AlinhamentoParagrafo> = {
  esq: "esquerda",
  esquerda: "esquerda",
  centro: "centro",
  centralizado: "centro",
  dir: "direita",
  direita: "direita",
  just: "justificado",
  justificado: "justificado",
};

/** a marca que o painel escreve para cada alinhamento */
const MARCA_DE: Record<Exclude<AlinhamentoParagrafo, "padrao">, string> = {
  esquerda: "[esq]",
  centro: "[centro]",
  direita: "[dir]",
  justificado: "[just]",
};

/** marca no começo do parágrafo (com o espaço que vem depois dela) */
const RE_MARCA = /^\s*\[([a-zçãáéíóúâêô]+)\]\s*/i;

/** Só a marca do começo, se for uma marca conhecida. */
function separarMarca(paragrafo: string): {
  marca: string;
  alinhamento: AlinhamentoParagrafo;
  texto: string;
} {
  const achado = paragrafo.match(RE_MARCA);
  const alinhamento = achado ? MARCAS[achado[1].toLowerCase()] : undefined;

  if (!achado || !alinhamento) {
    return { marca: "", alinhamento: "padrao", texto: paragrafo };
  }

  return { marca: achado[0], alinhamento, texto: paragrafo.slice(achado[0].length) };
}

/**
 * Divide a descrição em parágrafos (linha em branco separa) já com o
 * alinhamento lido. É o que o app usa para desenhar.
 */
export function lerParagrafos(descricao: string | null | undefined): ParagrafoDescricao[] {
  return (descricao ?? "")
    .split(/\n\s*\n/)
    .map((paragrafo) => paragrafo.trim())
    .filter(Boolean)
    .map((paragrafo) => {
      const { alinhamento, texto } = separarMarca(paragrafo);
      return { texto: texto.trim(), alinhamento };
    });
}

/** Volta do modelo para o texto gravado (marca só quando não é o padrão). */
export function escreverParagrafos(paragrafos: ParagrafoDescricao[]): string {
  return paragrafos
    .map((p) => (p.alinhamento === "padrao" ? p.texto : `${MARCA_DE[p.alinhamento]} ${p.texto}`))
    .join("\n\n");
}

/**
 * Troca o alinhamento de UM parágrafo mexendo só nele: o resto do texto — a
 * linha em branco entre parágrafos, a quebra de linha de dentro do parágrafo e o
 * espaçamento que a autoria escreveu — fica exatamente como estava.
 */
export function trocarAlinhamento(
  descricao: string,
  indice: number,
  alinhamento: AlinhamentoParagrafo
): string {
  const partes = (descricao ?? "").split(/(\n[ \t]*\n)/);
  let contador = -1;

  return partes
    .map((parte) => {
      if (/^\n[ \t]*\n$/.test(parte) || !parte.trim()) return parte; // separador/vazio

      contador += 1;
      if (contador !== indice) return parte;

      const limpo = parte.replace(RE_MARCA, (marca, palavra: string) =>
        MARCAS[String(palavra).toLowerCase()] ? "" : marca
      );

      return alinhamento === "padrao" ? limpo : `${MARCA_DE[alinhamento]} ${limpo}`;
    })
    .join("");
}

/** Aplica o mesmo alinhamento a todos os parágrafos (o pedido de "um clique"). */
export function alinharTodos(
  descricao: string,
  alinhamento: AlinhamentoParagrafo
): string {
  const paragrafos = lerParagrafos(descricao);
  return escreverParagrafos(paragrafos.map((p) => ({ ...p, alinhamento })));
}

/**
 * Classe CSS do parágrafo no app, com o MESMO vocabulário de alinhamento das
 * páginas de texto (`alin-centro`, `alin-direita`...). O padrão NÃO emite
 * classe — assim a descrição de quem nunca mexeu no alinhamento continua
 * exatamente como está no ar.
 */
export function classeAlinhamento(alinhamento: AlinhamentoParagrafo): string {
  return alinhamento === "padrao" ? "" : `alin-${alinhamento === "esquerda" ? "esquerda" : alinhamento}`;
}
