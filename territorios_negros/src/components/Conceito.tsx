import { useTerritorios } from "../context/useTerritorios";
import { CONCEITO_PADRAO, normalizarPagina } from "../data/paginas";
import PaginaConteudo from "./PaginaConteudo";

// Texto editável no painel (aba Páginas) — chave: pagina_conceito
export default function Conceito() {
  const { config } = useTerritorios();

  return (
    <PaginaConteudo pagina={normalizarPagina(config.pagina_conceito, CONCEITO_PADRAO)} />
  );
}
