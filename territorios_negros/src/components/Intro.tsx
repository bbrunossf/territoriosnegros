import { useTerritorios } from "../context/useTerritorios";
import { INTRO_PADRAO, normalizarPagina } from "../data/paginas";
import { jaTemBotao } from "../data/botaoContato";
import BotaoApoiadores from "./BotaoApoiadores";
import BotaoPresencaNegra from "./BotaoPresencaNegra";
import PaginaConteudo from "./PaginaConteudo";

// Texto editável no painel (aba Páginas) — chave: pagina_intro
export default function Intro() {
  const { config } = useTerritorios();
  const pagina = normalizarPagina(config.pagina_intro, INTRO_PADRAO);

  return (
    <PaginaConteudo
      pagina={pagina}
      tela="intro"
      // "Presença Negra na Cidade" junto dos botões da página (pedido da autoria,
      // 02/10/2026). Se a autoria já tiver posto um botão para esta página no
      // painel, este não entra — o visitante não vê dois botões iguais.
      depoisDosBotoes={
        <BotaoPresencaNegra jaExiste={jaTemBotao(pagina.botoes, "/presenca-negra")} />
      }
      // botão "Apoiadores" logo depois do botão de contato
      depoisDoContato={<BotaoApoiadores />}
    />
  );
}
