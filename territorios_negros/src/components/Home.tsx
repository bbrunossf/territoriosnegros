import { Link } from "react-router-dom";

import LOGO from "../assets/logo.png";
import CAPA_INICIAL from "../assets/capa-inicial.jpg";

import { formatarDataAcesso } from "../utils/data";


export default function Home() {
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
        <Link to="/Intro" className="btn home-start-btn">
          Iniciar a leitura da cidade de Vitória - ES a partir
          dos territórios negros
        </Link>

        <p className="home-date">
          Acesso em {formatarDataAcesso()}
        </p>
      </div>
    </section>
  );
}
