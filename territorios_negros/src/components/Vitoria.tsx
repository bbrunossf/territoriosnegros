import { useTerritorios } from "../context/useTerritorios";
import { VITORIA_PADRAO, normalizarPagina } from "../data/paginas";
import { botoesDaPagina } from "../data/botoesPorTela";
import MarcosConexoes from "./MarcosConexoes";
import { CHAVE_CIDADE } from "../data/marcos";
import BotoesDaTela from "./BotoesDaTela";
import PaginaConteudo from "./PaginaConteudo";

// Texto editável no painel (aba Páginas) — chave: pagina_vitoria
export default function Vitoria() {
  const { config } = useTerritorios();

  const doPainel = normalizarPagina(config.pagina_vitoria, VITORIA_PADRAO);

  // os botões que fecham a página entram no MESMO grupo dos atalhos do topo
  // (padrão da Base teórica, pedido da autoria em 02/10/2026) — os que a autoria
  // criou em Páginas continuam entrando, sem repetir destino e sem "Ir para…"
  const pagina = {
    ...doPainel,
    botoes: botoesDaPagina(config, "vitoria", doPainel.botoes),
  };

  return (
    <PaginaConteudo
      pagina={pagina}
      tela="vitoria"
      antesDosBotoes={<MarcosConexoes chaveDaPagina={CHAVE_CIDADE} />}
      // atalhos fixos logo abaixo do subtítulo (pedidos da autoria, 02/10/2026):
      // primeiro a base teórica que sustenta a leitura, depois a página da
      // presença negra na cidade e, por fim, os territórios — nesta ordem padrão,
      // que a autoria pode mudar na aba Botões
      depoisDoTitulo={<BotoesDaTela tela="vitoria" posicao="topo" />}
    />
  );
}
