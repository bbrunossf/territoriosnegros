// MarcosAdmin.tsx — a tela "Marcos e Conexões" do painel (menu lateral).
//
// Reúne, como nas Fotos e vídeos:
//   · o controle rápido (seção no app, explicações e fontes, expansão do aparelho);
//   · a lista dos tópicos por página, com "habilitar todas" / "desabilitar todas"
//     de uma vez (em todas as páginas) e página por página, e o liga/desliga de
//     cada tópico — gravando na hora, sem apagar nada;
//   · onde cadastrar cada grupo de páginas.

import "../styles.css";
import { useState } from "react";
import { useTerritorios } from "../context/useTerritorios";
import { salvarConfig } from "../data/api";
import {
  CHAVE_MARCOS,
  CHAVE_MARCOS_EXPLICACOES,
  CHAVE_MARCOS_VISIVEL,
  chaveDaPersonalidade,
  chaveDoTerritorio,
  explicacoesPublicas,
  marcoExibivel,
  marcoPreenchido,
  marcarVisibilidade,
  marcosVisiveis,
  nomeDaChave,
  normalizarMarcos,
  resumoDosMarcos,
  type Marco,
} from "../data/marcos";
import { lerPersonalidades } from "../data/personalidades";

export default function MarcosAdmin() {
  const { config, territorios, recarregar } = useTerritorios();
  const [gravando, setGravando] = useState(false);
  const [aviso, setAviso] = useState("");
  const [abertos, setAbertos] = useState<string[]>([]);

  const visivel = marcosVisiveis(config);
  const explicacoes = explicacoesPublicas(config);

  const resumo = resumoDosMarcos(config);

  // Nomes legíveis para os painéis (território, personalidade, cidade, presença)
  const personalidades = lerPersonalidades(config) ?? [];
  const nomes: Record<string, string> = {};

  for (const id of Object.keys(territorios ?? {})) {
    const nome = territorios[id]?.nome;
    if (nome) nomes[chaveDoTerritorio(id)] = nome;
  }

  for (const pessoa of personalidades) {
    if (pessoa?.slug && pessoa?.nome) nomes[chaveDaPersonalidade(pessoa.slug)] = pessoa.nome;
  }

  const nomeDe = (chave: string) => nomeDaChave(chave, nomes);

  /** A lista crua de uma página (sem descartar tópico sem título). */
  const listaCrua = (chave: string) => normalizarMarcos(config[CHAVE_MARCOS])[chave] ?? [];

  /** Só os que aparecem na lista do painel. */
  const listaDaPagina = (chave: string) => listaCrua(chave).filter(marcoPreenchido);

  async function gravar(chave: string, valor: unknown, recado: string) {
    setGravando(true);
    setAviso("");

    try {
      await salvarConfig(chave, valor);
      await recarregar();
      setAviso(recado);
    } catch (e) {
      console.error(e);
      setAviso(e instanceof Error ? e.message : "Falha ao salvar.");
    } finally {
      setGravando(false);
    }
  }

  const alternarVisivel = () =>
    gravar(
      CHAVE_MARCOS_VISIVEL,
      !visivel,
      visivel
        ? "Marcos e Conexões está escondida no app. O conteúdo continua guardado — nada foi apagado."
        : "Marcos e Conexões voltou a aparecer no app."
    );

  const alternarExplicacoes = () =>
    gravar(
      CHAVE_MARCOS_EXPLICACOES,
      !explicacoes,
      explicacoes
        ? "Voltou ao padrão: os visitantes veem só os títulos, e as explicações abrem apenas no seu aparelho."
        : "Explicações e fontes liberadas para todos os visitantes, em todas as páginas — com as setas de abrir."
    );

  /** Grava a lista de uma página preservando todo o resto do conteúdo. */
  const gravarLista = (chave: string, lista: Marco[], recado: string) =>
    gravar(CHAVE_MARCOS, { ...normalizarMarcos(config[CHAVE_MARCOS]), [chave]: lista }, recado);

  /** Liga/desliga um tópico — grava na hora, como nas fotos e vídeos. */
  const alternarTopico = (chave: string, id: string) => {
    const lista = listaCrua(chave).map((m) =>
      m.id === id ? { ...m, visivel: !marcoExibivel(m) } : m
    );

    const alvo = lista.find((m) => m.id === id);

    return gravarLista(
      chave,
      lista,
      alvo && marcoExibivel(alvo)
        ? `“${alvo.titulo}” habilitado — passa a aparecer no app.`
        : `“${alvo?.titulo ?? "Tópico"}” desabilitado — sai do app, e o conteúdo continua guardado.`
    );
  };

  /** "habilitar todas" / "desabilitar todas" de uma página. */
  const alternarPagina = (chave: string, novo: boolean) => {
    const lista = marcarVisibilidade(normalizarMarcos(config[CHAVE_MARCOS]), novo, chave)[chave] ?? [];

    return gravarLista(
      chave,
      lista,
      novo
        ? `Todos os tópicos de ${nomeDe(chave)} estão habilitados.`
        : `Todos os tópicos de ${nomeDe(chave)} estão desabilitados — a página deixa de mostrar a seção.`
    );
  };

  /** "habilitar todas" / "desabilitar todas" de TODAS as páginas. */
  const alternarTudo = (novo: boolean) =>
    gravar(
      CHAVE_MARCOS,
      marcarVisibilidade(normalizarMarcos(config[CHAVE_MARCOS]), novo),
      novo
        ? "Todos os tópicos de todas as páginas estão habilitados."
        : "Todos os tópicos de todas as páginas estão desabilitados. O conteúdo continua guardado."
    );

  return (
    <div>
      <h1>Marcos e Conexões</h1>

      <div className="admin-bloco">
        <h3>Controle rápido — vale para todas as páginas de uma vez</h3>

        {/* 1. a seção aparece no app? */}
        <div className="admin-linha marcos-controle">
          <b>Seção no app:</b>

          <button type="button" className="outline" onClick={alternarVisivel} disabled={gravando}>
            {visivel ? "Aparecendo — toque para ocultar" : "Oculta — toque para exibir"}
          </button>

          <span className="admin-dica">
            {visivel
              ? "quem abrir o app vê os títulos dos tópicos"
              : "ninguém vê a seção enquanto estiver oculta"}
          </span>
        </div>

        {/* 2. as explicações e fontes aparecem para os visitantes? */}
        <div className="admin-linha marcos-controle">
          <b>Explicações e fontes:</b>

          <button
            type="button"
            className="outline"
            aria-pressed={explicacoes}
            onClick={alternarExplicacoes}
            disabled={gravando}
          >
            {explicacoes
              ? "Exibidas para todos — toque para deixar só os títulos"
              : "Só os títulos — toque para exibir para todos"}
          </button>

          <span className="admin-dica">
            {explicacoes
              ? "em todas as páginas, qualquer visitante pode abrir a explicação e a fonte"
              : "os visitantes veem só os títulos dos tópicos habilitados"}
          </span>
        </div>

        {aviso && <p className="admin-ok">{aviso}</p>}
      </div>

      <div className="admin-bloco">
        <h3>O que já está cadastrado</h3>

        {resumo.length === 0 ? (
          <p className="admin-ajuda">
            Ainda não há nenhum tópico publicado. Enquanto não houver, a seção não aparece no app —
            nem vazia, nem provisória.
          </p>
        ) : (
          <>
            <p className="admin-ajuda">
              Cada tópico tem o próprio botão. Desabilitado, sai do app e o conteúdo fica guardado.
            </p>

            <div className="admin-linha marcos-controle">
              <b>Todas as páginas:</b>

              <button
                type="button"
                className="outline"
                onClick={() => alternarTudo(true)}
                disabled={gravando}
              >
                habilitar todas
              </button>

              <button
                type="button"
                className="outline"
                onClick={() => alternarTudo(false)}
                disabled={gravando}
              >
                desabilitar todas
              </button>

              <span className="admin-dica">
                marca tópico por tópico, em todas as páginas que têm conteúdos
              </span>
            </div>

            {resumo.map((linha) => {
              const aberto = abertos.includes(linha.chave);
              const topicos = listaDaPagina(linha.chave);

              return (
                <div className="marcos-painel" key={linha.chave}>
                  <button
                    type="button"
                    className="marcos-painel-topo"
                    aria-expanded={aberto}
                    onClick={() =>
                      setAbertos((lista) =>
                        lista.includes(linha.chave)
                          ? lista.filter((c) => c !== linha.chave)
                          : [...lista, linha.chave]
                      )
                    }
                  >
                    <span className="marcos-painel-seta" aria-hidden="true">
                      {aberto ? "▾" : "▸"}
                    </span>

                    <span className="marcos-painel-nome">{nomeDe(linha.chave)}</span>

                    <span className="marcos-painel-conta">
                      {linha.quantos} {linha.quantos === 1 ? "tópico" : "tópicos"}
                      {linha.desabilitados > 0 &&
                        ` (${linha.desabilitados} ${
                          linha.desabilitados === 1 ? "desabilitado" : "desabilitados"
                        })`}
                    </span>
                  </button>

                  {aberto && (
                    <div className="marcos-painel-corpo">
                      <div className="admin-linha">
                        <button
                          type="button"
                          className="outline"
                          onClick={() => alternarPagina(linha.chave, true)}
                          disabled={gravando}
                        >
                          habilitar todas
                        </button>

                        <button
                          type="button"
                          className="outline"
                          onClick={() => alternarPagina(linha.chave, false)}
                          disabled={gravando}
                        >
                          desabilitar todas
                        </button>

                        <span className="admin-dica">nesta página</span>
                      </div>

                      <ul className="marcos-painel-lista">
                        {topicos.map((marco, i) => (
                          <li className="marcos-painel-item" key={marco.id}>
                            <span className="marcos-painel-numero">{i + 1}</span>

                            <span className="marcos-painel-titulo">{marco.titulo}</span>

                            <button
                              type="button"
                              className={
                                marcoExibivel(marco)
                                  ? "outline marcos-liga habilitado"
                                  : "outline marcos-liga"
                              }
                              aria-pressed={marcoExibivel(marco)}
                              onClick={() => alternarTopico(linha.chave, marco.id)}
                              disabled={gravando}
                            >
                              {marcoExibivel(marco) ? "Habilitado" : "Desabilitado"}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
