"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

const CHAVE_GASTOS =
  "conquistia-gastos-v1";

const CHAVE_REFLEXOES =
  "conquistia-reflexoes-v1";

const OPCOES = [
  {
    id: "planejado",
    titulo: "Foi planejado",
    icone: "✓",
    descricao:
      "Esse gasto já fazia parte do que eu pretendia fazer.",
  },

  {
    id: "necessario",
    titulo: "Foi necessário",
    icone: "◉",
    descricao:
      "Foi uma necessidade daquele momento.",
  },

  {
    id: "ocasiao",
    titulo: "Foi uma ocasião especial",
    icone: "★",
    descricao:
      "Foi uma escolha fora da rotina por uma ocasião específica.",
  },

  {
    id: "impulso",
    titulo: "Aconteceu no impulso",
    icone: "↯",
    descricao:
      "Não estava planejado e decidi no momento.",
  },

  {
    id: "nao-classificar",
    titulo: "Prefiro não classificar",
    icone: "—",
    descricao:
      "Quero manter somente o registro do gasto.",
  },
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

function salvarLista(
  chave,
  lista
) {
  try {
    window.localStorage.setItem(
      chave,
      JSON.stringify(lista)
    );

    return true;
  } catch (erro) {
    console.error(
      `Erro ao salvar ${chave}:`,
      erro
    );

    return false;
  }
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
    data.split("-");

  if (
    partes.length !== 3
  ) {
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
    data.split("-");

  if (
    partes.length !== 3
  ) {
    return false;
  }

  return (
    Number(partes[0]) === ano &&
    Number(partes[1]) === mes
  );
}

function gerarIdPadrao(
  tipo,
  data,
  categoria
) {
  return `${tipo}-${data}-${categoria || "geral"}`;
}

function obterIconeCategoria(
  categoria
) {
  const icones = {
    Alimentação: "🍽️",
    Transporte: "🚗",
    Casa: "🏠",
    Lazer: "🎮",
    Saúde: "❤️",
    Estudos: "📚",
    Compras: "🛍️",
    Assinaturas: "📱",
    Presentes: "🎁",
    Outros: "📌",
  };

  return (
    icones[categoria] ||
    "📌"
  );
}

export default function ReflexoesPage() {
  const [
    gastos,
    setGastos,
  ] = useState([]);

  const [
    reflexoes,
    setReflexoes,
  ] = useState([]);

  const [
    carregado,
    setCarregado,
  ] = useState(false);

  const [
    filtro,
    setFiltro,
  ] = useState("novos");

  const [
    mensagem,
    setMensagem,
  ] = useState("");

  const [
    erro,
    setErro,
  ] = useState("");

  useEffect(() => {
    function carregar() {
      setGastos(
        carregarLista(
          CHAVE_GASTOS
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

      const gruposPorDia =
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

      const padroes = [];

      /*
        PADRÃO 1

        3 ou mais gastos da mesma
        categoria no mesmo dia.

        O aplicativo NÃO afirma
        que foi impulso.
      */

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

          const total =
            lista.reduce(
              (
                soma,
                gasto
              ) =>
                soma +
                Number(
                  gasto.valor ||
                    0
                ),
              0
            );

          const id =
            gerarIdPadrao(
              "categoria-repetida",
              data,
              categoria
            );

          padroes.push({
            id,

            tipo:
              "categoria-repetida",

            nivel:
              lista.length >= 5
                ? "observacao"
                : "leve",

            icone:
              obterIconeCategoria(
                categoria
              ),

            titulo:
              "Vários registros na mesma categoria",

            texto:
              `Foram registrados ${lista.length} gastos em ${categoria} no mesmo dia.`,

            pergunta:
              "Esse conjunto de gastos estava planejado?",

            data,

            categoria,

            quantidade:
              lista.length,

            total,

            gastos:
              lista,
          });
        }
      );

      /*
        PADRÃO 2

        5 ou mais registros no
        mesmo dia, independentemente
        da categoria.
      */

      Object.entries(
        gruposPorDia
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

          const total =
            lista.reduce(
              (
                soma,
                gasto
              ) =>
                soma +
                Number(
                  gasto.valor ||
                    0
                ),
              0
            );

          const categorias =
            new Set(
              lista.map(
                (gasto) =>
                  gasto.categoria ||
                  "Outros"
              )
            );

          const id =
            gerarIdPadrao(
              "dia-movimentado",
              data,
              "geral"
            );

          padroes.push({
            id,

            tipo:
              "dia-movimentado",

            nivel:
              lista.length >= 8
                ? "observacao"
                : "leve",

            icone:
              "◉",

            titulo:
              "Dia com muitos registros",

            texto:
              `Foram registrados ${lista.length} gastos em ${categorias.size} categorias diferentes neste dia.`,

            pergunta:
              "Esse foi um dia diferente da sua rotina?",

            data,

            categoria:
              "Várias categorias",

            quantidade:
              lista.length,

            total,

            gastos:
              lista,
          });
        }
      );

      /*
        Evita alertas repetidos.
      */

      const unicos =
        Array.from(
          new Map(
            padroes.map(
              (padrao) => [
                padrao.id,
                padrao,
              ]
            )
          ).values()
        );

      unicos.sort(
        (
          primeiro,
          segundo
        ) =>
          String(
            segundo.data
          ).localeCompare(
            String(
              primeiro.data
            )
          )
      );

      const classificados =
        unicos.map(
          (padrao) => {
            const reflexao =
              reflexoes.find(
                (item) =>
                  item.padraoId ===
                  padrao.id
              );

            return {
              ...padrao,

              resposta:
                reflexao?.resposta ||
                null,

              respondidoEm:
                reflexao?.respondidoEm ||
                null,
            };
          }
        );

      const novos =
        classificados.filter(
          (padrao) =>
            !padrao.resposta
        );

      const respondidos =
        classificados.filter(
          (padrao) =>
            Boolean(
              padrao.resposta
            )
        );

      const respostasMes =
        reflexoes.filter(
          (item) =>
            pertenceAoMes(
              item.data,
              ano,
              mes
            )
        );

      const planejados =
        respostasMes.filter(
          (item) =>
            item.resposta ===
            "planejado"
        ).length;

      const necessarios =
        respostasMes.filter(
          (item) =>
            item.resposta ===
            "necessario"
        ).length;

      const ocasioes =
        respostasMes.filter(
          (item) =>
            item.resposta ===
            "ocasiao"
        ).length;

      const impulsos =
        respostasMes.filter(
          (item) =>
            item.resposta ===
            "impulso"
        ).length;

      return {
        gastosMes,
        padroes:
          classificados,

        novos,
        respondidos,

        respostasMes,

        planejados,
        necessarios,
        ocasioes,
        impulsos,
      };
    }, [
      gastos,
      reflexoes,
    ]);

  const listaExibida =
    useMemo(() => {
      if (
        filtro === "novos"
      ) {
        return dados.novos;
      }

      if (
        filtro ===
        "respondidos"
      ) {
        return dados.respondidos;
      }

      return dados.padroes;
    }, [
      filtro,
      dados,
    ]);

  function classificar(
    padrao,
    resposta
  ) {
    setMensagem("");
    setErro("");

    const agora =
      new Date()
        .toISOString();

    const existente =
      reflexoes.find(
        (item) =>
          item.padraoId ===
          padrao.id
      );

    let novasReflexoes;

    if (existente) {
      novasReflexoes =
        reflexoes.map(
          (item) =>
            item.padraoId ===
            padrao.id
              ? {
                  ...item,
                  resposta,
                  respondidoEm:
                    agora,
                }
              : item
        );
    } else {
      novasReflexoes = [
        {
          id:
            `${padrao.id}-${Date.now()}`,

          padraoId:
            padrao.id,

          tipo:
            padrao.tipo,

          data:
            padrao.data,

          categoria:
            padrao.categoria,

          quantidade:
            padrao.quantidade,

          total:
            padrao.total,

          resposta,

          respondidoEm:
            agora,
        },

        ...reflexoes,
      ];
    }

    const salvou =
      salvarLista(
        CHAVE_REFLEXOES,
        novasReflexoes
      );

    if (!salvou) {
      setErro(
        "Não foi possível salvar esta reflexão."
      );

      return;
    }

    setReflexoes(
      novasReflexoes
    );

    setMensagem(
      "Reflexão registrada. Obrigado por observar sua própria escolha."
    );
  }

  function obterTextoResposta(
    resposta
  ) {
    const opcao =
      OPCOES.find(
        (item) =>
          item.id ===
          resposta
      );

    return (
      opcao?.titulo ||
      "Não classificado"
    );
  }

  if (!carregado) {
    return (
      <div className="reflexoes-carregando">
        <span />

        <strong>
          Observando seus registros...
        </strong>
      </div>
    );
  }

  return (
    <div className="reflexoes-pagina">
      <section className="reflexoes-apresentacao">
        <div>
          <span>
            Consciência financeira
          </span>

          <h1>
            Entenda o contexto das
            suas escolhas
          </h1>

          <p>
            O ConquistIA percebe
            padrões nos registros e
            convida você a refletir,
            sem diagnosticar ou julgar
            seu comportamento.
          </p>
        </div>

        <Link
          href="/registrar-gasto"
          className="reflexoes-registrar"
        >
          + Registrar gasto
        </Link>
      </section>

      <section className="reflexoes-principio">
        <span>
          🧠
        </span>

        <div>
          <strong>
            O aplicativo não decide
            se uma compra foi por
            impulso.
          </strong>

          <p>
            Ele apenas identifica
            registros próximos ou
            repetidos e pergunta como
            você interpreta aquela
            situação.
          </p>
        </div>
      </section>

      {erro && (
        <div className="reflexoes-mensagem erro">
          <span>!</span>

          <p>
            {erro}
          </p>
        </div>
      )}

      {mensagem && (
        <div className="reflexoes-mensagem sucesso">
          <span>✓</span>

          <p>
            {mensagem}
          </p>
        </div>
      )}

      <section className="reflexoes-resumo">
        <article>
          <span className="reflexao-resumo-icone verde">
            ◉
          </span>

          <div>
            <span>
              Padrões encontrados
            </span>

            <strong>
              {
                dados.padroes
                  .length
              }
            </strong>

            <small>
              neste mês
            </small>
          </div>
        </article>

        <article>
          <span className="reflexao-resumo-icone amarelo">
            ?
          </span>

          <div>
            <span>
              Para refletir
            </span>

            <strong>
              {
                dados.novos
                  .length
              }
            </strong>

            <small>
              ainda sem classificação
            </small>
          </div>
        </article>

        <article>
          <span className="reflexao-resumo-icone azul">
            ✓
          </span>

          <div>
            <span>
              Já observados
            </span>

            <strong>
              {
                dados.respondidos
                  .length
              }
            </strong>

            <small>
              padrões classificados
            </small>
          </div>
        </article>

        <article>
          <span className="reflexao-resumo-icone coral">
            ↯
          </span>

          <div>
            <span>
              Marcados como impulso
            </span>

            <strong>
              {
                dados.impulsos
              }
            </strong>

            <small>
              pela própria pessoa
            </small>
          </div>
        </article>
      </section>

      <section className="reflexoes-distribuicao">
        <div className="reflexoes-distribuicao-topo">
          <div>
            <span>
              Autopercepção
            </span>

            <h2>
              Como você classificou
              suas escolhas?
            </h2>
          </div>
        </div>

        <div className="reflexoes-distribuicao-grid">
          <div>
            <span>
              Planejadas
            </span>

            <strong>
              {
                dados.planejados
              }
            </strong>
          </div>

          <div>
            <span>
              Necessárias
            </span>

            <strong>
              {
                dados.necessarios
              }
            </strong>
          </div>

          <div>
            <span>
              Ocasiões especiais
            </span>

            <strong>
              {
                dados.ocasioes
              }
            </strong>
          </div>

          <div>
            <span>
              Impulso
            </span>

            <strong>
              {
                dados.impulsos
              }
            </strong>
          </div>
        </div>
      </section>

      <section className="reflexoes-lista-box">
        <div className="reflexoes-lista-topo">
          <div>
            <span>
              Padrões percebidos
            </span>

            <h2>
              O que aconteceu?
            </h2>
          </div>

          <div className="reflexoes-filtros">
            <button
              type="button"
              className={
                filtro ===
                "novos"
                  ? "ativo"
                  : ""
              }
              onClick={() =>
                setFiltro(
                  "novos"
                )
              }
            >
              Para refletir
            </button>

            <button
              type="button"
              className={
                filtro ===
                "respondidos"
                  ? "ativo"
                  : ""
              }
              onClick={() =>
                setFiltro(
                  "respondidos"
                )
              }
            >
              Respondidos
            </button>

            <button
              type="button"
              className={
                filtro ===
                "todos"
                  ? "ativo"
                  : ""
              }
              onClick={() =>
                setFiltro(
                  "todos"
                )
              }
            >
              Todos
            </button>
          </div>
        </div>

        {listaExibida.length ===
        0 ? (
          <div className="reflexoes-vazio">
            <span>
              🌿
            </span>

            <h3>
              Nenhum padrão para
              mostrar
            </h3>

            <p>
              Conforme novos gastos
              forem registrados, o
              ConquistIA poderá
              identificar situações
              para reflexão.
            </p>
          </div>
        ) : (
          <div className="reflexoes-lista">
            {listaExibida.map(
              (padrao) => (
                <article
                  key={
                    padrao.id
                  }
                  className="reflexao-item"
                >
                  <div className="reflexao-item-topo">
                    <span className="reflexao-item-icone">
                      {
                        padrao.icone
                      }
                    </span>

                    <div className="reflexao-item-titulo">
                      <span>
                        {formatarData(
                          padrao.data
                        )}
                      </span>

                      <h3>
                        {
                          padrao.titulo
                        }
                      </h3>

                      <p>
                        {
                          padrao.texto
                        }
                      </p>
                    </div>

                    <div className="reflexao-item-total">
                      <span>
                        Total
                      </span>

                      <strong>
                        {formatarMoeda(
                          padrao.total
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="reflexao-detalhes">
                    <span>
                      {
                        padrao.quantidade
                      }{" "}
                      registros
                    </span>

                    <span>
                      {
                        padrao.categoria
                      }
                    </span>
                  </div>

                  {padrao.resposta ? (
                    <div className="reflexao-respondida">
                      <span>
                        ✓
                      </span>

                      <div>
                        <small>
                          Sua classificação
                        </small>

                        <strong>
                          {obterTextoResposta(
                            padrao.resposta
                          )}
                        </strong>
                      </div>
                    </div>
                  ) : (
                    <div className="reflexao-pergunta">
                      <strong>
                        {
                          padrao.pergunta
                        }
                      </strong>

                      <div className="reflexao-opcoes">
                        {OPCOES.map(
                          (opcao) => (
                            <button
                              key={
                                opcao.id
                              }
                              type="button"
                              onClick={() =>
                                classificar(
                                  padrao,
                                  opcao.id
                                )
                              }
                            >
                              <span>
                                {
                                  opcao.icone
                                }
                              </span>

                              <div>
                                <strong>
                                  {
                                    opcao.titulo
                                  }
                                </strong>

                                <small>
                                  {
                                    opcao.descricao
                                  }
                                </small>
                              </div>
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </article>
              )
            )}
          </div>
        )}
      </section>

      <section className="reflexoes-explicacao">
        <span>
          🌱
        </span>

        <div>
          <strong>
            O objetivo é reconhecer
            padrões, não eliminar tudo
            o que dá prazer.
          </strong>

          <p>
            Uma compra pode ser
            planejada, necessária,
            especial ou espontânea.
            A informação ganha valor
            quando você entende o
            contexto em que ela
            aconteceu.
          </p>
        </div>
      </section>
    </div>
  );
}