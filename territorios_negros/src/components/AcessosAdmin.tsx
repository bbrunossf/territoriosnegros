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

  async function apagarAntigos() {
    const confirmado = window.confirm(
      "Apagar os registros de acesso com mais de 1 ano? Os números dos últimos 12 " +
        "meses continuam iguais — some só o histórico mais antigo."
    );

    if (!confirmado) return;

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
  async function zerar() {
    const confirmado = window.confirm(
      `Zerar as estatísticas? Isso apaga TODOS os ${totalGeral} registro(s) de acesso ` +
        `e a contagem recomeça do zero a partir de agora (não tem como desfazer). ` +
        `A contagem continua funcionando normalmente depois disso.`
    );

    if (!confirmado) return;

    setOk("");
    setErro("");

    try {
      const apagados = await zerarAcessos();
      await atualizar();
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

      <p className="admin-ajuda">
        Contagem <b>anônima</b> de uso do app: cada tela aberta pelos visitantes vira uma
        linha. Não guardamos IP, nome, e-mail nem cookie — só a tela, a hora, o tipo de
        aparelho (celular/tablet/computador) e um código aleatório da aba, que morre quando
        a aba é fechada. O uso do próprio painel não entra na conta.
      </p>

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

          <button type="button" className="outline" onClick={apagarAntigos}>
            apagar registros com mais de 1 ano
          </button>

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

              <button type="button" className="outline" onClick={zerar}>
                zerar estatísticas
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
