"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

const CHAVE_GASTOS =
  "conquistia-gastos-v1";

const CHAVE_RECEITAS =
  "conquistia-receitas-v1";

const CHAVE_CONTAS =
  "conquistia-contas-v1";

const CHAVE_METAS =
  "conquistia-metas-v1";

const CHAVE_REFLEXOES =
  "conquistia-reflexoes-v1";

function carregarLista(chave) {
  if (
    typeof window === "undefined"
  ) {
    return [];
  }

  try {
    const dados =
      window.localStorage.getItem(
        chave
      );

    if (!dados) {
      return [];
    }

    const resultado =
      JSON.parse(dados);

    return Array.isArray(resultado)
      ? resultado
      : [];
  } catch (erro) {
    console.error(
      `Erro ao carregar ${chave}:`,
      erro
    );

    return [];
  }
}

function pertenceAoMes(
  data,
  ano,
  mes
) {
  if (!data) {
    return false;
  }

  const partes =
    String(data).split("-");

  if (partes.length !== 3) {
    return false;
  }

  return (
    Number(partes[0]) === ano &&
    Number(partes[1]) === mes
  );
}

function obterSemanaDoAno(
  dataTexto
) {
  if (!dataTexto) {
    return null;
  }

  const partes =
    dataTexto.split("-");

  if (partes.length !== 3) {
    return null;
  }

  const data =
    new Date(
      Number(partes[0]),
      Number(partes[1]) - 1,
      Number(partes[2])
    );

  const inicio =
    new Date(
      data.getFullYear(),
      0,
      1
    );

  const dias =
    Math.floor(
      (
        data.getTime() -
        inicio.getTime()
      ) /
        86400000
    );

  return Math.ceil(
    (
      dias +
      inicio.getDay() +
      1
    ) /
      7
  );
}

export default function ConquistasPage() {
  const [
    gastos,
    setGastos,
  ] = useState([]);

  const [
    receitas,
    setReceitas,
  ] = useState([]);

  const [
    contas,
    setContas,
  ] = useState([]);

  const [
    metas,
    setMetas,
  ] = useState([]);

  const [
    reflexoes,
    setReflexoes,
  ] = useState([]);

  const [
    carregado,
    setCarregado,
  ] = useState(false);

  useEffect(() => {
    function carregar() {
      setGastos(
        carregarLista(
          CHAVE_GASTOS
        )
      );

      setReceitas(
        carregarLista(
          CHAVE_RECEITAS
        )
      );

      setContas(
        carregarLista(
          CHAVE_CONTAS
        )
      );

      setMetas(
        carregarLista(
          CHAVE_METAS
        )
      );

      setReflexoes(
        carregarLista(
          CHAVE_REFLEXOES
        )
      );

      setCarregado(true);
    }

    carregar();

    window.addEventListener(
      "focus",
      carregar
    );

    return () => {
      window.removeEventListener(
        "focus",
        carregar
      );
    };
  }, []);

  const dados =
    useMemo(() => {
      const hoje =
        new Date();

      const ano =
        hoje.getFullYear();

      const mes =
        hoje.getMonth() + 1;

      const gastosMes =
        gastos.filter(
          (gasto) =>
            pertenceAoMes(
              gasto.data,
              ano,
              mes
            )
        );

      const receitasMes =
        receitas.filter(
          (receita) =>
            pertenceAoMes(
              receita.data,
              ano,
              mes
            )
        );

      const contasMes =
        contas.filter(
          (conta) =>
            pertenceAoMes(
              conta.vencimento,
              ano,
              mes
            )
        );

      const diasComRegistro =
        new Set(
          gastosMes.map(
            (gasto) =>
              gasto.data
          )
        ).size;

      const semanasComRegistro =
        new Set(
          gastosMes
            .map(
              (gasto) =>
                obterSemanaDoAno(
                  gasto.data
                )
            )
            .filter(Boolean)
        ).size;

      const contasPagas =
        contasMes.filter(
          (conta) =>
            conta.pago
        );

      const contasPendentes =
        contasMes.filter(
          (conta) =>
            !conta.pago
        );

      const todasContasConcluidas =
        contasMes.length > 0 &&
        contasPendentes.length === 0;

      const reflexoesRespondidas =
        reflexoes.filter(
          (item) =>
            Boolean(
              item.resposta
            )
        );

      const metasConcluidas =
        metas.filter(
          (meta) => {
            const objetivo =
              Number(
                meta.valorObjetivo || 0
              );

            const atual =
              Number(
                meta.valorAtual || 0
              );

            return (
              objetivo > 0 &&
              atual >= objetivo
            );
          }
        );

      const categorias =
        new Set(
          gastosMes.map(
            (gasto) =>
              gasto.categoria ||
              "Outros"
          )
        );

      const conquistas = [
        {
          id: "primeiro-passo",

          icone: "🌱",

          titulo:
            "Primeiro passo",

          descricao:
            "Registrou seu primeiro gasto.",

          desbloqueada:
            gastos.length >= 1,

          progresso:
            Math.min(
              100,
              gastos.length *
                100
            ),

          atual:
            Math.min(
              gastos.length,
              1
            ),

          meta:
            1,
        },

        {
          id: "diario-construcao",

          icone: "📖",

          titulo:
            "Diário em construção",

          descricao:
            "Registrou gastos em 7 dias diferentes no mês.",

          desbloqueada:
            diasComRegistro >= 7,

          progresso:
            Math.min(
              100,
              (
                diasComRegistro /
                7
              ) *
                100
            ),

          atual:
            diasComRegistro,

          meta:
            7,
        },

        {
          id: "mais-clareza",

          icone: "🔎",

          titulo:
            "Mais clareza",

          descricao:
            "Chegou a 30 registros de gastos.",

          desbloqueada:
            gastos.length >= 30,

          progresso:
            Math.min(
              100,
              (
                gastos.length /
                30
              ) *
                100
            ),

          atual:
            gastos.length,

          meta:
            30,
        },

        {
          id: "constancia",

          icone: "🔥",

          titulo:
            "Constância",

          descricao:
            "Registrou gastos em 4 semanas diferentes.",

          desbloqueada:
            semanasComRegistro >=
            4,

          progresso:
            Math.min(
              100,
              (
                semanasComRegistro /
                4
              ) *
                100
            ),

          atual:
            semanasComRegistro,

          meta:
            4,
        },

        {
          id: "contas-organizadas",

          icone: "🧾",

          titulo:
            "Contas organizadas",

          descricao:
            "Cadastrou pelo menos 3 contas no mês.",

          desbloqueada:
            contasMes.length >= 3,

          progresso:
            Math.min(
              100,
              (
                contasMes.length /
                3
              ) *
                100
            ),

          atual:
            contasMes.length,

          meta:
            3,
        },

        {
          id: "contas-em-dia",

          icone: "✅",

          titulo:
            "Contas em dia",

          descricao:
            "Todas as contas cadastradas do mês foram concluídas.",

          desbloqueada:
            todasContasConcluidas,

          progresso:
            contasMes.length === 0
              ? 0
              : (
                  contasPagas.length /
                  contasMes.length
                ) *
                100,

          atual:
            contasPagas.length,

          meta:
            contasMes.length,
        },

        {
          id: "escolha-consciente",

          icone: "🧠",

          titulo:
            "Escolha consciente",

          descricao:
            "Realizou sua primeira reflexão sobre um padrão de gasto.",

          desbloqueada:
            reflexoesRespondidas.length >=
            1,

          progresso:
            Math.min(
              100,
              reflexoesRespondidas.length *
                100
            ),

          atual:
            Math.min(
              reflexoesRespondidas.length,
              1
            ),

          meta:
            1,
        },

        {
          id: "observador",

          icone: "👀",

          titulo:
            "Observador dos hábitos",

          descricao:
            "Refletiu sobre 5 situações identificadas pelo app.",

          desbloqueada:
            reflexoesRespondidas.length >=
            5,

          progresso:
            Math.min(
              100,
              (
                reflexoesRespondidas.length /
                5
              ) *
                100
            ),

          atual:
            reflexoesRespondidas.length,

          meta:
            5,
        },

        {
          id: "mapa-habitos",

          icone: "🗺️",

          titulo:
            "Mapa de hábitos",

          descricao:
            "Utilizou 5 categorias diferentes no mês.",

          desbloqueada:
            categorias.size >= 5,

          progresso:
            Math.min(
              100,
              (
                categorias.size /
                5
              ) *
                100
            ),

          atual:
            categorias.size,

          meta:
            5,
        },

        {
          id: "receitas-organizadas",

          icone: "↑",

          titulo:
            "Entradas organizadas",

          descricao:
            "Registrou receitas do mês.",

          desbloqueada:
            receitasMes.length >= 1,

          progresso:
            Math.min(
              100,
              receitasMes.length *
                100
            ),

          atual:
            Math.min(
              receitasMes.length,
              1
            ),

          meta:
            1,
        },

        {
          id: "meta-alcancada",

          icone: "🎯",

          titulo:
            "Meta alcançada",

          descricao:
            "Concluiu uma meta pessoal cadastrada.",

          desbloqueada:
            metasConcluidas.length >=
            1,

          progresso:
            Math.min(
              100,
              metasConcluidas.length *
                100
            ),

          atual:
            Math.min(
              metasConcluidas.length,
              1
            ),

          meta:
            1,
        },

        {
          id: "mes-acompanhado",

          icone: "📊",

          titulo:
            "Mês acompanhado",

          descricao:
            "Registrou receitas, gastos e contas no mesmo mês.",

          desbloqueada:
            receitasMes.length >
              0 &&
            gastosMes.length > 0 &&
            contasMes.length > 0,

          progresso:
            [
              receitasMes.length >
              0,

              gastosMes.length > 0,

              contasMes.length > 0,
            ].filter(Boolean)
              .length /
              3 *
              100,

          atual:
            [
              receitasMes.length >
              0,

              gastosMes.length > 0,

              contasMes.length > 0,
            ].filter(Boolean)
              .length,

          meta:
            3,
        },
      ];

      const desbloqueadas =
        conquistas.filter(
          (item) =>
            item.desbloqueada
        );

      const bloqueadas =
        conquistas.filter(
          (item) =>
            !item.desbloqueada
        );

      const percentualGeral =
        conquistas.length > 0
          ? (
              desbloqueadas.length /
              conquistas.length
            ) *
            100
          : 0;

      return {
        conquistas,
        desbloqueadas,
        bloqueadas,
        percentualGeral,

        gastosMes,
        receitasMes,
        contasMes,

        diasComRegistro,
        semanasComRegistro,
        reflexoesRespondidas,
        metasConcluidas,
      };
    }, [
      gastos,
      receitas,
      contas,
      metas,
      reflexoes,
    ]);

  if (!carregado) {
    return (
      <div className="conquistas-carregando">
        <span />

        <strong>
          Calculando suas conquistas...
        </strong>
      </div>
    );
  }

  return (
    <div className="conquistas-pagina">
      <section className="conquistas-cabecalho">
        <div>
          <span>
            Sua evolução
          </span>

          <h1>
            Conquistas
          </h1>

          <p>
            Pequenos hábitos de
            organização também merecem
            ser reconhecidos.
          </p>
        </div>

        <div className="conquistas-nivel">
          <span>
            🌿
          </span>

          <div>
            <small>
              Jornada atual
            </small>

            <strong>
              {dados.desbloqueadas
                .length === 0
                ? "Começando"
                : dados.desbloqueadas
                    .length < 4
                  ? "Criando clareza"
                  : dados.desbloqueadas
                      .length < 8
                    ? "Construindo hábitos"
                    : "Organização em evolução"}
            </strong>
          </div>
        </div>
      </section>

      <section className="conquistas-principio">
        <span>
          ★
        </span>

        <div>
          <strong>
            Aqui não existe ranking
            financeiro.
          </strong>

          <p>
            As conquistas reconhecem
            ações de organização,
            acompanhamento e reflexão,
            independentemente do valor
            da renda.
          </p>
        </div>
      </section>

      <section className="conquistas-resumo">
        <article>
          <span>
            🏆
          </span>

          <div>
            <small>
              Desbloqueadas
            </small>

            <strong>
              {
                dados.desbloqueadas
                  .length
              }
            </strong>
          </div>
        </article>

        <article>
          <span>
            🔒
          </span>

          <div>
            <small>
              Em progresso
            </small>

            <strong>
              {
                dados.bloqueadas
                  .length
              }
            </strong>
          </div>
        </article>

        <article>
          <span>
            📖
          </span>

          <div>
            <small>
              Dias registrados
            </small>

            <strong>
              {
                dados.diasComRegistro
              }
            </strong>
          </div>
        </article>

        <article>
          <span>
            🧠
          </span>

          <div>
            <small>
              Reflexões realizadas
            </small>

            <strong>
              {
                dados
                  .reflexoesRespondidas
                  .length
              }
            </strong>
          </div>
        </article>
      </section>

      <section className="conquistas-progresso-geral">
        <div>
          <span>
            Progresso da jornada
          </span>

          <strong>
            {dados.percentualGeral.toFixed(
              0
            )}
            %
          </strong>
        </div>

        <div className="conquistas-progresso-barra">
          <span
            style={{
              width: `${dados.percentualGeral}%`,
            }}
          />
        </div>

        <p>
          {dados.desbloqueadas.length} de{" "}
          {dados.conquistas.length} conquistas
          desbloqueadas.
        </p>
      </section>

      <section className="conquistas-bloco">
        <div className="conquistas-bloco-topo">
          <div>
            <span>
              Já conquistadas
            </span>

            <h2>
              Seu caminho até aqui
            </h2>
          </div>
        </div>

        {dados.desbloqueadas.length ===
        0 ? (
          <div className="conquistas-vazio">
            <span>
              🌱
            </span>

            <h3>
              Sua primeira conquista
              está próxima
            </h3>

            <p>
              Registre seu primeiro
              gasto para começar.
            </p>

            <Link
              href="/registrar-gasto"
            >
              Registrar gasto
            </Link>
          </div>
        ) : (
          <div className="conquistas-grid">
            {dados.desbloqueadas.map(
              (conquista) => (
                <article
                  key={
                    conquista.id
                  }
                  className="conquista-card desbloqueada"
                >
                  <span className="conquista-icone">
                    {
                      conquista.icone
                    }
                  </span>

                  <span className="conquista-status">
                    ✓ Desbloqueada
                  </span>

                  <h3>
                    {
                      conquista.titulo
                    }
                  </h3>

                  <p>
                    {
                      conquista.descricao
                    }
                  </p>

                  <div className="conquista-completa">
                    <span>
                      100%
                    </span>

                    <div>
                      <i />
                    </div>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </section>

      <section className="conquistas-bloco">
        <div className="conquistas-bloco-topo">
          <div>
            <span>
              Próximos passos
            </span>

            <h2>
              Conquistas em progresso
            </h2>
          </div>
        </div>

        <div className="conquistas-grid">
          {dados.bloqueadas.map(
            (conquista) => (
              <article
                key={
                  conquista.id
                }
                className="conquista-card bloqueada"
              >
                <span className="conquista-icone">
                  {
                    conquista.icone
                  }
                </span>

                <span className="conquista-status">
                  Em progresso
                </span>

                <h3>
                  {
                    conquista.titulo
                  }
                </h3>

                <p>
                  {
                    conquista.descricao
                  }
                </p>

                <div className="conquista-progresso">
                  <div>
                    <span>
                      Progresso
                    </span>

                    <strong>
                      {conquista.meta > 0
                        ? `${conquista.atual}/${conquista.meta}`
                        : "0"}
                    </strong>
                  </div>

                  <div className="conquista-progresso-barra">
                    <span
                      style={{
                        width: `${Math.min(
                          100,
                          conquista.progresso
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </article>
            )
          )}
        </div>
      </section>

      <section className="conquistas-mensagem-final">
        <span>
          🌱
        </span>

        <div>
          <strong>
            Organização também é uma
            conquista.
          </strong>

          <p>
            O objetivo não é ser
            perfeito, mas construir
            clareza aos poucos.
          </p>
        </div>
      </section>
    </div>
  );
}