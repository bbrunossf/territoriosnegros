// src/data/api.ts
// Camada única de acesso ao Supabase (leitura + gravação).
//
// IMPORTANTE: quando uma gravação é barrada pelas policies de RLS, o Supabase
// responde 200 gravando ZERO linhas e SEM erro -- antes o painel dizia "salvo"
// e nada mudava. Por isso toda gravação aqui confere quantas linhas voltaram.

import { supabase } from "../lib/supabase";
import type {
  Acesso,
  Categoria,
  FotoTerritorio,
  Mensagem,
  ProximoTour,
  Roteiro,
  Territorio,
  TerritoriosMap,
  VideoTerritorio,
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

/**
 * Liga/desliga UMA foto ou UM vídeo de apoio, gravando na hora — é botão de
 * tour, como o liberar/bloquear do conjunto.
 *
 * Grava a partir da linha do banco (não do formulário), para não publicar nem
 * perder texto que ainda está pendente no painel. O item é achado pela URL,
 * porque a lista do painel pode estar com ordem/nova mídia ainda não publicada.
 *
 * Devolve false quando o item ainda não existe no banco (mídia nova, sem
 * "Salvar alterações"): aí não há o que gravar e o painel orienta a salvar.
 */
export async function definirVisibilidadeMidia(
  id: string,
  campo: "fotos" | "videos",
  url: string,
  visivel: boolean
): Promise<boolean> {
  const linha = await fetchTerritorioBruto(id);
  const bruto = linha?.[campo];

  const lista = Array.isArray(bruto)
    ? bruto.map((item) => ({ ...(item as Record<string, unknown>) }))
    : [];

  const alvo = lista.findIndex((item) => item.url === url);
  if (alvo < 0) return false;

  lista[alvo] = { ...lista[alvo], visivel };

  const { data, error } = await supabase
    .from("territorios")
    .update({ [campo]: lista })
    .eq("id", id)
    .select("id");

  exigirLinhas(data as { id: string }[] | null, error, `alterar visibilidade (${campo})`);
  return true;
}

/**
 * Habilita/desabilita TODAS as fotos (ou todos os vídeos) de apoio de uma vez,
 * gravando na hora — é o botão "todas" do painel e da lista de territórios.
 *
 * Grava item por item (não existe mais um "conjunto" separado: o app olha o
 * `visivel` de cada mídia). A coluna antiga do conjunto (`fotos_liberadas` /
 * `videos_liberados`) é atualizada junto, como espelho, para não deixar o banco
 * com informação contraditória. Devolve quantos itens foram marcados.
 */
export async function definirVisibilidadeTodasMidias(
  id: string,
  campo: "fotos" | "videos",
  visivel: boolean
): Promise<number> {
  const linha = await fetchTerritorioBruto(id);
  const bruto = linha?.[campo];

  const lista = Array.isArray(bruto)
    ? bruto.map((item) => ({ ...(item as Record<string, unknown>) }))
    : [];

  const atualizada = lista.map((item) =>
    typeof item.url === "string" && item.url ? { ...item, visivel } : item
  );

  const patch: Record<string, unknown> = {
    [campo]: atualizada,
    [campo === "fotos" ? "fotos_liberadas" : "videos_liberados"]: visivel,
  };

  const { data, error } = await supabase
    .from("territorios")
    .update(patch)
    .eq("id", id)
    .select("id");

  exigirLinhas(data as { id: string }[] | null, error, `alterar visibilidade (${campo})`);
  return atualizada.filter((item) => item.visivel === visivel).length;
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

// ─────────────────────────────────────────────────── ACESSOS (contador de uso)

/** códigos do Supabase/Postgres quando a tabela ainda não existe no banco */
const CODIGOS_TABELA_AUSENTE = ["PGRST205", "PGRST202", "42P01"];

function erroDeAcesso(error: { code?: string; message: string }): Error {
  if (error.code && CODIGOS_TABELA_AUSENTE.includes(error.code)) {
    return new Error(
      "O contador de acessos ainda não está ativado no banco de dados. Falta rodar a " +
        "migração supabase/migrations/20260929_acessos.sql no SQL Editor do Supabase — " +
        "sem isso o app funciona normal, mas nada é contado."
    );
  }

  return new Error(error.message);
}

/**
 * Registra uma página vista. Feito por visitante anônimo: aqui NÃO se confere
 * linha devolvida (o anônimo não pode ler a tabela), só o erro do insert.
 */
export async function registrarAcesso(registro: {
  rota: string;
  dispositivo: string;
  sessao: string;
}): Promise<void> {
  const { error } = await supabase.from("acessos").insert(registro);
  if (error) throw erroDeAcesso(error);
}

/** Acessos dos últimos `dias` dias (mais recentes primeiro). */
export async function fetchAcessos(dias: number, limite = 20000): Promise<Acesso[]> {
  const desde = new Date(Date.now() - dias * 86400000).toISOString();

  const { data, error } = await supabase
    .from("acessos")
    .select("*")
    .gte("criado_em", desde)
    .order("criado_em", { ascending: false })
    .limit(limite);

  if (error) throw erroDeAcesso(error);

  return ((data as RawAcesso[] | null) ?? []).map((a) => ({
    id: Number(a.id),
    criadoEm: a.criado_em,
    dia: a.dia,
    rota: a.rota,
    dispositivo: a.dispositivo ?? "",
    sessao: a.sessao ?? null,
  }));
}

/** Total de acessos desde o começo (consulta leve, não traz as linhas). */
export async function contarAcessos(): Promise<number> {
  const { count, error } = await supabase
    .from("acessos")
    .select("id", { count: "exact", head: true });

  if (error) throw erroDeAcesso(error);
  return count ?? 0;
}

/** Apaga registros mais antigos que `dias` (a autoria escolhe no painel). */
export async function limparAcessosAntigos(dias: number): Promise<void> {
  const antes = new Date(Date.now() - dias * 86400000).toISOString();

  const { error } = await supabase.from("acessos").delete().lt("criado_em", antes);
  if (error) throw erroDeAcesso(error);
}

/**
 * Zera as estatísticas: apaga TODOS os registros de acesso.
 * Usado antes de divulgar o app, para o número não sair contaminado pelos
 * acessos de teste da própria autoria. Devolve quantos registros foram apagados.
 */
export async function zerarAcessos(): Promise<number> {
  // o filtro "id >= 0" pega todas as linhas (o delete do Supabase exige filtro)
  const { data, error } = await supabase.from("acessos").delete().gte("id", 0).select("id");

  if (error) throw erroDeAcesso(error);
  return ((data as { id: number }[] | null) ?? []).length;
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

// ─────────────────────────────────────────────────── FOTOS E VÍDEOS (storage)

export async function uploadFoto(
  id: string,
  file: File,
  pasta:
    | "territorios"
    | "roteiros"
    | "eventos"
    | "paginas"
    | "capa"
    | "videos" = "territorios"
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

/** Limite de tamanho por arquivo de vídeo no armazenamento do banco (em MB). */
export const LIMITE_VIDEO_MB = 50;

/**
 * Envia um vídeo do aparelho da autoria. Vai para a pasta "videos" do mesmo
 * armazenamento das fotos, e o app o toca pelo link público.
 */
export async function uploadVideo(id: string, file: File): Promise<string> {
  return uploadFoto(id, file, "videos");
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
  videos?: VideoTerritorio[] | null;
  videos_liberados?: boolean | null;
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
    videos: Array.isArray(raw.videos) ? raw.videos : [],
    videosLiberados: raw.videos_liberados === true,
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
    // mapa sem o campo "visivel" é mapa antigo: continua aparecendo
    mapas: Array.isArray(raw.mapas)
      ? raw.mapas.map((m) => ({ ...m, visivel: m.visivel !== false }))
      : [],
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

interface RawAcesso {
  id: number | string;
  criado_em: string;
  dia: string;
  rota: string;
  dispositivo: string | null;
  sessao: string | null;
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
