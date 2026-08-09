"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

const CHAVE_ARMAZENAMENTO =
  "conquistia-gastos-v1";

const categorias = [
  {
    nome: "Alimentação",
    icone: "🍽️",
  },
  {
    nome: "Transporte",
    icone: "🚗",
  },
  {
    nome: "Casa",
    icone: "🏠",
  },
  {
    nome: "Lazer",
    icone: "🎮",
  },
  {
    nome: "Saúde",
    icone: "❤️",
  },
  {
    nome: "Estudos",
    icone: "📚",
  },
  {
    nome: "Compras",
    icone: "🛍️",
  },
  {
    nome: "Assinaturas",
    icone: "📱",
  },
  {
    nome: "Presentes",
    icone: "🎁",
  },
  {
    nome: "Outros",
    icone: "📌",
  },
];

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString(
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

  const partes = data.split("-");

  if (partes.length !== 3) {
    return data;
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function formatarDataCompleta(data) {
  if (!data) {
    return "";
  }

  const dataLocal = new Date(
    `${data}T12:00:00`
  );

  return dataLocal.toLocaleDateString(
    "pt-BR",
    {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );
}

function obterIconeCategoria(nome) {
  const categoria = categorias.find(
    (item) => item.nome === nome
  );

  return categoria?.icone || "📌";
}

function carregarGastos() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const dados =
      window.localStorage.getItem(
        CHAVE_ARMAZENAMENTO
      );

    if (!dados) {
      return [];
    }

    const gastos = JSON.parse(dados);

    return Array.isArray(gastos)
      ? gastos
      : [];
  } catch (erro) {
    console.error(
      "Erro ao carregar os gastos:",
      erro
    );

    return [];
  }
}

function salvarGastos(gastos) {
  try {
    window.localStorage.setItem(
      CHAVE_ARMAZENAMENTO,
      JSON.stringify(gastos)
    );

    return true;
  } catch (erro) {
    console.error(
      "Erro ao salvar os gastos:",
      erro
    );

    return false;
  }
}

export default function MeuDiarioPage() {
  const [gastos, setGastos] =
    useState([]);

  const [carregado, setCarregado] =
    useState(false);

  const [mensagem, setMensagem] =
    useState("");

  const [erro, setErro] =
    useState("");

  const [filtros, setFiltros] =
    useState({
      busca: "",
      categoria: "Todas",
      dataInicial: "",
      dataFinal: "",
    });

  const [gastoEmEdicao, setGastoEmEdicao] =
    useState(null);

  const [formularioEdicao, setFormularioEdicao] =
    useState({
      descricao: "",
      valor: "",
      categoria: "Alimentação",
      data: "",
      observacao: "",
    });

  useEffect(() => {
    const gastosSalvos =
      carregarGastos();

    setGastos(gastosSalvos);
    setCarregado(true);
  }, []);

  const gastosFiltrados = useMemo(() => {
    const termoBusca =
      filtros.busca.trim().toLowerCase();

    return [...gastos]
      .filter((gasto) => {
        const correspondeBusca =
          !termoBusca ||
          gasto.descricao
            ?.toLowerCase()
            .includes(termoBusca) ||
          gasto.observacao
            ?.toLowerCase()
            .includes(termoBusca);

        const correspondeCategoria =
          filtros.categoria === "Todas" ||
          gasto.categoria ===
            filtros.categoria;

        const correspondeDataInicial =
          !filtros.dataInicial ||
          gasto.data >=
            filtros.dataInicial;

        const correspondeDataFinal =
          !filtros.dataFinal ||
          gasto.data <=
            filtros.dataFinal;

        return (
          correspondeBusca &&
          correspondeCategoria &&
          correspondeDataInicial &&
          correspondeDataFinal
        );
      })
      .sort((primeiro, segundo) => {
        const dataPrimeiro =
          new Date(
            `${primeiro.data}T${
              primeiro.criadoEmHora ||
              "00:00"
            }`
          );

        const dataSegundo =
          new Date(
            `${segundo.data}T${
              segundo.criadoEmHora ||
              "00:00"
            }`
          );

        return dataSegundo - dataPrimeiro;
      });
  }, [gastos, filtros]);

  const gruposPorData = useMemo(() => {
    return gastosFiltrados.reduce(
      (grupos, gasto) => {
        const data =
          gasto.data || "Sem data";

        if (!grupos[data]) {
          grupos[data] = [];
        }

        grupos[data].push(gasto);

        return grupos;
      },
      {}
    );
  }, [gastosFiltrados]);

  const datasOrdenadas = useMemo(() => {
    return Object.keys(
      gruposPorData
    ).sort(
      (primeiraData, segundaData) =>
        segundaData.localeCompare(
          primeiraData
        )
    );
  }, [gruposPorData]);

  const resumo = useMemo(() => {
    const total = gastosFiltrados.reduce(
      (soma, gasto) =>
        soma + Number(gasto.valor || 0),
      0
    );

    const quantidade =
      gastosFiltrados.length;

    const diasComRegistros =
      new Set(
        gastosFiltrados.map(
          (gasto) => gasto.data
        )
      ).size;

    const mediaPorRegistro =
      quantidade > 0
        ? total / quantidade
        : 0;

    const totaisPorCategoria =
      gastosFiltrados.reduce(
        (acumulador, gasto) => {
          const categoria =
            gasto.categoria || "Outros";

          acumulador[categoria] =
            (acumulador[categoria] || 0) +
            Number(gasto.valor || 0);

          return acumulador;
        },
        {}
      );

    const maiorCategoria =
      Object.entries(
        totaisPorCategoria
      ).sort(
        (primeira, segunda) =>
          segunda[1] - primeira[1]
      )[0];

    return {
      total,
      quantidade,
      diasComRegistros,
      mediaPorRegistro,
      maiorCategoria:
        maiorCategoria?.[0] || "Nenhuma",
      maiorCategoriaValor:
        maiorCategoria?.[1] || 0,
    };
  }, [gastosFiltrados]);

  function atualizarFiltro(evento) {
    const {
      name,
      value,
    } = evento.target;

    setFiltros((estadoAtual) => ({
      ...estadoAtual,
      [name]: value,
    }));

    setMensagem("");
    setErro("");
  }

  function limparFiltros() {
    setFiltros({
      busca: "",
      categoria: "Todas",
      dataInicial: "",
      dataFinal: "",
    });

    setMensagem(
      "Os filtros foram removidos."
    );

    setErro("");
  }

  function excluirGasto(id) {
    const confirmar =
      window.confirm(
        "Deseja realmente excluir este gasto?"
      );

    if (!confirmar) {
      return;
    }

    const novosGastos =
      gastos.filter(
        (gasto) => gasto.id !== id
      );

    const salvo =
      salvarGastos(novosGastos);

    if (!salvo) {
      setErro(
        "Não foi possível excluir o gasto."
      );

      return;
    }

    setGastos(novosGastos);
    setMensagem(
      "O gasto foi excluído."
    );
    setErro("");
  }

  function iniciarEdicao(gasto) {
    setGastoEmEdicao(gasto);

    setFormularioEdicao({
      descricao:
        gasto.descricao || "",
      valor:
        String(gasto.valor || ""),
      categoria:
        gasto.categoria ||
        "Alimentação",
      data:
        gasto.data || "",
      observacao:
        gasto.observacao || "",
    });

    setMensagem("");
    setErro("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function atualizarCampoEdicao(
    evento
  ) {
    const {
      name,
      value,
    } = evento.target;

    setFormularioEdicao(
      (estadoAtual) => ({
        ...estadoAtual,
        [name]: value,
      })
    );

    setErro("");
  }

  function cancelarEdicao() {
    setGastoEmEdicao(null);

    setFormularioEdicao({
      descricao: "",
      valor: "",
      categoria: "Alimentação",
      data: "",
      observacao: "",
    });

    setMensagem(
      "A edição foi cancelada."
    );

    setErro("");
  }

  function salvarEdicao(evento) {
    evento.preventDefault();

    if (!gastoEmEdicao) {
      return;
    }

    const descricao =
      formularioEdicao.descricao.trim();

    const valor =
      Number(
        String(
          formularioEdicao.valor
        ).replace(",", ".")
      );

    if (!descricao) {
      setErro(
        "Informe a descrição do gasto."
      );

      return;
    }

    if (
      !Number.isFinite(valor) ||
      valor <= 0
    ) {
      setErro(
        "Informe um valor maior que zero."
      );

      return;
    }

    if (!formularioEdicao.data) {
      setErro(
        "Informe a data do gasto."
      );

      return;
    }

    const novosGastos =
      gastos.map((gasto) => {
        if (
          gasto.id !==
          gastoEmEdicao.id
        ) {
          return gasto;
        }

        return {
          ...gasto,
          descricao,
          valor,
          categoria:
            formularioEdicao.categoria,
          data:
            formularioEdicao.data,
          observacao:
            formularioEdicao.observacao.trim(),
          atualizadoEm:
            new Date().toISOString(),
        };
      });

    const salvo =
      salvarGastos(novosGastos);

    if (!salvo) {
      setErro(
        "Não foi possível salvar as alterações."
      );

      return;
    }

    setGastos(novosGastos);
    setGastoEmEdicao(null);

    setFormularioEdicao({
      descricao: "",
      valor: "",
      categoria: "Alimentação",
      data: "",
      observacao: "",
    });

    setMensagem(
      "O gasto foi atualizado com sucesso."
    );

    setErro("");
  }

  const filtrosAtivos =
    filtros.busca ||
    filtros.categoria !== "Todas" ||
    filtros.dataInicial ||
    filtros.dataFinal;

  return (
    <div className="diario-pagina">
      <section className="diario-apresentacao">
        <div>
          <span className="diario-etiqueta">
            Sua história financeira
          </span>

          <h1>
            Veja como suas escolhas se
            acumulam ao longo do tempo
          </h1>

          <p>
            Consulte seus registros,
            identifique padrões e corrija
            informações sempre que
            necessário.
          </p>
        </div>

        <Link
          href="/registrar-gasto"
          className="diario-botao-registrar"
        >
          <span>
            +
          </span>

          Registrar novo gasto
        </Link>
      </section>

      {gastoEmEdicao && (
        <section className="edicao-bloco">
          <div className="edicao-cabecalho">
            <div>
              <span>
                Alterar lançamento
              </span>

              <h2>
                Editar gasto
              </h2>

              <p>
                Faça as correções e salve
                novamente no diário.
              </p>
            </div>

            <button
              type="button"
              className="botao-fechar-edicao"
              onClick={cancelarEdicao}
              aria-label="Fechar edição"
            >
              ×
            </button>
          </div>

          <form
            className="edicao-formulario"
            onSubmit={salvarEdicao}
          >
            <div className="edicao-campo edicao-campo-descricao">
              <label htmlFor="descricao">
                Descrição
              </label>

              <input
                id="descricao"
                name="descricao"
                type="text"
                value={
                  formularioEdicao.descricao
                }
                onChange={
                  atualizarCampoEdicao
                }
                maxLength={80}
              />
            </div>

            <div className="edicao-campo">
              <label htmlFor="valor">
                Valor
              </label>

              <input
                id="valor"
                name="valor"
                type="number"
                min="0.01"
                step="0.01"
                value={
                  formularioEdicao.valor
                }
                onChange={
                  atualizarCampoEdicao
                }
              />
            </div>

            <div className="edicao-campo">
              <label htmlFor="categoria">
                Categoria
              </label>

              <select
                id="categoria"
                name="categoria"
                value={
                  formularioEdicao.categoria
                }
                onChange={
                  atualizarCampoEdicao
                }
              >
                {categorias.map(
                  (categoria) => (
                    <option
                      key={
                        categoria.nome
                      }
                      value={
                        categoria.nome
                      }
                    >
                      {categoria.icone}{" "}
                      {categoria.nome}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="edicao-campo">
              <label htmlFor="data">
                Data
              </label>

              <input
                id="data"
                name="data"
                type="date"
                value={
                  formularioEdicao.data
                }
                onChange={
                  atualizarCampoEdicao
                }
              />
            </div>

            <div className="edicao-campo edicao-campo-observacao">
              <label htmlFor="observacao">
                Observação
              </label>

              <input
                id="observacao"
                name="observacao"
                type="text"
                value={
                  formularioEdicao.observacao
                }
                onChange={
                  atualizarCampoEdicao
                }
                maxLength={180}
              />
            </div>

            <div className="edicao-acoes">
              <button
                type="button"
                className="botao-cancelar-edicao"
                onClick={cancelarEdicao}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="botao-salvar-edicao"
              >
                Salvar alterações
              </button>
            </div>
          </form>
        </section>
      )}

      {erro && (
        <div
          className="diario-mensagem diario-mensagem-erro"
          role="alert"
        >
          <span>
            !
          </span>

          <p>
            {erro}
          </p>
        </div>
      )}

      {mensagem && (
        <div
          className="diario-mensagem diario-mensagem-sucesso"
          role="status"
        >
          <span>
            ✓
          </span>

          <p>
            {mensagem}
          </p>
        </div>
      )}

      <section className="diario-resumo-grid">
        <article className="diario-resumo-card">
          <span className="diario-resumo-icone verde">
            ↓
          </span>

          <div>
            <p>
              Total do período
            </p>

            <strong>
              {formatarMoeda(
                resumo.total
              )}
            </strong>
          </div>
        </article>

        <article className="diario-resumo-card">
          <span className="diario-resumo-icone azul">
            ▣
          </span>

          <div>
            <p>
              Registros encontrados
            </p>

            <strong>
              {resumo.quantidade}
            </strong>
          </div>
        </article>

        <article className="diario-resumo-card">
          <span className="diario-resumo-icone dourado">
            ◷
          </span>

          <div>
            <p>
              Dias com registros
            </p>

            <strong>
              {resumo.diasComRegistros}
            </strong>
          </div>
        </article>

        <article className="diario-resumo-card">
          <span className="diario-resumo-icone rosa">
            ◉
          </span>

          <div>
            <p>
              Maior categoria
            </p>

            <strong className="diario-categoria-destaque">
              {
                resumo.maiorCategoria
              }
            </strong>

            <small>
              {formatarMoeda(
                resumo.maiorCategoriaValor
              )}
            </small>
          </div>
        </article>
      </section>

      <section className="filtros-bloco">
        <div className="filtros-cabecalho">
          <div>
            <span>
              Pesquisa inteligente
            </span>

            <h2>
              Filtrar registros
            </h2>

            <p>
              Encontre gastos por nome,
              categoria ou período.
            </p>
          </div>

          {filtrosAtivos && (
            <button
              type="button"
              className="botao-limpar-filtros"
              onClick={limparFiltros}
            >
              Limpar filtros
            </button>
          )}
        </div>

        <div className="filtros-grid">
          <div className="filtro-campo filtro-busca">
            <label htmlFor="busca">
              Buscar
            </label>

            <input
              id="busca"
              name="busca"
              type="search"
              value={filtros.busca}
              onChange={atualizarFiltro}
              placeholder="Ex.: mercado, almoço ou cinema"
            />
          </div>

          <div className="filtro-campo">
            <label htmlFor="categoria">
              Categoria
            </label>

            <select
              id="categoria"
              name="categoria"
              value={
                filtros.categoria
              }
              onChange={atualizarFiltro}
            >
              <option value="Todas">
                Todas
              </option>

              {categorias.map(
                (categoria) => (
                  <option
                    key={
                      categoria.nome
                    }
                    value={
                      categoria.nome
                    }
                  >
                    {categoria.icone}{" "}
                    {categoria.nome}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="filtro-campo">
            <label htmlFor="dataInicial">
              Data inicial
            </label>

            <input
              id="dataInicial"
              name="dataInicial"
              type="date"
              value={
                filtros.dataInicial
              }
              onChange={atualizarFiltro}
            />
          </div>

          <div className="filtro-campo">
            <label htmlFor="dataFinal">
              Data final
            </label>

            <input
              id="dataFinal"
              name="dataFinal"
              type="date"
              value={
                filtros.dataFinal
              }
              onChange={atualizarFiltro}
            />
          </div>
        </div>
      </section>

      <section className="diario-conteudo">
        <div className="diario-conteudo-cabecalho">
          <div>
            <span>
              Histórico organizado
            </span>

            <h2>
              Seus registros
            </h2>

            <p>
              Média de{" "}
              {formatarMoeda(
                resumo.mediaPorRegistro
              )}{" "}
              por lançamento no período
              selecionado.
            </p>
          </div>

          <span className="diario-contador">
            {resumo.quantidade}{" "}
            {resumo.quantidade === 1
              ? "registro"
              : "registros"}
          </span>
        </div>

        {!carregado ? (
          <div className="diario-estado-vazio">
            <span>
              ◌
            </span>

            <h3>
              Carregando seu diário
            </h3>

            <p>
              Estamos reunindo seus
              registros.
            </p>
          </div>
        ) : gastos.length === 0 ? (
          <div className="diario-estado-vazio">
            <span>
              ✍️
            </span>

            <h3>
              Seu diário ainda está vazio
            </h3>

            <p>
              Registre seu primeiro gasto
              para começar a construir sua
              história financeira.
            </p>

            <Link
              href="/registrar-gasto"
              className="estado-botao"
            >
              Registrar primeiro gasto
            </Link>
          </div>
        ) : gastosFiltrados.length ===
          0 ? (
          <div className="diario-estado-vazio">
            <span>
              🔎
            </span>

            <h3>
              Nenhum registro encontrado
            </h3>

            <p>
              Tente alterar os filtros para
              visualizar outros gastos.
            </p>

            <button
              type="button"
              className="estado-botao"
              onClick={limparFiltros}
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="diario-grupos">
            {datasOrdenadas.map(
              (data) => {
                const gastosDoDia =
                  gruposPorData[data];

                const totalDoDia =
                  gastosDoDia.reduce(
                    (soma, gasto) =>
                      soma +
                      Number(
                        gasto.valor || 0
                      ),
                    0
                  );

                return (
                  <article
                    key={data}
                    className="diario-grupo-dia"
                  >
                    <div className="grupo-dia-cabecalho">
                      <div>
                        <span>
                          {formatarData(
                            data
                          )}
                        </span>

                        <h3>
                          {formatarDataCompleta(
                            data
                          )}
                        </h3>
                      </div>

                      <div className="grupo-dia-total">
                        <span>
                          Total do dia
                        </span>

                        <strong>
                          {formatarMoeda(
                            totalDoDia
                          )}
                        </strong>
                      </div>
                    </div>

                    <div className="grupo-dia-lista">
                      {gastosDoDia.map(
                        (gasto) => (
                          <div
                            key={
                              gasto.id
                            }
                            className="diario-gasto-item"
                          >
                            <span className="diario-gasto-icone">
                              {obterIconeCategoria(
                                gasto.categoria
                              )}
                            </span>

                            <div className="diario-gasto-descricao">
                              <strong>
                                {
                                  gasto.descricao
                                }
                              </strong>

                              <span>
                                {
                                  gasto.categoria
                                }
                              </span>

                              {gasto.observacao && (
                                <small>
                                  {
                                    gasto.observacao
                                  }
                                </small>
                              )}
                            </div>

                            <div className="diario-gasto-horario">
                              <span>
                                Horário
                              </span>

                              <strong>
                                {gasto.criadoEmHora ||
                                  "--:--"}
                              </strong>
                            </div>

                            <strong className="diario-gasto-valor">
                              {formatarMoeda(
                                gasto.valor
                              )}
                            </strong>

                            <div className="diario-gasto-acoes">
                              <button
                                type="button"
                                className="botao-editar"
                                onClick={() =>
                                  iniciarEdicao(
                                    gasto
                                  )
                                }
                              >
                                Editar
                              </button>

                              <button
                                type="button"
                                className="botao-excluir"
                                onClick={() =>
                                  excluirGasto(
                                    gasto.id
                                  )
                                }
                              >
                                Excluir
                              </button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </section>
    </div>
  );
}