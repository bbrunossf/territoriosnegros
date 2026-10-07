import { Link } from "react-router-dom";

import CAPA_INICIAL from "../assets/capa-inicial.jpg";

import { formatarDataAcesso, formatarDataBR } from "../utils/data";
import { useTerritorios } from "../context/useTerritorios";
import { normalizarCapa, normalizarTextosIniciais } from "../data/telaInicial";

export default function Home() {
  const { proximoTour, inscricaoUrl, config } = useTerritorios();

  const inscricao = proximoTour?.inscricaoUrl || inscricaoUrl;

  // arte e textos da tela inicial: vêm do painel (aba Página inicial), com o
  // conteúdo original do app como reserva
  const capa = normalizarCapa(config.capa_inicial);
  const textos = normalizarTextosIniciais(config.tela_inicial);

  return (
    <section className="home">
      {/* a capa ocupa a faixa de cima: o cartão do tour e os botões ficam
          abaixo dela, então nada mais fica por cima da arte */}
      <div
        className="home-capa"
        style={{ backgroundImage: `url(${capa.url || CAPA_INICIAL})` }}
        role="img"
        aria-label="Territórios Negros - Vitória - ES"
      />

      <div className="home-bottom">
        {capa.credito && <p className="home-capa-credito">{capa.credito}</p>}

        {proximoTour && (
          <div className="home-tour">
            <p className="home-tour-selo">{textos.selo}</p>

            {/* o título é o caminho para as informações do tour e a inscrição */}
            <Link to="/evento" className="home-tour-titulo home-tour-link">
              {proximoTour.texto || "Próximo tour"}
            </Link>

            {(proximoTour.data || proximoTour.hora) && (
              <p className="home-tour-data">
                {formatarDataBR(proximoTour.data)}
                {proximoTour.hora ? ` às ${proximoTour.hora}` : ""}
              </p>
            )}

            {proximoTour.local && (
              <p className="home-tour-local">{proximoTour.local}</p>
            )}

            <Link to="/evento" className="home-tour-mais">
              toque no título para ver as informações do tour e a ficha de inscrição ›
            </Link>

            {inscricao && (
              <a
                className="btn home-tour-btn"
                href={inscricao}
                target="_blank"
                rel="noreferrer"
              >
                {textos.botaoInscricao}
              </a>
            )}
          </div>
        )}

        <Link to="/intro" className="btn home-start-btn">
          {textos.botaoInicio}
        </Link>

        <div className="home-creditos">
          <p className="home-date">
            Acesso em {formatarDataAcesso()}
          </p>

          <p className="home-autoria">{textos.autoria}</p>
        </div>
      </div>
    </section>
  );
}
