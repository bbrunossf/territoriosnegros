// src/utils/visibilidade.ts
//
// Regra única de "esta imagem o visitante pode ver?" usada em todo o app.
//
// A autoria bloqueia uma imagem gravando visivel = false. Imagem antiga (sem
// o campo) e imagem recém-enviada aparecem — só fica oculta se for bloqueada
// de propósito. Assim nada muda para o que já está publicado.

export interface ItemComVisibilidade {
  url?: string;
  visivel?: boolean;
}

/** Só as imagens que o visitante pode ver (e que têm endereço válido). */
export function somenteVisiveis<T extends ItemComVisibilidade>(
  itens: T[] | undefined | null
): T[] {
  return (itens ?? []).filter((item) => item && item.url && estaVisivel(item));
}

/**
 * Regra sem a exigência de URL: vale para itens que não são imagem (ex.: as
 * camadas de tempo do território, que só têm ano e rótulo).
 */
export function estaVisivel(item: ItemComVisibilidade | undefined | null): boolean {
  return item?.visivel !== false;
}

/** true quando a imagem está bloqueada para os visitantes. */
export function estaOculta(item: ItemComVisibilidade | undefined): boolean {
  return item?.visivel === false;
}
