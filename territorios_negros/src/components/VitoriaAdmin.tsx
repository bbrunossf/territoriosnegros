// VitoriaAdmin.tsx — edição do texto da página "A cidade de Vitória"
import "../styles.css";

import { useEffect, useState } from "react";
import { salvarConfig } from "../data/api";
import { useTerritorios } from "../context/useTerritorios";
import {
  VITORIA_PADRAO,
  normalizarPagina,
  type BlocoConteudo,
  type PaginaConteudo,
} from "../data/conteudoPadrao";
import { formatarDataHoraBR } from "../utils/data";

/** uma linha por item da lista */
function itensParaTexto(itens: string[]): string {
  return itens.join("\n");
}

function textoParaItens(txt: string): string[] {
  return txt
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function VitoriaAdmin() {
  const { config, recarregar } = useTerritorios();

  const [pagina, setPagina] = useState<PaginaConteudo>(VITORIA_PADRAO);
  const [pendente, setPendente] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [ok, setOk] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    (async () => {
      await Promise.resolve();
      if (!ativo) return;

      setPagina(normalizarPagina(config.pagina_vitoria, VITORIA_PADRAO));
    })();

    return () => {
      ativo = false;
    };
  }, [config]);

  // ── edição ──────────────────────────────────────────────

  function setCampo(campo: keyof PaginaConteudo, valor: string) {
    setPagina((p) => ({ ...p, [campo]: valor }));
    setPendente(true);
  }

  function setBloco(indice: number, campo: keyof BlocoConteudo, valor: string) {
    setPagina((p) => ({
      ...p,
      blocos: p.blocos.map((b, i) => {
        if (i !== indice) return b;

        if (campo === "itens") {
          return { ...b, itens: textoParaItens(valor) };
        }

        return { ...b, [campo]: valor };
      }),
    }));
    setPendente(true);
  }

  function moverBloco(indice: number, delta: number) {
    const destino = indice + delta;
    if (destino < 0 || destino >= pagina.blocos.length) return;

    const blocos = [...pagina.blocos];
    [blocos[indice], blocos[destino]] = [blocos[destino], blocos[indice]];

    setPagina((p) => ({ ...p, blocos }));
    setPendente(true);
  }

  function removerBloco(indice: number) {
    const bloco = pagina.blocos[indice];
    const nome = bloco?.titulo || `bloco ${indice + 1}`;

    if (!window.confirm(`Remover o bloco "${nome}"?`)) return;

    setPagina((p) => ({ ...p, blocos: p.blocos.filter((_, i) => i !== indice) }));
    setPendente(true);
  }

  function adicionarBloco() {
    setPagina((p) => ({
      ...p,
      blocos: [...p.blocos, { icone: "•", titulo: "", texto: "", itens: [] }],
    }));
    setPendente(true);
  }

  // ── salvar ──────────────────────────────────────────────

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setOk("");
    setErro("");
    setSalvando(true);

    try {
      await salvarConfig("pagina_vitoria", pagina);
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
      <h1>Página Vitória</h1>

      <p className="admin-ajuda">
        Este é o texto da aba <b>Vitória</b> do app. O que você escrever aqui substitui o
        texto original assim que você clicar em <b>Salvar</b>. Para dar destaque, use{" "}
        <b>**duas estrelas**</b> em volta da palavra (fica em negrito) ou{" "}
        <b>*uma estrela*</b> (fica em itálico). Em “Texto do bloco”, deixe uma{" "}
        <b>linha em branco</b> entre parágrafos.
      </p>

      {ok && <p className="admin-ok">{ok}</p>}
      {erro && <p className="admin-erro">{erro}</p>}

      <form className="admin-form" onSubmit={salvar}>
        <h2>
          Conteúdo da página
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
            placeholder="Subtítulo (ex: Espírito Santo - ES)"
            value={pagina.subtitulo}
            onChange={(e) => setCampo("subtitulo", e.target.value)}
          />
        </div>

        <label className="admin-campo">
          Bloco destacado de abertura (aparece na caixa do topo)
          <textarea
            value={pagina.destaque}
            onChange={(e) => setCampo("destaque", e.target.value)}
            rows={5}
          />
        </label>

        <h2>Blocos da página</h2>

        <p className="admin-ajuda">
          Cada bloco é uma seção com ícone e título. “Textos” viram parágrafos e “Lista” vira
          a lista com travessão (um item por linha). Para acrescentar informações novas,
          use <b>Adicionar bloco</b> no fim da lista.
        </p>

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

              <button
                type="button"
                className="outline"
                onClick={() => moverBloco(i, -1)}
                title="Subir"
              >
                ↑
              </button>
              <button
                type="button"
                className="outline"
                onClick={() => moverBloco(i, 1)}
                title="Descer"
              >
                ↓
              </button>
              <button
                type="button"
                className="outline"
                onClick={() => removerBloco(i)}
                title="Remover bloco"
              >
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
          </div>
        ))}

        <button type="button" className="outline" onClick={adicionarBloco}>
          + Adicionar bloco
        </button>

        <h2>Mapa e botão do fim da página</h2>

        <input
          type="text"
          placeholder="Texto antes do link do mapa (ex: Mapa do centro histórico:)"
          value={pagina.mapaTexto}
          onChange={(e) => setCampo("mapaTexto", e.target.value)}
        />

        <input
          type="text"
          placeholder="Link do mapa (OpenStreetMap, Google Maps...)"
          value={pagina.mapaUrl}
          onChange={(e) => setCampo("mapaUrl", e.target.value)}
        />

        <input
          type="text"
          placeholder="Texto do botão (ex: Ir para os roteiros)"
          value={pagina.botaoTexto}
          onChange={(e) => setCampo("botaoTexto", e.target.value)}
        />

        <div className="admin-form-botoes">
          <button type="submit" className="btn" disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar"}
          </button>

          <a className="outline" href="/vitoria" target="_blank" rel="noreferrer">
            ver a página
          </a>

          <button
            type="button"
            className="outline"
            onClick={() => {
              if (
                window.confirm(
                  "Voltar ao texto original da página? Suas alterações não salvas serão perdidas."
                )
              ) {
                setPagina(VITORIA_PADRAO);
                setPendente(true);
                setOk('Texto original carregado no formulário. Clique em "Salvar" para publicar.');
              }
            }}
          >
            restaurar texto original
          </button>
        </div>
      </form>
    </div>
  );
}
