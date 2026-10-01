// CategoriasAdmin.tsx — categorias da aba Territórios (antes fixas no código)
import "../styles.css";

import { useCallback, useEffect, useState } from "react";
import {
  excluirCategoria,
  fetchCategorias,
  fetchTerritorios,
  salvarCategoria,
} from "../data/api";
import type { Categoria, TerritoriosMap } from "../data/types";
import { gerarSlug, ordenarCategorias } from "../utils/catalogo";

export default function CategoriasAdmin() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [territorios, setTerritorios] = useState<TerritoriosMap>({});

  const [editando, setEditando] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [ordem, setOrdem] = useState("0");

  const [ok, setOk] = useState("");
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    try {
      const [cats, ts] = await Promise.all([fetchCategorias(), fetchTerritorios()]);
      setCategorias(cats);
      setTerritorios(ts);
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao carregar as categorias.");
    }
  }, []);

  useEffect(() => {
    let ativo = true;

    (async () => {
      try {
        const [cats, ts] = await Promise.all([fetchCategorias(), fetchTerritorios()]);
        if (!ativo) return;
        setCategorias(cats);
        setTerritorios(ts);
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
    setEditando(null);
    setOk("");
    setErro("");
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
      await salvarCategoria(editando, {
        id: editando ?? gerarSlug(nome),
        nome: nome.trim(),
        ordem: Number(ordem) || 0,
      });

      limpar();
      await carregar();
      setOk("Categoria salva.");
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao salvar a categoria.");
    }
  }

  async function excluir(cat: Categoria, quantos: number) {
    const aviso =
      quantos > 0
        ? `A categoria "${cat.nome}" está em uso por ${quantos} território(s). ` +
          `Eles ficarão em "Outros territórios". Excluir mesmo assim?`
        : `Excluir a categoria "${cat.nome}"?`;

    if (!window.confirm(aviso)) return;

    setOk("");
    setErro("");

    try {
      await excluirCategoria(cat.id);
      await carregar();
      setOk("Categoria excluída.");
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
        As categorias organizam a aba Territórios. A ordem define a sequência em que
        os grupos aparecem no app.
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
                <b>{c.nome}</b>
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
                    setOk("");
                    setErro("");
                  }}
                  title="Editar"
                >
                  ✏️
                </button>
                <button
                  className="outline"
                  onClick={() => excluir(c, contar(c.id))}
                  title="Excluir"
                >
                  🗑️
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
  );
}
