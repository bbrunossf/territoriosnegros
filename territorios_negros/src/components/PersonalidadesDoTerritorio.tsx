// src/components/PersonalidadesDoTerritorio.tsx
//
// O outro lado do vínculo (pedido da autoria, 02/10/2026): na página de cada
// território, quem está ligado a ele. Mesmo dado, um só cadastro — se a autoria
// tira o vínculo no painel, some daqui e da página da pessoa.
//
// Exibição pedida em 14/10/2026: tópico que abre pelo título (fechado por
// padrão), mostrando SÓ O NOME de cada pessoa — e o nome já é o link para a
// página dela. O botão "Conheça sua história" saiu: a página do território fica
// com as informações do território.
//
// Sem ninguém ligado, não desenha nada (nada de seção vazia).
import { useState } from "react";

import { Link } from "react-router-dom";

// o tópico expansível usa as classes dos tópicos de Marcos e Conexões
import "../styles/marcos.css";
import "../styles/personalidades.css";

import { useTerritorios } from "../context/useTerritorios";
import {
  CHAVE_PERSONALIDADES,
  lerPersonalidades,
  personalidadesDoTerritorio,
  personalidadesPublicadas,
} from "../data/personalidades";
import SecaoDeTexto from "./SecaoDeTexto";

export default function PersonalidadesDoTerritorio({ territorioId }: { territorioId: string }) {
  const { config } = useTerritorios();

  // fechado ao abrir a página: o território aparece primeiro
  const [aberto, setAberto] = useState(false);

  const ligadas = personalidadesDoTerritorio(
    personalidadesPublicadas(lerPersonalidades(config[CHAVE_PERSONALIDADES])),
    territorioId
  );

  if (ligadas.length === 0) return null;

  return (
    <SecaoDeTexto
      icone="✦"
      titulo="Personalidades relacionadas"
      aberto={aberto}
      aoAlternar={() => setAberto((atual) => !atual)}
    >
      <ul className="territorio-personalidades">
        {ligadas.map((pessoa) => (
          <li key={pessoa.id}>
            <Link className="personalidade-vinculo-nome" to={`/personalidade/${pessoa.slug}`}>
              {pessoa.nome}
            </Link>
          </li>
        ))}
      </ul>
    </SecaoDeTexto>
  );
}
