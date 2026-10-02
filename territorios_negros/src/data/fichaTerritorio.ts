// src/data/fichaTerritorio.ts
//
// Ordem de exibição das informações da página do território.
//
// A autoria arruma a sequência no painel (↑ ↓) e cada território pode ter a sua:
// o que não estiver configurado cai na ORDEM_PADRAO, que é exatamente a ordem que
// já está no ar — território que ninguém tocou continua igual.
//
// Fica em app_config ("ficha_territorio"), sem migração: é configuração de
// layout, não conteúdo do território.

export type BlocoFichaId =
  | "camadas"
  | "contexto"
  | "ano"
  | "idade"
  | "camadaTemporal"
  | "criacao"
  | "funcao"
  | "transformacoes"
  | "status"
  | "observacao"
  | "descricao"
  | "observar"
  | "pergunta"
  | "palavra";

export interface DefinicaoBloco {
  id: BlocoFichaId;
  /** nome que a autoria conhece (aparece na lista do painel) */
  nome: string;
  /** true = cartão dentro da caixa "Informações rápidas" */
  cartao: boolean;
}

export const BLOCOS_FICHA: DefinicaoBloco[] = [
  { id: "camadas", nome: "Camadas", cartao: true },
  { id: "contexto", nome: "Contexto", cartao: true },
  { id: "ano", nome: "Ano", cartao: true },
  { id: "idade", nome: "Idade (calculada pelo ano)", cartao: true },
  { id: "camadaTemporal", nome: "Idade das camadas de tempo", cartao: true },
  { id: "criacao", nome: "Criação", cartao: true },
  { id: "funcao", nome: "Função", cartao: true },
  { id: "transformacoes", nome: "Transformações", cartao: true },
  { id: "status", nome: "Status", cartao: true },
  { id: "observacao", nome: "Observação", cartao: true },
  { id: "descricao", nome: "Descrição — “O que é este território?”", cartao: false },
  { id: "observar", nome: "Para observar durante a visita", cartao: false },
  { id: "pergunta", nome: "Para refletir", cartao: false },
  { id: "palavra", nome: "Palavra-chave", cartao: false },
];

/** A ordem que já está no ar (nada muda para quem não arrumar nada). */
export const ORDEM_PADRAO: BlocoFichaId[] = BLOCOS_FICHA.map((b) => b.id);

const IDS = new Set<string>(ORDEM_PADRAO);

export function nomeDoBloco(id: BlocoFichaId): string {
  return BLOCOS_FICHA.find((b) => b.id === id)?.nome ?? id;
}

export function ehCartao(id: BlocoFichaId): boolean {
  return BLOCOS_FICHA.find((b) => b.id === id)?.cartao === true;
}

/**
 * Aceita o que estiver gravado no banco e devolve sempre a lista completa:
 * ids desconhecidos são descartados, repetidos ficam uma vez só e o que faltar
 * entra no fim, na ordem padrão.
 */
export function normalizarOrdem(bruto: unknown): BlocoFichaId[] {
  const lidos = Array.isArray(bruto)
    ? bruto.filter((item): item is BlocoFichaId => typeof item === "string" && IDS.has(item))
    : [];

  const semRepetir = [...new Set(lidos)];

  return [...semRepetir, ...ORDEM_PADRAO.filter((id) => !semRepetir.includes(id))];
}

export interface ConfigFicha {
  porTerritorio?: Record<string, unknown>;
}

/** Ordem configurada para um território (sem configuração = ordem padrão). */
export function ordemDoTerritorio(config: unknown, territorioId: string): BlocoFichaId[] {
  const conf = (config ?? {}) as ConfigFicha;
  return normalizarOrdem((conf.porTerritorio ?? {})[territorioId]);
}

/**
 * Nova configuração com a ordem deste território. Quando a ordem é a padrão, a
 * entrada do território é REMOVIDA (banco limpo: quem não mexeu não precisa
 * ficar gravado).
 */
export function comOrdemDoTerritorio(
  config: unknown,
  territorioId: string,
  ordem: BlocoFichaId[]
): ConfigFicha {
  const conf = (config ?? {}) as ConfigFicha;
  const porTerritorio = { ...(conf.porTerritorio ?? {}) };

  if (ehOrdemPadrao(ordem)) {
    delete porTerritorio[territorioId];
  } else {
    porTerritorio[territorioId] = ordem;
  }

  return { ...conf, porTerritorio };
}

export function ehOrdemPadrao(ordem: BlocoFichaId[]): boolean {
  return ordem.length === ORDEM_PADRAO.length && ordem.every((id, i) => id === ORDEM_PADRAO[i]);
}

/** Move um bloco uma posição para cima (-1) ou para baixo (+1). */
export function moverBlocoFicha(
  ordem: BlocoFichaId[],
  id: BlocoFichaId,
  delta: number
): BlocoFichaId[] {
  const de = ordem.indexOf(id);
  const para = de + delta;

  if (de < 0 || para < 0 || para >= ordem.length) return [...ordem];

  const nova = [...ordem];
  [nova[de], nova[para]] = [nova[para], nova[de]];
  return nova;
}

export type FaixaFicha =
  | { tipo: "cartoes"; ids: BlocoFichaId[] }
  | { tipo: "secao"; id: BlocoFichaId };

/**
 * Quebra a sequência em pedaços para desenhar: cartões seguidos saem numa caixa
 * só (a "Informações rápidas"); se a autoria colocar a descrição no meio, a
 * caixa é fechada e o que vier depois abre outra.
 */
export function faixasDaFicha(ordem: BlocoFichaId[]): FaixaFicha[] {
  const faixas: FaixaFicha[] = [];

  for (const id of ordem) {
    if (ehCartao(id)) {
      const ultima = faixas[faixas.length - 1];
      if (ultima && ultima.tipo === "cartoes") ultima.ids.push(id);
      else faixas.push({ tipo: "cartoes", ids: [id] });
    } else {
      faixas.push({ tipo: "secao", id });
    }
  }

  return faixas;
}
