
import type { ReactNode } from "react";

import Topic from "../components/Topic";

import { formatarInline } from "../utils/texto";
import { idadeTexto } from "../utils/data";
import { estaVisivel } from "../utils/visibilidade";
import type { Territorio } from "../data/types";

type Props = {
  territorio: Territorio;
  idade: number | null;
};

/** [ícone, título, conteúdo, ocupa a largura toda?] */
type Cartao = [string, string, ReactNode, boolean];

export default function InfoRapida({
  territorio,
  idade,
}: Props) {
  const cards: Cartao[] = [];

  if (territorio.camadas) {
    cards.push([
      "🕰️",
      "Camadas",
      territorio.camadas,
      true,
    ]);
  }

  if (territorio.contexto) {
    cards.push([
      "🧭",
      "Contexto",
      territorio.contexto,
      true,
    ]);
  }

  if (territorio.ano) {
    cards.push([
      "📅",
      "Ano",
      territorio.ano,
      false,
    ]);
  }

  if (idade !== null) {
    cards.push([
      "⏳",
      "Idade",
      `${idade} anos`,
      false,
    ]);
  }

  // Camadas de tempo: UM cartão só, com o título uma vez e uma linha por
  // camada (antes o título "Camada temporal" se repetia em cada caixa). Só
  // entram as camadas habilitadas para os visitantes no painel.
  const camadasVisiveis = (territorio.idadeCamadas ?? []).filter(estaVisivel);

  if (camadasVisiveis.length > 0) {
    cards.push([
      "📜",
      "Camada temporal",
      <div className="info-rapida-camadas" key="camadas">
        {camadasVisiveis.map((c, i) => (
          <span key={`${c.ano}-${i}`}>{idadeTexto(c.ano, c.label) ?? c.label}</span>
        ))}
      </div>,
      true,
    ]);
  }

  if (territorio.criacao) {
    cards.push([
      "👷",
      "Criação",
      territorio.criacao,
      false,
    ]);
  }

  if (territorio.funcao) {
    cards.push([
      "🏛️",
      "Função",
      territorio.funcao,
      false,
    ]);
  }

  if (territorio.transformacoes) {
    cards.push([
      "🔄",
      "Transformações",
      territorio.transformacoes,
      true,
    ]);
  }

  if (territorio.status) {
    cards.push([
      "📍",
      "Status",
      territorio.status,
      false,
    ]);
  }

  if (territorio.observacao) {
    cards.push([
      "📌",
      "Observação",
      territorio.observacao,
      true,
    ]);
  }

  return (
    <Topic
      icon="ⓘ"
      title="Informações rápidas"
    >
      <div className="info-rapida-grid">
        {cards.map(
          ([icon, label, value, wide], i) => (
            <div
              key={`${label}-${i}`}
              className={`info-rapida-card ${
                wide
                  ? "info-rapida-card-wide"
                  : ""
              }`}
            >
              <b>
                {icon} {label}
              </b>

              <br />

              {/* o valor sai como foi digitado (linha simples vira quebra de
                  linha; **negrito** e *itálico* valem aqui também) */}
              {typeof value === "string" ? formatarInline(value) : value}
            </div>
          )
        )}
      </div>
    </Topic>
  );
}
