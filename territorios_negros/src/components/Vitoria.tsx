import { useTerritorios } from "../context/useTerritorios";
import {
  VITORIA_PADRAO,
  normalizarPagina,
} from "../data/conteudoPadrao";
import PaginaConteudo from "./PaginaConteudo";

// Vitoria.tsx — contexto básico da cidade, agora editável no painel (aba Vitória)
export default function Vitoria() {
  const { config } = useTerritorios();

  const pagina = normalizarPagina(config.pagina_vitoria, VITORIA_PADRAO);

  return <PaginaConteudo pagina={pagina} />;
}
