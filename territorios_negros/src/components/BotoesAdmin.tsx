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
  GRUPOS_DE_BOTOES,
  lerNomesDeBotoes,
  nomeDoBotao,
  type GrupoDeBotoes,
} from "../data/botoesDoApp";

type NomesPorGrupo = Record<string, Record<string, string>>;

/** Lê do config os nomes de todos os grupos. */
function lerTudo(config: Record<string, unknown> | undefined): NomesPorGrupo {
  const tudo: NomesPorGrupo = {};

  GRUPOS_DE_BOTOES.forEach((grupo) => {
    tudo[grupo.id] = lerNomesDeBotoes(config?.[grupo.chave]);
  });

  return tudo;
}

/** Frase de prévia: como o visitante vai ler aquele grupo. */
function comoFica(grupo: GrupoDeBotoes, nomes: Record<string, string>): string {
  return grupo.itens.map((item) => nomeDoBotao(nomes, item.id, item.padrao)).join(" · ");
}

export default function BotoesAdmin() {
  const { config, recarregar } = useTerritorios();

  // o estado começa já com o que está gravado, para a tela não piscar vazia
  const [nomes, setNomes] = useState<NomesPorGrupo>(() => lerTudo(config));

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

  function descartar() {
    setNomes(lerTudo(config));
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

      await recarregar();
      setOk("Nomes dos botões salvos — já valem no app.");
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
        Aqui você muda os <b>nomes</b> de todos os botões que são do app. A <b>ordem</b> e{" "}
        <b>para onde</b> cada um leva são do app: não mudam por aqui. Deixar um nome em branco
        faz ele voltar ao padrão. Nada vai ao ar sem <b>Salvar alterações</b>.
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
              Como o visitante vai ler: <b>{comoFica(grupo, nomes[grupo.id] ?? {})}</b>
            </p>

            {grupo.itens.map((item, i) => (
              <label className="admin-campo" key={item.id}>
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
    </div>
  );
}
