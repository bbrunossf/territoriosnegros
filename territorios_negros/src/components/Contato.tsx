// Contato.tsx — formulário (nome, e-mail, whatsapp e mensagem)
//
// Proteções simples contra mensagens indevidas:
//  · WhatsApp obrigatório, conferido (DDD + número)
//  · pergunta de soma ("você é uma pessoa?") que muda a cada envio
//  · campo-armadilha invisível, que só robôs preenchem
import { useState } from "react";

import PaginaConteudo from "../components/PaginaConteudo";
import { enviarMensagem } from "../data/api";
import { useTerritorios } from "../context/useTerritorios";
import { CONTATO_PADRAO, normalizarPagina } from "../data/paginas";

function novaSoma() {
  return {
    a: 2 + Math.floor(Math.random() * 8), // 2 a 9
    b: 1 + Math.floor(Math.random() * 9), // 1 a 9
  };
}

function soDigitos(txt: string) {
  return txt.replace(/\D/g, "");
}

export default function Contato() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [soma, setSoma] = useState(novaSoma);
  const [resposta, setResposta] = useState("");
  const [armadilha, setArmadilha] = useState("");

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

    // campo-armadilha preenchido = envio automático; não passa
    if (armadilha.trim()) {
      setErro("Não foi possível enviar a mensagem.");
      return;
    }

    if (!nome.trim() || !mensagem.trim()) {
      setErro("Preencha o nome e a mensagem.");
      return;
    }

    const telefone = soDigitos(whatsapp);

    if (telefone.length < 10 || telefone.length > 11) {
      setErro(
        "Informe o WhatsApp com DDD (ex: 27 99999-9999). É por ele que a autoria responde."
      );
      return;
    }

    if (Number(resposta) !== soma.a + soma.b) {
      setErro("A soma não confere. Ela serve para confirmar que você é uma pessoa.");
      setResposta("");
      setSoma(novaSoma());
      return;
    }

    setEnviando(true);

    try {
      await enviarMensagem({ nome, email, whatsapp: telefone, mensagem });
      setOk(true);
      setNome("");
      setEmail("");
      setWhatsapp("");
      setMensagem("");
      setResposta("");
      setSoma(novaSoma());
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
        />

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="tel"
          placeholder="WhatsApp (com DDD) *"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          inputMode="tel"
        />

        <p className="form-ajuda">
          O WhatsApp é obrigatório: é por ele que a autoria responde. Não será publicado.
        </p>

        <textarea
          placeholder="Mensagem *"
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          rows={5}
        />

        {/* campo-armadilha: fora da tela, pessoas não veem nem preenchem */}
        <input
          type="text"
          className="contato-armadilha"
          name="site"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={armadilha}
          onChange={(e) => setArmadilha(e.target.value)}
        />

        <div className="contato-desafio">
          <label htmlFor="contato-soma">
            Para confirmar que você é uma pessoa, quanto é{" "}
            <b>
              {soma.a} + {soma.b}
            </b>
            ?
          </label>

          <input
            id="contato-soma"
            type="text"
            placeholder="resposta"
            inputMode="numeric"
            value={resposta}
            onChange={(e) => setResposta(e.target.value)}
          />
        </div>

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
