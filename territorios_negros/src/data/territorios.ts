// src/data/territorios.ts

import { supabase } from "../lib/supabase";
import type { Territorio, TerritoriosMap } from "./types";

/**
 * Busca todos os territórios da tabela "territorios" no Supabase
 * e retorna um objeto indexado pelo campo "id".
 *
 * Mapeamento das colunas (snake_case no Postgres → camelCase no app):
 *   idade_camadas → idadeCamadas
 */
export async function fetchTerritorios(): Promise<TerritoriosMap> {
  const { data, error } = await supabase.from("territorios").select("*");

  if (error) throw error;
  if (!data) return {};

  return (data as RawTerritorio[]).reduce((acc, item) => {
    acc[item.id] = mapTerritorio(item);
    return acc;
  }, {} as TerritoriosMap);
}

// ── Tipos internos e mapeamento ──────────────────────────────

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
    observar: raw.observar,
    pergunta: raw.pergunta,
    video: raw.video,
    idadeCamadas: raw.idade_camadas,
  };
}
