// BotoesAdmin.tsx — aba "Botões" do painel.
//
// Aqui a autoria muda os NOMES de todos os botões que são do app, em três
// grupos (ver data/botoesDoApp.ts):
//
//   · os seis que fecham as páginas de leitura   → app_config.botoes_intro
//   · os itens da barra do pé da tela            → app_config.barra_navegacao
//   · os atalhos fixos dentro das telas          → app_config.atalhos_paginas
//
// A ordem e para onde cada um leva são do app: não mudam por aqui. Nome em
// branco = volta ao nome padrão. Nada vai ao ar sem "Salvar alterações".
import "../styles.css";

import { useEffect, useState } from "react";

import { salvarConfig } from "../data/api";
import { useTerritorios } from "../context/useTerritorios";
import {
  CHAVE_ORDEM_BOTOES,
  GRUPOS_DE_BOTOES,
  itensNaOrdem,
  lerNomesDeBotoes,
  lerOrdemDoGrupo,
  nomeDoBotao,
  ordemPadraoDoGrupo,
  type GrupoDeBotoes,
} from "../data/botoesDoApp";
import { moverNaLista } from "../utils/ordem";
import BotoesPorTelaAdmin from "./BotoesPorTelaAdmin";

type NomesPorGrupo = Record<string, Record<string, string>>;

/** Lê do config os nomes de todos os grupos. */
function lerTudo(config: Record<string, unknown> | undefined): NomesPorGrupo {
  const tudo: NomesPorGrupo = {};

  GRUPOS_DE_BOTOES.forEach((grupo) => {
    tudo[grupo.id] = lerNomesDeBotoes(config?.[grupo.chave]);
  });

  return tudo;
}

/**
 * A ordem de cada grupo: a que a autoria gravou (já com os botões que ela não
 * listou no fim, na ordem padrão). Sem nada gravado, é a ordem padrão.
 */
function ordensIniciais(config: Record<string, unknown> | undefined): Record<string, string[]> {
  const gravada = config?.[CHAVE_ORDEM_BOTOES];
  const ordens: Record<string, string[]> = {};

  GRUPOS_DE_BOTOES.forEach((grupo) => {
    const daAutoria = lerOrdemDoGrupo(gravada, grupo.id);
    const base = daAutoria.length > 0 ? daAutoria : ordemPadraoDoGrupo(grupo);

    ordens[grupo.id] = itensNaOrdem(grupo, base).map((item) => item.id);
  });

  return ordens;
}

/** Frase de prévia: como o visitante vai ler aquele grupo, na ordem da tela. */
function comoFica(grupo: GrupoDeBotoes, nomes: Record<string, string>, ordem: string[]): string {
  return itensNaOrdem(grupo, ordem)
    .map((item) => nomeDoBotao(nomes, item.id, item.padrao))
    .join(" · ");
}

export default function BotoesAdmin() {
  const { config, recarregar } = useTerritorios();

  // o estado começa já com o que está gravado, para a tela não piscar vazia
  const [nomes, setNomes] = useState<NomesPorGrupo>(() => lerTudo(config));
  const [ordem, setOrdem] = useState<Record<string, string[]>>(() => ordensIniciais(config));

  const [ok, setOk] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let ativo = true;

    (async () => {
      // espera um tick para não disparar render em cascata dentro do efeito
      await Promise.resolve();
      if (!ativo) return;

      setNomes(lerTudo(config));
      setOrdem(ordensIniciais(config));
    })();

    return () => {
      ativo = false;
    };
  }, [config]);

  function mudar(grupoId: string, itemId: string, valor: string) {
    setNomes((atual) => {
      const doGrupo = { ...(atual[grupoId] ?? {}) };

      if (valor.trim()) {
        doGrupo[itemId] = valor;
      } else {
        delete doGrupo[itemId];
      }

      return { ...atual, [grupoId]: doGrupo };
    });
  }

  /** Sobe (delta -1) ou desce (delta +1) um botão dentro do grupo. */
  function mover(grupoId: string, itemId: string, delta: number) {
    setOrdem((atual) => ({
      ...atual,
      [grupoId]: moverNaLista(atual[grupoId] ?? [], itemId, delta),
    }));
  }

  function descartar() {
    setNomes(lerTudo(config));
    setOrdem(ordensIniciais(config));
    setErro("");
    setOk("Mostrando o que está publicado — o que não foi salvo saiu da tela.");
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();

    setOk("");
    setErro("");
    setSalvando(true);

    try {
      // um grupo por vez: cada um vive na sua chave em app_config
      for (const grupo of GRUPOS_DE_BOTOES) {
        await salvarConfig(grupo.chave, nomes[grupo.id] ?? {});
      }

      // a ordem de todos os grupos vive numa chave só
      await salvarConfig(CHAVE_ORDEM_BOTOES, ordem);

      await recarregar();
      setOk("Nomes e ordem dos botões salvos — já valem no app.");
    } catch (err) {
      console.error(err);
      setErro(err instanceof Error ? err.message : "Falha ao salvar os nomes.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="botoes-admin">
      <h1>Botões</h1>

      <p className="admin-ajuda">
        Aqui você muda os <b>nomes</b> e a <b>ordem</b> de todos os botões que são do app. Para
        mudar a ordem, use <b>↑</b> e <b>↓</b> em cada botão; <b>para onde</b> cada um leva é do
        app. Deixar um nome em branco faz ele voltar ao padrão. Nada vai ao ar sem{" "}
        <b>Salvar alterações</b>.
      </p>

      <p className="admin-ajuda">
        Os botões que <b>você cria</b> nas páginas continuam sendo editados na aba{" "}
        <b>Páginas</b>, dentro de cada seção; e o botão <b>Enviar uma mensagem</b> tem a seção
        dele na aba Páginas também.
      </p>

      {ok && <p className="admin-ok">{ok}</p>}
      {erro && <p className="admin-erro">{erro}</p>}

      <form className="admin-form" onSubmit={salvar}>
        {GRUPOS_DE_BOTOES.map((grupo) => (
          <section key={grupo.id} className="admin-grupo-botoes">
            <h2>{grupo.titulo}</h2>

            <p className="admin-ajuda">{grupo.ajuda}</p>

            <p className="admin-ajuda">
              Como o visitante vai ler:{" "}
              <b>{comoFica(grupo, nomes[grupo.id] ?? {}, ordem[grupo.id] ?? [])}</b>
            </p>

            {itensNaOrdem(grupo, ordem[grupo.id] ?? []).map((item, i) => (
              <div className="admin-linha" key={item.id}>
                <label className="admin-campo">
                  <b>
                    {i + 1}. {item.padrao}
                  </b>
                  <span className="admin-campo-dica">
                    Leva para <b>{item.destino}</b> — {item.onde}. Em branco, volta ao nome “
                    {item.padrao}”.
                  </span>
                  <input
                    type="text"
                    placeholder={item.exemplo ?? "Ex: outro nome para este botão"}
                    value={(nomes[grupo.id] ?? {})[item.id] ?? ""}
                    onChange={(e) => mudar(grupo.id, item.id, e.target.value)}
                  />
                </label>

                <button
                  type="button"
                  className="outline"
                  onClick={() => mover(grupo.id, item.id, -1)}
                  disabled={i === 0}
                  title="subir este botão"
                >
                  ↑
                </button>

                <button
                  type="button"
                  className="outline"
                  onClick={() => mover(grupo.id, item.id, 1)}
                  disabled={i === itensNaOrdem(grupo, ordem[grupo.id] ?? []).length - 1}
                  title="descer este botão"
                >
                  ↓
                </button>
              </div>
            ))}
          </section>
        ))}

        <div className="admin-form-botoes">
          <button type="button" className="outline" onClick={descartar}>
            Descartar mudanças
          </button>

          <button type="submit" className="btn" disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </form>

      {/* quais botões existem e em que telas eles aparecem (02/10/2026) */}
      <BotoesPorTelaAdmin />
    </div>
  );
}
