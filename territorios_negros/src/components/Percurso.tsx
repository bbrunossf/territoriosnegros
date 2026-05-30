import PageTitle from "../components/PageTitle";
import type { TerritoriosMap } from "../data/types";

type Props = {
  roteiro: any;
  territorios: TerritoriosMap;
  setIndice: (indice: number) => void;
  setTela: (tela: string) => void;
};

export default function Percurso({
  roteiro,
  territorios,
  setIndice,
  setTela,
}: Props) {
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
                 onClick={() => {
                   setIndice(i);
                   setTela("territorio");
                 }}
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
