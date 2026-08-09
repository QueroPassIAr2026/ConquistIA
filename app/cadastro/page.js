"use client";

import Link from "next/link";

import {
  useState,
} from "react";

import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";

import {
  auth,
} from "../../lib/firebase";

import "../login/login.css";

export default function CadastroPage() {
  const [email, setEmail] =
    useState("");

  const [senha, setSenha] =
    useState("");

  const [
    confirmarSenha,
    setConfirmarSenha,
  ] = useState("");

  const [erro, setErro] =
    useState("");

  const [sucesso, setSucesso] =
    useState("");

  const [
    carregando,
    setCarregando,
  ] = useState(false);

  async function cadastrar(
    evento
  ) {
    evento.preventDefault();

    setErro("");
    setSucesso("");

    const emailLimpo =
      email.trim();

    if (!emailLimpo) {
      setErro(
        "Informe seu e-mail."
      );

      return;
    }

    if (senha.length < 6) {
      setErro(
        "A senha precisa ter pelo menos 6 caracteres."
      );

      return;
    }

    if (
      senha !== confirmarSenha
    ) {
      setErro(
        "As senhas não são iguais."
      );

      return;
    }

    setCarregando(true);

    try {
      /*
        1. CRIA A CONTA
      */

      const credencial =
        await createUserWithEmailAndPassword(
          auth,
          emailLimpo,
          senha
        );

      /*
        2. ENVIA VERIFICAÇÃO
        DE E-MAIL
      */

      try {
        await sendEmailVerification(
          credencial.user
        );
      } catch (
        erroVerificacao
      ) {
        console.warn(
          "Conta criada, mas não foi possível enviar o e-mail de verificação:",
          erroVerificacao
        );
      }

      /*
        3. NÃO DEIXAMOS A PESSOA
        ENTRAR AUTOMATICAMENTE.

        Firebase faz login
        automaticamente após
        criar a conta, então
        encerramos essa sessão.
      */

      await signOut(auth);

      /*
        4. MOSTRAMOS SUCESSO
      */

      setSucesso(
        "Cadastro criado com sucesso. Enviamos uma mensagem para o seu e-mail. Depois, volte ao login para entrar no ConquistIA."
      );

      setEmail("");
      setSenha("");
      setConfirmarSenha("");
    } catch (error) {
      console.error(
        "Erro ao cadastrar:",
        error
      );

      const codigo =
        error?.code || "";

      if (
        codigo ===
        "auth/email-already-in-use"
      ) {
        setErro(
          "Já existe uma conta cadastrada com esse e-mail."
        );
      } else if (
        codigo ===
        "auth/invalid-email"
      ) {
        setErro(
          "Digite um endereço de e-mail válido."
        );
      } else if (
        codigo ===
        "auth/weak-password"
      ) {
        setErro(
          "A senha escolhida é muito fraca."
        );
      } else if (
        codigo ===
        "auth/operation-not-allowed"
      ) {
        setErro(
          "O cadastro por e-mail e senha ainda não está habilitado no Firebase."
        );
      } else if (
        codigo ===
        "auth/too-many-requests"
      ) {
        setErro(
          "Foram feitas muitas tentativas. Aguarde um pouco e tente novamente."
        );
      } else {
        setErro(
          "Não foi possível criar sua conta agora. Tente novamente."
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
            <b>IA</b>
          </strong>
        </div>

        <div className="login-titulo">
          <span>
            Comece sua jornada
          </span>

          <h1>
            Crie sua conta
          </h1>

          <p>
            Cadastre seu e-mail e
            escolha uma senha para
            acessar seu espaço no
            ConquistIA.
          </p>
        </div>

        <form
          className="login-form"
          onSubmit={cadastrar}
        >
          <label
            htmlFor="email"
          >
            E-mail
          </label>

          <input
            id="email"
            type="email"
            value={email}
            autoComplete="email"
            placeholder="seu@email.com"
            onChange={(
              evento
            ) =>
              setEmail(
                evento.target.value
              )
            }
            required
          />

          <label
            htmlFor="senha"
          >
            Crie uma senha
          </label>

          <input
            id="senha"
            type="password"
            value={senha}
            autoComplete="new-password"
            placeholder="Mínimo de 6 caracteres"
            onChange={(
              evento
            ) =>
              setSenha(
                evento.target.value
              )
            }
            required
            minLength={6}
          />

          <label
            htmlFor="confirmarSenha"
          >
            Confirme sua senha
          </label>

          <input
            id="confirmarSenha"
            type="password"
            value={
              confirmarSenha
            }
            autoComplete="new-password"
            placeholder="Digite novamente"
            onChange={(
              evento
            ) =>
              setConfirmarSenha(
                evento.target.value
              )
            }
            required
            minLength={6}
          />

          {erro && (
            <div className="login-erro">
              {erro}
            </div>
          )}

          {sucesso && (
            <div className="login-sucesso">
              {sucesso}

              <div className="cadastro-ir-login">
                <Link href="/login">
                  Ir para o login →
                </Link>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
          >
            {carregando
              ? "Criando conta..."
              : "Criar minha conta"}
          </button>
        </form>

        <div className="cadastro-ja-tem">
          <span>
            Já possui uma conta?
          </span>

          <Link href="/login">
            Entrar
          </Link>
        </div>

        <div className="login-privacidade">
          <span>
            ✓
          </span>

          <p>
            O cadastro é usado
            somente para proteger
            seu acesso ao
            ConquistIA. O aplicativo
            não solicita senhas
            bancárias, dados de
            cartões ou credenciais
            financeiras.
          </p>
        </div>
      </section>
    </main>
  );
}