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
  /** foto do apoiador ou do espaço (opcional; aparece no cartão quando existe) */
  foto: string;
  /** uma frase curta: apoio à divulgação, acolhimento da visita, material, transporte… */
  contribuicao: string;
  /**
   * a participação combinada (ver TIPOS_DE_APOIO): realização, parceria, apoio,
   * patrocínio, fomento ou acolhimento. Vazio = ainda não definida (o cartão sai
   * sem etiqueta).
   */
  tipo: string;

  /** link antigo (site ou Instagram). Continua valendo para cadastro já feito. */
  link: string;

  // ── contato que o visitante vê (viram botões no cartão) ──────────────
  /** número com DDD; o app monta o wa.me */
  whatsapp: string;
  /** @perfil ou o endereço completo */
  instagram: string;
  site: string;
  /** canal ou vídeo do YouTube */
  youtube: string;

  // ── dados do cadastro (ficam SÓ no painel, não vão para o app) ───────
  /** CNPJ ou CPF de quem apoia (documento do convênio/fomento) */
  documento: string;
  /**
   * Mostrar o CNPJ/CPF no cartão do app. Desligado por padrão: só se liga quando
   * o próprio apoiador pedir/autorizar.
   */
  documentoVisivel: boolean;
  endereco: string;
  /** telefones fixos e celulares, como a autoria quiser separar */
  telefones: string;

  /** aparece para o visitante? */
  visivel: boolean;
}

/**
 * As participações que o app reconhece, na ordem em que aparecem para a autoria
 * escolher. Cada uma diz o que aquilo significa, porque a diferença importa para
 * quem apoia: patrocínio é custeio, acolhimento é receber o grupo, e assim por
 * diante.
 */
export const TIPOS_DE_APOIO: { valor: string; nome: string; explicacao: string }[] = [
  { valor: "realizacao", nome: "Realização", explicacao: "quem realiza o projeto" },
  { valor: "parceria", nome: "Parceria", explicacao: "quem caminha junto, com ação conjunta" },
  { valor: "apoio", nome: "Apoio", explicacao: "quem contribui sem vínculo de patrocínio" },
  { valor: "patrocinio", nome: "Patrocínio", explicacao: "quem custeia ou financia parte do projeto" },
  {
    valor: "fomento",
    nome: "Fomento",
    explicacao:
      "recurso público de fomento — por exemplo, o da Secretaria de Turismo que sustenta parte do projeto",
  },
  {
    valor: "acolhimento",
    nome: "Acolhimento",
    explicacao: "quem recebe o grupo — a igreja ou o espaço que abre as portas",
  },
];

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
    foto: "",
    contribuicao: "",
    tipo: "",
    link: "",
    whatsapp: "",
    instagram: "",
    site: "",
    youtube: "",
    documento: "",
    documentoVisivel: false,
    endereco: "",
    telefones: "",
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
        foto: texto(a.foto),
        contribuicao: texto(a.contribuicao),
        tipo: tipoValido(a.tipo),
        link: texto(a.link),
        whatsapp: texto(a.whatsapp),
        instagram: texto(a.instagram),
        site: texto(a.site),
        youtube: texto(a.youtube),
        documento: texto(a.documento),
        // privado por padrão: só aparece no app quando a autoria ligar
        documentoVisivel: a.documentoVisivel === true,
        endereco: texto(a.endereco),
        telefones: texto(a.telefones),
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
  return pagina.lista.filter((a) => a.visivel && (!!a.nome || !!a.logo || !!a.foto));
}

/** “Instituto X — apoio à divulgação”: resumo curto para a lista do painel. */
export function resumoDoApoiador(apoiador: Apoiador): string {
  const nome = apoiador.nome || "sem nome ainda";
  const tipo = nomeDoTipo(apoiador.tipo);
  const contribuicao = apoiador.contribuicao ? ` — ${apoiador.contribuicao}` : "";

  return `${nome}${tipo ? ` — ${tipo}` : ""}${contribuicao}`;
}

/**
 * A participação é uma das combinadas? Devolve o valor guardado quando sim e ""
 * quando não (valor antigo, digitado à mão ou vazio não vira etiqueta errada).
 */
export function tipoValido(valor: unknown): string {
  if (typeof valor !== "string") return "";

  const limpo = valor.trim().toLowerCase();

  return TIPOS_DE_APOIO.some((t) => t.valor === limpo) ? limpo : "";
}

/** Nome da participação para mostrar na tela (“Patrocínio”); "" quando não há. */
export function nomeDoTipo(valor: unknown): string {
  const tipo = tipoValido(valor);

  return TIPOS_DE_APOIO.find((t) => t.valor === tipo)?.nome ?? "";
}

/**
 * Endereço pronto para o link funcionar. Além de completar o “https://”, entende
 * o que a autoria costuma digitar: **@perfil** ou só o nome do perfil viram
 * Instagram (foi o caso do apoiador cadastrado com “@…” que não abria — 14/10/2026).
 */
export function linkUtilizavel(url: string): string {
  const limpo = url.trim();
  if (!limpo) return "";

  if (/^https?:\/\//i.test(limpo)) return limpo;

  // @perfil → perfil do Instagram
  if (limpo.startsWith("@")) return `https://instagram.com/${limpo.slice(1)}`;

  // perfil colado sem @ e sem domínio (ex.: "institutoexemplo")
  if (!limpo.includes(" ") && !limpo.includes(".") && /^[\w.]{2,40}$/.test(limpo)) {
    return `https://instagram.com/${limpo}`;
  }

  return `https://${limpo}`;
}

/** Número de WhatsApp → link wa.me (aceita máscara, +55 e link pronto). */
export function whatsappUtilizavel(numero: string): string {
  const limpo = numero.trim();
  if (!limpo) return "";

  if (/^https?:\/\//i.test(limpo)) return limpo;

  const digitos = limpo.replace(/\D/g, "");
  if (!digitos) return "";

  // 10 ou 11 dígitos = DDD + número, sem o código do país
  const comPais = digitos.length <= 11 ? `55${digitos}` : digitos;

  return `https://wa.me/${comPais}`;
}

/** Como o botão do link se chama: Instagram, Site, YouTube, WhatsApp… */
export function rotuloDoLink(url: string): string {
  const alvo = url.toLowerCase();

  if (alvo.includes("instagram.com")) return "Instagram";
  if (alvo.includes("youtube.com") || alvo.includes("youtu.be")) return "YouTube";
  if (alvo.includes("wa.me") || alvo.includes("whatsapp.com")) return "WhatsApp";
  if (/^https?:\/\//.test(alvo)) return "Site";

  return "Abrir link";
}

/**
 * Os contatos que o cartão do apoiador mostra, na ordem em que aparecem.
 * O campo antigo (`link`) continua valendo — nada do que já foi cadastrado se
 * perde — e o mesmo endereço não aparece duas vezes.
 */
export function linksDoApoiador(apoiador: Apoiador): { rotulo: string; url: string }[] {
  const candidatos: { rotulo: string; url: string }[] = [
    { rotulo: "WhatsApp", url: whatsappUtilizavel(apoiador.whatsapp) },
    { rotulo: "Instagram", url: linkUtilizavel(apoiador.instagram) },
    { rotulo: "Site", url: apoiador.site ? linkUtilizavel(apoiador.site) : "" },
    { rotulo: "YouTube", url: linkUtilizavel(apoiador.youtube) },
    { rotulo: rotuloDoLink(linkUtilizavel(apoiador.link)), url: linkUtilizavel(apoiador.link) },
  ];

  const vistos = new Set<string>();

  return candidatos.filter((item) => {
    if (!item.url) return false;

    // o mesmo perfil digitado em dois campos vira um botão só
    const chave = item.url.replace(/\/+$/, "").toLowerCase();
    if (vistos.has(chave)) return false;

    vistos.add(chave);
    return true;
  });
}

/** Quantos apoiadores o visitante vê (usado no resumo do painel). */
export function quantosVisiveis(pagina: PaginaApoiadores): number {
  return apoiadoresVisiveis(pagina).length;
}

/** “CNPJ”, “CPF” ou “CNPJ/CPF”, conforme a quantidade de dígitos digitada. */
export function rotuloDoDocumento(documento: string): string {
  const digitos = documento.replace(/\D/g, "");

  if (digitos.length === 14) return "CNPJ";
  if (digitos.length === 11) return "CPF";

  return "CNPJ/CPF";
}

/**
 * O documento que o visitante pode ver: vazio por padrão. Só sai quando a
 * autoria liga “mostrar” no cadastro daquele apoiador (pedido dele).
 */
export function documentoPublico(apoiador: Apoiador): string {
  return apoiador.documentoVisivel && apoiador.documento ? apoiador.documento : "";
}
