// src/components/FichaTerritorio.tsx
//
// As informações da página do território na ordem escolhida no painel:
// os cartões da caixa "Informações rápidas" (Camadas, Contexto, Ano, Idade,
// Camada temporal, Criação, Função, Transformações, Status, Observação) e as
// seções de texto (Descrição, Para observar, Para refletir, Palavra-chave).
//
// Largura: TODO cartão sai com o mesmo enquadramento (largura cheia). A única
// exceção é Ano e Idade, que dividem a linha quando estão um ao lado do outro —
// assim dois cartões nunca aparecem dividindo a linha por acaso.
//
// Cartões seguidos saem numa caixa só; se a autoria colocar a descrição entre
// eles, a caixa fecha e o que vier depois abre outra — sem repetir o título.
// Cartão sem conteúdo não aparece (não deixa buraco na ordem).
import type { ReactNode } from "react";

import Topic from "./Topic";
import Inline from "./Inline";
import Numbered from "./Numbered";

import { useTerritorios } from "../context/useTerritorios";
import {
  faixasDaFicha,
  ocupaLinhaToda,
  ordemDoTerritorio,
  type BlocoFichaId,
} from "../data/fichaTerritorio";
import { classeAlinhamento, lerParagrafos } from "../data/descricao";
import { formatarInline } from "../utils/texto";
import { idadeTexto } from "../utils/data";
import { estaVisivel } from "../utils/visibilidade";
import type { Territorio } from "../data/types";

/** [ícone, título, conteúdo] */
type Cartao = [string, string, ReactNode];

interface ItemCartao {
  id: BlocoFichaId;
  cartao: Cartao;
}

/** Cartões que têm conteúdo agora, por id do bloco. */
function cartoesDaFicha(
  territorio: Territorio,
  idade: number | null
): Map<BlocoFichaId, Cartao> {
  const cartoes = new Map<BlocoFichaId, Cartao>();

  if (territorio.camadas) {
    cartoes.set("camadas", ["🕰️", "Camadas", territorio.camadas]);
  }

  if (territorio.contexto) {
    cartoes.set("contexto", ["🧭", "Contexto", territorio.contexto]);
  }

  if (territorio.ano) {
    cartoes.set("ano", ["📅", "Ano", territorio.ano]);
  }

  if (idade !== null) {
    cartoes.set("idade", ["⏳", "Idade", `${idade} anos`]);
  }

  // Camadas de tempo: um cartão só, com o título uma vez e uma linha por camada.
  // Só entram as camadas habilitadas para os visitantes no painel.
  const camadasVisiveis = (territorio.idadeCamadas ?? []).filter(estaVisivel);

  if (camadasVisiveis.length > 0) {
    cartoes.set("camadaTemporal", [
      "📜",
      "Camada temporal",
      <div className="info-rapida-camadas" key="camadas">
        {camadasVisiveis.map((c, i) => (
          <span key={`${c.ano}-${i}`}>{idadeTexto(c.ano, c.label) ?? c.label}</span>
        ))}
      </div>,
    ]);
  }

  if (territorio.criacao) {
    cartoes.set("criacao", ["👷", "Criação", territorio.criacao]);
  }

  if (territorio.funcao) {
    cartoes.set("funcao", ["🏛️", "Função", territorio.funcao]);
  }

  if (territorio.transformacoes) {
    cartoes.set("transformacoes", ["🔄", "Transformações", territorio.transformacoes]);
  }

  if (territorio.status) {
    cartoes.set("status", ["📍", "Status", territorio.status]);
  }

  if (territorio.observacao) {
    cartoes.set("observacao", ["📌", "Observação", territorio.observacao]);
  }

  return cartoes;
}

function GradeCartoes({ itens, comTitulo }: { itens: ItemCartao[]; comTitulo: boolean }) {
  // largura cheia para todos; só Ano + Idade, lado a lado, dividem a linha
  const linhasInteiras = ocupaLinhaToda(itens.map((item) => item.id));

  const grade = (
    <div className="info-rapida-grid">
      {itens.map(({ id, cartao: [icon, label, value] }, i) => (
        <div
          key={id}
          className={`info-rapida-card ${linhasInteiras[i] ? "info-rapida-card-wide" : ""}`}
        >
          <b>
            {icon} {label}
          </b>

          <br />

          {/* o valor sai como foi digitado (linha simples vira quebra de linha;
              **negrito** e *itálico* valem aqui também) */}
          {typeof value === "string" ? formatarInline(value) : value}
        </div>
      ))}
    </div>
  );

  // o título da caixa sai uma vez só: no primeiro grupo de cartões
  return comTitulo ? (
    <Topic icon="ⓘ" title="Informações rápidas">
      {grade}
    </Topic>
  ) : (
    grade
  );
}

type Props = {
  territorio: Territorio;
  idade: number | null;
};

export default function FichaTerritorio({ territorio, idade }: Props) {
  const { config } = useTerritorios();

  const ordem = ordemDoTerritorio(config.ficha_territorio, territorio.id);
  const cartoes = cartoesDaFicha(territorio, idade);
  const faixas = faixasDaFicha(ordem);

  const primeiraGrade = faixas.findIndex(
    (faixa) => faixa.tipo === "cartoes" && faixa.ids.some((id) => cartoes.has(id))
  );

  return (
    <>
      {faixas.map((faixa, i) => {
        if (faixa.tipo === "cartoes") {
          const itens = faixa.ids
            .map((id) => ({ id, cartao: cartoes.get(id) }))
            .filter((item): item is ItemCartao => !!item.cartao);

          if (itens.length === 0) return null;

          return (
            <GradeCartoes
              key={`grade-${i}`}
              itens={itens}
              comTitulo={i === primeiraGrade}
            />
          );
        }

        if (faixa.id === "descricao") {
          return (
            <Topic icon="✦" title="O que é este território?" key={`secao-${i}`}>
              {/* o texto sai igual ao que foi digitado no painel: linha em branco
                  separa parágrafos, a linha simples vira quebra e a marca
                  [esq]/[dir]/[just] define o alinhamento (o visitante não a vê) */}
              {lerParagrafos(territorio.descricao).map((paragrafo, j) => (
                <p key={j} className={classeAlinhamento(paragrafo.alinhamento)}>
                  <Inline texto={paragrafo.texto} />
                </p>
              ))}
            </Topic>
          );
        }

        if (faixa.id === "observar") {
          return (
            <Topic icon="✓" title="Para observar durante a visita" key={`secao-${i}`}>
              <Numbered items={territorio.observar || []} />
            </Topic>
          );
        }

        if (faixa.id === "pergunta") {
          return (
            <Topic icon="?" title="Para refletir" key={`secao-${i}`}>
              <p>
                <i>
                  <Inline texto={territorio.pergunta} />
                </i>
              </p>
            </Topic>
          );
        }

        return (
          <Topic icon="🔑" title="Palavra-chave" key={`secao-${i}`}>
            <p className="territorio-palavra">{territorio.palavra}</p>
          </Topic>
        );
      })}
    </>
  );
}
