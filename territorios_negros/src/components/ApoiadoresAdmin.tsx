// ApoiadoresAdmin.tsx — aba "Apoiadores" do painel.
//
// Edita a página do app: o título, o texto de abertura e a lista de quem apoia o
// projeto (nome, logo, contribuição e link), com liga/desliga por apoiador.
//
// Grava em app_config, na chave "apoiadores" — nenhuma migração de banco. Como
// nas outras abas, nada vai ao ar sem "Salvar alterações".
import "../styles.css";

import { useEffect, useState } from "react";

import { salvarConfig, uploadFoto } from "../data/api";
import { useTerritorios } from "../context/useTerritorios";
import {
  CHAVE_APOIADORES,
  TIPOS_DE_APOIO,
  lerApoiadores,
  novoApoiador,
  quantosVisiveis,
  resumoDoApoiador,
  type Apoiador,
} from "../data/apoiadores";

export default function ApoiadoresAdmin() {
  const { config, recarregar } = useTerritorios();

  // o estado começa já com o que está gravado (a lista aparece preenchida no
  // primeiro desenho, sem piscar em branco) e o efeito abaixo ressincroniza
  // quando o painel termina de carregar ou quando outra tela muda o config
  const [titulo, setTitulo] = useState(() => lerApoiadores(config[CHAVE_APOIADORES]).titulo);
  const [texto, setTexto] = useState(() => lerApoiadores(config[CHAVE_APOIADORES]).texto);
  const [lista, setLista] = useState<Apoiador[]>(
    () => lerApoiadores(config[CHAVE_APOIADORES]).lista
  );

  const [ok, setOk] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [enviandoLogo, setEnviandoLogo] = useState<string | null>(null);
  const [enviandoFoto, setEnviandoFoto] = useState<string | null>(null);

  /** id do apoiador aguardando confirmação para ser apagado de vez */
  const [confirmandoRemover, setConfirmandoRemover] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    (async () => {
      // espera um tick para não disparar render em cascata dentro do efeito
      await Promise.resolve();

      const pagina = lerApoiadores(config[CHAVE_APOIADORES]);
      if (!ativo) return;

      setTitulo(pagina.titulo);
      setTexto(pagina.texto);
      setLista(pagina.lista);
    })();

    return () => {
      ativo = false;
    };
  }, [config]);

  /** Muda um campo de um apoiador (a lista é a fonte da tela). */
  function mudar(id: string, campo: keyof Apoiador, valor: string | boolean) {
    setLista((atual) => atual.map((a) => (a.id === id ? { ...a, [campo]: valor } : a)));
  }

  function adicionar() {
    setOk("");
    setErro("");
    setLista((atual) => [...atual, novoApoiador()]);
  }

  /**
   * Exibir/ocultar em um clique. Quando o apoiador já está publicado, GRAVA NA
   * HORA (o estado do cartão vale no app sem passar pelo "Salvar alterações" —
   * é o que a autoria precisa durante um evento). Cadastro ainda não publicado
   * só muda aqui e entra no próximo salvamento.
   */
  async function alternarVisivel(id: string) {
    const atual = lista.find((a) => a.id === id);
    if (!atual) return;

    const publicado = lerApoiadores(config[CHAVE_APOIADORES]);
    const naListaPublicada = publicado.lista.some((a) => a.id === id);

    setErro("");
    setOk("");

    if (!naListaPublicada) {
      mudar(id, "visivel", !atual.visivel);
      setOk(
        `“${atual.nome || "este apoiador"}” ${atual.visivel ? "oculto" : "liberado"} aqui — ` +
          `clique em "Salvar alterações" para publicar (ainda não estava no app).`
      );
      return;
    }

    try {
      const novaLista = publicado.lista.map((a) =>
        a.id === id ? { ...a, visivel: !a.visivel } : a
      );

      await salvarConfig(CHAVE_APOIADORES, { ...publicado, lista: novaLista });

      // mexe só neste item no estado local: as outras edições em andamento
      // continuam na tela, sem serem publicadas por tabela
      mudar(id, "visivel", !atual.visivel);

      setOk(
        `“${atual.nome || "este apoiador"}” ${atual.visivel ? "oculto" : "aparecendo"} no app agora.`
      );
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao mudar o estado do apoiador.");
    }
  }

  function remover(id: string) {
    setOk("");
    setErro("");
    setConfirmandoRemover(null);
    setLista((atual) => atual.filter((a) => a.id !== id));
  }

  /** Sobe ou desce um apoiador na ordem da página. */
  function mover(id: string, passo: -1 | 1) {
    setLista((atual) => {
      const i = atual.findIndex((a) => a.id === id);
      const j = i + passo;
      if (i < 0 || j < 0 || j >= atual.length) return atual;

      const copia = [...atual];
      [copia[i], copia[j]] = [copia[j], copia[i]];
      return copia;
    });
  }

  /** Volta a lista ao que está publicado (sai o que não foi salvo). */
  function descartar() {
    const pagina = lerApoiadores(config[CHAVE_APOIADORES]);

    setTitulo(pagina.titulo);
    setTexto(pagina.texto);
    setLista(pagina.lista);
    setErro("");
    setOk("Mostrando o que está publicado — o que não foi salvo saiu da tela.");
  }

  async function enviarLogo(id: string, file: File | null) {
    if (!file) return;

    setOk("");
    setErro("");
    setEnviandoLogo(id);

    try {
      const url = await uploadFoto(id, file, "apoiadores");
      mudar(id, "logo", url);
      setOk('Logo enviada. Clique em "Salvar alterações" para publicar no app.');
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao enviar a logo.");
    } finally {
      setEnviandoLogo(null);
    }
  }

  async function enviarFoto(id: string, file: File | null) {
    if (!file) return;

    setOk("");
    setErro("");
    setEnviandoFoto(id);

    try {
      const url = await uploadFoto(id, file, "apoiadores");
      mudar(id, "foto", url);
      setOk('Foto enviada. Clique em "Salvar alterações" para publicar no app.');
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao enviar a foto.");
    } finally {
      setEnviandoFoto(null);
    }
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();

    setOk("");
    setErro("");
    setSalvando(true);

    try {
      await salvarConfig(CHAVE_APOIADORES, { titulo, texto, lista });
      await recarregar();
      setOk("Apoiadores salvos — já valem no app.");
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao salvar os apoiadores.");
    } finally {
      setSalvando(false);
    }
  }

  const visiveis = quantosVisiveis({ titulo, texto, lista });

  return (
    <div className="apoio-admin">
      <h1>Apoiadores</h1>

      <p className="admin-ajuda">
        Nesta lista: <b>{lista.length}</b> {lista.length === 1 ? "cadastro" : "cadastros"} e{" "}
        <b>{visiveis}</b> {visiveis === 1 ? "aparecendo" : "aparecendo"} para o visitante.
        {lista.length - visiveis > 0 && (
          <>
            {" "}
            <b>{lista.length - visiveis}</b> {lista.length - visiveis === 1 ? "oculto" : "ocultos"}
            — guardados aqui, fora do app.
          </>
        )}
      </p>

      {ok && <p className="admin-ok">{ok}</p>}
      {erro && <p className="admin-erro">{erro}</p>}

      <form className="admin-form" onSubmit={salvar}>
        <h2>Topo da página</h2>

        <label className="admin-campo">
          <b>Título</b>
          <span className="admin-campo-dica">
            Primeira linha da página, em letras grandes. Vale só para esta página.
          </span>
          <input
            type="text"
            placeholder="Ex: Conheça quem apoia este projeto"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
        </label>

        <label className="admin-campo">
          <b>Texto de abertura</b>
          <span className="admin-campo-dica">
            Parágrafo logo abaixo do título, apresentando quem apoia. Linha em branco separa
            parágrafos; **negrito** e *itálico* funcionam.
          </span>
          <textarea
            rows={4}
            placeholder="Ex: Conheça as pessoas e instituições que contribuem para a realização desta experiência…"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
        </label>

        <hr className="admin-divisor" />
        <h3 className="admin-form-secao">Quem apoia</h3>

        <p className="admin-ajuda">
          Cada apoiador vira um cartão na página: <b>logo</b>, <b>nome</b>, uma frase sobre a{" "}
          <b>contribuição</b> e os <b>contatos</b> que você preencher (WhatsApp, Instagram, Site,
          YouTube). CNPJ/CPF, endereço e telefones ficam só aqui no painel. A ordem desta lista é
          a ordem na página.
        </p>

        {lista.length === 0 && (
          <p className="admin-ajuda">
            Nenhum apoiador cadastrado ainda. Clique em <b>Adicionar apoiador</b> para começar.
          </p>
        )}

        {lista.map((apoiador, i) => (
          <div
            className={`apoio-admin-item${apoiador.visivel ? "" : " apoio-admin-item--oculto"}`}
            key={apoiador.id}
          >
            <div className="apoio-admin-topo">
              <b className="apoio-admin-titulo">
                {i + 1}. {resumoDoApoiador(apoiador)}

                {/* o estado aparece no topo do cartão: é o que a autoria procura
                    para tirar do ar sem apagar o cadastro */}
                <span
                  className={`apoio-admin-estado${
                    apoiador.visivel ? " apoio-admin-estado--dentro" : " apoio-admin-estado--fora"
                  }`}
                >
                  {apoiador.visivel ? "aparecendo" : "oculto"}
                </span>
              </b>

              <span className="apoio-admin-acoes">
                <button
                  type="button"
                  className="midias-acao"
                  onClick={() => alternarVisivel(apoiador.id)}
                  title={
                    apoiador.visivel
                      ? "Tirar do app sem apagar o cadastro (grava na hora)"
                      : "Voltar a mostrar no app (grava na hora)"
                  }
                >
                  {apoiador.visivel ? "ocultar" : "exibir"}
                </button>
                <button
                  type="button"
                  className="midias-acao"
                  onClick={() => mover(apoiador.id, -1)}
                  disabled={i === 0}
                >
                  subir
                </button>
                <button
                  type="button"
                  className="midias-acao"
                  onClick={() => mover(apoiador.id, 1)}
                  disabled={i === lista.length - 1}
                >
                  descer
                </button>
                <button
                  type="button"
                  className="midias-acao"
                  onClick={() => setConfirmandoRemover(apoiador.id)}
                >
                  apagar
                </button>
              </span>
            </div>

            {confirmandoRemover === apoiador.id && (
              <div className="admin-confirmacao">
                <p>
                  <b>Apagar “{apoiador.nome || "este apoiador"}” de vez?</b> Os dados saem da
                  lista e, depois de salvar, não dá para recuperar. Se a ideia é só tirar do ar
                  agora (o apoio pode ser renovado), use <b>ocultar</b>: o cadastro fica
                  guardado inteiro.
                </p>

                <div className="admin-form-botoes">
                  <button type="button" className="btn" onClick={() => remover(apoiador.id)}>
                    sim, apagar de vez
                  </button>

                  <button
                    type="button"
                    className="outline"
                    onClick={() => {
                      setConfirmandoRemover(null);
                      void alternarVisivel(apoiador.id);
                    }}
                  >
                    não — só ocultar
                  </button>

                  <button
                    type="button"
                    className="outline"
                    onClick={() => setConfirmandoRemover(null)}
                  >
                    cancelar
                  </button>
                </div>
              </div>
            )}

            <div className="admin-form-grid">
              <label className="admin-campo">
                <b>Nome *</b>
                <span className="admin-campo-dica">
                  Nome da instituição, empresa, coletivo ou pessoa.
                </span>
                <input
                  type="text"
                  placeholder="Ex: Instituto Cultural Exemplo"
                  value={apoiador.nome}
                  onChange={(e) => mudar(apoiador.id, "nome", e.target.value)}
                />
              </label>

              <label className="admin-campo">
                <b>Participação</b>
                <span className="admin-campo-dica">
                  O que foi combinado com quem apoia. Aparece como etiqueta no alto do cartão; sem
                  escolha, o cartão sai sem etiqueta.
                </span>
                <select
                  value={apoiador.tipo}
                  onChange={(e) => mudar(apoiador.id, "tipo", e.target.value)}
                >
                  <option value="">— ainda não defini —</option>

                  {TIPOS_DE_APOIO.map((tipo) => (
                    <option key={tipo.valor} value={tipo.valor}>
                      {tipo.nome} — {tipo.explicacao}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="admin-campo">
              <b>Contribuição</b>
              <span className="admin-campo-dica">
                Uma frase curta: apoio à divulgação, acolhimento da visita, material educativo,
                transporte etc.
              </span>
              <textarea
                rows={2}
                placeholder="Ex: Acolhimento da visita guiada e apoio à divulgação."
                value={apoiador.contribuicao}
                onChange={(e) => mudar(apoiador.id, "contribuicao", e.target.value)}
              />
            </label>

            <label className="admin-campo">
              <b>Site ou Instagram (link)</b>
              <span className="admin-campo-dica">
                Opcional. Aceita o endereço completo, <b>instagram.com/perfil</b> ou só{" "}
                <b>@perfil</b> — o app completa o resto. Se preferir, use os campos de contato
                abaixo.
              </span>
              <input
                type="text"
                placeholder="Ex: @institutoexemplo ou institutoexemplo.com.br"
                value={apoiador.link}
                onChange={(e) => mudar(apoiador.id, "link", e.target.value)}
              />
            </label>

            <h4 className="admin-form-secao">Contato que aparece no app</h4>

            <p className="admin-campo-dica">
              Cada campo preenchido vira um botão no cartão do apoiador. Deixe em branco o que
              não quiser mostrar.
            </p>

            <div className="admin-form-grid">
              <label className="admin-campo">
                <b>WhatsApp</b>
                <span className="admin-campo-dica">
                  Com DDD. Pode digitar com parênteses e traço — o app monta o link.
                </span>
                <input
                  type="text"
                  placeholder="Ex: (27) 99999-0000"
                  value={apoiador.whatsapp}
                  onChange={(e) => mudar(apoiador.id, "whatsapp", e.target.value)}
                />
              </label>

              <label className="admin-campo">
                <b>Instagram</b>
                <span className="admin-campo-dica">
                  Só o perfil, com ou sem @. Ex.: @institutoexemplo
                </span>
                <input
                  type="text"
                  placeholder="Ex: @institutoexemplo"
                  value={apoiador.instagram}
                  onChange={(e) => mudar(apoiador.id, "instagram", e.target.value)}
                />
              </label>

              <label className="admin-campo">
                <b>Site</b>
                <span className="admin-campo-dica">Endereço do site, sem precisar do https://</span>
                <input
                  type="text"
                  placeholder="Ex: institutoexemplo.org.br"
                  value={apoiador.site}
                  onChange={(e) => mudar(apoiador.id, "site", e.target.value)}
                />
              </label>

              <label className="admin-campo">
                <b>YouTube</b>
                <span className="admin-campo-dica">Canal ou vídeo do apoiador</span>
                <input
                  type="text"
                  placeholder="Ex: youtube.com/@institutoexemplo"
                  value={apoiador.youtube}
                  onChange={(e) => mudar(apoiador.id, "youtube", e.target.value)}
                />
              </label>
            </div>

            <h4 className="admin-form-secao">Dados do cadastro (não aparecem no app)</h4>

            <p className="admin-campo-dica">
              Endereço e telefones ficam guardados aqui, no painel. O visitante não vê. Não há
              campo de CPF/CNPJ: o documento não é guardado neste cadastro.
            </p>

            <label className="admin-campo">
              <b>Endereço</b>
              <span className="admin-campo-dica">
                Rua, número, bairro, cidade e CEP. Uso interno do cadastro.
              </span>
              <input
                type="text"
                placeholder="Ex: Rua Exemplo, 100 — Centro, Vitória/ES — 29000-000"
                value={apoiador.endereco}
                onChange={(e) => mudar(apoiador.id, "endereco", e.target.value)}
              />
            </label>

            <label className="admin-campo">
              <b>Telefones</b>
              <span className="admin-campo-dica">
                Fixo e celular, como quiser separar. Não aparece no app.
              </span>
              <input
                type="text"
                placeholder="Ex: (27) 3333-0000 · (27) 99999-0000"
                value={apoiador.telefones}
                onChange={(e) => mudar(apoiador.id, "telefones", e.target.value)}
              />
            </label>

            <div className="admin-form-upload">
              <label className="admin-campo">
                <b>Logo ou imagem</b>
                <span className="admin-campo-dica">
                  Use com autorização de quem apoia. Se for só um endereço, cole abaixo.
                </span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={enviandoLogo === apoiador.id}
                  onChange={(e) => enviarLogo(apoiador.id, e.target.files?.[0] ?? null)}
                />
              </label>

              <label className="admin-campo">
                <b>Endereço da logo</b>
                <span className="admin-campo-dica">
                  Preenchido sozinho quando você envia o arquivo. Também aceita um endereço colado.
                </span>
                <input
                  type="text"
                  placeholder="Ex: https://…/logo.png"
                  value={apoiador.logo}
                  onChange={(e) => mudar(apoiador.id, "logo", e.target.value)}
                />
              </label>

              {apoiador.logo && (
                <div className="apoio-admin-previa">
                  <img src={apoiador.logo} alt="" />
                  <span className="admin-campo-dica">prévia</span>
                </div>
              )}
            </div>

            <div className="admin-form-upload">
              <label className="admin-campo">
                <b>Foto (quando necessário)</b>
                <span className="admin-campo-dica">
                  Foto do apoiador, da equipe ou do espaço. Aparece no cartão, embaixo do texto.
                </span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={enviandoFoto === apoiador.id}
                  onChange={(e) => enviarFoto(apoiador.id, e.target.files?.[0] ?? null)}
                />
              </label>

              <label className="admin-campo">
                <b>Endereço da foto</b>
                <span className="admin-campo-dica">
                  Preenchido sozinho quando você envia o arquivo. Também aceita um endereço colado.
                </span>
                <input
                  type="text"
                  placeholder="Ex: https://…/foto.jpg"
                  value={apoiador.foto}
                  onChange={(e) => mudar(apoiador.id, "foto", e.target.value)}
                />
              </label>

              {apoiador.foto && (
                <div className="apoio-admin-previa">
                  <img src={apoiador.foto} alt="" />
                  <span className="admin-campo-dica">prévia</span>
                </div>
              )}
            </div>

            <label className="apoio-admin-liga">
              <input
                type="checkbox"
                checked={apoiador.visivel}
                onChange={() => alternarVisivel(apoiador.id)}
              />
              <span>
                <b>Aparecendo no app</b> (grava na hora) — desmarcado, o cartão sai da página e o
                cadastro continua guardado aqui, inteiro, para quando o apoio for renovado.
              </span>
            </label>
          </div>
        ))}

        <div className="admin-form-botoes">
          <button type="button" className="btn" onClick={adicionar}>
            Adicionar apoiador
          </button>

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
