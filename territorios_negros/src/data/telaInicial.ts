// src/data/telaInicial.ts
//
// Conteúdo da tela inicial que a autoria edita no painel (aba "Página inicial")
// e que não faz parte do aviso de próximo evento:
//
//   app_config.capa_inicial -> { url, credito }      (imagem de fundo da capa)
//   app_config.tela_inicial -> { selo, botao_inscricao, botao_inicio, autoria }
//
// Se a chave não existir — ou vier vazia — o app usa a arte e os textos
// originais definidos aqui. Assim nada muda para quem já está publicado.

export interface CapaInicial {
  /** imagem de fundo enviada no painel (vazio = arte original do app) */
  url: string;
  /** crédito da imagem de capa (autoria, acervo, fonte) */
  credito: string;
}

export interface TextosIniciais {
  /** faixa acima do título do evento ("Próximo evento disponível") */
  selo: string;
  /** rótulo do botão de inscrição dentro do cartão do evento */
  botaoInscricao: string;
  /** texto do botão principal, que abre a leitura da cidade */
  botaoInicio: string;
  /** linha de autoria no rodapé da tela inicial */
  autoria: string;
}

export const TELA_INICIAL_PADRAO: TextosIniciais = {
  selo: "Próximo evento disponível",
  botaoInscricao: "Clique aqui e se inscreva",
  botaoInicio:
    "Iniciar a leitura da cidade de Vitória - ES a partir dos territórios negros",
  autoria: "Aingrid Fabiane de Souza — Licenciada em Geografia (UFES)",
};

/** campo de texto com reserva: vazio no painel = texto original */
function texto(valor: unknown, padrao: string): string {
  return typeof valor === "string" && valor.trim() ? valor : padrao;
}

export function normalizarTextosIniciais(valor: unknown): TextosIniciais {
  if (!valor || typeof valor !== "object") return TELA_INICIAL_PADRAO;

  const v = valor as Record<string, unknown>;

  return {
    selo: texto(v.selo, TELA_INICIAL_PADRAO.selo),
    botaoInscricao: texto(v.botao_inscricao, TELA_INICIAL_PADRAO.botaoInscricao),
    botaoInicio: texto(v.botao_inicio, TELA_INICIAL_PADRAO.botaoInicio),
    autoria: texto(v.autoria, TELA_INICIAL_PADRAO.autoria),
  };
}

export function normalizarCapa(valor: unknown): CapaInicial {
  if (!valor || typeof valor !== "object") return { url: "", credito: "" };

  const v = valor as Record<string, unknown>;

  return {
    url: typeof v.url === "string" ? v.url : "",
    credito: typeof v.credito === "string" ? v.credito : "",
  };
}
