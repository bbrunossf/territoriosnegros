import { Link } from "react-router-dom";

import { useTerritorios } from "../context/useTerritorios";

/** Converte o link salvo no painel na URL que o Google Forms aceita dentro de uma
 *  moldura. O `?embedded=true` é o modo que o próprio Google fornece para
 *  incorporar o formulário; links que não são do Google Forms (ou links curtos
 *  forms.gle) são usados como vieram. */
export function urlParaIncorporar(url: string): string {
  if (!url) return "";

  try {
    const u = new URL(url);

    if (u.hostname === "docs.google.com" && u.pathname.includes("/forms/")) {
      u.searchParams.set("embedded", "true");
      return u.toString();
    }
  } catch {
    // link inválido: devolve como veio, para o navegador tentar
  }

  return url;
}

/** Ficha de inscrição dentro do app (14/10/2026): antes o botão abria o formulário
 *  em outra guia, e a autoria observou que quem não tem prática pode não conseguir
 *  voltar ao app. Aqui a ficha fica numa moldura, com o caminho de volta logo
 *  abaixo — inclusive depois do envio, quando o Google mostra a confirmação. */
export default function FichaInscricao() {
  const { proximoTour, inscricaoUrl } = useTerritorios();

  const inscricao = proximoTour?.inscricaoUrl || inscricaoUrl;
  const dentro = urlParaIncorporar(inscricao);

  return (
    <section className="ficha">
      <h1 className="page-title ficha-titulo">Ficha de inscrição</h1>

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

      <div className="pagina-botoes">
        <Link className="botao-secundario pagina-botao" to="/evento">
          Voltar para as informações do evento
        </Link>

        <Link className="botao-secundario pagina-botao" to="/">
          Voltar para a tela inicial
        </Link>
      </div>
    </section>
  );
}
