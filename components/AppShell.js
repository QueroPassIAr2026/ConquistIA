"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  useEffect,
  useState,
} from "react";

import {
  signOut,
} from "firebase/auth";

import {
  auth,
} from "../lib/firebase";

/*
  ==========================================
  CONQUISTIA
  APP SHELL FINAL
  ==========================================

  - Desktop responsivo
  - Menu hambúrguer no celular
  - Overlay mobile
  - Página ativa destacada
  - Logout Firebase
  - Logout da sessão do servidor
  - Sem Assistente / Inteligência
*/

/* ==========================================
   MENU — ORGANIZAÇÃO
   ========================================== */

const menuOrganizacao = [
  {
    nome: "Visão geral",
    href: "/painel",
    icone: "⌂",
  },

  {
    nome: "Receitas",
    href: "/receitas",
    icone: "↑",
  },

  {
    nome: "Registrar gasto",
    href: "/registrar-gasto",
    icone: "+",
  },

  {
    nome: "Meu diário",
    href: "/meu-diario",
    icone: "▣",
  },

  {
    nome: "Contas a pagar",
    href: "/contas",
    icone: "◷",
  },
];

/* ==========================================
   MENU — ANÁLISE
   ========================================== */

const menuAnalise = [
  {
    nome: "Categorias",
    href: "/categorias",
    icone: "◫",
  },

  {
    nome: "Relatórios",
    href: "/relatorios",
    icone: "▥",
  },

  {
    nome: "Alertas",
    href: "/alertas",
    icone: "!",
  },
];

/* ==========================================
   MENU — EVOLUÇÃO
   ========================================== */

const menuEvolucao = [
  {
    nome: "Minhas metas",
    href: "/metas",
    icone: "◎",
  },

  {
    nome: "Escolhas conscientes",
    href: "/reflexoes",
    icone: "◉",
  },

  {
    nome: "Conquistas",
    href: "/conquistas",
    icone: "★",
  },

  {
    nome: 'Simulador "E se?"',
    href: "/simulador",
    icone: "✦",
  },
];

/* ==========================================
   INFORMAÇÕES DAS PÁGINAS
   ========================================== */

const paginas = {
  "/painel": {
    legenda:
      "Sua organização financeira",

    titulo:
      "Visão geral",

    descricao:
      "Pequenos registros. Grandes conquistas.",
  },

  "/receitas": {
    legenda:
      "Entradas do mês",

    titulo:
      "Receitas",

    descricao:
      "Acompanhe os valores que você decidiu registrar.",
  },

  "/registrar-gasto": {
    legenda:
      "Seu diário financeiro",

    titulo:
      "Registrar gasto",

    descricao:
      "Registre uma escolha do seu dia.",
  },

  "/meu-diario": {
    legenda:
      "Sua história financeira",

    titulo:
      "Meu diário",

    descricao:
      "Consulte e acompanhe seus registros.",
  },

  "/contas": {
    legenda:
      "Compromissos do mês",

    titulo:
      "Contas a pagar",

    descricao:
      "Organize vencimentos e pagamentos.",
  },

  "/categorias": {
    legenda:
      "Entenda seus hábitos",

    titulo:
      "Categorias",

    descricao:
      "Veja como seus gastos estão distribuídos.",
  },

  "/relatorios": {
    legenda:
      "Transforme registros em clareza",

    titulo:
      "Relatórios",

    descricao:
      "Observe sua evolução ao longo do tempo.",
  },

  "/alertas": {
    legenda:
      "Sua central de atenção",

    titulo:
      "Alertas inteligentes",

    descricao:
      "Vencimentos, ritmo, categorias e padrões importantes.",
  },

  "/metas": {
    legenda:
      "Caminho até suas conquistas",

    titulo:
      "Minhas metas",

    descricao:
      "Acompanhe objetivos definidos por você.",
  },

  "/reflexoes": {
    legenda:
      "Consciência financeira",

    titulo:
      "Escolhas conscientes",

    descricao:
      "Observe padrões sem julgamentos.",
  },

  "/conquistas": {
    legenda:
      "Sua evolução",

    titulo:
      "Conquistas",

    descricao:
      "Reconheça hábitos de organização e constância.",
  },

  "/simulador": {
    legenda:
      "Cenários hipotéticos",

    titulo:
      'Simulador "E se?"',

    descricao:
      "Teste possibilidades sem alterar seus dados reais.",
  },
};

/* ==========================================
   VERIFICA ITEM ATIVO
   ========================================== */

function itemEstaAtivo(
  pathname,
  href
) {
  if (
    href === "/painel"
  ) {
    return (
      pathname === "/painel"
    );
  }

  return (
    pathname === href ||
    pathname.startsWith(
      `${href}/`
    )
  );
}

/* ==========================================
   GRUPO DO MENU
   ========================================== */

function GrupoMenu({
  titulo,
  itens,
  pathname,
  fecharMenu,
}) {
  return (
    <div className="sidebar-grupo">
      <span className="sidebar-titulo-secao">
        {titulo}
      </span>

      <div className="sidebar-links">
        {itens.map(
          (item) => {
            const ativo =
              itemEstaAtivo(
                pathname,
                item.href
              );

            return (
              <Link
                key={
                  item.href
                }
                href={
                  item.href
                }
                onClick={
                  fecharMenu
                }
                className={
                  ativo
                    ? "sidebar-link ativo"
                    : "sidebar-link"
                }
                aria-current={
                  ativo
                    ? "page"
                    : undefined
                }
              >
                <span className="sidebar-icone">
                  {
                    item.icone
                  }
                </span>

                <span className="sidebar-link-texto">
                  {
                    item.nome
                  }
                </span>

                {ativo && (
                  <span
                    className="sidebar-indicador-ativo"
                    aria-hidden="true"
                  />
                )}
              </Link>
            );
          }
        )}
      </div>
    </div>
  );
}

/* ==========================================
   APP SHELL
   ========================================== */

export default function AppShell({
  children,
}) {
  const pathname =
    usePathname();

  const [
    menuAberto,
    setMenuAberto,
  ] = useState(false);

  const [
    saindo,
    setSaindo,
  ] = useState(false);

  /* ========================================
     FECHA MENU AO TROCAR DE ROTA
     ======================================== */

  useEffect(() => {
    setMenuAberto(
      false
    );
  }, [pathname]);

  /* ========================================
     ESC FECHA MENU MOBILE
     ======================================== */

  useEffect(() => {
    function fecharComEsc(
      evento
    ) {
      if (
        evento.key ===
        "Escape"
      ) {
        setMenuAberto(
          false
        );
      }
    }

    window.addEventListener(
      "keydown",
      fecharComEsc
    );

    return () => {
      window.removeEventListener(
        "keydown",
        fecharComEsc
      );
    };
  }, []);

  /* ========================================
     BLOQUEIA SCROLL AO ABRIR MENU MOBILE
     ======================================== */

  useEffect(() => {
    if (
      typeof document ===
      "undefined"
    ) {
      return;
    }

    if (
      menuAberto
    ) {
      document.body.classList.add(
        "menu-mobile-aberto"
      );
    } else {
      document.body.classList.remove(
        "menu-mobile-aberto"
      );
    }

    return () => {
      document.body.classList.remove(
        "menu-mobile-aberto"
      );
    };
  }, [menuAberto]);

  /* ========================================
     DADOS DA PÁGINA ATUAL
     ======================================== */

  const pagina =
    paginas[
      pathname
    ] || {
      legenda:
        "ConquistIA",

      titulo:
        "Organização financeira",

      descricao:
        "Transformando registros em clareza.",
    };

  function fecharMenu() {
    setMenuAberto(
      false
    );
  }

  /* ========================================
     LOGOUT
     ======================================== */

  async function sair() {
    if (
      saindo
    ) {
      return;
    }

    setSaindo(
      true
    );

    try {
      /*
        PRIMEIRO:
        apaga o cookie HTTPOnly
        da sessão no servidor.
      */

      const resposta =
        await fetch(
          "/api/auth/logout",
          {
            method:
              "POST",

            credentials:
              "same-origin",
          }
        );

      if (
        !resposta.ok
      ) {
        console.warn(
          "O servidor não confirmou o encerramento da sessão."
        );
      }

      /*
        SEGUNDO:
        encerra também
        o Firebase Auth.
      */

      await signOut(
        auth
      );

      /*
        TERCEIRO:
        volta para Login.
      */

      window.location.replace(
        "/login"
      );
    } catch (
      erro
    ) {
      console.error(
        "Erro ao sair:",
        erro
      );

      /*
        Mesmo se o endpoint
        falhar, tentamos sair
        do Firebase.
      */

      try {
        await signOut(
          auth
        );
      } catch (
        erroFirebase
      ) {
        console.error(
          "Erro ao sair do Firebase:",
          erroFirebase
        );
      }

      window.location.replace(
        "/login"
      );
    }
  }

  return (
    <div className="shell">
      {/* ===================================
          OVERLAY MOBILE
          =================================== */}

      {menuAberto && (
        <button
          type="button"
          className="shell-overlay"
          aria-label="Fechar menu"
          onClick={
            fecharMenu
          }
        />
      )}

      {/* ===================================
          SIDEBAR
          =================================== */}

      <aside
        className={
          menuAberto
            ? "sidebar sidebar-aberta"
            : "sidebar"
        }
      >
        {/* =================================
            TOPO DA SIDEBAR
            ================================= */}

        <div className="sidebar-logo-area">
          <Link
            href="/painel"
            className="sidebar-logo"
            onClick={
              fecharMenu
            }
          >
            <span
              className="logo-grafico"
              aria-hidden="true"
            >
              <span className="logo-grafico-interno">
                C
              </span>
            </span>

            <span className="logo-texto">
              Conquist

              <strong>
                IA
              </strong>
            </span>
          </Link>

          <button
            type="button"
            className="sidebar-fechar"
            aria-label="Fechar menu"
            onClick={
              fecharMenu
            }
          >
            ×
          </button>
        </div>

        {/* =================================
            JORNADA
            ================================= */}

        <section className="jornada-card">
          <div className="jornada-card-topo">
            <span className="jornada-icone">
              🌱
            </span>

            <span className="jornada-titulo">
              Sua jornada
            </span>
          </div>

          <strong>
            Transformando hábitos
            em conquistas
          </strong>

          <p className="jornada-texto">
            Registre, compreenda,
            organize e evolua no
            seu ritmo.
          </p>

          <div
            className="jornada-progresso"
            aria-hidden="true"
          >
            <span />
          </div>

          <small>
            Organização em evolução
          </small>
        </section>

        {/* =================================
            NAVEGAÇÃO PRINCIPAL
            ================================= */}

        <nav
          className="sidebar-nav"
          aria-label="Navegação principal"
        >
          <GrupoMenu
            titulo="Organização"
            itens={
              menuOrganizacao
            }
            pathname={
              pathname
            }
            fecharMenu={
              fecharMenu
            }
          />

          <GrupoMenu
            titulo="Análise"
            itens={
              menuAnalise
            }
            pathname={
              pathname
            }
            fecharMenu={
              fecharMenu
            }
          />

          <GrupoMenu
            titulo="Evolução"
            itens={
              menuEvolucao
            }
            pathname={
              pathname
            }
            fecharMenu={
              fecharMenu
            }
          />
        </nav>

        {/* =================================
            LOGOUT
            AGORA FICA LOGO DEPOIS DO MENU
            ================================= */}

        <div className="sidebar-sessao">
          <span className="sidebar-titulo-secao">
            Conta
          </span>

          <button
            type="button"
            className="sidebar-sair"
            onClick={
              sair
            }
            disabled={
              saindo
            }
          >
            <span className="sidebar-sair-icone">
              ↪
            </span>

            <span className="sidebar-sair-texto">
              {saindo
                ? "Saindo..."
                : "Sair da conta"}
            </span>
          </button>
        </div>

        {/* =================================
            PRIVACIDADE
            ================================= */}

        <section className="privacidade-card">
          <span className="privacidade-escudo">
            ✓
          </span>

          <div>
            <strong>
              Organização com
              privacidade
            </strong>

            <p>
              Sem conexão bancária,
              senhas bancárias,
              cartões ou credenciais
              financeiras.
            </p>
          </div>
        </section>

        <section className="sidebar-principio">
          <span>
            ✦
          </span>

          <p>
            Organização educativa,
            sem empréstimos e sem
            recomendações de
            investimentos.
          </p>
        </section>
      </aside>

      {/* ===================================
          ÁREA PRINCIPAL
          =================================== */}

      <section className="shell-principal">
        {/* =================================
            TOPBAR
            ================================= */}

        <header className="topbar">
          <div className="topbar-esquerda">
            {/* MENU MOBILE */}

            <button
              type="button"
              className="mobile-menu"
              aria-label="Abrir menu"
              aria-expanded={
                menuAberto
              }
              onClick={() =>
                setMenuAberto(
                  true
                )
              }
            >
              <span />
              <span />
              <span />
            </button>

            {/* TÍTULO */}

            <div className="titulo-pagina">
              <span>
                {
                  pagina.legenda
                }
              </span>

              <strong>
                {
                  pagina.titulo
                }
              </strong>

              {pagina.descricao && (
                <small>
                  {
                    pagina.descricao
                  }
                </small>
              )}
            </div>
          </div>

          <div className="topbar-direita">
            {/* ALERTAS */}

            <Link
              href="/alertas"
              className="topbar-alertas"
              title="Abrir alertas"
              aria-label="Abrir alertas inteligentes"
            >
              <span>
                !
              </span>
            </Link>

            {/* PERFIL */}

            <div className="perfil-local">
              <span className="perfil-avatar-novo">
                C
              </span>

              <div>
                <strong>
                  Minha jornada
                </strong>

                <small>
                  Sessão protegida
                </small>
              </div>
            </div>
          </div>
        </header>

        {/* =================================
            CONTEÚDO
            ================================= */}

        <main className="shell-conteudo">
          {children}
        </main>
      </section>
    </div>
  );
}