import { Link } from "react-router-dom";

import { useTerritorios } from "../context/useTerritorios";
import { textosDaFicha, urlParaIncorporar } from "../utils/ficha";
import BotoesDaTela from "./BotoesDaTela";

/** Ficha de inscrição dentro do app (14/10/2026): antes o botão abria o formulário
 *  em outra guia, e a autoria observou que quem não tem prática pode não conseguir
 *  voltar ao app. Aqui a ficha fica numa moldura, com o caminho de volta logo
 *  abaixo — inclusive depois do envio, quando o Google mostra a confirmação.
 *  Os rótulos (título e os dois botões de volta) são editáveis no painel, na aba
 *  Página inicial, seção "Tela da ficha de inscrição". */
export default function FichaInscricao() {
  const { proximoTour, inscricaoUrl, config, inscricoes } = useTerritorios();

  const inscricao = proximoTour?.inscricaoUrl || inscricaoUrl;
  const dentro = urlParaIncorporar(inscricao);
  const textos = textosDaFicha(config.ficha_textos);

  // inscrições encerradas (15/10/2026): quem chegar por um link antigo vê o
  // aviso, e não uma ficha que não vale mais
  if (inscricoes.encerradas) {
    return (
      <section className="ficha">
        <h1 className="page-title ficha-titulo">{textos.titulo}</h1>

        <p className="evento-encerrado">{inscricoes.aviso}</p>

        <p className="ficha-ajuda">
          <Link to="/evento">Voltar para as informações do evento</Link>
        </p>
      </section>
    );
  }

  return (
    <section className="ficha">
      {/* botões que a autoria escolheu para o topo da ficha (menu Botões) */}
      <BotoesDaTela tela="ficha" posicao="topo" />

      <h1 className="page-title ficha-titulo">{textos.titulo}</h1>

      {dentro ? (
        <>
          <iframe
            className="ficha-moldura"
            src={dentro}
            title="Ficha de inscrição do próximo evento"
            loading="lazy"
          />

          <p className="ficha-ajuda">
            Preencha e envie aqui mesmo, sem sair do app. Se a ficha não abrir
            nesta tela,{" "}
            <a href={inscricao} target="_blank" rel="noreferrer">
              abra em outra guia
            </a>
            .
          </p>
        </>
      ) : (
        <p className="ficha-ajuda">
          A ficha de inscrição ainda não está disponível.
        </p>
      )}

      {/* botões que a autoria escolheu para o fim da ficha (menu Botões) */}
      <BotoesDaTela tela="ficha" posicao="final" />

      <div className="pagina-botoes">
        <Link className="botao-secundario pagina-botao" to="/evento">
          {textos.voltarEvento}
        </Link>

        <Link className="botao-secundario pagina-botao" to="/">
          {textos.voltarInicio}
        </Link>
      </div>
    </section>
  );
}
