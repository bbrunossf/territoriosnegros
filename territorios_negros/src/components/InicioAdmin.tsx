// InicioAdmin.tsx — aviso de próximo tour e ficha de inscrição (tela inicial)
import "../styles.css";

import { useEffect, useState } from "react";
import { normalizarProximoTour, salvarConfig, uploadFoto } from "../data/api";
import { useTerritorios } from "../context/useTerritorios";
import { formatarDataHoraBR } from "../utils/data";
import CAPA_ORIGINAL from "../assets/capa-inicial.jpg";
import {
  TELA_INICIAL_PADRAO,
  normalizarCapa,
} from "../data/telaInicial";

export default function InicioAdmin() {
  const { config, roteiros, recarregar } = useTerritorios();

  const [ativo, setAtivo] = useState(false);
  const [texto, setTexto] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [local, setLocal] = useState("");
  const [info, setInfo] = useState("");
  const [rotaId, setRotaId] = useState("");
  const [logo, setLogo] = useState("");
  const [inscricao, setInscricao] = useState("");
  const [inscricaoGeral, setInscricaoGeral] = useState("");

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

      const tour = normalizarProximoTour(config.proximo_tour);
      if (!ativo) return;

      setAtivo(tour?.ativo ?? false);
      setTexto(tour?.texto ?? "");
      setData(tour?.data ?? "");
      setHora(tour?.hora ?? "");
      setLocal(tour?.local ?? "");
      setInfo(tour?.info ?? "");
      setRotaId(tour?.rotaId ?? "");
      setLogo(tour?.logo ?? "");
      setInscricao(tour?.inscricaoUrl ?? "");
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
    })();

    return () => {
      ativo = false;
    };
  }, [config]);

  async function enviarLogo(file: File | null) {
    if (!file) return;

    setOk("");
    setErro("");

    try {
      const url = await uploadFoto("evento", file, "eventos");
      setLogo(url);
      setOk('Logo enviada. Clique em "Salvar" para publicar.');
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao enviar a logo.");
    }
  }

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
      await salvarConfig("proximo_tour", {
        ativo,
        texto,
        data,
        hora,
        local,
        info,
        rota_id: rotaId,
        logo,
        inscricao_url: inscricao,
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
        as informações abaixo e o botão da ficha de inscrição. A <b>logo do evento</b>{" "}
        é enviada aqui mesmo, neste formulário. Enquanto estiver desmarcado, nada
        aparece para os visitantes. No fim desta página você também troca a{" "}
        <b>imagem de fundo</b> e os <b>textos fixos</b> da tela inicial.
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
          <span className="admin-check-texto">
            <b>Mostrar o aviso de próximo tour na tela inicial</b>
            <span className="admin-campo-dica">
              Desmarcado, a faixa do evento e a página do evento saem do app (nada é
              apagado).
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
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
        </label>

        <div className="admin-form-grid">
          <label className="admin-campo">
            <b>Data do evento</b>
            <span className="admin-campo-dica">
              Aparece no aviso da tela inicial e na página do evento.
            </span>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </label>

          <label className="admin-campo">
            <b>Horário</b>
            <span className="admin-campo-dica">
              Aparece ao lado da data, no aviso e na página do evento.
            </span>
            <input
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
            />
          </label>
        </div>

        <div className="admin-fotos">
          <b>Logo do evento</b>

          <p className="admin-ajuda">
            Envie aqui a imagem da logo <b>deste tour</b> — ela aparece no topo da página
            do evento, no mesmo tamanho reduzido da tela de Percursos. Publica ao clicar
            em <b>Salvar</b>. Se você não enviar nenhuma, o app usa a logo da rota
            escolhida no fim deste formulário.
          </p>

          {logo && (
            <div className="admin-logo-preview">
              <img src={logo} alt="" />
              <button
                type="button"
                className="outline"
                onClick={() => {
                  setLogo("");
                  setOk('Logo marcada para remoção. Clique em "Salvar" para publicar.');
                }}
              >
                Remover logo
              </button>
            </div>
          )}

          <div className="admin-form-upload">
            <label>{logo ? "Trocar a logo do evento:" : "Enviar a logo do evento:"}</label>
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
            value={local}
            onChange={(e) => setLocal(e.target.value)}
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
            value={info}
            onChange={(e) => setInfo(e.target.value)}
            rows={7}
          />
        </label>

        <label className="admin-campo">
          <b>Link da ficha de inscrição deste evento</b>
          <span className="admin-campo-dica">
            Vira o botão “Abrir a ficha de inscrição” na página do evento. Pode ser a
            página do Google Docs com as informações ou direto o formulário — ele abre
            em outra guia.
          </span>
          <input
            type="text"
            placeholder="Ex: https://forms.gle/..."
            value={inscricao}
            onChange={(e) => setInscricao(e.target.value)}
          />
        </label>

        <label className="admin-campo">
          <b>Rota do evento (opcional)</b>
          <span className="admin-campo-dica">
            Serve para o link “ver o percurso completo desta rota” na página do evento e,
            se você não enviou uma logo própria acima, é a logo usada nesta página.
          </span>
          <select value={rotaId} onChange={(e) => setRotaId(e.target.value)}>
            <option value="">— nenhuma —</option>
            {roteiros.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nome}
              </option>
            ))}
          </select>
        </label>

        <h2>Ficha de inscrição geral</h2>

        <label className="admin-campo">
          <b>Link da ficha de inscrição (geral)</b>
          <span className="admin-campo-dica">
            Usado quando a rota não tem um link próprio: aparece no aviso da tela inicial,
            na lista de rotas e na tela de cada rota.
          </span>
          <input
            type="text"
            placeholder="Ex: https://forms.gle/..."
            value={inscricaoGeral}
            onChange={(e) => setInscricaoGeral(e.target.value)}
          />
        </label>

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
            <img
              className="admin-capa-preview"
              src={capaUrl || CAPA_ORIGINAL}
              alt=""
            />

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
                    setOk(
                      'A arte original será usada. Clique em "Salvar" para publicar.'
                    );
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

            {enviandoCapa && (
              <p className="admin-ajuda">Enviando a imagem, aguarde...</p>
            )}
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
            Texto do botão que abre a ficha de inscrição, no aviso do evento na tela
            inicial.
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
