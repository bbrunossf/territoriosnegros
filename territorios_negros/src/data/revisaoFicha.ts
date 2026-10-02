// src/data/revisaoFicha.ts
//
// Revisão das fichas: o que está vazio e o que parece erro, território por
// território. Serve para a autoria padronizar os 16 territórios sem abrir um
// por um — o painel mostra a pendência e ela preenche/corrige no formulário.
//
// Tudo aqui é função pura (sem banco): as mesmas regras valem para a lista do
// painel e para as provas de teste.
import type { Territorio } from "./types";

export type TipoPendencia = "vazio" | "aviso";

export interface Pendencia {
  /** nome do campo como a autoria conhece */
  campo: string;
  tipo: TipoPendencia;
  /** o que foi encontrado (nos avisos) */
  detalhe: string;
  /** true = é conteúdo que a ficha do território deve ter sempre */
  essencial: boolean;
}

export interface CampoDaFicha {
  campo: string;
  essencial: boolean;
  /** o valor como o visitante lê (texto/lista liga o "vazio") */
  valor: (t: Territorio) => unknown;
}

/** Campos que o visitante vê na ficha, na ordem em que aparecem na página. */
export const CAMPOS_DA_FICHA: CampoDaFicha[] = [
  { campo: "Camadas", essencial: true, valor: (t) => t.camadas },
  { campo: "Contexto", essencial: true, valor: (t) => t.contexto },
  { campo: "Ano", essencial: true, valor: (t) => t.ano },
  { campo: "Criação", essencial: true, valor: (t) => t.criacao },
  { campo: "Função", essencial: true, valor: (t) => t.funcao },
  { campo: "Transformações", essencial: true, valor: (t) => t.transformacoes },
  { campo: "Status", essencial: true, valor: (t) => t.status },
  { campo: "Observação", essencial: false, valor: (t) => t.observacao },
  {
    campo: "Idade das camadas de tempo",
    essencial: false,
    valor: (t) => t.idadeCamadas,
  },
  { campo: "Descrição", essencial: true, valor: (t) => t.descricao },
  { campo: "Para observar", essencial: true, valor: (t) => t.observar },
  { campo: "Para refletir", essencial: true, valor: (t) => t.pergunta },
  { campo: "Palavra-chave", essencial: true, valor: (t) => t.palavra },
  { campo: "Local", essencial: true, valor: (t) => t.local },
  { campo: "Foto principal", essencial: true, valor: (t) => t.imagem },
  { campo: "Fotos de apoio", essencial: false, valor: (t) => t.fotos },
  { campo: "Vídeos de apoio", essencial: false, valor: (t) => t.videos },
];

/** texto vazio (espaços não contam) / lista vazia / número ausente */
export function vazio(valor: unknown): boolean {
  if (valor === null || valor === undefined) return true;
  if (typeof valor === "string") return valor.trim() === "";
  if (typeof valor === "number") return !Number.isFinite(valor) || valor === 0;
  if (Array.isArray(valor)) return valor.length === 0;
  return false;
}

// ── avisos: coisas que costumam ser erro de digitação ──────────────

/** textos que o visitante lê (para checar marcação e caracteres estranhos) */
function textosDoTerritorio(t: Territorio): { campo: string; texto: string }[] {
  const textos: { campo: string; texto: string }[] = [
    { campo: "Camadas", texto: t.camadas },
    { campo: "Contexto", texto: t.contexto },
    { campo: "Criação", texto: t.criacao },
    { campo: "Função", texto: t.funcao },
    { campo: "Transformações", texto: t.transformacoes },
    { campo: "Status", texto: t.status },
    { campo: "Observação", texto: t.observacao ?? "" },
    { campo: "Descrição", texto: t.descricao },
    { campo: "Para refletir", texto: t.pergunta },
    { campo: "Palavra-chave", texto: t.palavra },
    { campo: "Local", texto: t.local },
  ];

  (t.observar ?? []).forEach((item, i) => {
    textos.push({ campo: `Para observar (item ${i + 1})`, texto: item });
  });

  return textos;
}

const MARCAS_DE_ALINHAMENTO = ["[esq]", "[centro]", "[dir]", "[just]", "[justificado]"];
const TEXTO_SEM_SENTIDO = ["undefined", "NaN", "[object Object]", "null"];

/**
 * Trechos com asterisco que o app imprime na tela (a marcação não fechou).
 * Usa a MESMA regra do app (`formatarInline`): `**negrito**` e `*itálico*` são
 * consumidos; o resto sai literal. Asterisco solto usado como texto ("2 * 3")
 * não conta — o app imprime, mas não é marcação quebrada.
 */
export function asteriscosQueSobram(texto: string): string[] {
  const partes = texto.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  const literais: string[] = [];

  for (const parte of partes) {
    if (!parte) continue;
    if (parte.startsWith("**") && parte.endsWith("**") && parte.length > 4) continue;
    if (parte.startsWith("*") && parte.endsWith("*") && parte.length > 2) continue;
    if (parte.includes("*")) literais.push(parte);
  }

  const sobra = literais.join(" ").replace(/\s\*\s/g, " ");

  return sobra.includes("*") ? literais : [];
}

/**
 * Avisos de digitação: aspas/negrito abertos sem fechar, texto sem sentido,
 * ano fora de faixa e marca de alinhamento que não está no começo do parágrafo
 * (nesse lugar o app não aplica e a marca aparece na tela).
 */
export function avisosDoTerritorio(t: Territorio): Pendencia[] {
  const avisos: Pendencia[] = [];

  for (const { campo, texto } of textosDoTerritorio(t)) {
    if (!texto) continue;

    const aspas = (texto.match(/"/g) ?? []).length;
    if (aspas % 2 === 1) {
      avisos.push({
        campo,
        tipo: "aviso",
        detalhe: "tem uma aspa ( \") sem par — confira o final do texto",
        essencial: true,
      });
    }

    const sobrando = asteriscosQueSobram(texto);
    if (sobrando.length > 0) {
      avisos.push({
        campo,
        tipo: "aviso",
        detalhe:
          "tem asterisco que o app mostra na tela — a marcação de **negrito** ou *itálico* não fechou",
        essencial: true,
      });
    }

    const semSentido = TEXTO_SEM_SENTIDO.find((palavra) => texto.includes(palavra));
    if (semSentido) {
      avisos.push({
        campo,
        tipo: "aviso",
        detalhe: `o texto tem “${semSentido}” escrito — parece sobra de cópia`,
        essencial: true,
      });
    }
  }

  // marca de alinhamento fora do começo do parágrafo (só vale no começo)
  (t.descricao ?? "").split("\n").forEach((linha) => {
    const marcaNoMeio = MARCAS_DE_ALINHAMENTO.find(
      (marca) => linha.includes(marca) && !linha.trimStart().startsWith(marca)
    );

    if (marcaNoMeio) {
      avisos.push({
        campo: "Descrição",
        tipo: "aviso",
        detalhe: `a marca ${marcaNoMeio} não está no começo do parágrafo — o app não aplica e ela aparece na tela`,
        essencial: false,
      });
    }
  });

  // ano fora de faixa (a idade mostrada no app sai daqui)
  if (t.ano && (t.ano < 1500 || t.ano > new Date().getFullYear())) {
    avisos.push({
      campo: "Ano",
      tipo: "aviso",
      detalhe: `ano ${t.ano} está fora da faixa esperada (1500 até ${new Date().getFullYear()})`,
      essencial: true,
    });
  }

  // camada de tempo sem rótulo (o app mostraria só "X anos")
  (t.idadeCamadas ?? []).forEach((camada, i) => {
    if (!camada.label || !String(camada.label).trim()) {
      avisos.push({
        campo: `Idade das camadas de tempo (${i + 1}ª camada)`,
        tipo: "aviso",
        detalhe: `a camada de ${camada.ano} está sem rótulo`,
        essencial: false,
      });
    }
  });

  return avisos;
}

/** tudo o que falta nesta ficha: campos vazios + avisos de digitação */
export function pendenciasDoTerritorio(t: Territorio): Pendencia[] {
  const vazios: Pendencia[] = CAMPOS_DA_FICHA.filter((c) => vazio(c.valor(t))).map((c) => ({
    campo: c.campo,
    tipo: "vazio",
    detalhe: "sem conteúdo",
    essencial: c.essencial,
  }));

  // essenciais primeiro; dentro de cada grupo, a ordem em que aparecem na ficha
  return [...vazios, ...avisosDoTerritorio(t)];
}

export function territorioComPendencia(t: Territorio): boolean {
  return pendenciasDoTerritorio(t).length > 0;
}

export interface ResumoPorCampo {
  campo: string;
  essencial: boolean;
  vazios: number;
  /** ids dos territórios com o campo vazio */
  territorios: string[];
}

export interface ResumoRevisao {
  territorios: number;
  comPendencia: number;
  essenciaisVazios: number;
  opcionaisVazios: number;
  avisos: number;
  porCampo: ResumoPorCampo[];
}

/** Panorama dos 16 territórios: quantos estão com pendência e onde. */
export function resumoDaRevisao(territorios: Territorio[]): ResumoRevisao {
  const pendencias = territorios.map((t) => pendenciasDoTerritorio(t));
  const todas = pendencias.flat();

  const porCampo: ResumoPorCampo[] = CAMPOS_DA_FICHA.map((c) => ({
    campo: c.campo,
    essencial: c.essencial,
    vazios: territorios.filter((t) => vazio(c.valor(t))).length,
    territorios: territorios.filter((t) => vazio(c.valor(t))).map((t) => t.id),
  })).filter((linha) => linha.vazios > 0);

  return {
    territorios: territorios.length,
    comPendencia: pendencias.filter((lista) => lista.length > 0).length,
    essenciaisVazios: todas.filter((p) => p.tipo === "vazio" && p.essencial).length,
    opcionaisVazios: todas.filter((p) => p.tipo === "vazio" && !p.essencial).length,
    avisos: todas.filter((p) => p.tipo === "aviso").length,
    porCampo,
  };
}
