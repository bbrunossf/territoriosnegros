import Info from "../components/Info";
import PageTitle from "../components/PageTitle";

type Props = {
  setTela: (tela: string) => void;
};

export default function Fim({ setTela }: Props) {
  return (
    <div className="fim">
      <PageTitle title="Fim do percurso" />

      <Info>
        A cidade não termina aqui. Os territórios
        negros permanecem — visíveis ou não.
        Continue observando.
      </Info>

      <button
        className="btn fim-btn"
        onClick={() => setTela("roteiros")}
      >
        Escolher outro roteiro
      </button>
    </div>
  );
}
