/* =========================================================================
   acbolsa — rodapé
   =========================================================================

   Campo verde-escuro com grão, quatro colunas. Os rótulos de coluna herdam
   de `.label` sem a régua de latão: quatro filetes paralelos viram ruído
   repetido em vez de assinatura.
   ========================================================================= */

import Link from "next/link";

const COLUNAS = [
  {
    titulo: "Comprar",
    links: [
      { rotulo: "Todas as bolsas", href: "/catalogo?cat=bolsas" },
      { rotulo: "Novidades", href: "/catalogo?filtro=novidades" },
      { rotulo: "Catálogo completo", href: "/catalogo" },
    ],
  },
  {
    titulo: "Atendimento",
    links: [
      { rotulo: "Entrega e prazos", href: "/ajuda#entrega" },
      { rotulo: "Trocas e devoluções", href: "/ajuda#trocas" },
      { rotulo: "Cuidados com o couro", href: "/ajuda#cuidados" },
      { rotulo: "Perguntas frequentes", href: "/ajuda" },
    ],
  },
  {
    titulo: "A marca",
    links: [
      { rotulo: "Nossa história", href: "/sobre" },
      { rotulo: "Materiais", href: "/sobre#materiais" },
      { rotulo: "Minha conta", href: "/conta" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        {/* Nomeia o landmark e sustenta a hierarquia: sem este h2, as colunas
            em h3 seriam um salto a partir do h1 da página. */}
        <h2 className="sr-only">Rodapé</h2>

        <div className="footer-grid">
          <div className="footer-col footer-brand">
            <span className="logo">acbolsa</span>
            <p className="footer-sobre texto-suave">
              Material, medidas e construção na ficha de cada peça. Você decide sabendo o que está
              levando.
            </p>
          </div>

          {COLUNAS.map((coluna) => (
            <div className="footer-col" key={coluna.titulo}>
              <h3>{coluna.titulo}</h3>
              <ul role="list">
                {coluna.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href}>{l.rotulo}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          {/* Ano fixado na build. Um `new Date()` aqui daria erro de hidratação
              na virada do ano entre o render do servidor e o do cliente. */}
          <p>© {new Date().getFullYear()} acbolsa. Todos os direitos reservados.</p>
          <nav aria-label="Políticas">
            <Link href="/ajuda#privacidade">Privacidade</Link>
            <Link href="/ajuda#termos">Termos de uso</Link>
            <Link href="/ajuda#trocas">Trocas</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
