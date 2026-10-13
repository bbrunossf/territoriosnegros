// src/utils/nomes.ts
//
// A inicial (ou as duas letras do nome) para quem não tem foto. O app NUNCA
// inventa retrato: sem foto, entra a moldura com as iniciais.
export function iniciaisDe(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);

  if (partes.length === 0) return "•";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();

  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
}
