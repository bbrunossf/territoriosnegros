import { useEffect, useState } from "react";

type Props = {
  url: string;
  alt: string;
  legenda?: string;
  className?: string;
};

/**
 * Foto/mapa que abre ampliado ao clicar.
 *
 * O app roda numa coluna estreita (430px) por causa do celular; no computador
 * isso deixa mapas e imagens densas ilegíveis. Ao clicar, a imagem abre sobre a
 * tela inteira (ocupa toda a largura do navegador), com Zoom + / − dentro do app
 * e um atalho para abrir o arquivo original em nova guia.
 */
export default function FotoAmpliavel({ url, alt, legenda, className }: Props) {
  const [aberto, setAberto] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!aberto) return;

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAberto(false);
        setZoom(1);
      }
    };

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", aoTeclar);

    return () => {
      window.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = overflowAnterior;
    };
  }, [aberto]);

  function fechar() {
    setAberto(false);
    setZoom(1);
  }

  return (
    <>
      <figure className={`territorio-foto ${className ?? ""}`.trim()}>
        <button
          type="button"
          className="foto-botao"
          onClick={() => setAberto(true)}
          title="Clique para ampliar"
        >
          <img src={url} alt={alt} />
          <span className="foto-dica">⌕ ampliar</span>
        </button>

        {legenda && <figcaption>{legenda}</figcaption>}
      </figure>

      {aberto && (
        <div className="foto-zoom" onClick={fechar} role="presentation">
          <div className="foto-zoom-barra" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="outline"
              onClick={() => setZoom((z) => Math.max(1, Math.round((z - 0.25) * 100) / 100))}
              title="Diminuir"
              aria-label="Diminuir zoom"
            >
              −
            </button>

            <span className="foto-zoom-nivel">{Math.round(zoom * 100)}%</span>

            <button
              type="button"
              className="outline"
              onClick={() => setZoom((z) => Math.min(4, Math.round((z + 0.25) * 100) / 100))}
              title="Aumentar"
              aria-label="Aumentar zoom"
            >
              +
            </button>

            <a className="outline" href={url} target="_blank" rel="noreferrer">
              abrir em nova guia
            </a>

            <button type="button" className="outline" onClick={fechar}>
              fechar ✕
            </button>
          </div>

          <div className="foto-zoom-area">
            <img
              src={url}
              alt={alt}
              style={{ width: `${zoom * 100}%` }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}
