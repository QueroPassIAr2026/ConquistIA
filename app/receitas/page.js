"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

const CHAVE_RECEITAS =
  "conquistia-receitas-v1";

function gerarId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID ===
      "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
}

function formatarMoeda(valor) {
  return Number(
    valor || 0
  ).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarData(data) {
  if (!data) {
    return "";
  }

  const partes =
    data.split("-");

  if (partes.length !== 3) {
    return data;
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function obterDataHoje() {
  const hoje =
    new Date();

  const ano =
    hoje.getFullYear();

  const mes =
    String(
      hoje.getMonth() + 1
    ).padStart(2, "0");

  const dia =
    String(
      hoje.getDate()
    ).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
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

function carregarReceitas() {
  if (
    typeof window === "undefined"
  ) {
    return [];
  }

  try {
    const dados =
      window.localStorage.getItem(
        CHAVE_RECEITAS
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
      "Erro ao carregar receitas:",
      erro
    );

    return [];
  }
}

function salvarReceitas(
  receitas
) {
  try {
    window.localStorage.setItem(
      CHAVE_RECEITAS,
      JSON.stringify(receitas)
    );

    return true;
  } catch (erro) {
    console.error(
      "Erro ao salvar receitas:",
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

export default function ReceitasPage() {
  const hoje =
    new Date();

  const [
    receitas,
    setReceitas,
  ] = useState([]);

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
    descricao,
    setDescricao,
  ] = useState("");

  const [
    valor,
    setValor,
  ] = useState("");

  const [
    data,
    setData,
  ] = useState(
    obterDataHoje()
  );

  const [
    formularioAberto,
    setFormularioAberto,
  ] = useState(false);

  const [
    receitaEditando,
    setReceitaEditando,
  ] = useState(null);

  const [
    mensagem,
    setMensagem,
  ] = useState("");

  const [
    erro,
    setErro,
  ] = useState("");

  useEffect(() => {
    setReceitas(
      carregarReceitas()
    );

    setCarregado(true);
  }, []);

  const dados =
    useMemo(() => {
      const receitasMes =
        receitas
          .filter(
            (receita) =>
              pertenceAoMes(
                receita.data,
                anoSelecionado,
                mesSelecionado
              )
          )
          .sort(
            (
              primeiro,
              segundo
            ) =>
              String(
                segundo.data || ""
              ).localeCompare(
                String(
                  primeiro.data || ""
                )
              )
          );

      const total =
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

      const maiorReceita =
        [...receitasMes].sort(
          (
            primeiro,
            segundo
          ) =>
            Number(
              segundo.valor || 0
            ) -
            Number(
              primeiro.valor || 0
            )
        )[0] || null;

      const diasComReceita =
        new Set(
          receitasMes.map(
            (receita) =>
              receita.data
          )
        ).size;

      const media =
        receitasMes.length > 0
          ? total /
            receitasMes.length
          : 0;

      return {
        receitasMes,
        total,
        maiorReceita,
        diasComReceita,
        media,
      };
    }, [
      receitas,
      anoSelecionado,
      mesSelecionado,
    ]);

  function limparMensagens() {
    setErro("");
    setMensagem("");
  }

  function limparFormulario() {
    setDescricao("");
    setValor("");
    setData(
      obterDataHoje()
    );
    setReceitaEditando(null);
  }

  function abrirNovaReceita() {
    limparFormulario();
    limparMensagens();

    setFormularioAberto(
      true
    );
  }

  function fecharFormulario() {
    limparFormulario();
    limparMensagens();

    setFormularioAberto(
      false
    );
  }

  function salvarReceita(
    evento
  ) {
    evento.preventDefault();

    limparMensagens();

    const descricaoLimpa =
      descricao.trim();

    const valorNumerico =
      Number(
        String(valor).replace(
          ",",
          "."
        )
      );

    if (!descricaoLimpa) {
      setErro(
        "Informe uma descrição para a receita."
      );

      return;
    }

    if (
      !Number.isFinite(
        valorNumerico
      ) ||
      valorNumerico <= 0
    ) {
      setErro(
        "Informe um valor maior que zero."
      );

      return;
    }

    if (!data) {
      setErro(
        "Informe a data do recebimento."
      );

      return;
    }

    const agora =
      new Date().toISOString();

    let novasReceitas;

    if (receitaEditando) {
      novasReceitas =
        receitas.map(
          (receita) =>
            receita.id ===
            receitaEditando.id
              ? {
                  ...receita,

                  descricao:
                    descricaoLimpa,

                  valor:
                    valorNumerico,

                  data,

                  atualizadoEm:
                    agora,
                }
              : receita
        );
    } else {
      novasReceitas = [
        {
          id: gerarId(),

          descricao:
            descricaoLimpa,

          valor:
            valorNumerico,

          data,

          criadoEm:
            agora,
        },

        ...receitas,
      ];
    }

    if (
      !salvarReceitas(
        novasReceitas
      )
    ) {
      setErro(
        "Não foi possível salvar a receita neste navegador."
      );

      return;
    }

    setReceitas(
      novasReceitas
    );

    setMensagem(
      receitaEditando
        ? "Receita atualizada com sucesso."
        : "Receita registrada com sucesso."
    );

    limparFormulario();

    setFormularioAberto(
      false
    );
  }

  function editarReceita(
    receita
  ) {
    setReceitaEditando(
      receita
    );

    setDescricao(
      receita.descricao || ""
    );

    setValor(
      String(
        receita.valor || ""
      )
    );

    setData(
      receita.data ||
        obterDataHoje()
    );

    setFormularioAberto(
      true
    );

    limparMensagens();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function excluirReceita(
    id
  ) {
    const confirmar =
      window.confirm(
        "Deseja excluir este registro de receita?"
      );

    if (!confirmar) {
      return;
    }

    const novasReceitas =
      receitas.filter(
        (receita) =>
          receita.id !== id
      );

    if (
      !salvarReceitas(
        novasReceitas
      )
    ) {
      setErro(
        "Não foi possível excluir a receita."
      );

      return;
    }

    setReceitas(
      novasReceitas
    );

    setMensagem(
      "Receita excluída."
    );

    setErro("");
  }

  if (!carregado) {
    return (
      <div className="receitas-carregando">
        <span />

        <strong>
          Preparando suas receitas...
        </strong>
      </div>
    );
  }

  return (
    <div className="receitas-pagina">
      <section className="receitas-apresentacao">
        <div>
          <span>
            Entradas do mês
          </span>

          <h1>
            Quanto entrou?
          </h1>

          <p>
            Registre apenas os valores
            que deseja acompanhar.
            Nenhuma informação bancária
            é necessária.
          </p>
        </div>

        <button
          type="button"
          className="receitas-nova"
          onClick={
            abrirNovaReceita
          }
        >
          <span>+</span>

          Registrar receita
        </button>
      </section>

      <section className="receitas-privacidade">
        <span>✓</span>

        <p>
          Informe apenas descrição,
          valor e data. Não é necessário
          cadastrar banco, conta,
          empregador, documento ou
          qualquer credencial financeira.
        </p>
      </section>

      {erro && (
        <div className="receitas-mensagem erro">
          <span>!</span>
          <p>{erro}</p>
        </div>
      )}

      {mensagem && (
        <div className="receitas-mensagem sucesso">
          <span>✓</span>
          <p>{mensagem}</p>
        </div>
      )}

      {formularioAberto && (
        <section className="receita-formulario-box">
          <div className="receita-formulario-topo">
            <div>
              <span>
                {receitaEditando
                  ? "Alterar entrada"
                  : "Nova entrada"}
              </span>

              <h2>
                {receitaEditando
                  ? "Editar receita"
                  : "Registrar receita"}
              </h2>

              <p>
                Use uma descrição
                simples, como salário,
                renda extra ou outro
                recebimento.
              </p>
            </div>

            <button
              type="button"
              onClick={
                fecharFormulario
              }
              className="receita-fechar"
              aria-label="Fechar formulário"
            >
              ×
            </button>
          </div>

          <form
            className="receita-formulario"
            onSubmit={
              salvarReceita
            }
          >
            <div className="receita-campo descricao">
              <label
                htmlFor="descricaoReceita"
              >
                Descrição
              </label>

              <input
                id="descricaoReceita"
                type="text"
                value={
                  descricao
                }
                onChange={(
                  evento
                ) =>
                  setDescricao(
                    evento.target
                      .value
                  )
                }
                placeholder="Ex.: salário líquido"
                maxLength={70}
                autoFocus
              />
            </div>

            <div className="receita-campo">
              <label
                htmlFor="valorReceita"
              >
                Valor recebido
              </label>

              <div className="receita-campo-moeda">
                <span>
                  R$
                </span>

                <input
                  id="valorReceita"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={
                    valor
                  }
                  onChange={(
                    evento
                  ) =>
                    setValor(
                      evento.target
                        .value
                    )
                  }
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="receita-campo">
              <label
                htmlFor="dataReceita"
              >
                Data do recebimento
              </label>

              <input
                id="dataReceita"
                type="date"
                value={data}
                onChange={(
                  evento
                ) =>
                  setData(
                    evento.target
                      .value
                  )
                }
              />
            </div>

            <div className="receita-formulario-acoes">
              <button
                type="button"
                className="receita-cancelar"
                onClick={
                  fecharFormulario
                }
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="receita-salvar"
              >
                {receitaEditando
                  ? "Salvar alterações"
                  : "Registrar receita"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="receitas-periodo">
        <div>
          <span>
            Período analisado
          </span>

          <strong>
            {obterNomeMes(
              anoSelecionado,
              mesSelecionado
            )}
          </strong>
        </div>

        <div className="receitas-filtros">
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

      <section className="receitas-resumo-grid">
        <article className="receita-resumo-card principal">
          <span className="receita-resumo-icone">
            +
          </span>

          <div>
            <span>
              Total recebido
            </span>

            <strong>
              {formatarMoeda(
                dados.total
              )}
            </strong>

            <small>
              {
                dados.receitasMes
                  .length
              }{" "}
              {dados.receitasMes
                .length === 1
                ? "entrada"
                : "entradas"}
            </small>
          </div>
        </article>

        <article className="receita-resumo-card">
          <span className="receita-resumo-icone azul">
            ▣
          </span>

          <div>
            <span>
              Dias com entradas
            </span>

            <strong>
              {
                dados.diasComReceita
              }
            </strong>

            <small>
              no período
            </small>
          </div>
        </article>

        <article className="receita-resumo-card">
          <span className="receita-resumo-icone dourado">
            ↑
          </span>

          <div>
            <span>
              Maior entrada
            </span>

            <strong>
              {formatarMoeda(
                dados.maiorReceita
                  ?.valor || 0
              )}
            </strong>

            <small>
              {dados.maiorReceita
                ?.descricao ||
                "Sem registros"}
            </small>
          </div>
        </article>

        <article className="receita-resumo-card">
          <span className="receita-resumo-icone coral">
            ≈
          </span>

          <div>
            <span>
              Média por entrada
            </span>

            <strong>
              {formatarMoeda(
                dados.media
              )}
            </strong>

            <small>
              apenas informativo
            </small>
          </div>
        </article>
      </section>

      <section className="receitas-lista-box">
        <div className="receitas-lista-topo">
          <div>
            <span>
              Caderno de receitas
            </span>

            <h2>
              Entradas registradas
            </h2>

            <p>
              Seu histórico de valores
              recebidos neste período.
            </p>
          </div>

          <strong>
            {formatarMoeda(
              dados.total
            )}
          </strong>
        </div>

        {dados.receitasMes.length ===
        0 ? (
          <div className="receitas-vazio">
            <span>
              🌱
            </span>

            <h3>
              Nenhuma receita registrada
            </h3>

            <p>
              Registre sua primeira
              entrada para começar a
              acompanhar quanto recebeu
              no mês.
            </p>

            <button
              type="button"
              onClick={
                abrirNovaReceita
              }
            >
              + Registrar receita
            </button>
          </div>
        ) : (
          <div className="receitas-lista">
            {dados.receitasMes.map(
              (receita) => (
                <article
                  key={receita.id}
                  className="receita-item"
                >
                  <span className="receita-item-icone">
                    +
                  </span>

                  <div className="receita-item-info">
                    <strong>
                      {
                        receita.descricao
                      }
                    </strong>

                    <span>
                      Recebido em{" "}
                      {formatarData(
                        receita.data
                      )}
                    </span>
                  </div>

                  <strong className="receita-item-valor">
                    {formatarMoeda(
                      receita.valor
                    )}
                  </strong>

                  <div className="receita-item-acoes">
                    <button
                      type="button"
                      onClick={() =>
                        editarReceita(
                          receita
                        )
                      }
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      className="excluir"
                      onClick={() =>
                        excluirReceita(
                          receita.id
                        )
                      }
                    >
                      Excluir
                    </button>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </section>

      <section className="receitas-explicacao">
        <span>
          💡
        </span>

        <div>
          <strong>
            Por que registrar as
            entradas?
          </strong>

          <p>
            Na próxima etapa, essas
            receitas poderão ser
            comparadas aos gastos,
            valores separados e contas
            pendentes para formar uma
            visão mais realista do mês.
          </p>
        </div>
      </section>
    </div>
  );
}