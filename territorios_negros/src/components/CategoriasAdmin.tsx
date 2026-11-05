// CategoriasAdmin.tsx — categorias da aba Territórios (antes fixas no código)
//
// 14/10/2026: além do nome e da ordem, cada categoria pode ter uma IMAGEM
// (símbolo) enviada pela autoria. Ela aparece ao lado do título da seção na
// lista de Territórios e na ficha do território; sem imagem, o app continua
// usando o símbolo que vem do nome.
import "../styles.css";

import { useCallback, useEffect, useState } from "react";
import {
  excluirCategoria,
  fetchCategorias,
  fetchConfig,
  fetchTerritorios,
  salvarCategoria,
  salvarConfig,
  uploadFoto,
} from "../data/api";
import type { Categoria, TerritoriosMap } from "../data/types";
import { gerarSlug, ordenarCategorias } from "../utils/catalogo";
import {
  CHAVE_SIMBOLOS_CATEGORIA,
  lerSimbolosDeCategoria,
} from "../utils/simbolosCategoria";

export default function CategoriasAdmin() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [territorios, setTerritorios] = useState<TerritoriosMap>({});
  /** mapa { id-da-categoria: url } gravado em app_config */
  const [simbolos, setSimbolos] = useState<Record<string, string>>({});

  const [editando, setEditando] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [ordem, setOrdem] = useState("0");
  const [simbolo, setSimbolo] = useState("");

  const [enviandoSimbolo, setEnviandoSimbolo] = useState(false);
  const [confirmandoExcluir, setConfirmandoExcluir] = useState<string | null>(null);

  const [ok, setOk] = useState("");
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    try {
      const [cats, ts, cfg] = await Promise.all([
        fetchCategorias(),
        fetchTerritorios(),
        fetchConfig(),
      ]);

      setCategorias(cats);
      setTerritorios(ts);
      setSimbolos(lerSimbolosDeCategoria(cfg));
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao carregar as categorias.");
    }
  }, []);

  useEffect(() => {
    let ativo = true;

    (async () => {
      try {
        const [cats, ts, cfg] = await Promise.all([
          fetchCategorias(),
          fetchTerritorios(),
          fetchConfig(),
        ]);
        if (!ativo) return;

        setCategorias(cats);
        setTerritorios(ts);
        setSimbolos(lerSimbolosDeCategoria(cfg));
      } catch (e) {
        console.error(e);
        if (ativo) {
          setErro(e instanceof Error ? e.message : "Falha ao carregar as categorias.");
        }
      }
    })();

    return () => {
      ativo = false;
    };
  }, []);

  function limpar() {
    setNome("");
    setOrdem("0");
    setSimbolo("");
    setEditando(null);
    setConfirmandoExcluir(null);
    setOk("");
    setErro("");
  }

  /** Grava o mapa de símbolos em app_config (uma chave só, tudo junto). */
  async function gravarSimbolos(mapa: Record<string, string>) {
    await salvarConfig(CHAVE_SIMBOLOS_CATEGORIA, mapa);
    setSimbolos(mapa);
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setOk("");
    setErro("");

    if (!nome.trim()) {
      setErro("Informe o nome da categoria.");
      return;
    }

    try {
      const id = editando ?? gerarSlug(nome);

      await salvarCategoria(editando, {
        id,
        nome: nome.trim(),
        ordem: Number(ordem) || 0,
      });

      // símbolo entra no app só aqui, junto com o resto do cadastro
      const antes = simbolos[id] ?? "";
      const depois = simbolo.trim();

      if (depois !== antes) {
        const mapa = { ...simbolos };

        if (depois) mapa[id] = depois;
        else delete mapa[id];

        await gravarSimbolos(mapa);
      }

      limpar();
      await carregar();
      setOk("Categoria salva.");
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao salvar a categoria.");
    }
  }

  /** Envia a imagem que representa a categoria (fica no cadastro até Salvar). */
  async function enviarSimbolo(file: File | undefined) {
    if (!file) return;

    setErro("");
    setOk("");
    setEnviandoSimbolo(true);

    try {
      const url = await uploadFoto(
        gerarSlug(nome) || editando || "categoria",
        file,
        "categorias"
      );

      setSimbolo(url);
      setOk("Imagem enviada. Clique em Salvar para usar esta imagem no app.");
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao enviar a imagem.");
    } finally {
      setEnviandoSimbolo(false);
    }
  }

  async function excluir(cat: Categoria) {
    setOk("");
    setErro("");
    setConfirmandoExcluir(null);

    try {
      await excluirCategoria(cat.id);

      // símbolo da categoria excluída não precisa continuar guardado
      if (simbolos[cat.id]) {
        const mapa = { ...simbolos };
        delete mapa[cat.id];
        await gravarSimbolos(mapa);
      }

      await carregar();
      setOk(`Categoria "${cat.nome}" excluída.`);
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao excluir.");
    }
  }

  function contar(id: string) {
    return Object.values(territorios).filter((t) => t.categoria === id).length;
  }

  return (
    <div>
      <h1>Categorias</h1>

      <p className="admin-ajuda">
        As categorias são os títulos que agrupam a lista de <b>Territórios</b> no
        app. Aqui você <b>cria</b>, <b>edita</b>, <b>reordena</b> e <b>exclui</b>{" "}
        categorias, e pode enviar uma <b>imagem (símbolo)</b> para cada uma — ela
        aparece ao lado do título da seção no app e na ficha do território. Sem
        imagem, o app usa o símbolo que já vem do nome.
      </p>

      {ok && <p className="admin-ok">{ok}</p>}
      {erro && <p className="admin-erro">{erro}</p>}

      <form className="admin-form" onSubmit={salvar}>
        <h2>{editando ? `Editando: ${nome}` : "Nova categoria"}</h2>

        <div className="admin-form-grid">
          <label className="admin-campo">
            <b>Nome da categoria *</b>
            <span className="admin-campo-dica">
              É o título do grupo na tela Territórios do app.
            </span>
            <input
              type="text"
              placeholder="Ex: Territórios de resistência"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </label>

          <label className="admin-campo">
            <b>Ordem</b>
            <span className="admin-campo-dica">
              Menor número aparece antes na lista. Empate é resolvido pelo nome.
            </span>
            <input
              type="number"
              value={ordem}
              onChange={(e) => setOrdem(e.target.value)}
            />
          </label>
        </div>

        {/* Símbolo da categoria (14/10/2026) */}
        <div className="admin-campo">
          <b>Imagem da categoria (opcional)</b>
          <span className="admin-campo-dica">
            Um símbolo quadrado, com fundo transparente, lido bem pequeno. PNG ou
            SVG. A imagem só entra no app depois de <b>Salvar</b>.
          </span>

          <div className="admin-simbolo-linha">
            {simbolo ? (
              <img src={simbolo} alt="" className="admin-simbolo-previa" />
            ) : (
              <span className="admin-simbolo-previa admin-simbolo-previa--vazia">
                —
              </span>
            )}

            <label className="outline admin-botao-arquivo">
              {enviandoSimbolo
                ? "Enviando…"
                : simbolo
                  ? "Trocar imagem"
                  : "Enviar imagem"}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => enviarSimbolo(e.target.files?.[0])}
                disabled={enviandoSimbolo}
              />
            </label>

            {simbolo && (
              <button
                type="button"
                className="outline"
                onClick={() => setSimbolo("")}
              >
                Remover imagem
              </button>
            )}
          </div>
        </div>

        <div className="admin-form-botoes">
          <button type="submit" className="btn">
            {editando ? "Salvar alterações" : "Criar categoria"}
          </button>

          {editando && (
            <button type="button" className="outline" onClick={limpar}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="admin-tabela-rolagem">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ordem</th>
              <th>Nome</th>
              <th>Territórios</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {ordenarCategorias(categorias).map((c) => (
              <tr key={c.id}>
                <td>{c.ordem}</td>
                <td>
                  <span className="admin-categoria-nome">
                    {simbolos[c.id] ? (
                      <img
                        src={simbolos[c.id]}
                        alt=""
                        className="admin-categoria-simbolo"
                      />
                    ) : (
                      <span className="admin-categoria-simbolo admin-categoria-simbolo--vazio">
                        —
                      </span>
                    )}
                    <b>{c.nome}</b>
                  </span>
                  <br />
                  <small>{c.id}</small>
                </td>
                <td>{contar(c.id)}</td>
                <td className="admin-acoes">
                  <button
                    className="outline"
                    onClick={() => {
                      setEditando(c.id);
                      setNome(c.nome);
                      setOrdem(String(c.ordem));
                      setSimbolo(simbolos[c.id] ?? "");
                      setOk("");
                      setErro("");
                      setConfirmandoExcluir(null);
                    }}
                    title="Editar"
                  >
                    ✏️ editar
                  </button>
                  <button
                    className="outline"
                    onClick={() => {
                      setConfirmandoExcluir(c.id);
                      setOk("");
                      setErro("");
                    }}
                    title="Excluir"
                  >
                    🗑️ excluir
                  </button>
                </td>
              </tr>
            ))}

            {categorias.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: 24 }}>
                  Nenhuma categoria cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmação de exclusão na própria tela: window.confirm é bloqueado no
          navegador da autoria (14/10/2026). */}
      {confirmandoExcluir && (
        <div className="admin-confirmacao">
          {(() => {
            const cat = categorias.find((c) => c.id === confirmandoExcluir);
            const quantos = cat ? contar(cat.id) : 0;

            return (
              <>
                <p>
                  <b>Excluir a categoria “{cat?.nome ?? confirmandoExcluir}”?</b>{" "}
                  {quantos > 0
                    ? `Ela está em uso por ${quantos} território(s): eles continuam publicados e passam a aparecer em “Outros territórios”.`
                    : "Nenhum território usa esta categoria hoje."}{" "}
                  A exclusão não apaga nenhum território.
                </p>

                <div className="admin-form-botoes">
                  <button
                    type="button"
                    className="btn"
                    onClick={() => cat && excluir(cat)}
                  >
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
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
