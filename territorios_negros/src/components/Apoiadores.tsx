// src/components/Apoiadores.tsx
//
// Página "Apoiadores" do app (rota /apoiadores): quem apoia o projeto, com logo,
// nome, uma frase sobre a contribuição e o link oficial (quando houver).
//
// O conteúdo é editável no painel, na aba Apoiadores (chave app_config
// "apoiadores"). O visitante só vê os apoiadores ligados e com nome ou logo.
import { useTerritorios } from "../context/useTerritorios";
import {
  CHAVE_APOIADORES,
  apoiadoresVisiveis,
  lerApoiadores,
  linkUtilizavel,
  nomeDoTipo,
  rotuloDoLink,
} from "../data/apoiadores";
import Inline from "./Inline";
import BotaoContato from "./BotaoContato";
import PageTitle from "./PageTitle";

export default function Apoiadores() {
  const { config } = useTerritorios();

  const pagina = lerApoiadores(config[CHAVE_APOIADORES]);
  const lista = apoiadoresVisiveis(pagina);

  return (
    <>
      <PageTitle title={pagina.titulo} />

      <div className="apoio-abertura">
        <Inline texto={pagina.texto} />
      </div>

      {lista.length === 0 ? (
        <p className="apoio-vazio">
          Ainda não há apoiadores publicados nesta página. Se você representa uma instituição,
          empresa ou coletivo — ou apoia de forma independente — e quer contribuir com esta
          experiência, escreva para a autoria.
        </p>
      ) : (
        <div className="apoio-lista">
          {lista.map((apoiador) => (
            <div className="apoio-cartao" key={apoiador.id}>
              {/* a participação combinada vem primeiro: é o que diferencia um
                  patrocínio de um acolhimento */}
              {nomeDoTipo(apoiador.tipo) && (
                <span className="apoio-tipo">{nomeDoTipo(apoiador.tipo)}</span>
              )}

              {apoiador.logo && (
                <img
                  className="apoio-logo"
                  src={apoiador.logo}
                  alt={apoiador.nome ? `Logo de ${apoiador.nome}` : "Logo do apoiador"}
                  loading="lazy"
                />
              )}

              {apoiador.nome && <b className="apoio-nome">{apoiador.nome}</b>}

              {apoiador.contribuicao && (
                <p className="apoio-contribuicao">
                  <Inline texto={apoiador.contribuicao} />
                </p>
              )}

              {linkUtilizavel(apoiador.link) && (
                <a
                  className="btn pagina-botao apoio-link"
                  href={linkUtilizavel(apoiador.link)}
                  target="_blank"
                  rel="noreferrer"
                >
                  {rotuloDoLink(apoiador.link)}
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      <BotaoContato tela="apoiadores" />
    </>
  );
}
