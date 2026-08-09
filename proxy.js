import {
  NextResponse,
} from "next/server";

const ROTAS_PROTEGIDAS = [
  "/painel",
  "/receitas",
  "/registrar-gasto",
  "/meu-diario",
  "/contas",
  "/categorias",
  "/relatorios",
  "/alertas",
  "/metas",
  "/reflexoes",
  "/conquistas",
  "/simulador",
];

function rotaProtegida(
  pathname
) {
  return ROTAS_PROTEGIDAS.some(
    (rota) =>
      pathname === rota ||
      pathname.startsWith(
        `${rota}/`
      )
  );
}

export function proxy(
  request
) {
  const {
    pathname,
  } = request.nextUrl;

  const sessao =
    request.cookies.get(
      "conquistia_session"
    )?.value;

  /*
    Se tentar abrir uma
    página protegida
    sem cookie:
  */

  if (
    rotaProtegida(
      pathname
    ) &&
    !sessao
  ) {
    const url =
      new URL(
        "/login",
        request.url
      );

    return NextResponse.redirect(
      url
    );
  }

  /*
    Se já existe sessão e
    tentar voltar ao login:
  */

  if (
    pathname === "/login" &&
    sessao
  ) {
    const url =
      new URL(
        "/painel",
        request.url
      );

    return NextResponse.redirect(
      url
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
      Ignora recursos internos
      do Next e arquivos estáticos.
    */

    "/((?!api|_next/static|_next/image|favicon.ico|icons|manifest.webmanifest).*)",
  ],
};