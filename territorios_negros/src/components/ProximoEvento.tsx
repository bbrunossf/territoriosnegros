import { Link, useParams } from "react-router-dom";

import { formatarDataBR } from "../utils/data";
import { useTerritorios } from "../context/useTerritorios";
import { normalizarTextosIniciais } from "../data/telaInicial";
import { tourPorId, toursNoAr } from "../data/tours";
import BotaoContato from "./BotaoContato";
import BotoesDaTela from "./BotoesDaTela";

/**
 * Página do próximo evento: informações do tour e a ficha de inscrição.
 * Chega-se a ela tocando no título do evento na tela inicial.
 *
 * 15/10/2026: a agenda aceita mais de um tour. `/evento` mostra o mais próximo;
 * `/evento/{id}` abre um tour específico da agenda, e os demais aparecem
 * listados no fim da página.
 */
/** compara títulos sem diferenciar acento, caixa nem pontuação */
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();
}

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

  /* Regra de inscrição DESTE evento (15/10/2026). O painel tem uma regra geral
     (Inscrições), mas cada evento pode dizer a sua: "sem" não mostra nada,
     "abertas" e "encerradas" valem para ele. Sem regra própria, vale a do
     painel — e só quando o evento tem a ver com inscrição: é o próximo da
     agenda ou tem link próprio. Evento novo, sem link e fora do "próximo",
     não herda o aviso de encerradas. */
  const regraEvento = tour?.inscricoes ?? "";
  const ehProximo = !!tour && tour.id === proximoTour?.id;
  const estadoInscricao =
    regraEvento === "sem"
      ? "sem"
      : regraEvento === "encerradas"
        ? "encerradas"
        : regraEvento === "abertas"
          ? "abertas"
          : inscricoes.encerradas && (!!tour?.inscricaoUrl || ehProximo)
            ? "encerradas"
            : "abertas";

  // logo: a própria do evento; se não houver, a da rota vinculada
  const rota = roteiros.find((r) => r.id === tour?.rotaId);
  const logo = tour?.logo || rota?.logo || "";

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

      {/* Moldura do evento (15/10/2026): a autoria pediu um quadro que
          destaque o evento do fundo da página, como o cartão da tela
          inicial. Só emoldura — nenhum texto novo entra aqui. */}
      <section className="evento-cartao">
        {/* o selo “próximo evento disponível” só vale para o evento mais
            próximo; num evento futuro da agenda ele seria falso */}
        {ehProximo && (
          <p className="evento-selo">{textos.selo}</p>
        )}

        <h1 className="page-title evento-titulo">{tour.texto || "Próximo tour"}</h1>

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

        {/* A rota do evento (15/10/2026). Antes vinha o cartão inteiro da página
            Rotas — com nome, slogan e o resumo de horários. Isso repetia o título
            do evento e trazia horários que não estão no formulário do evento, o
            que confundia a autoria. Agora a página do evento mostra só o que é
            dela: a logo e, quando o nome da rota é diferente do título do
            evento, uma linha dizendo a que rota ele pertence. O caminho para a
            rota continua no botão "ver a rota completa". */}
        {logo && (
          <img
            src={logo}
            alt={`Logo ${tour.texto || "do evento"}`}
            className="percurso-logo"
          />
        )}

        {rota && normalizar(rota.nome) !== normalizar(tour.texto || "") && (
          <p className="evento-rota-nome">
            Rota: <b>{rota.nome}</b>
          </p>
        )}

        {/* Informações do evento (pedido da autoria, 15/10/2026): tudo o que é
            informação fica DENTRO do quadro — as linhas do campo "Informações
            sobre o evento" e o aviso de inscrições encerradas. Ficam fora só os
            botões (ficha, rota, contato), que levam a outra tela. */}
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

        {estadoInscricao === "encerradas" && (
          <p className="evento-encerrado">{inscricoes.aviso}</p>
        )}
      </section>

      {/* Ficha de inscrição: a autoria liga e desliga este botão no painel
          (Página inicial › Inscrições) e pode marcar as inscrições como
          encerradas, sem apagar o link (15/10/2026). Encerradas, o aviso entra
          no lugar do botão — e aparece mesmo com o botão desligado, porque é
          informação, não convite. */}
      {/* Botão da ficha: só quando as inscrições estão abertas e a autoria
          deixou o botão ligado no painel. Encerradas, o aviso já subiu para a
          moldura do evento. */}
      {estadoInscricao === "abertas" && inscricoes.ficha && (
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

      {/* Agenda com mais de um evento (15/10/2026): a autoria pediu que TODO
          evento cadastrado apareça em quadro próprio, como o evento principal.
          Antes os demais eram uma lista de linhas soltas, fora do padrão. */}
      {outros.length > 0 && (
        <div className="evento-agenda">
          <p className="evento-agenda-titulo">Outros eventos agendados</p>

          <ul className="evento-agenda-lista">
            {outros.map((t) => (
              <li key={t.id}>
                <Link to={`/evento/${t.id}`} className="evento-agenda-cartao">
                  <b className="evento-agenda-nome">{t.texto || "Evento"}</b>

                  {(t.data || t.hora) && (
                    <span className="evento-agenda-data">
                      {formatarDataBR(t.data)}
                      {t.hora ? ` às ${t.hora}` : ""}
                    </span>
                  )}

                  {t.local && (
                    <span className="evento-agenda-local">{t.local}</span>
                  )}
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
