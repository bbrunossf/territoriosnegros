// Contato.tsx — formulário (nome, e-mail, whatsapp e mensagem)
//
// Quais campos aparecem, quais são obrigatórios e os textos são definidos pela
// autoria no painel (Páginas › Contato › Formulário de contato); sem nada
// salvo, vale o formulário padrão (igual ao que já estava no ar).
//
// Proteções simples contra mensagens indevidas:
//  · WhatsApp conferido (DDD + número)
//  · pergunta de soma ("você é uma pessoa?") que muda a cada envio
//  · campo-armadilha invisível, que só robôs preenchem
import { useState } from "react";

import PaginaConteudo from "../components/PaginaConteudo";
import { enviarMensagem } from "../data/api";
import { useTerritorios } from "../context/useTerritorios";
import { CONTATO_PADRAO, normalizarPagina } from "../data/paginas";
import {
  normalizarFormulario,
  rotuloComObrigatorio,
} from "../data/formularioContato";

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

  // título, texto de abertura e formulário são editáveis no painel
  const { config } = useTerritorios();
  const pagina = normalizarPagina(config.pagina_contato, CONTATO_PADRAO);
  const form = normalizarFormulario(config.formulario_contato);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setOk(false);

    // campo-armadilha preenchido = envio automático; não passa
    if (armadilha.trim()) {
      setErro("Não foi possível enviar a mensagem.");
      return;
    }

    // campos obrigatórios (definidos no painel) que ficaram em branco
    const faltando: string[] = [];

    if (form.nomeObrigatorio && !nome.trim()) faltando.push(form.nomeRotulo);
    if (form.emailMostrar && form.emailObrigatorio && !email.trim()) {
      faltando.push(form.emailRotulo);
    }
    if (form.whatsappMostrar && form.whatsappObrigatorio && !whatsapp.trim()) {
      faltando.push(form.whatsappRotulo);
    }
    if (form.mensagemObrigatoria && !mensagem.trim()) faltando.push(form.mensagemRotulo);

    if (faltando.length > 0) {
      setErro(`Preencha: ${faltando.join(", ")}.`);
      return;
    }

    const telefone = soDigitos(whatsapp);

    // o WhatsApp, quando preenchido, precisa ter DDD — é por ele que a
    // autoria responde
    if (telefone && (telefone.length < 10 || telefone.length > 11)) {
      setErro("Informe o WhatsApp com DDD (ex: 27 99999-9999).");
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
          placeholder={rotuloComObrigatorio(form.nomeRotulo, form.nomeObrigatorio)}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        {form.emailMostrar && (
          <input
            type="email"
            placeholder={rotuloComObrigatorio(form.emailRotulo, form.emailObrigatorio)}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        )}

        {form.whatsappMostrar && (
          <input
            type="tel"
            placeholder={rotuloComObrigatorio(
              form.whatsappRotulo,
              form.whatsappObrigatorio
            )}
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            inputMode="tel"
          />
        )}

        {form.whatsappMostrar && form.whatsappAjuda && (
          <p className="form-ajuda">{form.whatsappAjuda}</p>
        )}

        <textarea
          placeholder={rotuloComObrigatorio(
            form.mensagemRotulo,
            form.mensagemObrigatoria
          )}
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

        {ok && <p className="form-ok">{form.sucesso}</p>}

        <button type="submit" className="btn" disabled={enviando}>
          {enviando ? "Enviando..." : form.botao}
        </button>
      </form>
    </PaginaConteudo>
  );
}
