import { Link, useLocation, useNavigate } from "react-router-dom";

import { useTerritorios } from "../context/useTerritorios";
import { FIM_PADRAO, normalizarPagina } from "../data/paginas";
import { pontosVisiveis, roteirosVisiveis } from "../utils/catalogo";
import BotoesDaTela from "./BotoesDaTela";
import PaginaConteudo from "./PaginaConteudo";

// Texto editável no painel (aba Páginas) — chave: pagina_fim
export default function Fim() {
  const { config, roteiros, territorios } = useTerritorios();

  const navegar = useNavigate();
  const { state } = useLocation();

  // De qual rota a pessoa veio? O percurso manda o id ao concluir; sem isso,
  // vale a única rota ativa (15/10/2026). Com mais de uma rota ativa e sem
  // origem, oferecemos a lista de rotas em vez de adivinhar.
  const ativas = roteirosVisiveis(roteiros);
  const rotaId = (state as { rotaId?: string } | null)?.rotaId;

  const rota = ativas.find((r) => r.id === rotaId) ?? (ativas.length === 1 ? ativas[0] : null);

  const pontos = rota ? pontosVisiveis(rota.pontos, territorios) : [];

  /** Voltar para o início da rota e ir direto a um território dela. */
  const continuarNaRota =
    rota && pontos.length > 0 ? (
      <div className="fim-rota">
        <p className="fim-rota-titulo">Continuar nesta rota</p>

        <p className="fim-rota-nome">{rota.nome}</p>

        <Link className="fim-rota-inicio" to={`/percurso/${rota.id}`}>
          ← Voltar ao início da rota
        </Link>

        <label className="fim-rota-escolha">
          <span>Ir direto a um território desta rota</span>

          <select
            value=""
            onChange={(e) => {
              const i = e.target.value;

              if (i !== "") navegar(`/percurso/${rota.id}/${i}`);
            }}
          >
            <option value="">Escolha o território</option>

            {pontos.map((t, i) => (
              <option key={t.id} value={i}>
                {`${i + 1}. ${t.nome}`}
              </option>
            ))}
          </select>
        </label>
      </div>
    ) : null;

  /** Sem uma rota identificada, pelo menos o caminho de volta para as rotas ativas. */
  const voltarAsRotas =
    !rota && ativas.length > 1 ? (
      <div className="fim-rota">
        <p className="fim-rota-titulo">Continuar em uma rota</p>

        <div className="fim-rota-lista">
          {ativas.map((r) => (
            <Link key={r.id} className="fim-rota-inicio" to={`/percurso/${r.id}`}>
              ← {r.nome}
            </Link>
          ))}
        </div>
      </div>
    ) : null;

  return (
    <>
      {/* botões que a autoria escolheu para o topo desta tela (menu Botões) */}
      <BotoesDaTela tela="fim" posicao="topo" />

      <PaginaConteudo
        pagina={normalizarPagina(config.pagina_fim, FIM_PADRAO)}
        tela="fim"
        /* antes do "Enviar uma mensagem", como nas outras telas */
        antesDosBotoes={
          <>
            {continuarNaRota ?? voltarAsRotas}

            <BotoesDaTela tela="fim" posicao="final" />
          </>
        }
      />
    </>
  );
}
