import { useNavigate } from "react-router-dom";
import PageTitle from "../components/PageTitle";
import BotaoContato from "../components/BotaoContato";
import Inline from "../components/Inline";
import { useTerritorios } from "../context/useTerritorios";
import { sloganDaRota } from "../data/slogansRota";
import { paragrafosDe } from "../utils/texto";

export default function Roteiros() {
  const navigate = useNavigate();
  const { roteiros, inscricaoUrl, config } = useTerritorios();

  return (
    <>
      <PageTitle
        title="Percursos"
        subtitle="Escolha a rota conforme o contexto da visita, o público e as condições do percurso."
      />

      {roteiros.map((r) => {
        const experiencias = Array.isArray(r.experiencia) ? r.experiencia : [];
        const inscricao = r.inscricaoUrl || inscricaoUrl;
        const slogan = sloganDaRota(config, r.id);

        return (
          <article key={r.id} className="roteiro-card">
            {r.logo && (
              <img
                src={r.logo}
                alt={`Logo ${r.nome}`}
                className="roteiro-logo"
              />
            )}

            <div className="roteiro-header">
              <div>
                <b className="roteiro-title">{r.nome}</b>

                {/* Slogan da rota (campo do painel): frase de abertura, logo
                    abaixo do nome — antes do início/conclusão do percurso. */}
                {slogan && (
                  <div className="roteiro-slogan">
                    {paragrafosDe(slogan).map((paragrafo, i) => (
                      <p key={i}>
                        <Inline texto={paragrafo} />
                      </p>
                    ))}
                  </div>
                )}

                <p className="roteiro-subtitle">
                  <Inline texto={r.subtitulo} />
                </p>
              </div>
            </div>

            <div className="roteiro-section">
              <b>O que você vai vivenciar:</b>
              <ul className="roteiro-list">
                {experiencias.map((item: string, i: number) => (
                  <li key={`${r.id}-experiencia-${i}`}>
                    <Inline texto={item} />
                  </li>
                ))}
              </ul>
            </div>

            <div className="roteiro-section">
              <b>Acessibilidade:</b>
              <p className="roteiro-text">
                {r.acessibilidade ? (
                  <Inline texto={r.acessibilidade} />
                ) : (
                  "Informação de acessibilidade em revisão."
                )}
              </p>
            </div>

            <div className="roteiro-count">
              <b>Quantidade de territórios:</b> {r.pontos?.length ?? 0}
            </div>

            {/* Nível de dificuldade logo ACIMA do botão de iniciar (pedido da
                autoria, 02/10/2026): antes ficava no topo, ao lado do título, e
                a pessoa só via a informação depois de decidir começar. */}
            {r.nivel && (
              <div className="roteiro-nivel">
                <span className="roteiro-level">{r.nivel}</span>
              </div>
            )}

            <button
              className="btn roteiro-btn roteiro-btn-principal"
              onClick={() => navigate(`/percurso/${r.id}`)}
            >
              Iniciar rota
            </button>

            {r.mapaUrl && (
              <a
                className="outline roteiro-btn"
                href={r.mapaUrl}
                target="_blank"
                rel="noreferrer"
              >
                Ver o traçado no mapa
              </a>
            )}

            {inscricao && (
              <a
                className="outline roteiro-btn"
                href={inscricao}
                target="_blank"
                rel="noreferrer"
              >
                Ficha de inscrição
              </a>
            )}
          </article>
        );
      })}

      {roteiros.length === 0 && (
        <p className="aviso-vazio">
          Nenhuma rota disponível no momento.
        </p>
      )}

      <BotaoContato tela="roteiros" />
    </>
  );
}
