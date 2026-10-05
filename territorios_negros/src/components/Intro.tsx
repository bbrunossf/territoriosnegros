import { useTerritorios } from "../context/useTerritorios";
import { INTRO_PADRAO, normalizarPagina } from "../data/paginas";
import BotaoApoiadores from "./BotaoApoiadores";
import PaginaConteudo from "./PaginaConteudo";

// Texto editável no painel (aba Páginas) — chave: pagina_intro
export default function Intro() {
  const { config } = useTerritorios();

  return (
    <PaginaConteudo
      pagina={normalizarPagina(config.pagina_intro, INTRO_PADRAO)}
      tela="intro"
      // botão "Apoiadores" logo depois do botão de contato (só quando há apoiador ligado)
      depoisDoContato={<BotaoApoiadores />}
    />
  );
}
