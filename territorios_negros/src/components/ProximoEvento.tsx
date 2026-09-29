import { Link } from "react-router-dom";

import { formatarDataBR } from "../utils/data";
import { useTerritorios } from "../context/useTerritorios";
import { normalizarTextosIniciais } from "../data/telaInicial";
import BotaoContato from "./BotaoContato";

/**
 * Página do próximo evento: informações do tour e a ficha de inscrição.
 * Chega-se a ela tocando no título do evento na tela inicial.
 */
export default function ProximoEvento() {
  const { proximoTour, roteiros, inscricaoUrl, config } = useTerritorios();

  // a faixa do topo é a mesma da tela inicial (editada na aba Página inicial)
  const textos = normalizarTextosIniciais(config.tela_inicial);

  const inscricao = proximoTour?.inscricaoUrl || inscricaoUrl;

  // logo: a própria do evento; se não houver, a da rota vinculada
  const rota = roteiros.find((r) => r.id === proximoTour?.rotaId);
  const logo = proximoTour?.logo || rota?.logo || "";
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
      <p className="evento-selo">{textos.selo}</p>

      <h1 className="page-title">{proximoTour.texto || "Próximo tour"}</h1>

      {logo && (
        <img
          src={logo}
          alt={`Logo ${proximoTour.texto || "do evento"}`}
          className="percurso-logo"
        />
      )}

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

      {rota && (
        <p className="evento-percurso">
          <Link to={`/percurso/${rota.id}`}>ver o percurso completo desta rota ›</Link>
        </p>
      )}

      <BotaoContato tela="evento" />

      <p className="evento-voltar">
        <Link to="/">‹ voltar para a tela inicial</Link>
      </p>
    </>
  );
}
