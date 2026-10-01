// src/components/PlayerVideo.tsx
// Player de vídeo usado no app e na prévia do painel.
//
// A autoria não escolhe o tipo: o componente olha a URL e monta o player certo
// (arquivo enviado do aparelho, YouTube, Vimeo, Google Drive). Link de um site
// desconhecido não vira player quebrado: vira um cartão com "abrir vídeo".
import { comoExibirVideo } from "../utils/videos";

type Props = {
  url: string;
  /** texto para leitor de tela / quando o player não carrega */
  titulo?: string;
  /** "compacto" = prévia pequena no painel */
  compacto?: boolean;
};

export default function PlayerVideo({ url, titulo = "Vídeo", compacto = false }: Props) {
  const exibicao = comoExibirVideo(url);
  const classe = compacto ? "video-player video-player-compacto" : "video-player";

  if (!exibicao.src) return null;

  if (exibicao.tipo === "iframe") {
    return (
      <div className={`${classe} video-embed`}>
        <iframe
          src={exibicao.src}
          title={titulo}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
    );
  }

  if (exibicao.tipo === "link") {
    return (
      <p className="video-link">
        <a className="outline" href={exibicao.src} target="_blank" rel="noreferrer">
          abrir vídeo em nova guia ↗
        </a>
      </p>
    );
  }

  return (
    <video className={classe} controls preload="metadata">
      <source src={exibicao.src} />
      Seu navegador não suporta vídeo.{" "}
      <a href={exibicao.src} target="_blank" rel="noreferrer">
        Abrir o vídeo
      </a>
    </video>
  );
}
