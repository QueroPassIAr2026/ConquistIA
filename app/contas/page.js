"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

const CHAVE_CONTAS =
  "conquistia-contas-v1";

const CHAVE_GASTOS =
  "conquistia-gastos-v1";

const categorias = [
  "Casa",
  "Alimentação",
  "Transporte",
  "Saúde",
  "Estudos",
  "Compras",
  "Assinaturas",
  "Lazer",
  "Outros",
];

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

function diasAteVencimento(data) {
  if (!data) {
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

  const vencimento =
    new Date(
      `${data}T12:00:00`
    );

  vencimento.setHours(
    0,
    0,
    0,
    0
  );

  const diferenca =
    vencimento.getTime() -
    hoje.getTime();

  return Math.round(
    diferenca /
      (1000 *
        60 *
        60 *
        24)
  );
}

function obterStatus(conta) {
  if (conta.pago) {
    return {
      tipo: "pago",
      titulo: "Pago",
      texto: conta.dataPagamento
        ? `Pago em ${formatarData(
            conta.dataPagamento
          )}`
        : "Pagamento registrado",
    };
  }

  const dias =
    diasAteVencimento(
      conta.vencimento
    );

  if (dias === null) {
    return {
      tipo: "pendente",
      titulo: "Pendente",
      texto:
        "Sem vencimento",
    };
  }

  if (dias < 0) {
    return {
      tipo: "atrasada",
      titulo: "Atrasada",
      texto: `${Math.abs(
        dias
      )} ${
        Math.abs(dias) === 1
          ? "dia"
          : "dias"
      } em atraso`,
    };
  }

  if (dias === 0) {
    return {
      tipo: "hoje",
      titulo: "Vence hoje",
      texto:
        "Vencimento hoje",
    };
  }

  if (dias <= 3) {
    return {
      tipo: "proxima",
      titulo:
        "Vence em breve",
      texto: `Faltam ${dias} ${
        dias === 1
          ? "dia"
          : "dias"
      }`,
    };
  }

  return {
    tipo: "pendente",
    titulo: "Pendente",
    texto: `Faltam ${dias} dias`,
  };
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

export default function ContasPage() {
  const hoje =
    new Date();

  const [
    contas,
    setContas,
  ] = useState([]);

  const [
    carregado,
    setCarregado,
  ] = useState(false);

  const [
    formularioAberto,
    setFormularioAberto,
  ] = useState(false);

  const [
    contaEditando,
    setContaEditando,
  ] = useState(null);

  const [
    filtro,
    setFiltro,
  ] = useState("todas");

  const [
    descricao,
    setDescricao,
  ] = useState("");

  const [
    instituicao,
    setInstituicao,
  ] = useState("");

  const [
    valor,
    setValor,
  ] = useState("");

  const [
    vencimento,
    setVencimento,
  ] = useState(
    obterDataHoje()
  );

  const [
    categoria,
    setCategoria,
  ] = useState("Casa");

  const [
    recorrente,
    setRecorrente,
  ] = useState(false);

  const [
    mensagem,
    setMensagem,
  ] = useState("");

  const [
    erro,
    setErro,
  ] = useState("");

  useEffect(() => {
    setContas(
      carregarLista(
        CHAVE_CONTAS
      )
    );

    setCarregado(true);
  }, []);

  const dados =
    useMemo(() => {
      const ano =
        hoje.getFullYear();

      const mes =
        hoje.getMonth() + 1;

      const contasMes =
        contas.filter(
          (conta) =>
            pertenceAoMes(
              conta.vencimento,
              ano,
              mes
            )
        );

      const total =
        contasMes.reduce(
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

      const pagas =
        contasMes.filter(
          (conta) =>
            conta.pago
        );

      const pendentes =
        contasMes.filter(
          (conta) =>
            !conta.pago
        );

      const totalPago =
        pagas.reduce(
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

      const totalPendente =
        pendentes.reduce(
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

      const atrasadas =
        pendentes.filter(
          (conta) => {
            const status =
              obterStatus(conta);

            return (
              status.tipo ===
              "atrasada"
            );
          }
        );

      const proximas =
        pendentes
          .filter(
            (conta) => {
              const dias =
                diasAteVencimento(
                  conta.vencimento
                );

              return (
                dias !== null &&
                dias >= 0 &&
                dias <= 7
              );
            }
          )
          .sort(
            (
              primeira,
              segunda
            ) =>
              primeira.vencimento.localeCompare(
                segunda.vencimento
              )
          );

      let lista =
        [...contasMes];

      if (
        filtro ===
        "pendentes"
      ) {
        lista =
          lista.filter(
            (conta) =>
              !conta.pago
          );
      }

      if (
        filtro === "pagas"
      ) {
        lista =
          lista.filter(
            (conta) =>
              conta.pago
          );
      }

      if (
        filtro ===
        "atrasadas"
      ) {
        lista =
          lista.filter(
            (conta) =>
              obterStatus(
                conta
              ).tipo ===
              "atrasada"
          );
      }

      lista.sort(
        (
          primeira,
          segunda
        ) => {
          if (
            primeira.pago !==
            segunda.pago
          ) {
            return primeira.pago
              ? 1
              : -1;
          }

          return String(
            primeira.vencimento ||
              ""
          ).localeCompare(
            String(
              segunda.vencimento ||
                ""
            )
          );
        }
      );

      return {
        contasMes,
        total,
        pagas,
        pendentes,
        totalPago,
        totalPendente,
        atrasadas,
        proximas,
        lista,
      };
    }, [
      contas,
      filtro,
    ]);

  function limparMensagens() {
    setErro("");
    setMensagem("");
  }

  function limparFormulario() {
    setDescricao("");
    setInstituicao("");
    setValor("");
    setVencimento(
      obterDataHoje()
    );
    setCategoria("Casa");
    setRecorrente(false);
    setContaEditando(null);
  }

  function abrirNovaConta() {
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

  function salvarConta(
    evento
  ) {
    evento.preventDefault();

    limparMensagens();

    const descricaoLimpa =
      descricao.trim();

    const instituicaoLimpa =
      instituicao.trim();

    const valorNumerico =
      Number(
        String(valor).replace(
          ",",
          "."
        )
      );

    if (!descricaoLimpa) {
      setErro(
        "Informe uma descrição para a conta."
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

    if (!vencimento) {
      setErro(
        "Informe a data de vencimento."
      );

      return;
    }

    const agora =
      new Date().toISOString();

    let novasContas;

    if (contaEditando) {
      novasContas =
        contas.map(
          (conta) =>
            conta.id ===
            contaEditando.id
              ? {
                  ...conta,

                  descricao:
                    descricaoLimpa,

                  instituicao:
                    instituicaoLimpa,

                  valor:
                    valorNumerico,

                  vencimento,

                  categoria,

                  recorrente,

                  atualizadoEm:
                    agora,
                }
              : conta
        );
    } else {
      novasContas = [
        {
          id: gerarId(),

          descricao:
            descricaoLimpa,

          instituicao:
            instituicaoLimpa,

          valor:
            valorNumerico,

          vencimento,

          categoria,

          recorrente,

          pago: false,

          dataPagamento:
            null,

          criadoEm:
            agora,
        },

        ...contas,
      ];
    }

    if (
      !salvarLista(
        CHAVE_CONTAS,
        novasContas
      )
    ) {
      setErro(
        "Não foi possível salvar esta conta."
      );

      return;
    }

    setContas(
      novasContas
    );

    setMensagem(
      contaEditando
        ? "Conta atualizada."
        : "Conta adicionada à lista."
    );

    limparFormulario();

    setFormularioAberto(
      false
    );
  }

  function editarConta(
    conta
  ) {
    setContaEditando(conta);

    setDescricao(
      conta.descricao || ""
    );

    setInstituicao(
      conta.instituicao || ""
    );

    setValor(
      String(
        conta.valor || ""
      )
    );

    setVencimento(
      conta.vencimento ||
        obterDataHoje()
    );

    setCategoria(
      conta.categoria ||
        "Casa"
    );

    setRecorrente(
      Boolean(
        conta.recorrente
      )
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

  function excluirConta(
    id
  ) {
    const confirmar =
      window.confirm(
        "Deseja excluir esta conta?"
      );

    if (!confirmar) {
      return;
    }

    const novasContas =
      contas.filter(
        (conta) =>
          conta.id !== id
      );

    if (
      salvarLista(
        CHAVE_CONTAS,
        novasContas
      )
    ) {
      setContas(
        novasContas
      );

      setMensagem(
        "Conta excluída."
      );

      setErro("");
    }
  }

  function marcarComoPago(
    conta
  ) {
    const hojePagamento =
      obterDataHoje();

    const novasContas =
      contas.map(
        (item) =>
          item.id ===
          conta.id
            ? {
                ...item,
                pago: true,
                dataPagamento:
                  hojePagamento,
                atualizadoEm:
                  new Date()
                    .toISOString(),
              }
            : item
      );

    if (
      !salvarLista(
        CHAVE_CONTAS,
        novasContas
      )
    ) {
      setErro(
        "Não foi possível atualizar a conta."
      );

      return;
    }

    setContas(
      novasContas
    );

    setMensagem(
      "Conta marcada como paga."
    );

    setErro("");

    const registrarNoDiario =
      window.confirm(
        "Conta paga. Deseja registrar este pagamento também no Meu Diário?"
      );

    if (
      registrarNoDiario
    ) {
      registrarPagamentoNoDiario(
        conta,
        hojePagamento
      );
    }
  }

  function marcarComoPendente(
    conta
  ) {
    const novasContas =
      contas.map(
        (item) =>
          item.id ===
          conta.id
            ? {
                ...item,
                pago: false,
                dataPagamento:
                  null,
                atualizadoEm:
                  new Date()
                    .toISOString(),
              }
            : item
      );

    if (
      salvarLista(
        CHAVE_CONTAS,
        novasContas
      )
    ) {
      setContas(
        novasContas
      );

      setMensagem(
        "Conta voltou para pendente."
      );

      setErro("");
    }
  }

  function registrarPagamentoNoDiario(
    conta,
    dataPagamento
  ) {
    const gastosAtuais =
      carregarLista(
        CHAVE_GASTOS
      );

    const jaExiste =
      gastosAtuais.some(
        (gasto) =>
          gasto.contaOrigemId ===
          conta.id
      );

    if (jaExiste) {
      setMensagem(
        "A conta foi paga e este pagamento já estava registrado no diário."
      );

      return;
    }

    const novoGasto = {
      id: gerarId(),

      descricao:
        conta.descricao,

      valor:
        Number(
          conta.valor || 0
        ),

      categoria:
        conta.categoria ||
        "Outros",

      data:
        dataPagamento,

      observacao:
        conta.instituicao
          ? `Pagamento de conta: ${conta.instituicao}`
          : "Pagamento de conta",

      contaOrigemId:
        conta.id,

      criadoEm:
        new Date()
          .toISOString(),

      criadoEmHora:
        new Date()
          .toLocaleTimeString(
            "pt-BR",
            {
              hour: "2-digit",
              minute:
                "2-digit",
            }
          ),
    };

    const novosGastos = [
      novoGasto,
      ...gastosAtuais,
    ];

    if (
      salvarLista(
        CHAVE_GASTOS,
        novosGastos
      )
    ) {
      setMensagem(
        "Conta paga e pagamento registrado no Meu Diário."
      );
    } else {
      setErro(
        "A conta foi marcada como paga, mas não foi possível registrar o gasto no diário."
      );
    }
  }

  if (!carregado) {
    return (
      <div className="contas-carregando">
        <span />

        <strong>
          Preparando suas contas...
        </strong>
      </div>
    );
  }

  return (
    <div className="contas-pagina">
      <section className="contas-apresentacao">
        <div>
          <span>
            Seu caderno de contas
          </span>

          <h1>
            O que ainda precisa ser
            pago?
          </h1>

          <p>
            Organize os compromissos do
            mês de forma simples para
            acompanhar vencimentos e
            pagamentos.
          </p>
        </div>

        <button
          type="button"
          className="contas-nova"
          onClick={
            abrirNovaConta
          }
        >
          <span>+</span>

          Adicionar conta
        </button>
      </section>

      <section className="contas-principio">
        <span>✓</span>

        <p>
          Nenhuma senha, código de
          barras, número de contrato,
          conta bancária ou dado
          protegido é necessário.
        </p>
      </section>

      {erro && (
        <div className="contas-mensagem erro">
          <span>!</span>
          <p>{erro}</p>
        </div>
      )}

      {mensagem && (
        <div className="contas-mensagem sucesso">
          <span>✓</span>
          <p>{mensagem}</p>
        </div>
      )}

      {formularioAberto && (
        <section className="conta-formulario-box">
          <div className="conta-formulario-topo">
            <div>
              <span>
                {contaEditando
                  ? "Alterar compromisso"
                  : "Novo compromisso"}
              </span>

              <h2>
                {contaEditando
                  ? "Editar conta"
                  : "Adicionar conta"}
              </h2>

              <p>
                Preencha somente as
                informações necessárias
                para lembrar do
                pagamento.
              </p>
            </div>

            <button
              type="button"
              className="conta-fechar"
              onClick={
                fecharFormulario
              }
            >
              ×
            </button>
          </div>

          <form
            className="conta-formulario"
            onSubmit={
              salvarConta
            }
          >
            <div className="conta-campo principal">
              <label
                htmlFor="descricaoConta"
              >
                Descrição
              </label>

              <input
                id="descricaoConta"
                type="text"
                value={descricao}
                onChange={(
                  evento
                ) =>
                  setDescricao(
                    evento.target
                      .value
                  )
                }
                placeholder="Ex.: energia elétrica"
                maxLength={70}
                autoFocus
              />
            </div>

            <div className="conta-campo">
              <label
                htmlFor="instituicaoConta"
              >
                Instituição
                <small>
                  opcional
                </small>
              </label>

              <input
                id="instituicaoConta"
                type="text"
                value={
                  instituicao
                }
                onChange={(
                  evento
                ) =>
                  setInstituicao(
                    evento.target
                      .value
                  )
                }
                placeholder="Ex.: companhia de energia"
                maxLength={70}
              />
            </div>

            <div className="conta-campo">
              <label
                htmlFor="valorConta"
              >
                Valor
              </label>

              <div className="conta-campo-moeda">
                <span>R$</span>

                <input
                  id="valorConta"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={valor}
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

            <div className="conta-campo">
              <label
                htmlFor="vencimentoConta"
              >
                Vencimento
              </label>

              <input
                id="vencimentoConta"
                type="date"
                value={
                  vencimento
                }
                onChange={(
                  evento
                ) =>
                  setVencimento(
                    evento.target
                      .value
                  )
                }
              />
            </div>

            <div className="conta-campo">
              <label
                htmlFor="categoriaConta"
              >
                Categoria
              </label>

              <select
                id="categoriaConta"
                value={
                  categoria
                }
                onChange={(
                  evento
                ) =>
                  setCategoria(
                    evento.target
                      .value
                  )
                }
              >
                {categorias.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}
              </select>
            </div>

            <label className="conta-recorrente">
              <input
                type="checkbox"
                checked={
                  recorrente
                }
                onChange={(
                  evento
                ) =>
                  setRecorrente(
                    evento.target
                      .checked
                  )
                }
              />

              <span>
                Esta conta costuma se
                repetir todos os meses
              </span>
            </label>

            <div className="conta-formulario-acoes">
              <button
                type="button"
                className="conta-cancelar"
                onClick={
                  fecharFormulario
                }
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="conta-salvar"
              >
                {contaEditando
                  ? "Salvar alterações"
                  : "Adicionar conta"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="contas-resumo-grid">
        <article className="conta-resumo-card">
          <span className="conta-resumo-icone verde">
            ▣
          </span>

          <div>
            <span>
              Contas do mês
            </span>

            <strong>
              {
                dados.contasMes
                  .length
              }
            </strong>

            <small>
              {formatarMoeda(
                dados.total
              )}
            </small>
          </div>
        </article>

        <article className="conta-resumo-card">
          <span className="conta-resumo-icone azul">
            ✓
          </span>

          <div>
            <span>
              Pagas
            </span>

            <strong>
              {
                dados.pagas
                  .length
              }
            </strong>

            <small>
              {formatarMoeda(
                dados.totalPago
              )}
            </small>
          </div>
        </article>

        <article className="conta-resumo-card">
          <span className="conta-resumo-icone dourado">
            ◷
          </span>

          <div>
            <span>
              Pendentes
            </span>

            <strong>
              {
                dados.pendentes
                  .length
              }
            </strong>

            <small>
              {formatarMoeda(
                dados.totalPendente
              )}
            </small>
          </div>
        </article>

        <article className="conta-resumo-card">
          <span className="conta-resumo-icone coral">
            !
          </span>

          <div>
            <span>
              Atrasadas
            </span>

            <strong>
              {
                dados.atrasadas
                  .length
              }
            </strong>

            <small>
              precisam de atenção
            </small>
          </div>
        </article>
      </section>

      {dados.proximas.length >
        0 && (
        <section className="contas-alerta">
          <div>
            <span className="contas-alerta-icone">
              🔔
            </span>

            <div>
              <strong>
                Próximos vencimentos
              </strong>

              <p>
                Existem{" "}
                {
                  dados.proximas
                    .length
                }{" "}
                contas pendentes com
                vencimento nos próximos
                7 dias.
              </p>
            </div>
          </div>

          <div className="contas-alerta-lista">
            {dados.proximas
              .slice(0, 3)
              .map(
                (conta) => (
                  <span
                    key={
                      conta.id
                    }
                  >
                    {
                      conta.descricao
                    }
                    {" • "}
                    {formatarData(
                      conta.vencimento
                    )}
                  </span>
                )
              )}
          </div>
        </section>
      )}

      <section className="contas-lista-box">
        <div className="contas-lista-topo">
          <div>
            <span>
              Caderno do mês
            </span>

            <h2>
              Lista de contas
            </h2>

            <p>
              Marque como pago conforme
              concluir cada compromisso.
            </p>
          </div>

          <div className="contas-filtros">
            <button
              type="button"
              className={
                filtro ===
                "todas"
                  ? "ativo"
                  : ""
              }
              onClick={() =>
                setFiltro(
                  "todas"
                )
              }
            >
              Todas
            </button>

            <button
              type="button"
              className={
                filtro ===
                "pendentes"
                  ? "ativo"
                  : ""
              }
              onClick={() =>
                setFiltro(
                  "pendentes"
                )
              }
            >
              Pendentes
            </button>

            <button
              type="button"
              className={
                filtro ===
                "pagas"
                  ? "ativo"
                  : ""
              }
              onClick={() =>
                setFiltro(
                  "pagas"
                )
              }
            >
              Pagas
            </button>

            <button
              type="button"
              className={
                filtro ===
                "atrasadas"
                  ? "ativo"
                  : ""
              }
              onClick={() =>
                setFiltro(
                  "atrasadas"
                )
              }
            >
              Atrasadas
            </button>
          </div>
        </div>

        {dados.lista.length ===
        0 ? (
          <div className="contas-vazio">
            <span>
              🧾
            </span>

            <h3>
              Nenhuma conta nesta lista
            </h3>

            <p>
              Adicione seus compromissos
              para acompanhar os
              vencimentos do mês.
            </p>

            <button
              type="button"
              onClick={
                abrirNovaConta
              }
            >
              + Adicionar conta
            </button>
          </div>
        ) : (
          <div className="contas-lista">
            {dados.lista.map(
              (conta) => {
                const status =
                  obterStatus(
                    conta
                  );

                return (
                  <article
                    key={
                      conta.id
                    }
                    className={`conta-item ${status.tipo}`}
                  >
                    <span className="conta-item-icone">
                      {conta.pago
                        ? "✓"
                        : "◷"}
                    </span>

                    <div className="conta-item-identidade">
                      <strong>
                        {
                          conta.descricao
                        }
                      </strong>

                      <span>
                        {conta.instituicao ||
                          conta.categoria}
                      </span>
                    </div>

                    <div className="conta-item-vencimento">
                      <span>
                        Vencimento
                      </span>

                      <strong>
                        {formatarData(
                          conta.vencimento
                        )}
                      </strong>
                    </div>

                    <strong className="conta-item-valor">
                      {formatarMoeda(
                        conta.valor
                      )}
                    </strong>

                    <div className="conta-item-status">
                      <span
                        className={`status-chip ${status.tipo}`}
                      >
                        {
                          status.titulo
                        }
                      </span>

                      <small>
                        {
                          status.texto
                        }
                      </small>
                    </div>

                    <div className="conta-item-acoes">
                      {!conta.pago ? (
                        <button
                          type="button"
                          className="pagar"
                          onClick={() =>
                            marcarComoPago(
                              conta
                            )
                          }
                        >
                          Marcar pago
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            marcarComoPendente(
                              conta
                            )
                          }
                        >
                          Reabrir
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          editarConta(
                            conta
                          )
                        }
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="excluir"
                        onClick={() =>
                          excluirConta(
                            conta.id
                          )
                        }
                      >
                        Excluir
                      </button>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </section>

      <section className="contas-rodape-informativo">
        <span>
          🌱
        </span>

        <div>
          <strong>
            Mais clareza antes de gastar
          </strong>

          <p>
            Na próxima etapa, as contas
            pendentes serão consideradas
            no cálculo do valor livre
            projetado do mês.
          </p>
        </div>
      </section>
    </div>
  );
}