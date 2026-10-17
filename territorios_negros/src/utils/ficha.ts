/** Converte o link salvo no painel na URL que o Google Forms aceita dentro de uma
 *  moldura. O `?embedded=true` é o modo que o próprio Google fornece para
 *  incorporar o formulário; links que não são do Google Forms (ou links curtos
 *  forms.gle) são usados como vieram. */
export function urlParaIncorporar(url: string): string {
  if (!url) return "";

  try {
    const u = new URL(url);

    if (u.hostname === "docs.google.com" && u.pathname.includes("/forms/")) {
      u.searchParams.set("embedded", "true");
      return u.toString();
    }
  } catch {
    // link inválido: devolve como veio, para o navegador tentar
  }

  return url;
}
