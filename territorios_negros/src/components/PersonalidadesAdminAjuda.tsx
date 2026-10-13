// src/components/PersonalidadesAdminAjuda.tsx
//
// Um resumo para a autoria, embaixo da lista do painel: o que já está publicado
// e quais rascunhos já têm conteúdo suficiente para irem ao ar. É só um aviso —
// quem publica é ela.
import "../styles/personalidades.css";

import { partesPreenchidas, type Personalidade } from "../data/personalidades";

export function PersonalidadesPublicaveis({ lista }: { lista: Personalidade[] }) {
  const rascunhos = lista.filter((p) => p.situacao !== "publicada");

  if (rascunhos.length === 0) return null;

  const prontos = rascunhos.filter((p) => partesPreenchidas(p).length >= 3);

  return (
    <section className="admin-bloco">
      <h2>Rascunhos ({rascunhos.length})</h2>

      <p className="admin-ajuda">
        Rascunho não aparece para o visitante — nem na listagem, nem na busca do app. Publique
        quando estiver pronto (botão <b>publicar</b> na lista, ou a <b>Situação</b> dentro do
        cadastro).
      </p>

      {prontos.length > 0 && (
        <p className="admin-ajuda">
          <b>Já com conteúdo:</b>{" "}
          {prontos
            .map((p) => `${p.nome} (${partesPreenchidas(p).join(", ")})`)
            .join(" · ")}
        </p>
      )}

      {rascunhos.map((p) => (
        <p className="admin-ajuda" key={p.id}>
          <b>{p.nome}</b> — preenchido:{" "}
          {partesPreenchidas(p).length > 0 ? partesPreenchidas(p).join(", ") : "nada ainda"}
        </p>
      ))}
    </section>
  );
}
