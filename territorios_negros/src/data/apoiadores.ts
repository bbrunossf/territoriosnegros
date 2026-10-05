// src/data/apoiadores.ts
//
// Quem apoia o projeto: instituições, empresas, coletivos e pessoas. Fica em
// app_config, na chave "apoiadores" — nenhuma migração de banco:
//
//   { titulo, texto, lista: [{ id, nome, logo, contribuicao, link, visivel }] }
//
// Regras:
//  · cada apoiador tem o próprio `visivel` (item por item, como as fotos de
//    apoio): desligar tira da vista do visitante sem apagar o cadastro;
//  · o app mostra os visíveis que têm nome ou logo — cadastro em branco não
//    aparece, nem deixa cartão vazio;
//  · o título e o texto de abertura são editáveis no painel (aba Apoiadores).

export const CHAVE_APOIADORES = "apoiadores";

export interface Apoiador {
  /** identificador estável (o painel usa para editar/remover) */
  id: string;
  /** nome da instituição, empresa, coletivo ou pessoa */
  nome: string;
  /** endereço da logo (enviada no painel) — uso combinado com quem apoia */
  logo: string;
  /** uma frase curta: apoio à divulgação, acolhimento da visita, material, transporte… */
  contribuicao: string;
  /** site ou Instagram oficial (opcional) */
  link: string;
  /** aparece para o visitante? */
  visivel: boolean;
}

export interface PaginaApoiadores {
  titulo: string;
  texto: string;
  lista: Apoiador[];
}

export const TITULO_PADRAO = "Conheça quem apoia este projeto";

export const TEXTO_PADRAO =
  "Conheça as pessoas e instituições que contribuem para a realização desta experiência de memória, cultura e valorização dos territórios negros de Vitória.";

export const APOIADORES_PADRAO: PaginaApoiadores = {
  titulo: TITULO_PADRAO,
  texto: TEXTO_PADRAO,
  lista: [],
};

function texto(valor: unknown, reserva = ""): string {
  return typeof valor === "string" ? valor.trim() : reserva;
}

let contador = 0;

/** Apoiador novo, em branco, pronto para a autoria preencher. */
export function novoApoiador(): Apoiador {
  contador += 1;

  return {
    id: `apoiador-${Date.now().toString(36)}-${contador}`,
    nome: "",
    logo: "",
    contribuicao: "",
    link: "",
    visivel: true,
  };
}

/** Configuração vinda do banco: qualquer valor estranho volta ao padrão. */
export function lerApoiadores(valor: unknown): PaginaApoiadores {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    return APOIADORES_PADRAO;
  }

  const v = valor as Record<string, unknown>;
  const bruto = Array.isArray(v.lista) ? v.lista : [];

  const lista: Apoiador[] = bruto
    .filter((item) => !!item && typeof item === "object")
    .map((item, i) => {
      const a = item as Record<string, unknown>;

      return {
        id: texto(a.id) || `apoiador-${i + 1}`,
        nome: texto(a.nome),
        logo: texto(a.logo),
        contribuicao: texto(a.contribuicao),
        link: texto(a.link),
        // só fica escondido se a autoria esconder de propósito
        visivel: a.visivel !== false,
      };
    });

  return {
    titulo: texto(v.titulo) || TITULO_PADRAO,
    texto: texto(v.texto) || TEXTO_PADRAO,
    lista,
  };
}

/** O que o visitante vê: visível e com nome ou logo (cadastro vazio não entra). */
export function apoiadoresVisiveis(pagina: PaginaApoiadores): Apoiador[] {
  return pagina.lista.filter((a) => a.visivel && (!!a.nome || !!a.logo));
}

/** “Instituto X — apoio à divulgação”: resumo curto para a lista do painel. */
export function resumoDoApoiador(apoiador: Apoiador): string {
  const nome = apoiador.nome || "sem nome ainda";
  const contribuicao = apoiador.contribuicao ? ` — ${apoiador.contribuicao}` : "";

  return `${nome}${contribuicao}`;
}

/** Endereço pronto para o link funcionar (completa o https quando falta). */
export function linkUtilizavel(url: string): string {
  const limpo = url.trim();
  if (!limpo) return "";

  return /^https?:\/\//i.test(limpo) ? limpo : `https://${limpo}`;
}

/** Como o botão do link se chama: Instagram, Site ou “Abrir link”. */
export function rotuloDoLink(url: string): string {
  const alvo = url.toLowerCase();

  if (alvo.includes("instagram.com")) return "Instagram";
  if (/^https?:\/\//.test(alvo)) return "Site";

  return "Abrir link";
}

/** Quantos apoiadores o visitante vê (usado no resumo do painel). */
export function quantosVisiveis(pagina: PaginaApoiadores): number {
  return apoiadoresVisiveis(pagina).length;
}
