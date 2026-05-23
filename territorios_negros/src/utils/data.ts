export function calcularIdade(
  anoReferencia: number | string,
  data: Date = new Date()
): number | null {
  const ano = Number(anoReferencia);
  if (anoReferencia === undefined || anoReferencia === null || anoReferencia === "" || Number.isNaN(ano)) return null;
  return data.getFullYear() - ano;
}

export function idadeTexto(
  ano: number | string,
  sufixo: string = ""
): string | null {
  const idade = calcularIdade(ano);
  if (idade === null) return null;
  return `${idade} anos${sufixo ? ` ${sufixo}` : ""}`;
}

export function formatarDataAcesso(
  data: Date = new Date()
): string {
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const ano = data.getFullYear();
  return `${dia}/${mes}/${ano}`;
}
