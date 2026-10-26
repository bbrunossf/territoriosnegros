//Territorio.tsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTerritorios } from "../context/useTerritorios";
import { pontosVisiveis } from "../utils/catalogo";
import { somenteVisiveis } from "../utils/visibilidade";

import FichaTerritorio from "../components/FichaTerritorio";
import Topic from "../components/Topic";
import FotoAmpliavel from "../components/FotoAmpliavel";
import PlayerVideo from "../components/PlayerVideo";
import BotaoContato from "../components/BotaoContato";
import BotoesDaTela from "../components/BotoesDaTela";
import MarcosConexoes from "../components/MarcosConexoes";
import { chaveDoTerritorio } from "../data/marcos";
import {
  CHAVE_PERSONALIDADES,
  lerPersonalidades,
  personalidadesDoTerritorio,
  personalidadesPublicadas,
  relacaoCom,
} from "../data/personalidades";

import { calcularIdade } from "../utils/data";

export default function Territorio() {
  const { rotaId, indice: indiceStr, id } = useParams();
  const navigate = useNavigate();
  const { territorios, roteiros, ordemTerritoriosVisual, config } = useTerritorios();

  const dentroDeRota = !!rotaId && rotaId !== "todos";

  // Foto principal: quando o arquivo não carrega (rede, VPN, cache de erro do
  // navegador) a imagem colapsa e a página "pula" o bloco — foi o que a autoria
  // viu na Igreja de São Gonçalo (14/10/2026). Aqui o app tenta UMA vez com
  // endereço novo e, se ainda falhar, mostra o aviso no lugar da foto.
  //
  // O estado guarda a QUAL território ele se refere: assim trocar de território
  // (mesma página, outro índice) recomeça do zero sem precisar de efeito.
  // (Declarado antes de qualquer saída antecipada: regra dos hooks.)
  const [estadoFoto, setEstadoFoto] = useState({
    id: "",
    falhou: false,
    tentativa: 0,
  });

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

  const idAtual = territorio?.id ?? "";
  const foto =
    estadoFoto.id === idAtual
      ? estadoFoto
      : { id: idAtual, falhou: false, tentativa: 0 };

  const enderecoDaFoto = territorio?.imagem
    ? foto.tentativa === 0
      ? territorio.imagem
      : `${territorio.imagem}${territorio.imagem.includes("?") ? "&" : "?"}t=${foto.tentativa}`
    : "";

  // Personalidades ligadas a este território: cada uma vira um tópico em
  // Marcos e Conexões (pedido da autoria, 14/10/2026) — e o tópico leva à
  // página dela. O vínculo é um só, cadastrado na pessoa, no painel.
  const ligadas = territorio
    ? personalidadesDoTerritorio(
        personalidadesPublicadas(lerPersonalidades(config[CHAVE_PERSONALIDADES])),
        territorio.id
      ).map((pessoa) => ({
        id: pessoa.id,
        nome: pessoa.nome,
        slug: pessoa.slug,
        relacao: relacaoCom(pessoa, territorio.id),
      }))
    : [];

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
        {/* botões que a autoria escolheu para o topo desta ficha (menu Botões) */}
        <BotoesDaTela tela="territorio" posicao="topo" />

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
        </div>

        {/* barra presa logo abaixo do Header: Voltar/Próximo ficam sempre à mão,
            inclusive quando a pessoa está no fim da página */}
        <div className="territorio-acoes-fixas">
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
      ) : territorio.imagem && !foto.falhou ? (
        <>
          <img
            src={enderecoDaFoto}
            alt={territorio.nome}
            className="territorio-media"
            onError={() => {
              setEstadoFoto({
                id: idAtual,
                falhou: foto.tentativa !== 0,
                tentativa: foto.tentativa + 1,
              });
            }}
          />

          {creditoPrincipal && <p className="foto-credito">{creditoPrincipal}</p>}
        </>
      ) : (
        /* sem foto, ou foto que não carregou: mostra um aviso em vez de imagem
           quebrada (e em vez de um espaço vazio que some da tela) */
        <div
          className={`territorio-media territorio-sem-foto${
            territorio.imagem ? " territorio-sem-foto--recarregar" : ""
          }`}
          role={territorio.imagem ? "button" : undefined}
          tabIndex={territorio.imagem ? 0 : undefined}
          onClick={() => {
            if (!territorio.imagem) return;
            setEstadoFoto({ id: idAtual, falhou: false, tentativa: foto.tentativa + 1 });
          }}
        >
          <span>
            {territorio.imagem
              ? "Não foi possível carregar a foto deste território agora — toque para tentar de novo"
              : "Imagem deste território em produção"}
          </span>
        </div>
      )}

      {/* as informações da ficha (cartões + textos) saem na ordem escolhida no
          painel para ESTE território; sem configuração, é a ordem de sempre */}
      <FichaTerritorio
        territorio={territorio}
        idade={idade}
      />

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

        {/* Marcos e Conexões SEMPRE no fim da página: depois das fotos e dos
            vídeos, e imediatamente antes dos botões de ação (pedido da autoria,
            02/10/2026) — e as personalidades ligadas a este território entram
            aqui como tópicos (14/10/2026). Sem tópico e sem vínculo, não
            aparece nada. */}
        <MarcosConexoes chaveDaPagina={chaveDoTerritorio(territorio.id)} personalidades={ligadas} />

      <BotoesDaTela tela="territorio" posicao="final" />

      <BotaoContato tela="territorio" />
      </>
    );
  }
