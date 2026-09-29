type Props = {
  title: string;
  subtitle?: string;
  /** classes de formatação do título (ex: titulo-grande, alin-centro, cor-marrom) */
  titleClassName?: string;
  /** classes de formatação do subtítulo */
  subtitleClassName?: string;
};

export default function PageTitle({
  title,
  subtitle,
  titleClassName,
  subtitleClassName,
}: Props) {
  return (
    <>
      <h1 className={`page-title ${titleClassName ?? ""}`.trim()}>
        {title}
      </h1>

      {subtitle && (
        <p className={`page-subtitle ${subtitleClassName ?? ""}`.trim()}>
          {subtitle}
        </p>
      )}

      <div className="page-line" />
    </>
  );
}
