import { useTerritorios } from "../context/useTerritorios";
import { VITORIA_PADRAO, normalizarPagina } from "../data/paginas";
import BotaoBaseTeorica from "./BotaoBaseTeorica";
import BotaoTerritorios from "./BotaoTerritorios";
import PaginaConteudo from "./PaginaConteudo";

// Texto editável no painel (aba Páginas) — chave: pagina_vitoria
export default function Vitoria() {
  const { config } = useTerritorios();

  return (
    <PaginaConteudo
      pagina={normalizarPagina(config.pagina_vitoria, VITORIA_PADRAO)}
      tela="vitoria"
      // atalhos fixos logo abaixo do subtítulo (pedidos da autoria, 02/10/2026):
      // primeiro a base teórica que sustenta a leitura, depois os territórios
      depoisDoTitulo={
        <>
          <BotaoBaseTeorica />
          <BotaoTerritorios />
        </>
      }
    />
  );
}
