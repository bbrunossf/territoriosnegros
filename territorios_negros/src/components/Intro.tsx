import { useTerritorios } from "../context/useTerritorios";
import { INTRO_PADRAO, normalizarPagina } from "../data/paginas";
import { botoesDaIntro } from "../data/botoesIntro";
import PaginaConteudo from "./PaginaConteudo";

// Texto editável no painel (aba Páginas) — chave: pagina_intro
export default function Intro() {
  const { config } = useTerritorios();
  const doPainel = normalizarPagina(config.pagina_intro, INTRO_PADRAO);

  // A ordem dos botões desta tela é fixa (pedido da autoria, 02/10/2026):
  // base teórica · cidade de Vitória · presença negra · roteiros · territórios ·
  // apoiadores — e o "Enviar uma mensagem" fecha a tela, separado. Ver
  // data/botoesIntro.ts. O resto da página continua vindo do painel.
  const pagina = { ...doPainel, botoes: botoesDaIntro(doPainel.botoes) };

  return <PaginaConteudo pagina={pagina} tela="intro" />;
}
