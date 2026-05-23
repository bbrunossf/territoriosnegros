//Territorios.tsx
import dados from "../data/dados.json";

import PageTitle from "../components/PageTitle";
import SectionHeader from "../components/SectionHeader";

const { territorios } = dados;

const grupos = [
  {
    titulo: "Arquiteturas e religiosidade",
    ids: ["rosario", "saogoncalo"],
  },
  {
    titulo:
      "Institucionalização da memória e cultura negra",
    ids: ["mucane"],
  },
  {
    titulo: "Monumentos e marcos de memória",
    ids: ["grilhoes", "dona", "pelourinho"],
  },
  {
    titulo:
      "Espaços urbanos, infraestrutura e permanência",
    ids: [
      "praca",
      "chafariz",
      "vilarubim",
      "moscoso",
      "rua13",
    ],
  },
  {
    titulo:
      "Personalidades e trajetórias negras",
    ids: ["mariasaraiva", "zilda"],
  },
  {
    titulo: "Cultura e práticas",
    ids: ["sambao", "congo", "piedade"],
  },
];

type Props = {
  abrirTerritorio: (id: string) => void;
};

export default function Territorios({
  abrirTerritorio,
}: Props) {
  return (
    <>
      <PageTitle
        title="Territórios"
        subtitle="Consulta individual dos pontos do guia."
      />

      {grupos.map((g) => (
        <section key={g.titulo}>
          <SectionHeader title={g.titulo} />

          {g.ids.map((id) => (
            <button
              key={id}
              className="territorios-item"
              onClick={() =>
                abrirTerritorio(id)
              }
            >
              <img
                src={territorios[id].imagem}
                alt=""
                className="territorios-thumb"
              />

              <span>
                <b>
                  {territorios[id].nome}
                </b>

                <br />

                <small className="territorios-palavra">
                  {territorios[id].palavra}
                </small>
              </span>

              <b className="territorios-arrow">
                ›
              </b>
            </button>
          ))}
        </section>
      ))}
    </>
  );
}
