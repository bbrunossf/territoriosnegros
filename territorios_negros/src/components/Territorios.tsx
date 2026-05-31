//Territorios.tsx
import { useNavigate } from "react-router-dom";
import { useTerritorios } from "../context/TerritoriosContext";

import PageTitle from "../components/PageTitle";
import SectionHeader from "../components/SectionHeader";
//import type { TerritoriosMap } from "../data/types";



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



export default function Territorios() {
  const navigate = useNavigate();
  const { territorios } = useTerritorios();

  return (
    <>
      <PageTitle
        title="Territórios"
        subtitle="Consulta individual dos pontos do guia."
      />

      {grupos.map((g) => (
        <section key={g.titulo}>
          <SectionHeader title={g.titulo} />

          {g.ids.map((id) => {
            const t = territorios[id];
            if (!t) return null;

            return (
              <button
                key={id}
                className="territorios-item"
                onClick={() => navigate(`/territorio/${id}`)}
              >
                <img src={t.imagem} alt="" className="territorios-thumb" />

                <span>
                  <b>{t.nome}</b>
                  <br />
                  <small className="territorios-palavra">{t.palavra}</small>
                </span>

                <b className="territorios-arrow">›</b>
              </button>
            );
          })}
        </section>
      ))}
    </>
  );
}
