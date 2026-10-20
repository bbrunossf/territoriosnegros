import { Children, isValidElement, type ReactNode } from "react";

import Numbered from "./Numbered";

type Props = {
  icon: string;
  title: string;
  children: ReactNode;
  /** classes extras (ex: formatação escolhida no painel: texto-grande, alin-centro) */
  className?: string;
  /** classes de formatação do título da seção (ex: titulo-grande, cor-dourado) */
  titleClassName?: string;
};

/** O que é explicação da seção e pode ir para dentro do retângulo dourado. */
function ehExplicacao(no: unknown): boolean {
  if (!isValidElement(no)) return false;

  const tipo = (no as { type?: unknown }).type;

  // parágrafos escritos direto na seção
  if (tipo === "p") return true;

  // listas de itens (travessões): a lista é o texto explicativo da seção
  if (tipo === Numbered) return true;

  // grade dos cartões de "Informações rápidas": o corpo daquela seção são os
  // cartões, então eles entram na caixa junto com o título
  const classe = (no as { props?: { className?: unknown } }).props?.className;

  return typeof classe === "string" && classe.includes("info-rapida-grid");
}

export default function Topic({
  icon,
  title,
  children,
  className,
  titleClassName,
}: Props) {
  /**
   * O título e o texto explicativo da seção ficam dentro de um retângulo com
   * borda dourada e fundo mais claro que o papel de parede (pedido da autoria,
   * 14/10/2026).
   *
   * Entram na caixa os parágrafos e as listas de itens que abrem a seção. O que
   * vem depois — fotos, caixas de destaque, cartões de marcos — continua fora,
   * para não aninhar cartão dentro de cartão.
   *
   * A checagem precisa reconhecer as listas pelo componente (`Numbered`): em
   * "Para observar durante a visita" o corpo da seção é uma lista, e comparar
   * só com a tag "p" deixava os itens fora, com o título sozinho na caixa.
   */
  const filhos = Children.toArray(children);

  let corte = 0;

  while (corte < filhos.length && ehExplicacao(filhos[corte])) {
    corte += 1;
  }

  const explicacao = filhos.slice(0, corte);
  const resto = filhos.slice(corte);

  return (
    <section className={`topic ${className ?? ""}`.trim()}>
      <div className="topic-caixa">
        <h3 className={`topic-title ${titleClassName ?? ""}`.trim()}>
          <span className="topic-icon">
            {icon}
          </span>

          {title}
        </h3>

        <div className="topic-line" />

        {explicacao}
      </div>

      {resto}
    </section>
  );
}
