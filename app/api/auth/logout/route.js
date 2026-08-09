import {
  NextResponse,
} from "next/server";

export async function POST() {
  const resposta =
    NextResponse.json({
      ok: true,
      mensagem:
        "Sessão encerrada com sucesso.",
    });

  resposta.cookies.set(
    "conquistia_session",
    "",
    {
      httpOnly:
        true,

      secure:
        process.env.NODE_ENV ===
        "production",

      sameSite:
        "lax",

      path:
        "/",

      maxAge:
        0,

      expires:
        new Date(0),
    }
  );

  return resposta;
}