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

/** "2026-10-05" -> "05/10/2026" (aceita já em formato brasileiro). */
export function formatarDataBR(iso?: string | null): string {
  if (!iso) return "";
  const somenteData = iso.slice(0, 10);
  const partes = somenteData.split("-");
  if (partes.length !== 3) return iso;
  const [ano, mes, dia] = partes;
  if (ano.length !== 4) return iso;
  return `${dia}/${mes}/${ano}`;
}

/** "2026-10-05T13:10:00Z" -> "05/10/2026 às 13:10" */
export function formatarDataHoraBR(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso ?? "";
  const hora = String(d.getHours()).padStart(2, "0");
  const minuto = String(d.getMinutes()).padStart(2, "0");
  return `${formatarDataAcesso(d)} às ${hora}:${minuto}`;
}
