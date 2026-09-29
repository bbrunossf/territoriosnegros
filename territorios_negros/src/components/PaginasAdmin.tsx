// PaginasAdmin.tsx — edição dos textos das páginas do app (aba Páginas)
import "../styles.css";

import { useEffect, useState } from "react";
import { salvarConfig, uploadFoto } from "../data/api";
import { useTerritorios } from "../context/useTerritorios";
import {
  CONTATO_PADRAO,
  CONCEITO_PADRAO,
  FIM_PADRAO,
  INTRO_PADRAO,
  VITORIA_PADRAO,
  definirVisibilidadeDeTodasAsImagens,
  normalizarPagina,
  type BlocoConteudo,
  type BotaoConteudo,
  type ImagemBloco,
  type PaginaConteudo,
  type PosicaoImagens,
} from "../data/paginas";
import { formatarDataHoraBR } from "../utils/data";
import { legendaDoArquivo } from "../utils/legendas";
import FormularioContatoAdmin from "./FormularioContatoAdmin";

interface DefinicaoPagina {
  chave: string;
  nome: string;
  caminho: string;
  padrao: PaginaConteudo;
  aviso?: string;
}

const PAGINAS: DefinicaoPagina[] = [
  { chave: "pagina_intro", nome: "Antes", caminho: "/intro", padrao: INTRO_PADRAO },
  { chave: "pagina_vitoria", nome: "Vitória", caminho: "/vitoria", padrao: VITORIA_PADRAO },
  { chave: "pagina_conceito", nome: "Conceito", caminho: "/conceito", padrao: CONCEITO_PADRAO },
  { chave: "pagina_fim", nome: "Fim", caminho: "/fim", padrao: FIM_PADRAO },
  {
    chave: "pagina_contato",
    nome: "Contato",
    caminho: "/contato",
    padrao: CONTATO_PADRAO,
    aviso:
      "Nesta página o formulário de mensagem aparece abaixo destes textos: aqui você " +
      "edita o título, o subtítulo e o texto de abertura — e, no fim da página, os " +
      "campos e as mensagens do próprio formulário.",
  },
];

const BLOCO_NOVO: BlocoConteudo = {
  icone: "•",
  titulo: "",
  texto: "",
  itens: [],
  destaque: "",
  links: [],
  imagens: [],
  posicaoImagens: "fim",
};

function itensParaTexto(itens: string[]): string {
  return itens.join("\n");
}

function textoParaItens(txt: string): string[] {
  return txt
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function PaginasAdmin() {
  const { config, recarregar } = useTerritorios();

  const [indice, setIndice] = useState(0);
  const definicao = PAGINAS[indice];

  const [pagina, setPagina] = useState<PaginaConteudo>(definicao.padrao);
  const [pendente, setPendente] = useState(false);
  const [salvando, setSalvando] = useState(false);
  /** bloco que está recebendo upload agora (mostra "enviando...") */
  const [enviando, setEnviando] = useState<number | null>(null);
  const [ok, setOk] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    (async () => {
      await Promise.resolve();
      if (!ativo) return;

      setPagina(normalizarPagina(config[definicao.chave], definicao.padrao));
      setPendente(false);
      setOk("");
      setErro("");
    })();

    return () => {
      ativo = false;
    };
  }, [config, definicao.chave, definicao.padrao]);

  // ── navegação entre as páginas ──────────────────────────

  function trocarPagina(novo: number) {
    if (novo === indice) return;

    if (
      pendente &&
      !window.confirm(
        "Você tem alterações não salvas nesta página. Trocar de página e descartar?"
      )
    ) {
      return;
    }

    setIndice(novo);
  }

  // ── edição ──────────────────────────────────────────────

  function setCampo(campo: keyof PaginaConteudo, valor: string) {
    setPagina((p) => ({ ...p, [campo]: valor }));
    setPendente(true);
  }

  function setBloco(indiceBloco: number, campo: keyof BlocoConteudo, valor: string) {
    setPagina((p) => ({
      ...p,
      blocos: p.blocos.map((b, i) => {
        if (i !== indiceBloco) return b;
        if (campo === "itens") return { ...b, itens: textoParaItens(valor) };
        return { ...b, [campo]: valor };
      }),
    }));
    setPendente(true);
  }

  function moverBloco(indiceBloco: number, delta: number) {
    const destino = indiceBloco + delta;
    if (destino < 0 || destino >= pagina.blocos.length) return;

    const blocos = [...pagina.blocos];
    [blocos[indiceBloco], blocos[destino]] = [blocos[destino], blocos[indiceBloco]];

    setPagina((p) => ({ ...p, blocos }));
    setPendente(true);
  }

  function removerBloco(indiceBloco: number) {
    const nome = pagina.blocos[indiceBloco]?.titulo || `bloco ${indiceBloco + 1}`;
    if (!window.confirm(`Remover o bloco "${nome}"?`)) return;

    setPagina((p) => ({ ...p, blocos: p.blocos.filter((_, i) => i !== indiceBloco) }));
    setPendente(true);
  }

  function adicionarBloco() {
    setPagina((p) => ({ ...p, blocos: [...p.blocos, { ...BLOCO_NOVO }] }));
    setPendente(true);
  }

  /**
   * Liga/desliga de uma vez todas as imagens da página (todas as seções) —
   * atalho equivalente ao "liberar/bloquear fotos de apoio" dos territórios.
   */
  function definirVisibilidadeTodas(visivel: boolean) {
    setPagina((p) => definirVisibilidadeDeTodasAsImagens(p, visivel));
    setPendente(true);
  }

  // ── imagens do bloco (mapas, fotos, esquemas) ───────────

  /** envia uma ou várias imagens para o bloco (ficam no Storage do Supabase) */
  async function adicionarImagens(indiceBloco: number, files: FileList | null) {
    if (!files || files.length === 0) return;

    setOk("");
    setErro("");
    setEnviando(indiceBloco);

    try {
      const novas: ImagemBloco[] = [];

      for (const file of Array.from(files)) {
        const url = await uploadFoto(`${definicao.chave}-b${indiceBloco + 1}`, file, "paginas");
        // a legenda já entra com o nome do arquivo (editável depois)
        novas.push({
          url,
          legenda: legendaDoArquivo(file.name),
          credito: "",
          visivel: true,
        });
      }

      setPagina((p) => ({
        ...p,
        blocos: p.blocos.map((b, i) =>
          i === indiceBloco ? { ...b, imagens: [...b.imagens, ...novas] } : b
        ),
      }));
      setPendente(true);
      setOk(
        `${novas.length} imagem(ns) enviada(s). Clique em "Salvar" para publicar no app.`
      );
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao enviar a imagem.");
    } finally {
      setEnviando(null);
    }
  }

  function setImagem(indiceBloco: number, indiceImagem: number, campo: keyof ImagemBloco, valor: unknown) {
    setPagina((p) => ({
      ...p,
      blocos: p.blocos.map((b, i) =>
        i === indiceBloco
          ? {
              ...b,
              imagens: b.imagens.map((img, j) =>
                j === indiceImagem ? { ...img, [campo]: valor } : img
              ),
            }
          : b
      ),
    }));
    setPendente(true);
  }

  function moverImagem(indiceBloco: number, indiceImagem: number, delta: number) {
    const bloco = pagina.blocos[indiceBloco];
    const destino = indiceImagem + delta;
    if (!bloco || destino < 0 || destino >= bloco.imagens.length) return;

    const imagens = [...bloco.imagens];
    [imagens[indiceImagem], imagens[destino]] = [imagens[destino], imagens[indiceImagem]];

    setPagina((p) => ({
      ...p,
      blocos: p.blocos.map((b, i) => (i === indiceBloco ? { ...b, imagens } : b)),
    }));
    setPendente(true);
  }

  function removerImagem(indiceBloco: number, indiceImagem: number) {
    if (!window.confirm("Remover esta imagem do bloco?")) return;

    setPagina((p) => ({
      ...p,
      blocos: p.blocos.map((b, i) =>
        i === indiceBloco
          ? { ...b, imagens: b.imagens.filter((_, j) => j !== indiceImagem) }
          : b
      ),
    }));
    setPendente(true);
  }

  function setPosicaoImagens(indiceBloco: number, valor: PosicaoImagens) {
    setPagina((p) => ({
      ...p,
      blocos: p.blocos.map((b, i) => (i === indiceBloco ? { ...b, posicaoImagens: valor } : b)),
    }));
    setPendente(true);
  }

  // links dentro de um bloco
  function setLink(bloco: number, link: number, campo: "texto" | "url", valor: string) {
    setPagina((p) => ({
      ...p,
      blocos: p.blocos.map((b, i) =>
        i === bloco
          ? {
              ...b,
              links: b.links.map((l, j) => (j === link ? { ...l, [campo]: valor } : l)),
            }
          : b
      ),
    }));
    setPendente(true);
  }

  function adicionarLink(bloco: number) {
    setPagina((p) => ({
      ...p,
      blocos: p.blocos.map((b, i) =>
        i === bloco ? { ...b, links: [...b.links, { texto: "", url: "" }] } : b
      ),
    }));
    setPendente(true);
  }

  function removerLink(bloco: number, link: number) {
    setPagina((p) => ({
      ...p,
      blocos: p.blocos.map((b, i) =>
        i === bloco ? { ...b, links: b.links.filter((_, j) => j !== link) } : b
      ),
    }));
    setPendente(true);
  }

  // botões do fim da página
  function setBotao(i: number, campo: keyof BotaoConteudo, valor: string) {
    setPagina((p) => ({
      ...p,
      botoes: p.botoes.map((b, j) =>
        j === i
          ? { ...b, [campo]: campo === "estilo" ? (valor as "btn" | "outline") : valor }
          : b
      ),
    }));
    setPendente(true);
  }

  function moverBotao(i: number, delta: number) {
    const destino = i + delta;
    if (destino < 0 || destino >= pagina.botoes.length) return;

    const botoes = [...pagina.botoes];
    [botoes[i], botoes[destino]] = [botoes[destino], botoes[i]];

    setPagina((p) => ({ ...p, botoes }));
    setPendente(true);
  }

  function removerBotao(i: number) {
    setPagina((p) => ({ ...p, botoes: p.botoes.filter((_, j) => j !== i) }));
    setPendente(true);
  }

  function adicionarBotao() {
    setPagina((p) => ({
      ...p,
      botoes: [...p.botoes, { texto: "", url: "/", estilo: "outline" }],
    }));
    setPendente(true);
  }

  // ── salvar ──────────────────────────────────────────────

  /** quantas imagens a página tem no total e quantas o visitante está vendo */
  const imagensDaPagina = pagina.blocos.flatMap((b) => b.imagens);
  const totalImagens = imagensDaPagina.length;
  const imagensAparecendo = imagensDaPagina.filter((i) => i.visivel !== false).length;

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setOk("");
    setErro("");
    setSalvando(true);

    try {
      await salvarConfig(definicao.chave, pagina);
      await recarregar();
      setPendente(false);
      setOk(`Publicado em ${formatarDataHoraBR(new Date().toISOString())}.`);
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao salvar.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div>
      <h1>Páginas</h1>

      <p className="admin-ajuda">
        Aqui você edita os textos das páginas do app. Em cada página, os blocos são as seções
        com ícone e título. Para dar destaque, use <b>**duas estrelas**</b> (negrito) ou{" "}
        <b>*uma estrela*</b> (itálico); no texto do bloco, deixe uma <b>linha em branco</b>{" "}
        entre parágrafos. Cada bloco também aceita <b>imagens e mapas</b>, que podem ficar
        visíveis ou bloqueados para os visitantes — e, no fim da página, há um atalho para
        liberar ou bloquear todas as imagens desta página de uma vez. Nada é publicado antes
        de clicar em <b>Salvar</b>.
      </p>

      <div className="admin-abas">
        {PAGINAS.map((p, i) => (
          <button
            key={p.chave}
            type="button"
            className={i === indice ? "btn" : "outline"}
            onClick={() => trocarPagina(i)}
          >
            {p.nome}
          </button>
        ))}
      </div>

      {definicao.aviso && <p className="admin-ajuda">{definicao.aviso}</p>}

      {ok && <p className="admin-ok">{ok}</p>}
      {erro && <p className="admin-erro">{erro}</p>}

      <form className="admin-form" onSubmit={salvar}>
        <h2>
          {definicao.nome}
          {pendente && <span className="admin-pendente"> · alterações não salvas</span>}
        </h2>

        <div className="admin-form-grid">
          <input
            type="text"
            placeholder="Título da página"
            value={pagina.titulo}
            onChange={(e) => setCampo("titulo", e.target.value)}
          />
          <input
            type="text"
            placeholder="Subtítulo (opcional)"
            value={pagina.subtitulo}
            onChange={(e) => setCampo("subtitulo", e.target.value)}
          />
        </div>

        <label className="admin-campo">
          Bloco destacado de abertura (caixa do topo)
          <textarea
            value={pagina.destaque}
            onChange={(e) => setCampo("destaque", e.target.value)}
            rows={5}
          />
        </label>

        <h2>Blocos da página</h2>

        {pagina.blocos.length === 0 && (
          <p className="admin-ajuda">Nenhum bloco nesta página ainda.</p>
        )}

        {pagina.blocos.map((bloco, i) => (
          <div key={i} className="admin-bloco">
            <div className="admin-bloco-topo">
              <span className="admin-bloco-num">bloco {i + 1}</span>

              <input
                type="text"
                className="admin-bloco-icone"
                placeholder="ícone"
                value={bloco.icone}
                onChange={(e) => setBloco(i, "icone", e.target.value)}
              />

              <input
                type="text"
                placeholder="Título do bloco"
                value={bloco.titulo}
                onChange={(e) => setBloco(i, "titulo", e.target.value)}
              />

              <button type="button" className="outline" onClick={() => moverBloco(i, -1)}>
                ↑
              </button>
              <button type="button" className="outline" onClick={() => moverBloco(i, 1)}>
                ↓
              </button>
              <button type="button" className="outline" onClick={() => removerBloco(i)}>
                ✕
              </button>
            </div>

            <textarea
              placeholder="Texto do bloco (linha em branco separa parágrafos)"
              value={bloco.texto}
              onChange={(e) => setBloco(i, "texto", e.target.value)}
              rows={5}
            />

            <textarea
              placeholder="Lista com travessão — um item por linha (opcional)"
              value={itensParaTexto(bloco.itens)}
              onChange={(e) => setBloco(i, "itens", e.target.value)}
              rows={3}
            />

            <textarea
              placeholder="Caixa destacada dentro do bloco (opcional)"
              value={bloco.destaque}
              onChange={(e) => setBloco(i, "destaque", e.target.value)}
              rows={3}
            />

            {/* ─── imagens deste bloco ─── */}
            <div className="admin-fotos">
              <b>Imagens desta seção (mapas, fotos, esquemas)</b>

              <p className="admin-ajuda">
                Envie uma ou várias imagens e elas aparecem dentro desta seção, no app.
                A <b>legenda</b> de cada uma já entra com o nome do arquivo — ajuste só o
                que precisar. O <b>crédito</b> aparece embaixo da imagem. A ordem desta
                lista é a ordem em que elas aparecem: use <b>↑ ↓</b> para reorganizar. O
                botão <b>Bloquear</b> esconde a imagem dos visitantes (útil para liberar
                no momento do tour); <b>Liberar</b> mostra de novo. Foto principal e
                imagens deste bloco só vão para o app depois de clicar em <b>Salvar</b>.
              </p>

              {bloco.imagens.length > 0 && (
                <label className="admin-campo">
                  Onde as imagens aparecem nesta seção
                  <span className="admin-campo-dica">
                    Escolha se entram logo depois do texto principal ou no fim da seção,
                    depois das listas e das caixas.
                  </span>

                  <select
                    value={bloco.posicaoImagens}
                    onChange={(e) => setPosicaoImagens(i, e.target.value as PosicaoImagens)}
                  >
                    <option value="aposTexto">logo depois do texto principal</option>
                    <option value="fim">no fim da seção</option>
                  </select>
                </label>
              )}

              <div className="admin-form-upload">
                <label>Adicionar imagens a esta seção (pode escolher várias):</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={enviando === i}
                  onChange={(e) => {
                    adicionarImagens(i, e.target.files);
                    e.target.value = "";
                  }}
                />
                {enviando === i && (
                  <p className="admin-ajuda">Enviando as imagens, aguarde...</p>
                )}
              </div>

              {bloco.imagens.length === 0 && (
                <p className="admin-ajuda">Nenhuma imagem nesta seção ainda.</p>
              )}

              <div className="admin-galeria">
                {bloco.imagens.map((imagem, j) => {
                  const bloqueada = imagem.visivel === false;

                  return (
                    <div
                      key={`${imagem.url}-${j}`}
                      className={`admin-galeria-item ${bloqueada ? "admin-galeria-bloqueada" : ""}`}
                    >
                      <span
                        className={bloqueada ? "admin-galeria-apoio" : "admin-galeria-principal"}
                      >
                        {bloqueada ? "oculta para os visitantes" : "aparecendo no app"}
                      </span>

                      <img src={imagem.url} alt="" />

                      <input
                        type="text"
                        placeholder="Legenda da imagem"
                        value={imagem.legenda ?? ""}
                        onChange={(e) => setImagem(i, j, "legenda", e.target.value)}
                      />

                      <input
                        type="text"
                        placeholder="Crédito (ex: Mapa: Aingrid Souza · Acervo pessoal)"
                        value={imagem.credito ?? ""}
                        onChange={(e) => setImagem(i, j, "credito", e.target.value)}
                      />

                      <div className="admin-galeria-acoes">
                        <button
                          type="button"
                          className="outline"
                          onClick={() => moverImagem(i, j, -1)}
                          title="Mover para cima (aparece antes no app)"
                        >
                          ↑
                        </button>

                        <button
                          type="button"
                          className="outline"
                          onClick={() => moverImagem(i, j, 1)}
                          title="Mover para baixo (aparece depois no app)"
                        >
                          ↓
                        </button>

                        <button
                          type="button"
                          className={bloqueada ? "btn" : "outline"}
                          onClick={() => setImagem(i, j, "visivel", bloqueada)}
                          title={
                            bloqueada
                              ? "Mostrar esta imagem para os visitantes"
                              : "Esconder esta imagem dos visitantes"
                          }
                        >
                          {bloqueada ? "Liberar" : "Bloquear"}
                        </button>

                        <button
                          type="button"
                          className="outline"
                          onClick={() => removerImagem(i, j)}
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {bloco.links.map((link, j) => (
              <div key={j} className="admin-linha">
                <input
                  type="text"
                  placeholder="Texto do link"
                  value={link.texto}
                  onChange={(e) => setLink(i, j, "texto", e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Endereço do link (https://...)"
                  value={link.url}
                  onChange={(e) => setLink(i, j, "url", e.target.value)}
                />
                <button type="button" className="outline" onClick={() => removerLink(i, j)}>
                  ✕
                </button>
              </div>
            ))}

            <button
              type="button"
              className="outline"
              onClick={() => adicionarLink(i)}
            >
              + link neste bloco
            </button>
          </div>
        ))}

        <button type="button" className="outline" onClick={adicionarBloco}>
          + Adicionar bloco
        </button>

        {totalImagens > 0 && (
          <>
            <h2>Imagens de todas as seções</h2>

            <p className="admin-ajuda">
              Atalho igual ao das fotos de apoio dos territórios: aqui você libera ou
              bloqueia de uma vez <b>todas as imagens desta página</b>, em todas as
              seções. Continua valendo a regra desta aba — nada muda no app antes de
              clicar em <b>Salvar</b>. Para mexer em uma imagem só, use o botão
              liberar/bloquear dentro da seção dela.
            </p>

            <div className="admin-fotos-estado">
              <b>Situação:</b> {imagensAparecendo} de {totalImagens} imagem(ns) aparecendo
              no app
              <button
                type="button"
                className={imagensAparecendo < totalImagens ? "btn" : "outline"}
                onClick={() => definirVisibilidadeTodas(true)}
              >
                Liberar todas
              </button>
              <button
                type="button"
                className={imagensAparecendo > 0 ? "btn" : "outline"}
                onClick={() => definirVisibilidadeTodas(false)}
              >
                Bloquear todas
              </button>
            </div>
          </>
        )}

        <h2>Caixa final (link)</h2>

        <p className="admin-ajuda">
          A caixa que aparece depois dos blocos — usada para o mapa (Vitória) e para o TCC
          (Conceito). Deixe o endereço vazio para não aparecer.
        </p>

        <input
          type="text"
          placeholder="Texto antes do link (ex: Mapa do centro histórico:)"
          value={pagina.rodapeTexto}
          onChange={(e) => setCampo("rodapeTexto", e.target.value)}
        />

        <input
          type="text"
          placeholder="Texto do link (ex: Abrir no mapa)"
          value={pagina.rodapeLinkTexto}
          onChange={(e) => setCampo("rodapeLinkTexto", e.target.value)}
        />

        <input
          type="text"
          placeholder="Endereço (https://...)"
          value={pagina.rodapeUrl}
          onChange={(e) => setCampo("rodapeUrl", e.target.value)}
        />

        <h2>Botões do fim da página</h2>

        {pagina.botoes.map((botao, i) => (
          <div key={i} className="admin-linha">
            <input
              type="text"
              placeholder="Texto do botão"
              value={botao.texto}
              onChange={(e) => setBotao(i, "texto", e.target.value)}
            />
            <input
              type="text"
              placeholder="/roteiros, /contato ou https://..."
              value={botao.url}
              onChange={(e) => setBotao(i, "url", e.target.value)}
            />
            <select
              value={botao.estilo}
              onChange={(e) => setBotao(i, "estilo", e.target.value)}
            >
              <option value="btn">destacado</option>
              <option value="outline">contorno</option>
            </select>
            <button type="button" className="outline" onClick={() => moverBotao(i, -1)}>
              ↑
            </button>
            <button type="button" className="outline" onClick={() => moverBotao(i, 1)}>
              ↓
            </button>
            <button type="button" className="outline" onClick={() => removerBotao(i)}>
              ✕
            </button>
          </div>
        ))}

        <button type="button" className="outline" onClick={adicionarBotao}>
          + Adicionar botão
        </button>

        <div className="admin-form-botoes">
          <button type="submit" className="btn" disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar"}
          </button>

          <a className="outline" href={definicao.caminho} target="_blank" rel="noreferrer">
            ver a página
          </a>

          <button
            type="button"
            className="outline"
            onClick={() => {
              if (
                window.confirm(
                  "Voltar ao texto original desta página? Suas alterações não salvas serão perdidas."
                )
              ) {
                setPagina(definicao.padrao);
                setPendente(true);
                setOk('Texto original carregado. Clique em "Salvar" para publicar.');
              }
            }}
          >
            restaurar texto original
          </button>
        </div>
      </form>

      {/* o formulário "Fale com a autoria" é editado junto da página Contato */}
      {definicao.chave === "pagina_contato" && <FormularioContatoAdmin />}
    </div>
  );
}
