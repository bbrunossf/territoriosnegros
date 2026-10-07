import { useTerritorios } from "../context/useTerritorios";
import { INTRO_PADRAO, normalizarPagina } from "../data/paginas";
import { CHAVE_BOTOES_INTRO, botoesDaIntro, lerNomes } from "../data/botoesIntro";
import PaginaConteudo from "./PaginaConteudo";

// Texto editável no painel (aba Páginas) — chave: pagina_intro
// Nomes dos botões: painel, aba Botões — chave: botoes_intro
export default function Intro() {
  const { config } = useTerritorios();
  const doPainel = normalizarPagina(config.pagina_intro, INTRO_PADRAO);

  // Ordem e destinos são fixos do app (pedido da autoria, 02/10/2026):
  // base teórica · cidade de Vitória · presença negra · roteiros · territórios ·
  // apoiadores — e o "Enviar uma mensagem" fecha a tela, separado. Os nomes vêm
  // do painel (aba Botões). Ver data/botoesIntro.ts.
  const pagina = {
    ...doPainel,
    botoes: botoesDaIntro(doPainel.botoes, lerNomes(config[CHAVE_BOTOES_INTRO])),
  };

  return <PaginaConteudo pagina={pagina} tela="intro" />;
}
