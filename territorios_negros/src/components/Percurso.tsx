import dados from "../data/dados.json";

import PageTitle from "../components/PageTitle";

const { territorios } = dados;


type Props = {
  roteiro: any;
  setIndice: (indice: number) => void;
  setTela: (tela: string) => void;
};

export default function Percurso({
  roteiro,
  setIndice,
  setTela,
}: Props) {
  return (
    <>
      <PageTitle
        title={roteiro.nome}
        subtitle={roteiro.subtitulo}
      />

      {roteiro.pontos.map(
        (id: string, i: number) => (
          <button
            key={id}
            className="percurso-item"
            onClick={() => {
              setIndice(i);
              setTela("territorio");
            }}
          >
            <img
              src={territorios[id as keyof typeof territorios].imagem}
              alt=""
              className="percurso-thumb"
            />

            <span>
              <b>
                {i + 1}.{" "}
                {territorios[id as keyof typeof territorios].nome}
              </b>

              <br />

              <small className="percurso-palavra">
                {territorios[id as keyof typeof territorios].palavra}
              </small>
            </span>

            <b className="percurso-arrow">
              ›
            </b>
          </button>
        )
      )}
    </>
  );
}
