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
  APOIADORES_PADRAO,
  CHAVE_APOIADORES,
  lerApoiadores,
  novoApoiador,
  quantosVisiveis,
  resumoDoApoiador,
  type Apoiador,
} from "../data/apoiadores";

export default function ApoiadoresAdmin() {
  const { config, recarregar } = useTerritorios();

  const [titulo, setTitulo] = useState(APOIADORES_PADRAO.titulo);
  const [texto, setTexto] = useState(APOIADORES_PADRAO.texto);
  const [lista, setLista] = useState<Apoiador[]>([]);

  const [ok, setOk] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [enviandoLogo, setEnviandoLogo] = useState<string | null>(null);

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

  function remover(id: string) {
    setOk("");
    setErro("");
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
        Aqui você monta a página <b>Apoiadores</b> do app (endereço <b>/apoiadores</b>), com quem
        apoia o projeto. O botão de acesso fica na tela <b>Antes de caminhar</b>, logo abaixo do
        botão de contato — e ele só aparece para o visitante quando houver <b>pelo menos um
        apoiador ligado</b> com nome ou logo. Nada vai ao ar sem <b>Salvar alterações</b>.
      </p>

      <p className="admin-ajuda">
        Nesta lista: <b>{lista.length}</b> {lista.length === 1 ? "cadastro" : "cadastros"} e{" "}
        <b>{visiveis}</b> {visiveis === 1 ? "aparecendo" : "aparecendo"} para o visitante.
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
          <b>contribuição</b> e, se houver, o <b>link</b> oficial (site ou Instagram). A ordem aqui é
          a ordem na página.
        </p>

        {lista.length === 0 && (
          <p className="admin-ajuda">
            Nenhum apoiador cadastrado ainda. Clique em <b>Adicionar apoiador</b> para começar.
          </p>
        )}

        {lista.map((apoiador, i) => (
          <div className="apoio-admin-item" key={apoiador.id}>
            <div className="apoio-admin-topo">
              <b>
                {i + 1}. {resumoDoApoiador(apoiador)}
              </b>

              <span className="apoio-admin-acoes">
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
                  onClick={() => remover(apoiador.id)}
                >
                  remover
                </button>
              </span>
            </div>

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
                <b>Link (site ou Instagram)</b>
                <span className="admin-campo-dica">
                  Opcional. Pode colar sem o “https://” que o app completa. Vira um botão no cartão.
                </span>
                <input
                  type="text"
                  placeholder="Ex: instagram.com/institutoexemplo"
                  value={apoiador.link}
                  onChange={(e) => mudar(apoiador.id, "link", e.target.value)}
                />
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

            <label className="apoio-admin-liga">
              <input
                type="checkbox"
                checked={apoiador.visivel}
                onChange={(e) => mudar(apoiador.id, "visivel", e.target.checked)}
              />
              <span>
                <b>Aparecendo no app</b> — desmarque para guardar o cadastro sem mostrar ao
                visitante.
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
