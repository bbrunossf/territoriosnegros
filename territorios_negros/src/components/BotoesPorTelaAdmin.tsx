// src/components/BotoesPorTelaAdmin.tsx
//
// A seção "Em cada tela" do menu Botões do painel (pedido da autoria, 02/10/2026):
// ligar e desligar os botões de navegação do app e escolher, em cada tela, quais
// aparecem — no topo, no final, ou nos dois — e em que ordem.
//
// Grava duas chaves em app_config:
//   · botoes_desligados → botões fora do ar no app inteiro
//   · atalhos_por_tela  → as listas de cada tela
import "../styles/botoes-telas.css";

import { useEffect, useState, type MutableRefObject } from "react";

import { useTerritorios } from "../context/useTerritorios";
import { salvarConfig } from "../data/api";
import { moverNaLista } from "../utils/ordem";
import {
  CATALOGO_DE_NAVEGACAO,
  CHAVE_ATALHOS_POR_TELA,
  CHAVE_BOTOES_DESLIGADOS,
  TELAS_DO_APP,
  atalhosDaTela,
  catalogoPorId,
  comBotao,
  lerDesligados,
  nomeDoCatalogo,
  ondeAparece,
  semBotao,
  type ListaDaTela,
} from "../data/botoesPorTela";

type PorTela = Record<string, ListaDaTela>;

/** Lê do config o que está gravado, já com o padrão valendo onde não há nada. */
function lerTudo(config: Record<string, unknown>): { desligados: string[]; porTela: PorTela } {
  const porTela: PorTela = {};

  TELAS_DO_APP.forEach((tela) => {
    porTela[tela.id] = {
      topo: atalhosDaTela(config, tela.id, "topo"),
      final: atalhosDaTela(config, tela.id, "final"),
    };
  });

  return { desligados: lerDesligados(config[CHAVE_BOTOES_DESLIGADOS]), porTela };
}

export default function BotoesPorTelaAdmin({
  salvarRef,
}: {
  /** a tela de Botões usa UM botão de salvar: ela chama esta função */
  salvarRef: MutableRefObject<(() => Promise<void>) | null>;
}) {
  const { config } = useTerritorios();

  const [desligados, setDesligados] = useState<string[]>(() => lerTudo(config).desligados);
  const [porTela, setPorTela] = useState<PorTela>(() => lerTudo(config).porTela);

  useEffect(() => {
    let ativo = true;

    (async () => {
      await Promise.resolve();
      if (!ativo) return;

      const lido = lerTudo(config);

      setDesligados(lido.desligados);
      setPorTela(lido.porTela);
    })();

    return () => {
      ativo = false;
    };
  }, [config]);

  function ligar(id: string, ligado: boolean) {
    setDesligados((atual) => (ligado ? atual.filter((i) => i !== id) : [...atual, id]));
  }

  /** Mexe numa lista (topo ou final) de uma tela. */
  function mudarLista(tela: string, posicao: "topo" | "final", nova: string[]) {
    setPorTela((atual) => ({
      ...atual,
      [tela]: { ...(atual[tela] ?? { topo: [], final: [] }), [posicao]: nova },
    }));
  }

  /**
   * O "Salvar alterações" da tela de Botões salva as duas partes de uma vez —
   * nomes/ordem (feito na tela) e esta lista de botões por tela. Antes havia
   * dois botões e dava para salvar um só, achando que tudo estava salvo.
   */
  useEffect(() => {
    salvarRef.current = async () => {
      await salvarConfig(CHAVE_BOTOES_DESLIGADOS, desligados);
      await salvarConfig(CHAVE_ATALHOS_POR_TELA, porTela);
    };

    return () => {
      salvarRef.current = null;
    };
  });

  return (
    <section className="botoes-telas">
      <h2>Em cada tela</h2>

      <p className="admin-ajuda">
        A ordem <b>começa</b> como está publicado hoje. Mexer aqui não muda nada até você{" "}
        <b>salvar alterações</b> no fim da tela — o mesmo botão salva os nomes e as telas.
      </p>

      <h3 className="admin-form-secao">Quais botões existem no app</h3>

      {CATALOGO_DE_NAVEGACAO.map((botao) => {
        const ligado = !desligados.includes(botao.id);
        const lugares = ondeAparece({ ...config, [CHAVE_BOTOES_DESLIGADOS]: desligados }, botao.id);

        return (
          <div className="botoes-telas-liga" key={botao.id}>
            <label>
              <input
                type="checkbox"
                checked={ligado}
                onChange={(e) => ligar(botao.id, e.target.checked)}
              />{" "}
              <b>{nomeDoCatalogo(config, botao)}</b>
            </label>

            <span className="botoes-telas-onde">
              leva para <b>{botao.destino}</b>
              {ligado
                ? lugares.length > 0
                  ? ` · aparece em ${lugares.join(", ")}`
                  : " · não aparece em nenhuma tela"
                : " · desligado no app"}
            </span>
          </div>
        );
      })}

      <h3 className="admin-form-secao">Botões de cada tela</h3>

      {TELAS_DO_APP.map((tela) => (
        <div className="botoes-telas-tela" key={tela.id}>
          <h3 className="botoes-telas-nome">{tela.nome}</h3>
          <p className="botoes-telas-onde-tela">{tela.onde}</p>

          {tela.slots.map((posicao) => {
            const lista = porTela[tela.id]?.[posicao] ?? [];
            const restantes = CATALOGO_DE_NAVEGACAO.filter((b) => !lista.includes(b.id));

            return (
              <div className="botoes-telas-local" key={posicao}>
                <h4>{posicao === "topo" ? "no topo da página" : "no final da página"}</h4>

                {lista.length === 0 && (
                  <p className="botoes-telas-vazio">
                    nenhum botão {posicao === "topo" ? "no topo" : "no final"} desta tela
                  </p>
                )}

                {lista.map((id, i) => {
                  const entrada = catalogoPorId(id);

                  return (
                    <div className="botoes-telas-linha" key={id}>
                      <b>
                        {i + 1}. {entrada ? nomeDoCatalogo(config, entrada) : id}
                      </b>

                      <span className="botoes-telas-onde">→ {entrada?.destino}</span>

                      <button
                        type="button"
                        className="outline"
                        onClick={() => mudarLista(tela.id, posicao, moverNaLista(lista, id, -1))}
                        disabled={i === 0}
                        title="subir"
                      >
                        ↑
                      </button>

                      <button
                        type="button"
                        className="outline"
                        onClick={() => mudarLista(tela.id, posicao, moverNaLista(lista, id, 1))}
                        disabled={i === lista.length - 1}
                        title="descer"
                      >
                        ↓
                      </button>

                      <button
                        type="button"
                        className="outline"
                        onClick={() => mudarLista(tela.id, posicao, semBotao(lista, id))}
                        title="tirar desta tela"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}

                {restantes.length > 0 && (
                  <div className="botoes-telas-add">
                    <select
                      defaultValue=""
                      onChange={(e) => {
                        if (!e.target.value) return;
                        mudarLista(tela.id, posicao, comBotao(lista, e.target.value));
                        e.target.value = "";
                      }}
                    >
                      <option value="">+ adicionar botão…</option>
                      {restantes.map((b) => (
                        <option key={b.id} value={b.id}>
                          {nomeDoCatalogo(config, b)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            );
          })}

          <p className="botoes-telas-resumo">
            {(porTela[tela.id]?.topo ?? []).length} no topo ·{" "}
            {(porTela[tela.id]?.final ?? []).length} no final
          </p>
        </div>
      ))}

    </section>
  );
}
