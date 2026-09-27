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

export interface Mensagem {
  id: string;
  nome: string;
  email: string | null;
  whatsapp: string | null;
  mensagem: string;
  lida: boolean;
  criadoEm: string;
}

/** Aviso de próximo tour mostrado na tela inicial */
export interface ProximoTour {
  ativo: boolean;
  texto: string;
  data: string;
  hora: string;
  inscricaoUrl: string;
}


/** Territórios indexados pelo ID (mesmo formato do JSON original) */
export type TerritoriosMap = Record<string, Territorio>;
