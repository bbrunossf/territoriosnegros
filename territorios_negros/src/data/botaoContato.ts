// src/data/botaoContato.ts
//
// O botão de ação "Enviar uma mensagem" que aparece no FIM das telas do app.
//
// Regras:
//  - a capa (tela inicial) NUNCA recebe o botão;
//  - a página de contato também não (o formulário já está lá);
//  - a autoria liga/desliga tudo com um clique e pode esconder tela por tela;
//  - se a página já tem um botão que leva para /contato, não aparece de novo.
//
// Fica salvo em app_config, na chave "botao_contato" (nenhuma migração de banco).

export const TEXTO_PADRAO = "Enviar uma mensagem";

export interface BotaoContato {
  /** interruptor geral: desligado, não aparece em nenhuma tela */
  ativo: boolean;
  /** texto do botão (editável no painel) */
  texto: string;
  /** telas onde o botão fica escondido, mesmo com o interruptor ligado */
  ocultar: string[];
}

/** As telas do app que podem receber o botão (a capa e o contato ficam fora). */
export const TELAS_BOTAO: { chave: string; nome: string }[] = [
  { chave: "intro", nome: "Introdução" },
  { chave: "conceito", nome: "Conceito" },
  { chave: "vitoria", nome: "A cidade de Vitória" },
  { chave: "roteiros", nome: "Roteiros (lista)" },
  { chave: "percurso", nome: "Página de uma rota" },
  { chave: "territorios", nome: "Territórios (lista)" },
  { chave: "territorio", nome: "Ficha de um território" },
  { chave: "evento", nome: "Próximo evento" },
  { chave: "fim", nome: "Fim do percurso" },
  { chave: "apoiadores", nome: "Apoiadores" },
];

export const BOTAO_CONTATO_PADRAO: BotaoContato = {
  ativo: true,
  texto: TEXTO_PADRAO,
  ocultar: [],
};

function textoDe(valor: unknown, reserva: string): string {
  return typeof valor === "string" && valor.trim() ? valor.trim() : reserva;
}

/** Configuração vinda do banco: qualquer valor estranho volta ao padrão. */
export function normalizarBotaoContato(valor: unknown): BotaoContato {
  if (!valor || typeof valor !== "object") return BOTAO_CONTATO_PADRAO;

  const v = valor as Record<string, unknown>;

  const chavesValidas = TELAS_BOTAO.map((t) => t.chave);

  return {
    // só fica desligado se a autoria desligar de propósito
    ativo: v.ativo !== false,
    texto: textoDe(v.texto, TEXTO_PADRAO),
    ocultar: Array.isArray(v.ocultar)
      ? v.ocultar.filter(
          (o): o is string => typeof o === "string" && chavesValidas.includes(o)
        )
      : [],
  };
}

/** A tela é uma das que podem receber o botão? (capa e contato nunca) */
export function telaAceitaBotao(tela: string): boolean {
  return TELAS_BOTAO.some((t) => t.chave === tela);
}

/** O botão deve aparecer nesta tela? */
export function mostrarBotaoContato(tela: string, valor: unknown): boolean {
  const config = normalizarBotaoContato(valor);

  if (!config.ativo) return false;
  if (!telaAceitaBotao(tela)) return false;

  return !config.ocultar.includes(tela);
}

/** A página já tem um botão apontando para a página de contato? */
export function jaTemBotaoDeContato(
  botoes: { url?: string }[] | undefined
): boolean {
  return (botoes ?? []).some((b) => (b?.url ?? "").replace(/\/+$/, "") === "/contato");
}
