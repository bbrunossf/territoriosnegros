// InicioAdmin.tsx — agenda de tours, inscrições e textos da tela inicial
//
// 15/10/2026: a agenda passou a aceitar MAIS DE UM tour. Antes havia um único
// `proximo_tour`, editado no meio dos textos da página inicial — a autoria não
// conseguia cadastrar duas datas com inscrição aberta.
//
// Regra de gravação:
//  • a AGENDA (lista de tours) tem formulário próprio e botão próprio: salvar
//    um tour não mexe nos textos da tela inicial;
//  • ligar/desligar um tour e excluir gravam na hora;
//  • os demais campos (capa, textos, inscrições, rótulos da ficha) vão pelo
//    "Salvar" do fim da página, como antes.
import "../styles.css";

import { useEffect, useState } from "react";
import { salvarConfig, uploadFoto } from "../data/api";
import {
  CHAVE_INSCRICOES,
  CHAVE_TOURS,
  INSCRICOES_PADRAO,
  lerTours,
  normalizarInscricoes,
  proximoTourDe,
  tourVencido,
  type Tour,
} from "../data/tours";
import { textosDaFicha } from "../utils/ficha";
import { useTerritorios } from "../context/useTerritorios";
import { formatarDataBR, formatarDataHoraBR } from "../utils/data";
import CAPA_ORIGINAL from "../assets/capa-inicial.jpg";
import { TELA_INICIAL_PADRAO, normalizarCapa } from "../data/telaInicial";

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
};

export default function InicioAdmin() {
  const { config, roteiros, recarregar } = useTerritorios();

  // ── agenda ────────────────────────────────────────────────
  const [tours, setTours] = useState<Tour[]>([]);
  /** null = formulário de um tour novo; string = editando este id */
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [tour, setTour] = useState(TOUR_VAZIO);
  const [confirmandoExcluir, setConfirmandoExcluir] = useState<string | null>(null);
  const [salvandoTour, setSalvandoTour] = useState(false);

  // ── inscrições ────────────────────────────────────────────
  const [inscricoesAbertasBtn, setInscricoesAbertasBtn] = useState(true);
  const [botaoNaFicha, setBotaoNaFicha] = useState(true);
  const [inscricoesEncerradas, setInscricoesEncerradas] = useState(false);
  const [avisoEncerradas, setAvisoEncerradas] = useState("");

  const [inscricaoGeral, setInscricaoGeral] = useState("");

  // rótulos da tela da ficha de inscrição (/evento/ficha), editáveis aqui
  const [fichaTitulo, setFichaTitulo] = useState("");
  const [fichaVoltarEvento, setFichaVoltarEvento] = useState("");
  const [fichaVoltarInicio, setFichaVoltarInicio] = useState("");

  // imagem de fundo e textos fixos da tela inicial
  const [capaUrl, setCapaUrl] = useState("");
  const [capaCredito, setCapaCredito] = useState("");
  const [selo, setSelo] = useState("");
  const [botaoInscricao, setBotaoInscricao] = useState("");
  const [botaoInicio, setBotaoInicio] = useState("");
  const [autoria, setAutoria] = useState("");

  const [enviandoCapa, setEnviandoCapa] = useState(false);

  const [ok, setOk] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    (async () => {
      // espera um tick para não disparar render em cascata dentro do efeito
      await Promise.resolve();

      const lista = lerTours(config[CHAVE_TOURS], config.proximo_tour);
      const regras = normalizarInscricoes(config[CHAVE_INSCRICOES]);
      if (!ativo) return;

      setTours(lista);
      setInscricoesAbertasBtn(regras.cartao);
      setBotaoNaFicha(regras.ficha);
      setInscricoesEncerradas(regras.encerradas);
      setAvisoEncerradas(regras.aviso);
      setInscricaoGeral(
        typeof config.inscricao_url === "string" ? config.inscricao_url : ""
      );

      const capa = normalizarCapa(config.capa_inicial);
      setCapaUrl(capa.url);
      setCapaCredito(capa.credito);

      // nos textos, campo vazio = usa o texto original do app (o original
      // aparece como dica cinza dentro do campo)
      const textos = (
        config.tela_inicial && typeof config.tela_inicial === "object"
          ? config.tela_inicial
          : {}
      ) as Record<string, unknown>;
      const txt = (valor: unknown) => (typeof valor === "string" ? valor : "");

      setSelo(txt(textos.selo));
      setBotaoInscricao(txt(textos.botao_inscricao));
      setBotaoInicio(txt(textos.botao_inicio));
      setAutoria(txt(textos.autoria));

      // rótulos da tela da ficha (app_config, chave "ficha_textos")
      const ficha = textosDaFicha(config.ficha_textos);
      setFichaTitulo(ficha.titulo);
      setFichaVoltarEvento(ficha.voltarEvento);
      setFichaVoltarInicio(ficha.voltarInicio);
    })();

    return () => {
      ativo = false;
    };
  }, [config]);

  // ── agenda: helpers ───────────────────────────────────────

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

  // ── página: gravação geral ────────────────────────────────

  async function enviarCapa(file: File | null) {
    if (!file) return;

    setOk("");
    setErro("");
    setEnviandoCapa(true);

    try {
      const url = await uploadFoto("capa-inicial", file, "capa");
      setCapaUrl(url);
      setOk('Imagem de fundo enviada. Clique em "Salvar" para publicar no app.');
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao enviar a imagem de fundo.");
    } finally {
      setEnviandoCapa(false);
    }
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setOk("");
    setErro("");

    try {
      await salvarConfig(CHAVE_INSCRICOES, {
        cartao: inscricoesAbertasBtn,
        ficha: botaoNaFicha,
        encerradas: inscricoesEncerradas,
        aviso: avisoEncerradas || INSCRICOES_PADRAO.aviso,
      });

      await salvarConfig("inscricao_url", inscricaoGeral);

      await salvarConfig("capa_inicial", {
        url: capaUrl,
        credito: capaCredito,
      });

      await salvarConfig("tela_inicial", {
        selo,
        botao_inscricao: botaoInscricao,
        botao_inicio: botaoInicio,
        autoria,
      });

      // rótulos da tela da ficha; campo em branco volta ao padrão ao ler
      await salvarConfig("ficha_textos", {
        titulo: fichaTitulo,
        voltarEvento: fichaVoltarEvento,
        voltarInicio: fichaVoltarInicio,
      });

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
        tour mais próximo da agenda. Quem tocar no título vê a página do tour — com
        data, local, as informações e o botão da ficha de inscrição. Você pode ter{" "}
        <b>quantos tours quiser</b> na agenda; o app mostra sempre o próximo, e as
        outras datas aparecem listadas no fim da página do evento.
      </p>

      {ok && <p className="admin-ok">{ok}</p>}
      {erro && <p className="admin-erro">{erro}</p>}

      {/* ─── Agenda de tours ─── */}
      <form className="admin-form" onSubmit={salvarTour}>
        <h2>{editandoId ? "Editar tour" : "Novo tour"}</h2>

        <p className="admin-ajuda">
          Cada tour da agenda tem data, local, informações e o seu próprio link de
          inscrição. O app mostra o <b>próximo</b>; depois da data, o tour sai do ar
          sozinho (o cadastro fica guardado aqui).
        </p>

        <label className="admin-check">
          <input
            type="checkbox"
            checked={tour.ativo}
            onChange={(e) => setCampo("ativo", e.target.checked)}
          />
          <span className="admin-check-texto">
            <b>Este tour está confirmado (aparece no app)</b>
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
              data, o tour sai do ar.
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
            Envie aqui a imagem da logo <b>deste tour</b> — ela aparece no topo da
            página do evento, no mesmo tamanho reduzido da tela de Rotas. Publica ao
            clicar em <b>Salvar este tour</b>. Sem logo própria, o app usa a logo da
            rota escolhida no fim deste formulário.
          </p>

          {tour.logo && (
            <div className="admin-logo-preview">
              <img src={tour.logo} alt="" />
              <button
                type="button"
                className="outline"
                onClick={() => {
                  setCampo("logo", "");
                  setOk('Logo marcada para remoção. Clique em "Salvar este tour".');
                }}
              >
                Remover logo
              </button>
            </div>
          )}

          <div className="admin-form-upload">
            <label>{tour.logo ? "Trocar a logo do evento:" : "Enviar a logo do evento:"}</label>
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
            Linha em letra menor embaixo do título, no aviso da tela inicial e na página
            do evento.
          </span>
          <input
            type="text"
            placeholder="Ex: Centro de Vitória - ES"
            value={tour.local}
            onChange={(e) => setCampo("local", e.target.value)}
          />
        </label>

        <label className="admin-campo">
          <b>Informações sobre o tour</b>
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
                ? "Salvar este tour"
                : "Adicionar tour à agenda"}
          </button>

          {editandoId && (
            <button type="button" className="outline" onClick={limparTour}>
              Fechar / novo tour
            </button>
          )}
        </div>
      </form>

      <h2>Agenda</h2>

      <p className="admin-ajuda">
        O app mostra o <b>próximo tour confirmado</b> (a data mais próxima de hoje).
        Tours com data passada saem do ar automaticamente; para tirar um tour do ar
        antes da data, use <b>desligar</b> — o cadastro continua aqui.
      </p>

      <div className="admin-tabela-rolagem">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tour</th>
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
                  Nenhum tour na agenda. Preencha o formulário acima e clique em
                  “Adicionar tour à agenda”.
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
            <b>Excluir este tour da agenda?</b> Esta ação não pode ser desfeita. Se a
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

      {/* ─── Inscrições ─── */}
      <form className="admin-form" onSubmit={salvar}>
        <h2>Inscrições</h2>

        <p className="admin-ajuda">
          Aqui você decide onde o convite de inscrição aparece e se ele ainda vale.
          Encerrar as inscrições <b>não apaga</b> nenhum link: o botão sai do ar e o
          aviso entra no lugar, na tela inicial e na página do evento.
        </p>

        <label className="admin-check">
          <input
            type="checkbox"
            checked={inscricoesAbertasBtn}
            onChange={(e) => setInscricoesAbertasBtn(e.target.checked)}
          />
          <span className="admin-check-texto">
            <b>Mostrar o botão de inscrição no cartão do evento (tela inicial)</b>
            <span className="admin-campo-dica">
              É o “{botaoInscricao || TELA_INICIAL_PADRAO.botaoInscricao}” logo abaixo da
              data. Desmarcado, o cartão fica só com o título, a data e o local.
            </span>
          </span>
        </label>

        <label className="admin-check">
          <input
            type="checkbox"
            checked={botaoNaFicha}
            onChange={(e) => setBotaoNaFicha(e.target.checked)}
          />
          <span className="admin-check-texto">
            <b>Mostrar o botão “Abrir a ficha de inscrição” na página do evento</b>
            <span className="admin-campo-dica">
              Desmarcado, o botão e a linha de ajuda abaixo dele saem da página do
              evento.
            </span>
          </span>
        </label>

        <label className="admin-check">
          <input
            type="checkbox"
            checked={inscricoesEncerradas}
            onChange={(e) => setInscricoesEncerradas(e.target.checked)}
          />
          <span className="admin-check-texto">
            <b>As inscrições estão encerradas</b>
            <span className="admin-campo-dica">
              Os botões de inscrição saem do ar (os dois acima) e o aviso abaixo
              aparece no lugar, na tela inicial e na página do evento.
            </span>
          </span>
        </label>

        <label className="admin-campo">
          <b>Aviso de inscrições encerradas</b>
          <span className="admin-campo-dica">
            Texto que entra no lugar dos botões. Em branco, usa “{INSCRICOES_PADRAO.aviso}”.
          </span>
          <input
            type="text"
            placeholder={INSCRICOES_PADRAO.aviso}
            value={avisoEncerradas}
            onChange={(e) => setAvisoEncerradas(e.target.value)}
          />
        </label>

        <label className="admin-campo">
          <b>Link da ficha de inscrição (geral)</b>
          <span className="admin-campo-dica">
            Usado quando o tour não tem um link próprio. O link de cada tour fica no
            formulário da agenda, acima.
          </span>
          <input
            type="text"
            placeholder="Ex: https://forms.gle/..."
            value={inscricaoGeral}
            onChange={(e) => setInscricaoGeral(e.target.value)}
          />
        </label>

        <h3 className="admin-form-secao">Tela da ficha de inscrição</h3>

        <p className="admin-ajuda">
          O que aparece na tela que abre a ficha dentro do app. Deixe em branco
          para voltar ao texto padrão — nenhum botão de volta fica sem dizer para
          onde leva.
        </p>

        <div className="admin-form-grid">
          <label className="admin-campo">
            <b>Título da tela</b>
            <span className="admin-campo-dica">Aparece no topo, acima do formulário.</span>
            <input
              type="text"
              placeholder="Ex: Ficha de inscrição"
              value={fichaTitulo}
              onChange={(e) => setFichaTitulo(e.target.value)}
            />
          </label>

          <label className="admin-campo">
            <b>Botão “voltar para o evento”</b>
            <span className="admin-campo-dica">Primeiro botão abaixo do formulário.</span>
            <input
              type="text"
              placeholder="Ex: Voltar para as informações do evento"
              value={fichaVoltarEvento}
              onChange={(e) => setFichaVoltarEvento(e.target.value)}
            />
          </label>

          <label className="admin-campo">
            <b>Botão “voltar para o início”</b>
            <span className="admin-campo-dica">Segundo botão abaixo do formulário.</span>
            <input
              type="text"
              placeholder="Ex: Voltar para a tela inicial"
              value={fichaVoltarInicio}
              onChange={(e) => setFichaVoltarInicio(e.target.value)}
            />
          </label>
        </div>

        <h2>Imagem de fundo e textos da tela inicial</h2>

        <p className="admin-ajuda">
          A tela inicial do app tem uma imagem de fundo (a capa) e alguns textos fixos.
          Os campos abaixo já mostram, em cinza, o que está no ar hoje: escreva por cima
          para trocar e deixe <b>vazio</b> para voltar ao texto original. Tudo publica ao
          clicar em <b>Salvar</b>.
        </p>

        <div className="admin-fotos">
          <b>Imagem de fundo (capa)</b>

          <p className="admin-ajuda">
            Envie uma imagem para substituir a arte atual — no celular prefira uma imagem
            deitada, com boa resolução. O botão <b>voltar à arte original</b> desfaz a
            troca (a arte do app fica guardada).
          </p>

          <div className="admin-logo-preview">
            <img className="admin-capa-preview" src={capaUrl || CAPA_ORIGINAL} alt="" />

            <div className="admin-capa-estado">
              <span className="admin-galeria-apoio">
                {capaUrl ? "imagem enviada por você" : "arte original do app"}
              </span>

              {capaUrl && (
                <button
                  type="button"
                  className="outline"
                  onClick={() => {
                    setCapaUrl("");
                    setOk('A arte original será usada. Clique em "Salvar" para publicar.');
                  }}
                >
                  voltar à arte original
                </button>
              )}
            </div>
          </div>

          <div className="admin-form-upload">
            <label>{capaUrl ? "Trocar a imagem de fundo:" : "Enviar a imagem de fundo:"}</label>

            <input
              type="file"
              accept="image/*"
              disabled={enviandoCapa}
              onChange={(e) => {
                enviarCapa(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
            />

            {enviandoCapa && <p className="admin-ajuda">Enviando a imagem, aguarde...</p>}
          </div>

          <label className="admin-campo">
            <b>Crédito da imagem de fundo</b>
            <span className="admin-campo-dica">
              Aparece em letra pequena sobre a capa, na tela inicial. Vale para a arte
              original e para uma imagem enviada por você.
            </span>
            <input
              type="text"
              placeholder="Ex: Foto: Maria Souza · Acervo pessoal"
              value={capaCredito}
              onChange={(e) => setCapaCredito(e.target.value)}
            />
          </label>
        </div>

        <label className="admin-campo">
          <b>Faixa do próximo evento</b>
          <span className="admin-campo-dica">
            Selo no topo da faixa do evento. Aparece na tela inicial e na página do evento
            — é o mesmo texto nos dois lugares.
          </span>
          <input
            type="text"
            placeholder={TELA_INICIAL_PADRAO.selo}
            value={selo}
            onChange={(e) => setSelo(e.target.value)}
          />
        </label>

        <label className="admin-campo">
          <b>Botão de inscrição, dentro do cartão do evento</b>
          <span className="admin-campo-dica">
            Texto do botão que abre a página do evento, no aviso do evento na tela
            inicial. A ficha de inscrição abre na própria página do evento.
          </span>
          <input
            type="text"
            placeholder={TELA_INICIAL_PADRAO.botaoInscricao}
            value={botaoInscricao}
            onChange={(e) => setBotaoInscricao(e.target.value)}
          />
        </label>

        <label className="admin-campo">
          <b>Botão principal da tela inicial</b>
          <span className="admin-campo-dica">
            Texto do botão que abre a leitura da cidade — é o primeiro toque de quem chega
            no app.
          </span>
          <textarea
            rows={2}
            placeholder={TELA_INICIAL_PADRAO.botaoInicio}
            value={botaoInicio}
            onChange={(e) => setBotaoInicio(e.target.value)}
          />
        </label>

        <label className="admin-campo">
          <b>Linha de autoria</b>
          <span className="admin-campo-dica">
            Linha pequena no rodapé da tela inicial (autoria do projeto).
          </span>
          <input
            type="text"
            placeholder={TELA_INICIAL_PADRAO.autoria}
            value={autoria}
            onChange={(e) => setAutoria(e.target.value)}
          />
        </label>

        <div className="admin-form-botoes">
          <button type="submit" className="btn">
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}
