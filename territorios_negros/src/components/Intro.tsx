import { Link } from "react-router-dom";

import Info from "../components/Info";
import Topic from "../components/Topic";
import Numbered from "../components/Numbered";
import PageTitle from "../components/PageTitle";



export default function Intro() {
  return (
    <>
      <PageTitle title="Antes de caminhar" />

      <Info>
        Este guia propõe uma leitura da cidade de
        Vitória - ES a partir dos{" "}
        <b>Territórios Negros</b>. Não se trata de um
        guia de turismo, mas de uma experiência de
        reconhecimento e interpretação da cidade para
        além das narrativas oficiais, a partir das
        lentes da geografia, da história e da
        sociabilidade da população negra.
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
            "Leia o essencial em cada ponto e observe o espaço ao redor",
            "Use o corpo como instrumento de leitura do território",
            "Não transforme a experiência em apenas consumo turístico. Contribua para valorização, preservação e proteção dos territórios negros.",
          ]}
        />
      </Topic>

      <div className="intro-actions">
        <Link to="/conceito" className="btn">
          Ir para base teórica
        </Link>

        <Link to="/roteiros" className="outline">
          Ir direto para os roteiros
        </Link>

        <Link to="/vitoria" className="outline">
          A cidade de Vitória - ES
        </Link>
      </div>
    </>
  );
}
