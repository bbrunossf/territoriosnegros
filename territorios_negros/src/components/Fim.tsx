import { Link } from "react-router-dom";
import Info from "../components/Info";
import PageTitle from "../components/PageTitle";



export default function Fim() {
  return (
    <div className="fim">
      <PageTitle title="Fim do percurso" />

      <Info>
        A cidade não termina aqui. Os territórios
        negros permanecem — visíveis ou não.
        Continue observando.
      </Info>

      <Link to="/roteiros" className="btn fim-btn">
        Escolher outro roteiro
      </Link>
    </div>
  );
}
