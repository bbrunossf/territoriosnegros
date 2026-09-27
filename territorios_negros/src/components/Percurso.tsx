import { useParams, useNavigate } from "react-router-dom";
import { useTerritorios } from "../context/useTerritorios";
import { pontosVisiveis } from "../utils/catalogo";

export default function Percurso() {
  const { rotaId } = useParams<{ rotaId: string }>();
  const navigate = useNavigate();
  const { territorios, roteiros, inscricaoUrl } = useTerritorios();

  const roteiro = roteiros.find((r) => r.id === rotaId) || roteiros[0];

  if (!roteiro) return <p>Rota não encontrada.</p>;

  // Só entram no percurso os territórios que estão habilitados no painel.
  const pontos = pontosVisiveis(roteiro.pontos, territorios);
  const inscricao = roteiro.inscricaoUrl || inscricaoUrl;
  const temMapas = !!roteiro.mapaUrl || roteiro.mapas.length > 0;

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

      {roteiro.subtitulo && <p className="page-subtitle">{roteiro.subtitulo}</p>}

      <div className="page-line" />

      {pontos.map((t, i) => (
        <button
          key={t.id}
          className="percurso-item"
          onClick={() => navigate(`/percurso/${roteiro.id}/${i}`)}
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

          {roteiro.mapas.length > 0 && (
            <div className="territorio-galeria">
              {roteiro.mapas.map((mapa, i) => (
                <figure key={`${mapa.url}-${i}`} className="territorio-foto">
                  <img
                    src={mapa.url}
                    alt={mapa.legenda || `Mapa ${i + 1} de ${roteiro.nome}`}
                  />
                  {mapa.legenda && <figcaption>{mapa.legenda}</figcaption>}
                </figure>
              ))}
            </div>
          )}
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
    </>
  );
}
