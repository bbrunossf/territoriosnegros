

import Info from "../components/Info";
import Topic from "../components/Topic";
import Numbered from "../components/Numbered";
import PageTitle from "../components/PageTitle";

type Props = {
  setTela: (tela: string) => void;
};

export default function Intro({ setTela }: Props) {
  return (
    <>
      <PageTitle title="Antes de caminhar" />

      <Info>
        Este guia propõe uma{" "}
        <b>
          leitura da cidade de Vitória - ES a partir
          dos territórios negros
        </b>
        . Não se trata de turismo, mas de uma
        experiência formativa em campo.
      </Info>

      <Topic
        icon="✓"
        title="O que levar e como se preparar"
      >
        <Numbered
          items={[
            "Leve água e mantenha-se hidratado(a)",
            "Use protetor solar e roupas confortáveis",
            "Prefira calçados adequados para caminhada",
            "Planeje pausas para descanso ao longo do percurso",
          ]}
        />
      </Topic>

      <Topic
        icon="◉"
        title="Como usar este app"
      >
        <Numbered
          items={[
            "Escolha um percurso conforme o público, o clima e o contexto da visita",
            "Leia o essencial em cada ponto e observe o espaço ao redor",
            "Use o corpo como instrumento de leitura do território",
            "Evite transformar a experiência em consumo turístico",
          ]}
        />
      </Topic>

      <div className="intro-actions">
        <button
          className="btn"
          onClick={() => setTela("conceito")}
        >
          Ir para base teórica
        </button>

        <button
          className="outline"
          onClick={() => setTela("roteiros")}
        >
          Ir direto para os roteiros
        </button>
      </div>
    </>
  );
}
