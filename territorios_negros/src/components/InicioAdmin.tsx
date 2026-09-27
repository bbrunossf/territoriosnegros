// InicioAdmin.tsx — aviso de próximo tour e ficha de inscrição (tela inicial)
import "../styles.css";

import { useEffect, useState } from "react";
import { normalizarProximoTour, salvarConfig } from "../data/api";
import { useTerritorios } from "../context/useTerritorios";
import { formatarDataHoraBR } from "../utils/data";

export default function InicioAdmin() {
  const { config, recarregar } = useTerritorios();

  const [ativo, setAtivo] = useState(false);
  const [texto, setTexto] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [local, setLocal] = useState("");
  const [info, setInfo] = useState("");
  const [inscricao, setInscricao] = useState("");
  const [inscricaoGeral, setInscricaoGeral] = useState("");

  const [ok, setOk] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    (async () => {
      // espera um tick para não disparar render em cascata dentro do efeito
      await Promise.resolve();

      const tour = normalizarProximoTour(config.proximo_tour);
      if (!ativo) return;

      setAtivo(tour?.ativo ?? false);
      setTexto(tour?.texto ?? "");
      setData(tour?.data ?? "");
      setHora(tour?.hora ?? "");
      setLocal(tour?.local ?? "");
      setInfo(tour?.info ?? "");
      setInscricao(tour?.inscricaoUrl ?? "");
      setInscricaoGeral(
        typeof config.inscricao_url === "string" ? config.inscricao_url : ""
      );
    })();

    return () => {
      ativo = false;
    };
  }, [config]);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setOk("");
    setErro("");

    try {
      await salvarConfig("proximo_tour", {
        ativo,
        texto,
        data,
        hora,
        local,
        info,
        inscricao_url: inscricao,
      });

      await salvarConfig("inscricao_url", inscricaoGeral);

      await recarregar();
      setOk(`Salvo em ${formatarDataHoraBR(new Date().toISOString())}.`);
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao salvar.");
    }
  }

  return (
    <div>
      <h1>Página inicial</h1>

      <p className="admin-ajuda">
        Na tela de abertura aparece a faixa <b>“Próximo evento disponível”</b> com o
        título do evento. Quem tocar no título vê a página do evento — com data, local,
        as informações abaixo e o botão da ficha de inscrição. Enquanto estiver
        desmarcado, nada aparece para os visitantes.
      </p>

      {ok && <p className="admin-ok">{ok}</p>}
      {erro && <p className="admin-erro">{erro}</p>}

      <form className="admin-form" onSubmit={salvar}>
        <h2>Próximo tour</h2>

        <label className="admin-check">
          <input
            type="checkbox"
            checked={ativo}
            onChange={(e) => setAtivo(e.target.checked)}
          />
          Mostrar o aviso de próximo tour na tela inicial
        </label>

        <input
          type="text"
          placeholder="Título do evento (ex: CAMINHOS DA MEMÓRIA, IDENTIDADE E INCLUSÃO)"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />

        <div className="admin-form-grid">
          <label className="admin-campo">
            Data
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </label>

          <label className="admin-campo">
            Horário
            <input
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
            />
          </label>
        </div>

        <input
          type="text"
          placeholder="Local do evento (ex: Centro de Vitória - ES)"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
        />

        <textarea
          placeholder={
            "Informações sobre o tour (uma linha por parágrafo)\n" +
            "ex: Ponto de encontro, duração, o que levar, acessibilidade..."
          }
          value={info}
          onChange={(e) => setInfo(e.target.value)}
          rows={7}
        />

        <input
          type="text"
          placeholder="Link da ficha de inscrição / página do evento (Google Docs)"
          value={inscricao}
          onChange={(e) => setInscricao(e.target.value)}
        />

        <small className="admin-ajuda">
          Este link é o botão “Abrir a ficha de inscrição” na página do evento. Pode ser
          a página do Google Docs com as informações ou direto o formulário — ele abre
          em outra guia.
        </small>

        <h2>Ficha de inscrição geral</h2>

        <p className="admin-ajuda">
          Este link é usado quando a rota não tem um link próprio: aparece no aviso da
          tela inicial, na lista de rotas e na tela de cada rota.
        </p>

        <input
          type="text"
          placeholder="Link da ficha de inscrição (geral)"
          value={inscricaoGeral}
          onChange={(e) => setInscricaoGeral(e.target.value)}
        />

        <div className="admin-form-botoes">
          <button type="submit" className="btn">
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}
