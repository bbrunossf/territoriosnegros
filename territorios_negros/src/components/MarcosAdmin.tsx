// MarcosAdmin.tsx — guia "Marcos e Conexões" do painel.
//
// Reúne: o controle de expansão (do aparelho da autoria), o resumo do que já
// está cadastrado e onde cadastrar cada grupo de páginas.

import "../styles.css";
import { useState } from "react";
import { useTerritorios } from "../context/useTerritorios";
import { useExpansao } from "../context/useExpansao";
import { salvarConfig } from "../data/api";
import {
  CHAVE_MARCOS_EXPLICACOES,
  CHAVE_MARCOS_VISIVEL,
  explicacoesPublicas,
  marcosVisiveis,
  resumoDosMarcos,
} from "../data/marcos";
import { lerPersonalidades } from "../data/personalidades";

export default function MarcosAdmin() {
  const { config, territorios, recarregar } = useTerritorios();
  const [permitir, definir] = useExpansao();
  const [gravando, setGravando] = useState(false);
  const [aviso, setAviso] = useState("");

  const visivel = marcosVisiveis(config);
  const explicacoes = explicacoesPublicas(config);

  /** Grava uma chave do controle rápido e mantém o que já existe em app_config. */
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

  const resumo = resumoDosMarcos(config);
  const nomeDoTerritorio = (id: string) => territorios[id]?.nome ?? id;
  const quantos = (chave: string) => resumo.find((linha) => linha.chave === chave)?.quantos ?? 0;
  const quantasPersonalidades = Object.keys(lerPersonalidades(config)).length;

  const chaves = [...new Set([...resumo.map((r) => r.chave)])];

  return (
    <div>
      <h1>Marcos e Conexões</h1>

      <p className="admin-ajuda">
        Cada página pode ter uma lista de tópicos — <b>título</b>, <b>explicação breve</b> e{" "}
        <b>fonte</b> — para dar contexto complementar ao visitante e sustentar a sua fala durante
        os tours. O <b>título fica sempre visível</b> no app; a explicação só abre quando a
        expansão está permitida aqui embaixo.
      </p>

      <div className="admin-bloco">
        <h3>Controle rápido — vale para todas as páginas de uma vez</h3>

        <p className="admin-ajuda">
          Você <b>não precisa abrir cada página</b> para isso: os três controles abaixo valem para
          Marcos e Conexões inteiro, com um toque. Nada aqui apaga conteúdo.
        </p>

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
              : "os visitantes veem só os títulos; as explicações abrem apenas no seu aparelho"}
          </span>
        </div>

        {/* 3. a expansão no aparelho da autoria */}
        <div className="admin-linha marcos-controle">
          <b>Neste aparelho (o meu):</b>

          <button
            type="button"
            className="outline"
            aria-pressed={permitir}
            onClick={() => definir(!permitir)}
          >
            {permitir ? "Expandindo — toque para não expandir" : "Não expande — toque para expandir"}
          </button>

          <span className="admin-dica">
            {permitir
              ? "no app deste aparelho, os títulos abrem e fecham ao toque"
              : "no app deste aparelho, os títulos ficam sem expansão e sem setas"}
          </span>
        </div>

        {aviso && <p className="admin-ok">{aviso}</p>}

        <p className="admin-ajuda">
          Os dois primeiros valem para <b>todos</b> e ficam guardados no banco; o terceiro é{" "}
          <b>só seu</b>, neste aparelho, e fica guardado no navegador.
        </p>
      </div>

      <div className="admin-bloco">
        <h3>Onde cadastrar cada página</h3>

        <p className="admin-ajuda">
          O conteúdo é <b>independente por página</b>. Cada editor tem o seu próprio botão de
          salvar, dentro da tela daquela página:
        </p>

        <ul className="admin-lista">
          <li>
            <b>Fichas de território</b> — em <b>Territórios</b>, abra o território: o cadastro
            fica no fim da ficha. Hoje: {territorios ? Object.keys(territorios).length : 0}{" "}
            territórios cadastrados.
          </li>

          <li>
            <b>A cidade de Vitória</b> e <b>Presença Negra na Cidade</b> — em <b>Páginas</b>,
            abra a página: o cadastro fica no fim da tela, depois dos blocos de texto.
          </li>

          <li>
            <b>Personalidades</b> — na guia <b>Personalidades</b>, abra a pessoa: o cadastro fica
            no fim do formulário. Hoje: {quantasPersonalidades} cadastradas.
          </li>
        </ul>
      </div>

      <div className="admin-bloco">
        <h3>O que já está cadastrado</h3>

        {chaves.length === 0 ? (
          <p className="admin-ajuda">
            Ainda não há nenhum tópico publicado. Enquanto não houver, a seção não aparece no app —
            nem vazia, nem provisória.
          </p>
        ) : (
          <ul className="admin-lista">
            {chaves.map((chave) => {
              const [tipo, resto] = chave.split(":");

              const nome =
                tipo === "territorio"
                  ? nomeDoTerritorio(resto)
                  : tipo === "personalidade"
                    ? resto
                    : chave;

              return (
                <li key={chave}>
                  <b>{nome}</b> — {quantos(chave)} {quantos(chave) === 1 ? "tópico" : "tópicos"}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="admin-bloco">
        <h3>O que combina com esta seção</h3>

        <ul className="admin-lista">
          <li>
            Datas, acontecimentos, pessoas e relações que você desenvolve <b>oralmente</b> durante
            a caminhada.
          </li>

          <li>
            Aprofundamento complementar: o que sustenta a leitura do lugar sem tirar o foco dela.
          </li>

          <li>
            <b>Não mova para cá</b> o que é essencial para entender a territorialidade negra ou os
            apagamentos — isso continua no conteúdo principal da página.
          </li>
        </ul>
      </div>
    </div>
  );
}
