import {
  NextResponse,
} from "next/server";

import {
  adminAuth,
} from "../../../../lib/firebase-admin";

export const runtime =
  "nodejs";

const DURACAO_SESSAO_MS =
  5 *
  24 *
  60 *
  60 *
  1000;

export async function POST(
  request
) {
  try {
    const body =
      await request.json();

    const idToken =
      body?.idToken;

    if (!idToken) {
      return NextResponse.json(
        {
          ok: false,
          erro:
            "Token de autenticação não recebido.",
        },
        {
          status: 400,
        }
      );
    }

    /*
      Confirma que o token pertence
      a um usuário válido do Firebase.
    */

    await adminAuth.verifyIdToken(
      idToken
    );

    /*
      Cria o cookie de sessão.
    */

    const sessionCookie =
      await adminAuth.createSessionCookie(
        idToken,
        {
          expiresIn:
            DURACAO_SESSAO_MS,
        }
      );

    const resposta =
      NextResponse.json({
        ok: true,
      });

    resposta.cookies.set(
      "conquistia_session",
      sessionCookie,
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite:
          "lax",

        path:
          "/",

        maxAge:
          Math.floor(
            DURACAO_SESSAO_MS /
              1000
          ),
      }
    );

    return resposta;
  } catch (erro) {
    console.error(
      "ERRO AO CRIAR SESSÃO FIREBASE:"
    );

    console.error(erro);

    return NextResponse.json(
      {
        ok: false,

        erro:
          "Não foi possível criar a sessão.",

        detalhe:
          process.env.NODE_ENV ===
          "development"
            ? erro?.message ||
              String(erro)
            : undefined,
      },
      {
        status: 500,
      }
    );
  }
}