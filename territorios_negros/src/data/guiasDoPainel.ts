// guiasDoPainel.ts — as guias de dentro da aba "Páginas" do painel.
//
// Pedido da autoria (02/10/2026): juntar numa só tela o que estava espalhado pelo
// menu do painel, na seguinte ordem:
//   Página Inicial, Conceito, Vitória, Presença Negra, Personalidades, Menu Mais,
//   Antes, Categorias, Botões, Fim, Contato
// (Apoiadores entrou logo depois de "Antes" — a autoria citou a seção entre as que
// viraram guia; se ela quiser em outro lugar, é só mudar a ordem desta lista.)
//
// A ORDEM DESTA LISTA É A ORDEM DAS GUIAS — mexer aqui é mexer no painel inteiro.
// Cada guia aponta para o endereço que já existia (nada de rota nova): as guias
// das páginas do app usam "?p=<slug>" na tela das Páginas, e as demais têm tela
// própria. Assim o endereço continua podendo ser guardado e compartilhado.

export interface GuiaDoPainel {
  /** identificação curta, usada nas provas */
  id: string;
  /** o nome que a autoria lê na guia */
  rotulo: string;
  /** para onde a guia leva */
  rota: string;
}

/** As guias da aba "Páginas", na ordem pedida pela autoria. */
export const GUIAS_DO_PAINEL: GuiaDoPainel[] = [
  { id: "inicio", rotulo: "Página Inicial", rota: "/admin/inicio" },
  { id: "conceito", rotulo: "Conceito", rota: "/admin/paginas?p=conceito" },
  { id: "vitoria", rotulo: "Vitória", rota: "/admin/paginas?p=vitoria" },
  { id: "presenca-negra", rotulo: "Presença Negra", rota: "/admin/paginas?p=presenca-negra" },
  { id: "personalidades", rotulo: "Personalidades", rota: "/admin/personalidades" },
  { id: "menu-mais", rotulo: "Menu Mais", rota: "/admin/menu-mais" },
  { id: "antes", rotulo: "Antes", rota: "/admin/paginas?p=antes" },
  { id: "apoiadores", rotulo: "Apoiadores", rota: "/admin/apoiadores" },
  { id: "categorias", rotulo: "Categorias", rota: "/admin/categorias" },
  { id: "botoes", rotulo: "Botões", rota: "/admin/botoes" },
  { id: "fim", rotulo: "Fim", rota: "/admin/paginas?p=fim" },
  { id: "contato", rotulo: "Contato", rota: "/admin/paginas?p=contato" },
];

/** As guias que abrem uma página do app dentro da tela das Páginas. */
export const GUIAS_DE_PAGINA = GUIAS_DO_PAINEL.filter((g) => g.rota.startsWith("/admin/paginas?p="));

/** O endereço de uma página do app dentro da tela das Páginas. */
export function enderecoDaPagina(slug: string): string {
  return `/admin/paginas?p=${slug}`;
}

/**
 * A tela do painel está dentro do grupo das guias? (serve para o painel decidir
 * se mostra a barra de guias acima do conteúdo)
 */
export function dentroDasGuias(caminho: string): boolean {
  const soCaminho = (caminho ?? "").split("?")[0];

  return GUIAS_DO_PAINEL.some((g) => g.rota.split("?")[0] === soCaminho);
}

/** Qual guia está aberta agora (comparando endereço inteiro, com o "?p="). */
export function guiaAberta(caminho: string, busca: string): GuiaDoPainel | undefined {
  const soCaminho = (caminho ?? "").split("?")[0];
  const comBusca = `${soCaminho}${busca ?? ""}`;

  return (
    GUIAS_DO_PAINEL.find((g) => g.rota === comBusca) ??
    GUIAS_DO_PAINEL.find((g) => g.rota.split("?")[0] === soCaminho && !g.rota.includes("?"))
  );
}
