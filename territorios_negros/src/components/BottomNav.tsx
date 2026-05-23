
type Props = {
  setTela: (tela: string) => void;
};

export default function BottomNav({
  setTela,
}: Props) {
  return (
    <nav className="bottom-nav">
      <button
        className="bottom-nav-btn"
        onClick={() => setTela("home")}
      >
        ⌂
        <br />
        Início
      </button>

      <button
        className="bottom-nav-btn"
        onClick={() => setTela("intro")}
      >
        ⟲
        <br />
        Antes
      </button>

      <button
        className="bottom-nav-btn"
        onClick={() => setTela("conceito")}
      >
        ◎
        <br />
        Conceito
      </button>

      <button
        className="bottom-nav-btn"
        onClick={() => setTela("roteiros")}
      >
        ▱
        <br />
        Rotas
      </button>

      <button
        className="bottom-nav-btn"
        onClick={() => setTela("territorios")}
      >
        ●
        <br />
        Territ.
      </button>

      <button
        className="bottom-nav-btn"
        onClick={() => setTela("sobre")}
      >
        ⓘ
        <br />
        Sobre
      </button>
    </nav>
  );
}
