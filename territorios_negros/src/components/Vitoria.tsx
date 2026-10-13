import { useTerritorios } from "../context/useTerritorios";
import { VITORIA_PADRAO, normalizarPagina } from "../data/paginas";
import BotaoBaseTeorica from "./BotaoBaseTeorica";
import BotaoPresencaNegra from "./BotaoPresencaNegra";
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
      // primeiro a base teórica que sustenta a leitura, depois a página da
      // presença negra na cidade e, por fim, os territórios
      depoisDoTitulo={
        <>
          <BotaoBaseTeorica />
          <BotaoPresencaNegra
            id="presenca-na-cidade-de-vitoria"
            texto="Presença Negra na Cidade de Vitória"
          />
          <BotaoTerritorios />
        </>
      }
    />
  );
}
