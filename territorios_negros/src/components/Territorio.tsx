//Territorio.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useTerritorios } from "../context/useTerritorios";
import { pontosVisiveis } from "../utils/catalogo";
import { somenteVisiveis } from "../utils/visibilidade";

import InfoRapida from "../components/InfoRapida";
import Numbered from "../components/Numbered";
import Topic from "../components/Topic";
import FotoAmpliavel from "../components/FotoAmpliavel";
import PlayerVideo from "../components/PlayerVideo";
import BotaoContato from "../components/BotaoContato";

import { calcularIdade } from "../utils/data";

export default function Territorio() {
  const { rotaId, indice: indiceStr, id } = useParams();
  const navigate = useNavigate();
  const { territorios, roteiros, ordemTerritoriosVisual } = useTerritorios();

  const dentroDeRota = !!rotaId && rotaId !== "todos";

  // Lista de territórios do contexto atual (uma rota ou "todos"),
  // sempre só com os que estão habilitados no painel.
  const lista = dentroDeRota
    ? pontosVisiveis(roteiros.find((r) => r.id === rotaId)?.pontos, territorios)
    : ordemTerritoriosVisual.map((tid) => territorios[tid]).filter(Boolean);

  if (dentroDeRota && !roteiros.find((r) => r.id === rotaId)) {
    return <p>Rota não encontrada.</p>;
  }

  const indice = dentroDeRota
    ? Number(indiceStr)
    : lista.findIndex((t) => t.id === id);

  const territorio = lista[indice];

  if (!territorio) {
    // existe no banco, mas está desabilitado no painel (fora do recorte de hoje)
    if (id && territorios[id] && territorios[id].ativo === false) {
      return (
        <p className="aviso-vazio">
          Este território não faz parte do percurso de hoje.
        </p>
      );
    }

    return <p>Território não encontrado.</p>;
  }

  const idade = calcularIdade(territorio.ano);

  const irPara = (novoIndice: number) => {
    if (dentroDeRota) navigate(`/percurso/${rotaId}/${novoIndice}`);
    else navigate(`/territorio/${lista[novoIndice].id}`);
  };

  const proximo = () => {
    if (indice < lista.length - 1) irPara(indice + 1);
    else navigate("/fim");
  };

  const voltar = () => {
    if (indice > 0) irPara(indice - 1);
    else navigate(dentroDeRota ? `/percurso/${rotaId}` : "/territorios");
  };

  // Mídias de apoio: cada foto e cada vídeo tem o próprio "aparece/não aparece",
  // ligado no painel (um por um ou todos de uma vez, durante o tour).
  const fotosApoio = somenteVisiveis(territorio.fotos);
  const videosApoio = somenteVisiveis(territorio.videos);

  // crédito da foto principal: campo próprio; se estiver vazio e a foto
  // principal estiver na galeria, aproveita o crédito cadastrado nela
  const creditoPrincipal =
    territorio.imagemCredito ||
    territorio.fotos?.find((f) => f.url === territorio.imagem)?.credito ||
    "";

  return (
      <>
        <div className="territorio-topbar">
          <p className="territorio-counter">
            Território {indice + 1} de {lista.length}
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
          poster={territorio.imagem}

          className="territorio-media"
        >
          <source
            src={territorio.video}
            type="video/mp4"
          />
          Seu navegador não suporta vídeo.
        </video>
      ) : territorio.imagem ? (
        <>
          <img
            src={territorio.imagem}
            alt={territorio.nome}
            className="territorio-media"
          />

          {creditoPrincipal && <p className="foto-credito">{creditoPrincipal}</p>}
        </>
      ) : (
        /* sem foto nem vídeo cadastrados: mostra um aviso em vez de imagem quebrada */
        <div className="territorio-media territorio-sem-foto">
          <span>Imagem deste território em produção</span>
        </div>
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

        {/* as imagens de apoio vêm por último, depois da palavra-chave */}
        {fotosApoio.length > 0 && (
          <Topic
            icon="▣"
            title="Imagens de apoio"
          >
            <div className="territorio-galeria">
              {fotosApoio.map((foto, i) => (
                <FotoAmpliavel
                  key={`${foto.url}-${i}`}
                  url={foto.url}
                  alt={foto.legenda || territorio.nome}
                  legenda={foto.legenda}
                  credito={foto.credito}
                />
              ))}
            </div>
          </Topic>
        )}

        {/* vídeos de apoio: mesma ideia das imagens, com liberar/bloquear próprio */}
        {videosApoio.length > 0 && (
          <Topic
            icon="▶"
            title="Vídeos de apoio"
          >
            <div className="territorio-videos">
              {videosApoio.map((video, i) => (
                <figure key={`${video.url}-${i}`} className="territorio-video">
                  <PlayerVideo
                    url={video.url}
                    titulo={video.legenda || `${territorio.nome} — vídeo ${i + 1}`}
                  />

                  {(video.legenda || video.credito) && (
                    <figcaption>
                      {video.legenda}
                      {video.credito && <span className="foto-credito">{video.credito}</span>}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </Topic>
        )}

        <BotaoContato tela="territorio" />
      </>
    );
  }
