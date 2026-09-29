// RegistrarAcesso.tsx — contador de acessos (beacon anônimo)
//
// Fica montado no app inteiro e registra no Supabase cada tela aberta pelos
// visitantes. O que NÃO é guardado: IP, nome, e-mail, cookie e o texto de
// identificação do navegador. Só rota, hora, tipo de aparelho e um código
// aleatório da aba (que morre quando a aba fecha).
//
// A tela do painel (/admin) e o login não entram na conta — assim o uso da
// autoria não infla os números.
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { registrarAcesso } from "../data/api";
import { classificarDispositivo, ehRotaPublica } from "../utils/estatisticas";

const CHAVE_SESSAO = "tn_sessao";
const CHAVE_ULTIMO = "tn_ultimo_acesso";

/** mesma rota registrada de novo em menos deste tempo = conta uma vez só */
const JANELA_MS = 5000;

/** código aleatório da aba (sem cookie: some quando a aba é fechada) */
function sessaoDaAba(): string {
  try {
    const guardada = window.sessionStorage.getItem(CHAVE_SESSAO);
    if (guardada) return guardada;

    const nova =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;

    window.sessionStorage.setItem(CHAVE_SESSAO, nova);
    return nova;
  } catch {
    // navegador com armazenamento bloqueado: registra sem identificar a sessão
    return "";
  }
}

/** true quando a mesma rota acabou de ser registrada (recarregar/voltar rápido) */
function jaRegistrada(rota: string): boolean {
  const agora = Date.now();

  try {
    const bruto = window.sessionStorage.getItem(CHAVE_ULTIMO);

    if (bruto) {
      const anterior = JSON.parse(bruto) as { rota?: string; em?: number };
      if (anterior.rota === rota && typeof anterior.em === "number") {
        if (agora - anterior.em < JANELA_MS) return true;
      }
    }

    window.sessionStorage.setItem(CHAVE_ULTIMO, JSON.stringify({ rota, em: agora }));
  } catch {
    // sem armazenamento: segue e registra (no máximo conta a mesma tela duas vezes)
  }

  return false;
}

export default function RegistrarAcesso() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!ehRotaPublica(pathname)) return;
    if (jaRegistrada(pathname)) return;

    const dispositivo = classificarDispositivo(
      window.innerWidth,
      (navigator.maxTouchPoints ?? 0) > 0
    );

    // se falhar (sem internet, tabela ainda não criada), o app segue normal
    registrarAcesso({ rota: pathname, dispositivo, sessao: sessaoDaAba() }).catch(
      () => undefined
    );
  }, [pathname]);

  return null;
}
