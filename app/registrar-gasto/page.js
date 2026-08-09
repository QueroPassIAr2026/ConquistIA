"use client";

import { useEffect, useMemo, useState } from "react";

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

function obterDataAtual() {
  const agora = new Date();

  const ano = agora.getFullYear();

  const mes = String(
    agora.getMonth() + 1
  ).padStart(2, "0");

  const dia = String(
    agora.getDate()
  ).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

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

function gerarId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
}

function obterIconeCategoria(nomeCategoria) {
  const categoria = categorias.find(
    (item) =>
      item.nome === nomeCategoria
  );

  return categoria?.icone || "📌";
}

function carregarGastosSalvos() {
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
      "Não foi possível carregar os gastos:",
      erro
    );

    return [];
  }
}

export default function RegistrarGastoPage() {
  const [gastos, setGastos] =
    useState([]);

  const [carregado, setCarregado] =
    useState(false);

  const [mensagem, setMensagem] =
    useState("");

  const [erro, setErro] =
    useState("");

  const [formulario, setFormulario] =
    useState({
      descricao: "",
      valor: "",
      categoria: "Alimentação",
      data: obterDataAtual(),
      observacao: "",
    });

  useEffect(() => {
    const gastosSalvos =
      carregarGastosSalvos();

    setGastos(gastosSalvos);
    setCarregado(true);
  }, []);

  useEffect(() => {
    if (!carregado) {
      return;
    }

    try {
      window.localStorage.setItem(
        CHAVE_ARMAZENAMENTO,
        JSON.stringify(gastos)
      );
    } catch (erroArmazenamento) {
      console.error(
        "Não foi possível salvar os gastos:",
        erroArmazenamento
      );

      setErro(
        "Não foi possível salvar o registro neste navegador."
      );
    }
  }, [gastos, carregado]);

  const resumo = useMemo(() => {
    const total = gastos.reduce(
      (soma, gasto) =>
        soma + Number(gasto.valor || 0),
      0
    );

    const totaisPorCategoria =
      gastos.reduce(
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
        (primeiro, segundo) =>
          segundo[1] - primeiro[1]
      )[0];

    const dataAtual =
      obterDataAtual();

    const totalHoje = gastos
      .filter(
        (gasto) =>
          gasto.data === dataAtual
      )
      .reduce(
        (soma, gasto) =>
          soma + Number(gasto.valor || 0),
        0
      );

    return {
      total,
      totalHoje,
      quantidade: gastos.length,
      maiorCategoria:
        maiorCategoria?.[0] || "Nenhuma",
      valorMaiorCategoria:
        maiorCategoria?.[1] || 0,
    };
  }, [gastos]);

  const gastosOrdenados = useMemo(() => {
    return [...gastos].sort(
      (primeiro, segundo) => {
        const dataPrimeiro =
          new Date(
            `${primeiro.data}T${primeiro.criadoEmHora || "00:00"}`
          );

        const dataSegundo =
          new Date(
            `${segundo.data}T${segundo.criadoEmHora || "00:00"}`
          );

        return dataSegundo - dataPrimeiro;
      }
    );
  }, [gastos]);

  function atualizarCampo(evento) {
    const {
      name,
      value,
    } = evento.target;

    setFormulario((estadoAtual) => ({
      ...estadoAtual,
      [name]: value,
    }));

    setErro("");
    setMensagem("");
  }

  function registrarGasto(evento) {
    evento.preventDefault();

    setErro("");
    setMensagem("");

    const descricao =
      formulario.descricao.trim();

    const valor =
      Number(
        String(formulario.valor)
          .replace(",", ".")
      );

    if (!descricao) {
      setErro(
        "Informe o que você comprou ou pagou."
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

    if (!formulario.categoria) {
      setErro(
        "Escolha uma categoria."
      );

      return;
    }

    if (!formulario.data) {
      setErro(
        "Informe a data do gasto."
      );

      return;
    }

    const agora = new Date();

    const novoGasto = {
      id: gerarId(),
      descricao,
      valor,
      categoria:
        formulario.categoria,
      data: formulario.data,
      observacao:
        formulario.observacao.trim(),
      criadoEm:
        agora.toISOString(),
      criadoEmHora:
        agora.toLocaleTimeString(
          "pt-BR",
          {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }
        ),
    };

    setGastos((gastosAtuais) => [
      novoGasto,
      ...gastosAtuais,
    ]);

    setFormulario({
      descricao: "",
      valor: "",
      categoria: "Alimentação",
      data: obterDataAtual(),
      observacao: "",
    });

    setMensagem(
      `${descricao} foi registrado com sucesso.`
    );
  }

  function excluirGasto(id) {
    const confirmar =
      window.confirm(
        "Deseja realmente excluir este gasto?"
      );

    if (!confirmar) {
      return;
    }

    setGastos((gastosAtuais) =>
      gastosAtuais.filter(
        (gasto) => gasto.id !== id
      )
    );

    setMensagem(
      "O gasto foi excluído."
    );

    setErro("");
  }

  function limparTodosOsGastos() {
    if (gastos.length === 0) {
      return;
    }

    const confirmar =
      window.confirm(
        "Deseja excluir todos os gastos registrados neste navegador?"
      );

    if (!confirmar) {
      return;
    }

    setGastos([]);
    setMensagem(
      "Todos os registros foram removidos."
    );
    setErro("");
  }

  return (
    <div className="registro-pagina">
      <section className="registro-apresentacao">
        <div>
          <span className="registro-etiqueta">
            Seu diário começa aqui
          </span>

          <h1>
            Registre uma escolha do seu dia
          </h1>

          <p>
            Cada lançamento ajuda o
            ConquistIA a compreender seus
            hábitos e formar diagnósticos
            mais úteis ao longo do tempo.
          </p>
        </div>

        <div className="registro-privacidade">
          <span>
            ✓
          </span>

          <p>
            Os registros ficam salvos
            somente neste navegador.
          </p>
        </div>
      </section>

      <section className="registro-resumo-grid">
        <article className="registro-resumo-card">
          <span className="registro-resumo-icone verde">
            ↓
          </span>

          <div>
            <p>
              Total registrado
            </p>

            <strong>
              {formatarMoeda(
                resumo.total
              )}
            </strong>
          </div>
        </article>

        <article className="registro-resumo-card">
          <span className="registro-resumo-icone dourado">
            ◷
          </span>

          <div>
            <p>
              Gastos de hoje
            </p>

            <strong>
              {formatarMoeda(
                resumo.totalHoje
              )}
            </strong>
          </div>
        </article>

        <article className="registro-resumo-card">
          <span className="registro-resumo-icone azul">
            ▣
          </span>

          <div>
            <p>
              Quantidade
            </p>

            <strong>
              {resumo.quantidade}
            </strong>
          </div>
        </article>

        <article className="registro-resumo-card">
          <span className="registro-resumo-icone rosa">
            ◉
          </span>

          <div>
            <p>
              Maior categoria
            </p>

            <strong className="categoria-destaque-texto">
              {resumo.maiorCategoria}
            </strong>

            <small>
              {formatarMoeda(
                resumo.valorMaiorCategoria
              )}
            </small>
          </div>
        </article>
      </section>

      <section className="registro-conteudo-grid">
        <article className="formulario-bloco">
          <div className="registro-bloco-cabecalho">
            <div>
              <span>
                Novo lançamento
              </span>

              <h2>
                Registrar gasto
              </h2>
            </div>

            <span className="formulario-passos">
              1 minuto
            </span>
          </div>

          <form
            className="formulario-gasto"
            onSubmit={registrarGasto}
          >
            <div className="campo-grupo campo-grupo-largo">
              <label htmlFor="descricao">
                O que você comprou ou pagou?
              </label>

              <input
                id="descricao"
                name="descricao"
                type="text"
                value={formulario.descricao}
                onChange={atualizarCampo}
                placeholder="Ex.: supermercado, almoço ou transporte"
                maxLength={80}
                autoComplete="off"
              />
            </div>

            <div className="formulario-linha">
              <div className="campo-grupo">
                <label htmlFor="valor">
                  Valor
                </label>

                <div className="campo-valor">
                  <span>
                    R$
                  </span>

                  <input
                    id="valor"
                    name="valor"
                    type="number"
                    value={formulario.valor}
                    onChange={atualizarCampo}
                    placeholder="0,00"
                    min="0.01"
                    step="0.01"
                    inputMode="decimal"
                  />
                </div>
              </div>

              <div className="campo-grupo">
                <label htmlFor="data">
                  Data
                </label>

                <input
                  id="data"
                  name="data"
                  type="date"
                  value={formulario.data}
                  onChange={atualizarCampo}
                />
              </div>
            </div>

            <div className="campo-grupo campo-grupo-largo">
              <label htmlFor="categoria">
                Categoria
              </label>

              <select
                id="categoria"
                name="categoria"
                value={formulario.categoria}
                onChange={atualizarCampo}
              >
                {categorias.map(
                  (categoria) => (
                    <option
                      key={categoria.nome}
                      value={categoria.nome}
                    >
                      {categoria.icone}{" "}
                      {categoria.nome}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="categorias-rapidas">
              {categorias
                .slice(0, 6)
                .map((categoria) => (
                  <button
                    type="button"
                    key={categoria.nome}
                    className={
                      formulario.categoria ===
                      categoria.nome
                        ? "categoria-rapida categoria-rapida-ativa"
                        : "categoria-rapida"
                    }
                    onClick={() => {
                      setFormulario(
                        (estadoAtual) => ({
                          ...estadoAtual,
                          categoria:
                            categoria.nome,
                        })
                      );

                      setErro("");
                      setMensagem("");
                    }}
                  >
                    <span>
                      {categoria.icone}
                    </span>

                    {categoria.nome}
                  </button>
                ))}
            </div>

            <div className="campo-grupo campo-grupo-largo">
              <label htmlFor="observacao">
                Observação
                <small>
                  Opcional
                </small>
              </label>

              <textarea
                id="observacao"
                name="observacao"
                value={formulario.observacao}
                onChange={atualizarCampo}
                placeholder="Acrescente algum detalhe que ajude você a lembrar deste gasto."
                maxLength={180}
                rows={4}
              />
            </div>

            {erro && (
              <div
                className="mensagem-formulario mensagem-erro"
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
                className="mensagem-formulario mensagem-sucesso"
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

            <button
              type="submit"
              className="botao-salvar-gasto"
            >
              <span>
                +
              </span>

              Salvar no meu diário
            </button>

            <p className="formulario-aviso">
              Nenhuma conta bancária ou
              número de cartão será
              solicitado.
            </p>
          </form>
        </article>

        <aside className="registro-orientacoes">
          <article className="orientacao-card destaque">
            <span className="orientacao-icone">
              ✦
            </span>

            <div>
              <span className="orientacao-legenda">
                Como funciona
              </span>

              <h2>
                Um registro de cada vez
              </h2>

              <p>
                Você não precisa lembrar de
                todos os gastos antigos.
                Comece registrando as escolhas
                de hoje.
              </p>
            </div>
          </article>

          <article className="orientacao-card">
            <span className="orientacao-icone">
              1
            </span>

            <div>
              <strong>
                Registre diariamente
              </strong>

              <p>
                A regularidade ajuda o
                aplicativo a formar um retrato
                mais fiel.
              </p>
            </div>
          </article>

          <article className="orientacao-card">
            <span className="orientacao-icone">
              2
            </span>

            <div>
              <strong>
                Escolha a categoria
              </strong>

              <p>
                As categorias permitem
                descobrir onde os gastos estão
                concentrados.
              </p>
            </div>
          </article>

          <article className="orientacao-card">
            <span className="orientacao-icone">
              3
            </span>

            <div>
              <strong>
                Acompanhe os padrões
              </strong>

              <p>
                Quanto mais registros, mais
                completas serão as comparações.
              </p>
            </div>
          </article>

          <article className="diagnostico-inicial-card">
            <span>
              💡
            </span>

            <div>
              <strong>
                Diagnóstico inicial
              </strong>

              <p>
                {resumo.quantidade === 0
                  ? "Registre seu primeiro gasto para começar a construir seu diagnóstico."
                  : resumo.quantidade < 5
                    ? "Você começou sua jornada. Continue registrando para revelar os primeiros padrões."
                    : `Seus registros já mostram maior concentração em ${resumo.maiorCategoria}.`}
              </p>
            </div>
          </article>
        </aside>
      </section>

      <section className="registros-salvos-bloco">
        <div className="registros-salvos-cabecalho">
          <div>
            <span>
              Histórico local
            </span>

            <h2>
              Últimos registros
            </h2>

            <p>
              Estes dados estão armazenados
              neste navegador.
            </p>
          </div>

          {gastos.length > 0 && (
            <button
              type="button"
              className="botao-limpar-registros"
              onClick={
                limparTodosOsGastos
              }
            >
              Limpar todos
            </button>
          )}
        </div>

        {!carregado ? (
          <div className="estado-registros">
            <span className="estado-registros-icone">
              ◌
            </span>

            <h3>
              Carregando registros
            </h3>

            <p>
              Estamos preparando seu diário.
            </p>
          </div>
        ) : gastosOrdenados.length ===
          0 ? (
          <div className="estado-registros">
            <span className="estado-registros-icone">
              ✍️
            </span>

            <h3>
              Seu diário está vazio
            </h3>

            <p>
              Preencha o formulário acima
              para registrar sua primeira
              escolha financeira.
            </p>
          </div>
        ) : (
          <div className="tabela-registros">
            <div className="tabela-registros-topo">
              <span>
                Descrição
              </span>

              <span>
                Categoria
              </span>

              <span>
                Data
              </span>

              <span>
                Valor
              </span>

              <span>
                Ação
              </span>
            </div>

            {gastosOrdenados.map(
              (gasto) => (
                <article
                  key={gasto.id}
                  className="gasto-registrado-item"
                >
                  <div className="gasto-descricao">
                    <span className="gasto-categoria-icone">
                      {obterIconeCategoria(
                        gasto.categoria
                      )}
                    </span>

                    <div>
                      <strong>
                        {gasto.descricao}
                      </strong>

                      <small>
                        {gasto.observacao ||
                          "Sem observação"}
                      </small>
                    </div>
                  </div>

                  <span className="gasto-categoria">
                    {gasto.categoria}
                  </span>

                  <span className="gasto-data">
                    {formatarData(
                      gasto.data
                    )}
                  </span>

                  <strong className="gasto-valor">
                    {formatarMoeda(
                      gasto.valor
                    )}
                  </strong>

                  <button
                    type="button"
                    className="botao-excluir-gasto"
                    onClick={() =>
                      excluirGasto(gasto.id)
                    }
                    aria-label={`Excluir ${gasto.descricao}`}
                  >
                    Excluir
                  </button>
                </article>
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
}