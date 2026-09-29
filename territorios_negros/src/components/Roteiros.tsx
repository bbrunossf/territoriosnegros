import { useNavigate } from "react-router-dom";
import PageTitle from "../components/PageTitle";
import BotaoContato from "../components/BotaoContato";
import { useTerritorios } from "../context/useTerritorios";

export default function Roteiros() {
  const navigate = useNavigate();
  const { roteiros, inscricaoUrl } = useTerritorios();

  return (
    <>
      <PageTitle
        title="Percursos"
        subtitle="Escolha a rota conforme o contexto da visita, o público e as condições do percurso."
      />

      {roteiros.map((r) => {
        const experiencias = Array.isArray(r.experiencia) ? r.experiencia : [];
        const inscricao = r.inscricaoUrl || inscricaoUrl;

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
                <p className="roteiro-subtitle">{r.subtitulo}</p>
              </div>
              <span className="roteiro-level">{r.nivel}</span>
            </div>

            <div className="roteiro-section">
              <b>O que você vai vivenciar:</b>
              <ul className="roteiro-list">
                {experiencias.map((item: string, i: number) => (
                  <li key={`${r.id}-experiencia-${i}`}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="roteiro-section">
              <b>Acessibilidade:</b>
              <p className="roteiro-text">
                {r.acessibilidade || "Informação de acessibilidade em revisão."}
              </p>
            </div>

            <div className="roteiro-count">
              <b>Quantidade de territórios:</b> {r.pontos?.length ?? 0}
            </div>

            <button
              className="btn roteiro-btn"
              onClick={() => navigate(`/percurso/${r.id}`)}
            >
              Iniciar percurso
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
