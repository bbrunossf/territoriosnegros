// src/components/Apoiadores.tsx
//
// Página "Apoiadores" do app (rota /apoiadores): quem apoia o projeto, com logo,
// nome, uma frase sobre a contribuição e o link oficial (quando houver).
//
// O conteúdo é editável no painel, na aba Apoiadores (chave app_config
// "apoiadores"). O visitante só vê os apoiadores ligados e com nome ou logo.
import { useTerritorios } from "../context/useTerritorios";
import BotoesDaTela from "./BotoesDaTela";
import {
  CHAVE_APOIADORES,
  apoiadoresVisiveis,
  lerApoiadores,
  linksDoApoiador,
  nomeDoTipo,
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

      {/* botões que a autoria escolheu para o topo (aba Botões, "Em cada tela") */}
      <BotoesDaTela tela="apoiadores" posicao="topo" />

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
          {lista.map((apoiador) => {
            const contatos = linksDoApoiador(apoiador);
            const temDetalhe = !!apoiador.contribuicao || !!apoiador.foto || contatos.length > 0;

            const cabecalho = (
              <>
                {apoiador.logo && (
                  <img
                    className="apoio-logo"
                    src={apoiador.logo}
                    alt={apoiador.nome ? `Logo de ${apoiador.nome}` : "Logo do apoiador"}
                    loading="lazy"
                  />
                )}

                <span className="apoio-identidade">
                  {/* a participação vem antes: é o que diferencia um patrocínio
                      de um acolhimento */}
                  {nomeDoTipo(apoiador.tipo) && (
                    <span className="apoio-tipo">{nomeDoTipo(apoiador.tipo)}</span>
                  )}

                  {apoiador.nome && <span className="apoio-nome">{apoiador.nome}</span>}
                </span>

                {/* sinal de que há mais conteúdo: vira × quando abre */}
                {temDetalhe && (
                  <span className="apoio-abrir" aria-hidden="true">
                    +
                  </span>
                )}
              </>
            );

            return (
              <details className="apoio-cartao" key={apoiador.id}>
                {temDetalhe ? (
                  <summary className="apoio-topo">{cabecalho}</summary>
                ) : (
                  <div className="apoio-topo">{cabecalho}</div>
                )}

                {temDetalhe && (
                  <div className="apoio-detalhe">
                    {apoiador.contribuicao && (
                      <p className="apoio-contribuicao">
                        <Inline texto={apoiador.contribuicao} />
                      </p>
                    )}

                    {/* foto do apoiador ou do espaço: entra quando a autoria enviar uma */}
                    {apoiador.foto && (
                      <img
                        className="apoio-foto"
                        src={apoiador.foto}
                        alt={apoiador.nome ? `Foto de ${apoiador.nome}` : "Foto do apoiador"}
                        loading="lazy"
                      />
                    )}

                    {contatos.length > 0 && (
                      <div className="apoio-contatos">
                        {contatos.map((contato) => (
                          <a
                            key={contato.url}
                            className="apoio-contato"
                            href={contato.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {contato.rotulo}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </details>
            );
          })}
        </div>
      )}

      <BotoesDaTela tela="apoiadores" posicao="final" />

      <BotaoContato tela="apoiadores" />
    </>
  );
}
