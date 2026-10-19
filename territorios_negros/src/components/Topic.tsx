import { Children, isValidElement, type ReactNode } from "react";

type Props = {
  icon: string;
  title: string;
  children: ReactNode;
  /** classes extras (ex: formatação escolhida no painel: texto-grande, alin-centro) */
  className?: string;
  /** classes de formatação do título da seção (ex: titulo-grande, cor-dourado) */
  titleClassName?: string;
};

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
   * 14/10/2026): as seções deixam de ficar "soltas" no fundo da página.
   *
   * Os parágrafos que abrem a seção são os explicativos e entram na caixa. O que
   * vem depois (listas, caixas de destaque, fotos, marcos) continua fora, para
   * não aninhar cartão dentro de cartão.
   */
  const filhos = Children.toArray(children);

  let corte = 0;

  while (
    corte < filhos.length &&
    isValidElement(filhos[corte]) &&
    (filhos[corte] as { type?: unknown }).type === "p"
  ) {
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
