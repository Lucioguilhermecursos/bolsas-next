"use client";

/* =========================================================================
   acbolsa — estado de sessão no cliente
   =========================================================================

   O layout continua estático: nada de ler cookie no servidor. Só o que
   depende de "está logada?" (ícone da conta, botão sair no menu) é client, e
   vem daqui. As checagens que valem ficam no servidor (lib/auth/sessao.js).

   `onAuthStateChange` mantém o header em dia quando a pessoa entra ou sai em
   outra aba, ou quando o token é renovado.
   ========================================================================= */

import { createContext, useContext, useEffect, useState } from "react";
import { criarClienteNavegador } from "@/lib/supabase/client";

const SessaoContexto = createContext({ usuario: null, carregando: true });

export function ProvedorSessao({ children }) {
  const [supabase] = useState(() => criarClienteNavegador());
  const [estado, setEstado] = useState({ usuario: null, carregando: true });

  useEffect(() => {
    let vivo = true;

    supabase.auth.getUser().then(({ data }) => {
      if (vivo) setEstado({ usuario: data.user ?? null, carregando: false });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, sessao) => {
      setEstado({ usuario: sessao?.user ?? null, carregando: false });
    });

    return () => {
      vivo = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return <SessaoContexto.Provider value={estado}>{children}</SessaoContexto.Provider>;
}

export function useSessao() {
  return useContext(SessaoContexto);
}
