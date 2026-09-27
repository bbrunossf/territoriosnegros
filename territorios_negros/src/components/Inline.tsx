import { formatarInline } from "../utils/texto";

/** renderiza um texto curto com a marcação de **negrito** / *itálico* */
export default function Inline({ texto }: { texto: string }) {
  return <>{formatarInline(texto)}</>;
}
