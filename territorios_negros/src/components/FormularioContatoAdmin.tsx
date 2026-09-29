// FormularioContatoAdmin.tsx — edição do formulário "Fale com a autoria"
//
// Fica embaixo do editor da página Contato (aba Páginas), porque é lá que a
// autoria mexe nessa tela. Grava em app_config na chave "formulario_contato".
import "../styles.css";

import { useEffect, useState } from "react";
import { salvarConfig } from "../data/api";
import { useTerritorios } from "../context/useTerritorios";
import {
  FORMULARIO_PADRAO,
  normalizarFormulario,
  formularioParaBanco,
  rotuloComObrigatorio,
  type FormularioContato,
} from "../data/formularioContato";
import { formatarDataHoraBR } from "../utils/data";

export default function FormularioContatoAdmin() {
  const { config, recarregar } = useTerritorios();

  const [form, setForm] = useState<FormularioContato>(FORMULARIO_PADRAO);
  const [salvando, setSalvando] = useState(false);
  const [ok, setOk] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    (async () => {
      await Promise.resolve();
      if (!ativo) return;

      setForm(normalizarFormulario(config.formulario_contato));
      setOk("");
      setErro("");
    })();

    return () => {
      ativo = false;
    };
  }, [config]);

  function set<K extends keyof FormularioContato>(
    campo: K,
    valor: FormularioContato[K]
  ) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setOk("");
    setErro("");
    setSalvando(true);

    try {
      await salvarConfig("formulario_contato", formularioParaBanco(form));
      await recarregar();
      setOk(`Formulário publicado em ${formatarDataHoraBR(new Date().toISOString())}.`);
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao salvar o formulário.");
    } finally {
      setSalvando(false);
    }
  }

  /** como os campos vão aparecer para o visitante */
  const previa = [
    rotuloComObrigatorio(form.nomeRotulo, form.nomeObrigatorio),
    form.emailMostrar
      ? rotuloComObrigatorio(form.emailRotulo, form.emailObrigatorio)
      : null,
    form.whatsappMostrar
      ? rotuloComObrigatorio(form.whatsappRotulo, form.whatsappObrigatorio)
      : null,
    rotuloComObrigatorio(form.mensagemRotulo, form.mensagemObrigatoria),
  ].filter(Boolean) as string[];

  return (
    <form className="admin-form admin-subsecao" onSubmit={salvar}>
      <h2>Formulário de contato (o que o visitante preenche)</h2>

      <p className="admin-ajuda">
        Aqui você muda os campos do formulário “Fale com a autoria”: quais aparecem, quais
        são obrigatórios (levam <b> * </b>) e os textos. O visitante recebe o aviso “Preencha:
        …” quando deixar um campo obrigatório em branco. O formulário tem uma pergunta de
        soma e uma proteção invisível contra robôs — essas duas ficam fixas. Publica ao
        clicar em <b>Salvar formulário</b>.
      </p>

      {ok && <p className="admin-ok">{ok}</p>}
      {erro && <p className="admin-erro">{erro}</p>}

      <label className="admin-campo">
        Campo “Nome” — texto que aparece no campo
        <input
          type="text"
          value={form.nomeRotulo}
          onChange={(e) => set("nomeRotulo", e.target.value)}
        />
      </label>

      <label className="admin-check">
        <input
          type="checkbox"
          checked={form.nomeObrigatorio}
          onChange={(e) => set("nomeObrigatorio", e.target.checked)}
        />
        Nome obrigatório
      </label>

      <hr className="admin-divisor" />

      <label className="admin-check">
        <input
          type="checkbox"
          checked={form.emailMostrar}
          onChange={(e) => set("emailMostrar", e.target.checked)}
        />
        Pedir e-mail no formulário
      </label>

      {form.emailMostrar && (
        <>
          <input
            type="text"
            placeholder="Texto do campo (ex: E-mail)"
            value={form.emailRotulo}
            onChange={(e) => set("emailRotulo", e.target.value)}
          />

          <label className="admin-check">
            <input
              type="checkbox"
              checked={form.emailObrigatorio}
              onChange={(e) => set("emailObrigatorio", e.target.checked)}
            />
            E-mail obrigatório
          </label>
        </>
      )}

      <hr className="admin-divisor" />

      <label className="admin-check">
        <input
          type="checkbox"
          checked={form.whatsappMostrar}
          onChange={(e) => set("whatsappMostrar", e.target.checked)}
        />
        Pedir WhatsApp no formulário
      </label>

      {form.whatsappMostrar && (
        <>
          <input
            type="text"
            placeholder="Texto do campo (ex: WhatsApp (com DDD))"
            value={form.whatsappRotulo}
            onChange={(e) => set("whatsappRotulo", e.target.value)}
          />

          <label className="admin-check">
            <input
              type="checkbox"
              checked={form.whatsappObrigatorio}
              onChange={(e) => set("whatsappObrigatorio", e.target.checked)}
            />
            WhatsApp obrigatório
          </label>

          <label className="admin-campo">
            Aviso abaixo do campo de WhatsApp (deixe vazio para não aparecer)
            <textarea
              rows={2}
              value={form.whatsappAjuda}
              onChange={(e) => set("whatsappAjuda", e.target.value)}
            />
          </label>

          {!form.whatsappObrigatorio && (
            <p className="admin-ajuda">
              O aviso acima ainda fala em obrigatório: ajuste o texto dele se você deixar
              o WhatsApp como opcional.
            </p>
          )}
        </>
      )}

      <hr className="admin-divisor" />

      <label className="admin-campo">
        Campo “Mensagem” — texto que aparece no campo
        <input
          type="text"
          value={form.mensagemRotulo}
          onChange={(e) => set("mensagemRotulo", e.target.value)}
        />
      </label>

      <label className="admin-check">
        <input
          type="checkbox"
          checked={form.mensagemObrigatoria}
          onChange={(e) => set("mensagemObrigatoria", e.target.checked)}
        />
        Mensagem obrigatória
      </label>

      <hr className="admin-divisor" />

      <label className="admin-campo">
        Texto do botão de envio
        <input
          type="text"
          placeholder="Ex: Enviar mensagem"
          value={form.botao}
          onChange={(e) => set("botao", e.target.value)}
        />
      </label>

      <label className="admin-campo">
        Aviso depois que a mensagem é enviada
        <input
          type="text"
          placeholder="Ex: Mensagem enviada. Obrigada!"
          value={form.sucesso}
          onChange={(e) => set("sucesso", e.target.value)}
        />
      </label>

      <p className="admin-ajuda">
        <b>Como vai ficar:</b> {previa.map((p) => `“${p}”`).join(" · ")} — botão “
        {form.botao}”.
      </p>

      <div className="admin-form-botoes">
        <button type="submit" className="btn" disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar formulário"}
        </button>

        <button
          type="button"
          className="outline"
          onClick={() => {
            if (
              window.confirm(
                "Voltar ao formulário original do app? Suas alterações não salvas serão perdidas."
              )
            ) {
              setForm(FORMULARIO_PADRAO);
              setOk('Formulário original carregado. Clique em "Salvar formulário".');
            }
          }}
        >
          restaurar formulário original
        </button>
      </div>
    </form>
  );
}
