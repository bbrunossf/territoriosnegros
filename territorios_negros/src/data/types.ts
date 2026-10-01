// src/data/types.ts

export interface IdadeCamada {
  ano: number;
  label: string;
}

/** Foto de apoio de um território (galeria liberada durante o tour) */
export interface FotoTerritorio {
  url: string;
  legenda?: string;
  /** crédito da imagem (autoria, acervo, fonte) */
  credito?: string;
  /**
   * false = bloqueada para os visitantes.
   * Usado nas imagens de mapa das rotas (as fotos de apoio do território têm
   * o liberar/bloquear em conjunto, no campo fotos_liberadas).
   */
  visivel?: boolean;
}

/**
 * Vídeo de apoio de um território (galeria liberada durante o tour).
 * `url` pode ser um arquivo enviado do aparelho (mp4/webm/mov) ou um link
 * colado (YouTube, Vimeo, Google Drive) — o app escolhe o player sozinho.
 */
export interface VideoTerritorio {
  url: string;
  legenda?: string;
  /** crédito do vídeo (autoria, acervo, fonte) */
  credito?: string;
  /** true quando o vídeo foi adicionado por link, e não enviado do aparelho */
  link?: boolean;
}

export interface Territorio {
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
  idadeCamadas?: IdadeCamada[];

  // ── campos de gestão (painel da autoria) ──
  /** id da categoria (tabela categorias) */
  categoria: string | null;
  /** false = escondido do público (ex.: dia de tour só com o que será visitado) */
  ativo: boolean;
  /** ordem de exibição na aba Territórios */
  ordem: number;
  /** fotos de apoio, liberadas/bloqueadas em conjunto */
  fotos: FotoTerritorio[];
  /** true = visitantes já podem ver as fotos de apoio */
  fotosLiberadas: boolean;
  /** vídeos de apoio, liberados/bloqueados em conjunto */
  videos: VideoTerritorio[];
  /** true = visitantes já podem ver os vídeos de apoio */
  videosLiberados: boolean;
  /** crédito da foto principal (autoria, acervo, fonte) */
  imagemCredito: string | null;
}

export interface Roteiro {
  id: string;
  nome: string;
  nivel: string;
  subtitulo: string;
  acessibilidade: string;
  experiencia: string[];
  pontos: string[];
  ativo: boolean;
  ordem: number;
  /** link do mapa do percurso (Google My Maps etc.) exibido embutido na rota */
  mapaUrl: string | null;
  /** logo própria do evento/rota */
  logo: string | null;
  /** imagens de mapa produzidas pela autoria */
  mapas: FotoTerritorio[];
  /** ficha de inscrição desta rota */
  inscricaoUrl: string | null;
}

export interface Categoria {
  id: string;
  nome: string;
  ordem: number;
}

/**
 * Registro anônimo de acesso ao app (uma linha por página vista).
 * Sem dado pessoal: nem IP, nem nome, nem cookie — só a rota, a hora, o tipo
 * de aparelho e um código aleatório de sessão da aba.
 */
export interface Acesso {
  id: number;
  criadoEm: string;
  /** dia no fuso de Vitória - ES (aaaa-mm-dd) */
  dia: string;
  rota: string;
  dispositivo: string;
  sessao: string | null;
}

export interface Mensagem {
  id: string;
  nome: string;
  email: string | null;
  whatsapp: string | null;
  mensagem: string;
  lida: boolean;
  criadoEm: string;
}

/** Aviso do próximo evento mostrado na tela inicial */
export interface ProximoTour {
  ativo: boolean;
  texto: string;
  data: string;
  hora: string;
  /** local do evento (ex: Centro de Vitória - ES) */
  local: string;
  /** informações sobre o tour (um parágrafo por linha) */
  info: string;
  /** rota do evento: a logo dela é usada quando o evento não tem logo própria */
  rotaId: string;
  /** logo própria do evento (opcional) */
  logo: string;
  inscricaoUrl: string;
}


/** Territórios indexados pelo ID (mesmo formato do JSON original) */
export type TerritoriosMap = Record<string, Territorio>;
