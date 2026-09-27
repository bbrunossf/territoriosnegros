import { useTerritorios } from "../context/useTerritorios";
import { FIM_PADRAO, normalizarPagina } from "../data/paginas";
import PaginaConteudo from "./PaginaConteudo";

// Texto editável no painel (aba Páginas) — chave: pagina_fim
export default function Fim() {
  const { config } = useTerritorios();

  return (
    <PaginaConteudo pagina={normalizarPagina(config.pagina_fim, FIM_PADRAO)} />
  );
}
