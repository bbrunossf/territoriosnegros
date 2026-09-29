import type { ReactNode } from "react";

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
  return (
    <section className={`topic ${className ?? ""}`.trim()}>
      <h3 className={`topic-title ${titleClassName ?? ""}`.trim()}>
        <span className="topic-icon">
          {icon}
        </span>

        {title}
      </h3>

      <div className="topic-line" />

      {children}
    </section>
  );
}
