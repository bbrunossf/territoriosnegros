import '../styles.css';

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Territorio = {
  id: string;
  nome: string;
  local: string;
  palavra: string;
  descricao: string;
  imagem: string;
};

export default function TerritoriosAdmin() {
  const [territorios,
    setTerritorios] = useState<
      Territorio[]
    >([]);

  const [nome, setNome] =
    useState("");

  const [local, setLocal] =
    useState("");

  const [palavra, setPalavra] =
    useState("");

  const [descricao, setDescricao] =
    useState("");

  const [imagem, setImagem] =
    useState("");

  const [imagemFile, setImagemFile] =
    useState<File | null>(null);

  async function criarTerritorio(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!imagemFile) {
      alert("Selecione uma imagem");

      return;
    }

    const id = nome
      .toLowerCase()
      .replaceAll(" ", "-");

    const extensao =
      imagemFile.name
        .split(".")
        .pop();

    const nomeArquivo =
      `${id}-${Date.now()}.${extensao}`;

    const caminho =
      `dados_site/${nomeArquivo}`;

    const {
      error: uploadError,
    } =
      await supabase.storage
        .from("dados_site")
        .upload(
          caminho,
          imagemFile
        );

    if (uploadError) {
      console.error(uploadError);

      return;
    }

    const { data } =
      supabase.storage
        .from("dados_site")
        .getPublicUrl(caminho);

    const imagemUrl =
      data.publicUrl;

    const { error } =
      await supabase
        .from("territorios")
        .insert({
          id,
          nome,
          local,
          palavra,
          descricao,
          imagem: imagemUrl,
        });

    if (error) {
      console.error(error);

      return;
    }

    setNome("");
    setLocal("");
    setPalavra("");
    setDescricao("");

    setImagemFile(null);

    carregar();
  }

  async function carregar() {
    const { data, error } =
      await supabase
        .from("territorios")
        .select("*")
        .order("nome");

    if (error) {
      console.error(error);
      return;
    }

    setTerritorios(data || []);
  }

  useEffect(() => {
    carregar();
  }, []);


  async function atualizarCampo(
    id: string,
    campo: string,
    valor: string
  ) {
    const { error } =
      await supabase
        .from("territorios")
        .update({
          [campo]: valor,
        })
        .eq("id", id);

    if (error) {
      console.error(error);
    }
  };

  function alterarTerritorio(
    id: string,
    campo: string,
    valor: string
  ) {
    setTerritorios((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              [campo]: valor,
            }
          : t
      )
    );
  };

  async function uploadImagem(
    territorioId: string,
    file: File
  ) {
    const extensao =
      file.name.split(".").pop();

    const nomeArquivo =
      `${territorioId}-${Date.now()}.${extensao}`;

    const caminho =
      `territorios/${nomeArquivo}`;

    const { error: uploadError } =
      await supabase.storage
        .from("dados_site")
        .upload(caminho, file);

    if (uploadError) {
      console.error(uploadError);
      return;
    }

    const { data } =
      supabase.storage
        .from("dados_site")
        .getPublicUrl(caminho);

    const url = data.publicUrl;

    const { error: dbError } =
      await supabase
        .from("territorios")
        .update({
          imagem: url,
        })
        .eq("id", territorioId);

    if (dbError) {
      console.error(dbError);
      return;
    }

    setTerritorios((prev) =>
      prev.map((t) =>
        t.id === territorioId
          ? {
              ...t,
              imagem: url,
            }
          : t
      )
    );
  };

  async function alterarImagem(
    territorioId: string,
    file: File
  ) {
    const extensao =
      file.name
        .split(".")
        .pop();

    const nomeArquivo =
      `${territorioId}-${Date.now()}.${extensao}`;

    const caminho =
      `territorios/${nomeArquivo}`;

    const {
      error: uploadError,
    } =
      await supabase.storage
        .from("dados_site")
        .upload(
          caminho,
          file
        );

    if (uploadError) {
      console.error(uploadError);

      return;
    }

    const { data } =
      supabase.storage
        .from("dados_site")
        .getPublicUrl(caminho);

    const imagemUrl =
      data.publicUrl;

    const {
      error: updateError,
    } =
      await supabase
        .from("territorios")
        .update({
          imagem: imagemUrl,
        })
        .eq("id", territorioId);

    if (updateError) {
      console.error(updateError);

      return;
    }

    setTerritorios((prev) =>
      prev.map((t) =>
        t.id === territorioId
          ? {
              ...t,
              imagem: imagemUrl,
            }
          : t
      )
    );
  }

  return (
    <div>
      <h1>Territórios</h1>

      <form
        className="admin-form"
        onSubmit={criarTerritorio}
      >
        <h2>Novo território</h2>

        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) =>
            setNome(e.target.value)
          }
        />

        <input
          type="text"
          placeholder="Local"
          value={local}
          onChange={(e) =>
            setLocal(e.target.value)
          }
        />

        <input
          type="text"
          placeholder="Palavra-chave"
          value={palavra}
          onChange={(e) =>
            setPalavra(e.target.value)
          }
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file =
              e.target.files?.[0];

            if (!file) return;

            setImagemFile(file);
          }}
        />

        <textarea
          placeholder="Descrição"
          value={descricao}
          onChange={(e) =>
            setDescricao(e.target.value)
          }
        />

        <button type="submit">
          Criar território
        </button>
      </form>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Local</th>
            <th>Palavra</th>
            <th>Imagem</th>
            <th>Alterar</th>
          </tr>
        </thead>

        <tbody>
          {territorios.map((t) => (
            <tr key={t.id}>
              <td>
                <input
                  className="admin-inline-input"
                  value={t.nome}
                  onChange={(e) =>
                    alterarTerritorio(
                      t.id,
                      "nome",
                      e.target.value
                    )
                  }
                  onBlur={(e) =>
                    atualizarCampo(
                      t.id,
                      "nome",
                      e.target.value
                    )
                  }
                />
              </td>
              <td>
                <input
                  className="admin-inline-input"
                  value={t.local}
                  onChange={(e) =>
                    alterarTerritorio(
                      t.id,
                      "local",
                      e.target.value
                    )
                  }
                  onBlur={(e) =>
                    atualizarCampo(
                      t.id,
                      "local",
                      e.target.value
                    )
                  }
                />
              </td>
              <td>
                <input
                  className="admin-inline-input"
                  value={t.palavra}
                  onChange={(e) =>
                    alterarTerritorio(
                      t.id,
                      "palavra",
                      e.target.value
                    )
                  }
                  onBlur={(e) =>
                    atualizarCampo(
                      t.id,
                      "palavra",
                      e.target.value
                    )
                  }
                />
              </td>
              <td>
                {t.imagem && (
                  <img
                    src={t.imagem}
                    alt=""
                    className="admin-thumb"
                  />
                )}
              </td>
              <td>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file =
                      e.target.files?.[0];

                    if (!file) return;

                    alterarImagem(
                      t.id,
                      file
                    );
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
