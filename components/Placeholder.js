/* =========================================================================
   acbolsa — placeholder de imagem
   =========================================================================

   Enquanto não há fotografia própria, o espaço da imagem é ocupado por um
   bloco marcado, na proporção final exata. Nunca a foto de outro produto no
   lugar: as imagens da versão anterior são fotografia da Strathberry, com o
   logotipo gravado no couro em várias. Ver o topo de `lib/catalog.js`.

   O grão de couro NÃO vive aqui — está nos campos escuros do sistema
   (`.field-forest`, `.field-deep` no globals.css). Se estivesse no
   placeholder, o site ficaria liso no dia em que as fotos reais entrassem.
   ========================================================================= */

import { IconeCamera } from "./Icones";

/* Placeholder livre, para banners e blocos editoriais.
   `proporcao`: portrait | tall | square | wide | hero
   `variante`:  forest | ink — para quando o bloco cai sobre campo escuro.
   `descricao`: o que o leitor de tela anuncia, quando precisa dizer mais do
   que o rótulo visível (que se repete em toda a grade). */
export function Placeholder({
  proporcao = "portrait",
  rotulo = "Imagem a substituir",
  variante,
  descricao,
}) {
  return (
    <div
      className={"ph ph--" + proporcao + (variante ? " ph--" + variante : "")}
      role="img"
      aria-label={descricao || rotulo}
    >
      <span className="ph-mark">
        <IconeCamera />
        <span>{rotulo}</span>
      </span>
    </div>
  );
}

/* A mídia de um produto: a foto quando existir, o placeholder enquanto não.
   O dia em que `fotos` for preenchido no catálogo, este componente troca
   sozinho e nenhuma página precisa mudar. */
export function MidiaProduto({ produto, proporcao = "portrait", eager = false }) {
  const foto = produto?.fotos?.[0];

  if (foto) {
    return (
      <div className={"ph ph--" + proporcao}>
        {/* eslint-disable-next-line @next/next/no-img-element --
            As fotos ainda não existem; quando entrarem, avaliar next/image
            com `sizes` por breakpoint. Trocar aqui, num lugar só. */}
        <img
          src={foto}
          alt={produto.nome + " — " + produto.cor}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
        />
      </div>
    );
  }

  /* O rótulo visível fica curto porque se repete em toda a grade; o leitor
     de tela recebe de qual peça a foto está faltando. */
  return (
    <Placeholder
      proporcao={proporcao}
      rotulo="Foto a substituir"
      descricao={"Foto ainda não disponível para " + (produto ? produto.nome : "este produto")}
    />
  );
}
