// src/components/PersonalidadesAdmin.tsx — aba "Personalidades Negras" do painel.
//
// Adicionar, editar, visualizar, salvar como rascunho, publicar, despublicar e
// excluir cadastros de personalidades negras (pedido da autoria, 02/10/2026).
//
// Regras que a tela garante:
//   · rascunho NÃO vai ao público (a listagem pública filtra);
//   · fotos, vídeos, referências e vínculos ficam no cadastro — reabrir traz tudo;
//   · avisa antes de sair com alterações não salvas e pede confirmação para excluir;
//   · vínculo com território é um só dado: aparece na pessoa e no território.
import "../styles/personalidades.css";

import { useEffect, useState } from "react";

import { salvarConfig, uploadFoto } from "../data/api";
import { useTerritorios } from "../context/useTerritorios";
import EditorDeMarcos from "./EditorDeMarcos";
import { chaveDaPersonalidade } from "../data/marcos";
import {
  CHAVE_PERSONALIDADES,
  NATUREZAS,
  TIPOS_DE_FONTE,
  blocoVazio,
  contarPorSituacao,
  fonteVazia,
  lerPersonalidades,
  marcoVazio,
  novoId,
  partesPreenchidas,
  personalidadeVazia,
  slugDe,
  type BlocoBiografia,
  type FontePesquisa,
  type FotoPersonalidade,
  type MarcoLinhaTempo,
  type Personalidade,
  type VideoPersonalidade,
} from "../data/personalidades";
import { PersonalidadesPublicaveis } from "./PersonalidadesAdminAjuda";
import PersonalidadePagina from "./PersonalidadePagina";

/** Move um item de uma lista (↑ sobe, ↓ desce). */
function moverItem<T>(lista: T[], indice: number, delta: number): T[] {
  const destino = indice + delta;

  if (indice < 0 || destino < 0 || destino >= lista.length) return lista;

  const copia = [...lista];
  [copia[indice], copia[destino]] = [copia[destino], copia[indice]];

  return copia;
}

/** Cópia independente do cadastro (mexer no rascunho não mexe na lista). */
function clonar(p: Personalidade): Personalidade {
  return JSON.parse(JSON.stringify(p)) as Personalidade;
}

/** Como a pessoa aparece na lista do painel. */
function resumoDeLinha(p: Personalidade): string {
  const partes = [
    p.territorios.length > 0 ? `${p.territorios.length} território(s)` : "sem território",
    p.galeria.length + (p.fotoCapa ? 1 : 0) > 0 ? "com foto" : "sem foto",
    p.fontes.length > 0 ? `${p.fontes.length} fonte(s)` : "sem fonte",
  ];

  return partes.join(" · ");
}

export default function PersonalidadesAdmin() {
  const { config, recarregar, territorios } = useTerritorios();

  const [lista, setLista] = useState<Personalidade[]>(() =>
    lerPersonalidades(config[CHAVE_PERSONALIDADES])
  );
  const [editando, setEditando] = useState<Personalidade | null>(null);
  const [pendente, setPendente] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [enviando, setEnviando] = useState("");
  const [busca, setBusca] = useState("");
  const [previa, setPrevia] = useState(false);
  const [ok, setOk] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    (async () => {
      await Promise.resolve();
      if (!ativo) return;

      setLista(lerPersonalidades(config[CHAVE_PERSONALIDADES]));
    })();

    return () => {
      ativo = false;
    };
  }, [config]);

  // avisa antes de sair (fechar a aba, recarregar) com alterações não salvas
  useEffect(() => {
    if (!pendente) return;

    const aviso = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", aviso);
    return () => window.removeEventListener("beforeunload", aviso);
  }, [pendente]);

  /** A lista de territórios do app, em ordem, para os seletores. */
  const territoriosDoApp = Object.values(territorios)
    .map((t) => ({ id: t.id, nome: t.nome }))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

  const contagem = contarPorSituacao(lista);
  const filtradas = lista.filter((p) =>
    busca.trim() === "" ? true : p.nome.toLowerCase().includes(busca.trim().toLowerCase())
  );

  // ── abrir / fechar cadastro ──────────────────────────────────────────

  function podeDescartar(): boolean {
    if (!pendente) return true;

    return window.confirm(
      "Você tem alterações não salvas neste cadastro. Continuar e descartar essas alterações?"
    );
  }

  function abrir(p: Personalidade) {
    if (!podeDescartar()) return;

    setEditando(clonar(p));
    setPendente(false);
    setPrevia(false);
    setOk("");
    setErro("");
  }

  function fechar() {
    if (!podeDescartar()) return;

    setEditando(null);
    setPendente(false);
    setPrevia(false);
  }

  function nova() {
    if (!podeDescartar()) return;

    setEditando(personalidadeVazia());
    setPendente(true);
    setPrevia(false);
    setOk("Cadastro novo. Preencha e salve — por padrão ele fica como rascunho.");
  }

  // ── edição dos campos ────────────────────────────────────────────────

  function mudar<K extends keyof Personalidade>(campo: K, valor: Personalidade[K]) {
    setEditando((p) => (p ? { ...p, [campo]: valor } : p));
    setPendente(true);
  }

  function mudarBloco(indice: number, campo: keyof BlocoBiografia, valor: string) {
    if (!editando) return;

    mudar(
      "blocos",
      editando.blocos.map((b, i) => (i === indice ? { ...b, [campo]: valor } : b))
    );
  }

  function mudarMarco(indice: number, campo: keyof MarcoLinhaTempo, valor: string) {
    if (!editando) return;

    mudar(
      "linhaDoTempo",
      editando.linhaDoTempo.map((m, i) => (i === indice ? { ...m, [campo]: valor } : m))
    );
  }

  function mudarFonte(indice: number, campo: keyof FontePesquisa, valor: string) {
    if (!editando) return;

    mudar(
      "fontes",
      editando.fontes.map((f, i) => (i === indice ? { ...f, [campo]: valor } : f))
    );
  }

  function mudarVideo(indice: number, campo: keyof VideoPersonalidade, valor: string) {
    if (!editando) return;

    mudar(
      "videos",
      editando.videos.map((v, i) => (i === indice ? { ...v, [campo]: valor } : v))
    );
  }

  function mudarFoto(indice: number, campo: keyof FotoPersonalidade, valor: string | boolean) {
    if (!editando) return;

    mudar(
      "galeria",
      editando.galeria.map((f, i) => (i === indice ? { ...f, [campo]: valor } : f))
    );
  }

  function mudarCapa(campo: keyof FotoPersonalidade, valor: string | boolean) {
    setEditando((p) => (p && p.fotoCapa ? { ...p, fotoCapa: { ...p.fotoCapa, [campo]: valor } } : p));
    setPendente(true);
  }

  // ── fotos: envio, troca, remoção, ordem ──────────────────────────────

  async function enviarDoAparelho(arquivo: File | undefined, destino: "capa" | "galeria") {
    if (!arquivo || !editando) return;

    setErro("");
    setEnviando(destino === "capa" ? "Enviando a foto de capa..." : "Enviando as fotos...");

    try {
      const url = await uploadFoto(editando.id || novoId(), arquivo, "personalidades");
      const foto: FotoPersonalidade = {
        url,
        legenda: arquivo.name,
        credito: "",
        fonte: "",
        alt: "",
        visivel: true,
      };

      if (destino === "capa") {
        setEditando((p) => (p ? { ...p, fotoCapa: foto } : p));
      } else {
        setEditando((p) => (p ? { ...p, galeria: [...p.galeria, foto] } : p));
      }

      setPendente(true);
    } catch (err) {
      console.error(err);
      setErro(err instanceof Error ? err.message : "Falha ao enviar a foto.");
    } finally {
      setEnviando("");
    }
  }

  // ── vínculos com territórios ─────────────────────────────────────────

  function alternarTerritorio(territorioId: string) {
    if (!editando) return;

    const existe = editando.territorios.some((v) => v.territorioId === territorioId);

    mudar(
      "territorios",
      existe
        ? editando.territorios.filter((v) => v.territorioId !== territorioId)
        : [...editando.territorios, { territorioId, relacao: "" }]
    );
  }

  function mudarRelacao(territorioId: string, relacao: string) {
    if (!editando) return;

    mudar(
      "territorios",
      editando.territorios.map((v) => (v.territorioId === territorioId ? { ...v, relacao } : v))
    );
  }

  // ── salvar, publicar, despublicar, excluir ───────────────────────────

  async function gravar(novaLista: Personalidade[], aviso: string) {
    setOk("");
    setErro("");
    setSalvando(true);

    try {
      await salvarConfig(CHAVE_PERSONALIDADES, novaLista);
      await recarregar();
      setLista(novaLista);
      setOk(aviso);
    } catch (err) {
      console.error(err);
      setErro(err instanceof Error ? err.message : "Falha ao salvar.");
    } finally {
      setSalvando(false);
    }
  }

  /** Fecha o cadastro com o nome já ajustado e o endereço permanente definido. */
  function prepararParaSalvar(p: Personalidade): Personalidade {
    const nome = p.nome.trim();

    return {
      ...p,
      nome,
      slug: p.slug.trim() || slugDe(nome, p.id),
    };
  }

  async function salvar() {
    if (!editando) return;

    const nome = editando.nome.trim();

    if (!nome) {
      setErro("Dê um nome à personalidade antes de salvar.");
      setOk("");
      return;
    }

    const cadastro = prepararParaSalvar(editando);
    const existe = lista.some((p) => p.id === cadastro.id);

    const novaLista = existe
      ? lista.map((p) => (p.id === cadastro.id ? cadastro : p))
      : [...lista, { ...cadastro, ordem: lista.length }];

    await gravar(
      novaLista,
      cadastro.situacao === "publicada"
        ? `“${cadastro.nome}” salva e publicada — já aparece no app.`
        : `“${cadastro.nome}” salva como rascunho — só você vê, não aparece no app.`
    );

    setEditando(cadastro);
    setPendente(false);

    // avisa o que ainda não foi preenchido (sem impedir)
    const partes = partesPreenchidas(cadastro);
    setOk(
      `${cadastro.situacao === "publicada" ? "Publicada" : "Rascunho salvo"}: “${cadastro.nome}” · preenchido: ${
        partes.length ? partes.join(", ") : "nada ainda"
      }.`
    );
  }

  async function mudarSituacao(p: Personalidade, situacao: "rascunho" | "publicada") {
    const cadastro = { ...prepararParaSalvar(p), situacao };

    await gravar(
      lista.map((item) => (item.id === cadastro.id ? cadastro : item)),
      situacao === "publicada"
        ? `“${cadastro.nome}” publicada.`
        : `“${cadastro.nome}” voltou a rascunho — saiu do app.`
    );

    setEditando((atual) => (atual && atual.id === cadastro.id ? cadastro : atual));
  }

  async function excluir(p: Personalidade) {
    if (
      !window.confirm(
        `Excluir “${p.nome}” definitivamente? Isso apaga a página dela e os vínculos com territórios. Não há como desfazer.`
      )
    ) {
      return;
    }

    await gravar(
      lista.filter((item) => item.id !== p.id),
      `“${p.nome}” foi excluída.`
    );

    if (editando?.id === p.id) {
      setEditando(null);
      setPendente(false);
      setPrevia(false);
    }
  }

  // ── tela ─────────────────────────────────────────────────────────────

  if (editando) {
    return (
      <div className="personalidades-admin">
        <h1>Personalidades Negras</h1>

        <p className="admin-ajuda">
          Editando <b>{editando.nome.trim() || "(sem nome ainda)"}</b> ·{" "}
          {editando.situacao === "publicada" ? "publicada" : "rascunho"}
          {editando.slug.trim() && (
            <>
              {" "}
              · página em <b>/personalidade/{editando.slug}</b>
            </>
          )}
        </p>

        {ok && <p className="admin-ok">{ok}</p>}
        {erro && <p className="admin-erro">{erro}</p>}
        {enviando && <p className="admin-ajuda">{enviando}</p>}

        <div className="admin-form-botoes">
          <button type="button" className="btn" onClick={salvar} disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar"}
          </button>

          <button type="button" className="outline" onClick={() => setPrevia((v) => !v)}>
            {previa ? "Voltar a editar" : "Visualizar a página"}
          </button>

          <button type="button" className="outline" onClick={fechar}>
            Cancelar e voltar à lista
          </button>
        </div>

        {previa ? (
          <div className="admin-previa">
            <p className="admin-ajuda">
              É isto que o visitante vê{editando.situacao === "rascunho" ? " quando você publicar" : ""}.
            </p>

            <PersonalidadePagina dados={editando} />
          </div>
        ) : (
          <form className="admin-form" onSubmit={(e) => e.preventDefault()}>
            <h2>Identificação</h2>

            <label className="admin-campo">
              <b>Nome</b>
              <span className="admin-campo-dica">Como a pessoa é conhecida hoje. Obrigatório.</span>
              <input
                type="text"
                value={editando.nome}
                onChange={(e) => mudar("nome", e.target.value)}
                placeholder="Ex: Maria Ortiz"
              />
            </label>

            <label className="admin-campo">
              <b>Outros nomes pelos quais é conhecida</b>
              <input
                type="text"
                value={editando.outrosNomes}
                onChange={(e) => mudar("outrosNomes", e.target.value)}
                placeholder="Ex: apelidos, nome de casada, grafias antigas"
              />
            </label>

            <label className="admin-campo">
              <b>Breve apresentação</b>
              <span className="admin-campo-dica">
                Dois ou três períodos: é o que aparece no cartão da listagem e no destaque da
                página dela.
              </span>
              <textarea
                rows={4}
                value={editando.apresentacao}
                onChange={(e) => mudar("apresentacao", e.target.value)}
              />
            </label>

            <h3 className="admin-form-secao">Vida</h3>

            <p className="admin-ajuda">
              Todos opcionais — e podem ser aproximados ou por período: “cerca de 1870”, “início do
              século XX”. Deixe em branco quando não houver informação.
            </p>

            <div className="admin-linha">
              <label className="admin-campo admin-campo-compacto">
                <b>Nascimento</b>
                <input
                  type="text"
                  value={editando.nascimento}
                  onChange={(e) => mudar("nascimento", e.target.value)}
                  placeholder="Ex: cerca de 1870"
                />
              </label>

              <label className="admin-campo admin-campo-compacto">
                <b>Local de nascimento</b>
                <input
                  type="text"
                  value={editando.localNascimento}
                  onChange={(e) => mudar("localNascimento", e.target.value)}
                  placeholder="Ex: Vitória, ES"
                />
              </label>
            </div>

            <div className="admin-linha">
              <label className="admin-campo admin-campo-compacto">
                <b>Falecimento</b>
                <input
                  type="text"
                  value={editando.falecimento}
                  onChange={(e) => mudar("falecimento", e.target.value)}
                  placeholder="Ex: 1940"
                />
              </label>

              <label className="admin-campo admin-campo-compacto">
                <b>Local de falecimento</b>
                <input
                  type="text"
                  value={editando.localFalecimento}
                  onChange={(e) => mudar("localFalecimento", e.target.value)}
                />
              </label>
            </div>

            <label className="admin-campo">
              <b>Endereço permanente da página</b>
              <span className="admin-campo-dica">
                Endereço fixo: <b>/personalidade/{editando.slug || slugDe(editando.nome || "personalidade", editando.id)}</b>.
                Em branco, o app monta a partir do nome e não muda mais depois.
              </span>
              <input
                type="text"
                value={editando.slug}
                onChange={(e) => mudar("slug", e.target.value)}
                placeholder={slugDe(editando.nome || "", editando.id)}
              />
            </label>

            <h2>Biografia</h2>

            <label className="admin-campo">
              <b>Texto da biografia</b>
              <span className="admin-campo-dica">
                Formatação básica: <b>**negrito**</b> e <b>*itálico*</b>. Linha em branco separa
                parágrafos.
              </span>
              <textarea rows={8} value={editando.biografia} onChange={(e) => mudar("biografia", e.target.value)} />
            </label>

            <h3 className="admin-form-secao">Blocos de conteúdo</h3>

            <p className="admin-ajuda">
              Para separar a biografia por assuntos (trajetória, obra, memória…). Cada bloco tem
              título e texto, e pode ser reordenado com ↑ ↓.
            </p>

            {editando.blocos.map((bloco, i) => (
              <div className="admin-bloco" key={bloco.id}>
                <div className="admin-bloco-topo">
                  <span className="admin-bloco-num">bloco {i + 1}</span>

                  <label className="admin-campo admin-campo-compacto">
                    <b>Título</b>
                    <input
                      type="text"
                      value={bloco.titulo}
                      onChange={(e) => mudarBloco(i, "titulo", e.target.value)}
                    />
                  </label>

                  <label className="admin-campo admin-campo-compacto">
                    <b>Em que pé está a informação</b>
                    <select
                      value={bloco.natureza ?? "documentada"}
                      onChange={(e) => mudarBloco(i, "natureza", e.target.value)}
                    >
                      {NATUREZAS.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.rotulo}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button
                    type="button"
                    className="outline"
                    onClick={() => mudar("blocos", moverItem(editando.blocos, i, -1))}
                  >
                    ↑
                  </button>

                  <button
                    type="button"
                    className="outline"
                    onClick={() => mudar("blocos", moverItem(editando.blocos, i, 1))}
                  >
                    ↓
                  </button>

                  <button
                    type="button"
                    className="outline"
                    onClick={() =>
                      mudar(
                        "blocos",
                        editando.blocos.filter((_, j) => j !== i)
                      )
                    }
                  >
                    ✕
                  </button>
                </div>

                <label className="admin-campo">
                  <b>Texto do bloco</b>
                  <textarea
                    rows={5}
                    value={bloco.texto}
                    onChange={(e) => mudarBloco(i, "texto", e.target.value)}
                  />
                </label>
              </div>
            ))}

            <button type="button" className="outline" onClick={() => mudar("blocos", [...editando.blocos, blocoVazio()])}>
              + adicionar bloco
            </button>

            <h2>Linha do tempo</h2>

            <label className="admin-campo">
              <b>Texto de apoio (opcional)</b>
              <span className="admin-campo-dica">
                Só aparece se houver acontecimentos cadastrados.
              </span>
              <textarea rows={3} value={editando.biografia} onChange={(e) => mudar("biografia", e.target.value)} />
            </label>

            {editando.linhaDoTempo.map((marco, i) => (
              <div className="admin-bloco" key={marco.id}>
                <div className="admin-linha-tempo">
                  <label className="admin-campo admin-campo-compacto">
                    <b>Data ou período</b>
                    <input
                      type="text"
                      value={marco.data}
                      onChange={(e) => mudarMarco(i, "data", e.target.value)}
                      placeholder="Ex: 1876"
                    />
                  </label>

                  <label className="admin-campo admin-campo-compacto">
                    <b>Título</b>
                    <input
                      type="text"
                      value={marco.titulo}
                      onChange={(e) => mudarMarco(i, "titulo", e.target.value)}
                    />
                  </label>

                  <label className="admin-campo admin-campo-compacto">
                    <b>Descrição</b>
                    <input
                      type="text"
                      value={marco.descricao}
                      onChange={(e) => mudarMarco(i, "descricao", e.target.value)}
                    />
                  </label>

                  <button
                    type="button"
                    className="outline"
                    onClick={() => mudar("linhaDoTempo", moverItem(editando.linhaDoTempo, i, -1))}
                  >
                    ↑
                  </button>

                  <button
                    type="button"
                    className="outline"
                    onClick={() =>
                      mudar(
                        "linhaDoTempo",
                        editando.linhaDoTempo.filter((_, j) => j !== i)
                      )
                    }
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="outline"
              onClick={() => mudar("linhaDoTempo", [...editando.linhaDoTempo, marcoVazio()])}
            >
              + adicionar acontecimento
            </button>

            <h2>Fotos</h2>

            <p className="admin-ajuda">
              A foto de capa aparece no cartão e no alto da página. Sem foto, o app mostra a
              inicial do nome numa moldura — nunca um retrato inventado.
            </p>

            <div className="admin-form-upload">
              <label>Foto de capa (uma):</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  enviarDoAparelho(e.target.files?.[0] ?? undefined, "capa");
                  e.target.value = "";
                }}
              />

              {editando.fotoCapa?.url && (
                <p>
                  <button type="button" className="outline" onClick={() => mudar("fotoCapa", null)}>
                    remover a foto de capa
                  </button>
                </p>
              )}
            </div>

            {editando.fotoCapa?.url && (
              <div className="admin-galeria">
                <div className="admin-galeria-item">
                  <span className="admin-galeria-principal">capa</span>
                  <img src={editando.fotoCapa.url} alt="" />

                  {(["legenda", "credito", "fonte", "alt"] as const).map((campo) => (
                    <label className="admin-galeria-campo" key={campo}>
                      <span>
                        {campo === "legenda"
                          ? "Legenda"
                          : campo === "credito"
                            ? "Crédito/autoria"
                            : campo === "fonte"
                              ? "Fonte"
                              : "Texto alternativo (leitor de tela)"}
                      </span>
                      <input
                        type="text"
                        value={editando.fotoCapa?.[campo] ?? ""}
                        onChange={(e) => mudarCapa(campo, e.target.value)}
                      />
                    </label>
                  ))}

                  <label className="admin-galeria-campo">
                    <span>Situação</span>
                    <select
                      value={editando.fotoCapa.visivel === false ? "oculta" : "visivel"}
                      onChange={(e) => mudarCapa("visivel", e.target.value === "visivel")}
                    >
                      <option value="visivel">aparecendo no app</option>
                      <option value="oculta">oculta para os visitantes</option>
                    </select>
                  </label>
                </div>
              </div>
            )}

            <div className="admin-form-upload">
              <label>Galeria (pode enviar várias de uma vez):</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={async (e) => {
                  const arquivos = Array.from(e.target.files ?? []);
                  for (const arquivo of arquivos) {
                    await enviarDoAparelho(arquivo, "galeria");
                  }
                  e.target.value = "";
                }}
              />
            </div>

            {editando.galeria.map((foto, i) => (
              <div className="admin-galeria">
                <div className="admin-galeria-item" key={`${foto.url}-${i}`}>
                  <span className={foto.visivel === false ? "admin-galeria-apoio" : "admin-galeria-principal"}>
                    {foto.visivel === false ? "oculta para os visitantes" : "aparecendo no app"}
                  </span>

                  <img src={foto.url} alt="" />

                  {(["legenda", "credito", "fonte", "alt"] as const).map((campo) => (
                    <label className="admin-galeria-campo" key={campo}>
                      <span>
                        {campo === "legenda"
                          ? "Legenda"
                          : campo === "credito"
                            ? "Crédito/autoria"
                            : campo === "fonte"
                              ? "Fonte"
                              : "Texto alternativo"}
                      </span>
                      <input
                        type="text"
                        value={foto[campo] ?? ""}
                        onChange={(e) => mudarFoto(i, campo, e.target.value)}
                      />
                    </label>
                  ))}

                  <div className="admin-form-botoes">
                    <button
                      type="button"
                      className="outline"
                      onClick={() => mudar("galeria", moverItem(editando.galeria, i, -1))}
                    >
                      ↑
                    </button>

                    <button
                      type="button"
                      className="outline"
                      onClick={() => mudar("galeria", moverItem(editando.galeria, i, 1))}
                    >
                      ↓
                    </button>

                    <button
                      type="button"
                      className="outline"
                      onClick={() => mudar("galeria", editando.galeria.filter((_, j) => j !== i))}
                    >
                      remover
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <h2>Vídeos</h2>

            <p className="admin-ajuda">
              Cole o link (YouTube, Vimeo, Google Drive ou arquivo enviado). O app escolhe o player
              sozinho; quando a plataforma não permite incorporar, ele mostra o botão de abrir.
            </p>

            {editando.videos.map((video, i) => (
              <div className="admin-bloco" key={video.id}>
                <label className="admin-campo">
                  <b>Link do vídeo</b>
                  <input
                    type="text"
                    value={video.url}
                    onChange={(e) => mudarVideo(i, "url", e.target.value)}
                    placeholder="https://..."
                  />
                </label>

                <div className="admin-linha">
                  <label className="admin-campo admin-campo-compacto">
                    <b>Título</b>
                    <input type="text" value={video.titulo ?? ""} onChange={(e) => mudarVideo(i, "titulo", e.target.value)} />
                  </label>

                  <label className="admin-campo admin-campo-compacto">
                    <b>Crédito/fonte</b>
                    <input
                      type="text"
                      value={video.credito ?? ""}
                      onChange={(e) => mudarVideo(i, "credito", e.target.value)}
                    />
                  </label>
                </div>

                <label className="admin-campo">
                  <b>Descrição</b>
                  <textarea
                    rows={2}
                    value={video.descricao ?? ""}
                    onChange={(e) => mudarVideo(i, "descricao", e.target.value)}
                  />
                </label>

                <button
                  type="button"
                  className="outline"
                  onClick={() => mudar("videos", editando.videos.filter((_, j) => j !== i))}
                >
                  remover este vídeo
                </button>
              </div>
            ))}

            <button
              type="button"
              className="outline"
              onClick={() =>
                mudar("videos", [
                  ...editando.videos,
                  { id: novoId("vid"), url: "", titulo: "", descricao: "", credito: "" },
                ])
              }
            >
              + adicionar vídeo
            </button>

            <h2>Fontes e pesquisa</h2>

            <p className="admin-ajuda">
              Livros, artigos, documentos, sites, acervos e relatos orais. Referência sem link é
              bem-vinda — o app mostra só o que você escrever.
            </p>

            {editando.fontes.map((fonte, i) => (
              <div className="admin-bloco" key={fonte.id}>
                <div className="admin-linha">
                  <label className="admin-campo admin-campo-compacto">
                    <b>Tipo</b>
                    <select value={fonte.tipo} onChange={(e) => mudarFonte(i, "tipo", e.target.value)}>
                      {TIPOS_DE_FONTE.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.rotulo}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="admin-campo admin-campo-compacto">
                    <b>Título</b>
                    <input type="text" value={fonte.titulo} onChange={(e) => mudarFonte(i, "titulo", e.target.value)} />
                  </label>
                </div>

                <div className="admin-linha">
                  <label className="admin-campo admin-campo-compacto">
                    <b>Autor ou instituição</b>
                    <input type="text" value={fonte.autor ?? ""} onChange={(e) => mudarFonte(i, "autor", e.target.value)} />
                  </label>

                  <label className="admin-campo admin-campo-compacto">
                    <b>Data</b>
                    <input type="text" value={fonte.data ?? ""} onChange={(e) => mudarFonte(i, "data", e.target.value)} placeholder="Ex: 1926" />
                  </label>
                </div>

                <label className="admin-campo">
                  <b>Endereço (opcional)</b>
                  <input
                    type="text"
                    value={fonte.url ?? ""}
                    onChange={(e) => mudarFonte(i, "url", e.target.value)}
                    placeholder="https://... (deixe vazio para referência sem link)"
                  />
                </label>

                <label className="admin-campo">
                  <b>Observações</b>
                  <textarea
                    rows={2}
                    value={fonte.observacoes ?? ""}
                    onChange={(e) => mudarFonte(i, "observacoes", e.target.value)}
                  />
                </label>

                <button
                  type="button"
                  className="outline"
                  onClick={() => mudar("fontes", editando.fontes.filter((_, j) => j !== i))}
                >
                  remover esta referência
                </button>
              </div>
            ))}

            <button type="button" className="outline" onClick={() => mudar("fontes", [...editando.fontes, fonteVazia()])}>
              + adicionar referência
            </button>

            <label className="admin-campo">
              <b>Links (opcional)</b>
              <span className="admin-campo-dica">
                Um link por linha. Aparecem numa lista no fim da página, em “Links”. Aceita
                quantos você quiser: TCC, dossiê, inventário, matéria, acervo.
              </span>
              <textarea
                rows={4}
                value={editando.materialCompleto}
                onChange={(e) => mudar("materialCompleto", e.target.value)}
                placeholder={"https://exemplo.org/tcc.pdf\nhttps://exemplo.org/materia"}
              />
            </label>

            <h2>Territórios vinculados</h2>

            <p className="admin-ajuda">
              Marque um ou mais territórios do app e explique a relação (“morou aqui”, “nome da rua
              é homenagem”, “atuou na escola”). O mesmo vínculo aparece na página do território —
              tirar aqui, sai lá.
            </p>

            {territoriosDoApp.length === 0 && (
              <p className="admin-ajuda">Nenhum território cadastrado no app ainda.</p>
            )}

            {territoriosDoApp.map((t) => {
              const vinculo = editando.territorios.find((v) => v.territorioId === t.id);

              return (
                <div className="admin-vinculo" key={t.id}>
                  <label className="admin-campo admin-campo-compacto">
                    <span>
                      <input
                        type="checkbox"
                        checked={!!vinculo}
                        onChange={() => alternarTerritorio(t.id)}
                      />{" "}
                      <b>{t.nome}</b>
                    </span>
                  </label>

                  {vinculo && (
                    <label className="admin-campo">
                      <b>A relação com este território</b>
                      <input
                        type="text"
                        value={vinculo.relacao}
                        onChange={(e) => mudarRelacao(t.id, e.target.value)}
                        placeholder="Ex: homenagem no nome da rua; local de moradia"
                      />
                    </label>
                  )}
                </div>
              );
            })}

            <h2>Publicação</h2>

            <p className="admin-ajuda">
              <b>Rascunho</b> não aparece para o visitante (nem na listagem, nem na busca). Publique
              quando a página estiver pronta.
            </p>

            <label className="admin-campo">
              <b>Situação</b>
              <select
                value={editando.situacao}
                onChange={(e) => mudar("situacao", e.target.value === "publicada" ? "publicada" : "rascunho")}
              >
                <option value="rascunho">rascunho (só você vê)</option>
                <option value="publicada">publicada (aparece no app)</option>
              </select>
            </label>

            <div className="admin-form-botoes">
              <button type="submit" className="btn" onClick={salvar} disabled={salvando}>
                {salvando ? "Salvando..." : "Salvar"}
              </button>

              <button type="button" className="outline" onClick={fechar}>
                Cancelar
              </button>

              <button type="button" className="outline" onClick={() => excluir(editando)}>
                Excluir cadastro
              </button>
            </div>
          </form>
        )}

        {/* Marcos e Conexões desta personalidade (pedido da autoria, 02/10/2026):
            depois do conteúdo principal e antes de "Fontes e pesquisa" no app.
            Precisa do cadastro salvo — a chave usa o endereço permanente. */}
        {editando && editando.slug ? (
          <EditorDeMarcos
            chaveDaPagina={chaveDaPersonalidade(editando.slug)}
            onde={editando.nome}
          />
        ) : (
          editando && (
            <p className="admin-ajuda">
              Salve o cadastro desta personalidade para cadastrar os <b>Marcos e Conexões</b>
              {" "}dela — a seção se liga ao endereço permanente da página.
            </p>
          )
        )}
      </div>
    );
  }

  return (
    <div className="personalidades-admin">
      <h1>Personalidades Negras</h1>

      <p className="admin-ajuda">
        Trajetórias de pessoas negras importantes para a história de Vitória e do Espírito Santo.
        Cada cadastro vira uma página com endereço próprio (<b>/personalidade/…</b>) e aparece na
        seção <b>Personalidades</b> do app, aberta pelo botão dentro da página Vitória Negra.
      </p>

      <p className="admin-ajuda">
        No app aparecem <b>{contagem.publicadas}</b> publicada(s) · <b>{contagem.rascunhos}</b> em
        rascunho (rascunho não aparece para o visitante).
      </p>

      {ok && <p className="admin-ok">{ok}</p>}
      {erro && <p className="admin-erro">{erro}</p>}

      <div className="admin-form-botoes">
        <button type="button" className="btn" onClick={nova}>
          + Nova personalidade
        </button>

        <a className="outline" href="/personalidades" target="_blank" rel="noreferrer">
          ver a seção no app ↗
        </a>
      </div>

      <label className="admin-campo">
        <b>Buscar na lista</b>
        <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} />
      </label>

      <div className="admin-form">
        {filtradas.length === 0 && (
          <p className="admin-ajuda">
            {lista.length === 0
              ? "Nenhuma personalidade cadastrada ainda. Comece por “+ Nova personalidade”."
              : "Nenhuma personalidade com esse nome."}
          </p>
        )}

        {filtradas.map((p) => (
          <div className="admin-cartao-pessoa" key={p.id}>
            <span>
              <b>{p.nome}</b>
              <br />
              <span className="admin-campo-dica">
                <span
                  className={`admin-situacao ${
                    p.situacao === "publicada" ? "admin-situacao-publicada" : "admin-situacao-rascunho"
                  }`}
                >
                  {p.situacao === "publicada" ? "publicada" : "rascunho"}
                </span>{" "}
                {resumoDeLinha(p)}
              </span>
            </span>

            <span className="admin-form-botoes">
              <button type="button" className="outline" onClick={() => abrir(p)}>
                editar
              </button>

              <button
                type="button"
                className="outline"
                onClick={() => mudarSituacao(p, p.situacao === "publicada" ? "rascunho" : "publicada")}
              >
                {p.situacao === "publicada" ? "despublicar" : "publicar"}
              </button>

              <button type="button" className="outline" onClick={() => excluir(p)}>
                excluir
              </button>
            </span>
          </div>
        ))}
      </div>

      <PersonalidadesPublicaveis lista={lista} />
    </div>
  );
}
