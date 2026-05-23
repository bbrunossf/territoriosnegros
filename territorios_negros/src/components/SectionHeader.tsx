
type Props = {
  title: string;
};

export default function SectionHeader({
  title,
}: Props) {
  return (
    <h3 className="section-header">
      {title}
    </h3>
  );
}
