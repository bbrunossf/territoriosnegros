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

/** Os rótulos da tela da ficha de inscrição (`/evento/ficha`), editáveis no
 *  painel (chave `ficha_textos`). Antes eram texto fixo no componente — o último
 *  ponto sem controle apontado pela revisão geral de 14/10/2026. */
export interface TextosDaFicha {
  titulo: string;
  voltarEvento: string;
  voltarInicio: string;
}

export const FICHA_TEXTOS_PADRAO: TextosDaFicha = {
  titulo: "Ficha de inscrição",
  voltarEvento: "Voltar para as informações do evento",
  voltarInicio: "Voltar para a tela inicial",
};

const texto = (valor: unknown) => (typeof valor === "string" ? valor.trim() : "");

/**
 * Campo em branco volta ao padrão: nenhum botão de volta pode ficar sem rótulo,
 * senão o visitante que não está acostumado com o app não sabe como sair.
 */
export function textosDaFicha(valor: unknown): TextosDaFicha {
  if (!valor || typeof valor !== "object") return FICHA_TEXTOS_PADRAO;

  const guardado = valor as Record<string, unknown>;

  return {
    titulo: texto(guardado.titulo) || FICHA_TEXTOS_PADRAO.titulo,
    voltarEvento: texto(guardado.voltarEvento) || FICHA_TEXTOS_PADRAO.voltarEvento,
    voltarInicio: texto(guardado.voltarInicio) || FICHA_TEXTOS_PADRAO.voltarInicio,
  };
}

