import { Link } from "react-router-dom";

import { formatarDataBR } from "../utils/data";
import { useTerritorios } from "../context/useTerritorios";

/**
 * Página do próximo evento: informações do tour e a ficha de inscrição.
 * Chega-se a ela tocando no título do evento na tela inicial.
 */
export default function ProximoEvento() {
  const { proximoTour, inscricaoUrl } = useTerritorios();

  const inscricao = proximoTour?.inscricaoUrl || inscricaoUrl;
  const paragrafos = (proximoTour?.info ?? "")
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (!proximoTour) {
    return (
      <>
        <h1 className="page-title">Próximo evento</h1>

        <p className="aviso-vazio">
          Nenhum evento agendado no momento. Acompanhe por aqui as próximas datas.
        </p>

        <Link className="outline roteiro-btn" to="/roteiros">
          Ver os percursos
        </Link>
      </>
    );
  }

  return (
    <>
      <p className="evento-selo">Próximo evento disponível</p>

      <h1 className="page-title">{proximoTour.texto || "Próximo tour"}</h1>

      <div className="evento-dados">
        {(proximoTour.data || proximoTour.hora) && (
          <p className="evento-dado">
            <b>Data:</b> {formatarDataBR(proximoTour.data)}
            {proximoTour.hora ? ` às ${proximoTour.hora}` : ""}
          </p>
        )}

        {proximoTour.local && (
          <p className="evento-dado">
            <b>Local:</b> {proximoTour.local}
          </p>
        )}
      </div>

      <div className="page-line" />

      {paragrafos.length > 0 ? (
        <div className="evento-info">
          {paragrafos.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      ) : (
        <p className="admin-ajuda">
          As informações completas deste tour serão publicadas aqui em breve.
        </p>
      )}

      {inscricao ? (
        <>
          <a
            className="btn evento-btn"
            href={inscricao}
            target="_blank"
            rel="noreferrer"
          >
            Abrir a ficha de inscrição
          </a>

          <p className="evento-ajuda">
            A ficha abre em outra guia, no Google Docs, onde você preenche e envia.
          </p>
        </>
      ) : (
        <p className="admin-ajuda">
          A ficha de inscrição ainda não está disponível.
        </p>
      )}

      <p className="evento-voltar">
        <Link to="/">‹ voltar para a tela inicial</Link>
      </p>
    </>
  );
}
