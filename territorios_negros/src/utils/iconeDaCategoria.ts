// src/utils/iconeDaCategoria.ts
//
// Qual símbolo usar para uma categoria de territórios. As categorias vêm do
// banco e a autoria pode criar novas (aba Categorias), então o símbolo é
// escolhido por palavra-chave do nome; nome fora de todas as palavras recebe o
// losango genérico, que continua legível como marcador de seção.
function semAcento(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function iconeDaCategoria(nome: string): string {
  const n = semAcento(nome ?? "");

  if (/religi|igreja|arquitet|capela|terr[eê]iro|culto/.test(n)) return "arquitetura";
  if (/instituc|memoria|cultura|museu|escola|associac/.test(n)) return "memoria";
  if (/monument|marco|estatua|pelourinho|memorial/.test(n)) return "monumento";
  if (/espaco|urban|infraestrut|permanenc|praca|largo|rua|territorio/.test(n)) return "espaco";

  return "geral";
}
