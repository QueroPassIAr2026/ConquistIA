"use client";

import Link from "next/link";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  signInWithEmailAndPassword,
} from "firebase/auth";

import {
  auth,
} from "../../lib/firebase";

import "./login.css";

/* =========================================================
   CONQUISTIA
   LOGIN
   ========================================================= */

export default function LoginPage() {
  const router =
    useRouter();

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    senha,
    setSenha,
  ] = useState("");

  const [
    mostrarSenha,
    setMostrarSenha,
  ] = useState(false);

  const [
    erro,
    setErro,
  ] = useState("");

  const [
    carregando,
    setCarregando,
  ] = useState(false);

  /* =======================================================
     LOGIN
     ======================================================= */

  async function entrar(
    evento
  ) {
    evento.preventDefault();

    setErro("");

    const emailLimpo =
      email.trim();

    if (!emailLimpo) {
      setErro(
        "Informe seu e-mail."
      );

      return;
    }

    if (!senha) {
      setErro(
        "Informe sua senha."
      );

      return;
    }

    setCarregando(true);

    try {
      /* ===================================================
         1. LOGIN NO FIREBASE
         =================================================== */

      const credencial =
        await signInWithEmailAndPassword(
          auth,
          emailLimpo,
          senha
        );

      /* ===================================================
         2. TOKEN DO USUÁRIO
         =================================================== */

      const idToken =
        await credencial.user
          .getIdToken();

      /* ===================================================
         3. CRIAR SESSÃO SEGURA
         =================================================== */

      const resposta =
        await fetch(
          "/api/auth/session",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials:
              "same-origin",

            body:
              JSON.stringify({
                idToken,
              }),
          }
        );

      /*
        Lemos primeiro como texto.

        Isso evita o erro:
        Unexpected end of JSON input
        caso o servidor retorne
        uma resposta vazia.
      */

      const texto =
        await resposta.text();

      let dados = {};

      if (texto) {
        try {
          dados =
            JSON.parse(texto);
        } catch {
          throw new Error(
            "O servidor devolveu uma resposta inválida."
          );
        }
      }

      if (
        !resposta.ok ||
        !dados?.ok
      ) {
        throw new Error(
          dados?.detalhe ||
            dados?.erro ||
            `Não foi possível iniciar a sessão. Código ${resposta.status}.`
        );
      }

      /* ===================================================
         4. ENTRAR NO PAINEL
         =================================================== */

      router.replace(
        "/painel"
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Erro de login:",
        error
      );

      const codigo =
        error?.code || "";

      /* ===================================================
         ERROS FIREBASE
         =================================================== */

      if (
        codigo ===
          "auth/invalid-credential" ||
        codigo ===
          "auth/wrong-password" ||
        codigo ===
          "auth/user-not-found"
      ) {
        setErro(
          "E-mail ou senha inválidos."
        );

        return;
      }

      if (
        codigo ===
        "auth/invalid-email"
      ) {
        setErro(
          "Digite um endereço de e-mail válido."
        );

        return;
      }

      if (
        codigo ===
        "auth/user-disabled"
      ) {
        setErro(
          "Esta conta está desativada."
        );

        return;
      }

      if (
        codigo ===
        "auth/too-many-requests"
      ) {
        setErro(
          "Foram feitas muitas tentativas. Aguarde um pouco e tente novamente."
        );

        return;
      }

      if (
        codigo ===
        "auth/network-request-failed"
      ) {
        setErro(
          "Não foi possível conectar ao serviço. Verifique sua internet."
        );

        return;
      }

      /*
        Se for erro da criação
        da sessão no servidor.
      */

      if (
        error?.message
      ) {
        setErro(
          error.message
        );

        return;
      }

      setErro(
        "Não foi possível entrar agora. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        {/* =================================================
            MARCA
            ================================================= */}

        <div className="login-marca">
          <span
            className="login-logo-simbolo"
            aria-hidden="true"
          >
            C
          </span>

          <strong>
            Conquist
            <b>
              IA
            </b>
          </strong>
        </div>

        {/* =================================================
            INTRODUÇÃO
            ================================================= */}

        <div className="login-titulo">
          <span>
            Bem-vindo de volta
          </span>

          <h1>
            Entre na sua jornada
          </h1>

          <p>
            Acesse seu espaço de
            organização financeira
            e continue acompanhando
            seus registros e
            conquistas.
          </p>
        </div>

        {/* =================================================
            FORMULÁRIO
            ================================================= */}

        <form
          onSubmit={entrar}
          className="login-form"
          noValidate
        >
          {/* E-MAIL */}

          <label
            htmlFor="email"
          >
            E-mail
          </label>

          <div className="login-campo">
            <span
              className="login-campo-icone"
              aria-hidden="true"
            >
              @
            </span>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(
                evento
              ) =>
                setEmail(
                  evento.target.value
                )
              }
              placeholder="seu@email.com"
              disabled={
                carregando
              }
              required
            />
          </div>

          {/* SENHA */}

          <label
            htmlFor="senha"
          >
            Senha
          </label>

          <div className="login-campo login-campo-senha">
            <span
              className="login-campo-icone"
              aria-hidden="true"
            >
              ●
            </span>

            <input
              id="senha"
              name="senha"
              type={
                mostrarSenha
                  ? "text"
                  : "password"
              }
              autoComplete="current-password"
              value={senha}
              onChange={(
                evento
              ) =>
                setSenha(
                  evento.target.value
                )
              }
              placeholder="Digite sua senha"
              disabled={
                carregando
              }
              required
            />

            <button
              type="button"
              className="login-mostrar-senha"
              onClick={() =>
                setMostrarSenha(
                  (
                    valorAtual
                  ) =>
                    !valorAtual
                )
              }
              disabled={
                carregando
              }
              aria-label={
                mostrarSenha
                  ? "Ocultar senha"
                  : "Mostrar senha"
              }
            >
              {mostrarSenha
                ? "Ocultar"
                : "Mostrar"}
            </button>
          </div>

          {/* =================================================
              LINKS
              ================================================= */}

          <div className="login-links-acesso">
            <Link
              href="/cadastro"
              className="login-criar-conta"
            >
              Criar conta
            </Link>

            <Link
              href="/recuperar-senha"
              className="login-esqueceu"
            >
              Esqueci minha senha
            </Link>
          </div>

          {/* =================================================
              ERRO
              ================================================= */}

          {erro && (
            <div
              className="login-erro"
              role="alert"
            >
              <span>
                !
              </span>

              <p>
                {erro}
              </p>
            </div>
          )}

          {/* =================================================
              BOTÃO
              ================================================= */}

          <button
            type="submit"
            className="login-botao-entrar"
            disabled={
              carregando
            }
          >
            <span>
              {carregando
                ? "Entrando..."
                : "Entrar"}
            </span>

            {!carregando && (
              <strong
                aria-hidden="true"
              >
                →
              </strong>
            )}
          </button>
        </form>

        {/* =================================================
            NOVA CONTA
            ================================================= */}

        <div className="login-novo">
          <span>
            Primeira vez no
            ConquistIA?
          </span>

          <Link href="/cadastro">
            Criar minha conta
          </Link>
        </div>

        {/* =================================================
            PRIVACIDADE
            ================================================= */}

        <div className="login-privacidade">
          <span>
            ✓
          </span>

          <div>
            <strong>
              Acesso protegido
            </strong>

            <p>
              Seu login é usado
              para proteger o
              acesso ao aplicativo.
              O ConquistIA não
              solicita senhas
              bancárias, dados de
              cartões ou
              credenciais
              financeiras.
            </p>
          </div>
        </div>

        {/* =================================================
            RODAPÉ
            ================================================= */}

        <div className="login-rodape">
          <span>
            Organização financeira
            consciente, no seu
            ritmo.
          </span>
        </div>
      </section>
    </main>
  );
}