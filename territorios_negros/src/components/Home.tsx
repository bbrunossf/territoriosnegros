import { Link } from "react-router-dom";

import LOGO from "../assets/logo.png";
import CAPA_INICIAL from "../assets/capa-inicial.jpg";

import { formatarDataAcesso, formatarDataBR } from "../utils/data";
import { useTerritorios } from "../context/useTerritorios";

export default function Home() {
  const { proximoTour, inscricaoUrl } = useTerritorios();

  const inscricao = proximoTour?.inscricaoUrl || inscricaoUrl;

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
      </div>

      <div className="home-bottom">
        {proximoTour && (
          <div className="home-tour">
            <p className="home-tour-titulo">
              {proximoTour.texto || "Próximo tour"}
            </p>

            {(proximoTour.data || proximoTour.hora) && (
              <p className="home-tour-data">
                {formatarDataBR(proximoTour.data)}
                {proximoTour.hora ? ` às ${proximoTour.hora}` : ""}
              </p>
            )}

            {inscricao && (
              <a
                className="btn home-tour-btn"
                href={inscricao}
                target="_blank"
                rel="noreferrer"
              >
                Clique aqui e se inscreva
              </a>
            )}
          </div>
        )}

        <Link to="/Intro" className="btn home-start-btn">
          Iniciar a leitura da cidade de Vitória - ES a partir
          dos territórios negros
        </Link>

        <div className="home-creditos">
          <p className="home-date">
            Acesso em {formatarDataAcesso()}
          </p>

          <p className="home-autoria">
            Aingrid Fabiane de Souza — Licenciada em Geografia (UFES)
          </p>
        </div>
      </div>
    </section>
  );
}
