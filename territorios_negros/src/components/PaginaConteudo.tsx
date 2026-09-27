import { Link } from "react-router-dom";

import Info from "../components/Info";
import Inline from "../components/Inline";
import { paragrafosDe } from "../utils/texto";
import Numbered from "../components/Numbered";
import PageTitle from "../components/PageTitle";
import Topic from "../components/Topic";

import type { PaginaConteudo } from "../data/conteudoPadrao";

/**
 * Renderiza uma página de texto editável no painel (título, bloco destacado,
 * blocos com parágrafos e lista, mapa e botão para os roteiros).
 */
export default function PaginaConteudo({ pagina }: { pagina: PaginaConteudo }) {
  const destaque = paragrafosDe(pagina.destaque);

  return (
    <>
      <PageTitle title={pagina.titulo} subtitle={pagina.subtitulo} />

      {destaque.length === 1 && <Info>{<Inline texto={destaque[0]} />}</Info>}

      {destaque.length > 1 && (
        <Info>
          {destaque.map((p, i) => (
            <p key={i}>
              <Inline texto={p} />
            </p>
          ))}
        </Info>
      )}

      {pagina.blocos.map((bloco, i) => (
        <Topic
          key={`${bloco.titulo}-${i}`}
          icon={bloco.icone || "•"}
          title={bloco.titulo}
        >
          {paragrafosDe(bloco.texto).map((p, j) => (
            <p key={j}>
              <Inline texto={p} />
            </p>
          ))}

          {bloco.itens.length > 0 && <Numbered items={bloco.itens} />}
        </Topic>
      ))}

      {pagina.mapaUrl && (
        <Info>
          <b>{pagina.mapaTexto || "Mapa:"}</b>
          <br />

          <a
            href={pagina.mapaUrl}
            target="_blank"
            rel="noreferrer"
            className="conceito-link"
          >
            Abrir no mapa
          </a>
        </Info>
      )}

      {pagina.botaoTexto && (
        <Link to="/roteiros" className="btn conceito-btn">
          <Inline texto={pagina.botaoTexto} />
        </Link>
      )}
    </>
  );
}
