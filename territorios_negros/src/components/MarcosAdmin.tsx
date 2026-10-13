// MarcosAdmin.tsx — guia "Marcos e Conexões" do painel.
//
// Reúne: o controle de expansão (do aparelho da autoria), o resumo do que já
// está cadastrado e onde cadastrar cada grupo de páginas.

import "../styles.css";
import { useTerritorios } from "../context/useTerritorios";
import { useExpansao } from "../context/useExpansao";
import { resumoDosMarcos } from "../data/marcos";
import { lerPersonalidades } from "../data/personalidades";

export default function MarcosAdmin() {
  const { config, territorios } = useTerritorios();
  const [permitir, definir] = useExpansao();

  const resumo = resumoDosMarcos(config);
  const nomeDoTerritorio = (id: string) => territorios[id]?.nome ?? id;
  const quantos = (chave: string) => resumo.find((linha) => linha.chave === chave)?.quantos ?? 0;
  const quantasPersonalidades = Object.keys(lerPersonalidades(config)).length;

  const chaves = [...new Set([...resumo.map((r) => r.chave)])];

  return (
    <div>
      <h1>Marcos e Conexões</h1>

      <p className="admin-ajuda">
        Cada página pode ter uma lista de tópicos — <b>título</b>, <b>explicação breve</b> e{" "}
        <b>fonte</b> — para dar contexto complementar ao visitante e sustentar a sua fala durante
        os tours. O <b>título fica sempre visível</b> no app; a explicação só abre quando a
        expansão está permitida aqui embaixo.
      </p>

      <div className="admin-bloco">
        <h3>Permitir expansão de Marcos e Conexões</h3>

        <p className="admin-ajuda">
          Vale para <b>todas as páginas deste aparelho</b>, ao mesmo tempo — não é preciso
          configurar página por página. Fica guardada no navegador, então continua valendo depois
          de navegar, recarregar ou fechar o app. Os visitantes continuam vendo apenas os títulos.
        </p>

        <div className="admin-linha">
          <button
            type="button"
            className="outline"
            aria-pressed={permitir}
            onClick={() => definir(!permitir)}
          >
            {permitir ? "Ligada — toque para desligar" : "Desligada — toque para ligar"}
          </button>

          <span className="admin-dica">
            {permitir
              ? "no app, os títulos abrem e fecham ao toque"
              : "no app, os títulos ficam sem expansão e sem setas"}
          </span>
        </div>

        <p className="admin-ajuda">
          Com a sessão aberta, o mesmo controle aparece no app, numa faixa discreta embaixo — só
          para você. O visitante nunca vê esse controle.
        </p>
      </div>

      <div className="admin-bloco">
        <h3>Onde cadastrar cada página</h3>

        <p className="admin-ajuda">
          O conteúdo é <b>independente por página</b>. Cada editor tem o seu próprio botão de
          salvar, dentro da tela daquela página:
        </p>

        <ul className="admin-lista">
          <li>
            <b>Fichas de território</b> — em <b>Territórios</b>, abra o território: o cadastro
            fica no fim da ficha. Hoje: {territorios ? Object.keys(territorios).length : 0}{" "}
            territórios cadastrados.
          </li>

          <li>
            <b>A cidade de Vitória</b> e <b>Presença Negra na Cidade</b> — em <b>Páginas</b>,
            abra a página: o cadastro fica no fim da tela, depois dos blocos de texto.
          </li>

          <li>
            <b>Personalidades</b> — na guia <b>Personalidades</b>, abra a pessoa: o cadastro fica
            no fim do formulário. Hoje: {quantasPersonalidades} cadastradas.
          </li>
        </ul>
      </div>

      <div className="admin-bloco">
        <h3>O que já está cadastrado</h3>

        {chaves.length === 0 ? (
          <p className="admin-ajuda">
            Ainda não há nenhum tópico publicado. Enquanto não houver, a seção não aparece no app —
            nem vazia, nem provisória.
          </p>
        ) : (
          <ul className="admin-lista">
            {chaves.map((chave) => {
              const [tipo, resto] = chave.split(":");

              const nome =
                tipo === "territorio"
                  ? nomeDoTerritorio(resto)
                  : tipo === "personalidade"
                    ? resto
                    : chave;

              return (
                <li key={chave}>
                  <b>{nome}</b> — {quantos(chave)} {quantos(chave) === 1 ? "tópico" : "tópicos"}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="admin-bloco">
        <h3>O que combina com esta seção</h3>

        <ul className="admin-lista">
          <li>
            Datas, acontecimentos, pessoas e relações que você desenvolve <b>oralmente</b> durante
            a caminhada.
          </li>

          <li>
            Aprofundamento complementar: o que sustenta a leitura do lugar sem tirar o foco dela.
          </li>

          <li>
            <b>Não mova para cá</b> o que é essencial para entender a territorialidade negra ou os
            apagamentos — isso continua no conteúdo principal da página.
          </li>
        </ul>
      </div>
    </div>
  );
}
