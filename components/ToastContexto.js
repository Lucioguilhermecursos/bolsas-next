"use client";

/* =========================================================================
   acbolsa — notificações
   =========================================================================

   Região `aria-live="polite"` única, montada uma vez no layout. Serve para
   confirmar o que a cliente acabou de fazer ("Peça adicionada à sacola") e
   para explicar o que o sistema recusou ("Só restam 2 unidades"). Erro que
   pertence a um campo de formulário NÃO vem por aqui: vai em `.field-error`
   ao lado do campo, onde a pessoa está olhando.
   ========================================================================= */

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { IconeAlerta, IconeCheck } from "./Icones";

const ToastContexto = createContext(null);

const DURACAO = 3200;

export function ProvedorToast({ children }) {
  const [toasts, setToasts] = useState([]);
  const proximoId = useRef(0);
  const timers = useRef(new Map());

  const dispensar = useCallback((id) => {
    setToasts((atuais) => atuais.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const mostrar = useCallback(
    (mensagem, tipo = "ok") => {
      const id = proximoId.current++;
      setToasts((atuais) => atuais.concat({ id, mensagem, tipo }));
      timers.current.set(
        id,
        setTimeout(() => dispensar(id), DURACAO)
      );
    },
    [dispensar]
  );

  /* Componente desmontado com timers pendentes deixaria setState pendurado. */
  useEffect(() => {
    const pendentes = timers.current;
    return () => {
      pendentes.forEach(clearTimeout);
      pendentes.clear();
    };
  }, []);

  return (
    <ToastContexto.Provider value={mostrar}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={"toast" + (t.tipo === "erro" ? " toast--error" : "")}
          >
            {t.tipo === "erro" ? <IconeAlerta /> : <IconeCheck />}
            <span>{t.mensagem}</span>
          </div>
        ))}
      </div>
    </ToastContexto.Provider>
  );
}

/* Devolve `mostrar(mensagem, tipo)`. Fora do provedor vira no-op em vez de
   quebrar — um aviso perdido não justifica derrubar a página. */
export function useToast() {
  return useContext(ToastContexto) || (() => {});
}
