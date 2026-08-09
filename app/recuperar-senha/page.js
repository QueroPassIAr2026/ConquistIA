"use client";

import Link from "next/link";

import {
  useState,
} from "react";

import {
  sendPasswordResetEmail,
} from "firebase/auth";

import {
  auth,
} from "../../lib/firebase";

import "../login/login.css";

export default function RecuperarSenhaPage() {
  const [
    email,
    setEmail,
  ] = useState("");

  const [
    mensagem,
    setMensagem,
  ] = useState("");

  const [
    erro,
    setErro,
  ] = useState("");

  const [
    carregando,
    setCarregando,
  ] = useState(false);

  async function recuperarSenha(
    evento
  ) {
    evento.preventDefault();

    setErro("");
    setMensagem("");

    const emailLimpo =
      email.trim();

    if (!emailLimpo) {
      setErro(
        "Digite seu e-mail."
      );

      return;
    }

    setCarregando(true);

    try {
      await sendPasswordResetEmail(
        auth,
        emailLimpo
      );

      setMensagem(
        "Se esse e-mail estiver cadastrado no ConquistIA, você receberá uma mensagem com as instruções para criar uma nova senha."
      );
    } catch (error) {
      console.error(
        "Erro ao recuperar senha:",
        error
      );

      const codigo =
        error?.code || "";

      if (
        codigo ===
        "auth/invalid-email"
      ) {
        setErro(
          "Digite um endereço de e-mail válido."
        );
      } else if (
        codigo ===
        "auth/too-many-requests"
      ) {
        setErro(
          "Foram feitas muitas tentativas. Aguarde um pouco e tente novamente."
        );
      } else if (
        codigo ===
        "auth/network-request-failed"
      ) {
        setErro(
          "Não foi possível conectar ao serviço. Verifique sua internet."
        );
      } else {
        setErro(
          "Não foi possível enviar a recuperação de senha agora."
        );
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-marca">
          <span>
            C
          </span>

          <strong>
            Conquist
            <b>
              IA
            </b>
          </strong>
        </div>

        <div className="login-titulo">
          <span>
            Recuperação de acesso
          </span>

          <h1>
            Esqueceu sua senha?
          </h1>

          <p>
            Informe o e-mail usado
            na sua conta. Você
            receberá instruções para
            criar uma nova senha.
          </p>
        </div>

        <form
          className="login-form"
          onSubmit={
            recuperarSenha
          }
        >
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
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              placeholder="seu@email.com"
              onChange={(
                evento
              ) =>
                setEmail(
                  evento.target.value
                )
              }
              disabled={
                carregando
              }
              required
            />
          </div>

          {mensagem && (
            <div className="login-sucesso">
              <strong>
                Solicitação enviada
              </strong>

              <p>
                {mensagem}
              </p>
            </div>
          )}

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

          <button
            type="submit"
            disabled={
              carregando
            }
          >
            {carregando
              ? "Enviando..."
              : "Enviar recuperação"}
          </button>
        </form>

        <div className="recuperar-acoes">
          <Link
            href="/login"
            className="recuperar-voltar"
          >
            ← Voltar para o login
          </Link>

          <Link
            href="/cadastro"
            className="recuperar-cadastro"
          >
            Criar uma conta
          </Link>
        </div>

        <div className="login-privacidade">
          <span>
            ✓
          </span>

          <div>
            <strong>
              Recuperação segura
            </strong>

            <p>
              A redefinição de senha
              é realizada pelo
              Firebase
              Authentication.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}