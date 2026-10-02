// MidiasAdmin.tsx
// Aba "Fotos e vídeos" do painel.
//
// Para que serve: durante o guia, com o celular na mão, a autoria liga e desliga
// as fotos e os vídeos de apoio SEM entrar na ficha do território (que é longa e
// obriga a rolar muito no celular). Aqui é uma lista curta, agrupada por página e
// por território, com um botão por mídia — e cada toque GRAVA NA HORA.
//
// A regra de visibilidade é a mesma do resto do painel: cada mídia tem o próprio
// `visivel` (item por item); não existe mais um "conjunto" ligado/desligado.

import "../styles.css";

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useTerritorios } from "../context/useTerritorios";
import {
  definirVisibilidadeMidia,
  definirVisibilidadeTodasMidias,
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
  gruposDosTerritorios,
  idDoItem,
  resumoDoGrupo,
  territoriosSemMidia,
  totalDasMidias,
  type GrupoMidias,
  type ItemMidiaPainel,
  type TipoDeMidia,
} from "../data/midiasPainel";

/** "fotos"/"videos": o nome da coluna no banco. */
function coluna(tipo: TipoDeMidia): "fotos" | "videos" {
  return tipo === "foto" ? "fotos" : "videos";
}

function nomeDoItem(item: ItemMidiaPainel): string {
  return item.tipo === "foto" ? `Foto “${item.legenda}”` : `Vídeo “${item.legenda}”`;
}

/** "habilitada"/"habilitado" — foto é feminino, vídeo é masculino. */
function participio(tipo: TipoDeMidia, visivel: boolean): string {
  const verbo = visivel ? "habilitad" : "desabilitad";
  return verbo + (tipo === "foto" ? "a" : "o");
}

export default function MidiasAdmin() {
  const { territorios, config, recarregar, carregando } = useTerritorios();

  // quais grupos estão abertos (o resto fica fechado: é o que deixa a lista curta)
  const [abertos, setAbertos] = useState<Record<string, boolean>>({});
  const [gravando, setGravando] = useState<string | null>(null);
  const [ok, setOk] = useState("");
  const [erro, setErro] = useState("");

  const paginas = useMemo(() => gruposDasPaginas(config), [config]);
  const territoriosComMidia = useMemo(() => gruposDosTerritorios(territorios), [territorios]);
  const total = totalDasMidias([...paginas, ...territoriosComMidia]);
  const semMidia = useMemo(() => territoriosSemMidia(territorios), [territorios]);

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

  /** Liga/desliga UMA mídia (foto ou vídeo) e grava na hora. */
  async function alternar(grupo: GrupoMidias, item: ItemMidiaPainel) {
    const novo = !item.visivel;
    const id = idDoItem(grupo, item);

    setErro("");
    setOk("");
    setGravando(id);

    try {
      if (grupo.origem === "territorio") {
        await definirVisibilidadeMidia(grupo.chave, coluna(item.tipo), item.url, novo);
      } else {
        const { pagina } = paginaAtual(grupo.chave);
        await salvarConfig(
          grupo.chave,
          definirVisibilidadeDeImagem(pagina, item.url, novo)
        );
      }

      await recarregar();
      setOk(`${nomeDoItem(item)} ${participio(item.tipo, novo)} para os visitantes (gravado).`);
    } catch (e) {
      console.error(e);
      setErro(
        e instanceof Error
          ? e.message
          : `Falha ao ${novo ? "habilitar" : "desabilitar"} ${nomeDoItem(item)}.`
      );
    } finally {
      setGravando(null);
    }
  }

  /** Liga/desliga TODAS as fotos (ou todos os vídeos) de um grupo, item por item. */
  async function alternarTodas(grupo: GrupoMidias, tipo: TipoDeMidia, visivel: boolean) {
    const id = `${grupo.chave}|todas|${tipo}`;
    const plural = tipo === "foto" ? "fotos" : "vídeos";

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
      setErro(e instanceof Error ? e.message : `Falha ao marcar as ${plural}.`);
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

  /** Um grupo da lista: a página ou o território, com as mídias dentro. */
  function bloco(grupo: GrupoMidias) {
    const aberto = !!abertos[grupo.chave];

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

          {grupo.foraDoAr && <span className="midias-etiqueta">fora do percurso de hoje</span>}

          <span className="midias-seta">{aberto ? "▾" : "▸"}</span>
        </button>

        {aberto && (
          <div className="midias-corpo">
            {(["foto", "video"] as TipoDeMidia[]).map((tipo) => {
              const itens = tipo === "foto" ? grupo.fotos : grupo.videos;
              if (itens.length === 0) return null;

              return (
                <div className="midias-bloco" key={tipo}>
                  <div className="midias-bloco-topo">
                    <b>{tipo === "foto" ? "Fotos" : "Vídeos"}</b>
                    <span className="midias-acoes">
                      <button
                        type="button"
                        className="midias-acao"
                        disabled={gravando === `${grupo.chave}|todas|${tipo}`}
                        onClick={() => alternarTodas(grupo, tipo, true)}
                      >
                        habilitar {tipo === "foto" ? "todas" : "todos"}
                      </button>
                      <button
                        type="button"
                        className="midias-acao"
                        disabled={gravando === `${grupo.chave}|todas|${tipo}`}
                        onClick={() => alternarTodas(grupo, tipo, false)}
                      >
                        desabilitar {tipo === "foto" ? "todas" : "todos"}
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
        Ligue e desligue aqui o que o visitante vê em cada página e em cada território.
        <b> Cada toque grava na hora</b> — não precisa clicar em “Salvar”. É a lista curta
        para usar no celular durante o guia.
      </p>

      <p className="midias-total">
        Neste app: <b>{total.fotos}</b> fotos, <b>{total.videos}</b> vídeos —{" "}
        <b>{total.ocultas}</b> desligado{total.ocultas === 1 ? "" : "s"}.
      </p>

      <div className="midias-acoes-topo">
        <button type="button" className="outline" onClick={atualizarLista}>
          atualizar lista
        </button>
        <span className="admin-ajuda">
          O que está “Habilitado” aparece para o visitante; “Desabilitado” fica guardado, fora
          do app.
        </span>
      </div>

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

      <hr className="admin-divisor" />
      <h2 className="admin-form-secao">Territórios</h2>

      {territoriosComMidia.length === 0 ? (
        <p className="admin-ajuda">Nenhum território está com foto ou vídeo de apoio.</p>
      ) : (
        territoriosComMidia.map(bloco)
      )}

      {semMidia.length > 0 && (
        <p className="admin-ajuda">
          <b>Sem foto nem vídeo de apoio:</b> {semMidia.join(", ")}. Para enviar mídia nova,
          abra a aba <Link to="/admin/territorios">Territórios</Link>.
        </p>
      )}
    </div>
  );
}
