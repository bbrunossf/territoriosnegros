// src/context/useTerritorios.ts
import { useContext } from "react";
import { DadosCtx } from "./dadosContext";

export function useTerritorios() {
  return useContext(DadosCtx);
}
