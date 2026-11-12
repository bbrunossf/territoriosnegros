// EditorDeMarcos.tsx — cadastro dos tópicos de "Marcos e Conexões" no painel.
//
// Um só componente, usado em três lugares: nas fichas de território, nas páginas
// do app (Vitória e Presença Negra, pela aba Páginas) e nas personalidades.
// O conteúdo é independente por página; cada editor grava só a sua chave dentro
// de app_config.marcos_conexoes.

import { useEffect, useRef, useState } from "react";
import "../styles/marcos.css";
import { salvarConfig } from "../data/api";
import { useTerritorios } from "../context/useTerritorios";
import {
  CHAVE_MARCOS,
  linksDoMarco,
  marcoExibivel,
  marcoPreenchido,
  mover,
  novoMarco,
  normalizarMarcos,
  type LinkDoMarco,
  type Marco,
} from "../data/marcos";

/**
 * Caixa de texto que cresce conforme o que está escrito.
 *
 * Pedido da autoria (02/10/2026): a referência da fonte precisa aceitar mais de
 * uma linha (livro, documento, acervo…) e ela tem que LER a citação inteira sem
 * caçar o cursor dentro de uma área de rolagem. Vale para a explicação também.
 */
function CaixaQueCresce({
  valor,
  exemplo,
  aoMudar,
  linhas = 2,
}: {
  valor: string;
  exemplo: string;
  aoMudar: (texto: string) => void;
  linhas?: number;
}) {
  const caixa = useRef<HTMLTextAreaElement>(null);

  const ajustar = () => {
    const el = caixa.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(ajustar, [valor]);

  return (
    <textarea
      ref={caixa}
      value={valor}
      rows={linhas}
      placeholder={exemplo}
      onInput={ajustar}
      onChange={(e) => aoMudar(e.target.value)}
    />
  );
}

export default function EditorDeMarcos({
  chaveDaPagina,
  onde,
}: {
  /** a chave da página (ex.: territorio:12, personalidade:maria-felipa) */
  chaveDaPagina: string;
  /** nome legível, só para o texto de ajuda */
  onde: string;
}) {
  const { config, recarregar } = useTerritorios();

  const [topicos, setTopicos] = useState<Marco[]>(
    () => normalizarMarcos(config[CHAVE_MARCOS])[chaveDaPagina] ?? []
  );
  const [pendente, setPendente] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [ok, setOk] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    (async () => {
      await Promise.resolve();
      if (!ativo) return;

      const todos = normalizarMarcos(config[CHAVE_MARCOS]);

      setTopicos(todos[chaveDaPagina] ?? []);
      setPendente(false);
      setOk("");
      setErro("");
    })();

    return () => {
      ativo = false;
    };
  }, [config, chaveDaPagina]);

  function mudar(indice: number, campo: keyof Marco, valor: string) {
    setTopicos((lista) => lista.map((m, i) => (i === indice ? { ...m, [campo]: valor } : m)));
    setPendente(true);
    setOk("");
  }

  function mexer(de: number, para: number) {
    setTopicos((lista) => mover(lista, de, para));
    setPendente(true);
  }

  /**
   * Os links do tópico como a tela mostra: os cadastrados agora ou, no tópico
   * antigo, o único `fonteUrl`. Escrever aqui assume o comando dos links e
   * aposenta o campo antigo (sem apagar o resto do tópico).
   */
  function linksDe(marco: Marco): LinkDoMarco[] {
    return linksDoMarco(marco);
  }

  function mudarLinks(indice: number, links: LinkDoMarco[]) {
    setTopicos((lista) =>
      lista.map((m, i) => (i === indice ? { ...m, links, fonteUrl: "" } : m))
    );
    setPendente(true);
    setOk("");
  }

  async function salvar() {
    setSalvando(true);
    setErro("");

    try {
      const todos = normalizarMarcos(config[CHAVE_MARCOS]);

      // grava a chave desta página e preserva as outras como estão
      await salvarConfig(CHAVE_MARCOS, { ...todos, [chaveDaPagina]: topicos });
      await recarregar();

      setPendente(false);
      setOk("Marcos e Conexões publicado. Aparece no app assim que a página é recarregada.");
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao salvar.");
    } finally {
      setSalvando(false);
    }
  }

  const quantos = topicos.filter(marcoPreenchido).length;
  const desabilitados = topicos.filter((m) => !marcoExibivel(m)).length;

  /**
   * Liga/desliga a exibição de um tópico — grava na hora, como nas fotos e
   * vídeos (a autoria reclamou que faltavam estes comandos dentro do cadastro do
   * território). Salva a lista inteira, preservando o que está digitado na tela.
   */
  async function gravarExibicao(lista: Marco[], recado: string) {
    setTopicos(lista);
    setPendente(false);
    setSalvando(true);
    setErro("");

    try {
      const todos = normalizarMarcos(config[CHAVE_MARCOS]);

      await salvarConfig(CHAVE_MARCOS, { ...todos, [chaveDaPagina]: lista });
      await recarregar();

      setOk(recado);
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao salvar.");
    } finally {
      setSalvando(false);
    }
  }

  const alternarTopico = (id: string) => {
    const lista = topicos.map((m) => (m.id === id ? { ...m, visivel: !marcoExibivel(m) } : m));
    const alvo = lista.find((m) => m.id === id);
    const nome = alvo?.titulo.trim() || "Tópico";

    return gravarExibicao(
      lista,
      marcoExibivel(alvo)
        ? `“${nome}” habilitado — passa a aparecer no app.`
        : `“${nome}” desabilitado — sai do app, e o conteúdo continua guardado.`
    );
  };

  const marcarTodos = (novo: boolean) =>
    gravarExibicao(
      topicos.map((m) => ({ ...m, visivel: novo })),
      novo
        ? "Todos os tópicos desta página estão habilitados — aparecem no app."
        : "Todos os tópicos desta página estão desabilitados — a seção não aparece no app. Nada foi apagado."
    );

  return (
    <div className="admin-bloco marcos-editor">
      <h3>Marcos e Conexões</h3>

      <p className="admin-ajuda">
        Tópicos de apoio à sua fala durante os tours, em <b>{onde}</b>. O <b>título</b> aparece
        para o visitante quando o tópico está habilitado; a <b>explicação</b>, a <b>fonte</b> e
        os <b>links</b> só aparecem quando <b>Explicações e fontes</b> está liberado no menu{" "}
        <b>Marcos e Conexões</b>.
      </p>

      {topicos.length > 0 && (
        <div className="admin-linha marcos-editor-exibicao">
          <b>Exibição no app:</b>

          <button
            type="button"
            className="outline"
            onClick={() => marcarTodos(true)}
            disabled={salvando}
          >
            habilitar todos
          </button>

          <button
            type="button"
            className="outline"
            onClick={() => marcarTodos(false)}
            disabled={salvando}
          >
            desabilitar todos
          </button>

          <span className="admin-dica">
            {desabilitados === 0
              ? "todos os tópicos desta página aparecem no app"
              : `${desabilitados} de ${topicos.length} ${
                  desabilitados === 1 ? "está desabilitado" : "estão desabilitados"
                } — estes não aparecem no app`}
          </span>
        </div>
      )}

      {topicos.length === 0 && (
        <p className="admin-ajuda">
          Ainda não há tópicos nesta página. Use <b>+ Adicionar tópico</b> para começar.
        </p>
      )}

      {topicos.map((marco, i) => (
        <div className="marco-editor-item" key={marco.id}>
          <div className="marco-editor-cabecalho">
            {/* O cabeçalho mostra o TÍTULO do tópico (pedido da autoria,
                02/10/2026): numa tela que cresce muito, é o que permite achar
                de relance o que já está cadastrado, sem ler campo por campo. */}
            <span className="marco-editor-nome">
              <span className="marco-editor-numero">{i + 1}</span>

              <span className="marco-editor-titulo">
                {marco.titulo.trim() || "Tópico ainda sem título"}
              </span>
            </span>

            <div className="admin-linha">
              <button
                type="button"
                className={
                  marcoExibivel(marco)
                    ? "outline marcos-liga habilitado"
                    : "outline marcos-liga"
                }
                aria-pressed={marcoExibivel(marco)}
                onClick={() => alternarTopico(marco.id)}
                disabled={salvando}
                title="aparece ou não aparece no app"
              >
                {marcoExibivel(marco) ? "Habilitado" : "Desabilitado"}
              </button>

              <button
                type="button"
                className="outline"
                onClick={() => mexer(i, i - 1)}
                disabled={i === 0}
                title="subir este tópico"
              >
                ↑
              </button>

              <button
                type="button"
                className="outline"
                onClick={() => mexer(i, i + 1)}
                disabled={i === topicos.length - 1}
                title="descer este tópico"
              >
                ↓
              </button>

              <button
                type="button"
                className="outline"
                onClick={() => {
                  if (
                    window.confirm(
                      "Excluir este tópico? Ele sai do app e não volta sozinho — o conteúdo digitado aqui se perde."
                    )
                  ) {
                    setTopicos((lista) => lista.filter((_m, j) => j !== i));
                    setPendente(true);
                  }
                }}
                title="excluir este tópico"
              >
                ✕
              </button>
            </div>
          </div>

          <label className="admin-campo">
            <b>Título</b>
            <span className="admin-dica">
              o lembrete que fica sempre visível — datas, acontecimentos, pessoas, relações
            </span>
            <input
              type="text"
              value={marco.titulo}
              placeholder="Ex: Doação do terreno à Irmandade, 1798"
              onChange={(e) => mudar(i, "titulo", e.target.value)}
            />
          </label>

          <label className="admin-campo">
            <b>Explicação breve</b>
            <span className="admin-dica">
              o que você desenvolve oralmente durante o tour. Vale a marcação do app:
              **negrito**, *itálico* e linha em branco entre parágrafos
            </span>
            <CaixaQueCresce
              valor={marco.explicacao}
              linhas={3}
              exemplo="Ex: A carta de doação registra a entrega do terreno à irmandade; é o documento que sustenta a presença negra naquele ponto da cidade."
              aoMudar={(texto) => mudar(i, "explicacao", texto)}
            />
          </label>

          <div className="admin-form-grid admin-form-grid-2">
            <label className="admin-campo">
              <b>Referência da fonte</b>
              <span className="admin-dica">
                livro, documento, acervo, relato — como você cita. Pode usar várias linhas; a
                caixa cresce sozinha, sem esconder o que já está escrito
              </span>
              <CaixaQueCresce
                valor={marco.fonte}
                exemplo={"Ex: SILVA, João. Devoção e território.\nVitória: Editora, 2004, p. 45-52."}
                aoMudar={(texto) => mudar(i, "fonte", texto)}
              />
            </label>
          </div>

          {/* Vários links no mesmo tópico (pedido da autoria, 15/10/2026): em
              Arte e Cultura, um endereço para as exposições permanentes e outro
              para a programação, sem criar um tópico para cada. */}
          <div className="admin-campo marco-editor-links">
            <b>Links (opcional)</b>
            <span className="admin-dica">
              Quantos quiser, no mesmo tópico. O <b>rótulo</b> é o que o visitante lê; o
              endereço abre em outra aba. Tópico antigo, com um link só, aparece aqui como
              a primeira linha.
            </span>

            {linksDe(marco).map((link, j) => (
              <div className="marco-editor-link" key={j}>
                <input
                  type="text"
                  className="marco-editor-link-rotulo"
                  placeholder="Rótulo (ex: Exposições permanentes)"
                  value={link.rotulo}
                  onChange={(e) =>
                    mudarLinks(
                      i,
                      linksDe(marco).map((l, k) => (k === j ? { ...l, rotulo: e.target.value } : l))
                    )
                  }
                />

                <input
                  type="text"
                  className="marco-editor-link-url"
                  placeholder="Ex: https://…"
                  value={link.url}
                  onChange={(e) =>
                    mudarLinks(
                      i,
                      linksDe(marco).map((l, k) => (k === j ? { ...l, url: e.target.value } : l))
                    )
                  }
                />

                <button
                  type="button"
                  className="outline"
                  title="remover este link"
                  onClick={() =>
                    mudarLinks(
                      i,
                      linksDe(marco).filter((_l, k) => k !== j)
                    )
                  }
                >
                  ✕
                </button>
              </div>
            ))}

            <div>
              <button
                type="button"
                className="outline"
                onClick={() => mudarLinks(i, [...linksDe(marco), { rotulo: "", url: "" }])}
              >
                + Adicionar link
              </button>
            </div>
          </div>
        </div>
      ))}

      <div className="admin-linha">
        <button
          type="button"
          className="outline"
          onClick={() => {
            setTopicos((lista) => [...lista, novoMarco()]);
            setPendente(true);
            setOk("");
          }}
        >
          + Adicionar tópico
        </button>

        <button type="button" className="btn" onClick={salvar} disabled={salvando || !pendente}>
          {salvando ? "Salvando…" : "Salvar Marcos e Conexões"}
        </button>

        {pendente && <span className="admin-dica">alterações ainda não publicadas</span>}
      </div>

      {ok && <p className="admin-ok">{ok}</p>}
      {erro && <p className="admin-erro">{erro}</p>}

      <p className="admin-ajuda">
        Nesta página: <b>{quantos}</b> {quantos === 1 ? "tópico publicado" : "tópicos publicados"}.
      </p>
    </div>
  );
}
