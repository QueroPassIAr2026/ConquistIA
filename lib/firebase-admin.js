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
  LOCAL + VERCEL
  =========================================================
*/

function prepararPrivateKey(
  chave
) {
  if (!chave) {
    return "";
  }

  return String(chave)
    .trim()
    .replace(
      /^["']|["']$/g,
      ""
    )
    .replace(
      /\\n/g,
      "\n"
    );
}

/*
  =========================================================
  1. TENTA USAR AS VARIÁVEIS DO SERVIDOR
  =========================================================
*/

function carregarPelasVariaveis() {
  const projectId =
    process.env
      .FIREBASE_ADMIN_PROJECT_ID;

  const clientEmail =
    process.env
      .FIREBASE_ADMIN_CLIENT_EMAIL;

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
      projectId:
        String(projectId).trim(),

      clientEmail:
        String(clientEmail).trim(),

      privateKey,
    };
  }

  return null;
}

/*
  =========================================================
  2. SE NÃO EXISTIREM VARIÁVEIS,
     USA O JSON LOCAL
  =========================================================
*/

function carregarArquivoLocal() {
  const caminho =
    path.join(
      process.cwd(),
      "firebase-admin",
      "service-account.json"
    );

  if (
    !fs.existsSync(
      caminho
    )
  ) {
    return null;
  }

  const conteudo =
    fs.readFileSync(
      caminho,
      "utf8"
    );

  const conta =
    JSON.parse(
      conteudo
    );

  if (
    !conta.project_id ||
    !conta.client_email ||
    !conta.private_key
  ) {
    throw new Error(
      "O arquivo service-account.json não possui uma credencial Firebase Admin válida."
    );
  }

  return {
    projectId:
      conta.project_id,

    clientEmail:
      conta.client_email,

    privateKey:
      conta.private_key,
  };
}

/*
  =========================================================
  3. ESCOLHE A CONFIGURAÇÃO
  =========================================================
*/

const credencial =
  carregarPelasVariaveis() ||
  carregarArquivoLocal();

if (!credencial) {
  throw new Error(
    "Firebase Admin não configurado. Configure as variáveis FIREBASE_ADMIN_* ou disponibilize firebase-admin/service-account.json localmente."
  );
}

/*
  =========================================================
  4. INICIALIZA FIREBASE ADMIN
  =========================================================
*/

const adminApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential:
          cert({
            projectId:
              credencial.projectId,

            clientEmail:
              credencial.clientEmail,

            privateKey:
              credencial.privateKey,
          }),
      });

export const adminAuth =
  getAuth(
    adminApp
  );

export default adminApp;