// src/data/types.ts

export interface IdadeCamada {
  ano: number;
  label: string;
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
}

/** Territórios indexados pelo ID (mesmo formato do JSON original) */
export type TerritoriosMap = Record<string, Territorio>;
