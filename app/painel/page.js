"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

/*
  ============================================
  CONQUISTIA
  HOME / PAINEL PRINCIPAL
  ============================================

  Organização financeira educativa.

  Não solicita:
  - CPF
  - conta bancária
  - cartão
  - senha
  - credenciais financeiras

  Não recomenda:
  - empréstimos
  - investimentos
  - produtos financeiros
*/

/* ============================================
   LOCALSTORAGE
   ============================================ */

const CHAVE_GASTOS =
  "conquistia-gastos-v1";

const CHAVE_RECEITAS =
  "conquistia-receitas-v1";

const CHAVE_RENDA_ANTIGA =
  "conquistia-renda-mensal-v1";

const CHAVE_POUPANCA =
  "conquistia-poupanca-v1";

const CHAVE_CONTAS =
  "conquistia-contas-v1";

const CHAVE_METAS =
  "conquistia-metas-v1";

const CHAVE_REFLEXOES =
  "conquistia-reflexoes-v1";

const CHAVE_CATEGORIAS =
  "conquistia-categorias-config-v1";

/* ============================================
   LEITURA
   ============================================ */

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

    const convertido =
      JSON.parse(dados);

    return Array.isArray(
      convertido
    )
      ? convertido
      : [];
  } catch (erro) {
    console.error(
      `Erro ao carregar ${chave}:`,
      erro
    );

    return [];
  }
}

function carregarObjeto(chave) {
  if (
    typeof window === "undefined"
  ) {
    return {};
  }

  try {
    const dados =
      window.localStorage.getItem(
        chave
      );

    if (!dados) {
      return {};
    }

    const convertido =
      JSON.parse(dados);

    if (
      convertido &&
      typeof convertido ===
        "object" &&
      !Array.isArray(
        convertido
      )
    ) {
      return convertido;
    }

    return {};
  } catch (erro) {
    console.error(
      `Erro ao carregar ${chave}:`,
      erro
    );

    return {};
  }
}

/* ============================================
   FORMATAÇÃO
   ============================================ */

function formatarMoeda(valor) {
  return Number(
    valor || 0
  ).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  );
}

function formatarData(data) {
  if (!data) {
    return "";
  }

  const partes =
    String(data).split("-");

  if (
    partes.length !== 3
  ) {
    return data;
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function nomeMes(
  ano,
  mes
) {
  const texto =
    new Date(
      ano,
      mes - 1,
      1
    ).toLocaleDateString(
      "pt-BR",
      {
        month: "long",
        year: "numeric",
      }
    );

  return (
    texto
      .charAt(0)
      .toUpperCase() +
    texto.slice(1)
  );
}

/* ============================================
   DATAS
   ============================================ */

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

  if (
    partes.length !== 3
  ) {
    return false;
  }

  return (
    Number(
      partes[0]
    ) === ano &&
    Number(
      partes[1]
    ) === mes
  );
}

function chaveMes(
  ano,
  mes
) {
  return `${ano}-${String(
    mes
  ).padStart(2, "0")}`;
}

function criarDataLocal(
  dataTexto
) {
  if (!dataTexto) {
    return null;
  }

  const partes =
    String(dataTexto)
      .split("-")
      .map(Number);

  if (
    partes.length !== 3
  ) {
    return null;
  }

  const [
    ano,
    mes,
    dia,
  ] = partes;

  const data =
    new Date(
      ano,
      mes - 1,
      dia
    );

  data.setHours(
    0,
    0,
    0,
    0
  );

  return data;
}

function obterInicioSemana(
  referencia
) {
  const data =
    new Date(referencia);

  data.setHours(
    0,
    0,
    0,
    0
  );

  const diaSemana =
    data.getDay();

  const ajuste =
    diaSemana === 0
      ? -6
      : 1 - diaSemana;

  data.setDate(
    data.getDate() +
      ajuste
  );

  return data;
}

function obterFimSemana(
  referencia
) {
  const inicio =
    obterInicioSemana(
      referencia
    );

  const fim =
    new Date(inicio);

  fim.setDate(
    inicio.getDate() + 6
  );

  fim.setHours(
    23,
    59,
    59,
    999
  );

  return fim;
}

function pertenceAoIntervalo(
  dataTexto,
  inicio,
  fim
) {
  const data =
    criarDataLocal(
      dataTexto
    );

  if (!data) {
    return false;
  }

  return (
    data >= inicio &&
    data <= fim
  );
}

function diasAte(
  dataTexto
) {
  const destino =
    criarDataLocal(
      dataTexto
    );

  if (!destino) {
    return null;
  }

  const hoje =
    new Date();

  hoje.setHours(
    0,
    0,
    0,
    0
  );

  return Math.round(
    (
      destino.getTime() -
      hoje.getTime()
    ) /
      (
        1000 *
        60 *
        60 *
        24
      )
  );
}

/* ============================================
   CATEGORIAS
   ============================================ */

function normalizarTexto(texto) {
  return String(
    texto || ""
  )
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .trim()
    .toLowerCase();
}

function obterIdCategoria(
  categoria
) {
  const nome =
    normalizarTexto(
      categoria
    );

  const mapa = {
    alimentacao:
      "alimentacao",

    transporte:
      "transporte",

    casa:
      "casa",

    lazer:
      "lazer",

    saude:
      "saude",

    estudos:
      "estudos",

    compras:
      "compras",

    assinaturas:
      "assinaturas",

    presentes:
      "presentes",

    outros:
      "outros",
  };

  return (
    mapa[nome] ||
    "outros"
  );
}

function obterIconeCategoria(
  categoria
) {
  const mapa = {
    alimentacao: "🍽️",
    transporte: "🚗",
    casa: "🏠",
    lazer: "🎮",
    saude: "❤️",
    estudos: "📚",
    compras: "🛍️",
    assinaturas: "📱",
    presentes: "🎁",
    outros: "📌",
  };

  return (
    mapa[
      obterIdCategoria(
        categoria
      )
    ] || "📌"
  );
}

/* ============================================
   COMPONENTE
   ============================================ */

export default function PainelPage() {
  const agora =
    new Date();

  const anoAtual =
    agora.getFullYear();

  const mesAtual =
    agora.getMonth() + 1;

  const chaveAtual =
    chaveMes(
      anoAtual,
      mesAtual
    );

  const [
    gastos,
    setGastos,
  ] = useState([]);

  const [
    receitas,
    setReceitas,
  ] = useState([]);

  const [
    rendasAntigas,
    setRendasAntigas,
  ] = useState({});

  const [
    poupancas,
    setPoupancas,
  ] = useState({});

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
    categoriasConfig,
    setCategoriasConfig,
  ] = useState({});

  const [
    carregado,
    setCarregado,
  ] = useState(false);

  /* ============================================
     CARREGAMENTO
     ============================================ */

  useEffect(() => {
    function carregarTudo() {
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

      setRendasAntigas(
        carregarObjeto(
          CHAVE_RENDA_ANTIGA
        )
      );

      setPoupancas(
        carregarObjeto(
          CHAVE_POUPANCA
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

      setCategoriasConfig(
        carregarObjeto(
          CHAVE_CATEGORIAS
        )
      );

      setCarregado(true);
    }

    carregarTudo();

    window.addEventListener(
      "focus",
      carregarTudo
    );

    return () => {
      window.removeEventListener(
        "focus",
        carregarTudo
      );
    };
  }, []);

  /* ============================================
     CÁLCULOS
     ============================================ */

  const dados =
    useMemo(() => {
      const gastosMes =
        gastos.filter(
          (gasto) =>
            pertenceAoMes(
              gasto.data,
              anoAtual,
              mesAtual
            )
        );

      const receitasMes =
        receitas.filter(
          (receita) =>
            pertenceAoMes(
              receita.data,
              anoAtual,
              mesAtual
            )
        );

      const contasMes =
        contas.filter(
          (conta) =>
            pertenceAoMes(
              conta.vencimento,
              anoAtual,
              mesAtual
            )
        );

      const totalGastos =
        gastosMes.reduce(
          (
            soma,
            gasto
          ) =>
            soma +
            Number(
              gasto.valor || 0
            ),
          0
        );

      const totalReceitasNovas =
        receitasMes.reduce(
          (
            soma,
            receita
          ) =>
            soma +
            Number(
              receita.valor || 0
            ),
          0
        );

      const rendaAntiga =
        Number(
          rendasAntigas[
            chaveAtual
          ] || 0
        );

      const totalReceitas =
        totalReceitasNovas > 0
          ? totalReceitasNovas
          : rendaAntiga;

      const origemReceita =
        totalReceitasNovas > 0
          ? "receitas"
          : rendaAntiga > 0
            ? "renda-antiga"
            : "nenhuma";

      const listaPoupanca =
        Array.isArray(
          poupancas[
            chaveAtual
          ]
        )
          ? poupancas[
              chaveAtual
            ]
          : [];

      const totalPoupanca =
        listaPoupanca.reduce(
          (
            soma,
            item
          ) =>
            soma +
            Number(
              item.valor || 0
            ),
          0
        );

      const contasPendentes =
        contasMes.filter(
          (conta) =>
            !conta.pago
        );

      const contasPagas =
        contasMes.filter(
          (conta) =>
            conta.pago
        );

      const totalContasPendentes =
        contasPendentes.reduce(
          (
            soma,
            conta
          ) =>
            soma +
            Number(
              conta.valor || 0
            ),
          0
        );

      const contasAtrasadas =
        contasPendentes.filter(
          (conta) => {
            const dias =
              diasAte(
                conta.vencimento
              );

            return (
              dias !== null &&
              dias < 0
            );
          }
        );

      const proximasContas =
        [...contasPendentes]
          .sort(
            (
              primeira,
              segunda
            ) =>
              String(
                primeira.vencimento ||
                  ""
              ).localeCompare(
                String(
                  segunda.vencimento ||
                    ""
                )
              )
          )
          .slice(
            0,
            4
          );

      const disponivelAgora =
        totalReceitas -
        totalGastos -
        totalPoupanca;

      const livreProjetado =
        disponivelAgora -
        totalContasPendentes;

      const ultimoDiaMes =
        new Date(
          anoAtual,
          mesAtual,
          0
        ).getDate();

      const diaAtual =
        agora.getDate();

      const diasRestantes =
        Math.max(
          1,
          ultimoDiaMes -
            diaAtual +
            1
        );

      const ritmoDiario =
        livreProjetado > 0
          ? livreProjetado /
            diasRestantes
          : 0;

      const ritmoSemanal =
        ritmoDiario > 0
          ? ritmoDiario * 7
          : 0;

      const inicioSemana =
        obterInicioSemana(
          agora
        );

      const fimSemana =
        obterFimSemana(
          agora
        );

      const gastosSemana =
        gastosMes.filter(
          (gasto) =>
            pertenceAoIntervalo(
              gasto.data,
              inicioSemana,
              fimSemana
            )
        );

      const totalGastosSemana =
        gastosSemana.reduce(
          (
            soma,
            gasto
          ) =>
            soma +
            Number(
              gasto.valor || 0
            ),
          0
        );

      const percentualSemana =
        ritmoSemanal > 0
          ? (
              totalGastosSemana /
              ritmoSemanal
            ) * 100
          : 0;

      const categoriasObjeto =
        gastosMes.reduce(
          (
            acumulador,
            gasto
          ) => {
            const categoria =
              gasto.categoria ||
              "Outros";

            if (
              !acumulador[
                categoria
              ]
            ) {
              acumulador[
                categoria
              ] = 0;
            }

            acumulador[
              categoria
            ] +=
              Number(
                gasto.valor || 0
              );

            return acumulador;
          },
          {}
        );

      const categorias =
        Object.entries(
          categoriasObjeto
        )
          .map(
            ([
              nome,
              valor,
            ]) => ({
              nome,
              valor,

              percentual:
                totalGastos > 0
                  ? (
                      valor /
                      totalGastos
                    ) * 100
                  : 0,
            })
          )
          .sort(
            (
              primeira,
              segunda
            ) =>
              segunda.valor -
              primeira.valor
          );

      const categoriasAcima =
        categorias.filter(
          (categoria) => {
            const id =
              obterIdCategoria(
                categoria.nome
              );

            const referencia =
              Number(
                categoriasConfig[
                  id
                ]?.referencia ||
                  0
              );

            return (
              referencia > 0 &&
              categoria.valor >
                referencia
            );
          }
        );

      const metaPrincipal =
        metas.find(
          (meta) => {
            const objetivo =
              Number(
                meta.valorObjetivo ||
                  0
              );

            const atual =
              Number(
                meta.valorAtual ||
                  0
              );

            return (
              objetivo > 0 &&
              atual < objetivo
            );
          }
        ) ||
        metas[0] ||
        null;

      const progressoMeta =
        metaPrincipal &&
        Number(
          metaPrincipal.valorObjetivo
        ) > 0
          ? Math.min(
              100,
              (
                Number(
                  metaPrincipal.valorAtual ||
                    0
                ) /
                Number(
                  metaPrincipal.valorObjetivo
                )
              ) * 100
            )
          : 0;

      const reflexoesRespondidas =
        reflexoes.filter(
          (item) =>
            Boolean(
              item.resposta
            )
        );

      const diasRegistrados =
        new Set(
          gastosMes
            .map(
              (gasto) =>
                gasto.data
            )
            .filter(Boolean)
        ).size;

      let quantidadeAlertas =
        0;

      quantidadeAlertas +=
        contasAtrasadas.length;

      quantidadeAlertas +=
        contasPendentes.filter(
          (conta) => {
            const dias =
              diasAte(
                conta.vencimento
              );

            return (
              dias !== null &&
              dias >= 0 &&
              dias <= 3
            );
          }
        ).length;

      if (
        percentualSemana >= 85
      ) {
        quantidadeAlertas +=
          1;
      }

      quantidadeAlertas +=
        categoriasAcima.length;

      return {
        gastosMes,
        receitasMes,
        contasMes,

        totalGastos,
        totalReceitas,
        origemReceita,

        totalPoupanca,

        contasPendentes,
        contasPagas,
        contasAtrasadas,
        proximasContas,

        totalContasPendentes,

        disponivelAgora,
        livreProjetado,

        diasRestantes,

        ritmoDiario,
        ritmoSemanal,

        totalGastosSemana,
        percentualSemana,

        categorias,
        categoriasAcima,

        metaPrincipal,
        progressoMeta,

        reflexoesRespondidas,

        diasRegistrados,

        quantidadeAlertas,
      };
    }, [
      gastos,
      receitas,
      rendasAntigas,
      poupancas,
      contas,
      metas,
      reflexoes,
      categoriasConfig,
      anoAtual,
      mesAtual,
      chaveAtual,
    ]);

  /* ============================================
     LEITURA INTELIGENTE
     ============================================ */

  function obterSituacaoSemana() {
    if (
      dados.totalReceitas <= 0
    ) {
      return {
        tipo: "neutro",

        titulo:
          "Ainda não há referência semanal",

        texto:
          "Registre suas receitas para que o ConquistIA consiga calcular o ritmo do restante do mês.",
      };
    }

    if (
      dados.livreProjetado < 0
    ) {
      return {
        tipo: "atencao",

        titulo:
          "Os compromissos cadastrados ultrapassam o valor disponível",

        texto:
          `Pelos registros atuais, o mês está projetado em ${formatarMoeda(
            Math.abs(
              dados.livreProjetado
            )
          )} acima das receitas cadastradas.`,
      };
    }

    if (
      dados.livreProjetado ===
      0
    ) {
      return {
        tipo: "observacao",

        titulo:
          "O valor livre projetado chegou a zero",

        texto:
          "Os registros atuais indicam que receitas, gastos, valores separados e contas pendentes utilizam todo o valor cadastrado para o mês.",
      };
    }

    if (
      dados.percentualSemana >
      120
    ) {
      return {
        tipo: "atencao",

        titulo:
          "A semana está bastante acima da referência atual",

        texto:
          `Foram registrados ${formatarMoeda(
            dados.totalGastosSemana
          )} nesta semana. A referência matemática atual é de aproximadamente ${formatarMoeda(
            dados.ritmoSemanal
          )}.`,
      };
    }

    if (
      dados.percentualSemana >
      100
    ) {
      return {
        tipo: "atencao",

        titulo:
          "A semana ultrapassou a referência atual",

        texto:
          `Os registros da semana chegaram a ${formatarMoeda(
            dados.totalGastosSemana
          )}. A referência calculada é de aproximadamente ${formatarMoeda(
            dados.ritmoSemanal
          )}.`,
      };
    }

    if (
      dados.percentualSemana >=
      85
    ) {
      return {
        tipo: "observacao",

        titulo:
          "A semana está próxima da referência atual",

        texto:
          `Você já utilizou aproximadamente ${dados.percentualSemana.toFixed(
            0
          )}% da referência semanal calculada.`,
      };
    }

    if (
      dados.totalGastosSemana ===
      0
    ) {
      return {
        tipo: "positivo",

        titulo:
          "A semana ainda está começando",

        texto:
          `O livre projetado atual é ${formatarMoeda(
            dados.livreProjetado
          )}. Continue registrando seus gastos para acompanhar o ritmo real da semana.`,
      };
    }

    return {
      tipo: "positivo",

      titulo:
        "A semana está dentro da referência atual",

      texto:
        `Até agora foram registrados ${formatarMoeda(
          dados.totalGastosSemana
        )}, equivalente a ${dados.percentualSemana.toFixed(
          0
        )}% da referência semanal.`,
    };
  }

  /* ============================================
     DIAGNÓSTICO
     ============================================ */

  function obterDiagnostico() {
    if (
      dados.totalReceitas ===
        0 &&
      dados.totalGastos ===
        0
    ) {
      return (
        "Seu painel está pronto. Comece registrando uma receita ou um gasto para construir sua visão financeira."
      );
    }

    if (
      dados.totalReceitas ===
      0
    ) {
      return (
        "Você já possui gastos registrados. Adicione suas receitas para visualizar também o saldo e o ritmo do mês."
      );
    }

    if (
      dados.contasAtrasadas
        .length > 0
    ) {
      return (
        `Existem ${dados.contasAtrasadas.length} ${
          dados.contasAtrasadas
            .length === 1
            ? "conta"
            : "contas"
        } com vencimento passado e ainda marcadas como pendentes.`
      );
    }

    if (
      dados.livreProjetado <
      0
    ) {
      return (
        `Considerando os registros atuais e as contas pendentes, o mês está projetado em ${formatarMoeda(
          Math.abs(
            dados.livreProjetado
          )
        )} acima das receitas cadastradas.`
      );
    }

    if (
      dados.categoriasAcima
        .length > 0
    ) {
      return (
        `${dados.categoriasAcima[0].nome} ultrapassou a referência opcional que você definiu para essa categoria.`
      );
    }

    if (
      dados.categorias.length >
      0
    ) {
      return (
        `${dados.categorias[0].nome} é atualmente a categoria com maior participação nos gastos registrados, com ${dados.categorias[0].percentual.toFixed(
          0
        )}% do total do mês.`
      );
    }

    return (
      "Continue registrando suas escolhas. Quanto mais completo o diário, mais clara fica a visão do mês."
    );
  }

  const situacaoSemana =
    obterSituacaoSemana();

  /* ============================================
     CARREGANDO
     ============================================ */

  if (!carregado) {
    return (
      <div className="painel-carregando">
        <span />

        <strong>
          Preparando sua visão
          financeira...
        </strong>
      </div>
    );
  }

  return (
    <div className="home-dashboard">
      {/* ======================================
          BOAS-VINDAS
          ====================================== */}

      <section className="home-boas-vindas">
        <div>
          <span>
            {nomeMes(
              anoAtual,
              mesAtual
            )}
          </span>

          <h1>
            Como está sua jornada
            este mês?
          </h1>

          <p>
            Veja o que entrou, o que
            saiu, os compromissos que
            ainda estão por vir e como
            está o restante do mês.
          </p>
        </div>

        <Link
          href="/registrar-gasto"
          className="home-registrar"
        >
          <span>
            +
          </span>

          Registrar gasto
        </Link>
      </section>

      {/* ======================================
          RESUMO
          ====================================== */}

      <section className="home-resumo">
        <article className="home-card financeiro renda">
          <div className="home-card-icone">
            ↑
          </div>

          <div className="home-card-conteudo">
            <span>
              Receitas do mês
            </span>

            <strong>
              {dados.totalReceitas >
              0
                ? formatarMoeda(
                    dados.totalReceitas
                  )
                : "Não informadas"}
            </strong>

            <small>
              {dados.origemReceita ===
              "receitas"
                ? `${dados.receitasMes.length} ${
                    dados.receitasMes
                      .length === 1
                      ? "entrada registrada"
                      : "entradas registradas"
                  }`
                : dados.origemReceita ===
                    "renda-antiga"
                  ? "Renda mensal anterior"
                  : "Registre quanto recebeu"}
            </small>
          </div>

          <Link
            href="/receitas"
            className="home-card-editar"
          >
            Ver
          </Link>
        </article>

        <article className="home-card financeiro gasto">
          <div className="home-card-icone">
            −
          </div>

          <div className="home-card-conteudo">
            <span>
              Gastos realizados
            </span>

            <strong>
              {formatarMoeda(
                dados.totalGastos
              )}
            </strong>

            <small>
              {
                dados.gastosMes
                  .length
              }{" "}
              {dados.gastosMes
                .length === 1
                ? "lançamento"
                : "lançamentos"}
            </small>
          </div>

          <Link
            href="/meu-diario"
            className="home-card-editar"
          >
            Ver
          </Link>
        </article>

        <article className="home-card financeiro poupanca">
          <div className="home-card-icone">
            ☆
          </div>

          <div className="home-card-conteudo">
            <span>
              Valor separado
            </span>

            <strong>
              {formatarMoeda(
                dados.totalPoupanca
              )}
            </strong>

            <small>
              Acompanhamento opcional
            </small>
          </div>
        </article>

        <article
          className={
            dados.livreProjetado <
              0 &&
            dados.totalReceitas >
              0
              ? "home-card financeiro saldo negativo"
              : "home-card financeiro saldo"
          }
        >
          <div className="home-card-icone">
            ✦
          </div>

          <div className="home-card-conteudo">
            <span>
              Livre projetado
            </span>

            <strong>
              {dados.totalReceitas >
              0
                ? formatarMoeda(
                    dados.livreProjetado
                  )
                : "—"}
            </strong>

            <small>
              Depois das contas
              pendentes
            </small>
          </div>

          <Link
            href="/contas"
            className="home-card-editar"
          >
            Ver
          </Link>
        </article>
      </section>

      {/* ======================================
          ATÉ O FIM DO MÊS
          NOVO MODELO PREMIUM
          ====================================== */}

      <section className="fim-mes-premium">
        <div className="fim-mes-cabecalho">
          <div className="fim-mes-titulo-area">
            <span className="fim-mes-kicker">
              <span>
                ✦
              </span>

              Inteligência do mês
            </span>

            <div className="fim-mes-titulo-linha">
              <h2>
                Até o fim do mês
              </h2>

              <div className="fim-mes-dias">
                <span>
                  Faltam
                </span>

                <strong>
                  {
                    dados.diasRestantes
                  }
                </strong>

                <small>
                  {dados.diasRestantes ===
                  1
                    ? "dia"
                    : "dias"}
                </small>
              </div>
            </div>

            <p>
              Uma visão dinâmica baseada
              nos registros atuais,
              contas pendentes e dias
              restantes.
            </p>
          </div>
        </div>

        <div className="fim-mes-painel">
          {/* CARDS */}

          <div className="fim-mes-cards">
            <article className="fim-card fim-card-livre">
              <div className="fim-card-icone verde">
                ◉
              </div>

              <div className="fim-card-conteudo">
                <div className="fim-card-label">
                  <span>
                    Livre projetado
                  </span>

                  <span
                    className="fim-info"
                    title="Valor estimado após os gastos, valores separados e contas pendentes cadastradas."
                  >
                    i
                  </span>
                </div>

                <strong className="fim-valor verde">
                  {dados.totalReceitas >
                  0
                    ? formatarMoeda(
                        dados.livreProjetado
                      )
                    : "—"}
                </strong>

                <small>
                  Após compromissos
                </small>
              </div>
            </article>

            <article className="fim-card fim-card-diario">
              <div className="fim-card-icone amarelo">
                ☀
              </div>

              <div className="fim-card-conteudo">
                <div className="fim-card-label">
                  <span>
                    Referência diária
                  </span>

                  <span
                    className="fim-info"
                    title="Divisão matemática do livre projetado pelos dias restantes."
                  >
                    i
                  </span>
                </div>

                <strong className="fim-valor amarelo">
                  {dados.livreProjetado >
                  0
                    ? formatarMoeda(
                        dados.ritmoDiario
                      )
                    : "—"}
                </strong>

                <small>
                  Livre por dia
                </small>
              </div>
            </article>

            <article className="fim-card fim-card-semanal">
              <div className="fim-card-icone azul">
                ▣
              </div>

              <div className="fim-card-conteudo">
                <div className="fim-card-label">
                  <span>
                    Referência semanal
                  </span>

                  <span
                    className="fim-info"
                    title="Equivalente aproximado da referência diária para sete dias."
                  >
                    i
                  </span>
                </div>

                <strong className="fim-valor azul">
                  {dados.livreProjetado >
                  0
                    ? formatarMoeda(
                        dados.ritmoSemanal
                      )
                    : "—"}
                </strong>

                <small>
                  Equivalente para
                  7 dias
                </small>
              </div>
            </article>

            <article
              className={
                dados.percentualSemana >
                100
                  ? "fim-card fim-card-gasto ultrapassado"
                  : dados.percentualSemana >=
                      85
                    ? "fim-card fim-card-gasto atencao"
                    : "fim-card fim-card-gasto"
              }
            >
              <div className="fim-card-icone vermelho">
                ↗
              </div>

              <div className="fim-card-conteudo">
                <div className="fim-card-label">
                  <span>
                    Gasto da semana
                  </span>

                  <span
                    className="fim-info"
                    title="Soma dos gastos registrados entre segunda-feira e domingo."
                  >
                    i
                  </span>
                </div>

                <strong className="fim-valor vermelho">
                  {formatarMoeda(
                    dados.totalGastosSemana
                  )}
                </strong>

                <small>
                  Registros de segunda
                  a domingo
                </small>
              </div>
            </article>
          </div>

          {/* RITMO + LEITURA */}

          <div className="fim-mes-analise-grid">
            <article className="fim-ritmo-box">
              <div className="fim-ritmo-topo">
                <div>
                  <div className="fim-ritmo-titulo">
                    <h3>
                      Ritmo da semana
                    </h3>

                    <span
                      className="fim-info"
                      title="Compara seus gastos desta semana com a referência semanal calculada."
                    >
                      i
                    </span>
                  </div>

                  <p>
                    Acompanhe o ritmo
                    dos seus gastos em
                    relação à referência
                    semanal.
                  </p>
                </div>

                {dados.ritmoSemanal >
                0 ? (
                  <div className="fim-ritmo-status-area">
                    <strong>
                      {dados.percentualSemana.toFixed(
                        0
                      )}
                      %
                    </strong>

                    <span
                      className={
                        dados.percentualSemana >
                        100
                          ? "fim-status acima"
                          : dados.percentualSemana >=
                              85
                            ? "fim-status perto"
                            : "fim-status dentro"
                      }
                    >
                      <i>
                        {dados.percentualSemana >
                        100
                          ? "!"
                          : "✓"}
                      </i>

                      {dados.percentualSemana >
                      100
                        ? "Acima do ritmo"
                        : dados.percentualSemana >=
                            85
                          ? "Próximo do ritmo"
                          : "Dentro do ritmo"}
                    </span>
                  </div>
                ) : (
                  <div className="fim-ritmo-status-area">
                    <strong>
                      —
                    </strong>

                    <span className="fim-status neutro">
                      Sem referência
                    </span>
                  </div>
                )}
              </div>

              <div className="fim-barra-area">
                <div className="fim-barra">
                  <span
                    className={
                      dados.percentualSemana >
                      100
                        ? "acima"
                        : dados.percentualSemana >=
                            85
                          ? "perto"
                          : ""
                    }
                    style={{
                      width:
                        dados.ritmoSemanal >
                        0
                          ? `${Math.min(
                              100,
                              Math.max(
                                0,
                                dados.percentualSemana
                              )
                            )}%`
                          : "0%",
                    }}
                  />
                </div>

                <div className="fim-barra-escala">
                  <span>
                    0%
                  </span>

                  <span>
                    50%
                  </span>

                  <span>
                    100%
                  </span>
                </div>
              </div>
            </article>

            <article
              className={`fim-leitura-box ${situacaoSemana.tipo}`}
            >
              <div className="fim-leitura-topo">
                <span className="fim-leitura-icone">
                  ✦
                </span>

                <strong>
                  Leitura inteligente
                </strong>
              </div>

              <h3>
                {
                  situacaoSemana.titulo
                }
              </h3>

              <p>
                {
                  situacaoSemana.texto
                }
              </p>

              {situacaoSemana.tipo ===
                "positivo" && (
                <span className="fim-tendencia positiva">
                  Tendência: Positiva

                  <strong>
                    ↗
                  </strong>
                </span>
              )}

              {situacaoSemana.tipo ===
                "observacao" && (
                <span className="fim-tendencia observacao">
                  Continue acompanhando

                  <strong>
                    →
                  </strong>
                </span>
              )}

              {situacaoSemana.tipo ===
                "atencao" && (
                <span className="fim-tendencia atencao">
                  Merece atenção

                  <strong>
                    !
                  </strong>
                </span>
              )}

              {situacaoSemana.tipo ===
                "neutro" && (
                <span className="fim-tendencia observacao">
                  Aguardando mais
                  registros

                  <strong>
                    →
                  </strong>
                </span>
              )}
            </article>
          </div>

          {/* DICA */}

          <div className="fim-mes-dica">
            <span className="fim-dica-icone">
              ♧
            </span>

            <p>
              O ritmo é apenas um guia.
              Observe sua realidade e
              use o{" "}
              <Link href="/simulador">
                simulador
              </Link>{" "}
              para testar cenários antes
              de registrar uma decisão.
            </p>
          </div>

          {/* AÇÕES */}

          <div className="fim-mes-acoes">
            <Link
              href="/meu-diario"
              className="fim-botao-secundario"
            >
              <span>
                ▥
              </span>

              Ver meus gastos
            </Link>

            <Link
              href="/simulador"
              className="fim-botao-principal"
            >
              <span>
                ✦
              </span>

              Testar no simulador
              “E se?”
            </Link>
          </div>

          {/* AVISO */}

          <div className="fim-mes-aviso">
            <span>
              i
            </span>

            <p>
              Os valores diário e
              semanal são referências
              matemáticas geradas pelos
              registros atuais. Não
              representam limites
              obrigatórios nem
              recomendações financeiras.
            </p>
          </div>
        </div>
      </section>

      {/* ======================================
          ALERTAS + CONTAS
          ====================================== */}

      <section className="home-grade-principal">
        <article className="home-bloco">
          <div className="home-bloco-topo">
            <div>
              <span>
                Sua atenção
              </span>

              <h2>
                Alertas inteligentes
              </h2>

              <p>
                Situações importantes
                encontradas nos seus
                próprios registros.
              </p>
            </div>

            <Link href="/alertas">
              Ver alertas
            </Link>
          </div>

          <div className="diagnostico-home-itens">
            <div>
              <span>
                !
              </span>

              <p>
                <strong>
                  {
                    dados.quantidadeAlertas
                  }{" "}
                  {dados.quantidadeAlertas ===
                  1
                    ? "situação merece"
                    : "situações merecem"}{" "}
                  atenção
                </strong>
              </p>
            </div>

            <div>
              <span>
                ◷
              </span>

              <p>
                <strong>
                  {
                    dados.contasPendentes
                      .length
                  }{" "}
                  {dados.contasPendentes
                    .length === 1
                    ? "conta pendente"
                    : "contas pendentes"}
                </strong>
              </p>
            </div>

            {dados.contasAtrasadas
              .length > 0 && (
              <div>
                <span>
                  !
                </span>

                <p>
                  <strong>
                    {
                      dados
                        .contasAtrasadas
                        .length
                    }{" "}
                    {dados
                      .contasAtrasadas
                      .length === 1
                      ? "conta está"
                      : "contas estão"}{" "}
                    com vencimento
                    passado
                  </strong>
                </p>
              </div>
            )}

            {dados.categoriasAcima
              .length > 0 && (
              <div>
                <span>
                  ▥
                </span>

                <p>
                  <strong>
                    {
                      dados
                        .categoriasAcima
                        .length
                    }{" "}
                    {dados
                      .categoriasAcima
                      .length === 1
                      ? "categoria ultrapassou"
                      : "categorias ultrapassaram"}{" "}
                    sua referência
                  </strong>
                </p>
              </div>
            )}
          </div>
        </article>

        <article className="home-bloco">
          <div className="home-bloco-topo">
            <div>
              <span>
                Compromissos
              </span>

              <h2>
                Próximas contas
              </h2>

              <p>
                Acompanhe o que ainda
                está previsto.
              </p>
            </div>

            <Link href="/contas">
              Abrir caderno
            </Link>
          </div>

          {dados.proximasContas
            .length > 0 ? (
            <div className="home-recentes-lista">
              {dados.proximasContas.map(
                (conta) => {
                  const dias =
                    diasAte(
                      conta.vencimento
                    );

                  return (
                    <div
                      key={
                        conta.id
                      }
                      className="home-recente"
                    >
                      <span className="home-recente-icone">
                        ◷
                      </span>

                      <div>
                        <strong>
                          {
                            conta.descricao
                          }
                        </strong>

                        <span>
                          {formatarData(
                            conta.vencimento
                          )}

                          {dias !==
                            null &&
                            dias >=
                              0 && (
                              <>
                                {" • "}

                                {dias ===
                                0
                                  ? "vence hoje"
                                  : dias ===
                                      1
                                    ? "falta 1 dia"
                                    : `faltam ${dias} dias`}
                              </>
                            )}
                        </span>
                      </div>

                      <strong>
                        {formatarMoeda(
                          conta.valor
                        )}
                      </strong>
                    </div>
                  );
                }
              )}
            </div>
          ) : (
            <div className="home-vazio pequeno">
              <span>
                ✓
              </span>

              <strong>
                Nenhuma conta pendente
                neste mês.
              </strong>

              <p>
                Novos compromissos
                podem ser adicionados
                no seu caderno.
              </p>
            </div>
          )}
        </article>
      </section>

      {/* ======================================
          META + CONQUISTAS
          ====================================== */}

      <section className="home-grade-principal">
        <article className="home-bloco meta-home">
          <div className="home-bloco-topo">
            <div>
              <span>
                Sua conquista
              </span>

              <h2>
                Meta principal
              </h2>
            </div>

            <Link href="/metas">
              Ver metas
            </Link>
          </div>

          {dados.metaPrincipal ? (
            <>
              <div className="home-meta-cabecalho">
                <span className="home-meta-icone">
                  {dados
                    .metaPrincipal
                    .icone ||
                    "🎯"}
                </span>

                <div>
                  <strong>
                    {
                      dados
                        .metaPrincipal
                        .nome
                    }
                  </strong>

                  <span>
                    {dados.progressoMeta.toFixed(
                      0
                    )}
                    % concluído
                  </span>
                </div>
              </div>

              <div className="home-meta-barra">
                <span
                  style={{
                    width: `${dados.progressoMeta}%`,
                  }}
                />
              </div>

              <div className="home-meta-valores">
                <div>
                  <span>
                    Progresso
                  </span>

                  <strong>
                    {formatarMoeda(
                      dados
                        .metaPrincipal
                        .valorAtual
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Objetivo
                  </span>

                  <strong>
                    {formatarMoeda(
                      dados
                        .metaPrincipal
                        .valorObjetivo
                    )}
                  </strong>
                </div>
              </div>
            </>
          ) : (
            <div className="home-vazio">
              <span>
                🎯
              </span>

              <strong>
                Qual é sua próxima
                conquista?
              </strong>

              <p>
                Crie uma meta para
                acompanhar sua evolução.
              </p>

              <Link
                href="/metas"
                className="home-vazio-botao"
              >
                Criar meta
              </Link>
            </div>
          )}
        </article>

        <article className="home-bloco">
          <div className="home-bloco-topo">
            <div>
              <span>
                Sua evolução
              </span>

              <h2>
                Conquistas
              </h2>

              <p>
                Organização e
                constância também
                merecem reconhecimento.
              </p>
            </div>

            <Link href="/conquistas">
              Ver todas
            </Link>
          </div>

          <div className="diagnostico-home-itens">
            <div>
              <span>
                🌱
              </span>

              <p>
                <strong>
                  {
                    dados.diasRegistrados
                  }{" "}
                  {dados.diasRegistrados ===
                  1
                    ? "dia"
                    : "dias"}
                </strong>{" "}
                com registros neste mês.
              </p>
            </div>

            <div>
              <span>
                🧠
              </span>

              <p>
                <strong>
                  {
                    dados
                      .reflexoesRespondidas
                      .length
                  }{" "}
                  {dados
                    .reflexoesRespondidas
                    .length === 1
                    ? "reflexão realizada"
                    : "reflexões realizadas"}
                </strong>
              </p>
            </div>

            <div>
              <span>
                ✓
              </span>

              <p>
                <strong>
                  {
                    dados.contasPagas
                      .length
                  }{" "}
                  {dados.contasPagas
                    .length === 1
                    ? "conta concluída"
                    : "contas concluídas"}
                </strong>{" "}
                neste mês.
              </p>
            </div>
          </div>

          <Link
            href="/conquistas"
            className="diagnostico-home-botao"
          >
            Explorar conquistas
          </Link>
        </article>
      </section>

      {/* ======================================
          CATEGORIAS + DIAGNÓSTICO
          ====================================== */}

      <section className="home-grade-secundaria">
        <article className="home-bloco categorias-home">
          <div className="home-bloco-topo">
            <div>
              <span>
                Seus hábitos
              </span>

              <h2>
                Para onde seus gastos
                estão indo?
              </h2>
            </div>

            <Link href="/categorias">
              Ver categorias
            </Link>
          </div>

          {dados.categorias.length >
          0 ? (
            <div className="home-categorias-lista">
              {dados.categorias
                .slice(
                  0,
                  5
                )
                .map(
                  (
                    categoria
                  ) => (
                    <div
                      key={
                        categoria.nome
                      }
                      className="home-categoria"
                    >
                      <span className="home-categoria-icone">
                        {obterIconeCategoria(
                          categoria.nome
                        )}
                      </span>

                      <div className="home-categoria-info">
                        <div>
                          <strong>
                            {
                              categoria.nome
                            }
                          </strong>

                          <span>
                            {formatarMoeda(
                              categoria.valor
                            )}
                          </span>
                        </div>

                        <div className="home-categoria-barra">
                          <span
                            style={{
                              width: `${Math.min(
                                100,
                                categoria.percentual
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      <strong className="home-categoria-percentual">
                        {categoria.percentual.toFixed(
                          0
                        )}
                        %
                      </strong>
                    </div>
                  )
                )}
            </div>
          ) : (
            <div className="home-vazio">
              <span>
                🍃
              </span>

              <strong>
                Ainda estamos
                conhecendo seus
                hábitos.
              </strong>

              <p>
                Registre alguns gastos
                para formar o mapa de
                categorias.
              </p>

              <Link
                href="/registrar-gasto"
                className="home-vazio-botao"
              >
                Registrar gasto
              </Link>
            </div>
          )}
        </article>

        <article className="home-bloco diagnostico-home">
          <div className="diagnostico-home-topo">
            <span>
              ✦
            </span>

            <div>
              <small>
                Leitura do mês
              </small>

              <h2>
                Seu diagnóstico
              </h2>
            </div>
          </div>

          <p className="diagnostico-texto">
            {obterDiagnostico()}
          </p>

          <div className="diagnostico-home-itens">
            <div>
              <span>
                ↑
              </span>

              <p>
                Receitas:{" "}

                <strong>
                  {dados.totalReceitas >
                  0
                    ? formatarMoeda(
                        dados.totalReceitas
                      )
                    : "não informadas"}
                </strong>
              </p>
            </div>

            <div>
              <span>
                −
              </span>

              <p>
                Gastos realizados:{" "}

                <strong>
                  {formatarMoeda(
                    dados.totalGastos
                  )}
                </strong>
              </p>
            </div>

            <div>
              <span>
                ◷
              </span>

              <p>
                Contas pendentes:{" "}

                <strong>
                  {formatarMoeda(
                    dados.totalContasPendentes
                  )}
                </strong>
              </p>
            </div>

            <div>
              <span>
                ✦
              </span>

              <p>
                Livre projetado:{" "}

                <strong>
                  {dados.totalReceitas >
                  0
                    ? formatarMoeda(
                        dados.livreProjetado
                      )
                    : "—"}
                </strong>
              </p>
            </div>
          </div>

          <Link
            href="/relatorios"
            className="diagnostico-home-botao"
          >
            Ver análise completa
          </Link>
        </article>
      </section>

      {/* ======================================
          ATALHOS
          ====================================== */}

      <section className="home-atalhos">
        <Link
          href="/receitas"
          className="atalho-card"
        >
          <span className="atalho-icone verde">
            ↑
          </span>

          <div>
            <strong>
              Receitas
            </strong>

            <p>
              Registre quanto entrou.
            </p>
          </div>

          <span className="atalho-seta">
            →
          </span>
        </Link>

        <Link
          href="/registrar-gasto"
          className="atalho-card"
        >
          <span className="atalho-icone verde">
            +
          </span>

          <div>
            <strong>
              Registrar gasto
            </strong>

            <p>
              Adicione uma escolha.
            </p>
          </div>

          <span className="atalho-seta">
            →
          </span>
        </Link>

        <Link
          href="/meu-diario"
          className="atalho-card"
        >
          <span className="atalho-icone azul">
            ▣
          </span>

          <div>
            <strong>
              Meu diário
            </strong>

            <p>
              Consulte seus registros.
            </p>
          </div>

          <span className="atalho-seta">
            →
          </span>
        </Link>

        <Link
          href="/contas"
          className="atalho-card"
        >
          <span className="atalho-icone dourado">
            ◷
          </span>

          <div>
            <strong>
              Contas a pagar
            </strong>

            <p>
              {dados.contasPendentes
                .length > 0
                ? `${dados.contasPendentes.length} ${
                    dados.contasPendentes
                      .length === 1
                      ? "pendente"
                      : "pendentes"
                  }`
                : "Nenhuma pendência"}
            </p>
          </div>

          <span className="atalho-seta">
            →
          </span>
        </Link>

        <Link
          href="/alertas"
          className="atalho-card"
        >
          <span className="atalho-icone coral">
            !
          </span>

          <div>
            <strong>
              Alertas
            </strong>

            <p>
              {dados.quantidadeAlertas >
              0
                ? `${dados.quantidadeAlertas} ${
                    dados.quantidadeAlertas ===
                    1
                      ? "situação"
                      : "situações"
                  }`
                : "Tudo acompanhado"}
            </p>
          </div>

          <span className="atalho-seta">
            →
          </span>
        </Link>

        <Link
          href="/categorias"
          className="atalho-card"
        >
          <span className="atalho-icone dourado">
            ◫
          </span>

          <div>
            <strong>
              Categorias
            </strong>

            <p>
              Entenda seus hábitos.
            </p>
          </div>

          <span className="atalho-seta">
            →
          </span>
        </Link>

        <Link
          href="/relatorios"
          className="atalho-card"
        >
          <span className="atalho-icone coral">
            ▥
          </span>

          <div>
            <strong>
              Relatórios
            </strong>

            <p>
              Veja sua evolução.
            </p>
          </div>

          <span className="atalho-seta">
            →
          </span>
        </Link>

        <Link
          href="/metas"
          className="atalho-card"
        >
          <span className="atalho-icone roxo">
            ◎
          </span>

          <div>
            <strong>
              Minhas metas
            </strong>

            <p>
              Acompanhe conquistas.
            </p>
          </div>

          <span className="atalho-seta">
            →
          </span>
        </Link>

        <Link
          href="/reflexoes"
          className="atalho-card"
        >
          <span className="atalho-icone azul">
            ◉
          </span>

          <div>
            <strong>
              Escolhas conscientes
            </strong>

            <p>
              Observe seus padrões.
            </p>
          </div>

          <span className="atalho-seta">
            →
          </span>
        </Link>

        <Link
          href="/conquistas"
          className="atalho-card"
        >
          <span className="atalho-icone roxo">
            ★
          </span>

          <div>
            <strong>
              Conquistas
            </strong>

            <p>
              Veja sua evolução.
            </p>
          </div>

          <span className="atalho-seta">
            →
          </span>
        </Link>

        <Link
          href="/simulador"
          className="atalho-card atalho-simulador"
        >
          <span className="atalho-icone roxo">
            ✦
          </span>

          <div>
            <strong>
              E se...?
            </strong>

            <p>
              Simule antes de decidir.
            </p>
          </div>

          <span className="atalho-seta">
            →
          </span>
        </Link>
      </section>

      {/* ======================================
          MENSAGEM FINAL
          ====================================== */}

      <section className="home-mensagem-final">
        <span>
          🌱
        </span>

        <div>
          <strong>
            Clareza vem antes da
            mudança.
          </strong>

          <p>
            O ConquistIA organiza
            somente as informações que
            você escolhe registrar para
            ajudar a compreender seu
            próprio mês, sem julgar suas
            escolhas.
          </p>
        </div>
      </section>
    </div>
  );
}