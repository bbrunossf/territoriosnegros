// src/data/formularioContato.ts
//
// Formulário "Fale com a autoria": o que o visitante preenche no app e o que
// aparece no painel (Páginas › Contato › Formulário de contato).
//
// Gravado em app_config na chave "formulario_contato". Se a chave não existir,
// vale o conteúdo padrão definido aqui — que é exatamente o formulário que já
// está no ar, para nada mudar para quem já usa o app.

export interface FormularioContato {
  /** rótulo do campo (o app acrescenta " *" quando o campo é obrigatório) */
  nomeRotulo: string;
  nomeObrigatorio: boolean;

  emailMostrar: boolean;
  emailRotulo: string;
  emailObrigatorio: boolean;

  whatsappMostrar: boolean;
  whatsappRotulo: string;
  whatsappObrigatorio: boolean;
  /** aviso abaixo do campo de WhatsApp (vazio = não aparece) */
  whatsappAjuda: string;

  mensagemRotulo: string;
  mensagemObrigatoria: boolean;

  /** rótulo do botão de envio */
  botao: string;
  /** mensagem de confirmação depois do envio */
  sucesso: string;
}

export const FORMULARIO_PADRAO: FormularioContato = {
  nomeRotulo: "Nome",
  nomeObrigatorio: true,
  emailMostrar: true,
  emailRotulo: "E-mail",
  emailObrigatorio: false,
  whatsappMostrar: true,
  whatsappRotulo: "WhatsApp (com DDD)",
  whatsappObrigatorio: true,
  whatsappAjuda:
    "O WhatsApp é obrigatório: é por ele que a autoria responde. Não será publicado.",
  mensagemRotulo: "Mensagem",
  mensagemObrigatoria: true,
  botao: "Enviar mensagem",
  sucesso: "Mensagem enviada. Obrigada!",
};

function texto(valor: unknown, padrao: string): string {
  return typeof valor === "string" ? valor : padrao;
}

function booleano(valor: unknown, padrao: boolean): boolean {
  return typeof valor === "boolean" ? valor : padrao;
}

/** Garante que o que veio do banco tem o formato esperado (senão usa o padrão). */
export function normalizarFormulario(valor: unknown): FormularioContato {
  if (!valor || typeof valor !== "object") return FORMULARIO_PADRAO;

  const v = valor as Record<string, unknown>;

  return {
    nomeRotulo: texto(v.nome_rotulo, FORMULARIO_PADRAO.nomeRotulo),
    nomeObrigatorio: booleano(v.nome_obrigatorio, FORMULARIO_PADRAO.nomeObrigatorio),

    emailMostrar: booleano(v.email_mostrar, FORMULARIO_PADRAO.emailMostrar),
    emailRotulo: texto(v.email_rotulo, FORMULARIO_PADRAO.emailRotulo),
    emailObrigatorio: booleano(v.email_obrigatorio, FORMULARIO_PADRAO.emailObrigatorio),

    whatsappMostrar: booleano(v.whatsapp_mostrar, FORMULARIO_PADRAO.whatsappMostrar),
    whatsappRotulo: texto(v.whatsapp_rotulo, FORMULARIO_PADRAO.whatsappRotulo),
    whatsappObrigatorio: booleano(
      v.whatsapp_obrigatorio,
      FORMULARIO_PADRAO.whatsappObrigatorio
    ),
    whatsappAjuda: texto(v.whatsapp_ajuda, FORMULARIO_PADRAO.whatsappAjuda),

    mensagemRotulo: texto(v.mensagem_rotulo, FORMULARIO_PADRAO.mensagemRotulo),
    mensagemObrigatoria: booleano(
      v.mensagem_obrigatoria,
      FORMULARIO_PADRAO.mensagemObrigatoria
    ),

    botao: texto(v.botao, FORMULARIO_PADRAO.botao),
    sucesso: texto(v.sucesso, FORMULARIO_PADRAO.sucesso),
  };
}

/** Formato gravado no banco (chaves curtas, iguais ao que o app lê). */
export function formularioParaBanco(f: FormularioContato): Record<string, unknown> {
  return {
    nome_rotulo: f.nomeRotulo,
    nome_obrigatorio: f.nomeObrigatorio,
    email_mostrar: f.emailMostrar,
    email_rotulo: f.emailRotulo,
    email_obrigatorio: f.emailObrigatorio,
    whatsapp_mostrar: f.whatsappMostrar,
    whatsapp_rotulo: f.whatsappRotulo,
    whatsapp_obrigatorio: f.whatsappObrigatorio,
    whatsapp_ajuda: f.whatsappAjuda,
    mensagem_rotulo: f.mensagemRotulo,
    mensagem_obrigatoria: f.mensagemObrigatoria,
    botao: f.botao,
    sucesso: f.sucesso,
  };
}

/** Rótulo como aparece no app: acrescenta o asterisco se o campo é obrigatório. */
export function rotuloComObrigatorio(rotulo: string, obrigatorio: boolean): string {
  return obrigatorio ? `${rotulo} *` : rotulo;
}
