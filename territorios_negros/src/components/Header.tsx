

// import LOGO from "../assets/logo.png";
// // const LOGO = "/mnt/data/assinatura - logo - AFS sem fundo(1).png";

// type Props = {
//   setTela: (tela: string) => void;
// };

// export default function Header({ setTela }: Props) {
//   return (
//     <header className="header">
//       <button
//         className="header-home-btn"
//         onClick={() => setTela("home")}
//       >
//         ⌂
//       </button>

//       <img
//         src={LOGO}
//         alt="Logo AFS"
//         className="header-logo"
//       />
//     </header>
//   );
// }

// Header.tsx — sem prop setTela
import { Link } from "react-router-dom";
import LOGO from "../assets/logo.png";

export default function Header() {
  return (
    <header className="header">
      <Link to="/" className="header-home-btn">⌂</Link>
      <img src={LOGO} alt="Logo AFS" className="header-logo" />
    </header>
  );
}
