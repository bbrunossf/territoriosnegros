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

        <label className="admin-campo">
          Rota do evento (opcional)
          <select value={rotaId} onChange={(e) => setRotaId(e.target.value)}>
            <option value="">— nenhuma —</option>
            {roteiros.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nome}
              </option>
            ))}
          </select>
        </label>

        <small className="admin-ajuda">
          Serve para o link “ver o percurso completo desta rota” na página do evento e,
          se você não enviou uma logo própria acima, é a logo usada nesta página.
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

          <input
            type="text"
            placeholder="Crédito da imagem de fundo (ex: Foto: Maria Souza · Acervo pessoal)"
            value={capaCredito}
            onChange={(e) => setCapaCredito(e.target.value)}
          />
        </div>

        <label className="admin-campo">
          Faixa do próximo evento (aparece na tela inicial e na página do evento)
          <input
            type="text"
            placeholder={TELA_INICIAL_PADRAO.selo}
            value={selo}
            onChange={(e) => setSelo(e.target.value)}
          />
        </label>

        <label className="admin-campo">
          Botão de inscrição, dentro do cartão do evento
          <input
            type="text"
            placeholder={TELA_INICIAL_PADRAO.botaoInscricao}
            value={botaoInscricao}
            onChange={(e) => setBotaoInscricao(e.target.value)}
          />
        </label>

        <label className="admin-campo">
          Botão principal da tela inicial (o que abre a leitura da cidade)
          <textarea
            rows={2}
            placeholder={TELA_INICIAL_PADRAO.botaoInicio}
            value={botaoInicio}
            onChange={(e) => setBotaoInicio(e.target.value)}
          />
        </label>

        <label className="admin-campo">
          Linha de autoria, no rodapé da tela inicial
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
