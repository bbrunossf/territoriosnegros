
import dados from "../data/dados.json";

import PageTitle from "../components/PageTitle";

const { roteiros } = dados;

type Props = {
  irParaRota: (id: string) => void;
};

export default function Roteiros({
  irParaRota,
}: Props) {
  return (
    <>
      <PageTitle
        title="Percursos"
        subtitle="Escolha a rota conforme o contexto da visita, o público e as condições do percurso."
      />

      {roteiros.map((r) => {
        const experiencias = Array.isArray(
          r.experiencia
        )
          ? r.experiencia
          : [];

        return (
          <article
            key={r.id}
            className="roteiro-card"
          >
            <div className="roteiro-header">
              <div>
                <b className="roteiro-title">
                  {r.nome}
                </b>

                <p className="roteiro-subtitle">
                  {r.subtitulo}
                </p>
              </div>

              <span className="roteiro-level">
                {r.nivel}
              </span>
            </div>

            <div className="roteiro-section">
              <b>
                O que você vai vivenciar:
              </b>

              <ul className="roteiro-list">
                {experiencias.map(
                  (
                    item: string,
                    i: number
                  ) => (
                    <li
                      key={`${r.id}-experiencia-${i}`}
                    >
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>

            <div className="roteiro-section">
              <b>Acessibilidade:</b>

              <p className="roteiro-text">
                {r.acessibilidade ||
                  "Informação de acessibilidade em revisão."}
              </p>
            </div>

            <div className="roteiro-count">
              <b>
                Quantidade de territórios:
              </b>{" "}
              {r.pontos.length}
            </div>

            <button
              className="btn roteiro-btn"
              onClick={() =>
                irParaRota(r.id)
              }
            >
              Iniciar percurso
            </button>
          </article>
        );
      })}
    </>
  );
}
