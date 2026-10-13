// EditorDeMarcos.tsx — cadastro dos tópicos de "Marcos e Conexões" no painel.
//
// Um só componente, usado em três lugares: nas fichas de território, nas páginas
// do app (Vitória e Presença Negra, pela aba Páginas) e nas personalidades.
// O conteúdo é independente por página; cada editor grava só a sua chave dentro
// de app_config.marcos_conexoes.

import { useEffect, useState } from "react";
import "../styles/marcos.css";
import { salvarConfig } from "../data/api";
import { useTerritorios } from "../context/useTerritorios";
import {
  CHAVE_MARCOS,
  marcoPreenchido,
  mover,
  novoMarco,
  normalizarMarcos,
  type Marco,
} from "../data/marcos";

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

  const [topicos, setTopicos] = useState<Marco[]>([]);
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
        expansão está permitida no seu aparelho (guia <b>Marcos e Conexões</b>). Sem tópico com
        título, a seção não aparece no app.
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
            <textarea
              value={marco.explicacao}
              placeholder="Ex: A carta de doação registra a entrega do terreno à irmandade; é o documento que sustenta a presença negra naquele ponto da cidade."
              onChange={(e) => mudar(i, "explicacao", e.target.value)}
            />
          </label>

          <div className="admin-form-grid admin-form-grid-2">
            <label className="admin-campo">
              <b>Referência da fonte</b>
              <span className="admin-dica">livro, documento, acervo, relato — como você cita</span>
              <input
                type="text"
                value={marco.fonte}
                placeholder="Ex: Livro de tombo da Irmandade do Rosário"
                onChange={(e) => mudar(i, "fonte", e.target.value)}
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
