import type { ReactNode } from "react";

type Props = {
  icon: string;
  title: string;
  children: ReactNode;
};

export default function Topic({
  icon,
  title,
  children,
}: Props) {
  return (
    <section className="topic">
      <h3 className="topic-title">
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
