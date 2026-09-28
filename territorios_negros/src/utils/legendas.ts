// legendas.ts
//
// Legenda inicial das fotos enviadas pelo painel.
//
// A autoria envia dezenas de fotos e depois renomeia tudo à mão. Aqui a foto já
// entra com o nome do arquivo como legenda (sem extensão, com hífens e
// sublinhados virando espaço) — no painel ela só ajusta o que precisar.

/**
 * "igreja-rosario_fachada.JPG" -> "igreja rosario fachada"
 * Arquivo sem nome útil (ex.: ".DS_Store") devolve "".
 */
export function legendaDoArquivo(nomeArquivo: string): string {
  const semPasta = nomeArquivo.split(/[\\/]/).pop() ?? nomeArquivo;
  const semExtensao = semPasta.replace(/\.[^.]+$/, "");

  return semExtensao.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
}
