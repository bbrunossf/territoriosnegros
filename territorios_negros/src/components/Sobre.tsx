
import LINKS from "../data/links.json";


import Info from "../components/Info";
import Topic from "../components/Topic";
import PageTitle from "../components/PageTitle";

export default function Sobre() {
  return (
    <>
      <PageTitle
        title="Sobre o app"
        subtitle="Territórios Negros - Vitória - ES"
      />

      <Info>
        Este aplicativo é um guia educacional
        de leitura territorial, criado para
        apoiar caminhadas, aulas de campo e
        experiências formativas sobre os
        territórios negros no Centro de
        Vitória - ES.
      </Info>

      <Info>
        <b>Autoria:</b> Aingrid Fabiane de Souza.
        <br />

        <b>Base teórica:</b> TCC “Territórios
        Negros na cidade de Vitória - ES
        (2024)”.
        <br />

        <a
          href={LINKS.tcc}
          target="_blank"
          rel="noreferrer"
          className="sobre-link"
        >
          Acessar TCC completo
        </a>
      </Info>

      <Topic
        icon="♪"
        title="Produções associadas ao projeto"
      >
        <ul className="sobre-list">
          <li>
            <a
              href={LINKS.musica1}
              target="_blank"
              rel="noreferrer"
              className="sobre-link"
            >
              Vitória, Não Apague Nossa Cor
            </a>
          </li>

          <li>
            <a
              href={LINKS.musica2}
              target="_blank"
              rel="noreferrer"
              className="sobre-link"
            >
              Mulher Raiz Ancestral
            </a>
          </li>

          <li>
            <a
              href={LINKS.documentario}
              target="_blank"
              rel="noreferrer"
              className="sobre-link"
            >
              Documentário – Coisas de Negres
            </a>
          </li>
        </ul>
      </Topic>
    </>
  );
}
