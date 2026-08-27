"use client";

/* =========================================================================
   acbolsa — resultados de busca
   ========================================================================= */

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { buscar } from "@/lib/catalog";
import { GradeProdutos } from "@/components/CartaoProduto";
import { IconeBusca } from "@/components/Icones";
import Revelar from "@/components/Revelar";

/* O `key` com o termo remonta o conteúdo a cada busca nova. É o que faz o
   campo refletir o termo da URL quando a busca vem do painel do header ou
   do botão voltar, sem um efeito sincronizando estado com prop. */
export default function BuscaCliente() {
  const params = useSearchParams();
  const termo = (params.get("q") || "").trim();
  return <Resultados termo={termo} key={termo} />;
}

function Resultados({ termo }) {
  const router = useRouter();
  const [campo, setCampo] = useState(termo);

  const resultados = termo ? buscar(termo) : [];

  function aoEnviar(e) {
    e.preventDefault();
    const novo = campo.trim();
    router.push(novo ? "/busca?q=" + encodeURIComponent(novo) : "/busca");
  }

  return (
    <>
      <Revelar />

      <div className="page-head">
        <div className="container">
          <ol className="crumbs" role="list">
            <li>
              <Link href="/">Início</Link>
            </li>
            <li aria-current="page">Busca</li>
          </ol>

          <h1>{termo ? 'Resultados para "' + termo + '"' : "Buscar no catálogo"}</h1>

          <p className="lead">
            {!termo
              ? "Digite o nome de uma peça, um material ou uma cor."
              : resultados.length
                ? resultados.length +
                  (resultados.length === 1 ? " peça encontrada" : " peças encontradas")
                : "Nenhuma peça corresponde a essa busca."}
          </p>

          <form className="form-busca" role="search" onSubmit={aoEnviar}>
            <label className="sr-only" htmlFor="q">
              Buscar produtos
            </label>
            <input
              className="input"
              id="q"
              name="q"
              type="search"
              placeholder="Peça, material ou cor"
              value={campo}
              onChange={(e) => setCampo(e.target.value)}
            />
            <button className="btn btn-dark" type="submit">
              Buscar
            </button>
          </form>
        </div>
      </div>

      <div className="container busca-resultados">
        {resultados.length > 0 && (
          <>
            {/* Os cartões são h3; sem este h2 a grade saltaria do h1 da
                página. Fica oculto porque o h1 acima já diz o mesmo. */}
            <h2 className="sr-only">Peças encontradas</h2>
            <GradeProdutos produtos={resultados} eager reveal />
          </>
        )}

        {/* Nenhum resultado: mostra o que existe, em vez de deixar a pessoa
            parada num beco. */}
        {termo && !resultados.length && (
          <>
            <div className="empty py-14">
              <IconeBusca />
              <h2>Nada com esse termo</h2>
              <p>
                Tente pelo nome do modelo (&quot;Tabby&quot;), por cor
                (&quot;preto&quot;, &quot;vinho&quot;, &quot;marrom&quot;) ou por
                material (&quot;couro&quot;, &quot;jacquard&quot;).
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
}
