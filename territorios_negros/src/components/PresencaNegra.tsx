// src/components/PresencaNegra.tsx
//
// Página "Presença Negra na Cidade" (pedido da autoria, 02/10/2026).
//
// Nasceu do desmembramento de "A cidade de Vitória": o bloco "Uma cidade
// construída com presença negra" ganhou página própria para aprofundar e, mais
// adiante, receber as biografias das personalidades negras de Vitória.
//
// É uma página de texto como as outras: tudo se edita no painel, aba Páginas
// (chave: pagina_presenca_negra) — blocos, destaques, listas, imagens e links.
// Os nomes dos botões de navegação: painel, aba Botões (chave: botoes_intro).
import { useTerritorios } from "../context/useTerritorios";
import { PRESENCA_PADRAO, normalizarPagina } from "../data/paginas";
import { botoesDaPagina } from "../data/botoesPorTela";
import BotoesDaTela from "./BotoesDaTela";
import PaginaConteudo from "./PaginaConteudo";
import MarcosConexoes from "./MarcosConexoes";
import { CHAVE_PRESENCA_NEGRA } from "../data/marcos";

export default function PresencaNegra() {
  const { config } = useTerritorios();
  const doPainel = normalizarPagina(config.pagina_presenca_negra, PRESENCA_PADRAO);

  // Os mesmos seis botões de navegação fecham esta página (pedido da autoria,
  // 02/10/2026), como já acontece no fim da tela Antes de caminhar e da Base
  // teórica: Base teórica · A cidade de Vitória · Presença Negra · Roteiros ·
  // Territórios · Apoiadores — e, depois deles, separado por um respiro maior, o
  // "Enviar uma mensagem". Ver data/botoesIntro.ts.
  const pagina = {
    ...doPainel,
    botoes: botoesDaPagina(config, "presenca-negra", doPainel.botoes),
  };

  return (
    <PaginaConteudo
      pagina={pagina}
      tela="presenca-negra"
      antesDosBotoes={<MarcosConexoes chaveDaPagina={CHAVE_PRESENCA_NEGRA} />}
      // no topo, o caminho de volta para A cidade de Vitória — a página de que
      // esta nasceu (pedido da autoria, 02/10/2026)
      depoisDoTitulo={<BotoesDaTela tela="presenca-negra" posicao="topo" />}
    />
  );
}
