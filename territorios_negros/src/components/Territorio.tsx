//Territorio.tsx
import InfoRapida from "../components/InfoRapida";
// import Info from "../components/Info";
import Numbered from "../components/Numbered";
import Topic from "../components/Topic";

import { calcularIdade } from "../utils/data";
import { foto } from "../utils/imagens";

type Props = {
  territorio: any;
  indice: number;
  total: number;
  proximo: () => void;
  voltar: () => void;
};

export default function Territorio({
  territorio,
  indice,
  total,
  proximo,
  voltar,
}: Props) {
  const idade = calcularIdade(territorio.ano);

  return (
    <>
      <p className="territorio-counter">
        Território {indice + 1} de {total}
      </p>

      <h1 className="page-title">
        {territorio.nome}
      </h1>

      <p className="page-subtitle">
        {territorio.local}
      </p>

      <div className="page-line" />

      <div className="territorio-actions">
        <button
          className="outline"
          onClick={voltar}
        >
          ← Voltar
        </button>

        <button
          className="btn"
          onClick={proximo}
        >
          Próximo →
        </button>
      </div>

      {territorio.video ? (
        <video
          controls
          poster={foto(territorio.imagem)}
          className="territorio-media"
        >
          <source
            src={territorio.video}
            type="video/mp4"
          />

          Seu navegador não suporta vídeo.
        </video>
      ) : (
        <img
          src={foto(territorio.imagem)}
          alt={territorio.nome}
          className="territorio-media"
        />
      )}

      <InfoRapida
        territorio={territorio}
        idade={idade}
      />

      <Topic
        icon="✦"
        title="O que é este território?"
      >
        <p>{territorio.descricao}</p>
      </Topic>

      <Topic
        icon="✓"
        title="Para observar durante a visita"
      >
        <Numbered
          items={territorio.observar || []}
        />
      </Topic>

      <Topic
        icon="?"
        title="Para refletir"
      >
        <p>
          <i>{territorio.pergunta}</i>
        </p>
      </Topic>

      <Topic
        icon="🔑"
        title="Palavra-chave"
      >
        <p className="territorio-palavra">
          {territorio.palavra}
        </p>
      </Topic>
    </>
  );
}
