// MidiasAdmin.tsx
// Aba "Fotos e vídeos" do painel.
//
// Para que serve: durante o guia, com o celular na mão, a autoria liga e desliga
// as fotos e os vídeos de apoio SEM entrar na ficha do território (que é longa e
// obriga a rolar muito no celular). Aqui é uma lista curta, agrupada por página,
// por território e por rota (as imagens de mapa), com um botão por mídia — e cada
// toque GRAVA NA HORA.
//
// A regra de visibilidade é a mesma do resto do painel: cada mídia tem o próprio
// `visivel` (item por item); não existe mais um "conjunto" ligado/desligado.

import "../styles.css";

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useTerritorios } from "../context/useTerritorios";
import {
  definirVisibilidadeMapaDaRota,
  definirVisibilidadeMidia,
  definirVisibilidadeTodasMidias,
  definirVisibilidadeTodosOsMapasDaRota,
  salvarConfig,
} from "../data/api";
import {
  PAGINAS_DO_APP,
  definirVisibilidadeDeImagem,
  definirVisibilidadeDeTodasAsImagens,
  normalizarPagina,
} from "../data/paginas";
import {
  gruposDasPaginas,
  gruposDasRotas,
  gruposDeTodosOsTerritorios,
  idDoItem,
  operacoesDeTudo,
  resumoDoGrupo,
  temMidia,
  territoriosSemMidia,
  totalDasMidias,
  totalDeTudo,
  type GrupoMidias,
  type ItemMidiaPainel,
  type TipoDeMidia,
} from "../data/midiasPainel";

/** "fotos"/"videos": o nome da coluna no banco. */
function coluna(tipo: TipoDeMidia): "fotos" | "videos" {
  return tipo === "foto" ? "fotos" : "videos";
}

/** Como a mídia é chamada na mensagem de confirmação. */
function nomeDoItem(grupo: GrupoMidias, item: ItemMidiaPainel): string {
  if (item.tipo === "video") return `Vídeo “${item.legenda}”`;
  return grupo.origem === "rota" ? `Mapa “${item.legenda}”` : `Foto “${item.legenda}”`;
}

/** "habilitada"/"habilitado" — foto é feminino; vídeo e mapa, masculinos. */
function participio(grupo: GrupoMidias, tipo: TipoDeMidia, visivel: boolean): string {
  const verbo = visivel ? "habilitad" : "desabilitad";
  const feminino = tipo === "foto" && grupo.origem !== "rota";
  return verbo + (feminino ? "a" : "o");
}

export default function MidiasAdmin() {
  const { territorios, todosRoteiros, config, recarregar, carregando } = useTerritorios();

  // quais grupos estão abertos (o resto fica fechado: é o que deixa a lista curta)
  const [abertos, setAbertos] = useState<Record<string, boolean>>({});
  // as listas trazem tudo; quem quiser a versão curta filtra
  const [soComMidia, setSoComMidia] = useState(false);
  const [gravando, setGravando] = useState<string | null>(null);
  const [ok, setOk] = useState("");
  const [erro, setErro] = useState("");

  const paginas = useMemo(() => gruposDasPaginas(config), [config]);
  const todosOsTerritorios = useMemo(
    () => gruposDeTodosOsTerritorios(territorios),
    [territorios]
  );
  const rotas = useMemo(() => gruposDasRotas(todosRoteiros), [todosRoteiros]);

  const territoriosNaTela = soComMidia
    ? todosOsTerritorios.filter(temMidia)
    : todosOsTerritorios;
  const rotasNaTela = soComMidia ? rotas.filter(temMidia) : rotas;

  const total = totalDasMidias([...paginas, ...todosOsTerritorios, ...rotas]);

  // o que o botão "tudo" alcança (páginas + territórios + mapas das rotas)
  const tudo = useMemo(() => {
    const operacoes = operacoesDeTudo(paginas, todosOsTerritorios, rotas);
    return { operacoes, ...totalDeTudo(operacoes) };
  }, [paginas, todosOsTerritorios, rotas]);
  const semMidia = useMemo(() => territoriosSemMidia(territorios), [territorios]);
  const paginasSemImagem = PAGINAS_DO_APP.filter(
    (definicao) => !paginas.some((grupo) => grupo.chave === definicao.chave)
  ).map((definicao) => definicao.nome);

  function alternarAberto(chave: string) {
    setAbertos((mapa) => ({ ...mapa, [chave]: !mapa[chave] }));
  }

  async function atualizarLista() {
    setErro("");
    setOk("");
    try {
      await recarregar();
      setOk("Lista atualizada.");
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao atualizar a lista.");
    }
  }

  /** Página do app como está no banco, pronta para receber a mudança. */
  function paginaAtual(chave: string) {
    const definicao = PAGINAS_DO_APP.find((d) => d.chave === chave);
    if (!definicao) throw new Error(`Página desconhecida: ${chave}`);
    return { definicao, pagina: normalizarPagina(config[chave], definicao.padrao) };
  }

  /** Liga/desliga UMA mídia (foto, vídeo ou mapa da rota) e grava na hora. */
  async function alternar(grupo: GrupoMidias, item: ItemMidiaPainel) {
    const novo = !item.visivel;
    const id = idDoItem(grupo, item);

    setErro("");
    setOk("");
    setGravando(id);

    try {
      if (grupo.origem === "territorio") {
        await definirVisibilidadeMidia(grupo.chave, coluna(item.tipo), item.url, novo);
      } else if (grupo.origem === "rota") {
        await definirVisibilidadeMapaDaRota(grupo.chave, item.url, novo);
      } else {
        const { pagina } = paginaAtual(grupo.chave);
        await salvarConfig(
          grupo.chave,
          definirVisibilidadeDeImagem(pagina, item.url, novo)
        );
      }

      await recarregar();
      setOk(
        `${nomeDoItem(grupo, item)} ${participio(grupo, item.tipo, novo)} para os visitantes (gravado).`
      );
    } catch (e) {
      console.error(e);
      setErro(
        e instanceof Error
          ? e.message
          : `Falha ao ${novo ? "habilitar" : "desabilitar"} ${nomeDoItem(grupo, item)}.`
      );
    } finally {
      setGravando(null);
    }
  }

  /** Liga/desliga TODAS as fotos (ou vídeos, ou mapas) de um grupo, item por item. */
  async function alternarTodas(grupo: GrupoMidias, tipo: TipoDeMidia, visivel: boolean) {
    const id = `${grupo.chave}|todas|${tipo}`;
    const plural =
      grupo.origem === "rota" ? "mapas" : tipo === "foto" ? "fotos" : "vídeos";

    setErro("");
    setOk("");
    setGravando(id);

    try {
      if (grupo.origem === "territorio") {
        const marcadas = await definirVisibilidadeTodasMidias(grupo.chave, coluna(tipo), visivel);
        await recarregar();
        setOk(
          `${marcadas} ${plural} de ${grupo.nome} ${visivel ? "habilitadas" : "desabilitadas"} (gravado).`
        );
      } else if (grupo.origem === "rota") {
        const marcados = await definirVisibilidadeTodosOsMapasDaRota(grupo.chave, visivel);
        await recarregar();
        setOk(
          `${marcados} ${plural} de ${grupo.nome} ${visivel ? "habilitados" : "desabilitados"} (gravado).`
        );
      } else {
        const { pagina } = paginaAtual(grupo.chave);
        await salvarConfig(
          grupo.chave,
          definirVisibilidadeDeTodasAsImagens(pagina, visivel)
        );
        await recarregar();
        setOk(`Todas as fotos de ${grupo.nome} ${visivel ? "habilitadas" : "desabilitadas"} (gravado).`);
      }
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : `Falha ao marcar os ${plural}.`);
    } finally {
      setGravando(null);
    }
  }

  /**
   * Liga/desliga TUDO de uma vez — as fotos das páginas, as fotos e os vídeos de
   * apoio de todos os territórios e os mapas de todas as rotas. Grava item por
   * item, como os botões de cada grupo (é o `visivel` de cada mídia que o app
   * lê); nada é apagado. Pedido da autoria (02/10/2026) para ligar/desligar tudo
   * antes de começar um guia.
   */
  async function alternarTudo(visivel: boolean) {
    setErro("");
    setOk("");
    setGravando("tudo");

    try {
      for (const operacao of tudo.operacoes) {
        if (operacao.origem === "territorio") {
          if (operacao.fotos > 0) {
            await definirVisibilidadeTodasMidias(operacao.chave, "fotos", visivel);
          }
          if (operacao.videos > 0) {
            await definirVisibilidadeTodasMidias(operacao.chave, "videos", visivel);
          }
        } else if (operacao.origem === "rota") {
          await definirVisibilidadeTodosOsMapasDaRota(operacao.chave, visivel);
        } else {
          const { pagina } = paginaAtual(operacao.chave);
          await salvarConfig(
            operacao.chave,
            definirVisibilidadeDeTodasAsImagens(pagina, visivel)
          );
        }
      }

      await recarregar();

      setOk(
        `Tudo ${visivel ? "habilitado" : "desabilitado"} (gravado): ` +
          `${tudo.fotos} ${tudo.fotos === 1 ? "foto/mapa" : "fotos/mapas"} e ` +
          `${tudo.videos} ${tudo.videos === 1 ? "vídeo" : "vídeos"}, ` +
          `em ${tudo.operacoes.length} ${tudo.operacoes.length === 1 ? "grupo" : "grupos"}.`
      );
    } catch (e) {
      console.error(e);
      setErro(
        e instanceof Error
          ? e.message
          : `Falha ao ${visivel ? "habilitar" : "desabilitar"} tudo.`
      );
    } finally {
      setGravando(null);
    }
  }

  if (carregando) {
    return (
      <div className="midias">
        <h1>Fotos e vídeos</h1>
        <p className="admin-ajuda">Carregando as mídias do app...</p>
      </div>
    );
  }

  /** Um grupo da lista: a página, o território ou a rota, com as mídias dentro. */
  function bloco(grupo: GrupoMidias) {
    const aberto = !!abertos[grupo.chave];
    const ehRota = grupo.origem === "rota";

    return (
      <div className={`midias-grupo${aberto ? " aberto" : ""}`} key={grupo.chave}>
        <button
          type="button"
          className="midias-cabecalho"
          onClick={() => alternarAberto(grupo.chave)}
          aria-expanded={aberto}
        >
          <span className="midias-cabecalho-texto">
            <b>{grupo.nome}</b>
            <span className="midias-resumo">{resumoDoGrupo(grupo)}</span>
          </span>

          {grupo.foraDoAr && (
            <span className="midias-etiqueta">
              {ehRota ? "rota desativada" : "fora do percurso de hoje"}
            </span>
          )}

          <span className="midias-seta">{aberto ? "▾" : "▸"}</span>
        </button>

        {aberto && (
          <div className="midias-corpo">
            {!temMidia(grupo) && (
              <p className="admin-ajuda">
                {ehRota ? "Sem mapa cadastrado" : "Sem foto nem vídeo de apoio cadastrado"}. Para
                enviar, abra a aba{" "}
                <Link to={ehRota ? "/admin/roteiros" : "/admin/territorios"}>
                  {ehRota ? "Rotas" : "Territórios"}
                </Link>{" "}
                e edite {ehRota ? "esta rota" : "este território"}.
              </p>
            )}

            {(["foto", "video"] as TipoDeMidia[]).map((tipo) => {
              const itens = tipo === "foto" ? grupo.fotos : grupo.videos;
              if (itens.length === 0) return null;

              const titulo = tipo === "video" ? "Vídeos" : ehRota ? "Mapas" : "Fotos";
              const alvo = ehRota ? "todos" : tipo === "foto" ? "todas" : "todos";

              return (
                <div className="midias-bloco" key={tipo}>
                  <div className="midias-bloco-topo">
                    <b>{titulo}</b>
                    <span className="midias-acoes">
                      <button
                        type="button"
                        className="midias-acao"
                        disabled={gravando === `${grupo.chave}|todas|${tipo}`}
                        onClick={() => alternarTodas(grupo, tipo, true)}
                      >
                        habilitar {alvo}
                      </button>
                      <button
                        type="button"
                        className="midias-acao"
                        disabled={gravando === `${grupo.chave}|todas|${tipo}`}
                        onClick={() => alternarTodas(grupo, tipo, false)}
                      >
                        desabilitar {alvo}
                      </button>
                    </span>
                  </div>

                  {itens.map((item) => {
                    const id = idDoItem(grupo, item);
                    const salvando = gravando === id;

                    return (
                      <div className="midias-item" key={id}>
                        {item.tipo === "foto" ? (
                          <img className="midias-thumb" src={item.url} alt="" loading="lazy" />
                        ) : (
                          <span className="midias-thumb midias-thumb-video" title="vídeo">
                            ▶
                          </span>
                        )}

                        <div className="midias-texto">
                          <span className="midias-legenda">{item.legenda}</span>
                          {grupo.origem === "pagina" && item.onde && (
                            <span className="midias-onde">seção: {item.onde}</span>
                          )}
                          <a className="midias-abrir" href={item.url} target="_blank" rel="noreferrer">
                            abrir
                          </a>
                        </div>

                        <button
                          type="button"
                          className={`midias-btn ${item.visivel ? "ligado" : "desligado"}`}
                          onClick={() => alternar(grupo, item)}
                          disabled={salvando}
                        >
                          {salvando ? "gravando..." : item.visivel ? "Habilitado" : "Desabilitado"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="midias">
      <h1>Fotos e vídeos</h1>

      <p className="admin-ajuda">
        Ligue e desligue aqui o que o visitante vê em cada página, em cada território e nas
        rotas (imagem de mapa). <b> Cada toque grava na hora</b> — não precisa clicar em
        “Salvar”. É a lista curta para usar no celular durante o guia.
      </p>

      <p className="midias-total">
        Neste app: <b>{total.fotos}</b> fotos e mapas, <b>{total.videos}</b> vídeos —{" "}
        <b>{total.ocultas}</b> desligado{total.ocultas === 1 ? "" : "s"}.
      </p>

      {/* Botão de tudo: um par para ligar/desligar de uma vez as páginas, os
          territórios e as rotas (pedido da autoria, 02/10/2026). */}
      <div className="midias-tudo">
        <b>Ligar ou desligar tudo de uma vez</b>

        <div className="midias-tudo-botoes">
          <button
            type="button"
            className="btn"
            disabled={gravando === "tudo"}
            onClick={() => alternarTudo(true)}
          >
            {gravando === "tudo" ? "gravando..." : "habilitar tudo"}
          </button>

          <button
            type="button"
            className="btn"
            disabled={gravando === "tudo"}
            onClick={() => alternarTudo(false)}
          >
            {gravando === "tudo" ? "gravando..." : "desabilitar tudo"}
          </button>
        </div>

        <p className="admin-ajuda">
          Alcança <b>{tudo.fotos}</b> fotos e mapas e <b>{tudo.videos}</b>{" "}
          {tudo.videos === 1 ? "vídeo" : "vídeos"}, em {tudo.operacoes.length}{" "}
          {tudo.operacoes.length === 1 ? "grupo" : "grupos"}: as fotos de cada <b>página</b>, as
          fotos e os vídeos de apoio de cada <b>território</b> e os mapas de cada <b>rota</b>.
          Marca item por item — é o que o app lê — e <b>nada é apagado</b>: desligar só tira da
          vista do visitante.
        </p>
      </div>

      <div className="midias-acoes-topo">
        <button type="button" className="outline" onClick={atualizarLista}>
          atualizar lista
        </button>

        <label className="midias-filtro">
          <input
            type="checkbox"
            checked={soComMidia}
            onChange={(e) => setSoComMidia(e.target.checked)}
          />
          mostrar só os que já têm mídia
        </label>
      </div>

      <p className="admin-ajuda">
        O que está “Habilitado” aparece para o visitante; “Desabilitado” fica guardado, fora
        do app.
        {semMidia.length > 0 && (
          <>
            {" "}
            <b>{semMidia.length}</b> dos {todosOsTerritorios.length} territórios ainda não têm
            foto nem vídeo de apoio — eles aparecem na lista com essa indicação.
          </>
        )}
      </p>

      {ok && <p className="admin-ok">{ok}</p>}
      {erro && <p className="admin-erro">{erro}</p>}

      <hr className="admin-divisor" />
      <h2 className="admin-form-secao">Páginas</h2>

      {paginas.length === 0 ? (
        <p className="admin-ajuda">
          Nenhuma página está com foto. As fotos de página são enviadas na aba{" "}
          <Link to="/admin/paginas">Páginas</Link>.
        </p>
      ) : (
        paginas.map(bloco)
      )}

      {paginasSemImagem.length > 0 && (
        <p className="admin-ajuda">
          Sem imagem: {paginasSemImagem.join(", ")}. Para enviar fotos em uma delas, abra a aba{" "}
          <Link to="/admin/paginas">Páginas</Link>.
        </p>
      )}

      <hr className="admin-divisor" />
      <h2 className="admin-form-secao">Territórios</h2>

      {territoriosNaTela.length === 0 ? (
        <p className="admin-ajuda">
          Nenhum território está com foto ou vídeo de apoio.
        </p>
      ) : (
        territoriosNaTela.map(bloco)
      )}

      <hr className="admin-divisor" />
      <h2 className="admin-form-secao">Rotas</h2>

      {rotasNaTela.length === 0 ? (
        <p className="admin-ajuda">
          Nenhuma rota está com imagem de mapa. Os mapas são enviados na aba{" "}
          <Link to="/admin/roteiros">Rotas</Link>.
        </p>
      ) : (
        rotasNaTela.map(bloco)
      )}

      <p className="admin-ajuda">
        A <b>logo da rota</b> não tem liga/desliga: é uma imagem única — para tirá-la do ar, use
        o botão <b>Remover logo</b> na aba <Link to="/admin/roteiros">Rotas</Link>.
      </p>
    </div>
  );
}
