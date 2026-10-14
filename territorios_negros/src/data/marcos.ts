// marcos.ts — "Marcos e Conexões": os tópicos de apoio à fala da autoria.
//
// O que é: uma lista de tópicos por página (título + explicação + fonte), que
// dá contexto complementar ao visitante e serve de apoio à fala durante os
// tours. Os títulos são lembretes de datas, acontecimentos, pessoas e relações
// que a autoria desenvolve oralmente.
//
// Onde fica gravado: tudo em UMA chave de app_config — "marcos_conexoes" — no
// formato { "<chave da página>": [ {Marco}, … ] }. A chave da página é:
//   · "cidade-de-vitoria"            (a página A cidade de Vitória)
//   · "presenca-negra"               (a página Presença Negra na Cidade)
//   · "territorio:<id>"              (cada ficha de território)
//   · "personalidade:<slug>"         (cada página de personalidade)
//
// A expansão (abrir as explicações) NÃO mora no banco: é uma preferência do
// aparelho da autoria, guardada no navegador. Recurso de apresentação — não é
// proteção de informação confidencial.

export interface Marco {
  id: string;
  /** título curto — o lembrete que fica sempre visível */
  titulo: string;
  /** explicação breve; aparece quando a expansão está permitida */
  explicacao: string;
  /** referência em texto (livro, documento, acervo, relato) */
  fonte: string;
  /** link da fonte, quando houver */
  fonteUrl: string;
}

/** Todos os marcos do app, por chave de página. */
export interface MarcosDoApp {
  [chaveDaPagina: string]: Marco[];
}

/** Chave única em app_config. */
export const CHAVE_MARCOS = "marcos_conexoes";

/**
 * Exibir ou ocultar a seção no app (gravado no banco, vale para todos).
 * Ausente = aparece. O conteúdo cadastrado nunca é apagado por este controle.
 */
export const CHAVE_MARCOS_VISIVEL = "marcos_visivel";

/** A seção está liberada para aparecer no app? (padrão: sim) */
export function marcosVisiveis(config: Record<string, unknown> | undefined): boolean {
  return config?.[CHAVE_MARCOS_VISIVEL] !== false;
}

/**
 * Explicações e fontes liberadas para TODO MUNDO (controle rápido do painel).
 * Padrão: desligado — o visitante vê só os títulos. Diferente da preferência do
 * aparelho da autoria (useExpansao), esta vale para o app inteiro.
 */
export const CHAVE_MARCOS_EXPLICACOES = "marcos_explicacoes";

export function explicacoesPublicas(config: Record<string, unknown> | undefined): boolean {
  return config?.[CHAVE_MARCOS_EXPLICACOES] === true;
}

/** Como a seção se chama na interface — nada de "roteiro", "lembrete" ou "anotação". */
export const TITULO_MARCOS = "Marcos e Conexões";

/** Chaves das páginas que não são território nem personalidade. */
export const CHAVE_CIDADE = "cidade-de-vitoria";
export const CHAVE_PRESENCA_NEGRA = "presenca-negra";

export function chaveDoTerritorio(territorioId: string | number): string {
  return `territorio:${territorioId}`;
}

export function chaveDaPersonalidade(slug: string): string {
  return `personalidade:${slug}`;
}

/** Nome legível de uma chave (para o resumo do painel). */
export function nomeDaChave(chave: string, nomes: Record<string, string> = {}): string {
  if (nomes[chave]) return nomes[chave];

  if (chave === CHAVE_CIDADE) return "A cidade de Vitória";
  if (chave === CHAVE_PRESENCA_NEGRA) return "Presença Negra na Cidade";

  const [tipo, resto] = chave.split(":");

  if (tipo === "territorio") return `Território ${resto}`;
  if (tipo === "personalidade") return `Personalidade ${resto}`;

  return chave;
}

function texto(valor: unknown): string {
  return typeof valor === "string" ? valor : "";
}

/** Um tópico entra na página quando tem título — sem título não aparece. */
export function marcoPreenchido(marco: Marco): boolean {
  return (marco?.titulo ?? "").trim().length > 0;
}

export function novoMarco(): Marco {
  return {
    id: `m${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
    titulo: "",
    explicacao: "",
    fonte: "",
    fonteUrl: "",
  };
}

/** Lê a chave inteira, tolerando lixo — nunca derruba a tela. */
export function normalizarMarcos(valor: unknown): MarcosDoApp {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) return {};

  const saida: MarcosDoApp = {};

  for (const [chave, lista] of Object.entries(valor as Record<string, unknown>)) {
    if (!Array.isArray(lista)) continue;

    const topicos = lista
      .filter((item) => !!item && typeof item === "object")
      .map((item, i) => {
        const bruto = item as Record<string, unknown>;

        return {
          id: texto(bruto.id) || `m${i}`,
          titulo: texto(bruto.titulo),
          explicacao: texto(bruto.explicacao),
          fonte: texto(bruto.fonte),
          fonteUrl: texto(bruto.fonteUrl),
        };
      });

    if (topicos.length > 0) saida[chave] = topicos;
  }

  return saida;
}

/** Os tópicos de uma página, já só os que têm título. */
export function marcosDaPagina(
  config: Record<string, unknown> | undefined,
  chaveDaPagina: string
): Marco[] {
  const todos = normalizarMarcos(config?.[CHAVE_MARCOS]);

  return (todos[chaveDaPagina] ?? []).filter(marcoPreenchido);
}

/** Quantos tópicos cada página tem (resumo do painel). */
export function resumoDosMarcos(
  config: Record<string, unknown> | undefined
): { chave: string; quantos: number }[] {
  const todos = normalizarMarcos(config?.[CHAVE_MARCOS]);

  return Object.keys(todos)
    .map((chave) => ({ chave, quantos: todos[chave].filter(marcoPreenchido).length }))
    .filter((linha) => linha.quantos > 0);
}

/** Move um item de posição (usado nas setas ↑ ↓ do painel). */
export function mover<T>(lista: T[], de: number, para: number): T[] {
  if (de === para || de < 0 || para < 0 || de >= lista.length || para >= lista.length) {
    return lista;
  }

  const copia = [...lista];
  const [item] = copia.splice(de, 1);
  copia.splice(para, 0, item);

  return copia;
}

// ── expansão: preferência do aparelho da autoria ────────────────────────────

/** Evento avisando que a preferência mudou (a seção e o controle escutam). */
export const EVENTO_EXPANSAO = "marcos-expansao-mudou";

const CHAVE_EXPANSAO = "marcos_expansao";

/** Desabilitada por padrão — no primeiro uso, os tópicos ficam só com o título. */
export function lerExpansao(): boolean {
  try {
    return window.localStorage.getItem(CHAVE_EXPANSAO) === "sim";
  } catch {
    return false;
  }
}

export function guardarExpansao(permitir: boolean): void {
  try {
    window.localStorage.setItem(CHAVE_EXPANSAO, permitir ? "sim" : "nao");
  } catch {
    // navegador sem armazenamento: a preferência vale só nesta tela
  }
}
