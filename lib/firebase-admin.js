import fs from "fs";
import path from "path";

import {
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";

import {
  getAuth,
} from "firebase-admin/auth";

/*
  =========================================================
  CONQUISTIA
  FIREBASE ADMIN
  NEXT.JS 16 + VERCEL
  =========================================================
*/

function limparValor(
  valor
) {
  if (!valor) {
    return "";
  }

  return String(valor)
    .trim()
    .replace(
      /^["']|["']$/g,
      ""
    );
}

function prepararPrivateKey(
  valor
) {
  const chave =
    limparValor(valor);

  if (!chave) {
    return "";
  }

  return chave.replace(
    /\\n/g,
    "\n"
  );
}

/*
  =========================================================
  PRODUÇÃO / VERCEL
  =========================================================
*/

function carregarVariaveis() {
  const projectId =
    limparValor(
      process.env
        .FIREBASE_ADMIN_PROJECT_ID
    );

  const clientEmail =
    limparValor(
      process.env
        .FIREBASE_ADMIN_CLIENT_EMAIL
    );

  const privateKey =
    prepararPrivateKey(
      process.env
        .FIREBASE_ADMIN_PRIVATE_KEY
    );

  if (
    projectId &&
    clientEmail &&
    privateKey
  ) {
    return {
      projectId,
      clientEmail,
      privateKey,
    };
  }

  return null;
}

/*
  =========================================================
  DESENVOLVIMENTO LOCAL
  =========================================================
*/

function carregarArquivoLocal() {
  try {
    const caminho =
      path.join(
        process.cwd(),
        "firebase-admin",
        "service-account.json"
      );

    if (
      !fs.existsSync(caminho)
    ) {
      return null;
    }

    const conteudo =
      fs.readFileSync(
        caminho,
        "utf8"
      );

    const conta =
      JSON.parse(conteudo);

    if (
      !conta?.project_id ||
      !conta?.client_email ||
      !conta?.private_key
    ) {
      return null;
    }

    return {
      projectId:
        conta.project_id,

      clientEmail:
        conta.client_email,

      privateKey:
        conta.private_key,
    };
  } catch (erro) {
    console.error(
      "Erro ao carregar Firebase Admin local:",
      erro
    );

    return null;
  }
}

/*
  =========================================================
  CREDENCIAL
  =========================================================
*/

const credencial =
  carregarVariaveis() ||
  carregarArquivoLocal();

if (!credencial) {
  throw new Error(
    "Firebase Admin não configurado. Verifique FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL e FIREBASE_ADMIN_PRIVATE_KEY."
  );
}

/*
  =========================================================
  INICIALIZAÇÃO
  =========================================================
*/

const adminApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId:
            credencial.projectId,

          clientEmail:
            credencial.clientEmail,

          privateKey:
            credencial.privateKey,
        }),
      });

export const adminAuth =
  getAuth(adminApp);

export default adminApp;