import '../styles.css'

// export default function Login() {
//   return (
//     <div className="login-page">
//       <form className="login-form">
//         <h1>Login</h1>

//         <input
//           type="email"
//           placeholder="E-mail"
//         />

//         <input
//           type="password"
//           placeholder="Senha"
//         />

//         <button type="submit">
//           Entrar
//         </button>
//       </form>
//     </div>
//   );
// }


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [erro, setErro] =
    useState("");

  async function entrar(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setErro("");

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      setErro(error.message);
      return;
    }

    navigate("/admin");
  }

  return (
    <div className="login-page">
      <form
        className="login-form"
        onSubmit={entrar}
      >
        <h1>Login</h1>

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        {erro && (
          <p className="login-error">
            {erro}
          </p>
        )}

        <button type="submit">
          Entrar
        </button>
      </form>
    </div>
  );
}
