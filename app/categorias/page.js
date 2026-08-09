"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

const CHAVE_GASTOS =
  "conquistia-gastos-v1";

const CHAVE_CONFIG =
  "conquistia-categorias-config-v1";

const CATEGORIAS_PADRAO = [
  {
    id: "alimentacao",
    nome: "Alimentação",
    icone: "🍴",
    cor: "#159466",
  },
  {
    id: "transporte",
    nome: "Transporte",
    icone: "🚙",
    cor: "#3b9ee8",
  },
  {
    id: "casa",
    nome: "Casa",
    icone: "⌂",
    cor: "#f2aa1f",
  },
  {
    id: "saude",
    nome: "Saúde",
    icone: "♥",
    cor: "#ef5555",
  },
  {
    id: "lazer",
    nome: "Lazer",
    icone: "🎮",
    cor: "#7955d9",
  },
  {
    id: "estudos",
    nome: "Estudos",
    icone: "📚",
    cor: "#4d82cc",
  },
  {
    id: "compras",
    nome: "Compras",
    icone: "🛍️",
    cor: "#ce6fb4",
  },
  {
    id: "assinaturas",
    nome: "Assinaturas",
    icone: "▣",
    cor: "#5e8f80",
  },
  {
    id: "presentes",
    nome: "Presentes",
    icone: "🎁",
    cor: "#cf7d60",
  },
  {
    id: "outros",
    nome: "Outros",
    icone: "•••",
    cor: "#9aa8a1",
  },
];

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
  ).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
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

function salvarObjeto(
  chave,
  objeto
) {
  try {
    window.localStorage.setItem(
      chave,
      JSON.stringify(objeto)
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

function obterNomeMes(
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
    texto.charAt(0).toUpperCase() +
    texto.slice(1)
  );
}

function obterCategoriaPadrao(
  nome
) {
  const normalizado =
    normalizarTexto(nome);

  const encontrada =
    CATEGORIAS_PADRAO.find(
      (categoria) =>
        normalizarTexto(
          categoria.nome
        ) === normalizado
    );

  return (
    encontrada ||
    CATEGORIAS_PADRAO.find(
      (categoria) =>
        categoria.id === "outros"
    )
  );
}

export default function CategoriasPage() {
  const hoje =
    new Date();

  const [
    gastos,
    setGastos,
  ] = useState([]);

  const [
    configuracao,
    setConfiguracao,
  ] = useState({});

  const [
    carregado,
    setCarregado,
  ] = useState(false);

  const [
    anoSelecionado,
    setAnoSelecionado,
  ] = useState(
    hoje.getFullYear()
  );

  const [
    mesSelecionado,
    setMesSelecionado,
  ] = useState(
    hoje.getMonth() + 1
  );

  const [
    gerenciadorAberto,
    setGerenciadorAberto,
  ] = useState(false);

  const [
    mensagem,
    setMensagem,
  ] = useState("");

  useEffect(() => {
    function carregar() {
      setGastos(
        carregarLista(
          CHAVE_GASTOS
        )
      );

      setConfiguracao(
        carregarObjeto(
          CHAVE_CONFIG
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
      const gastosMes =
        gastos.filter(
          (gasto) =>
            pertenceAoMes(
              gasto.data,
              anoSelecionado,
              mesSelecionado
            )
        );

      const totalGasto =
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

      const categorias =
        CATEGORIAS_PADRAO.map(
          (categoria) => {
            const gastosCategoria =
              gastosMes.filter(
                (gasto) => {
                  const categoriaGasto =
                    obterCategoriaPadrao(
                      gasto.categoria
                    );

                  return (
                    categoriaGasto.id ===
                    categoria.id
                  );
                }
              );

            const total =
              gastosCategoria.reduce(
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

            const quantidade =
              gastosCategoria.length;

            const media =
              quantidade > 0
                ? total / quantidade
                : 0;

            const percentual =
              totalGasto > 0
                ? (
                    total /
                    totalGasto
                  ) * 100
                : 0;

            const config =
              configuracao[
                categoria.id
              ] || {};

            const referencia =
              Number(
                config.referencia ||
                  0
              );

            const visivel =
              config.visivel !==
              false;

            const acimaReferencia =
              referencia > 0 &&
              total >
                referencia;

            const percentualReferencia =
              referencia > 0
                ? (
                    total /
                    referencia
                  ) * 100
                : 0;

            return {
              ...categoria,

              total,
              quantidade,
              media,
              percentual,

              referencia,
              visivel,

              acimaReferencia,

              percentualReferencia,
            };
          }
        );

      const categoriasVisiveis =
        categorias.filter(
          (categoria) =>
            categoria.visivel
        );

      const categoriasUtilizadas =
        categorias.filter(
          (categoria) =>
            categoria.total > 0
        );

      const maiorConcentracao =
        [...categorias]
          .sort(
            (
              primeira,
              segunda
            ) =>
              segunda.total -
              primeira.total
          )[0];

      const referenciasCriadas =
        categorias.filter(
          (categoria) =>
            categoria.referencia >
            0
        );

      const acimaReferencia =
        categorias.filter(
          (categoria) =>
            categoria.acimaReferencia
        );

      const mediaPorGasto =
        gastosMes.length > 0
          ? totalGasto /
            gastosMes.length
          : 0;

      return {
        gastosMes,

        totalGasto,

        categorias,
        categoriasVisiveis,
        categoriasUtilizadas,

        maiorConcentracao,

        referenciasCriadas,
        acimaReferencia,

        mediaPorGasto,
      };
    }, [
      gastos,
      configuracao,
      anoSelecionado,
      mesSelecionado,
    ]);

  const gradienteGrafico =
    useMemo(() => {
      if (
        dados.totalGasto <= 0
      ) {
        return (
          "conic-gradient(#b8dfcf 0deg 360deg)"
        );
      }

      let inicio =
        0;

      const partes = [];

      dados.categoriasVisiveis
        .filter(
          (categoria) =>
            categoria.total > 0
        )
        .forEach(
          (categoria) => {
            const graus =
              (
                categoria.total /
                dados.totalGasto
              ) * 360;

            const fim =
              inicio + graus;

            partes.push(
              `${categoria.cor} ${inicio}deg ${fim}deg`
            );

            inicio =
              fim;
          }
        );

      if (
        partes.length === 0
      ) {
        return (
          "conic-gradient(#b8dfcf 0deg 360deg)"
        );
      }

      return `conic-gradient(${partes.join(
        ", "
      )})`;
    }, [
      dados,
    ]);

  function atualizarReferencia(
    categoriaId,
    valor
  ) {
    const numero =
      Number(valor || 0);

    const novaConfiguracao = {
      ...configuracao,

      [categoriaId]: {
        ...configuracao[
          categoriaId
        ],

        referencia:
          Number.isFinite(
            numero
          ) &&
          numero >= 0
            ? numero
            : 0,

        visivel:
          configuracao[
            categoriaId
          ]?.visivel !== false,
      },
    };

    setConfiguracao(
      novaConfiguracao
    );

    salvarObjeto(
      CHAVE_CONFIG,
      novaConfiguracao
    );
  }

  function alternarVisibilidade(
    categoriaId
  ) {
    const atual =
      configuracao[
        categoriaId
      ]?.visivel !== false;

    const novaConfiguracao = {
      ...configuracao,

      [categoriaId]: {
        ...configuracao[
          categoriaId
        ],

        referencia:
          Number(
            configuracao[
              categoriaId
            ]?.referencia ||
              0
          ),

        visivel:
          !atual,
      },
    };

    setConfiguracao(
      novaConfiguracao
    );

    salvarObjeto(
      CHAVE_CONFIG,
      novaConfiguracao
    );

    setMensagem(
      "Preferência atualizada."
    );
  }

  function limparReferencias() {
    const confirmou =
      window.confirm(
        "Deseja remover todas as referências de categorias?"
      );

    if (!confirmou) {
      return;
    }

    const novaConfiguracao =
      {};

    CATEGORIAS_PADRAO.forEach(
      (categoria) => {
        novaConfiguracao[
          categoria.id
        ] = {
          referencia: 0,

          visivel:
            configuracao[
              categoria.id
            ]?.visivel !== false,
        };
      }
    );

    setConfiguracao(
      novaConfiguracao
    );

    salvarObjeto(
      CHAVE_CONFIG,
      novaConfiguracao
    );

    setMensagem(
      "Referências removidas."
    );
  }

  function obterTextoDica() {
    if (
      dados.totalGasto === 0
    ) {
      return (
        "Assim que você registrar gastos, esta página mostrará automaticamente como eles estão distribuídos."
      );
    }

    if (
      dados.acimaReferencia
        .length > 0
    ) {
      return (
        `${dados.acimaReferencia.length} ${
          dados.acimaReferencia
            .length === 1
            ? "categoria ultrapassou"
            : "categorias ultrapassaram"
        } a referência opcional definida por você.`
      );
    }

    if (
      dados.maiorConcentracao
        ?.total > 0
    ) {
      return (
        `${dados.maiorConcentracao.nome} representa ${dados.maiorConcentracao.percentual.toFixed(
          0
        )}% dos gastos registrados neste período.`
      );
    }

    return (
      "Categorias ajudam a transformar registros isolados em uma visão mais clara dos seus hábitos."
    );
  }

  if (!carregado) {
    return (
      <div className="categorias-carregando">
        <span />

        <strong>
          Organizando suas
          categorias...
        </strong>
      </div>
    );
  }

  return (
    <div className="categorias-pagina">
      <section className="categorias-cabecalho">
        <div>
          <h1>
            Categorias
          </h1>

          <p>
            Compreenda seus hábitos
          </p>
        </div>

        <div className="categorias-periodo">
          <span>
            ◫
          </span>

          <select
            value={
              mesSelecionado
            }
            onChange={(
              evento
            ) =>
              setMesSelecionado(
                Number(
                  evento.target
                    .value
                )
              )
            }
          >
            <option value={1}>
              Janeiro
            </option>

            <option value={2}>
              Fevereiro
            </option>

            <option value={3}>
              Março
            </option>

            <option value={4}>
              Abril
            </option>

            <option value={5}>
              Maio
            </option>

            <option value={6}>
              Junho
            </option>

            <option value={7}>
              Julho
            </option>

            <option value={8}>
              Agosto
            </option>

            <option value={9}>
              Setembro
            </option>

            <option value={10}>
              Outubro
            </option>

            <option value={11}>
              Novembro
            </option>

            <option value={12}>
              Dezembro
            </option>
          </select>

          <input
            type="number"
            min="2020"
            max="2100"
            value={
              anoSelecionado
            }
            onChange={(
              evento
            ) =>
              setAnoSelecionado(
                Number(
                  evento.target
                    .value
                )
              )
            }
          />
        </div>
      </section>

      <section className="categorias-educacao">
        <span className="categorias-educacao-icone">
          ◴
        </span>

        <div>
          <strong>
            Entenda para evoluir
          </strong>

          <p>
            As categorias ajudam você
            a visualizar para onde os
            valores registrados estão
            indo. Use essas informações
            para apoiar escolhas com
            mais consciência.
          </p>
        </div>

        <div className="categorias-ilustracao">
          <span className="mini-pizza" />
          <span className="mini-barras">
            <i />
            <i />
            <i />
          </span>
        </div>
      </section>

      {mensagem && (
        <div className="categorias-mensagem">
          <span>
            ✓
          </span>

          <p>
            {mensagem}
          </p>

          <button
            type="button"
            onClick={() =>
              setMensagem("")
            }
          >
            ×
          </button>
        </div>
      )}

      <section className="categorias-top-grid">
        <article className="categorias-resumo-box">
          <h2>
            Resumo do mês
          </h2>

          <div className="categorias-resumo-grid">
            <div>
              <span className="categorias-resumo-icone verde">
                ▣
              </span>

              <div>
                <span>
                  Total gasto
                </span>

                <strong>
                  {formatarMoeda(
                    dados.totalGasto
                  )}
                </strong>
              </div>
            </div>

            <div>
              <span className="categorias-resumo-icone azul">
                ▦
              </span>

              <div>
                <span>
                  Categorias utilizadas
                </span>

                <strong>
                  {
                    dados
                      .categoriasUtilizadas
                      .length
                  }
                </strong>
              </div>
            </div>

            <div>
              <span className="categorias-resumo-icone roxo">
                ◎
              </span>

              <div>
                <span>
                  Maior concentração
                </span>

                <strong>
                  {dados
                    .maiorConcentracao
                    ?.total > 0
                    ? dados
                        .maiorConcentracao
                        .nome
                    : "Nenhuma"}
                </strong>
              </div>
            </div>

            <div>
              <span className="categorias-resumo-icone dourado">
                ↗
              </span>

              <div>
                <span>
                  Média por gasto
                </span>

                <strong>
                  {formatarMoeda(
                    dados.mediaPorGasto
                  )}
                </strong>
              </div>
            </div>
          </div>
        </article>

        <article className="categorias-grafico-box">
          <h2>
            Distribuição dos gastos
          </h2>

          <div className="categorias-grafico-conteudo">
            <div
              className="categorias-donut"
              style={{
                background:
                  gradienteGrafico,
              }}
            >
              <div className="categorias-donut-centro">
                <strong>
                  {formatarMoeda(
                    dados.totalGasto
                  )}
                </strong>

                <span>
                  Total
                </span>
              </div>
            </div>

            <div className="categorias-grafico-mensagem">
              <span>
                🌱
              </span>

              <div>
                <strong>
                  {dados.totalGasto >
                  0
                    ? "Distribuição atual"
                    : "Ainda não há gastos neste mês."}
                </strong>

                <p>
                  {dados.totalGasto >
                  0
                    ? "O gráfico é atualizado automaticamente conforme novos registros são adicionados."
                    : "Registre seus gastos para ver como suas categorias são distribuídas."}
                </p>
              </div>
            </div>
          </div>

          <div className="categorias-legenda">
            {dados.categoriasVisiveis
              .filter(
                (categoria) =>
                  categoria.total >
                    0 ||
                  [
                    "alimentacao",
                    "transporte",
                    "casa",
                    "saude",
                    "lazer",
                    "outros",
                  ].includes(
                    categoria.id
                  )
              )
              .slice(0, 6)
              .map(
                (categoria) => (
                  <div
                    key={
                      categoria.id
                    }
                  >
                    <i
                      style={{
                        background:
                          categoria.cor,
                      }}
                    />

                    <span>
                      {
                        categoria.nome
                      }{" "}
                      (
                      {categoria.percentual.toFixed(
                        0
                      )}
                      %)
                    </span>
                  </div>
                )
              )}
          </div>
        </article>
      </section>

      <section className="categorias-conteudo-grid">
        <article className="categorias-lista-box">
          <div className="categorias-lista-cabecalho">
            <div>
              <h2>
                Suas categorias
              </h2>

              <p>
                Cada categoria representa
                um propósito. Você define
                as referências.
              </p>
            </div>
          </div>

          <div className="categorias-tabela-cabecalho">
            <span>
              Categoria
            </span>

            <span>
              Total gasto
            </span>

            <span>
              Participação
            </span>

            <span>
              Nº de gastos
            </span>

            <span>
              Média por gasto
            </span>

            <span>
              Ações
            </span>
          </div>

          <div className="categorias-lista">
            {dados.categoriasVisiveis.map(
              (categoria) => (
                <div
                  key={
                    categoria.id
                  }
                  className={
                    categoria.acimaReferencia
                      ? "categoria-linha acima"
                      : "categoria-linha"
                  }
                >
                  <div className="categoria-identidade">
                    <span
                      className="categoria-icone"
                      style={{
                        background:
                          `${categoria.cor}18`,
                        color:
                          categoria.cor,
                      }}
                    >
                      {
                        categoria.icone
                      }
                    </span>

                    <strong>
                      {
                        categoria.nome
                      }
                    </strong>
                  </div>

                  <strong className="categoria-total">
                    {formatarMoeda(
                      categoria.total
                    )}
                  </strong>

                  <div className="categoria-participacao">
                    <span>
                      {categoria.percentual.toFixed(
                        0
                      )}
                      %
                    </span>

                    <div>
                      <i
                        style={{
                          width: `${Math.min(
                            100,
                            categoria.percentual
                          )}%`,
                          background:
                            categoria.cor,
                        }}
                      />
                    </div>
                  </div>

                  <strong className="categoria-quantidade">
                    {
                      categoria.quantidade
                    }
                  </strong>

                  <strong className="categoria-media">
                    {formatarMoeda(
                      categoria.media
                    )}
                  </strong>

                  <div className="categoria-acoes">
                    <button
                      type="button"
                      title="Definir referência"
                      onClick={() =>
                        setGerenciadorAberto(
                          true
                        )
                      }
                    >
                      ▥
                    </button>

                    <button
                      type="button"
                      title="Gerenciar categoria"
                      onClick={() =>
                        setGerenciadorAberto(
                          true
                        )
                      }
                    >
                      ›
                    </button>
                  </div>
                </div>
              )
            )}
          </div>

          <button
            type="button"
            className="categorias-gerenciar"
            onClick={() =>
              setGerenciadorAberto(
                true
              )
            }
          >
            <span>
              +
            </span>

            Gerenciar categorias
          </button>
        </article>

        <aside className="categorias-coluna-lateral">
          <article className="categorias-mini-card">
            <div>
              <span className="categorias-mini-icone verde">
                ▣
              </span>

              <div>
                <strong>
                  Referências criadas
                </strong>

                <span>
                  {
                    dados
                      .referenciasCriadas
                      .length
                  }
                </span>

                <p>
                  Categorias com
                  referência opcional
                </p>
              </div>
            </div>
          </article>

          <article className="categorias-mini-card">
            <div>
              <span className="categorias-mini-icone laranja">
                ↗
              </span>

              <div>
                <strong>
                  Acima da referência
                </strong>

                <span>
                  {
                    dados
                      .acimaReferencia
                      .length
                  }
                </span>

                <p>
                  Categorias que
                  ultrapassaram sua
                  referência
                </p>
              </div>
            </div>
          </article>

          <article className="categorias-mini-card dica">
            <div>
              <span className="categorias-mini-icone verde">
                ☼
              </span>

              <div>
                <strong>
                  Dica ConquistIA
                </strong>

                <p>
                  {obterTextoDica()}
                </p>
              </div>
            </div>
          </article>

          <article className="categorias-mini-card personalizar">
            <div>
              <span className="categorias-mini-icone verde">
                ☷
              </span>

              <div>
                <strong>
                  Personalize sua visão
                </strong>

                <p>
                  Escolha quais
                  categorias aparecem
                  e defina referências
                  opcionais.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setGerenciadorAberto(
                  true
                )
              }
            >
              Personalizar categorias
            </button>
          </article>
        </aside>
      </section>

      {gerenciadorAberto && (
        <div
          className="categorias-modal-overlay"
          onMouseDown={() =>
            setGerenciadorAberto(
              false
            )
          }
        >
          <section
            className="categorias-modal"
            onMouseDown={(
              evento
            ) =>
              evento.stopPropagation()
            }
          >
            <div className="categorias-modal-topo">
              <div>
                <span>
                  Personalização
                </span>

                <h2>
                  Gerenciar categorias
                </h2>

                <p>
                  As referências são
                  opcionais e servem
                  apenas para comparação
                  com seus próprios
                  registros.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setGerenciadorAberto(
                    false
                  )
                }
              >
                ×
              </button>
            </div>

            <div className="categorias-modal-lista">
              {dados.categorias.map(
                (categoria) => (
                  <div
                    key={
                      categoria.id
                    }
                    className="categoria-config-item"
                  >
                    <span
                      className="categoria-config-icone"
                      style={{
                        background:
                          `${categoria.cor}18`,
                        color:
                          categoria.cor,
                      }}
                    >
                      {
                        categoria.icone
                      }
                    </span>

                    <div className="categoria-config-nome">
                      <strong>
                        {
                          categoria.nome
                        }
                      </strong>

                      <span>
                        Gasto atual:{" "}
                        {formatarMoeda(
                          categoria.total
                        )}
                      </span>
                    </div>

                    <div className="categoria-config-referencia">
                      <label
                        htmlFor={`referencia-${categoria.id}`}
                      >
                        Referência opcional
                      </label>

                      <div>
                        <span>
                          R$
                        </span>

                        <input
                          id={`referencia-${categoria.id}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            categoria.referencia ||
                            ""
                          }
                          placeholder="0,00"
                          onChange={(
                            evento
                          ) =>
                            atualizarReferencia(
                              categoria.id,
                              evento
                                .target
                                .value
                            )
                          }
                        />
                      </div>
                    </div>

                    <label className="categoria-config-visivel">
                      <input
                        type="checkbox"
                        checked={
                          categoria.visivel
                        }
                        onChange={() =>
                          alternarVisibilidade(
                            categoria.id
                          )
                        }
                      />

                      <span>
                        Exibir
                      </span>
                    </label>
                  </div>
                )
              )}
            </div>

            <div className="categorias-modal-rodape">
              <button
                type="button"
                className="categorias-limpar"
                onClick={
                  limparReferencias
                }
              >
                Limpar referências
              </button>

              <button
                type="button"
                className="categorias-concluir"
                onClick={() => {
                  setGerenciadorAberto(
                    false
                  );

                  setMensagem(
                    "Categorias atualizadas."
                  );
                }}
              >
                Concluir
              </button>
            </div>
          </section>
        </div>
      )}

      <section className="categorias-rodape">
        <span>
          ✓
        </span>

        <p>
          O ConquistIA não define
          quanto você deve gastar.
          Referências são opcionais e
          definidas exclusivamente por
          você.
        </p>

        <Link href="/registrar-gasto">
          + Registrar gasto
        </Link>
      </section>
    </div>
  );
}