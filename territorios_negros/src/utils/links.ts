// src/utils/links.ts
//
// Rótulo curto do site de um link externo. Serve para o selo dos cartões de
// "Produções associadas ao projeto" (Base teórica) — é o que diz ao visitante
// que o item abre fora do app, em vez de parecer mais um trecho de texto.

/** "YouTube", "Instagram", "Spotify"… ou o próprio domínio. Vazio se não for link. */
export function rotuloDoSite(url: string): string {
  let host: string;

  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }

  if (/(^|\.)youtube\.com$/.test(host) || /(^|\.)youtu\.be$/.test(host)) return "YouTube";
  if (/(^|\.)instagram\.com$/.test(host)) return "Instagram";
  if (/(^|\.)facebook\.com$/.test(host)) return "Facebook";
  if (/(^|\.)spotify\.com$/.test(host)) return "Spotify";
  if (/(^|\.)vimeo\.com$/.test(host)) return "Vimeo";
  if (/(^|\.)repositorio\.ufes\.br$/.test(host)) return "Repositório da UFES";

  return host;
}
