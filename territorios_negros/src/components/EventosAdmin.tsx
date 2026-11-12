// EventosAdmin.tsx — a agenda dos próximos eventos, em tela própria.
//
// 15/10/2026, pedido da autoria: "é melhor separar e ter uma página exclusiva
// para a edição de próximos eventos disponíveis". A agenda saiu de
// InicioAdmin (onde ficava embaixo dos textos da capa) e ganhou esta tela,
// aberta pela guia **Próximos eventos**, dentro de Páginas.
//
// Regra de gravação (a mesma de antes):
//  • o formulário do tour tem botão próprio: salvar um tour não mexe em nenhum
//    outro cadastro nem nos textos da tela inicial;
//  • ligar/desligar e excluir gravam na hora;
//  • `proximo_tour` continua sendo gravado junto, para o app antigo não quebrar.
import "../styles.css";

import { useEffect, useState } from "react";
import { salvarConfig, uploadFoto } from "../data/api";
import {
  CHAVE_TOURS,
  lerTours,
  proximoTourDe,
  tourVencido,
  type Tour,
} from "../data/tours";
import { useTerritorios } from "../context/useTerritorios";
import { formatarDataBR, formatarDataHoraBR } from "../utils/data";

/** campos do tour em edição (sem o id) */
const TOUR_VAZIO = {
  ativo: true,
  texto: "",
  data: "",
  hora: "",
  local: "",
  info: "",
  rotaId: "",
  logo: "",
  inscricaoUrl: "",
  inscricoes: "" as "" | "sem" | "abertas" | "encerradas",
};

export default function EventosAdmin() {
  const { config, roteiros, recarregar } = useTerritorios();

  const [tours, setTours] = useState<Tour[]>([]);
  /** null = formulário de um tour novo; string = editando este id */
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [tour, setTour] = useState(TOUR_VAZIO);
  const [confirmandoExcluir, setConfirmandoExcluir] = useState<string | null>(null);
  const [salvandoTour, setSalvandoTour] = useState(false);

  const [ok, setOk] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    (async () => {
      // espera um tick para não disparar render em cascata dentro do efeito
      await Promise.resolve();

      const lista = lerTours(config[CHAVE_TOURS], config.proximo_tour);
      if (!ativo) return;

      setTours(lista);
    })();

    return () => {
      ativo = false;
    };
  }, [config]);

  function setCampo(campo: keyof typeof TOUR_VAZIO, valor: string | boolean) {
    setTour((prev) => ({ ...prev, [campo]: valor }));
  }

  function limparTour() {
    setTour(TOUR_VAZIO);
    setEditandoId(null);
  }

  /** Grava a agenda inteira e mantém `proximo_tour` em dia (retrocompatível). */
  async function gravarAgenda(lista: Tour[]) {
    await salvarConfig(CHAVE_TOURS, { lista });
    await salvarConfig("proximo_tour", proximoTourDe(lista) ?? {});
    setTours(lista);
  }

  async function enviarLogo(file: File | null) {
    if (!file) return;

    setOk("");
    setErro("");

    try {
      const url = await uploadFoto("evento", file, "eventos");
      setCampo("logo", url);
      setOk('Logo enviada. Clique em "Salvar este tour" para publicar.');
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao enviar a logo.");
    }
  }

  async function salvarTour(e: React.FormEvent) {
    e.preventDefault();
    setOk("");
    setErro("");
    setSalvandoTour(true);

    try {
      const id = editandoId ?? `tour-${Date.now().toString(36)}`;

      const novo: Tour = { ...tour, id };

      const lista = editandoId
        ? tours.map((t) => (t.id === editandoId ? novo : t))
        : [...tours, novo];

      await gravarAgenda(lista);
      await recarregar();

      setEditandoId(id);
      setOk(
        editandoId
          ? `Tour salvo em ${formatarDataHoraBR(new Date().toISOString())}.`
          : `Tour adicionado à agenda em ${formatarDataHoraBR(new Date().toISOString())}.`
      );
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao salvar o tour.");
    } finally {
      setSalvandoTour(false);
    }
  }

  async function alternarTour(id: string) {
    setOk("");
    setErro("");

    try {
      const lista = tours.map((t) => (t.id === id ? { ...t, ativo: !t.ativo } : t));
      await gravarAgenda(lista);
      await recarregar();
      setOk("Agenda atualizada (gravado).");
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao alterar o tour.");
    }
  }

  async function excluirTour(id: string) {
    setOk("");
    setErro("");
    setConfirmandoExcluir(null);

    try {
      const lista = tours.filter((t) => t.id !== id);
      await gravarAgenda(lista);
      await recarregar();

      if (editandoId === id) limparTour();
      setOk("Tour excluído da agenda.");
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao excluir o tour.");
    }
  }

  return (
    <div>
      <h1>Próximos eventos</h1>

      <p className="admin-ajuda">
        Aqui ficam os eventos que aparecem no app. A tela inicial mostra o{" "}
        <b>evento mais próximo</b> de hoje; quem tocar no título abre a página do
        evento, com data, local, informações e a ficha de inscrição — e as outras
        datas ficam listadas no fim dessa página. Depois da data, o evento sai do ar
        sozinho (o cadastro continua aqui).
      </p>

      <p className="admin-ajuda">
        Para <b>tirar o cartão do evento da tela inicial</b> sem apagar nada, use a
        opção <b>“Exibir o próximo evento na tela inicial”</b>, na guia Página
        Inicial.
      </p>

      {ok && <p className="admin-ok">{ok}</p>}
      {erro && <p className="admin-erro">{erro}</p>}

      {/* ─── formulário do tour ─── */}
      <form className="admin-form" onSubmit={salvarTour}>
        <h2>{editandoId ? "Editar evento" : "Novo evento"}</h2>

        <p className="admin-ajuda">
          Cada evento tem data, local, informações e o seu próprio link de inscrição.
          Pode haver <b>quantos eventos quiser</b> na agenda.
        </p>

        <label className="admin-check">
          <input
            type="checkbox"
            checked={tour.ativo}
            onChange={(e) => setCampo("ativo", e.target.checked)}
          />
          <span className="admin-check-texto">
            <b>Este evento está confirmado (aparece no app)</b>
            <span className="admin-campo-dica">
              Desmarcado, ele fica só na agenda do painel — nada é apagado.
            </span>
          </span>
        </label>

        <label className="admin-campo">
          <b>Título do evento</b>
          <span className="admin-campo-dica">
            É o título da faixa na tela inicial e o título da página do evento.
          </span>
          <input
            type="text"
            placeholder="Ex: CAMINHOS DA MEMÓRIA, IDENTIDADE E INCLUSÃO"
            value={tour.texto}
            onChange={(e) => setCampo("texto", e.target.value)}
          />
        </label>

        <div className="admin-form-grid">
          <label className="admin-campo">
            <b>Data do evento</b>
            <span className="admin-campo-dica">
              Aparece no aviso da tela inicial e na página do evento. Depois desta
              data, o evento sai do ar.
            </span>
            <input
              type="date"
              value={tour.data}
              onChange={(e) => setCampo("data", e.target.value)}
            />
          </label>

          <label className="admin-campo">
            <b>Horário</b>
            <span className="admin-campo-dica">
              Aparece ao lado da data, no aviso e na página do evento.
            </span>
            <input
              type="time"
              value={tour.hora}
              onChange={(e) => setCampo("hora", e.target.value)}
            />
          </label>
        </div>

        <div className="admin-fotos">
          <b>Logo do evento</b>

          <p className="admin-ajuda">
            Envie aqui a imagem da logo <b>deste evento</b> — ela aparece no topo da
            página do evento. Publica ao clicar em <b>Salvar este evento</b>. Sem logo
            própria, o app usa a logo da rota escolhida no fim deste formulário.
          </p>

          {tour.logo && (
            <div className="admin-logo-preview">
              <img src={tour.logo} alt="" />
              <button
                type="button"
                className="outline"
                onClick={() => {
                  setCampo("logo", "");
                  setOk('Logo marcada para remoção. Clique em "Salvar este evento".');
                }}
              >
                Remover logo
              </button>
            </div>
          )}

          <div className="admin-form-upload">
            <label>
              {tour.logo ? "Trocar a logo do evento:" : "Enviar a logo do evento:"}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                enviarLogo(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
            />
          </div>
        </div>

        <label className="admin-campo">
          <b>Local do evento</b>
          <span className="admin-campo-dica">
            Linha em letra menor embaixo do título, no aviso da tela inicial e na
            página do evento.
          </span>
          <input
            type="text"
            placeholder="Ex: Centro de Vitória - ES"
            value={tour.local}
            onChange={(e) => setCampo("local", e.target.value)}
          />
        </label>

        <label className="admin-campo">
          <b>Informações sobre o evento</b>
          <span className="admin-campo-dica">
            Texto da página do evento. Uma linha por parágrafo — ponto de encontro,
            duração, o que levar, acessibilidade.
          </span>
          <textarea
            placeholder={
              "Ex:\nPonto de encontro: escadaria da Catedral\nDuração: 2 horas\nLevar água e protetor solar"
            }
            value={tour.info}
            onChange={(e) => setCampo("info", e.target.value)}
            rows={7}
          />
        </label>

        <label className="admin-campo">
          <b>Link da ficha de inscrição deste evento</b>
          <span className="admin-campo-dica">
            Vira o botão “Abrir a ficha de inscrição” na página do evento. Pode ser a
            página do Google Docs com as informações ou direto o formulário — ele abre
            dentro do app, na página da ficha, com o caminho de volta logo abaixo.
            No Google Forms, deixe a resposta liberada para “qualquer pessoa com o
            link”; se o formulário exigir login, a ficha aparece pedindo conta Google.
            Vazio, o botão continua na página, apagado, avisando que ainda não está
            disponível.
          </span>
          <input
            type="text"
            placeholder="Ex: https://forms.gle/..."
            value={tour.inscricaoUrl}
            onChange={(e) => setCampo("inscricaoUrl", e.target.value)}
          />
        </label>

        <label className="admin-campo">
          <b>Inscrições deste evento</b>
          <span className="admin-campo-dica">
            Cada evento decide o que mostrar sobre inscrição. <b>Sem inscrição</b>{" "}
            não exibe botão nem aviso — bom para um evento de teste ou para uma data
            que não tem ficha. <b>Usar a regra do painel</b> vale para o próximo
            evento da agenda e para quem tem link próprio.
          </span>
          <select
            value={tour.inscricoes}
            onChange={(e) =>
              setCampo("inscricoes", e.target.value as "" | "sem" | "abertas" | "encerradas")
            }
          >
            <option value="">Usar a regra do painel (padrão)</option>
            <option value="sem">Sem inscrição neste evento — não mostrar nada</option>
            <option value="abertas">Inscrições abertas</option>
            <option value="encerradas">Inscrições encerradas (mostrar o aviso)</option>
          </select>
        </label>

        <label className="admin-campo">
          <b>Rota do evento (opcional)</b>
          <span className="admin-campo-dica">
            Serve para o link “ver a rota completa” na página do evento e, se você não
            enviou uma logo própria acima, é a logo usada nesta página.
          </span>
          <select value={tour.rotaId} onChange={(e) => setCampo("rotaId", e.target.value)}>
            <option value="">— nenhuma —</option>
            {roteiros.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nome}
              </option>
            ))}
          </select>
        </label>

        <div className="admin-form-botoes">
          <button type="submit" className="btn" disabled={salvandoTour}>
            {salvandoTour
              ? "Salvando…"
              : editandoId
                ? "Salvar este evento"
                : "Adicionar evento à agenda"}
          </button>

          {editandoId && (
            <button type="button" className="outline" onClick={limparTour}>
              Fechar / novo evento
            </button>
          )}
        </div>
      </form>

      {/* ─── agenda ─── */}
      <h2>Agenda</h2>

      <p className="admin-ajuda">
        O app mostra o <b>próximo evento confirmado</b> (a data mais próxima de
        hoje). Eventos com data passada saem do ar automaticamente; para tirar um
        evento do ar antes da data, use <b>desligar</b> — o cadastro continua aqui.
      </p>

      <div className="admin-tabela-rolagem">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Evento</th>
              <th>Data</th>
              <th>Situação</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {[...tours]
              .sort((a, b) => (a.data || "9999").localeCompare(b.data || "9999"))
              .map((t) => (
                <tr key={t.id} className={t.ativo ? "" : "admin-linha-inativa"}>
                  <td>
                    <b>{t.texto || "(sem título)"}</b>
                    <br />
                    <small>{t.id}</small>
                  </td>
                  <td>
                    {t.data ? formatarDataBR(t.data) : "sem data"}
                    {t.hora ? ` · ${t.hora}` : ""}
                  </td>
                  <td>
                    {!t.ativo
                      ? "desligado"
                      : tourVencido(t)
                        ? "data passada (fora do ar)"
                        : "no app"}
                  </td>
                  <td className="admin-acoes">
                    <button
                      className="outline"
                      onClick={() => {
                        setEditandoId(t.id);
                        setTour({
                          ativo: t.ativo,
                          texto: t.texto,
                          data: t.data,
                          hora: t.hora,
                          local: t.local,
                          info: t.info,
                          rotaId: t.rotaId,
                          logo: t.logo,
                          inscricaoUrl: t.inscricaoUrl,
                          inscricoes: t.inscricoes ?? "",
                        });
                        setConfirmandoExcluir(null);
                        setOk("");
                        setErro("");
                      }}
                      title="Editar"
                    >
                      ✏️ editar
                    </button>

                    <button
                      className={t.ativo ? "outline" : "btn"}
                      onClick={() => alternarTour(t.id)}
                      title={t.ativo ? "Tirar do app" : "Colocar no app"}
                    >
                      {t.ativo ? "desligar" : "ligar"}
                    </button>

                    <button
                      className="outline"
                      onClick={() => setConfirmandoExcluir(t.id)}
                      title="Excluir"
                    >
                      🗑️ excluir
                    </button>
                  </td>
                </tr>
              ))}

            {tours.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: 24 }}>
                  Nenhum evento na agenda. Preencha o formulário acima e clique em
                  “Adicionar evento à agenda”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* confirmação na própria tela: window.confirm é bloqueado no navegador */}
      {confirmandoExcluir && (
        <div className="admin-confirmacao">
          <p>
            <b>Excluir este evento da agenda?</b> Esta ação não pode ser desfeita. Se a
            intenção é só tirá-lo do app por enquanto, use <b>desligar</b>.
          </p>

          <div className="admin-form-botoes">
            <button type="button" className="btn" onClick={() => excluirTour(confirmandoExcluir)}>
              Excluir mesmo assim
            </button>

            <button
              type="button"
              className="outline"
              onClick={() => setConfirmandoExcluir(null)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
