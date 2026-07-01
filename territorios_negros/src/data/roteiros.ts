// src/data/roteiros.ts

import { supabase } from "../lib/supabase";
import type { Roteiro } from "./types";

/** Busca todos os roteiros da tabela "roteiros" no Supabase */
export async function fetchRoteiros(): Promise<Roteiro[]> {
  const { data, error } = await supabase
    .from("roteiros")
    .select("*")
    .order("nome");

  if (error) throw error;
  return (data as Roteiro[]) || [];
}

/** Busca a ordem visual dos territórios da tabela "app_config" */
export async function fetchOrdemTerritoriosVisual(): Promise<string[]> {
  const { data, error } = await supabase
    .from("app_config")
    .select("value")
    .eq("key", "ordemTerritoriosVisual")
    .maybeSingle();

  if (error) throw error;
  return (data?.value as string[]) || [];
}
