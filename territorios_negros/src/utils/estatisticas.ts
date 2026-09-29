// src/utils/estatisticas.ts
//
// Contas do contador de acessos — tudo em funções puras (sem Supabase, sem
// navegador) para poder testar fora do app. O painel (AcessosAdmin) só mostra
// o resultado.
//
// Vocabulário usado no painel:
//   páginas vistas = quantas telas foram abertas (uma linha por abertura)
//   visitas        = quantas abas/sessões diferentes (código aleatório da aba)

import type { Acesso } from "../data/types";

/** fuso usado para agrupar os dias (Vitória - ES) */
export const FUSO = "America/Sao_Paulo";

export interface LinhaDia {
  /** aaaa-mm-dd */
  dia: string;
  paginas: number;
  visitas: number;
}

export interface LinhaRota {
  /** rota agrupada (ex: /percurso/rota-1) */
  rota: string;
  /** nome amigável para o painel */
  nome: string;
  paginas: number;
  visitas: number;
}

export interface Resumo {
  paginas: number;
  visitas: number;
  /** dias com pelo menos um acesso */
  diasComAcesso: number;
  /** média de páginas vistas por dia com acesso */
  mediaPorDia: number;
}

export interface LinhaDispositivo {
  dispositivo: string;
  paginas: number;
  /** fatia do total, em % (para as barras do painel) */
  porcentagem: number;
}

// ─────────────────────────────────────────────────── rotas

/**
 * Agrupa as variações de uma mesma página:
 *   "/percurso/rota-1/2"  ->  "/percurso/rota-1"
 * A página do território dentro da rota é a mesma tela do percurso, então conta
 * junto. Consultas com "#" ou "?" já chegam limpas (o app navega por pathname).
 */
export function rotaBase(rota: string): string {
  const partes = rota.split("/").filter(Boolean);
  if (partes[0] === "percurso" && partes.length === 3) return `/${partes[0]}/${partes[1]}`;
  return "/" + partes.join("/");
}

/** Nome que aparece no painel para cada rota do app. */
export function nomeAmigavel(rota: string): string {
  const partes = rota.split("/").filter(Boolean);

  if (partes.length === 0) return "Tela inicial";

  const nomes: Record<string, string> = {
    intro: "Antes de caminhar",
    conceito: "Base teórica",
    vitoria: "A cidade de Vitória",
    contato: "Fale com a autoria",
    roteiros: "Lista de rotas",
    territorios: "Lista de territórios",
    evento: "Página do evento",
    fim: "Fim do percurso",
  };

  if (partes.length === 1) return nomes[partes[0]] ?? `/${partes[0]}`;

  if (partes[0] === "percurso") return `Percurso da rota ${partes[1]}`;
  if (partes[0] === "territorio") return `Território: ${partes[1]}`;

  return `/${partes.join("/")}`;
}

/**
 * O que entra na contagem: só as telas do app para visitantes.
 * O painel (/admin) e a tela de login não contam — senão o uso da autoria
 * inflaria os números.
 */
export function ehRotaPublica(caminho: string): boolean {
  if (!caminho.startsWith("/")) return false;
  if (caminho === "/login" || caminho.startsWith("/login/")) return false;
  if (caminho === "/admin" || caminho.startsWith("/admin/")) return false;
  return true;
}

// ─────────────────────────────────────────────────── datas

/** Data de hoje (aaaa-mm-dd) no fuso de Vitória — testável passando a data. */
export function hojeNoFuso(agora: Date = new Date(), fuso: string = FUSO): string {
  // en-CA dá exatamente o formato aaaa-mm-dd
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: fuso,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(agora);
}

/** Lista os últimos `dias` dias (do mais antigo para hoje), aaaa-mm-dd. */
export function ultimosDias(dias: number, hoje: string = hojeNoFuso()): string[] {
  const lista: string[] = [];
  const base = new Date(`${hoje}T12:00:00Z`);

  for (let i = dias - 1; i >= 0; i--) {
    const d = new Date(base.getTime() - i * 86400000);
    lista.push(d.toISOString().slice(0, 10));
  }

  return lista;
}

/** "2026-09-29" -> "29/09" (rótulo curto das barras) */
export function rotuloDiaCurto(dia: string): string {
  const [, mes, d] = dia.split("-");
  return `${d}/${mes}`;
}

// ─────────────────────────────────────────────────── contas

function contarVisitas(acessos: Acesso[]): number {
  const sessoes = new Set<string>();

  acessos.forEach((a) => {
    // sem código de sessão (registro antigo) cai no id, para não juntar tudo
    sessoes.add(a.sessao || `s-${a.id}`);
  });

  return sessoes.size;
}

export function resumo(acessos: Acesso[]): Resumo {
  const dias = new Set(acessos.map((a) => a.dia));
  const paginas = acessos.length;

  return {
    paginas,
    visitas: contarVisitas(acessos),
    diasComAcesso: dias.size,
    mediaPorDia: dias.size > 0 ? Math.round((paginas / dias.size) * 10) / 10 : 0,
  };
}

/** Quantos acessos por dia, do mais recente para o mais antigo. */
export function porDia(acessos: Acesso[], dias: number, hoje: string = hojeNoFuso()): LinhaDia[] {
  return ultimosDias(dias, hoje).map((dia) => {
    const doDia = acessos.filter((a) => a.dia === dia);

    return {
      dia,
      paginas: doDia.length,
      visitas: contarVisitas(doDia),
    };
  });
}

/** Páginas mais vistas (agrupadas por rota base), da mais vista para a menos. */
export function porRota(acessos: Acesso[]): LinhaRota[] {
  const mapa = new Map<string, Acesso[]>();

  acessos.forEach((a) => {
    const base = rotaBase(a.rota);
    const lista = mapa.get(base);
    if (lista) lista.push(a);
    else mapa.set(base, [a]);
  });

  return Array.from(mapa.entries())
    .map(([rota, lista]) => ({
      rota,
      nome: nomeAmigavel(rota),
      paginas: lista.length,
      visitas: contarVisitas(lista),
    }))
    .sort((a, b) => b.paginas - a.paginas || a.nome.localeCompare(b.nome));
}

/** Celular, tablet ou computador. */
export function porDispositivo(acessos: Acesso[]): LinhaDispositivo[] {
  const nomes: Record<string, string> = {
    celular: "Celular",
    tablet: "Tablet",
    computador: "Computador",
  };
  const mapa = new Map<string, number>();

  acessos.forEach((a) => {
    const chave = a.dispositivo || "sem registro";
    mapa.set(chave, (mapa.get(chave) ?? 0) + 1);
  });

  const total = acessos.length || 1;

  return Array.from(mapa.entries())
    .map(([dispositivo, paginas]) => ({
      dispositivo: nomes[dispositivo] ?? dispositivo,
      paginas,
      porcentagem: Math.round((paginas / total) * 100),
    }))
    .sort((a, b) => b.paginas - a.paginas);
}

/**
 * Tipo de aparelho pelo tamanho da tela e pelo toque — sem ler o texto do
 * navegador (user agent), que é dado que não queremos guardar.
 */
export function classificarDispositivo(
  larguraTela: number,
  temToque: boolean
): "celular" | "tablet" | "computador" {
  if (larguraTela < 768) return "celular";
  if (temToque && larguraTela < 1200) return "tablet";
  return "computador";
}
