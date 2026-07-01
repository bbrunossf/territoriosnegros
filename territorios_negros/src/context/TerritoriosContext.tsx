// src/context/TerritoriosContext.tsx

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { fetchTerritorios } from "../data/territorios";
import { fetchRoteiros, fetchOrdemTerritoriosVisual } from "../data/roteiros";
import type { TerritoriosMap, Roteiro } from "../data/types";

interface DadosContextType {
  territorios: TerritoriosMap;
  roteiros: Roteiro[];
  ordemTerritoriosVisual: string[];
  carregando: boolean;
}

const Ctx = createContext<DadosContextType>({
  territorios: {},
  roteiros: [],
  ordemTerritoriosVisual: [],
  carregando: true,
});

export function TerritoriosProvider({ children }: { children: ReactNode }) {
  const [territorios, setTerritorios] = useState<TerritoriosMap>({});
  const [roteiros, setRoteiros] = useState<Roteiro[]>([]);
  const [ordem, setOrdem] = useState<string[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchTerritorios(),
      fetchRoteiros(),
      fetchOrdemTerritoriosVisual(),
    ])
      .then(([t, r, o]) => {
        setTerritorios(t);
        setRoteiros(r);
        setOrdem(o);
      })
      .catch(console.error)
      .finally(() => setCarregando(false));
  }, []);

  return (
    <Ctx.Provider value={{ territorios, roteiros, ordemTerritoriosVisual: ordem, carregando }}>
      {children}
    </Ctx.Provider>
  );
}

export function useTerritorios() {
  return useContext(Ctx);
}
