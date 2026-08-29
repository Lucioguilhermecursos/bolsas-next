/* =========================================================================
   acbolsa — proxy (era "middleware"; renomeado no Next 16)
   =========================================================================

   Duas funções:
     1. Renova a sessão do Supabase a cada request (senão o token expira e a
        pessoa é deslogada sozinha).
     2. Checagem OTIMISTA de acesso: manda quem não está logada para /entrar
        antes de renderizar rota protegida, e quem já está logada para /conta
        se tentar abrir /entrar ou /criar-conta.

   É só a primeira linha de defesa. A checagem que vale está em
   lib/auth/sessao.js (exigirUsuario), usada pelas páginas e Server Actions —
   ver o aviso sobre Server Functions em
   node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
   ========================================================================= */

import { NextResponse } from "next/server";
import { atualizarSessao } from "@/lib/supabase/proxy";

const ROTAS_PROTEGIDAS = ["/conta", "/checkout", "/redefinir-senha"];
const ROTAS_DE_AUTH = ["/entrar", "/criar-conta", "/recuperar-senha"];

export async function proxy(request) {
  const { response, user } = await atualizarSessao(request);
  const { pathname } = request.nextUrl;

  const protegida = ROTAS_PROTEGIDAS.some((r) => pathname.startsWith(r));
  const deAuth = ROTAS_DE_AUTH.some((r) => pathname.startsWith(r));

  /* /redefinir-senha é protegida, mas a sessão vem do link de recuperação —
     o gate de verdade fica na página, aqui não redireciona. */
  if (protegida && pathname !== "/redefinir-senha" && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/entrar";
    url.search = "?next=" + encodeURIComponent(pathname);
    return NextResponse.redirect(url);
  }

  if (deAuth && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/conta";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /* Tudo, menos estáticos, imagens, metadados, o route handler de
       confirmação e arquivos com extensão (fotos em /public). */
    "/((?!api|_next/static|_next/image|favicon.ico|auth/confirmar|auth/callback|.*\\.[a-zA-Z0-9]+$).*)",
  ],
};
