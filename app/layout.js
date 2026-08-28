import { Suspense } from "react";
import { Cormorant_Garamond, Karla } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ProvedorCarrinho } from "@/components/CarrinhoContexto";
import { ProvedorToast } from "@/components/ToastContexto";
import { ProvedorSessao } from "@/components/SessaoContexto";

/* As variáveis precisam bater com os nomes usados no @theme do globals.css. */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const karla = Karla({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-karla",
  display: "swap",
});

export const metadata = {
  title: {
    default: "acbolsa — bolsas de couro",
    template: "%s | acbolsa",
  },
  description:
    "Bolsas de couro com material, medidas e construção na ficha de cada peça. Você decide sabendo o que está levando.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${karla.variable}`}>
      <body>
        <ProvedorToast>
          <ProvedorSessao>
            <ProvedorCarrinho>
              <a className="skip-link" href="#conteudo">
                Pular para o conteúdo
              </a>

              {/* Enquanto o catálogo usa dados de demonstração e placeholders.
                  Remover quando entrarem produtos e fotos reais. */}
              <p className="demo-note">
                Site de demonstração. Os produtos e preços são <strong>exemplos</strong> e as
                fotos ainda não foram feitas — nenhum pedido é cobrado.
              </p>

              {/* O Header lê `useSearchParams` para marcar o item ativo, o que
                  exige uma fronteira de Suspense. */}
              <Suspense fallback={<div className="site-header site-header--reserva" />}>
                <Header />
              </Suspense>

              <main id="conteudo">{children}</main>

              <Footer />
            </ProvedorCarrinho>
          </ProvedorSessao>
        </ProvedorToast>
      </body>
    </html>
  );
}
