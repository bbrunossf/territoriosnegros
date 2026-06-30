//Territorio.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useTerritorios } from "../context/TerritoriosContext";
import dados from "../data/dados.json";

import InfoRapida from "../components/InfoRapida";
// import Info from "../components/Info";
import Numbered from "../components/Numbered";
import Topic from "../components/Topic";

import { calcularIdade } from "../utils/data";
// import { foto } from "../utils/imagens";
//import type { Territorio as TerritorioType } from "../data/types";



const { roteiros, ordemTerritoriosVisual } = dados;


export default function Territorio() {
  const { rotaId, indice: indiceStr, id } = useParams();
  const navigate = useNavigate();
  const { territorios } = useTerritorios();


  // Determina o contexto: veio de uma rota ou de "todos"?
  const roteiro = rotaId && rotaId !== "todos"
    ? roteiros.find(r => r.id === rotaId)
    : { nome: "Territórios", subtitulo: "Consulta individual", pontos: ordemTerritoriosVisual };

  if (!roteiro) return <p>Rota não encontrada.</p>;

  const indice = rotaId && rotaId !== "todos"
    ? Number(indiceStr)
    : ordemTerritoriosVisual.indexOf(id ?? "");

  const territorio = territorios[roteiro.pontos[indice]];
  if (!territorio) return <p>Território não encontrado.</p>;

  const idade = calcularIdade(territorio.ano);

  const proximo = () => {
    if (indice < roteiro.pontos.length - 1) {
      const novoIndice = indice + 1;
      if (rotaId && rotaId !== "todos")
        navigate(`/percurso/${rotaId}/${novoIndice}`);
      else
        navigate(`/territorio/${roteiro.pontos[novoIndice]}`);
    } else {
      navigate("/fim");
    }
  };

  const voltar = () => {
    if (indice > 0) {
      const novoIndice = indice - 1;
      if (rotaId && rotaId !== "todos")
        navigate(`/percurso/${rotaId}/${novoIndice}`);
      else
        navigate(`/territorio/${roteiro.pontos[novoIndice]}`);
    } else {
      navigate(rotaId && rotaId !== "todos" ? `/percurso/${rotaId}` : "/territorios");
    }
  };


  return (
      <>
        <div className="territorio-topbar">
          <p className="territorio-counter">
            Território {indice + 1} de {roteiro.pontos.length}
          </p>

          <h1 className="page-title">
            {territorio.nome}
          </h1>

          <p className="page-subtitle">
            {territorio.local}
          </p>

          <div className="page-line" />

          <div className="territorio-actions">
            <button className="outline" onClick={voltar}>
              ← Voltar
            </button>

            <button className="btn" onClick={proximo}>
              Próximo →
            </button>
          </div>
        </div>

      {territorio.video ? (
        <video
          controls
          // poster={foto(territorio.imagem)}
          poster={territorio.imagem}

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
          src={territorio.imagem}
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
