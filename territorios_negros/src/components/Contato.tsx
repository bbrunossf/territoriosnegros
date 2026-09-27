// Contato.tsx — formulário simples (nome, e-mail, whatsapp e mensagem)
import { useState } from "react";

import PaginaConteudo from "../components/PaginaConteudo";
import { enviarMensagem } from "../data/api";
import { useTerritorios } from "../context/useTerritorios";
import { CONTATO_PADRAO, normalizarPagina } from "../data/paginas";

export default function Contato() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [enviando, setEnviando] = useState(false);
  const [ok, setOk] = useState(false);
  const [erro, setErro] = useState("");

  // título e texto de abertura são editáveis no painel (aba Páginas)
  const { config } = useTerritorios();
  const pagina = normalizarPagina(config.pagina_contato, CONTATO_PADRAO);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setOk(false);

    if (!nome.trim() || !mensagem.trim()) {
      setErro("Preencha o nome e a mensagem.");
      return;
    }

    setEnviando(true);

    try {
      await enviarMensagem({ nome, email, whatsapp, mensagem });
      setOk(true);
      setNome("");
      setEmail("");
      setWhatsapp("");
      setMensagem("");
    } catch (e) {
      console.error(e);
      setErro(
        e instanceof Error
          ? `Não foi possível enviar: ${e.message}`
          : "Não foi possível enviar a mensagem."
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <PaginaConteudo pagina={pagina}>
      <form className="admin-form contato-form" onSubmit={enviar}>
        <input
          type="text"
          placeholder="Nome *"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="tel"
          placeholder="WhatsApp (com DDD)"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
        />

        <textarea
          placeholder="Mensagem *"
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          rows={5}
          required
        />

        {erro && <p className="form-erro">{erro}</p>}

        {ok && (
          <p className="form-ok">
            Mensagem enviada. Obrigada!
          </p>
        )}

        <button type="submit" className="btn" disabled={enviando}>
          {enviando ? "Enviando..." : "Enviar mensagem"}
        </button>
      </form>
    </PaginaConteudo>
  );
}
