// BotoesAdmin.tsx — aba "Botões" do painel.
//
// Aqui a autoria muda os NOMES dos seis botões de navegação da tela "Antes de
// caminhar". A ordem e os destinos são do app (não mudam por aqui) — o que muda
// é só o texto que o visitante lê.
//
// Grava em app_config, na chave "botoes_intro", num objeto do tipo
// { "/conceito": "Base teórica", ... }. Nome em branco = volta ao nome padrão.
// Nada vai ao ar sem "Salvar alterações".
import "../styles.css";

import { useEffect, useState } from "react";

import { salvarConfig } from "../data/api";
import { useTerritorios } from "../context/useTerritorios";
import {
  BOTOES_DA_INTRO,
  CHAVE_BOTOES_INTRO,
  botoesDaIntro,
  lerNomes,
  nomePadraoDoBotao,
} from "../data/botoesIntro";

export default function BotoesAdmin() {
  const { config, recarregar } = useTerritorios();

  // o estado começa já com o que está gravado, para a tela não piscar vazia
  const [nomes, setNomes] = useState<Record<string, string>>(() =>
    lerNomes(config[CHAVE_BOTOES_INTRO])
  );

  const [ok, setOk] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let ativo = true;

    (async () => {
      // espera um tick para não disparar render em cascata dentro do efeito
      await Promise.resolve();
      if (!ativo) return;

      setNomes(lerNomes(config[CHAVE_BOTOES_INTRO]));
    })();

    return () => {
      ativo = false;
    };
  }, [config]);

  function mudar(caminho: string, valor: string) {
    setNomes((atual) => {
      const copia = { ...atual };

      if (valor.trim()) {
        copia[caminho] = valor;
      } else {
        delete copia[caminho];
      }

      return copia;
    });
  }

  function descartar() {
    setNomes(lerNomes(config[CHAVE_BOTOES_INTRO]));
    setErro("");
    setOk("Mostrando o que está publicado — o que não foi salvo saiu da tela.");
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();

    setOk("");
    setErro("");
    setSalvando(true);

    try {
      await salvarConfig(CHAVE_BOTOES_INTRO, nomes);
      await recarregar();
      setOk("Nomes dos botões salvos — já valem no app.");
    } catch (err) {
      console.error(err);
      setErro(err instanceof Error ? err.message : "Falha ao salvar os nomes.");
    } finally {
      setSalvando(false);
    }
  }

  const comoFica = botoesDaIntro([], nomes).map((b) => b.texto);

  return (
    <div className="botoes-admin">
      <h1>Botões</h1>

      <p className="admin-ajuda">
        Aqui você muda os <b>nomes</b> dos botões da tela <b>Antes de caminhar</b>. A{" "}
        <b>ordem</b> e <b>para onde</b> cada um leva são do app: não mudam por aqui. Deixar um
        nome em branco faz ele voltar ao padrão. Nada vai ao ar sem <b>Salvar alterações</b>.
      </p>

      <p className="admin-ajuda">
        Como o visitante vai ler, de cima para baixo: <b>{comoFica.join(" · ")}</b> — e, no fim,
        o botão <b>Enviar uma mensagem</b>, separado por um respiro maior.
      </p>

      {ok && <p className="admin-ok">{ok}</p>}
      {erro && <p className="admin-erro">{erro}</p>}

      <form className="admin-form" onSubmit={salvar}>
        <h2>Nome de cada botão</h2>

        {BOTOES_DA_INTRO.map((botao, i) => (
          <label className="admin-campo" key={botao.url}>
            <b>
              {i + 1}. {nomePadraoDoBotao(botao.url)}
            </b>
            <span className="admin-campo-dica">
              Abre a página <b>{botao.url}</b>. Em branco, volta ao nome “{botao.texto}”.
            </span>
            <input
              type="text"
              placeholder="Ex: Teoria e fundamentos"
              value={nomes[botao.url] ?? ""}
              onChange={(e) => mudar(botao.url, e.target.value)}
            />
          </label>
        ))}

        <div className="admin-form-botoes">
          <button type="button" className="outline" onClick={descartar}>
            Descartar mudanças
          </button>

          <button type="submit" className="btn" disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
