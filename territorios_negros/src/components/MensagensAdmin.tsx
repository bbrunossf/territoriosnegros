// MensagensAdmin.tsx — caixa de entrada do formulário "Fale com a autoria"
//
// A lista se atualiza sozinha a cada 30 segundos: quem fica com o painel aberto
// vê a mensagem nova aparecer sem precisar recarregar a página. O contador da
// aba "Mensagens" (e do título da janela) é atualizado pelo próprio painel.
import "../styles.css";

import { useCallback, useEffect, useState } from "react";
import { excluirMensagem, fetchMensagens, marcarMensagem } from "../data/api";
import type { Mensagem } from "../data/types";
import { formatarDataHoraBR } from "../utils/data";

/** de quanto em quanto tempo a caixa de entrada se atualiza (ms) */
const INTERVALO = 30000;

export default function MensagensAdmin() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [ok, setOk] = useState("");
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    try {
      setMensagens(await fetchMensagens());
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao carregar as mensagens.");
    }
  }, []);

  useEffect(() => {
    let ativo = true;

    (async () => {
      try {
        const lista = await fetchMensagens();
        if (ativo) setMensagens(lista);
      } catch (e) {
        console.error(e);
        if (ativo) {
          setErro(e instanceof Error ? e.message : "Falha ao carregar as mensagens.");
        }
      }
    })();

    const relogio = window.setInterval(async () => {
      try {
        const lista = await fetchMensagens();
        if (ativo) setMensagens(lista);
      } catch {
        // sem rede ou sem permissão: mantém a lista que já está na tela
      }
    }, INTERVALO);

    return () => {
      ativo = false;
      window.clearInterval(relogio);
    };
  }, []);

  async function alternarLida(m: Mensagem) {
    setOk("");
    setErro("");

    try {
      await marcarMensagem(m.id, !m.lida);
      await carregar();
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao atualizar a mensagem.");
    }
  }

  async function excluir(m: Mensagem) {
    if (!window.confirm(`Excluir a mensagem de "${m.nome}"?`)) return;

    setOk("");
    setErro("");

    try {
      await excluirMensagem(m.id);
      await carregar();
      setOk("Mensagem excluída.");
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Falha ao excluir.");
    }
  }

  const naoLidas = mensagens.filter((m) => !m.lida).length;

  return (
    <div>
      <h1>Mensagens</h1>

      <p className="admin-ajuda">
        Tudo que chega pelo formulário “Fale com a autoria” aparece aqui.
        {naoLidas > 0 ? ` ${naoLidas} não lida(s).` : " Nenhuma pendente."} Esta página se
        atualiza sozinha a cada 30 segundos, e o número de não lidas aparece também no
        título da aba do navegador. O formulário que o visitante preenche é editável em{" "}
        <b>Páginas › Contato</b>, no fim da página.
      </p>

      {ok && <p className="admin-ok">{ok}</p>}
      {erro && <p className="admin-erro">{erro}</p>}

      {mensagens.map((m) => (
        <article
          key={m.id}
          className={`admin-mensagem ${m.lida ? "" : "admin-mensagem-nova"}`}
        >
          <div className="admin-mensagem-topo">
            <b>{m.nome}</b>
            <span>{formatarDataHoraBR(m.criadoEm)}</span>
          </div>

          <p className="admin-mensagem-contato">
            {m.email && (
              <a href={`mailto:${m.email}`} className="sobre-link">
                {m.email}
              </a>
            )}
            {m.whatsapp && (
              <>
                {" · "}
                <a
                  href={`https://wa.me/${m.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="sobre-link"
                >
                  WhatsApp: {m.whatsapp}
                </a>
              </>
            )}
          </p>

          <p className="admin-mensagem-texto">{m.mensagem}</p>

          <div className="admin-acoes">
            <button className="outline" onClick={() => alternarLida(m)}>
              {m.lida ? "marcar como não lida" : "marcar como lida"}
            </button>
            <button className="outline" onClick={() => excluir(m)}>
              excluir
            </button>
          </div>
        </article>
      ))}

      {mensagens.length === 0 && (
        <p className="aviso-vazio">Nenhuma mensagem recebida ainda.</p>
      )}
    </div>
  );
}
