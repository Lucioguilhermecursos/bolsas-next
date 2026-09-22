"use client";

/* =========================================================================
   acbolsa — seletor de período (calendário De/Até num campo só)
   =========================================================================

   Substitui os dois <input type="date"> por um botão que abre um calendário:
   primeiro clique marca o início, segundo marca o fim — na ordem que vierem
   (clicar dia 15 e depois dia 01 também vira "01 a 15"). Um terceiro clique
   começa uma seleção nova.

   Chamador controla o estado (dataDe/dataAte, formato YYYY-MM-DD, igual ao
   <input type="date"> que isso substitui) — este componente só decide COMO
   escolher, não guarda a seleção.
   ========================================================================= */

import { useEffect, useRef, useState } from "react";
import { IconeChevronEsquerda, IconeChevronDireita } from "@/components/Icones";

const DIAS_SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];
const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

function paraISO(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function dataBR(iso) {
  const [y, m, d] = iso.split("-");
  return d + "/" + m + "/" + y.slice(-2);
}

/* Grade de 42 células (6 semanas) — sempre o mesmo tamanho, pra não pular
   de layout entre meses com 4 ou 6 semanas. Células fora do mês vêm null. */
function gradeDoMes(ano, mes) {
  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const celulas = [];
  for (let i = 0; i < primeiroDiaSemana; i++) celulas.push(null);
  for (let dia = 1; dia <= diasNoMes; dia++) celulas.push(new Date(ano, mes, dia));
  while (celulas.length < 42) celulas.push(null);
  return celulas;
}

export default function SeletorPeriodo({ dataDe, dataAte, onMudar }) {
  const [aberto, setAberto] = useState(false);
  const [pontoInicial, setPontoInicial] = useState(null);
  const [mesExibido, setMesExibido] = useState(() => {
    const base = dataAte || dataDe;
    return base ? new Date(base + "T00:00:00") : new Date();
  });
  const raiz = useRef(null);

  useEffect(() => {
    if (!aberto) return;
    function aoClicarFora(e) {
      if (raiz.current && !raiz.current.contains(e.target)) setAberto(false);
    }
    document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, [aberto]);

  function aoClicarDia(data) {
    const iso = paraISO(data);
    if (!pontoInicial) {
      setPontoInicial(iso);
      onMudar(iso, iso);
    } else {
      const [de, ate] = [pontoInicial, iso].sort();
      onMudar(de, ate);
      setPontoInicial(null);
      setAberto(false);
    }
  }

  function limpar() {
    setPontoInicial(null);
    onMudar("", "");
  }

  function mudarMes(delta) {
    setMesExibido((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));
  }

  const ano = mesExibido.getFullYear();
  const mes = mesExibido.getMonth();
  const celulas = gradeDoMes(ano, mes);
  const hojeISO = paraISO(new Date());

  const rotulo =
    dataDe && dataAte
      ? dataDe === dataAte
        ? dataBR(dataDe)
        : dataBR(dataDe) + " – " + dataBR(dataAte)
      : "Selecionar período";

  return (
    <div className="seletor-periodo" ref={raiz}>
      <button type="button" className="input seletor-periodo-botao" onClick={() => setAberto((a) => !a)}>
        {rotulo}
      </button>

      {(dataDe || dataAte) && (
        <button
          type="button"
          className="link-underline ml-3"
          style={{ background: "none", border: 0, padding: 0, font: "inherit", cursor: "pointer" }}
          onClick={limpar}
        >
          Limpar período
        </button>
      )}

      {aberto && (
        <div className="seletor-periodo-painel" role="dialog" aria-label="Escolher período">
          <div className="seletor-periodo-cabeca">
            <button type="button" className="icon-btn" aria-label="Mês anterior" onClick={() => mudarMes(-1)}>
              <IconeChevronEsquerda />
            </button>
            <strong>
              {MESES[mes]} {ano}
            </strong>
            <button type="button" className="icon-btn" aria-label="Próximo mês" onClick={() => mudarMes(1)}>
              <IconeChevronDireita />
            </button>
          </div>

          <div className="seletor-periodo-semana">
            {DIAS_SEMANA.map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>

          <div className="seletor-periodo-grade">
            {celulas.map((data, i) => {
              if (!data) return <span key={i} />;
              const iso = paraISO(data);
              const noIntervalo = dataDe && dataAte && iso >= dataDe && iso <= dataAte;
              const extremidade = iso === dataDe || iso === dataAte;
              return (
                <button
                  type="button"
                  key={i}
                  className="seletor-periodo-dia"
                  data-intervalo={noIntervalo || undefined}
                  data-extremidade={extremidade || undefined}
                  data-hoje={iso === hojeISO || undefined}
                  onClick={() => aoClicarDia(data)}
                >
                  {data.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
