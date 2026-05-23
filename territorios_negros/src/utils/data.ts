export function calcularIdade(anoReferencia, data = new Date()) {
  const ano = Number(anoReferencia);
  if (anoReferencia === undefined || anoReferencia === null || anoReferencia === "" || Number.isNaN(ano)) return null;
  return data.getFullYear() - ano;
}

export function idadeTexto(ano, sufixo = "") {
  const idade = calcularIdade(ano);
  if (idade === null) return null;
  return `${idade} anos${sufixo ? ` ${sufixo}` : ""}`;
}

export function formatarDataAcesso(data = new Date()) {
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const ano = data.getFullYear();
  return `${dia}/${mes}/${ano}`;
}
