
import LOGO from "../assets/logo.png";
import CAPA_INICIAL from "../assets/capa-inicial.jpg";

import { formatarDataAcesso } from "../utils/data";

type Props = {
  setTela: (tela: string) => void;
};

export default function Home({ setTela }: Props) {
  return (
    <section
      className="home"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,.22), rgba(0,0,0,.44)), url(${CAPA_INICIAL})`,
      }}
    >
      <div className="home-top">
        <img
          src={LOGO}
          alt="Logo AFS"
          className="home-logo"
        />

        <span className="home-badge">
          Aingrid Fabiane de Souza
        </span>
      </div>

      <div className="home-bottom">
        <button
          className="btn home-start-btn"
          onClick={() => setTela("intro")}
        >
          Iniciar a leitura da cidade de Vitória - ES a partir
          dos territórios negros
        </button>

        <p className="home-date">
          Acesso em {formatarDataAcesso()}
        </p>
      </div>
    </section>
  );
}
