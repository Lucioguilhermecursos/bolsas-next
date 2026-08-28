/* =========================================================================
   acbolsa — campo de formulário
   =========================================================================

   Rótulo + controle + dica + erro, com os ids e o `aria-describedby` ligados.
   Usado no checkout e nas telas de conta/login. O controle em si vem como
   `children` para o formulário escolher input, select, etc.
   ========================================================================= */

/* Nomes de estado em camelCase viram ids em kebab: `cartaoNum` -> `cartao-num`. */
export function paraId(nome) {
  return nome.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

export function Campo({ nome, rotulo, obrigatorio, erro, dica, largura = 2, children }) {
  const id = paraId(nome);
  return (
    <div className={"field" + (largura === 2 ? " span-2" : "")}>
      <label className="field-label" htmlFor={id}>
        {rotulo}
        {obrigatorio && (
          <span className="req" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {dica && (
        <p className="field-hint" id={"d-" + id}>
          {dica}
        </p>
      )}
      <p className="field-error" id={"e-" + id} role="alert">
        {erro}
      </p>
    </div>
  );
}
