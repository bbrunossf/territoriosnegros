import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * Barra fixa de salvar do painel.
 *
 * Problema que ela resolve (autoria, out/2026): a tela de um território tem
 * vários salvamentos — mídia, "Salvar ordem", marcos — e o "Salvar alterações"
 * geral fica no fim de um formulário longo. Rolar até o fim, salvar um bloco e
 * esquecer o geral era o erro mais comum.
 *
 * Como funciona: procura o formulário principal (o `<form class="admin-form">`
 * que tem um botão de enviar escrito "Salvar") e observa esse botão. Enquanto
 * ele não está na tela, ou enquanto há alteração pendente, a barra fica presa
 * no rodapé do conteúdo, com o mesmo envio do formulário.
 */
export default function BarraSalvarFixa() {
  const { pathname } = useLocation();
  const [form, setForm] = useState<HTMLFormElement | null>(null);
  const [botao, setBotao] = useState<HTMLButtonElement | null>(null);
  const [botaoVisivel, setBotaoVisivel] = useState(true);
  const [sujo, setSujo] = useState(false);

  /** o botão de enviar do formulário principal (o que diz "Salvar") */
  const acharBotao = useCallback((alvo: HTMLFormElement) => {
    const botoes = Array.from(alvo.querySelectorAll("button"));

    return (
      botoes.find(
        (b) => /salvar/i.test(b.textContent || "") && b.type !== "button",
      ) ?? null
    );
  }, []);

  // localiza o formulário principal (as telas montam o formulário depois de
  // carregar do banco, por isso fica observando o conteúdo)
  useEffect(() => {
    let observador: IntersectionObserver | null = null;
    let botaoAtual: HTMLButtonElement | null = null;

    function procurar() {
      const candidatos = Array.from(
        document.querySelectorAll<HTMLFormElement>(".admin-content form.admin-form"),
      );

      const achado = candidatos.find((f) => acharBotao(f) !== null) ?? null;
      const botao = achado ? acharBotao(achado) : null;

      if (botao === botaoAtual) return;

      observador?.disconnect();
      botaoAtual = botao;
      setForm(achado);
      setBotao(botao);
      setSujo(false);

      if (botao) {
        if (typeof IntersectionObserver === "undefined") {
          setBotaoVisivel(false);
          return;
        }

        observador = new IntersectionObserver(
          ([entrada]) => setBotaoVisivel(entrada.isIntersecting),
          { rootMargin: "0px 0px -48px 0px", threshold: 0 },
        );
        observador.observe(botao);
      }
    }

    procurar();

    const mutacoes = new MutationObserver(() => procurar());
    const conteudo = document.querySelector(".admin-content");

    if (conteudo) {
      mutacoes.observe(conteudo, { childList: true, subtree: true });
    }

    return () => {
      observador?.disconnect();
      mutacoes.disconnect();
    };
  }, [pathname, acharBotao]);

  // alteração pendente: só conta campo dentro do formulário principal
  useEffect(() => {
    if (!form) return;

    const alvoForm = form;

    function mudou(evento: Event) {
      const alvo = evento.target as HTMLElement | null;

      if (!alvo || !alvoForm.contains(alvo)) return;
      if (alvo instanceof HTMLInputElement && alvo.type === "file") return;

      setSujo(true);
    }

    function enviou(evento: Event) {
      if (evento.target === alvoForm) setSujo(false);
    }

    alvoForm.addEventListener("input", mudou);
    alvoForm.addEventListener("change", mudou);
    alvoForm.addEventListener("submit", enviou);

    return () => {
      alvoForm.removeEventListener("input", mudou);
      alvoForm.removeEventListener("change", mudou);
      alvoForm.removeEventListener("submit", enviou);
    };
  }, [form]);

  // sair da página com alteração pendente pede confirmação
  useEffect(() => {
    if (!sujo) return;

    function antesDeSair(evento: BeforeUnloadEvent) {
      evento.preventDefault();
      evento.returnValue = "";
    }

    window.addEventListener("beforeunload", antesDeSair);

    return () => window.removeEventListener("beforeunload", antesDeSair);
  }, [sujo]);

  if (!form) return null;
  if (botaoVisivel) return null;

  return (
    <>
      <div className="barra-salvar-espaco" aria-hidden="true" />

      <div className={`barra-salvar ${sujo ? "barra-salvar--sujo" : ""}`}>
        {sujo && (
          <span className="barra-salvar-texto">
            Alterações gerais não salvas
          </span>
        )}

        <button
          type="button"
          className="btn barra-salvar-btn"
          onClick={() => {
            // clica no botão verdadeiro do formulário: telas que salvam no
            // onClick do botão (e não no envio do formulário) também funcionam
            if (botao && botao.isConnected) botao.click();
            else if (form.requestSubmit) form.requestSubmit();
            else form.submit();
          }}
        >
          Salvar alterações
        </button>
      </div>
    </>
  );
}
