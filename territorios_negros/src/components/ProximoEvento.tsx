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

      <h1 className="page-title evento-titulo">{proximoTour.texto || "Próximo tour"}</h1>

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

      {/* A ficha de inscrição tem botão SEMPRE no modo usuário — mesmo sem link
          salvo o visitante vê onde ela vai ficar (pedido da autoria, 14/10/2026:
          "mesmo que eu nao tenha anexado o link … deve ser um botão similar ao
          botao ver percurso. E quando eu criar a ficha de inscrição ao clicar
          será levado a ficha"). Sem link, o botão fica apagado e não leva a
          lugar nenhum; com link, abre a ficha DENTRO do app (/evento/ficha),
          com o caminho de volta logo abaixo — a autoria observou que abrir em
          outra guia deixa o visitante sem saber como voltar. */}
      <div className="pagina-botoes">
        {inscricao ? (
          <Link to="/evento/ficha" className="botao-secundario pagina-botao">
            Abrir a ficha de inscrição
          </Link>
        ) : (
          <span className="botao-secundario pagina-botao botao-sem-link" aria-disabled="true">
            Abrir a ficha de inscrição
          </span>
        )}
      </div>

      {inscricao ? (
        <p className="evento-ajuda">
          A ficha abre aqui dentro do app: você preenche e envia sem sair dele.
        </p>
      ) : (
        <p className="evento-ajuda">A ficha de inscrição ainda não está disponível.</p>
      )}

      {rota && (
        <div className="pagina-botoes">
          {/* Antes era um link solto no meio do texto: a autoria não conseguia
              bater o olho e ver que ali havia um caminho. */}
          <Link className="botao-secundario pagina-botao" to={`/percurso/${rota.id}`}>
            ver o percurso completo desta rota ›
          </Link>
        </div>
      )}

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
