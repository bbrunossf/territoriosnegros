// export default function Header({ setTela }) {
//   return (
//     <header style={S.header}>
//       <button onClick={() => setTela("home")} style={{ position: "absolute", left: 12, top: 10, background: "transparent", border: 0, color: "#fff1d6", fontSize: 24, cursor: "pointer" }}>⌂</button>
//       <img src={LOGO} alt="Logo AFS" style={{ width: 54, height: 40, objectFit: "contain" }} />
//     </header>
//   );
// }


import LOGO from "../assets/logo.png";
// const LOGO = "/mnt/data/assinatura - logo - AFS sem fundo(1).png";

type Props = {
  setTela: (tela: string) => void;
};

export default function Header({ setTela }: Props) {
  return (
    <header className="header">
      <button
        className="header-home-btn"
        onClick={() => setTela("home")}
      >
        ⌂
      </button>

      <img
        src={LOGO}
        alt="Logo AFS"
        className="header-logo"
      />
    </header>
  );
}
