import { useParams, useNavigate } from "react-router-dom";
import { useTerritorios } from "../context/useTerritorios";
import { pontosVisiveis } from "../utils/catalogo";
import { somenteVisiveis } from "../utils/visibilidade";
import { sloganDaRota } from "../data/slogansRota";
import { paragrafosDe } from "../utils/texto";

import BotaoContato from "../components/BotaoContato";
import FotoAmpliavel from "../components/FotoAmpliavel";
import Inline from "../components/Inline";

export default function Percurso() {
  const { rotaId } = useParams<{ rotaId: string }>();
  const navigate = useNavigate();
  const { territorios, roteiros, inscricaoUrl, config } = useTerritorios();

  const roteiro = roteiros.find((r) => r.id === rotaId) || roteiros[0];

  if (!roteiro) return <p>Rota não encontrada.</p>;

  // Só entram no percurso os territórios que estão habilitados no painel.
  const pontos = pontosVisiveis(roteiro.pontos, territorios);
  const inscricao = roteiro.inscricaoUrl || inscricaoUrl;

  // slogan da rota (campo do painel, gravado na configuração do app)
  const slogan = sloganDaRota(config, roteiro.id);

  // mapas bloqueados no painel não aparecem para os visitantes
  const mapasVisiveis = somenteVisiveis(roteiro.mapas);
  const temMapas = !!roteiro.mapaUrl || mapasVisiveis.length > 0;

  return (
    <>
      {/* Título, logo do evento e a linha de início/conclusão */}
      <h1 className="page-title">{roteiro.nome}</h1>

      {roteiro.logo && (
        <img
          src={roteiro.logo}
          alt={`Logo ${roteiro.nome}`}
          className="percurso-logo"
        />
      )}

      {/* Slogan da rota: frase de abertura, entre a logo e o início/conclusão. */}
      {slogan && (
        <div className="percurso-slogan">
          {paragrafosDe(slogan).map((paragrafo, i) => (
            <p key={i}>
              <Inline texto={paragrafo} />
            </p>
          ))}
        </div>
      )}

      {roteiro.subtitulo && (
        <p className="page-subtitle">
          <Inline texto={roteiro.subtitulo} />
        </p>
      )}

      <div className="page-line" />

      {pontos.map((t, i) => (
        <button
          key={t.id}
          className="percurso-item"
          onClick={() => navigate(`/percurso/${roteiro.id}/${i}`)}
        >
          <img src={t.imagem} alt="" className="percurso-thumb" />

          <span>
            <b className="percurso-nome">
              {i + 1}. {t.nome}
            </b>
            <br />
            <small className="percurso-palavra">{t.palavra}</small>
          </span>

          <b className="percurso-arrow">›</b>
        </button>
      ))}

      {pontos.length === 0 && (
        <p className="aviso-vazio">
          Nenhum território habilitado nesta rota no momento.
        </p>
      )}

      {/* Mapa do percurso: depois do último território, para ler primeiro e
          só então observar no mapa. */}
      {temMapas && (
        <>
          <h3 className="section-header">Mapa do percurso</h3>

          {roteiro.mapaUrl && (
            <>
              <div className="mapa-embed">
                <iframe
                  title={`Mapa do percurso ${roteiro.nome}`}
                  src={roteiro.mapaUrl}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>

              <a
                className="outline roteiro-btn"
                href={roteiro.mapaUrl}
                target="_blank"
                rel="noreferrer"
              >
                Abrir mapa em tela cheia
              </a>
            </>
          )}

          {mapasVisiveis.length > 0 && (
            <div className="territorio-galeria">
              {mapasVisiveis.map((mapa, i) => (
                <FotoAmpliavel
                  key={`${mapa.url}-${i}`}
                  url={mapa.url}
                  alt={mapa.legenda || `Mapa ${i + 1} de ${roteiro.nome}`}
                  legenda={mapa.legenda}
                  credito={mapa.credito}
                />
              ))}
            </div>
          )}

          <p className="foto-ajuda">
            Clique numa imagem para ampliar (zoom no app ou abrir em nova guia).
          </p>
        </>
      )}

      {inscricao && (
        <a
          className="outline roteiro-btn"
          href={inscricao}
          target="_blank"
          rel="noreferrer"
        >
          Ficha de inscrição
        </a>
      )}

      <BotaoContato tela="percurso" />
    </>
  );
}
