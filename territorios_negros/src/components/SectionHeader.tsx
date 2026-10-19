
type Props = {
  title: string;
};

export default function SectionHeader({
  title,
}: Props) {
  // Títulos de categoria das listas ficam soltos sobre o papel de parede,
  // alinhados à esquerda (pedido da autoria, 14/10/2026) — o painel com borda é
  // só para as seções das páginas de texto.
  return (
    <h3 className="section-header">
      {title}
    </h3>
  );
}
