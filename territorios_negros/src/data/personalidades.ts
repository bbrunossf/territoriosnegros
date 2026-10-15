// src/data/personalidades.ts
//
// Personalidades negras de Vitória e do Espírito Santo (pedido da autoria,
// 02/10/2026). Reúne as trajetórias e liga cada uma aos territórios do app.
//
// Tudo vive em app_config, na chave "personalidades" — uma lista. O painel (aba
// Personalidades Negras) é quem escreve; o app só lê o que está publicada.
//
// Regras que o módulo garante:
//   · rascunho NÃO aparece para o visitante (só o que está "publicada");
//   · vínculo com território é bilateral: a personalidade mostra o território e
//     a página do território mostra a personalidade (mesmo dado, um só cadastro);
//   · campo vazio não vira seção vazia no app (ver componentes).

export type SituacaoPersonalidade = "rascunho" | "publicada";

/** Em que pé está a informação (aparece marcado na biografia). */
export type NaturezaInformacao = "documentada" | "relato" | "pesquisa";

export interface FotoPersonalidade {
  url: string;
  /** legenda exibida embaixo */
  legenda?: string;
  /** crédito/autoria */
  credito?: string;
  /** de onde veio (acervo, site, família) */
  fonte?: string;
  /** texto alternativo, para leitor de tela */
  alt?: string;
  /** liberada para o visitante (o painel liga e desliga) */
  visivel?: boolean;
}

export interface VideoPersonalidade {
  id: string;
  url: string;
  titulo?: string;
  descricao?: string;
  credito?: string;
}

export interface BlocoBiografia {
  id: string;
  titulo: string;
  texto: string;
  natureza?: NaturezaInformacao;
}

export interface MarcoLinhaTempo {
  id: string;
  /** data ou período — aceita "cerca de 1870", "início do século XX" */
  data: string;
  titulo: string;
  descricao: string;
}

export interface FontePesquisa {
  id: string;
  tipo: string;
  titulo: string;
  /** autor ou instituição */
  autor?: string;
  /** ano ou período */
  data?: string;
  /** endereço, quando houver — referência sem link é bem-vinda */
  url?: string;
  observacoes?: string;
}

export interface VinculoTerritorio {
  territorioId: string;
  /** como a pessoa se liga ao território (moradia, homenagem no nome da rua…) */
  relacao: string;
}

export interface Personalidade {
  id: string;
  /** endereço permanente da página: /personalidade/<slug> */
  slug: string;
  nome: string;
  /** outros nomes pelos quais é conhecida */
  outrosNomes: string;
  apresentacao: string;

  nascimento: string;
  localNascimento: string;
  falecimento: string;
  localFalecimento: string;

  biografia: string;
  blocos: BlocoBiografia[];
  linhaDoTempo: MarcoLinhaTempo[];

  fotoCapa: FotoPersonalidade | null;
  galeria: FotoPersonalidade[];
  videos: VideoPersonalidade[];

  fontes: FontePesquisa[];
  /** link para o material completo (TCC, dossiê, inventário…) */
  materialCompleto: string;

  territorios: VinculoTerritorio[];

  situacao: SituacaoPersonalidade;
  /** posição na lista pública */
  ordem: number;
}

export const CHAVE_PERSONALIDADES = "personalidades";

export const TIPOS_DE_FONTE = [
  { id: "livro", rotulo: "Livro" },
  { id: "artigo", rotulo: "Artigo" },
  { id: "documento", rotulo: "Documento" },
  { id: "site", rotulo: "Site" },
  { id: "acervo", rotulo: "Acervo" },
  { id: "relato", rotulo: "Relato oral" },
  { id: "outro", rotulo: "Outro" },
] as const;

export const NATUREZAS: { id: NaturezaInformacao; rotulo: string }[] = [
  { id: "documentada", rotulo: "Informação documentada" },
  { id: "relato", rotulo: "Proveniente de relato oral" },
  { id: "pesquisa", rotulo: "Ainda em pesquisa" },
];

/** Símbolos que aparecem junto do trecho marcado. */
export function marcaDaNatureza(natureza: NaturezaInformacao | undefined): string {
  if (natureza === "relato") return "relato oral";
  if (natureza === "pesquisa") return "em pesquisa";
  if (natureza === "documentada") return "documentada";
  return "";
}

// ── utilidades de texto ────────────────────────────────────────────────

/** Sem acento e minúsculo, para busca por nome e por território. */
export function normalizarTexto(valor: string): string {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Endereço permanente a partir do nome (estável: usa o id quando precisar). */
export function slugDe(nome: string, id: string): string {
  const base = normalizarTexto(nome)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return base || `p-${id}`;
}

// ── criando um cadastro novo ───────────────────────────────────────────

let contador = 0;

/** Id de cadastro novo (dois cadastros no mesmo milissegundo não colidem). */
export function novoId(prefixo = "pes"): string {
  contador += 1;
  return `${prefixo}-${Date.now().toString(36)}-${contador}-${Math.random().toString(36).slice(2, 6)}`;
}

export function personalidadeVazia(): Personalidade {
  return {
    id: novoId(),
    slug: "",
    nome: "",
    outrosNomes: "",
    apresentacao: "",
    nascimento: "",
    localNascimento: "",
    falecimento: "",
    localFalecimento: "",
    biografia: "",
    blocos: [],
    linhaDoTempo: [],
    fotoCapa: null,
    galeria: [],
    videos: [],
    fontes: [],
    materialCompleto: "",
    territorios: [],
    situacao: "rascunho",
    ordem: 0,
  };
}

export function fotoVazia(): FotoPersonalidade {
  return { url: "", legenda: "", credito: "", fonte: "", alt: "", visivel: true };
}

export function blocoVazio(): BlocoBiografia {
  return { id: novoId("blc"), titulo: "", texto: "", natureza: "documentada" };
}

export function marcoVazio(): MarcoLinhaTempo {
  return { id: novoId("mrk"), data: "", titulo: "", descricao: "" };
}

export function fonteVazia(): FontePesquisa {
  return { id: novoId("fnt"), tipo: "livro", titulo: "", autor: "", data: "", url: "", observacoes: "" };
}

// ── leitura defensiva ─────────────────────────────────────────────────

function texto(valor: unknown, limite = 20000): string {
  return typeof valor === "string" ? valor.slice(0, limite) : "";
}

function listaDeTextos(valor: unknown): string[] {
  return Array.isArray(valor) ? valor.filter((v): v is string => typeof v === "string") : [];
}

function lerFoto(bruto: unknown): FotoPersonalidade | null {
  if (!bruto || typeof bruto !== "object" || Array.isArray(bruto)) return null;

  const o = bruto as Record<string, unknown>;
  const url = texto(o.url, 1000);

  if (!url) return null;

  return {
    url,
    legenda: texto(o.legenda, 400),
    credito: texto(o.credito, 300),
    fonte: texto(o.fonte, 300),
    alt: texto(o.alt, 400),
    visivel: o.visivel !== false,
  };
}

function lerFotos(valor: unknown): FotoPersonalidade[] {
  if (!Array.isArray(valor)) return [];

  return valor
    .map(lerFoto)
    .filter((f): f is FotoPersonalidade => f !== null);
}

function lerVideos(valor: unknown): VideoPersonalidade[] {
  if (!Array.isArray(valor)) return [];

  return valor
    .filter((v) => v && typeof v === "object")
    .map((v) => {
      const o = v as Record<string, unknown>;
      return {
        id: texto(o.id, 60) || novoId("vid"),
        url: texto(o.url, 1000),
        titulo: texto(o.titulo, 300),
        descricao: texto(o.descricao, 1000),
        credito: texto(o.credito, 300),
      };
    })
    .filter((v) => v.url);
}

function lerBlocos(valor: unknown): BlocoBiografia[] {
  if (!Array.isArray(valor)) return [];

  return valor
    .filter((b) => b && typeof b === "object")
    .map((b) => {
      const o = b as Record<string, unknown>;
      const natureza = texto(o.natureza, 20);

      return {
        id: texto(o.id, 60) || novoId("blc"),
        titulo: texto(o.titulo, 300),
        texto: texto(o.texto),
        natureza:
          natureza === "relato" || natureza === "pesquisa" || natureza === "documentada"
            ? (natureza as NaturezaInformacao)
            : undefined,
      };
    })
    .filter((b) => b.titulo.trim() !== "" || b.texto.trim() !== "");
}

function lerLinhaDoTempo(valor: unknown): MarcoLinhaTempo[] {
  if (!Array.isArray(valor)) return [];

  return valor
    .filter((m) => m && typeof m === "object")
    .map((m) => {
      const o = m as Record<string, unknown>;
      return {
        id: texto(o.id, 60) || novoId("mrk"),
        data: texto(o.data, 120),
        titulo: texto(o.titulo, 300),
        descricao: texto(o.descricao, 4000),
      };
    })
    .filter((m) => m.data.trim() !== "" || m.titulo.trim() !== "");
}

function lerFontes(valor: unknown): FontePesquisa[] {
  if (!Array.isArray(valor)) return [];

  return valor
    .filter((f) => f && typeof f === "object")
    .map((f) => {
      const o = f as Record<string, unknown>;
      const tipo = texto(o.tipo, 30);

      return {
        id: texto(o.id, 60) || novoId("fnt"),
        tipo: TIPOS_DE_FONTE.some((t) => t.id === tipo) ? tipo : "outro",
        titulo: texto(o.titulo, 500),
        autor: texto(o.autor, 300),
        data: texto(o.data, 120),
        url: texto(o.url, 1000),
        observacoes: texto(o.observacoes, 1000),
      };
    })
    .filter((f) => f.titulo.trim() !== "" || f.url.trim() !== "");
}

function lerVinculos(valor: unknown): VinculoTerritorio[] {
  if (!Array.isArray(valor)) return [];

  const vistos: string[] = [];
  const vinculos: VinculoTerritorio[] = [];

  valor.forEach((v) => {
    if (!v || typeof v !== "object") return;

    const o = v as Record<string, unknown>;
    const territorioId = texto(o.territorioId, 120);

    // um território entra uma vez só, com a primeira relação escrita
    if (!territorioId || vistos.includes(territorioId)) return;

    vistos.push(territorioId);
    vinculos.push({ territorioId, relacao: texto(o.relacao, 500) });
  });

  return vinculos;
}

/** Uma personalidade gravada virou cadastro de verdade? (defensivo) */
function lerUma(bruto: unknown, indice: number): Personalidade | null {
  if (!bruto || typeof bruto !== "object" || Array.isArray(bruto)) return null;

  const o = bruto as Record<string, unknown>;
  const nome = texto(o.nome, 300).trim();

  if (!nome) return null;

  const id = texto(o.id, 80) || `pes-${indice}`;
  const situacao = o.situacao === "publicada" ? "publicada" : "rascunho";
  const ordem = typeof o.ordem === "number" && Number.isFinite(o.ordem) ? o.ordem : indice;

  return {
    id,
    slug: texto(o.slug, 120).trim() || slugDe(nome, id),
    nome,
    outrosNomes: texto(o.outrosNomes, 300),
    apresentacao: texto(o.apresentacao, 1200),
    nascimento: texto(o.nascimento, 120),
    localNascimento: texto(o.localNascimento, 300),
    falecimento: texto(o.falecimento, 120),
    localFalecimento: texto(o.localFalecimento, 300),
    biografia: texto(o.biografia),
    blocos: lerBlocos(o.blocos),
    linhaDoTempo: lerLinhaDoTempo(o.linhaDoTempo),
    fotoCapa: lerFoto(o.fotoCapa),
    galeria: lerFotos(o.galeria),
    videos: lerVideos(o.videos),
    fontes: lerFontes(o.fontes),
    materialCompleto: texto(o.materialCompleto, 4000),
    territorios: lerVinculos(o.territorios),
    situacao,
    ordem,
  };
}

/**
 * Lê o que está gravado em app_config.personalidades.
 * Lista vazia, formato estranho ou cadastro sem nome: fora — o app nunca mostra
 * um cartão em branco.
 */
export function lerPersonalidades(bruto: unknown): Personalidade[] {
  if (!Array.isArray(bruto)) return [];

  const lidas = bruto
    .map((p, i) => lerUma(p, i))
    .filter((p): p is Personalidade => p !== null);

  return lidas.sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome, "pt-BR"));
}

/** Só o que o visitante pode ver, na ordem da autoria. */
export function personalidadesPublicadas(lista: Personalidade[]): Personalidade[] {
  return lista.filter((p) => p.situacao === "publicada");
}

/** Quantas estão publicadas e quantas em rascunho (para o resumo do painel). */
export function contarPorSituacao(lista: Personalidade[]): { publicadas: number; rascunhos: number } {
  const publicadas = lista.filter((p) => p.situacao === "publicada").length;

  return { publicadas, rascunhos: lista.length - publicadas };
}

/** A personalidade daquele endereço (usada pela página pública). */
export function porSlug(lista: Personalidade[], slug: string): Personalidade | undefined {
  const alvo = normalizarTexto(slug);

  return lista.find((p) => normalizarTexto(p.slug) === alvo);
}

/** Busca por nome (inclui os outros nomes pelos quais é conhecida). */
export function buscarPorNome(lista: Personalidade[], termo: string): Personalidade[] {
  const alvo = normalizarTexto(termo);

  if (!alvo) return lista;

  return lista.filter(
    (p) =>
      normalizarTexto(p.nome).includes(alvo) ||
      normalizarTexto(p.outrosNomes).includes(alvo) ||
      normalizarTexto(p.apresentacao).includes(alvo)
  );
}

/**
 * As personalidades ligadas a um território. É o mesmo dado lido pelo outro
 * lado do vínculo: a página do território usa esta função.
 */
export function personalidadesDoTerritorio(
  lista: Personalidade[],
  territorioId: string
): Personalidade[] {
  return lista.filter((p) => p.territorios.some((v) => v.territorioId === territorioId));
}

/** A relação escrita pela autoria entre a pessoa e aquele território. */
export function relacaoCom(p: Personalidade, territorioId: string): string {
  return p.territorios.find((v) => v.territorioId === territorioId)?.relacao ?? "";
}

/**
 * Os territórios que aparecem no filtro: só os que têm alguma personalidade
 * (da lista recebida) — não adianta filtrar por quem não tem resultado.
 */
export function territoriosComPersonalidades(lista: Personalidade[]): string[] {
  const ids: string[] = [];

  lista.forEach((p) => {
    p.territorios.forEach((v) => {
      if (!ids.includes(v.territorioId)) ids.push(v.territorioId);
    });
  });

  return ids;
}

/** "1870 – 1940", "cerca de 1870", "início do século XX" — só o que existe. */
export function linhaDeVida(p: Personalidade): string {
  const nascimento = p.nascimento.trim();
  const falecimento = p.falecimento.trim();

  if (nascimento && falecimento) return `${nascimento} – ${falecimento}`;
  if (nascimento) return nascimento;
  if (falecimento) return `† ${falecimento}`;

  return "";
}

/** A pessoa tem alguma foto de capa visível? */
export function capaVisivel(p: Personalidade): FotoPersonalidade | null {
  if (!p.fotoCapa || p.fotoCapa.visivel === false) return null;

  return p.fotoCapa;
}

/** Fotos da galeria liberadas para o visitante. */
export function galeriaVisivel(p: Personalidade): FotoPersonalidade[] {
  return p.galeria.filter((f) => f.visivel !== false);
}

/**
 * Os links que a autoria cadastrou — um por linha, como ela digita no painel
 * (pedido de 02/10/2026: no lugar do botão "abrir o material completo", uma lista
 * dos links). Linha sem endereço completo recebe "https://", para abrir.
 */
export function linksDaPersonalidade(p: Personalidade): string[] {
  return p.materialCompleto
    .split(/\r?\n/)
    .map((linha) => linha.trim())
    .filter((linha) => linha.length > 0)
    .map((linha) => (/^https?:\/\//i.test(linha) ? linha : `https://${linha}`));
}

/** Quantas partes preenchidas a página tem (para o painel avisar o que falta). */
export function partesPreenchidas(p: Personalidade): string[] {
  const partes: string[] = [];

  if (p.apresentacao.trim()) partes.push("apresentação");
  if (p.biografia.trim() || p.blocos.length > 0) partes.push("biografia");
  if (p.linhaDoTempo.length > 0) partes.push("linha do tempo");
  if (capaVisivel(p) || galeriaVisivel(p).length > 0) partes.push("fotos");
  if (p.videos.length > 0) partes.push("vídeos");
  if (p.territorios.length > 0) partes.push("territórios");
  if (p.fontes.length > 0) partes.push("fontes");
  if (p.materialCompleto.trim()) partes.push("material completo");

  return partes;
}

/** A apresentação curta dos cartões (sem cortar palavra no meio). */
export function resumoDe(p: Personalidade, limite = 220): string {
  const bruto = (p.apresentacao || p.biografia).replace(/\s+/g, " ").trim();

  if (bruto.length <= limite) return bruto;

  const corte = bruto.slice(0, limite);
  const ultimoEspaco = corte.lastIndexOf(" ");

  return `${corte.slice(0, ultimoEspaco > 60 ? ultimoEspaco : limite).trimEnd()}…`;
}

/** Os territórios de um vínculo que ainda existem no app. */
export function vinculosValidos(
  p: Personalidade,
  existeTerritorio: (id: string) => boolean
): VinculoTerritorio[] {
  return p.territorios.filter((v) => existeTerritorio(v.territorioId));
}

/** Lista de ids de território ligados a alguma personalidade (para o painel). */
export function idsVinculados(lista: Personalidade[]): string[] {
  return territoriosComPersonalidades(lista);
}

export { listaDeTextos };
