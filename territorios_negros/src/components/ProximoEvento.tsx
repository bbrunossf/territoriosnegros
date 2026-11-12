import { Link, useParams } from "react-router-dom";

import { formatarDataBR } from "../utils/data";
import { paragrafosDe } from "../utils/texto";
import { sloganDaRota } from "../data/slogansRota";
import { useTerritorios } from "../context/useTerritorios";
import { normalizarTextosIniciais } from "../data/telaInicial";
import { tourPorId, toursNoAr } from "../data/tours";
import BotaoContato from "./BotaoContato";
import BotoesDaTela from "./BotoesDaTela";
import Inline from "./Inline";

/**
 * Página do próximo evento: informações do tour e a ficha de inscrição.
 * Chega-se a ela tocando no título do evento na tela inicial.
 *
 * 15/10/2026: a agenda aceita mais de um tour. `/evento` mostra o mais próximo;
 * `/evento/{id}` abre um tour específico da agenda, e os demais aparecem
 * listados no fim da página.
 */
export default function ProximoEvento() {
  const { tourId } = useParams();
  const { proximoTour, toursEmCartaz, roteiros, inscricaoUrl, config, inscricoes } =
    useTerritorios();

  // tour pedido pela URL (agenda com vários) ou o mais próximo
  const daUrl = tourPorId(toursNoAr(toursEmCartaz), tourId);
  const tour = daUrl ?? (tourId ? null : proximoTour);

  // a faixa do topo é a mesma da tela inicial (editada na aba Página inicial)
  const textos = normalizarTextosIniciais(config.tela_inicial);

  const inscricao = tour?.inscricaoUrl || inscricaoUrl;

  // logo: a própria do evento; se não houver, a da rota vinculada
  const rota = roteiros.find((r) => r.id === tour?.rotaId);
  const logo = tour?.logo || rota?.logo || "";

  // slogan da rota (o mesmo que aparece na página Rotas)
  const slogan = rota ? sloganDaRota(config, rota.id) : "";
  const paragrafos = (tour?.info ?? "")
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  /** os outros tours da agenda, para quem quiser ver as outras datas */
  const outros = toursEmCartaz.filter((t) => t.id !== tour?.id);

  if (!tour) {
    return (
      <>
        <h1 className="page-title">Próximo evento</h1>

        <p className="aviso-vazio">
          {tourId
            ? "Este evento não está mais na agenda — pode ter sido desmarcado ou já aconteceu."
            : "Nenhum evento agendado no momento. Acompanhe por aqui as próximas datas."}
        </p>

        <Link className="outline roteiro-btn" to="/roteiros">
          Ver as rotas
        </Link>
      </>
    );
  }

  return (
    <>
      {/* botões que a autoria escolheu para o topo do evento (menu Botões) */}
      <BotoesDaTela tela="evento" posicao="topo" />

      <p className="evento-selo">{textos.selo}</p>

      <h1 className="page-title evento-titulo">{tour.texto || "Próximo tour"}</h1>

      {/* Cartão da rota (pedido da autoria, 15/10/2026): o evento mostra a rota a
          que pertence com a mesma cara da página Rotas — logo, nome e slogan.
          Sem rota vinculada, aparece só a logo do evento, como antes. */}
      {rota ? (
        <article className="roteiro-card evento-rota">
          {logo && (
            <img src={logo} alt={`Logo ${rota.nome}`} className="roteiro-logo" />
          )}

          <div className="roteiro-header">
            <div>
              <b className="roteiro-title">{rota.nome}</b>

              {slogan && (
                <div className="roteiro-slogan">
                  {paragrafosDe(slogan).map((paragrafo, i) => (
                    <p key={i}>
                      <Inline texto={paragrafo} />
                    </p>
                  ))}
                </div>
              )}

              {rota.subtitulo ? (
                <p className="roteiro-subtitle">
                  <Inline texto={rota.subtitulo ?? ""} />
                </p>
              ) : null}
            </div>
          </div>
        </article>
      ) : (
        logo && (
          <img
            src={logo}
            alt={`Logo ${tour.texto || "do evento"}`}
            className="percurso-logo"
          />
        )
      )}

      <div className="evento-dados">
        {(tour.data || tour.hora) && (
          <p className="evento-dado">
            <b>Data:</b> {formatarDataBR(tour.data)}
            {tour.hora ? ` às ${tour.hora}` : ""}
          </p>
        )}

        {tour.local && (
          <p className="evento-dado">
            <b>Local:</b> {tour.local}
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

      {/* Ficha de inscrição: a autoria liga e desliga este botão no painel
          (Página inicial › Inscrições) e pode marcar as inscrições como
          encerradas, sem apagar o link (15/10/2026). Encerradas, o aviso entra
          no lugar do botão — e aparece mesmo com o botão desligado, porque é
          informação, não convite. */}
      {inscricoes.encerradas ? (
        <p className="evento-encerrado">{inscricoes.aviso}</p>
      ) : (
        inscricoes.ficha && (
          <>
            <div className="pagina-botoes">
              {inscricao ? (
                <Link to="/evento/ficha" className="botao-secundario pagina-botao">
                  Abrir a ficha de inscrição
                </Link>
              ) : (
                <span
                  className="botao-secundario pagina-botao botao-sem-link"
                  aria-disabled="true"
                >
                  Abrir a ficha de inscrição
                </span>
              )}
            </div>

            <p className="evento-ajuda">
              {inscricao
                ? "A ficha abre aqui dentro do app: você preenche e envia sem sair dele."
                : "A ficha de inscrição ainda não está disponível."}
            </p>
          </>
        )
      )}

      {rota && (
        <div className="pagina-botoes">
          {/* Antes era um link solto no meio do texto: a autoria não conseguia
              bater o olho e ver que ali havia um caminho. */}
          <Link className="botao-secundario pagina-botao" to={`/percurso/${rota.id}`}>
            ver a rota completa ›
          </Link>
        </div>
      )}

      {/* agenda com mais de um tour: as outras datas ficam a um toque */}
      {outros.length > 0 && (
        <div className="evento-agenda">
          <p className="evento-agenda-titulo">Outros tours agendados</p>

          <ul className="evento-agenda-lista">
            {outros.map((t) => (
              <li key={t.id}>
                <Link to={`/evento/${t.id}`}>
                  <b>{t.texto || "Tour"}</b>
                  {t.data && <span> — {formatarDataBR(t.data)}</span>}
                  {t.hora && <span> às {t.hora}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <BotoesDaTela tela="evento" posicao="final" />

      <BotaoContato tela="evento" />

      <div className="pagina-botoes">
        {/* mesmo formato do botão "Enviar uma mensagem", a pedido da autoria */}
        <Link className="outline pagina-botao" to="/">
          ‹ voltar para a tela inicial
        </Link>
      </div>
    </>
  );
}
