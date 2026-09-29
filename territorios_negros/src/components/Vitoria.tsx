import { useTerritorios } from "../context/useTerritorios";
import { VITORIA_PADRAO, normalizarPagina } from "../data/paginas";
import PaginaConteudo from "./PaginaConteudo";

// Texto editável no painel (aba Páginas) — chave: pagina_vitoria
export default function Vitoria() {
  const { config } = useTerritorios();

  return (
    <PaginaConteudo
      pagina={normalizarPagina(config.pagina_vitoria, VITORIA_PADRAO)}
      tela="vitoria"
    />
  );
}
