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

const CHAVE_RENDA_ANTIGA =
  "conquistia-renda-mensal-v1";

const CHAVE_POUPANCA =
  "conquistia-poupanca-v1";

const CHAVE_CONTAS =
  "conquistia-contas-v1";

const CHAVE_CATEGORIAS =
  "conquistia-categorias-config-v1";

const CHAVE_REFLEXOES =
  "conquistia-reflexoes-v1";

const CATEGORIAS_PADRAO = [
  "Alimentação",
  "Transporte",
  "Casa",
  "Saúde",
  "Lazer",
  "Estudos",
  "Compras",
  "Assinaturas",
  "Presentes",
  "Outros",
];

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

    const resultado =
      JSON.parse(dados);

    if (
      resultado &&
      typeof resultado === "object" &&
      !Array.isArray(resultado)
    ) {
      return resultado;
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

function normalizarTexto(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .trim()
    .toLowerCase();
}

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

  if (partes.length !== 3) {
    return data;
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
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

function criarChaveMes(
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
    dataTexto
      .split("-")
      .map(Number);

  if (partes.length !== 3) {
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

function hojeLocal() {
  const data =
    new Date();

  data.setHours(
    0,
    0,
    0,
    0
  );

  return data;
}

function diferencaDias(
  dataTexto
) {
  const vencimento =
    criarDataLocal(
      dataTexto
    );

  if (!vencimento) {
    return null;
  }

  const hoje =
    hojeLocal();

  return Math.round(
    (
      vencimento.getTime() -
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

function obterInicioSemana() {
  const hoje =
    hojeLocal();

  const diaSemana =
    hoje.getDay();

  const ajuste =
    diaSemana === 0
      ? -6
      : 1 - diaSemana;

  const inicio =
    new Date(hoje);

  inicio.setDate(
    hoje.getDate() +
      ajuste
  );

  return inicio;
}

function obterFimSemana() {
  const inicio =
    obterInicioSemana();

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

function dataDentroIntervalo(
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

function obterIdCategoria(
  nome
) {
  const normalizado =
    normalizarTexto(nome);

  const mapa = {
    alimentacao:
      "alimentacao",

    transporte:
      "transporte",

    casa:
      "casa",

    saude:
      "saude",

    lazer:
      "lazer",

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
    mapa[normalizado] ||
    "outros"
  );
}

function gerarIdPadrao(
  tipo,
  data,
  categoria
) {
  return `${tipo}-${data}-${categoria || "geral"}`;
}

export default function AlertasPage() {
  const [
    gastos,
    setGastos,
  ] = useState([]);

  const [
    receitas,
    setReceitas,
  ] = useState([]);

  const [
    rendaAntiga,
    setRendaAntiga,
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
    categoriasConfig,
    setCategoriasConfig,
  ] = useState({});

  const [
    reflexoes,
    setReflexoes,
  ] = useState([]);

  const [
    filtro,
    setFiltro,
  ] = useState("todos");

  const [
    carregado,
    setCarregado,
  ] = useState(false);

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

      setRendaAntiga(
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

      setCategoriasConfig(
        carregarObjeto(
          CHAVE_CATEGORIAS
        )
      );

      setReflexoes(
        carregarLista(
          CHAVE_REFLEXOES
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

  const dados =
    useMemo(() => {
      const agora =
        new Date();

      const ano =
        agora.getFullYear();

      const mes =
        agora.getMonth() + 1;

      const chaveMes =
        criarChaveMes(
          ano,
          mes
        );

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

      const rendaLegada =
        Number(
          rendaAntiga[
            chaveMes
          ] || 0
        );

      const totalReceitas =
        totalReceitasNovas > 0
          ? totalReceitasNovas
          : rendaLegada;

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

      const listaPoupanca =
        Array.isArray(
          poupancas[
            chaveMes
          ]
        )
          ? poupancas[
              chaveMes
            ]
          : [];

      const totalSeparado =
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

      const disponivelAgora =
        totalReceitas -
        totalGastos -
        totalSeparado;

      const livreProjetado =
        disponivelAgora -
        totalContasPendentes;

      const ultimoDiaMes =
        new Date(
          ano,
          mes,
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
        obterInicioSemana();

      const fimSemana =
        obterFimSemana();

      const gastosSemana =
        gastosMes.filter(
          (gasto) =>
            dataDentroIntervalo(
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

      const alertas = [];

      /*
        ============================
        1. CONTAS
        ============================
      */

      contasPendentes.forEach(
        (conta) => {
          const dias =
            diferencaDias(
              conta.vencimento
            );

          if (dias === null) {
            return;
          }

          if (dias < 0) {
            alertas.push({
              id:
                `conta-atrasada-${conta.id}`,

              grupo:
                "contas",

              nivel:
                "critico",

              icone:
                "!",

              titulo:
                "Conta com vencimento passado",

              texto:
                `${conta.descricao} venceu em ${formatarData(
                  conta.vencimento
                )} e continua marcada como pendente.`,

              complemento:
                formatarMoeda(
                  conta.valor
                ),

              href:
                "/contas",

              botao:
                "Ver conta",
            });

            return;
          }

          if (dias === 0) {
            alertas.push({
              id:
                `conta-hoje-${conta.id}`,

              grupo:
                "contas",

              nivel:
                "critico",

              icone:
                "🔔",

              titulo:
                "Conta vence hoje",

              texto:
                `${conta.descricao} está cadastrada com vencimento para hoje.`,

              complemento:
                formatarMoeda(
                  conta.valor
                ),

              href:
                "/contas",

              botao:
                "Abrir contas",
            });

            return;
          }

          if (dias <= 3) {
            alertas.push({
              id:
                `conta-proxima-${conta.id}`,

              grupo:
                "contas",

              nivel:
                "atencao",

              icone:
                "◷",

              titulo:
                "Vencimento próximo",

              texto:
                `${conta.descricao} vence em ${dias} ${
                  dias === 1
                    ? "dia"
                    : "dias"
                }.`,

              complemento:
                formatarMoeda(
                  conta.valor
                ),

              href:
                "/contas",

              botao:
                "Ver conta",
            });

            return;
          }

          if (dias <= 7) {
            alertas.push({
              id:
                `conta-lembrete-${conta.id}`,

              grupo:
                "contas",

              nivel:
                "informativo",

              icone:
                "◷",

              titulo:
                "Conta chegando",

              texto:
                `${conta.descricao} vence em ${dias} dias, em ${formatarData(
                  conta.vencimento
                )}.`,

              complemento:
                formatarMoeda(
                  conta.valor
                ),

              href:
                "/contas",

              botao:
                "Ver compromisso",
            });
          }
        }
      );

      /*
        ============================
        2. RITMO SEMANAL
        ============================
      */

      if (
        totalReceitas > 0 &&
        livreProjetado < 0
      ) {
        alertas.push({
          id:
            "livre-projetado-negativo",

          grupo:
            "gastos",

          nivel:
            "critico",

          icone:
            "!",

          titulo:
            "Livre projetado negativo",

          texto:
            `Considerando gastos, valores separados e contas pendentes, o mês está projetado em ${formatarMoeda(
              Math.abs(
                livreProjetado
              )
            )} acima das receitas cadastradas.`,

          complemento:
            formatarMoeda(
              livreProjetado
            ),

          href:
            "/painel",

          botao:
            "Revisar mês",
        });
      }

      if (
        ritmoSemanal > 0 &&
        percentualSemana > 120
      ) {
        alertas.push({
          id:
            "semana-muito-acima",

          grupo:
            "gastos",

          nivel:
            "critico",

          icone:
            "↑",

          titulo:
            "Semana muito acima da referência",

          texto:
            `Foram registrados ${formatarMoeda(
              totalGastosSemana
            )} nesta semana. A referência semanal atual é de aproximadamente ${formatarMoeda(
              ritmoSemanal
            )}.`,

          complemento:
            `${percentualSemana.toFixed(
              0
            )}%`,

          href:
            "/meu-diario",

          botao:
            "Revisar gastos",
        });
      } else if (
        ritmoSemanal > 0 &&
        percentualSemana > 100
      ) {
        alertas.push({
          id:
            "semana-acima",

          grupo:
            "gastos",

          nivel:
            "atencao",

          icone:
            "↑",

          titulo:
            "Semana acima da referência",

          texto:
            `Os registros desta semana chegaram a ${formatarMoeda(
              totalGastosSemana
            )}, acima da referência aproximada de ${formatarMoeda(
              ritmoSemanal
            )}.`,

          complemento:
            `${percentualSemana.toFixed(
              0
            )}%`,

          href:
            "/meu-diario",

          botao:
            "Ver semana",
        });
      } else if (
        ritmoSemanal > 0 &&
        percentualSemana >= 85
      ) {
        alertas.push({
          id:
            "semana-proxima",

          grupo:
            "gastos",

          nivel:
            "atencao",

          icone:
            "◉",

          titulo:
            "Semana próxima da referência",

          texto:
            `Os gastos registrados já representam ${percentualSemana.toFixed(
              0
            )}% da referência semanal atual.`,

          complemento:
            formatarMoeda(
              totalGastosSemana
            ),

          href:
            "/meu-diario",

          botao:
            "Ver registros",
        });
      }

      /*
        ============================
        3. CATEGORIAS
        ============================
      */

      CATEGORIAS_PADRAO.forEach(
        (nomeCategoria) => {
          const idCategoria =
            obterIdCategoria(
              nomeCategoria
            );

          const config =
            categoriasConfig[
              idCategoria
            ] || {};

          const referencia =
            Number(
              config.referencia || 0
            );

          if (
            referencia <= 0
          ) {
            return;
          }

          const totalCategoria =
            gastosMes
              .filter(
                (gasto) =>
                  obterIdCategoria(
                    gasto.categoria
                  ) ===
                  idCategoria
              )
              .reduce(
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

          if (
            totalCategoria <= 0
          ) {
            return;
          }

          const percentual =
            (
              totalCategoria /
              referencia
            ) * 100;

          if (
            percentual > 100
          ) {
            alertas.push({
              id:
                `categoria-acima-${idCategoria}`,

              grupo:
                "categorias",

              nivel:
                "critico",

              icone:
                "▥",

              titulo:
                `${nomeCategoria} ultrapassou sua referência`,

              texto:
                `Você definiu uma referência de ${formatarMoeda(
                  referencia
                )}. Os gastos registrados nessa categoria somam ${formatarMoeda(
                  totalCategoria
                )}.`,

              complemento:
                `${percentual.toFixed(
                  0
                )}%`,

              href:
                "/categorias",

              botao:
                "Ver categoria",
            });

            return;
          }

          if (
            percentual >= 85
          ) {
            alertas.push({
              id:
                `categoria-proxima-${idCategoria}`,

              grupo:
                "categorias",

              nivel:
                "atencao",

              icone:
                "▥",

              titulo:
                `${nomeCategoria} está próxima da referência`,

              texto:
                `Os gastos registrados chegaram a ${formatarMoeda(
                  totalCategoria
                )}, equivalente a ${percentual.toFixed(
                  0
                )}% da referência definida por você.`,

              complemento:
                `${percentual.toFixed(
                  0
                )}%`,

              href:
                "/categorias",

              botao:
                "Ver categoria",
            });
          }
        }
      );

      /*
        ============================
        4. REFLEXÕES
        ============================
      */

      const gruposCategoriaDia =
        gastosMes.reduce(
          (
            acumulador,
            gasto
          ) => {
            const categoria =
              gasto.categoria ||
              "Outros";

            const chave =
              `${gasto.data || "sem-data"}|${categoria}`;

            if (
              !acumulador[chave]
            ) {
              acumulador[chave] =
                [];
            }

            acumulador[
              chave
            ].push(gasto);

            return acumulador;
          },
          {}
        );

      const gruposDia =
        gastosMes.reduce(
          (
            acumulador,
            gasto
          ) => {
            const chave =
              gasto.data ||
              "sem-data";

            if (
              !acumulador[chave]
            ) {
              acumulador[chave] =
                [];
            }

            acumulador[
              chave
            ].push(gasto);

            return acumulador;
          },
          {}
        );

      const padroes = [];

      Object.entries(
        gruposCategoriaDia
      ).forEach(
        ([
          chave,
          lista,
        ]) => {
          if (
            lista.length < 3
          ) {
            return;
          }

          const [
            data,
            categoria,
          ] =
            chave.split("|");

          padroes.push({
            id:
              gerarIdPadrao(
                "categoria-repetida",
                data,
                categoria
              ),

            data,

            titulo:
              "Novo padrão para refletir",
          });
        }
      );

      Object.entries(
        gruposDia
      ).forEach(
        ([
          data,
          lista,
        ]) => {
          if (
            lista.length < 5
          ) {
            return;
          }

          padroes.push({
            id:
              gerarIdPadrao(
                "dia-movimentado",
                data,
                "geral"
              ),

            data,

            titulo:
              "Dia com muitos registros",
          });
        }
      );

      const unicos =
        Array.from(
          new Map(
            padroes.map(
              (item) => [
                item.id,
                item,
              ]
            )
          ).values()
        );

      unicos.forEach(
        (padrao) => {
          const jaRespondido =
            reflexoes.some(
              (item) =>
                item.padraoId ===
                  padrao.id &&
                Boolean(
                  item.resposta
                )
            );

          if (
            jaRespondido
          ) {
            return;
          }

          alertas.push({
            id:
              `reflexao-${padrao.id}`,

            grupo:
              "reflexoes",

            nivel:
              "informativo",

            icone:
              "🧠",

            titulo:
              padrao.titulo,

            texto:
              `Existe uma situação registrada em ${formatarData(
                padrao.data
              )} que pode ser observada com mais atenção.`,

            complemento:
              "Reflexão",

            href:
              "/reflexoes",

            botao:
              "Refletir",
          });
        }
      );

      /*
        ORDEM
      */

      const ordem = {
        critico: 1,
        atencao: 2,
        informativo: 3,
        positivo: 4,
      };

      alertas.sort(
        (
          primeiro,
          segundo
        ) =>
          ordem[
            primeiro.nivel
          ] -
          ordem[
            segundo.nivel
          ]
      );

      return {
        totalReceitas,
        totalGastos,
        totalContasPendentes,

        livreProjetado,

        ritmoSemanal,
        totalGastosSemana,
        percentualSemana,

        alertas,

        criticos:
          alertas.filter(
            (alerta) =>
              alerta.nivel ===
              "critico"
          ).length,

        atencao:
          alertas.filter(
            (alerta) =>
              alerta.nivel ===
              "atencao"
          ).length,

        contas:
          alertas.filter(
            (alerta) =>
              alerta.grupo ===
              "contas"
          ).length,

        gastos:
          alertas.filter(
            (alerta) =>
              alerta.grupo ===
              "gastos"
          ).length,

        categorias:
          alertas.filter(
            (alerta) =>
              alerta.grupo ===
              "categorias"
          ).length,

        reflexoes:
          alertas.filter(
            (alerta) =>
              alerta.grupo ===
              "reflexoes"
          ).length,
      };
    }, [
      gastos,
      receitas,
      rendaAntiga,
      poupancas,
      contas,
      categoriasConfig,
      reflexoes,
    ]);

  const alertasFiltrados =
    useMemo(() => {
      if (
        filtro === "todos"
      ) {
        return dados.alertas;
      }

      if (
        filtro === "importantes"
      ) {
        return dados.alertas.filter(
          (alerta) =>
            alerta.nivel ===
              "critico" ||
            alerta.nivel ===
              "atencao"
        );
      }

      return dados.alertas.filter(
        (alerta) =>
          alerta.grupo ===
          filtro
      );
    }, [
      dados.alertas,
      filtro,
    ]);

  if (!carregado) {
    return (
      <div className="alertas-carregando">
        <span />

        <strong>
          Analisando seus registros...
        </strong>
      </div>
    );
  }

  return (
    <div className="alertas-pagina">
      <section className="alertas-apresentacao">
        <div>
          <span>
            Centro inteligente
          </span>

          <h1>
            O que merece sua atenção?
          </h1>

          <p>
            O ConquistIA reúne
            vencimentos, ritmo do mês,
            referências de categorias
            e padrões para reflexão.
          </p>
        </div>

        <div className="alertas-data">
          <span>
            Hoje
          </span>

          <strong>
            {new Date().toLocaleDateString(
              "pt-BR"
            )}
          </strong>
        </div>
      </section>

      <section className="alertas-principio">
        <span>
          ✦
        </span>

        <div>
          <strong>
            Inteligência para informar,
            não para julgar.
          </strong>

          <p>
            Os alertas usam somente os
            registros que você decidiu
            inserir e as referências que
            você mesma definiu.
          </p>
        </div>
      </section>

      <section className="alertas-resumo integrado">
        <article>
          <span className="alerta-resumo-icone vermelho">
            !
          </span>

          <div>
            <span>
              Importantes
            </span>

            <strong>
              {
                dados.criticos
              }
            </strong>

            <small>
              precisam de atenção
            </small>
          </div>
        </article>

        <article>
          <span className="alerta-resumo-icone amarelo">
            ◉
          </span>

          <div>
            <span>
              Atenção
            </span>

            <strong>
              {
                dados.atencao
              }
            </strong>

            <small>
              acompanhe
            </small>
          </div>
        </article>

        <article>
          <span className="alerta-resumo-icone azul">
            ◷
          </span>

          <div>
            <span>
              Contas
            </span>

            <strong>
              {
                dados.contas
              }
            </strong>

            <small>
              vencimentos
            </small>
          </div>
        </article>

        <article>
          <span className="alerta-resumo-icone verde">
            ▥
          </span>

          <div>
            <span>
              Categorias
            </span>

            <strong>
              {
                dados.categorias
              }
            </strong>

            <small>
              referências
            </small>
          </div>
        </article>

        <article>
          <span className="alerta-resumo-icone roxo">
            🧠
          </span>

          <div>
            <span>
              Reflexões
            </span>

            <strong>
              {
                dados.reflexoes
              }
            </strong>

            <small>
              padrões novos
            </small>
          </div>
        </article>
      </section>

      <section className="alertas-situacao-semana">
        <div>
          <span>
            Semana atual
          </span>

          <h2>
            Acompanhamento dos gastos
          </h2>
        </div>

        <div className="alertas-semana-dados">
          <div>
            <span>
              Gastos registrados
            </span>

            <strong>
              {formatarMoeda(
                dados.totalGastosSemana
              )}
            </strong>
          </div>

          <div>
            <span>
              Referência semanal
            </span>

            <strong>
              {dados.ritmoSemanal > 0
                ? formatarMoeda(
                    dados.ritmoSemanal
                  )
                : "—"}
            </strong>
          </div>

          <div>
            <span>
              Livre projetado
            </span>

            <strong>
              {dados.totalReceitas > 0
                ? formatarMoeda(
                    dados.livreProjetado
                  )
                : "—"}
            </strong>
          </div>
        </div>

        {dados.ritmoSemanal > 0 && (
          <>
            <div className="alertas-barra">
              <span
                className={
                  dados.percentualSemana >
                  100
                    ? "ultrapassou"
                    : dados.percentualSemana >=
                        85
                      ? "atencao"
                      : ""
                }
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      0,
                      dados.percentualSemana
                    )
                  )}%`,
                }}
              />
            </div>

            <div className="alertas-barra-texto">
              <span>
                Uso da referência
                semanal
              </span>

              <strong>
                {dados.percentualSemana.toFixed(
                  0
                )}
                %
              </strong>
            </div>
          </>
        )}
      </section>

      <section className="alertas-lista-box">
        <div className="alertas-lista-topo">
          <div>
            <span>
              Central de atenção
            </span>

            <h2>
              Alertas inteligentes
            </h2>
          </div>

          <div className="alertas-filtros">
            <button
              type="button"
              className={
                filtro === "todos"
                  ? "ativo"
                  : ""
              }
              onClick={() =>
                setFiltro("todos")
              }
            >
              Todos
            </button>

            <button
              type="button"
              className={
                filtro ===
                "importantes"
                  ? "ativo"
                  : ""
              }
              onClick={() =>
                setFiltro(
                  "importantes"
                )
              }
            >
              Importantes
            </button>

            <button
              type="button"
              className={
                filtro === "contas"
                  ? "ativo"
                  : ""
              }
              onClick={() =>
                setFiltro("contas")
              }
            >
              Contas
            </button>

            <button
              type="button"
              className={
                filtro === "gastos"
                  ? "ativo"
                  : ""
              }
              onClick={() =>
                setFiltro("gastos")
              }
            >
              Gastos
            </button>

            <button
              type="button"
              className={
                filtro ===
                "categorias"
                  ? "ativo"
                  : ""
              }
              onClick={() =>
                setFiltro(
                  "categorias"
                )
              }
            >
              Categorias
            </button>

            <button
              type="button"
              className={
                filtro ===
                "reflexoes"
                  ? "ativo"
                  : ""
              }
              onClick={() =>
                setFiltro(
                  "reflexoes"
                )
              }
            >
              Reflexões
            </button>
          </div>
        </div>

        {alertasFiltrados.length ===
        0 ? (
          <div className="alertas-vazio">
            <span>
              🌿
            </span>

            <h3>
              Nenhum alerta neste filtro
            </h3>

            <p>
              Os registros atuais não
              geraram nenhuma situação
              para mostrar aqui.
            </p>
          </div>
        ) : (
          <div className="alertas-lista">
            {alertasFiltrados.map(
              (alerta) => (
                <article
                  key={
                    alerta.id
                  }
                  className={`alerta-item ${alerta.nivel}`}
                >
                  <span className="alerta-item-icone">
                    {
                      alerta.icone
                    }
                  </span>

                  <div className="alerta-item-conteudo">
                    <span className="alerta-item-nivel">
                      {alerta.grupo ===
                      "contas"
                        ? "Conta"
                        : alerta.grupo ===
                            "gastos"
                          ? "Ritmo"
                          : alerta.grupo ===
                              "categorias"
                            ? "Categoria"
                            : "Reflexão"}
                    </span>

                    <h3>
                      {
                        alerta.titulo
                      }
                    </h3>

                    <p>
                      {
                        alerta.texto
                      }
                    </p>
                  </div>

                  <strong className="alerta-item-complemento">
                    {
                      alerta.complemento
                    }
                  </strong>

                  <Link
                    href={
                      alerta.href
                    }
                    className="alerta-item-botao"
                  >
                    {
                      alerta.botao
                    }
                  </Link>
                </article>
              )
            )}
          </div>
        )}
      </section>

      <section className="alertas-explicacao">
        <span>
          💡
        </span>

        <div>
          <strong>
            Como funciona essa central?
          </strong>

          <p>
            Contas usam as datas de
            vencimento cadastradas.
            Gastos usam o ritmo semanal.
            Categorias usam referências
            opcionais definidas por você.
            Reflexões aparecem quando
            existe um padrão ainda não
            classificado.
          </p>
        </div>
      </section>
    </div>
  );
}