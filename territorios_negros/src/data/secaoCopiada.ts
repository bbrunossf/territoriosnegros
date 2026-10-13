// src/data/secaoCopiada.ts
//
// A área de transferência do painel: a autoria copia uma seção inteira de uma
// página (texto, itens, caixa destacada, links, imagens e formatação) e cola em
// outra página, com a mesma estrutura. Pedido da autoria, 02/10/2026 — ela
// precisava levar "Uma cidade construída com presença negra" da página A cidade
// de Vitória para a página Presença Negra na Cidade, e copiar campo por campo
// perdia a estrutura.
//
// Fica gravado em app_config, na chave "secao_copiada" — assim a cópia sobrevive
// enquanto ela troca de página no painel. NÃO é conteúdo: só serve para colar, e
// nada entra em página nenhuma antes do "Salvar" daquela página.
import { ESTILO_PADRAO, type BlocoConteudo, type EstiloTexto } from "./paginas";

export const CHAVE_SECAO_COPIADA = "secao_copiada";

export interface SecaoCopiada {
  /** de que página ela veio (nome que a autoria reconhece) */
  origem: string;
  /** título da seção, para ela saber o que está na área de transferência */
  titulo: string;
  /** quando foi copiada (ISO) */
  quando: string;
  secao: BlocoConteudo;
}

function texto(valor: unknown, limite = 20000): string {
  return typeof valor === "string" ? valor.slice(0, limite) : "";
}

function listaDeTextos(valor: unknown): string[] {
  return Array.isArray(valor) ? valor.filter((v): v is string => typeof v === "string") : [];
}

function links(valor: unknown): { texto: string; url: string }[] {
  if (!Array.isArray(valor)) return [];

  return valor
    .filter((l) => l && typeof l === "object")
    .map((l) => {
      const o = l as Record<string, unknown>;
      return { texto: texto(o.texto, 300), url: texto(o.url, 600) };
    })
    .filter((l) => l.texto || l.url);
}

function imagens(valor: unknown): { url: string; legenda?: string; credito?: string; visivel?: boolean }[] {
  if (!Array.isArray(valor)) return [];

  return valor
    .filter((i) => i && typeof i === "object")
    .map((i) => {
      const o = i as Record<string, unknown>;
      return {
        url: texto(o.url, 800),
        legenda: texto(o.legenda, 400),
        credito: texto(o.credito, 200),
        visivel: o.visivel !== false,
      };
    })
    .filter((i) => i.url);
}

/** Junta a formatação gravada com o padrão (campo que faltar não quebra). */
function estilo(valor: unknown): EstiloTexto {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) return ESTILO_PADRAO;

  return { ...ESTILO_PADRAO, ...(valor as Partial<EstiloTexto>) };
}

/** A seção tem algum conteúdo? (seção vazia não vale a viagem) */
function temConteudo(b: Record<string, unknown>): boolean {
  return (
    texto(b.texto).trim() !== "" ||
    listaDeTextos(b.itens).some((i) => i.trim() !== "") ||
    texto(b.destaque).trim() !== "" ||
    links(b.links).length > 0 ||
    imagens(b.imagens).length > 0
  );
}

/**
 * Lê a seção guardada na área de transferência. Defensivo: o que não tem o
 * formato de uma seção (ou está vazia) volta como nada — o painel não mostra
 * uma cópia fantasma.
 */
export function lerSecaoCopiada(bruto: unknown): SecaoCopiada | null {
  if (!bruto || typeof bruto !== "object" || Array.isArray(bruto)) return null;

  const registro = bruto as Record<string, unknown>;
  const cru = registro.secao;

  if (!cru || typeof cru !== "object" || Array.isArray(cru)) return null;
  if (!temConteudo(cru as Record<string, unknown>)) return null;

  const b = cru as Record<string, unknown>;
  const titulo = texto(b.titulo, 300).trim();

  return {
    origem: texto(registro.origem, 80) || "outra página",
    titulo: titulo || "(sem título)",
    quando: texto(registro.quando, 40),
    secao: {
      icone: texto(b.icone, 4) || "•",
      titulo,
      texto: texto(b.texto),
      itens: listaDeTextos(b.itens),
      destaque: texto(b.destaque),
      links: links(b.links),
      imagens: imagens(b.imagens),
      posicaoImagens: b.posicaoImagens === "aposTexto" ? "aposTexto" : "fim",
      estilo: estilo(b.estilo),
      tituloEstilo: estilo(b.tituloEstilo),
    },
  };
}

/** O que o painel grava ao copiar uma seção. */
export function montarSecaoCopiada(
  origem: string,
  secao: BlocoConteudo
): SecaoCopiada {
  return {
    origem: texto(origem, 80) || "outra página",
    titulo: texto(secao.titulo, 300).trim() || "(sem título)",
    quando: new Date().toISOString(),
    secao,
  };
}

/** Frase da barra do painel: diz o que está copiado e de onde veio. */
export function descreverSecaoCopiada(copia: SecaoCopiada): string {
  return `“${copia.titulo}” — copiada de ${copia.origem}`;
}

/** A seção como cópia independente (mexer nela não mexe na original). */
export function clonarSecao(copia: SecaoCopiada): BlocoConteudo {
  return JSON.parse(JSON.stringify(copia.secao)) as BlocoConteudo;
}
