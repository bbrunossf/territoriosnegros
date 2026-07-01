import { useParams, useNavigate } from "react-router-dom";
import { useTerritorios } from "../context/TerritoriosContext";
//import dados from "../data/dados.json";

import PageTitle from "../components/PageTitle";
//import type { TerritoriosMap } from "../data/types";

//const { roteiros } = dados;

export default function Percurso() {
  const { rotaId } = useParams<{ rotaId: string }>();
  const navigate = useNavigate();
  const { territorios, roteiros } = useTerritorios();
  const roteiro = roteiros.find((r) => r.id === rotaId) || roteiros[0];

  if (!roteiro) return <p>Rota não encontrada.</p>;

  return (
    <>
      <PageTitle
        title={roteiro.nome}
        subtitle={roteiro.subtitulo}
      />

      {roteiro.pontos.map((id: string, i: number) => {
             const t = territorios[id];
             if (!t) return null;

             return (
               <button
                  key={id}
                  className="percurso-item"
                  onClick={() => navigate(`/percurso/${rotaId}/${i}`)}
                >
                 <img src={t.imagem} alt="" className="percurso-thumb" />

                 <span>
                   <b>
                     {i + 1}. {t.nome}
                   </b>
                   <br />
                   <small className="percurso-palavra">{t.palavra}</small>
                 </span>

                 <b className="percurso-arrow">›</b>
               </button>
             );
           })}
    </>
  );
}
