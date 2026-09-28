// src/data/api.ts
// Camada única de acesso ao Supabase (leitura + gravação).
//
// IMPORTANTE: quando uma gravação é barrada pelas policies de RLS, o Supabase
// responde 200 gravando ZERO linhas e SEM erro -- antes o painel dizia "salvo"
// e nada mudava. Por isso toda gravação aqui confere quantas linhas voltaram.

import { supabase } from "../lib/supabase";
import type {
  Categoria,
  FotoTerritorio,
  Mensagem,
  ProximoTour,
  Roteiro,
  Territorio,
  TerritoriosMap,
} from "./types";

/** Gravação que não chegou ao banco (permissão de escrita ausente). */
export class ErroSemPermissao extends Error {}

const BUCKET = "dados_site";

function exigirLinhas<T>(
  linhas: T[] | null,
  error: { message: string } | null,
  acao: string
): T[] {
  if (error) throw new Error(error.message);

  const lista = linhas ?? [];

  if (lista.length === 0) {
    throw new ErroSemPermissao(
      `Nada foi salvo (${acao}). Nem sempre é erro seu: se persistir, o banco está ` +
        `recusando a gravação (policy de RLS) -- me avise que eu confiro.`
    );
  }

  return lista;
}

// ─────────────────────────────────────────────────── LEITURA

export async function fetchTerritorios(): Promise<TerritoriosMap> {
  const { data, error } = await supabase.from("territorios").select("*");
  if (error) throw error;
  if (!data) return {};

  return (data as RawTerritorio[]).reduce((acc, item) => {
    acc[item.id] = mapTerritorio(item);
    return acc;
  }, {} as TerritoriosMap);
}

/**
 * Linha crua do território (colunas como estão no banco).
 * Usado antes de gravar, para comparar com o que está no painel.
 */
export async function fetchTerritorioBruto(
  id: string
): Promise<Record<string, unknown> | null> {
  const { data, error } = await supabase
    .from("territorios")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return (data as Record<string, unknown> | null) ?? null;
}

export async function fetchRoteiros(): Promise<Roteiro[]> {
  const { data, error } = await supabase
    .from("roteiros")
    .select("*")
    .order("ordem", { ascending: true })
    .order("nome", { ascending: true });

  if (error) throw error;
  return (data as RawRoteiro[] | null)?.map(mapRoteiro) ?? [];
}

export async function fetchCategorias(): Promise<Categoria[]> {
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .order("ordem", { ascending: true });

  if (error) throw error;
  return (data as Categoria[] | null) ?? [];
}

/** Todo o app_config, já como objeto { chave: valor }. */
export async function fetchConfig(): Promise<Record<string, unknown>> {
  const { data, error } = await supabase.from("app_config").select("key, value");
  if (error) throw error;

  const config: Record<string, unknown> = {};
  (data as { key: string; value: unknown }[] | null)?.forEach((linha) => {
    config[linha.key] = linha.value;
  });
  return config;
}

export async function fetchMensagens(): Promise<Mensagem[]> {
  const { data, error } = await supabase
    .from("mensagens")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) throw error;

  return ((data as RawMensagem[] | null) ?? []).map((m) => ({
    id: m.id,
    nome: m.nome,
    email: m.email,
    whatsapp: m.whatsapp,
    mensagem: m.mensagem,
    lida: m.lida ?? false,
    criadoEm: m.criado_em,
  }));
}

// ─────────────────────────────────────────────────── TERRITÓRIOS

export async function salvarTerritorio(
  id: string | null,
  payload: Record<string, unknown>,
  acao = "território"
): Promise<string> {
  if (id) {
    const { data, error } = await supabase
      .from("territorios")
      .update(payload)
      .eq("id", id)
      .select("id");

    exigirLinhas(data as { id: string }[] | null, error, `salvar ${acao}`);
    return id;
  }

  const { data, error } = await supabase
    .from("territorios")
    .insert(payload)
    .select("id");

  const linhas = exigirLinhas(data as { id: string }[] | null, error, `criar ${acao}`);
  return linhas[0].id;
}

/** Ajuste pontual (ativar/desativar território, liberar/bloquear fotos...). */
export async function atualizarTerritorio(
  id: string,
  patch: Partial<Record<string, unknown>>
): Promise<void> {
  const { data, error } = await supabase
    .from("territorios")
    .update(patch)
    .eq("id", id)
    .select("id");

  exigirLinhas(data as { id: string }[] | null, error, "atualizar território");
}

export async function excluirTerritorio(id: string): Promise<void> {
  const { data, error } = await supabase
    .from("territorios")
    .delete()
    .eq("id", id)
    .select("id");

  exigirLinhas(data as { id: string }[] | null, error, "excluir território");
}

// ─────────────────────────────────────────────────── ROTEIROS

export async function salvarRoteiro(
  id: string | null,
  payload: Record<string, unknown>,
  acao = "rota"
): Promise<string> {
  if (id) {
    const { data, error } = await supabase
      .from("roteiros")
      .update(payload)
      .eq("id", id)
      .select("id");

    exigirLinhas(data as { id: string }[] | null, error, `salvar ${acao}`);
    return id;
  }

  const { data, error } = await supabase.from("roteiros").insert(payload).select("id");

  const linhas = exigirLinhas(data as { id: string }[] | null, error, `criar ${acao}`);
  return linhas[0].id;
}

export async function atualizarRoteiro(
  id: string,
  patch: Partial<Record<string, unknown>>
): Promise<void> {
  const { data, error } = await supabase
    .from("roteiros")
    .update(patch)
    .eq("id", id)
    .select("id");

  exigirLinhas(data as { id: string }[] | null, error, "atualizar rota");
}

export async function excluirRoteiro(id: string): Promise<void> {
  const { data, error } = await supabase
    .from("roteiros")
    .delete()
    .eq("id", id)
    .select("id");

  exigirLinhas(data as { id: string }[] | null, error, "excluir rota");
}

// ─────────────────────────────────────────────────── CATEGORIAS

export async function salvarCategoria(
  id: string | null,
  payload: { id: string; nome: string; ordem: number }
): Promise<void> {
  if (id) {
    const { data, error } = await supabase
      .from("categorias")
      .update(payload)
      .eq("id", id)
      .select("id");

    exigirLinhas(data as { id: string }[] | null, error, "salvar categoria");
    return;
  }

  const { data, error } = await supabase.from("categorias").insert(payload).select("id");
  exigirLinhas(data as { id: string }[] | null, error, "criar categoria");
}

export async function excluirCategoria(id: string): Promise<void> {
  const { data, error } = await supabase
    .from("categorias")
    .delete()
    .eq("id", id)
    .select("id");

  exigirLinhas(data as { id: string }[] | null, error, "excluir categoria");
}

// ─────────────────────────────────────────────────── CONFIG / TEXTOS

export async function salvarConfig(chave: string, valor: unknown): Promise<void> {
  const { data, error } = await supabase
    .from("app_config")
    .upsert(
      { key: chave, value: valor, atualizado_em: new Date().toISOString() },
      { onConflict: "key" }
    )
    .select("key");

  exigirLinhas(data as { key: string }[] | null, error, "salvar configuração");
}

// ─────────────────────────────────────────────────── MENSAGENS

/**
 * Envio do formulário de contato. Feito por visitante anônimo: aqui NÃO se
 * confere linha devolvida (o anônimo não tem permissão de leitura da tabela),
 * só o erro do insert.
 */
export async function enviarMensagem(mensagem: {
  nome: string;
  email?: string;
  whatsapp?: string;
  mensagem: string;
}): Promise<void> {
  const { error } = await supabase.from("mensagens").insert({
    nome: mensagem.nome,
    email: mensagem.email || null,
    whatsapp: mensagem.whatsapp || null,
    mensagem: mensagem.mensagem,
  });

  if (error) throw new Error(error.message);
}

export async function marcarMensagem(id: string, lida: boolean): Promise<void> {
  const { data, error } = await supabase
    .from("mensagens")
    .update({ lida })
    .eq("id", id)
    .select("id");

  exigirLinhas(data as { id: string }[] | null, error, "marcar mensagem");
}

export async function excluirMensagem(id: string): Promise<void> {
  const { data, error } = await supabase
    .from("mensagens")
    .delete()
    .eq("id", id)
    .select("id");

  exigirLinhas(data as { id: string }[] | null, error, "excluir mensagem");
}

// ─────────────────────────────────────────────────── FOTOS (storage)

export async function uploadFoto(
  id: string,
  file: File,
  pasta: "territorios" | "roteiros" | "eventos" = "territorios"
): Promise<string> {
  const extensao = file.name.split(".").pop() ?? "jpg";
  const nomeArquivo = `${id}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)}.${extensao}`;
  const caminho = `${pasta}/${nomeArquivo}`;

  const { error } = await supabase.storage.from(BUCKET).upload(caminho, file, {
    upsert: false,
  });

  if (error) throw new Error(`Falha no upload de "${file.name}": ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(caminho);
  return data.publicUrl;
}

// ─────────────────────────────────────────────────── MAPEAMENTO

interface RawTerritorio {
  id: string;
  nome: string;
  local: string;
  palavra: string;
  ano: number;
  imagem: string;
  camadas: string;
  contexto: string;
  criacao: string;
  funcao: string;
  transformacoes: string;
  status: string;
  observacao?: string;
  descricao: string;
  observar: string[];
  pergunta: string;
  video?: string;
  idade_camadas?: { ano: number; label: string }[];
  categoria?: string | null;
  ativo?: boolean | null;
  ordem?: number | null;
  fotos?: FotoTerritorio[] | null;
  fotos_liberadas?: boolean | null;
  imagem_credito?: string | null;
}

function mapTerritorio(raw: RawTerritorio): Territorio {
  return {
    id: raw.id,
    nome: raw.nome,
    local: raw.local,
    palavra: raw.palavra,
    ano: raw.ano,
    imagem: raw.imagem,
    camadas: raw.camadas,
    contexto: raw.contexto,
    criacao: raw.criacao,
    funcao: raw.funcao,
    transformacoes: raw.transformacoes,
    status: raw.status,
    observacao: raw.observacao,
    descricao: raw.descricao,
    observar: raw.observar ?? [],
    pergunta: raw.pergunta,
    video: raw.video,
    idadeCamadas: raw.idade_camadas,
    categoria: raw.categoria ?? null,
    ativo: raw.ativo !== false,
    ordem: raw.ordem ?? 0,
    fotos: Array.isArray(raw.fotos) ? raw.fotos : [],
    fotosLiberadas: raw.fotos_liberadas === true,
    imagemCredito: raw.imagem_credito ?? null,
  };
}

interface RawRoteiro {
  id: string;
  nome: string;
  nivel: string;
  subtitulo: string;
  acessibilidade: string;
  experiencia: string[] | null;
  pontos: string[] | null;
  ativo?: boolean | null;
  ordem?: number | null;
  mapa_url?: string | null;
  logo?: string | null;
  mapas?: FotoTerritorio[] | null;
  inscricao_url?: string | null;
}

function mapRoteiro(raw: RawRoteiro): Roteiro {
  return {
    id: raw.id,
    nome: raw.nome,
    nivel: raw.nivel,
    subtitulo: raw.subtitulo,
    acessibilidade: raw.acessibilidade,
    experiencia: raw.experiencia ?? [],
    pontos: raw.pontos ?? [],
    ativo: raw.ativo !== false,
    ordem: raw.ordem ?? 0,
    mapaUrl: raw.mapa_url ?? null,
    logo: raw.logo ?? null,
    mapas: Array.isArray(raw.mapas) ? raw.mapas : [],
    inscricaoUrl: raw.inscricao_url ?? null,
  };
}

interface RawMensagem {
  id: string;
  nome: string;
  email: string | null;
  whatsapp: string | null;
  mensagem: string;
  lida: boolean | null;
  criado_em: string;
}

/** Normaliza o valor de app_config.proximo_tour (que é livre no banco). */
export function normalizarProximoTour(valor: unknown): ProximoTour | null {
  if (!valor || typeof valor !== "object") return null;
  const v = valor as Record<string, unknown>;
  const tour: ProximoTour = {
    ativo: v.ativo === true,
    texto: typeof v.texto === "string" ? v.texto : "",
    data: typeof v.data === "string" ? v.data : "",
    hora: typeof v.hora === "string" ? v.hora : "",
    local: typeof v.local === "string" ? v.local : "",
    info: typeof v.info === "string" ? v.info : "",
    rotaId: typeof v.rota_id === "string" ? v.rota_id : "",
    logo: typeof v.logo === "string" ? v.logo : "",
    inscricaoUrl:
      typeof v.inscricao_url === "string"
        ? v.inscricao_url
        : typeof v.inscricaoUrl === "string"
          ? v.inscricaoUrl
          : "",
  };
  return tour;
}
