
type Props = {
  title: string;
};

export default function SectionHeader({
  title,
}: Props) {
  return (
    <div className="section-caixa">
      <h3 className="section-header">
        {title}
      </h3>
    </div>
  );
}
