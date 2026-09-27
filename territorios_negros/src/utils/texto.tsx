import { Fragment, type ReactNode } from "react";

/** Texto com **negrito** e *itálico* — a mesma marcação usada no painel. */
export function formatarInline(texto: string): ReactNode[] {
  return texto.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((parte, i) => {
    if (parte.startsWith("**") && parte.endsWith("**") && parte.length > 4) {
      return <b key={i}>{parte.slice(2, -2)}</b>;
    }

    if (parte.startsWith("*") && parte.endsWith("*") && parte.length > 2) {
      return <i key={i}>{parte.slice(1, -1)}</i>;
    }

    return <Fragment key={i}>{parte}</Fragment>;
  });
}

/** quebra um texto em parágrafos (linha em branco separa) */
export function paragrafosDe(texto: string): string[] {
  return texto
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
