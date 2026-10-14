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
import { useExpansao } from "../context/useExpansao";
import {
  CHAVE_MARCOS,
  marcoPreenchido,
  mover,
  novoMarco,
  normalizarMarcos,
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
  const [permitirExpansao, definirExpansao] = useExpansao();

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

  return (
    <div className="admin-bloco marcos-editor">
      <h3>Marcos e Conexões</h3>

      <p className="admin-ajuda">
        Tópicos de apoio à sua fala durante os tours, em <b>{onde}</b>. O <b>título</b> fica
        sempre visível para o visitante; a <b>explicação</b> e a <b>fonte</b> só aparecem quando a
        expansão está permitida.
      </p>

      {/* Controle pedido pela autoria (02/10/2026): liberar e bloquear a exibição
          das explicações e fontes SEM sair da tela de cadastro. É o mesmo
          controle da guia "Marcos e Conexões" — a preferência é do aparelho e
          vale para todas as páginas, de uma vez. */}
      <div className="admin-linha marcos-editor-expansao">
        <b>Explicações e fontes:</b>

        <button
          type="button"
          className="outline"
          aria-pressed={permitirExpansao}
          onClick={() => definirExpansao(!permitirExpansao)}
        >
          {permitirExpansao
            ? "Podem ser exibidas — toque para bloquear"
            : "Bloqueadas — toque para liberar"}
        </button>

        <span className="admin-dica">
          {permitirExpansao
            ? "no app deste aparelho, os títulos abrem e fecham ao toque"
            : "sem expansão, o visitante vê só os títulos — sem setas nem ícones de abrir"}
        </span>
      </div>

      <p className="admin-dica marcos-editor-expansao-nota">
        Vale para todas as páginas deste aparelho, ao mesmo tempo, e fica guardado no navegador. O
        mesmo controle está na guia <b>Marcos e Conexões</b>.
      </p>

      {topicos.length === 0 && (
        <p className="admin-ajuda">
          Ainda não há tópicos nesta página. Use <b>+ Adicionar tópico</b> para começar.
        </p>
      )}

      {topicos.map((marco, i) => (
        <div className="marco-editor-item" key={marco.id}>
          <div className="marco-editor-cabecalho">
            <b>Tópico {i + 1}</b>

            <div className="admin-linha">
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

            <label className="admin-campo">
              <b>Link da fonte (opcional)</b>
              <span className="admin-dica">endereço na internet, quando existir</span>
              <input
                type="text"
                value={marco.fonteUrl}
                placeholder="Ex: https://…"
                onChange={(e) => mudar(i, "fonteUrl", e.target.value)}
              />
            </label>
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
