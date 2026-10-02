// src/components/ManualAdmin.tsx
//
// Manual do painel — a autoria lê E EDITA aqui mesmo.
//
// O manual original mora em `src/data/manualAdmin.ts`; o que ela salvar vai para
// `app_config` ("manual_admin") e passa a valer. "Restaurar o manual original"
// apaga a configuração e o texto do código volta a valer — por isso a aba nunca
// fica vazia, mesmo se algo der errado.
import "../styles.css";

import { useState } from "react";
import { Link } from "react-router-dom";

import { useTerritorios } from "../context/useTerritorios";
import { salvarConfig } from "../data/api";
import {
  ehManualPadrao,
  normalizarManual,
  secaoNova,
  type SecaoManual,
} from "../data/manualAdmin";
import ManualSecoes from "./ManualSecoes";

/**
 * Rascunho do editor: os itens ficam como TEXTO (uma linha por item) em vez de
 * lista, senão a linha em branco que a autoria está digitando seria descartada a
 * cada tecla e o cursor pularia de lugar.
 */
interface SecaoRascunho {
  id: string;
  titulo: string;
  texto: string;
  itensTexto: string;
}

function paraRascunho(secoes: SecaoManual[]): SecaoRascunho[] {
  return secoes.map((secao) => ({
    id: secao.id,
    titulo: secao.titulo,
    texto: secao.texto,
    itensTexto: secao.itens.join("\n"),
  }));
}

function doRascunho(rascunho: SecaoRascunho[]): SecaoManual[] {
  return rascunho.map((secao) => ({
    id: secao.id,
    titulo: secao.titulo.trim(),
    texto: secao.texto,
    itens: secao.itensTexto
      .split("\n")
      .map((linha) => linha.trim())
      .filter(Boolean),
  }));
}

export default function ManualAdmin() {
  const { config, recarregar } = useTerritorios();

  const [editando, setEditando] = useState(false);
  const [rascunho, setRascunho] = useState<SecaoRascunho[] | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState("");

  const manual = normalizarManual(config.manual_admin);
  const secoes = rascunho ? doRascunho(rascunho) : manual;
  /** o editor trabalha com o rascunho cru (itens ainda como texto) */
  const secoesEditaveis = rascunho ?? paraRascunho(manual);

  const pendente =
    rascunho !== null && JSON.stringify(doRascunho(rascunho)) !== JSON.stringify(manual);

  function comecarEdicao() {
    setRascunho(paraRascunho(manual));
    setEditando(true);
    setErro("");
    setOk("");
  }

  function cancelar() {
    setRascunho(null);
    setEditando(false);
    setErro("");
  }

  function mudarSecao(indice: number, campo: keyof SecaoRascunho, valor: string) {
    setRascunho((atual) =>
      (atual ?? []).map((secao, i) => (i === indice ? { ...secao, [campo]: valor } : secao))
    );
  }

  function mover(indice: number, delta: number) {
    setRascunho((atual) => {
      if (!atual) return atual;

      const destino = indice + delta;
      if (destino < 0 || destino >= atual.length) return atual;

      const novas = [...atual];
      [novas[indice], novas[destino]] = [novas[destino], novas[indice]];
      return novas;
    });
  }

  function removerSecao(indice: number) {
    const titulo = rascunho?.[indice]?.titulo || "esta seção";

    if (!window.confirm(`Remover “${titulo}” do manual?`)) return;

    setRascunho((atual) => (atual ?? []).filter((_, i) => i !== indice));
  }

  function acrescentarSecao() {
    const nova = secaoNova();

    setRascunho((atual) => [
      ...(atual ?? []),
      { id: nova.id, titulo: nova.titulo, texto: nova.texto, itensTexto: "" },
    ]);
  }

  async function salvar() {
    if (!rascunho) return;

    setSalvando(true);
    setErro("");
    setOk("");

    try {
      await salvarConfig("manual_admin", { secoes: doRascunho(rascunho) });
      await recarregar();
      setRascunho(null);
      setEditando(false);
      setOk(
        "Manual salvo. Esta é a versão que passa a valer no painel — nada aqui muda o app."
      );
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao salvar o manual.");
    } finally {
      setSalvando(false);
    }
  }

  async function restaurar() {
    const certeza = window.confirm(
      "Voltar ao manual original? O texto que você escreveu será perdido e o manual que veio com o app volta a valer."
    );

    if (!certeza) return;

    setSalvando(true);
    setErro("");
    setOk("");

    try {
      await salvarConfig("manual_admin", {});
      await recarregar();
      setRascunho(null);
      setEditando(false);
      setOk("Manual original restaurado.");
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao restaurar o manual.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="admin-tela manual">
      <h1>Manual do painel</h1>

      {!editando && (
        <>
          <p className="admin-ajuda">
            Este manual fica aqui dentro para você consultar sempre que tiver dúvida sobre como
            operar, editar ou administrar o app. Ele é <b>seu</b>: pode reescrever, reorganizar e
            acrescentar o que faltar. Ele não substitui o app — depois de mexer em algo de
            exibição, abra o app (ou <b>Ctrl+Shift+R</b> na aba que já estava aberta) e confira o
            que o visitante vê.
          </p>

          <div className="admin-galeria-acoes">
            <button type="button" className="btn" onClick={comecarEdicao}>
              Editar o manual
            </button>

            {!ehManualPadrao(manual) && (
              <button type="button" className="outline" onClick={restaurar} disabled={salvando}>
                restaurar o manual original
              </button>
            )}
          </div>
        </>
      )}

      {ok && <p className="admin-ok">{ok}</p>}
      {erro && <p className="admin-erro">{erro}</p>}

      {!editando && (
        <>
          <ManualSecoes secoes={secoes} />

          <p className="admin-ajuda">
            Precisa editar alguma coisa agora?{" "}
            <Link to="/admin/territorios">ir para Territórios</Link> ·{" "}
            <Link to="/">ver o app</Link>
          </p>
        </>
      )}

      {editando && (
        <form
          className="admin-form"
          onSubmit={(evento) => {
            evento.preventDefault();
            salvar();
          }}
        >
          <p className="admin-ajuda">
            Escreva como você fala. Nos textos valem <b>**negrito**</b>, <b>*itálico*</b> e{" "}
            <b>linha em branco</b> entre parágrafos — a mesma marcação do resto do painel. Nos{" "}
            <b>itens</b>, use uma linha por item; se a linha tiver <b> → </b>, ela sai como a
            caixinha de exemplo: o lado esquerdo fica literal (para ler o comando) e o direito
            formatado.
          </p>

          <p className="admin-ajuda">
            <b>{secoesEditaveis.length} seção(ões)</b> no manual. Use <b>↑ ↓</b> para mudar a
            ordem — o índice do topo se ajusta sozinho.
            {pendente && <span className="admin-pendente"> · alterações não salvas</span>}
          </p>

          {secoesEditaveis.map((secao, i) => (
            <div className="admin-bloco" key={secao.id}>
              <div className="admin-bloco-topo">
                <span className="admin-bloco-num">seção {i + 1}</span>

                <button
                  type="button"
                  className="outline"
                  onClick={() => mover(i, -1)}
                  disabled={i === 0}
                  title="Mover para cima"
                >
                  ↑
                </button>

                <button
                  type="button"
                  className="outline"
                  onClick={() => mover(i, 1)}
                  disabled={i === secoesEditaveis.length - 1}
                  title="Mover para baixo"
                >
                  ↓
                </button>

                <button type="button" className="outline" onClick={() => removerSecao(i)}>
                  remover seção
                </button>
              </div>

              <label className="admin-campo">
                <b>Título</b>
                <span className="admin-campo-dica">
                  é o que aparece no índice e no alto da seção
                </span>
                <input
                  type="text"
                  value={secao.titulo}
                  onChange={(e) => mudarSecao(i, "titulo", e.target.value)}
                />
              </label>

              <label className="admin-campo">
                <b>Texto</b>
                <span className="admin-campo-dica">
                  parágrafos · linha em branco separa · **negrito** e *itálico* valem
                </span>
                <textarea
                  rows={5}
                  value={secao.texto}
                  onChange={(e) => mudarSecao(i, "texto", e.target.value)}
                />
              </label>

              <label className="admin-campo">
                <b>Itens (opcional)</b>
                <span className="admin-campo-dica">
                  uma linha por item · a linha com “ → ” vira a caixinha de exemplo
                </span>
                <textarea
                  rows={4}
                  value={secao.itensTexto}
                  onChange={(e) => mudarSecao(i, "itensTexto", e.target.value)}
                />
              </label>
            </div>
          ))}

          <div className="admin-galeria-acoes">
            <button type="button" className="outline" onClick={acrescentarSecao}>
              + acrescentar seção
            </button>
          </div>

          <div className="admin-galeria-acoes">
            <button type="submit" className="btn" disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar manual"}
            </button>

            <button type="button" className="outline" onClick={cancelar} disabled={salvando}>
              cancelar
            </button>

            <button type="button" className="outline" onClick={restaurar} disabled={salvando}>
              restaurar o manual original
            </button>
          </div>

          <p className="admin-ajuda">
            O manual vale só no painel — nada aqui muda o app. Se algo não sair como você espera,
            é só <b>restaurar o manual original</b> e me chamar.
          </p>
        </form>
      )}
    </div>
  );
}
