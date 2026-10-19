// src/components/IconeDeBotao.tsx
//
// Ícone de cada botão de navegação, usado no "modelo de ações" (ícone em cima,
// nome embaixo, vários por linha) pedido pela autoria em 14/10/2026 — o mesmo
// desenho de barra de ações de um app de celular: o símbolo diz o que o botão faz
// antes de a pessoa ler o nome, e a faixa não briga com o conteúdo da página.
//
// Traço de 1,7 para ficar leve como os ícones de referência; a cor vem do botão
// (currentColor), então o mesmo ícone serve para o estado normal e o ativo.
type NomeDoIcone =
  | "inicio"
  | "base-teorica"
  | "cidade-de-vitoria"
  | "presenca-negra"
  | "roteiros"
  | "territorios"
  | "apoiadores"
  | "personalidades"
  | "link";

export default function IconeDeBotao({ id }: { id: string }) {
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
    [
      "inicio",
      "base-teorica",
      "cidade-de-vitoria",
      "presenca-negra",
      "roteiros",
      "territorios",
      "apoiadores",
      "personalidades",
    ].includes(id)
      ? id
      : "link"
  ) as NomeDoIcone;

  if (nome === "inicio") {
    return (
      <svg {...comum}>
        <path d="M3.5 10.8 12 3.8l8.5 7" />
        <path d="M6 10v10h12V10" />
        <path d="M10 20v-5h4v5" />
      </svg>
    );
  }

  if (nome === "base-teorica") {
    return (
      <svg {...comum}>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
        <path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20" />
      </svg>
    );
  }

  if (nome === "cidade-de-vitoria") {
    return (
      <svg {...comum}>
        <path d="M3 21h18" />
        <path d="M5 21V9l4-2.5V21" />
        <path d="M9 21V6.5L15 4v17" />
        <path d="M15 21V10l4 2v9" />
        <path d="M11.5 9h1M11.5 13h1M11.5 17h1" />
      </svg>
    );
  }

  if (nome === "presenca-negra") {
    // Símbolo da Presença Negra (referência enviada pela autoria, 14/10/2026):
    // barra central com anéis abertos dos dois lados e pestanas nas pontas.
    // Grade de 48 para os anéis e as pestanas não se colarem nos tamanhos
    // pequenos; cor vem do contexto (dourado no menu, terracota no botão).
    return (
      <svg {...comum} viewBox="0 0 48 48" fill="none" strokeLinecap="round">
        <rect x="21.1" y="2.6" width="5.8" height="42.8" rx="0.9" fill="currentColor" stroke="none" />

        {/* anéis dos dois lados */}
        <path
          d="M21.7 13.2C13.4 11.4 5.8 15.4 5.8 24s7.6 12.6 15.9 10.8"
          strokeWidth="5.4"
          stroke="currentColor"
        />
        <path
          d="M26.3 13.2C34.6 11.4 42.2 15.4 42.2 24s-7.6 12.6-15.9 10.8"
          strokeWidth="5.4"
          stroke="currentColor"
        />

        {/* pestanas de cima */}
        <path d="M20.6 9.2C16 5.8 11 6.2 8.8 9.4" strokeWidth="4.4" stroke="currentColor" />
        <path d="M27.4 9.2C32 5.8 37 6.2 39.2 9.4" strokeWidth="4.4" stroke="currentColor" />

        {/* pestanas de baixo */}
        <path d="M20.6 38.8C16 42.2 11 41.8 8.8 38.6" strokeWidth="4.4" stroke="currentColor" />
        <path d="M27.4 38.8C32 42.2 37 41.8 39.2 38.6" strokeWidth="4.4" stroke="currentColor" />
      </svg>
    );
  }

  if (nome === "roteiros") {
    return (
      <svg {...comum}>
        <path d="M6.5 17.5c0-3.4 3.2-3.6 5.5-3.6s5.5-.2 5.5-3.6" />
        <circle cx="6.5" cy="19" r="1.9" fill="currentColor" stroke="none" />
        <circle cx="17.5" cy="7.8" r="1.9" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (nome === "territorios") {
    return (
      <svg {...comum}>
        <path d="M12 21.2s-6.4-5.6-6.4-10.6a6.4 6.4 0 0 1 12.8 0c0 5-6.4 10.6-6.4 10.6z" />
        <circle cx="12" cy="10.4" r="2.4" />
      </svg>
    );
  }

  if (nome === "apoiadores") {
    return (
      <svg {...comum}>
        <path d="M12 20.2s-7.3-4.4-7.3-9.4a4.1 4.1 0 0 1 7.3-2.5 4.1 4.1 0 0 1 7.3 2.5c0 5-7.3 9.4-7.3 9.4z" />
      </svg>
    );
  }

  if (nome === "personalidades") {
    return (
      <svg {...comum}>
        <circle cx="12" cy="8.6" r="3.6" />
        <path d="M4.8 20.2a7.2 7.2 0 0 1 14.4 0" />
      </svg>
    );
  }

  // link criado pela autoria no painel (outro endereço) ou botão sem ícone próprio
  return (
    <svg {...comum}>
      <path d="M10.5 13.5 13.5 10.5" />
      <path d="M8.6 15.4 6.9 17.1a3.4 3.4 0 0 1-4.8-4.8l2.6-2.6a3.4 3.4 0 0 1 4.8 0" />
      <path d="M15.4 8.6l1.7-1.7a3.4 3.4 0 0 1 4.8 4.8l-2.6 2.6a3.4 3.4 0 0 1-4.8 0" />
    </svg>
  );
}
