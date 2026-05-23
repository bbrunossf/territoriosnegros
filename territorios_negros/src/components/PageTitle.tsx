type Props = {
  title: string;
  subtitle?: string;
};

export default function PageTitle({
  title,
  subtitle,
}: Props) {
  return (
    <>
      <h1 className="page-title">
        {title}
      </h1>

      {subtitle && (
        <p className="page-subtitle">
          {subtitle}
        </p>
      )}

      <div className="page-line" />
    </>
  );
}
