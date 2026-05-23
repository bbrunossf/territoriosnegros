
import Topic from "../components/Topic";

import { idadeTexto } from "../utils/data";

type Props = {
  territorio: any;
  idade: number | null;
};

export default function InfoRapida({
  territorio,
  idade,
}: Props) {
  const cards = [];

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

  if (territorio.idadeCamadas) {
    territorio.idadeCamadas.forEach((c: any) =>
      cards.push([
        "📜",
        "Camada temporal",
        idadeTexto(c.ano, c.label),
        true,
      ])
    );
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

              {value}
            </div>
          )
        )}
      </div>
    </Topic>
  );
}
