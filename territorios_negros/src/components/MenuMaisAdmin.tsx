// MenuMaisAdmin.tsx — aba "Menu Mais" do painel.
//
// Monta a lista que abre ao tocar em "Mais", na barra do app: quais páginas
// aparecem, com que nome, em que ordem, e quais ficam desligadas.
//
// Grava em app_config, na chave "menu_mais" — nenhuma migração de banco. Nada vai
// ao ar sem "Salvar alterações". Enquanto nada estiver gravado, o app usa a lista
// padrão (a que já está publicada).
import "../styles.css";

import { useEffect, useState } from "react";

import { salvarConfig } from "../data/api";
import { useTerritorios } from "../context/useTerritorios";
import {
  CATALOGO_DE_PAGINAS,
  CHAVE_MENU_MAIS,
  lerItens,
  novoItemDoMenu,
  paginaDoCatalogo,
  paginasLivres,
  quantosVisiveis,
  resumoDoItem,
  somenteComEvento,
  type ItemDoMenu,
} from "../data/menuPrincipal";

export default function MenuMaisAdmin() {
  const { config, recarregar } = useTerritorios();

  // o estado começa já com o que está gravado: a lista aparece preenchida no
  // primeiro desenho, sem piscar em branco
  const [itens, setItens] = useState<ItemDoMenu[]>(() => lerItens(config[CHAVE_MENU_MAIS]));
  const [novaPagina, setNovaPagina] = useState("");

  const [ok, setOk] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let ativo = true;

    (async () => {
      // espera um tick para não disparar render em cascata dentro do efeito
      await Promise.resolve();
      if (!ativo) return;

      setItens(lerItens(config[CHAVE_MENU_MAIS]));
    })();

    return () => {
      ativo = false;
    };
  }, [config]);

  function mudar(id: string, campo: keyof ItemDoMenu, valor: string | boolean) {
    setItens((atual) => atual.map((i) => (i.id === id ? { ...i, [campo]: valor } : i)));
  }

  /**
   * Troca a página de um item. Se o nome ainda era o nome padrão da página antiga
   * (ou estava vazio), ele acompanha; se a autoria já escreveu um nome próprio,
   * esse nome fica — é dela.
   */
  function trocarPagina(id: string, caminho: string) {
    setItens((atual) =>
      atual.map((item) => {
        if (item.id !== id) return item;

        const antiga = paginaDoCatalogo(item.caminho);
        const nova = paginaDoCatalogo(caminho);
        const nomeEraOPadrao = !item.nome || item.nome === antiga?.nome;

        return {
          ...item,
          caminho,
          icone: nova?.icone ?? item.icone,
          nome: nomeEraOPadrao ? (nova?.nome ?? item.nome) : item.nome,
        };
      })
    );
  }

  function acrescentar() {
    if (!novaPagina) return;

    setOk("");
    setErro("");
    setItens((atual) => [...atual, novoItemDoMenu(novaPagina)]);
    setNovaPagina("");
  }

  function remover(id: string) {
    setOk("");
    setErro("");
    setItens((atual) => atual.filter((i) => i.id !== id));
  }

  function mover(id: string, passo: -1 | 1) {
    setItens((atual) => {
      const i = atual.findIndex((x) => x.id === id);
      const j = i + passo;
      if (i < 0 || j < 0 || j >= atual.length) return atual;

      const copia = [...atual];
      [copia[i], copia[j]] = [copia[j], copia[i]];
      return copia;
    });
  }

  function descartar() {
    setItens(lerItens(config[CHAVE_MENU_MAIS]));
    setErro("");
    setOk("Mostrando o que está publicado — o que não foi salvo saiu da tela.");
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();

    setOk("");
    setErro("");
    setSalvando(true);

    try {
      await salvarConfig(CHAVE_MENU_MAIS, itens);
      await recarregar();
      setOk("Menu Mais salvo — já vale no app.");
    } catch (err) {
      console.error(err);
      setErro(err instanceof Error ? err.message : "Falha ao salvar o menu.");
    } finally {
      setSalvando(false);
    }
  }

  const visiveis = quantosVisiveis(itens);
  const livres = paginasLivres(itens);
  const temEventoNaLista = itens.some((i) => somenteComEvento(i.caminho));

  return (
    <div className="menu-admin">
      <h1>Menu Mais</h1>

      <p className="admin-ajuda">
        Esta é a lista que abre quando o visitante toca em <b>Mais</b>, na barra do app — o acesso
        rápido às páginas que não têm item próprio na barra. Aqui você <b>liga, desliga, renomeia,
        reordena, tira e acrescenta</b> páginas. Nada vai ao ar sem <b>Salvar alterações</b>.
      </p>

      <p className="admin-ajuda">
        Na lista: <b>{itens.length}</b> {itens.length === 1 ? "página" : "páginas"} e <b>{visiveis}</b>{" "}
        aparecendo para o visitante.
      </p>

      {visiveis === 0 && (
        <p className="admin-erro">
          Nenhuma página ligada: o visitante vai tocar em Mais e encontrar a lista vazia. Ligue pelo
          menos uma.
        </p>
      )}

      {temEventoNaLista && (
        <p className="admin-aviso">
          O <b>Próximo evento</b> tem uma regra do app: ele só aparece no menu quando existe um
          evento agendado (aba <b>Página inicial</b>). Sem evento, o item fica guardado — você não
          precisa mexer.
        </p>
      )}

      {ok && <p className="admin-ok">{ok}</p>}
      {erro && <p className="admin-erro">{erro}</p>}

      <form className="admin-form" onSubmit={salvar}>
        <h2>Páginas do menu</h2>

        <p className="admin-ajuda">
          A ordem aqui é a ordem que o visitante vê ao abrir a lista.
        </p>

        {itens.length === 0 && (
          <p className="admin-ajuda">
            A lista está vazia. Escolha uma página em <b>Acrescentar página</b>, no fim do
            formulário.
          </p>
        )}

        {itens.map((item, i) => (
          <div className="menu-admin-item" key={item.id}>
            <div className="menu-admin-topo">
              <b>{resumoDoItem(item, i)}</b>

              <span className="apoio-admin-acoes">
                <button
                  type="button"
                  className="midias-acao"
                  onClick={() => mover(item.id, -1)}
                  disabled={i === 0}
                >
                  subir
                </button>
                <button
                  type="button"
                  className="midias-acao"
                  onClick={() => mover(item.id, 1)}
                  disabled={i === itens.length - 1}
                >
                  descer
                </button>
                <button type="button" className="midias-acao" onClick={() => remover(item.id)}>
                  remover
                </button>
              </span>
            </div>

            <div className="admin-form-grid">
              <label className="admin-campo">
                <b>Página</b>
                <span className="admin-campo-dica">
                  Só aparecem páginas que existem no app — assim nenhum item leva a lugar nenhum.
                </span>
                <select value={item.caminho} onChange={(e) => trocarPagina(item.id, e.target.value)}>
                  <option value="">— escolha a página —</option>

                  {CATALOGO_DE_PAGINAS.map((pagina) => (
                    <option key={pagina.caminho} value={pagina.caminho}>
                      {pagina.nome} ({pagina.caminho})
                    </option>
                  ))}
                </select>
              </label>

              <label className="admin-campo">
                <b>Nome no menu</b>
                <span className="admin-campo-dica">
                  O texto que o visitante lê. Em branco, fica o nome da página.
                </span>
                <input
                  type="text"
                  placeholder="Ex: Apoiadores"
                  value={item.nome}
                  onChange={(e) => mudar(item.id, "nome", e.target.value)}
                />
              </label>
            </div>

            {paginaDoCatalogo(item.caminho)?.observacao && (
              <p className="admin-ajuda">{paginaDoCatalogo(item.caminho)?.observacao}</p>
            )}

            <label className="apoio-admin-liga">
              <input
                type="checkbox"
                checked={item.visivel}
                onChange={(e) => mudar(item.id, "visivel", e.target.checked)}
              />
              <span>
                <b>Aparecendo no menu</b> — desmarque para tirar da lista sem perder o ajuste (o
                item fica guardado aqui).
              </span>
            </label>
          </div>
        ))}

        <hr className="admin-divisor" />
        <h3 className="admin-form-secao">Acrescentar página</h3>

        {livres.length === 0 ? (
          <p className="admin-ajuda">
            Todas as páginas do app já estão na lista. Para trocar uma, mude a <b>Página</b> de um
            item acima.
          </p>
        ) : (
          <div className="admin-form-grid">
            <label className="admin-campo">
              <b>Página do app</b>
              <span className="admin-campo-dica">
                Páginas que ainda não estão na lista. Depois de acrescentar, ajuste o nome e a
                ordem.
              </span>
              <select value={novaPagina} onChange={(e) => setNovaPagina(e.target.value)}>
                <option value="">— escolha a página —</option>

                {livres.map((pagina) => (
                  <option key={pagina.caminho} value={pagina.caminho}>
                    {pagina.nome} ({pagina.caminho})
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        <div className="admin-form-botoes">
          <button type="button" className="btn" onClick={acrescentar} disabled={!novaPagina}>
            Acrescentar página
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
