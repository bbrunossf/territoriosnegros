import { useTerritorios } from "../context/useTerritorios";
import { FIM_PADRAO, normalizarPagina } from "../data/paginas";
import BotoesDaTela from "./BotoesDaTela";
import PaginaConteudo from "./PaginaConteudo";

// Texto editável no painel (aba Páginas) — chave: pagina_fim
export default function Fim() {
  const { config } = useTerritorios();

  return (
    <>
      {/* botões que a autoria escolheu para o topo desta tela (menu Botões) */}
      <BotoesDaTela tela="fim" posicao="topo" />

      <PaginaConteudo
        pagina={normalizarPagina(config.pagina_fim, FIM_PADRAO)}
        tela="fim"
        /* antes do "Enviar uma mensagem", como nas outras telas */
        antesDosBotoes={<BotoesDaTela tela="fim" posicao="final" />}
      />
    </>
  );
}
