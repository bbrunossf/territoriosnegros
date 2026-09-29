import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import Info from "../components/Info";
import Inline from "../components/Inline";
import Numbered from "../components/Numbered";
import PageTitle from "../components/PageTitle";
import Topic from "../components/Topic";
import FotoAmpliavel from "../components/FotoAmpliavel";

import { imagensVisiveis, classesEstilo } from "../data/paginas";
import type { BotaoConteudo, PaginaConteudo } from "../data/paginas";

import { paragrafosDe } from "../utils/texto";

function Botao({ botao }: { botao: BotaoConteudo }) {
  const classe = `${botao.estilo} pagina-botao`;
  const externo = /^https?:/i.test(botao.url);

  if (externo) {
    return (
      <a className={classe} href={botao.url} target="_blank" rel="noreferrer">
        <Inline texto={botao.texto} />
      </a>
    );
  }

  return (
    <Link className={classe} to={botao.url || "/"}>
      <Inline texto={botao.texto} />
    </Link>
  );
}

/**
 * Renderiza uma página de texto: título, bloco destacado, blocos (parágrafos,
 * lista, caixa destacada e links), caixa final com link e botões.
 * O conteúdo vem do painel (aba Páginas) com o texto padrão como reserva.
 */
export default function PaginaConteudo({
  pagina,
  children,
}: {
  pagina: PaginaConteudo;
  children?: ReactNode;
}) {
  const destaque = paragrafosDe(pagina.destaque);
  const classesDestaque = classesEstilo(pagina.destaqueEstilo);

  const conteudo = (
    <>
      <PageTitle
        title={pagina.titulo}
        subtitle={pagina.subtitulo}
        titleClassName={classesEstilo(pagina.tituloEstilo, "titulo")}
        subtitleClassName={classesEstilo(pagina.subtituloEstilo, "titulo")}
      />

      {destaque.length === 1 && (
        <Info>
          <div className={classesDestaque}>
            <Inline texto={destaque[0]} />
          </div>
        </Info>
      )}

      {destaque.length > 1 && (
        <Info>
          <div className={classesDestaque}>
            {destaque.map((p, i) => (
              <p key={i}>
                <Inline texto={p} />
              </p>
            ))}
          </div>
        </Info>
      )}

      {children}

      {pagina.blocos.map((bloco, i) => {
        // imagens que a autoria liberou para os visitantes
        const imagens = imagensVisiveis(bloco.imagens);

        const galeria =
          imagens.length > 0 ? (
            <div className="territorio-galeria bloco-galeria">
              {imagens.map((imagem, k) => (
                <FotoAmpliavel
                  key={`${imagem.url}-${k}`}
                  url={imagem.url}
                  alt={imagem.legenda || bloco.titulo}
                  legenda={imagem.legenda}
                  credito={imagem.credito}
                />
              ))}
            </div>
          ) : null;

        return (
          <Topic
            key={`${bloco.titulo}-${i}`}
            icon={bloco.icone || "•"}
            title={bloco.titulo}
            className={classesEstilo(bloco.estilo)}
            titleClassName={classesEstilo(bloco.tituloEstilo, "titulo")}
          >
            {paragrafosDe(bloco.texto).map((p, j) => (
              <p key={j}>
                <Inline texto={p} />
              </p>
            ))}

            {bloco.posicaoImagens === "aposTexto" && galeria}

            {bloco.itens.length > 0 && <Numbered items={bloco.itens} />}

            {bloco.destaque && (
              <Info>
                <Inline texto={bloco.destaque} />
              </Info>
            )}

            {bloco.posicaoImagens !== "aposTexto" && galeria}

            {bloco.links.length > 0 && (
              <ul className="sobre-list">
                {bloco.links.map((link, k) => (
                  <li key={`${link.url}-${k}`}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="sobre-link"
                    >
                      <Inline texto={link.texto} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Topic>
        );
      })}

      {pagina.rodapeUrl && (
        <Info>
          <b>{pagina.rodapeTexto || "Link:"}</b>
          <br />

          <a
            href={pagina.rodapeUrl}
            target="_blank"
            rel="noreferrer"
            className="conceito-link"
          >
            <Inline texto={pagina.rodapeLinkTexto || "Abrir"} />
          </a>
        </Info>
      )}

      {pagina.botoes.length > 0 && (
        <div className="pagina-botoes">
          {pagina.botoes.map((botao, i) => (
            <Botao key={`${botao.texto}-${i}`} botao={botao} />
          ))}
        </div>
      )}
    </>
  );

  if (pagina.classe) return <div className={pagina.classe}>{conteudo}</div>;

  return conteudo;
}
