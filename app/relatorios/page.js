"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

const CHAVE_GASTOS =
  "conquistia-gastos-v1";

const CHAVE_RENDA =
  "conquistia-renda-mensal-v1";

const CHAVE_POUPANCA =
  "conquistia-poupanca-v1";

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

    return resultado &&
      typeof resultado === "object" &&
      !Array.isArray(resultado)
      ? resultado
      : {};
  } catch (erro) {
    console.error(
      `Erro ao carregar ${chave}:`,
      erro
    );

    return {};
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

export default function RelatoriosPage() {
  const hoje =
    new Date();

  const [
    gastos,
    setGastos,
  ] = useState([]);

  const [
    rendas,
    setRendas,
  ] = useState({});

  const [
    poupancas,
    setPoupancas,
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

  useEffect(() => {
    setGastos(
      carregarLista(
        CHAVE_GASTOS
      )
    );

    setRendas(
      carregarObjeto(
        CHAVE_RENDA
      )
    );

    setPoupancas(
      carregarObjeto(
        CHAVE_POUPANCA
      )
    );

    setCarregado(true);
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

      const chave =
        criarChaveMes(
          anoSelecionado,
          mesSelecionado
        );

      const renda =
        Number(
          rendas[chave] || 0
        );

      const listaPoupanca =
        Array.isArray(
          poupancas[chave]
        )
          ? poupancas[chave]
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

      const disponivel =
        renda -
        totalGastos -
        totalPoupanca;

      const categoriasObjeto =
        gastosMes.reduce(
          (
            acumulador,
            gasto
          ) => {
            const categoria =
              gasto.categoria ||
              "Outros";

            acumulador[
              categoria
            ] =
              (acumulador[
                categoria
              ] || 0) +
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
                  ? (valor /
                      totalGastos) *
                    100
                  : 0,
            })
          )
          .sort(
            (
              primeiro,
              segundo
            ) =>
              segundo.valor -
              primeiro.valor
          );

      const diasObjeto =
        gastosMes.reduce(
          (
            acumulador,
            gasto
          ) => {
            const dia =
              Number(
                gasto.data
                  ?.split("-")[2]
              );

            if (!dia) {
              return acumulador;
            }

            acumulador[dia] =
              (acumulador[dia] || 0) +
              Number(
                gasto.valor || 0
              );

            return acumulador;
          },
          {}
        );

      const dias =
        Object.entries(
          diasObjeto
        )
          .map(
            ([
              dia,
              valor,
            ]) => ({
              dia:
                Number(dia),
              valor,
            })
          )
          .sort(
            (
              primeiro,
              segundo
            ) =>
              primeiro.dia -
              segundo.dia
          );

      const maiorDia =
        [...dias].sort(
          (
            primeiro,
            segundo
          ) =>
            segundo.valor -
            primeiro.valor
        )[0] || null;

      const mediaRegistro =
        gastosMes.length > 0
          ? totalGastos /
            gastosMes.length
          : 0;

      const maiorCategoria =
        categorias[0] || null;

      const percentualRendaUsado =
        renda > 0
          ? (totalGastos /
              renda) *
            100
          : 0;

      return {
        gastosMes,
        totalGastos,
        renda,
        totalPoupanca,
        disponivel,
        categorias,
        dias,
        maiorDia,
        mediaRegistro,
        maiorCategoria,
        percentualRendaUsado,
      };
    }, [
      gastos,
      rendas,
      poupancas,
      anoSelecionado,
      mesSelecionado,
    ]);

  const maiorValorDia =
    Math.max(
      ...dados.dias.map(
        (item) =>
          item.valor
      ),
      1
    );

  function obterDiagnostico() {
    if (
      dados.gastosMes.length ===
      0
    ) {
      return (
        "Ainda não existem registros suficientes neste período. Continue alimentando seu diário para que os relatórios fiquem mais completos."
      );
    }

    if (
      dados.renda > 0 &&
      dados.disponivel < 0
    ) {
      return (
        `Os registros do período ficaram ${formatarMoeda(
          Math.abs(
            dados.disponivel
          )
        )} acima da renda informada. Isso é um sinal para revisar os lançamentos e compreender o que aconteceu no mês.`
      );
    }

    if (
      dados.maiorCategoria
    ) {
      return (
        `${dados.maiorCategoria.nome} é a categoria com maior concentração neste período, representando ${dados.maiorCategoria.percentual.toFixed(
          1
        )}% dos gastos registrados.`
      );
    }

    return (
      "Continue registrando suas escolhas para formar uma visão mais completa dos seus hábitos."
    );
  }

  if (!carregado) {
    return (
      <div className="relatorio-carregando">
        <span />

        <strong>
          Preparando seus relatórios...
        </strong>
      </div>
    );
  }

  return (
    <div className="relatorio-pagina">
      <section className="relatorio-apresentacao">
        <div>
          <span>
            Inteligência sobre seus registros
          </span>

          <h1>
            Entenda sua evolução
          </h1>

          <p>
            Os relatórios transformam os
            lançamentos do diário em uma
            visão simples dos seus hábitos.
          </p>
        </div>

        <div className="relatorio-filtros">
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

      <section className="relatorio-resumo-grid">
        <article className="relatorio-resumo-card">
          <span className="relatorio-resumo-icone verde">
            −
          </span>

          <div>
            <span>
              Gastos registrados
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
              lançamentos
            </small>
          </div>
        </article>

        <article className="relatorio-resumo-card">
          <span className="relatorio-resumo-icone azul">
            +
          </span>

          <div>
            <span>
              Renda líquida
            </span>

            <strong>
              {dados.renda > 0
                ? formatarMoeda(
                    dados.renda
                  )
                : "Não informada"}
            </strong>

            <small>
              Referência mensal
            </small>
          </div>
        </article>

        <article className="relatorio-resumo-card">
          <span className="relatorio-resumo-icone dourado">
            ☆
          </span>

          <div>
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
            dados.renda > 0 &&
            dados.disponivel < 0
              ? "relatorio-resumo-card negativo"
              : "relatorio-resumo-card"
          }
        >
          <span className="relatorio-resumo-icone coral">
            =
          </span>

          <div>
            <span>
              Disponível
            </span>

            <strong>
              {dados.renda > 0
                ? formatarMoeda(
                    dados.disponivel
                  )
                : "—"}
            </strong>

            <small>
              Depois dos registros
            </small>
          </div>
        </article>
      </section>

      {dados.gastosMes.length ===
      0 ? (
        <section className="relatorio-vazio">
          <span>
            📊
          </span>

          <h2>
            Nenhum gasto encontrado
          </h2>

          <p>
            Não existem registros para{" "}
            {obterNomeMes(
              anoSelecionado,
              mesSelecionado
            )}.
          </p>

          <Link
            href="/registrar-gasto"
          >
            Registrar gasto
          </Link>
        </section>
      ) : (
        <>
          <section className="relatorio-grade">
            <article className="relatorio-bloco grafico-dias">
              <div className="relatorio-bloco-topo">
                <div>
                  <span>
                    Evolução diária
                  </span>

                  <h2>
                    Gastos ao longo do mês
                  </h2>

                  <p>
                    Veja em quais dias houve
                    maior movimentação.
                  </p>
                </div>
              </div>

              <div className="grafico-barras">
                {dados.dias.map(
                  (item) => {
                    const altura =
                      Math.max(
                        8,
                        (item.valor /
                          maiorValorDia) *
                          100
                      );

                    return (
                      <div
                        key={
                          item.dia
                        }
                        className="grafico-dia"
                      >
                        <div className="grafico-coluna-area">
                          <span
                            className="grafico-coluna-relatorio"
                            style={{
                              height: `${altura}%`,
                            }}
                            title={`Dia ${item.dia}: ${formatarMoeda(
                              item.valor
                            )}`}
                          />
                        </div>

                        <strong>
                          {item.dia}
                        </strong>
                      </div>
                    );
                  }
                )}
              </div>
            </article>

            <article className="relatorio-bloco diagnostico-relatorio">
              <span className="diagnostico-icone">
                ✦
              </span>

              <span className="diagnostico-legenda">
                Leitura do período
              </span>

              <h2>
                O que os registros mostram?
              </h2>

              <p>
                {obterDiagnostico()}
              </p>

              <div className="diagnostico-dados">
                <div>
                  <span>
                    Média por registro
                  </span>

                  <strong>
                    {formatarMoeda(
                      dados.mediaRegistro
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Maior dia
                  </span>

                  <strong>
                    {dados.maiorDia
                      ? `Dia ${dados.maiorDia.dia}`
                      : "—"}
                  </strong>
                </div>

                <div>
                  <span>
                    Uso da renda
                  </span>

                  <strong>
                    {dados.renda > 0
                      ? `${dados.percentualRendaUsado.toFixed(
                          1
                        )}%`
                      : "—"}
                  </strong>
                </div>
              </div>
            </article>
          </section>

          <section className="relatorio-grade">
            <article className="relatorio-bloco">
              <div className="relatorio-bloco-topo">
                <div>
                  <span>
                    Distribuição
                  </span>

                  <h2>
                    Gastos por categoria
                  </h2>

                  <p>
                    Veja quais categorias
                    concentram mais registros.
                  </p>
                </div>

                <Link
                  href="/categorias"
                >
                  Ver detalhes
                </Link>
              </div>

              <div className="relatorio-categorias">
                {dados.categorias.map(
                  (
                    categoria
                  ) => (
                    <div
                      key={
                        categoria.nome
                      }
                      className="relatorio-categoria-item"
                    >
                      <span className="relatorio-categoria-icone">
                        {obterIconeCategoria(
                          categoria.nome
                        )}
                      </span>

                      <div className="relatorio-categoria-conteudo">
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

                        <div className="relatorio-categoria-barra">
                          <span
                            style={{
                              width: `${Math.min(
                                categoria.percentual,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      <strong className="relatorio-percentual">
                        {categoria.percentual.toFixed(
                          1
                        )}
                        %
                      </strong>
                    </div>
                  )
                )}
              </div>
            </article>

            <article className="relatorio-bloco resumo-periodo">
              <div className="relatorio-bloco-topo">
                <div>
                  <span>
                    Resumo inteligente
                  </span>

                  <h2>
                    Seu mês em poucas linhas
                  </h2>
                </div>
              </div>

              <div className="resumo-periodo-lista">
                <div>
                  <span>
                    ✓
                  </span>

                  <p>
                    Você registrou{" "}
                    <strong>
                      {
                        dados.gastosMes
                          .length
                      }{" "}
                      gastos
                    </strong>{" "}
                    neste período.
                  </p>
                </div>

                <div>
                  <span>
                    ◉
                  </span>

                  <p>
                    Foram utilizadas{" "}
                    <strong>
                      {
                        dados.categorias
                          .length
                      }{" "}
                      categorias
                    </strong>
                    .
                  </p>
                </div>

                <div>
                  <span>
                    ▥
                  </span>

                  <p>
                    O total registrado foi{" "}
                    <strong>
                      {formatarMoeda(
                        dados.totalGastos
                      )}
                    </strong>
                    .
                  </p>
                </div>

                {dados.maiorCategoria && (
                  <div>
                    <span>
                      ✦
                    </span>

                    <p>
                      A maior concentração
                      está em{" "}
                      <strong>
                        {
                          dados
                            .maiorCategoria
                            .nome
                        }
                      </strong>
                      .
                    </p>
                  </div>
                )}
              </div>

              <div className="relatorio-reflexao">
                <span>
                  🌱
                </span>

                <p>
                  O objetivo não é julgar
                  seus gastos, mas ajudar
                  você a enxergar padrões
                  e decidir o que deseja
                  manter ou reorganizar.
                </p>
              </div>
            </article>
          </section>
        </>
      )}
    </div>
  );
}