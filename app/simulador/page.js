"use client";

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

function carregarLista(chave) {
  if (typeof window === "undefined") {
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
  if (typeof window === "undefined") {
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

export default function SimuladorPage() {
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
    carregado,
    setCarregado,
  ] = useState(false);

  const [
    valorCompra,
    setValorCompra,
  ] = useState("");

  const [
    reducaoMensal,
    setReducaoMensal,
  ] = useState("");

  const [
    periodoReducao,
    setPeriodoReducao,
  ] = useState(12);

  useEffect(() => {
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

    setCarregado(true);
  }, []);

  const dados =
    useMemo(() => {
      const hoje =
        new Date();

      const ano =
        hoje.getFullYear();

      const mes =
        hoje.getMonth() + 1;

      const chave =
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

      const rendaAntiga =
        Number(
          rendasAntigas[
            chave
          ] || 0
        );

      const totalReceitas =
        totalReceitasNovas > 0
          ? totalReceitasNovas
          : rendaAntiga;

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
        totalPoupanca;

      const livreProjetado =
        disponivelAgora -
        totalContasPendentes;

      const ultimoDiaMes =
        new Date(
          ano,
          mes,
          0
        ).getDate();

      const diasRestantes =
        Math.max(
          1,
          ultimoDiaMes -
            hoje.getDate() +
            1
        );

      const ritmoDiario =
        livreProjetado > 0
          ? livreProjetado /
            diasRestantes
          : 0;

      const ritmoSemanal =
        ritmoDiario * 7;

      return {
        totalReceitas,
        totalGastos,
        totalPoupanca,
        totalContasPendentes,
        disponivelAgora,
        livreProjetado,
        diasRestantes,
        ritmoDiario,
        ritmoSemanal,
      };
    }, [
      gastos,
      receitas,
      rendasAntigas,
      poupancas,
      contas,
    ]);

  const simulacaoCompra =
    useMemo(() => {
      const valor =
        Number(
          valorCompra || 0
        );

      if (
        !Number.isFinite(valor) ||
        valor <= 0
      ) {
        return null;
      }

      const novoLivre =
        dados.livreProjetado -
        valor;

      const novoRitmoDiario =
        novoLivre > 0
          ? novoLivre /
            dados.diasRestantes
          : 0;

      const novoRitmoSemanal =
        novoRitmoDiario * 7;

      return {
        valor,
        novoLivre,
        novoRitmoDiario,
        novoRitmoSemanal,
      };
    }, [
      valorCompra,
      dados,
    ]);

  const simulacaoReducao =
    useMemo(() => {
      const valor =
        Number(
          reducaoMensal || 0
        );

      const meses =
        Number(
          periodoReducao || 0
        );

      if (
        !Number.isFinite(valor) ||
        valor <= 0 ||
        meses <= 0
      ) {
        return null;
      }

      return {
        valor,
        meses,
        total:
          valor * meses,
      };
    }, [
      reducaoMensal,
      periodoReducao,
    ]);

  if (!carregado) {
    return (
      <div className="simulador-carregando">
        <span />

        <strong>
          Preparando simulações...
        </strong>
      </div>
    );
  }

  return (
    <div className="simulador-pagina">
      <section className="simulador-cabecalho">
        <div>
          <span>
            Cenários hipotéticos
          </span>

          <h1>
            E se...?
          </h1>

          <p>
            Teste possibilidades sem
            alterar nenhum registro do
            seu ConquistIA.
          </p>
        </div>

        <div className="simulador-selo">
          <span>
            ✓
          </span>

          <div>
            <strong>
              Simulação segura
            </strong>

            <small>
              Nenhum dado real é
              modificado
            </small>
          </div>
        </div>
      </section>

      <section className="simulador-resumo">
        <article>
          <span>
            Livre projetado atual
          </span>

          <strong>
            {dados.totalReceitas > 0
              ? formatarMoeda(
                  dados.livreProjetado
                )
              : "—"}
          </strong>

          <small>
            após contas pendentes
          </small>
        </article>

        <article>
          <span>
            Ritmo diário atual
          </span>

          <strong>
            {dados.livreProjetado > 0
              ? formatarMoeda(
                  dados.ritmoDiario
                )
              : "—"}
          </strong>

          <small>
            referência aproximada
          </small>
        </article>

        <article>
          <span>
            Ritmo semanal atual
          </span>

          <strong>
            {dados.livreProjetado > 0
              ? formatarMoeda(
                  dados.ritmoSemanal
                )
              : "—"}
          </strong>

          <small>
            equivalente a 7 dias
          </small>
        </article>
      </section>

      <section className="simulador-grid">
        <article className="simulador-card">
          <div className="simulador-card-topo">
            <span className="simulador-icone">
              🛍️
            </span>

            <div>
              <span>
                Cenário 1
              </span>

              <h2>
                E se eu fizer uma
                compra agora?
              </h2>

              <p>
                Veja como um gasto
                hipotético mudaria o
                livre projetado.
              </p>
            </div>
          </div>

          <label
            htmlFor="valorCompra"
          >
            Valor da compra
          </label>

          <div className="simulador-input-moeda">
            <span>
              R$
            </span>

            <input
              id="valorCompra"
              type="number"
              min="0"
              step="0.01"
              value={valorCompra}
              onChange={(
                evento
              ) =>
                setValorCompra(
                  evento.target
                    .value
                )
              }
              placeholder="0,00"
            />
          </div>

          {simulacaoCompra ? (
            <div className="simulador-resultado">
              <div>
                <span>
                  Hoje
                </span>

                <strong>
                  {formatarMoeda(
                    dados.livreProjetado
                  )}
                </strong>
              </div>

              <span className="simulador-seta">
                →
              </span>

              <div>
                <span>
                  Após simulação
                </span>

                <strong
                  className={
                    simulacaoCompra.novoLivre <
                    0
                      ? "negativo"
                      : ""
                  }
                >
                  {formatarMoeda(
                    simulacaoCompra.novoLivre
                  )}
                </strong>
              </div>
            </div>
          ) : (
            <div className="simulador-resultado-vazio">
              Digite um valor para
              visualizar o cenário.
            </div>
          )}

          {simulacaoCompra && (
            <div className="simulador-impacto">
              <div>
                <span>
                  Novo ritmo diário
                </span>

                <strong>
                  {simulacaoCompra.novoLivre >
                  0
                    ? formatarMoeda(
                        simulacaoCompra.novoRitmoDiario
                      )
                    : "—"}
                </strong>
              </div>

              <div>
                <span>
                  Novo ritmo semanal
                </span>

                <strong>
                  {simulacaoCompra.novoLivre >
                  0
                    ? formatarMoeda(
                        simulacaoCompra.novoRitmoSemanal
                      )
                    : "—"}
                </strong>
              </div>
            </div>
          )}

          {simulacaoCompra &&
            simulacaoCompra.novoLivre <
              0 && (
              <div className="simulador-alerta">
                <span>
                  !
                </span>

                <p>
                  Neste cenário, a
                  compra ultrapassaria
                  o valor livre
                  projetado atual em{" "}
                  <strong>
                    {formatarMoeda(
                      Math.abs(
                        simulacaoCompra.novoLivre
                      )
                    )}
                  </strong>
                  .
                </p>
              </div>
            )}
        </article>

        <article className="simulador-card">
          <div className="simulador-card-topo">
            <span className="simulador-icone">
              ✂️
            </span>

            <div>
              <span>
                Cenário 2
              </span>

              <h2>
                E se eu reduzir um
                gasto mensal?
              </h2>

              <p>
                Veja quanto essa
                diferença representaria
                ao longo do tempo.
              </p>
            </div>
          </div>

          <label
            htmlFor="reducaoMensal"
          >
            Valor mensal hipotético
          </label>

          <div className="simulador-input-moeda">
            <span>
              R$
            </span>

            <input
              id="reducaoMensal"
              type="number"
              min="0"
              step="0.01"
              value={reducaoMensal}
              onChange={(
                evento
              ) =>
                setReducaoMensal(
                  evento.target
                    .value
                )
              }
              placeholder="0,00"
            />
          </div>

          <label
            htmlFor="periodoReducao"
            className="simulador-label-secundario"
          >
            Período
          </label>

          <select
            id="periodoReducao"
            value={periodoReducao}
            onChange={(
              evento
            ) =>
              setPeriodoReducao(
                Number(
                  evento.target
                    .value
                )
              )
            }
          >
            <option value={3}>
              3 meses
            </option>

            <option value={6}>
              6 meses
            </option>

            <option value={12}>
              12 meses
            </option>
          </select>

          {simulacaoReducao ? (
            <div className="simulador-reducao-resultado">
              <span>
                Diferença acumulada
              </span>

              <strong>
                {formatarMoeda(
                  simulacaoReducao.total
                )}
              </strong>

              <p>
                Se uma diferença de{" "}
                <strong>
                  {formatarMoeda(
                    simulacaoReducao.valor
                  )}
                </strong>{" "}
                se repetisse durante{" "}
                {
                  simulacaoReducao.meses
                }{" "}
                meses.
              </p>
            </div>
          ) : (
            <div className="simulador-resultado-vazio">
              Informe um valor para
              testar o cenário.
            </div>
          )}

          <div className="simulador-nota">
            <span>
              🌱
            </span>

            <p>
              A simulação não diz que
              você deve reduzir um
              gasto. Ela apenas mostra
              o efeito matemático de
              uma hipótese.
            </p>
          </div>
        </article>
      </section>

      <section className="simulador-explicacao">
        <span>
          💡
        </span>

        <div>
          <strong>
            Nenhum cenário é salvo
            como gasto real.
          </strong>

          <p>
            Você pode testar quantos
            valores quiser. Receitas,
            diário, contas, metas e
            relatórios permanecem
            inalterados.
          </p>
        </div>
      </section>
    </div>
  );
}