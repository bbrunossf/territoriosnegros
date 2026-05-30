// src/context/TerritoriosContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { fetchTerritorios } from "../data/territorios";
import type { TerritoriosMap } from "../data/types";

interface TerritoriosContextType {
  territorios: TerritoriosMap;
  carregando: boolean;
}

const Ctx = createContext<TerritoriosContextType>({ territorios: {}, carregando: true });

export function TerritoriosProvider({ children }: { children: ReactNode }) {
  const [territorios, setTerritorios] = useState<TerritoriosMap>({});
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetchTerritorios()
      .then(setTerritorios)
      .catch(console.error)
      .finally(() => setCarregando(false));
  }, []);

  return <Ctx.Provider value={{ territorios, carregando }}>{children}</Ctx.Provider>;
}

export function useTerritorios() {
  return useContext(Ctx);
}
