import { useTerritorios } from "../context/useTerritorios";
import { VITORIA_PADRAO, normalizarPagina } from "../data/paginas";
import AtalhosDaTela from "./AtalhosDaTela";
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
      // presença negra na cidade e, por fim, os territórios — nesta ordem padrão,
      // que a autoria pode mudar na aba Botões
      depoisDoTitulo={
        <AtalhosDaTela
          ids={["ir-para-base-teorica", "presenca-na-cidade-de-vitoria", "ir-para-os-territorios"]}
        />
      }
    />
  );
}
