// InicioAdmin.tsx — textos da tela inicial, capa e regras de inscrição.
//
// 15/10/2026: a AGENDA saiu daqui e ganhou tela própria (EventosAdmin, guia
// “Próximos eventos”). A autoria pediu a separação: editar as datas no meio
// dos textos da capa deixava a tela confusa.
//
// O que ficou: a capa, os textos da tela inicial, os rótulos da ficha e as
// regras de inscrição — inclusive a opção de EXIBIR ou ESCONDER o cartão do
// próximo evento na tela inicial (`inscricoes.mostrar`).
//
// Regra de gravação: tudo vai pelo “Salvar” do fim da página.
import "../styles.css";

import { useEffect, useState } from "react";
import { salvarConfig, uploadFoto } from "../data/api";
import {
  CHAVE_INSCRICOES,
  INSCRICOES_PADRAO,
  normalizarInscricoes,
} from "../data/tours";
import { textosDaFicha } from "../utils/ficha";
import { useTerritorios } from "../context/useTerritorios";
import { formatarDataHoraBR } from "../utils/data";
import CAPA_ORIGINAL from "../assets/capa-inicial.jpg";
import { TELA_INICIAL_PADRAO, normalizarCapa } from "../data/telaInicial";

export default function InicioAdmin() {
  const { config, recarregar } = useTerritorios();

  // ── inscrições ────────────────────────────────────────────
  const [mostrarEventos, setMostrarEventos] = useState(true);
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

      const regras = normalizarInscricoes(config[CHAVE_INSCRICOES]);
      if (!ativo) return;

      setMostrarEventos(regras.mostrar);
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
        mostrar: mostrarEventos,
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
        Aqui ficam a imagem de fundo, os textos da abertura e as regras de inscrição.
        As <b>datas dos eventos</b> agora têm tela própria: guia{" "}
        <b>Próximos eventos</b>, aqui em Páginas. Nesta tela você só decide se o
        cartão do próximo evento aparece na abertura (opção em Inscrições).
      </p>

      {ok && <p className="admin-ok">{ok}</p>}
      {erro && <p className="admin-erro">{erro}</p>}

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
            checked={mostrarEventos}
            onChange={(e) => setMostrarEventos(e.target.checked)}
          />
          <span className="admin-check-texto">
            <b>Exibir o próximo evento na tela inicial</b>
            <span className="admin-campo-dica">
              Desmarcado, o cartão do evento sai da abertura e a tela inicial fica só
              com a arte e o botão de entrada. As datas continuam guardadas em
              Próximos eventos — nada é apagado.
            </span>
          </span>
        </label>

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
