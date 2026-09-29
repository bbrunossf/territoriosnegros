// src/components/BotaoContatoAdmin.tsx
// Editor do botão de ação "Enviar uma mensagem" que aparece no fim das telas.
// Grava em app_config na chave "botao_contato". Fica na aba Páginas.

import { useEffect, useState } from "react";

import { salvarConfig } from "../data/api";
import { useTerritorios } from "../context/useTerritorios";
import { formatarDataHoraBR } from "../utils/data";
import {
  BOTAO_CONTATO_PADRAO,
  TELAS_BOTAO,
  normalizarBotaoContato,
  type BotaoContato,
} from "../data/botaoContato";

export default function BotaoContatoAdmin() {
  const { config, recarregar } = useTerritorios();

  const [botao, setBotao] = useState<BotaoContato>(BOTAO_CONTATO_PADRAO);
  const [salvando, setSalvando] = useState(false);
  const [ok, setOk] = useState("");
  const [erro, setErro] = useState("");

  // vem do banco (chave botao_contato)
  useEffect(() => {
    let ativo = true;

    (async () => {
      await Promise.resolve();
      if (!ativo) return;

      setBotao(normalizarBotaoContato(config.botao_contato));
      setOk("");
      setErro("");
    })();

    return () => {
      ativo = false;
    };
  }, [config]);

  const escondidas = botao.ocultar.length;
  const aparecendo = TELAS_BOTAO.length - escondidas;

  function alternarTela(chave: string, aparece: boolean) {
    setBotao((b) => ({
      ...b,
      ocultar: aparece
        ? b.ocultar.filter((c) => c !== chave)
        : [...b.ocultar, chave],
    }));
    setOk("");
  }

  function esconderTodas(ocultar: boolean) {
    setBotao((b) => ({
      ...b,
      ocultar: ocultar ? TELAS_BOTAO.map((t) => t.chave) : [],
    }));
    setOk("");
  }

  async function salvar() {
    setErro("");
    setOk("");
    setSalvando(true);

    try {
      await salvarConfig("botao_contato", {
        ativo: botao.ativo,
        texto: botao.texto.trim() || BOTAO_CONTATO_PADRAO.texto,
        ocultar: botao.ocultar,
      });

      await recarregar();
      setOk(
        `Botão publicado em ${formatarDataHoraBR(new Date().toISOString())}. ` +
          (botao.ativo
            ? `Aparecendo em ${aparecendo} de ${TELAS_BOTAO.length} telas.`
            : "O interruptor está desligado: não aparece em nenhuma tela.")
      );
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao salvar o botão.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="admin-fotos">
      <b>Botão "Enviar uma mensagem" no fim das telas</b>

      <p className="admin-ajuda">
        Este botão leva o visitante para a página de contato. Ele aparece no fim das
        telas do app — e <b>nunca</b> na tela inicial (capa) nem na própria página de
        contato, que já tem o formulário. Se alguma página já tem um botão que leva
        para o contato, ele não é repetido.
      </p>

      {ok && <p className="admin-ok">{ok}</p>}
      {erro && <p className="admin-erro">{erro}</p>}

      <label className="admin-campo">
        O botão deve aparecer?
        <select
          value={botao.ativo ? "sim" : "nao"}
          onChange={(e) => {
            setBotao((b) => ({ ...b, ativo: e.target.value === "sim" }));
            setOk("");
          }}
        >
          <option value="sim">sim, aparecer no fim das telas</option>
          <option value="nao">não, desligado (some de todas as telas)</option>
        </select>
      </label>

      <label className="admin-campo">
        Texto do botão
        <input
          type="text"
          placeholder={BOTAO_CONTATO_PADRAO.texto}
          value={botao.texto}
          onChange={(e) => {
            setBotao((b) => ({ ...b, texto: e.target.value }));
            setOk("");
          }}
        />
      </label>

      <div className="admin-subsecao">
        <b>Onde o botão aparece</b>
        <p className="admin-campo-dica">
          Desmarque a tela onde ele não deve aparecer. Situação: {aparecendo} de{" "}
          {TELAS_BOTAO.length} telas aparecendo.
        </p>

        <div className="admin-telas">
          {TELAS_BOTAO.map((t) => (
            <label key={t.chave} className="admin-tela">
              <input
                type="checkbox"
                checked={!botao.ocultar.includes(t.chave)}
                onChange={(e) => alternarTela(t.chave, e.target.checked)}
              />
              {t.nome}
            </label>
          ))}
        </div>

        <div className="admin-galeria-acoes">
          <button type="button" className="outline" onClick={() => esconderTodas(false)}>
            Mostrar em todas
          </button>
          <button type="button" className="outline" onClick={() => esconderTodas(true)}>
            Esconder de todas
          </button>
        </div>
      </div>

      <button type="button" className="btn" onClick={salvar} disabled={salvando}>
        {salvando ? "salvando..." : "Salvar botão"}
      </button>

      <p className="admin-campo-dica">
        Lembrando: a capa (tela inicial) e a página de contato não recebem este botão.
      </p>
    </div>
  );
}
