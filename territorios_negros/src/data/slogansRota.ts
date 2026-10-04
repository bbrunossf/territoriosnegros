// Slogan (frase de abertura) de cada rota.
//
// ONDE FICA GRAVADO: em `app_config`, na chave "roteiros_slogans", no formato
//   { "<id-da-rota>": "texto do slogan" }
//
// Por que na configuração e não na tabela `roteiros`: assim NÃO é preciso
// alterar o banco (a coluna nova exigiria rodar SQL à mão, e entre publicar o
// painel e rodar o SQL o salvamento das rotas falharia). O painel grava a chave
// inteira e o app lê a mesma chave — é o mesmo caminho já usado por
// "ordemTerritoriosVisual" e "ficha_territorio".
//
// Por que um campo novo, e não o "Subtítulo": o campo Subtítulo da rota é usado
// para início e conclusão do percurso ("Início: MUCANE | Conclusão: Chafariz");
// o slogan é outra informação (frase/citação) e não podia ocupar o mesmo lugar.

export const CHAVE_SLOGANS = "roteiros_slogans";

/** id da rota → texto do slogan. */
export type SlogansDeRota = Record<string, string>;

/**
 * Lê o que estiver gravado na configuração, seja lá em que formato vier
 * (ausente, nulo, lista, texto) e devolve sempre um mapa seguro.
 */
export function lerSlogans(valor: unknown): SlogansDeRota {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) return {};

  const mapa: SlogansDeRota = {};

  for (const [id, texto] of Object.entries(valor as Record<string, unknown>)) {
    if (typeof texto === "string" && texto.trim()) mapa[id] = texto;
  }

  return mapa;
}

/** O slogan de uma rota — string vazia quando a rota não tem. */
export function sloganDaRota(
  config: Record<string, unknown>,
  idDaRota: string
): string {
  if (!idDaRota) return "";
  return lerSlogans(config[CHAVE_SLOGANS])[idDaRota] ?? "";
}

/**
 * Devolve o mapa com o slogan desta rota trocado. Se o texto ficar em branco, a
 * rota sai do mapa (o app volta a não mostrar nada no lugar).
 */
export function definirSlogan(
  slogans: SlogansDeRota,
  idDaRota: string,
  texto: string
): SlogansDeRota {
  const novo: SlogansDeRota = { ...slogans };

  if (texto.trim()) {
    novo[idDaRota] = texto;
  } else {
    delete novo[idDaRota];
  }

  return novo;
}

/** Quantas rotas já têm slogan (para o aviso do painel). */
export function quantosSlogans(slogans: SlogansDeRota): number {
  return Object.keys(slogans).length;
}
