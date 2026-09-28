// protecaoEdicao.ts
//
// Proteção contra apagar texto sem querer no painel.
//
// Por que existe: o formulário grava TODOS os campos de uma vez. Se uma aba do
// painel estiver aberta desde antes de alguém mexer no banco (restauração,
// correção, outra pessoa), aquela aba tem os campos como estavam quando abriu —
// e um "Salvar alterações" grava por cima, apagando o que já estava lá.
//
// Aqui só se compara: o que o banco tem hoje x o que está prestes a ser gravado.
// Nada é corrigido automaticamente — o painel apenas avisa antes de gravar.

/** Campos de texto/lista do território, com o nome que a autoria conhece. */
export const ROTULOS_CAMPOS: Record<string, string> = {
  camadas: "Camadas",
  contexto: "Contexto",
  criacao: "Criação",
  funcao: "Função",
  transformacoes: "Transformações",
  status: "Status",
  observacao: "Observação",
  descricao: "Descrição",
  observar: "Para observar durante a visita",
  pergunta: "Pergunta para reflexão",
  video: "Vídeo",
  idade_camadas: "Idade das camadas",
  imagem_credito: "Crédito da foto principal",
};

function vazio(valor: unknown): boolean {
  if (valor === null || valor === undefined) return true;
  if (typeof valor === "string") return valor.trim() === "";
  if (Array.isArray(valor)) return valor.length === 0;
  return false;
}

function quantidade(valor: unknown): string {
  if (Array.isArray(valor)) {
    return `${valor.length} ${valor.length === 1 ? "item" : "itens"}`;
  }
  return "conteúdo";
}

/**
 * Campos que o painel vai gravar vazios embora o banco tenha conteúdo hoje.
 * Campos ausentes da gravação (não serão tocados) são ignorados.
 */
export function camposQueSeraoApagados(
  banco: Record<string, unknown>,
  novo: Record<string, unknown>
): string[] {
  const perdidos: string[] = [];

  for (const [campo, rotulo] of Object.entries(ROTULOS_CAMPOS)) {
    if (!(campo in novo)) continue;
    if (!vazio(banco[campo]) && vazio(novo[campo])) {
      perdidos.push(`${rotulo} (${quantidade(banco[campo])})`);
    }
  }

  return perdidos;
}

/** Texto do aviso mostrado antes de gravar; null quando não há nada a perder. */
export function avisoDeApagamento(perdidos: string[]): string | null {
  if (perdidos.length === 0) return null;

  return (
    "Atenção: salvar agora vai apagar conteúdo que já está no banco em:\n\n" +
    perdidos.map((p) => `• ${p}`).join("\n") +
    "\n\nSe não quiser apagar, clique em Cancelar, aperte F5 no painel e edite de novo."
  );
}
