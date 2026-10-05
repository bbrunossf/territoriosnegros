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
import BotaoContato from "./BotaoContato";

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
  tela,
  rodapeNoTopo = false,
  depoisDoContato,
}: {
  pagina: PaginaConteudo;
  children?: ReactNode;
  /**
   * qual tela é esta (ver TELAS_BOTAO, em data/botaoContato.ts). Serve para o
   * botão "Enviar uma mensagem" do fim da página. Sem tela, o botão não entra.
   */
  tela?: string;
  /**
   * Mostra a caixa do link final TAMBÉM logo abaixo do título. Pedido da autoria
   * para a Base teórica: o acesso ao TCC completo ficava só no fim da página.
   */
  rodapeNoTopo?: boolean;
  /**
   * Conteúdo extra logo DEPOIS do botão "Enviar uma mensagem" (ex.: o botão
   * "Apoiadores" na tela "Antes de caminhar").
   */
  depoisDoContato?: ReactNode;
}) {
  const destaque = paragrafosDe(pagina.destaque);
  const classesDestaque = classesEstilo(pagina.destaqueEstilo);

  /** Caixa final: texto + link (ex.: "TCC completo: Acessar no Repositório da UFES"). */
  const caixaDoRodape = pagina.rodapeUrl ? (
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
  ) : null;

  const conteudo = (
    <>
      <PageTitle
        title={pagina.titulo}
        subtitle={pagina.subtitulo}
        titleClassName={classesEstilo(pagina.tituloEstilo, "titulo")}
        subtitleClassName={classesEstilo(pagina.subtituloEstilo, "titulo")}
      />

      {/* mesma caixa do fim da página, repetida no topo quando a tela pede */}
      {rodapeNoTopo && caixaDoRodape && (
        <div className="rodape-topo">{caixaDoRodape}</div>
      )}

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
              <p key={i} className="texto-paragrafo">
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
              <p key={j} className="texto-paragrafo">
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

      {pagina.rodapeUrl && caixaDoRodape}

      {pagina.botoes.length > 0 && (
        <div className="pagina-botoes">
          {pagina.botoes.map((botao, i) => (
            <Botao key={`${botao.texto}-${i}`} botao={botao} />
          ))}
        </div>
      )}

      {tela && <BotaoContato tela={tela} botoes={pagina.botoes} />}

      {depoisDoContato}
    </>
  );

  if (pagina.classe) return <div className={pagina.classe}>{conteudo}</div>;

  return conteudo;
}
