// src/components/IconeDeCategoria.tsx
//
// Símbolo de cada categoria de territórios, exibido ao lado do título da
// categoria na lista de Territórios (pedido da autoria, 14/10/2026). Desenho em
// SVG com o mesmo traço dos ícones do menu e dos botões — os glifos de texto
// usados antes (◇ ▣ ●) sumiam no tamanho pequeno.
type NomeDoIcone = "arquitetura" | "memoria" | "monumento" | "espaco" | "geral";

export default function IconeDeCategoria({ id }: { id: string }) {
  const comum = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: "false" as const,
  };

  const nome = (
    ["arquitetura", "memoria", "monumento", "espaco"].includes(id) ? id : "geral"
  ) as NomeDoIcone;

  // arquitetura e religiosidade: igreja de telhado em duas águas e cruz
  if (nome === "arquitetura") {
    return (
      <svg {...comum}>
        <path d="M4 20h16" />
        <path d="M6 20v-7l6-4.5L18 13v7" />
        <path d="M12 8.5V4" />
        <path d="M10.4 5.6h3.2" />
        <path d="M10.5 20v-4h3v4" />
      </svg>
    );
  }

  // institucionalização da memória: prédio com colunas (museu/instituição)
  if (nome === "memoria") {
    return (
      <svg {...comum}>
        <path d="M3.5 20h17" />
        <path d="M5 20V9.5h14V20" />
        <path d="M3.5 9.5 12 4l8.5 5.5" />
        <path d="M9 20v-6.5M12 20v-6.5M15 20v-6.5" />
      </svg>
    );
  }

  // monumentos e marcos de memória: obelisco sobre base
  if (nome === "monumento") {
    return (
      <svg {...comum}>
        <path d="M4 20.5h16" />
        <path d="M7 20.5h10v-2H7z" />
        <path d="M12 3.5 15 8v8.5H9V8z" />
        <path d="M10.4 11h3.2" />
      </svg>
    );
  }

  // espaços urbanos e permanência: praça com caminhos
  if (nome === "espaco") {
    return (
      <svg {...comum}>
        <path d="M4 20V8.5h6.5V20" />
        <path d="M13.5 20V4H20v16" />
        <path d="M2.5 20h19" />
        <path d="M6.5 12h1.6M6.5 15.5h1.6M16 8h2M16 11.5h2M16 15h2" />
      </svg>
    );
  }

  // categoria nova, sem palavra-chave conhecida
  return (
    <svg {...comum}>
      <path d="M12 3.6 20.4 12 12 20.4 3.6 12z" />
      <circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" />
    </svg>
  );
}
