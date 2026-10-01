// src/utils/videos.ts
// Decide COMO exibir um vídeo no site, a partir da URL guardada no banco.
//
// A autoria não precisa saber disso: ela envia o arquivo do aparelho (mp4, mov,
// webm) ou cola o link (YouTube, Vimeo, Google Drive) e o app monta o player
// certo - arquivo no player do navegador, link em player embutido.
// Quando o link não é de um serviço conhecido, mostramos um cartão com o botão
// "abrir vídeo", em vez de um player quebrado.

export type VideoExibicao =
  | { tipo: "arquivo"; src: string }
  | { tipo: "iframe"; src: string }
  | { tipo: "link"; src: string };

/** extensões que o navegador toca sozinho dentro de <video> */
const EXTENSAO_DE_VIDEO = /\.(mp4|m4v|webm|ogv|ogg|mov)(\?.*)?$/i;

function idYouTube(link: string): string | null {
  const m = link.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/
  );
  return m?.[1] ?? null;
}

function idVimeo(link: string): string | null {
  const m = link.match(/vimeo\.com\/(?:video\/)?(\d{6,})/);
  return m?.[1] ?? null;
}

function idDrive(link: string): string | null {
  const m = link.match(/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]{10,})/);
  return m?.[1] ?? null;
}

/** É um endereço da internet? (arquivo enviado ou link colado) */
export function ehLink(url: string): boolean {
  return /^https?:\/\//i.test((url ?? "").trim());
}

export function comoExibirVideo(url: string): VideoExibicao {
  const link = (url ?? "").trim();
  if (!link) return { tipo: "link", src: "" };

  const youtube = idYouTube(link);
  if (youtube) return { tipo: "iframe", src: `https://www.youtube.com/embed/${youtube}` };

  const vimeo = idVimeo(link);
  if (vimeo) return { tipo: "iframe", src: `https://player.vimeo.com/video/${vimeo}` };

  const drive = idDrive(link);
  if (drive) return { tipo: "iframe", src: `https://drive.google.com/file/d/${drive}/preview` };

  // arquivo enviado do aparelho (vive no armazenamento do banco) ou link direto
  if (!ehLink(link) || EXTENSAO_DE_VIDEO.test(link)) {
    return { tipo: "arquivo", src: link };
  }

  // link desconhecido (ex.: uma página com o vídeo): oferece abrir em nova guia
  return { tipo: "link", src: link };
}
