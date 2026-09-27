// src/context/TerritoriosContext.tsx
// Carrega territórios, rotas, categorias e configurações do Supabase de uma vez
// e distribui para o app. O hook de acesso vive em useTerritorios.ts.

import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  fetchCategorias,
  fetchConfig,
  fetchRoteiros,
  fetchTerritorios,
  normalizarProximoTour,
} from "../data/api";
import type { Categoria, Roteiro, TerritoriosMap } from "../data/types";
import { ordenarTerritorios, roteirosVisiveis } from "../utils/catalogo";
import { DadosCtx } from "./dadosContext";

export function TerritoriosProvider({ children }: { children: ReactNode }) {
  const [territorios, setTerritorios] = useState<TerritoriosMap>({});
  const [todosRoteiros, setTodosRoteiros] = useState<Roteiro[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [config, setConfig] = useState<Record<string, unknown>>({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    try {
      const [t, r, c, cfg] = await Promise.all([
        fetchTerritorios(),
        fetchRoteiros(),
        fetchCategorias(),
        fetchConfig(),
      ]);

      setTerritorios(t);
      setTodosRoteiros(r);
      setCategorias(c);
      setConfig(cfg);
      setErro(null);
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao carregar os dados.");
    }
  }, []);

  useEffect(() => {
    let ativo = true;

    (async () => {
      await recarregar();
      if (ativo) setCarregando(false);
    })();

    return () => {
      ativo = false;
    };
  }, [recarregar]);

  const proximoTourBruto = normalizarProximoTour(config.proximo_tour);
  const proximoTour = proximoTourBruto?.ativo ? proximoTourBruto : null;

  const inscricaoGeral = typeof config.inscricao_url === "string" ? config.inscricao_url : "";
  const inscricaoUrl = inscricaoGeral || proximoTourBruto?.inscricaoUrl || "";

  return (
    <DadosCtx.Provider
      value={{
        territorios,
        roteiros: roteirosVisiveis(todosRoteiros),
        todosRoteiros,
        categorias,
        config,
        proximoTour,
        inscricaoUrl,
        ordemTerritoriosVisual: ordenarTerritorios(territorios, categorias).map((t) => t.id),
        carregando,
        erro,
        recarregar,
      }}
    >
      {children}
    </DadosCtx.Provider>
  );
}
