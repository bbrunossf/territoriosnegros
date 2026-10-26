// AcessosAdmin.tsx — contador de acessos (aba "Acessos" do painel)
//
// Estatística anônima de uso do app: quantas telas foram abertas, quantas
// visitas (abas diferentes), páginas mais vistas, uso por dia e por tipo de
// aparelho. Nada de dado pessoal é guardado.
import "../styles.css";

import { useCallback, useEffect, useMemo, useState } from "react";
import { contarAcessos, fetchAcessos, limparAcessosAntigos, zerarAcessos } from "../data/api";
import type { Acesso } from "../data/types";
import { formatarDataHoraBR } from "../utils/data";
import {
  hojeNoFuso,
  porDia,
  porDispositivo,
  porRota,
  resumo,
  rotuloDiaCurto,
} from "../utils/estatisticas";

const PERIODOS = [
  { dias: 7, nome: "7 dias" },
  { dias: 30, nome: "30 dias" },
  { dias: 90, nome: "90 dias" },
  { dias: 365, nome: "1 ano" },
];

export default function AcessosAdmin() {
  const [dias, setDias] = useState(30);
  const [acessos, setAcessos] = useState<Acesso[]>([]);
  const [totalGeral, setTotalGeral] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [carregadoEm, setCarregadoEm] = useState("");
  const [ok, setOk] = useState("");
  const [erro, setErro] = useState("");

  // Confirmação DENTRO da página (14/10/2026): o `window.confirm` do navegador
  // pode ficar bloqueado ("impedir esta página de abrir mais caixas") e aí o
  // clique não fazia nada. Aqui a pergunta aparece na própria tela.
  const [confirmando, setConfirmando] = useState<"" | "zerar" | "antigos">("");

  const carregar = useCallback(async (janela: number) => {
    const [lista, total] = await Promise.all([fetchAcessos(janela), contarAcessos()]);
    return { lista, total };
  }, []);

  // busca inicial e a cada troca de período
  useEffect(() => {
    let ativo = true;

    (async () => {
      try {
        const { lista, total } = await carregar(dias);
        if (!ativo) return;

        setAcessos(lista);
        setTotalGeral(total);
        setCarregadoEm(formatarDataHoraBR(new Date().toISOString()));
        setErro("");
      } catch (e) {
        console.error(e);
        if (!ativo) return;

        setErro(
          e instanceof Error
            ? e.message
            : "Falha ao carregar os acessos. Se a tabela ainda não existe, rode a migração no Supabase."
        );
      } finally {
        if (ativo) setCarregando(false);
      }
    })();

    return () => {
      ativo = false;
    };
  }, [carregar, dias]);

  async function atualizar() {
    setOk("");
    setErro("");
    setCarregando(true);

    try {
      const { lista, total } = await carregar(dias);
      setAcessos(lista);
      setTotalGeral(total);
      setCarregadoEm(formatarDataHoraBR(new Date().toISOString()));
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao carregar os acessos.");
    } finally {
      setCarregando(false);
    }
  }

  const hoje = hojeNoFuso();

  const dados = useMemo(() => {
    const total = porDia(acessos, Math.min(dias, 30), hoje).filter(
      (d) => d.paginas > 0 || d.dia === hoje
    );

    return {
      resumo: resumo(acessos),
      paginas: porRota(acessos),
      dias: total,
      dispositivos: porDispositivo(acessos),
      hoje: acessos.filter((a) => a.dia === hoje).length,
      maiorDia: total.reduce((maior, d) => Math.max(maior, d.paginas), 0),
    };
  }, [acessos, dias, hoje]);

  async function executarApagarAntigos() {
    setConfirmando("");
    setOk("");
    setErro("");

    try {
      await limparAcessosAntigos(365);
      await atualizar();
      setOk("Registros com mais de 1 ano apagados.");
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao apagar os registros antigos.");
    }
  }

  /** zera tudo: usado antes de divulgar o app, para o número sair limpo */
  async function executarZerar() {
    setConfirmando("");
    setOk("");
    setErro("");

    try {
      const apagados = await zerarAcessos();
      await atualizar();

      if (apagados === 0 && totalGeral > 0) {
        setErro(
          `O banco recusou a exclusão: ${totalGeral} registro(s) continuam lá. ` +
            `Isso é permissão (RLS) na tabela acessos — avise quem cuida do banco.`
        );
        return;
      }

      setOk(
        `Estatísticas zeradas: ${apagados} registro(s) apagado(s). A contagem começou de ` +
          `novo a partir de agora.`
      );
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao zerar as estatísticas.");
    }
  }

  return (
    <div>
      <h1>Acessos</h1>

      <div className="admin-abas">
        {PERIODOS.map((p) => (
          <button
            key={p.dias}
            type="button"
            className={p.dias === dias ? "btn" : "outline"}
            onClick={() => {
              setOk("");
              setDias(p.dias);
            }}
          >
            {p.nome}
          </button>
        ))}

        <button
          type="button"
          className="outline"
          onClick={() => {
            setOk("");
            void atualizar();
          }}
        >
          atualizar agora
        </button>
      </div>

      {ok && <p className="admin-ok">{ok}</p>}
      {erro && <p className="admin-erro">{erro}</p>}

      {carregando && <p className="admin-ajuda">Carregando os acessos...</p>}

      {!carregando && !erro && (
        <>
          <div className="acessos-cartoes">
            <div className="acessos-cartao">
              <span className="acessos-cartao-num">{dados.resumo.paginas}</span>
              <span className="acessos-cartao-rotulo">
                páginas vistas nos últimos {dias} dias
              </span>
            </div>

            <div className="acessos-cartao">
              <span className="acessos-cartao-num">{dados.resumo.visitas}</span>
              <span className="acessos-cartao-rotulo">
                visitas (abas diferentes) no período
              </span>
            </div>

            <div className="acessos-cartao">
              <span className="acessos-cartao-num">{dados.hoje}</span>
              <span className="acessos-cartao-rotulo">páginas vistas hoje</span>
            </div>

            <div className="acessos-cartao">
              <span className="acessos-cartao-num">{dados.resumo.mediaPorDia}</span>
              <span className="acessos-cartao-rotulo">
                média por dia com acesso ({dados.resumo.diasComAcesso} dia(s) com uso)
              </span>
            </div>

            <div className="acessos-cartao">
              <span className="acessos-cartao-num">{totalGeral}</span>
              <span className="acessos-cartao-rotulo">
                páginas vistas desde o começo do contador
              </span>
            </div>
          </div>

          {dados.resumo.paginas === 0 && (
            <p className="aviso-vazio">
              Nenhum acesso registrado neste período ainda. Os números aparecem a partir do
              momento em que esta versão do app estiver publicada e alguém abrir o app.
            </p>
          )}

          {dados.dias.length > 0 && (
            <>
              <h2>Uso por dia</h2>

              <div className="acessos-barras">
                {dados.dias.map((d) => {
                  const altura =
                    dados.maiorDia > 0 ? Math.round((d.paginas / dados.maiorDia) * 100) : 0;

                  return (
                    <div key={d.dia} className="acesso-barra" title={`${d.dia}: ${d.paginas} página(s) vista(s), ${d.visitas} visita(s)`}>
                      <span className="acesso-barra-num">{d.paginas || ""}</span>

                      <div className="acesso-barra-trilha">
                        <div
                          className="acesso-barra-preenchida"
                          style={{ height: `${Math.max(altura, d.paginas > 0 ? 4 : 0)}%` }}
                        />
                      </div>

                      <span className="acesso-barra-dia">{rotuloDiaCurto(d.dia)}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {dados.paginas.length > 0 && (
            <>
              <h2>Páginas mais vistas</h2>

        <div className="admin-tabela-rolagem">
          <table className="admin-table">
                <thead>
                  <tr>
                    <th>Página</th>
                    <th>Páginas vistas</th>
                    <th>Visitas</th>
                  </tr>
                </thead>

                <tbody>
                  {dados.paginas.map((p) => (
                    <tr key={p.rota}>
                      <td>
                        <b>{p.nome}</b>
                        <br />
                        <small>{p.rota}</small>
                      </td>
                      <td>{p.paginas}</td>
                      <td>{p.visitas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </>
          )}

          {dados.dispositivos.length > 0 && (
            <>
              <h2>Aparelhos usados</h2>

              <div className="acessos-dispositivos">
                {dados.dispositivos.map((d) => (
                  <div key={d.dispositivo} className="acessos-dispositivo">
                    <span className="acessos-dispositivo-nome">
                      {d.dispositivo} — {d.paginas} ({d.porcentagem}%)
                    </span>

                    <div className="acessos-dispositivo-trilha">
                      <div
                        className="acessos-dispositivo-preenchida"
                        style={{ width: `${d.porcentagem}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <h2>Guardar o histórico</h2>

          <p className="admin-ajuda">
            Os registros são leves (uma linha por página vista) e podem ficar guardados
            indefinidamente. Se um dia quiser enxugar, dá para apagar o histórico mais
            antigo sem perder os números do período que você escolher acima.
          </p>

          {confirmando === "antigos" ? (
            <div className="admin-confirmacao">
              <p>
                <b>Apagar os registros com mais de 1 ano?</b> Os números dos últimos 12
                meses continuam iguais — some só o histórico mais antigo.
              </p>

              <div className="admin-form-botoes">
                <button type="button" className="btn" onClick={executarApagarAntigos}>
                  sim, apagar
                </button>

                <button type="button" className="outline" onClick={() => setConfirmando("")}>
                  cancelar
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="outline" onClick={() => setConfirmando("antigos")}>
              apagar registros com mais de 1 ano
            </button>
          )}

          <p className="admin-ajuda">
            Lista carregada em {carregadoEm || "—"}. Use <b>atualizar agora</b> para ver o
            número mais recente.
          </p>

          <h2>Zerar as estatísticas</h2>

          <div className="admin-perigo">
            <p className="admin-ajuda">
              Use isto <b>antes de divulgar o app para o público</b>: enquanto você está
              testando e conferindo as edições, os seus próprios acessos entram na conta, e
              o número do dia do lançamento sairia misturado com eles. Ao zerar, todos os
              registros são apagados e a contagem recomeça do zero <b>a partir de agora</b> —
              o contador continua funcionando normalmente depois. Não tem como desfazer.
            </p>

            <div className="admin-fotos-estado">
              <b>Registros guardados agora:</b> {totalGeral}

              {confirmando === "zerar" ? (
                <span className="admin-confirmacao admin-confirmacao-inline">
                  <span>
                    <b>Zerar tudo agora?</b> {totalGeral} registro(s) serão apagados e não há
                    como desfazer.
                  </span>

                  <span className="admin-form-botoes">
                    <button type="button" className="btn" onClick={executarZerar}>
                      sim, zerar agora
                    </button>

                    <button type="button" className="outline" onClick={() => setConfirmando("")}>
                      cancelar
                    </button>
                  </span>
                </span>
              ) : (
                <button type="button" className="outline" onClick={() => setConfirmando("zerar")}>
                  zerar estatísticas
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
