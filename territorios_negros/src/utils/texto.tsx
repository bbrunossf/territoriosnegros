import { Fragment, type ReactNode } from "react";

/**
 * Texto com **negrito** e *itálico* — a mesma marcação usada no painel.
 * Linha simples dentro do texto vira quebra de linha.
 */
export function formatarInline(texto: string): ReactNode[] {
  const partes = texto.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  const saida: ReactNode[] = [];

  partes.forEach((parte, i) => {
    if (!parte) return;

    if (parte.startsWith("**") && parte.endsWith("**") && parte.length > 4) {
      saida.push(<b key={`b${i}`}>{parte.slice(2, -2)}</b>);
      return;
    }

    if (parte.startsWith("*") && parte.endsWith("*") && parte.length > 2) {
      saida.push(<i key={`i${i}`}>{parte.slice(1, -1)}</i>);
      return;
    }

    parte.split("\n").forEach((linha, j) => {
      if (j > 0) saida.push(<br key={`br${i}-${j}`} />);
      if (linha) saida.push(<Fragment key={`t${i}-${j}`}>{linha}</Fragment>);
    });
  });

  return saida;
}

/** quebra um texto em parágrafos (linha em branco separa) */
export function paragrafosDe(texto: string): string[] {
  return texto
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
