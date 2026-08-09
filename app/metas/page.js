"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

const CHAVE_METAS =
  "conquistia-metas-v1";

const iconesDisponiveis = [
  "🎯",
  "✈️",
  "🏠",
  "💻",
  "📚",
  "🎉",
  "🚗",
  "🌱",
  "⭐",
  "🎁",
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

function formatarData(data) {
  if (!data) {
    return "Sem prazo";
  }

  const partes = data.split("-");

  if (partes.length !== 3) {
    return data;
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function calcularMesesRestantes(data) {
  if (!data) {
    return null;
  }

  const hoje = new Date();

  const destino = new Date(
    `${data}T12:00:00`
  );

  if (
    Number.isNaN(destino.getTime())
  ) {
    return null;
  }

  const diferenca =
    destino.getTime() -
    hoje.getTime();

  if (diferenca <= 0) {
    return 0;
  }

  const dias =
    Math.ceil(
      diferenca /
        (1000 * 60 * 60 * 24)
    );

  return Math.max(
    1,
    Math.ceil(dias / 30)
  );
}

function carregarMetas() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const dados =
      window.localStorage.getItem(
        CHAVE_METAS
      );

    if (!dados) {
      return [];
    }

    const metas =
      JSON.parse(dados);

    return Array.isArray(metas)
      ? metas
      : [];
  } catch (erro) {
    console.error(
      "Erro ao carregar metas:",
      erro
    );

    return [];
  }
}

function salvarMetas(metas) {
  try {
    window.localStorage.setItem(
      CHAVE_METAS,
      JSON.stringify(metas)
    );

    return true;
  } catch (erro) {
    console.error(
      "Erro ao salvar metas:",
      erro
    );

    return false;
  }
}

export default function MetasPage() {
  const [metas, setMetas] =
    useState([]);

  const [carregado, setCarregado] =
    useState(false);

  const [formularioAberto, setFormularioAberto] =
    useState(false);

  const [metaEmEdicao, setMetaEmEdicao] =
    useState(null);

  const [metaRecebendoAvanco, setMetaRecebendoAvanco] =
    useState(null);

  const [valorAvanco, setValorAvanco] =
    useState("");

  const [mensagem, setMensagem] =
    useState("");

  const [erro, setErro] =
    useState("");

  const [formulario, setFormulario] =
    useState({
      nome: "",
      descricao: "",
      valorObjetivo: "",
      valorAtual: "",
      prazo: "",
      icone: "🎯",
    });

  useEffect(() => {
    setMetas(
      carregarMetas()
    );

    setCarregado(true);
  }, []);

  const resumo = useMemo(() => {
    const totalObjetivos =
      metas.reduce(
        (soma, meta) =>
          soma +
          Number(
            meta.valorObjetivo || 0
          ),
        0
      );

    const totalProgresso =
      metas.reduce(
        (soma, meta) =>
          soma +
          Number(
            meta.valorAtual || 0
          ),
        0
      );

    const concluidas =
      metas.filter(
        (meta) =>
          Number(meta.valorAtual) >=
          Number(meta.valorObjetivo)
      ).length;

    const ativas =
      metas.length - concluidas;

    const progressoGeral =
      totalObjetivos > 0
        ? Math.min(
            100,
            (totalProgresso /
              totalObjetivos) *
              100
          )
        : 0;

    return {
      totalObjetivos,
      totalProgresso,
      concluidas,
      ativas,
      progressoGeral,
    };
  }, [metas]);

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

  function limparFormulario() {
    setFormulario({
      nome: "",
      descricao: "",
      valorObjetivo: "",
      valorAtual: "",
      prazo: "",
      icone: "🎯",
    });

    setMetaEmEdicao(null);
  }

  function abrirNovaMeta() {
    limparFormulario();
    setFormularioAberto(true);
    setErro("");
    setMensagem("");
  }

  function fecharFormulario() {
    setFormularioAberto(false);
    limparFormulario();
    setErro("");
  }

  function salvarMeta(evento) {
    evento.preventDefault();

    const nome =
      formulario.nome.trim();

    const valorObjetivo =
      Number(
        String(
          formulario.valorObjetivo
        ).replace(",", ".")
      );

    const valorAtual =
      Number(
        String(
          formulario.valorAtual || 0
        ).replace(",", ".")
      );

    if (!nome) {
      setErro(
        "Informe o nome da meta."
      );

      return;
    }

    if (
      !Number.isFinite(
        valorObjetivo
      ) ||
      valorObjetivo <= 0
    ) {
      setErro(
        "Informe um valor de objetivo maior que zero."
      );

      return;
    }

    if (
      !Number.isFinite(valorAtual) ||
      valorAtual < 0
    ) {
      setErro(
        "Informe um valor atual válido."
      );

      return;
    }

    const agora =
      new Date().toISOString();

    let novasMetas;

    if (metaEmEdicao) {
      novasMetas = metas.map(
        (meta) =>
          meta.id ===
          metaEmEdicao.id
            ? {
                ...meta,
                nome,
                descricao:
                  formulario.descricao.trim(),
                valorObjetivo,
                valorAtual:
                  Math.min(
                    valorAtual,
                    valorObjetivo
                  ),
                prazo:
                  formulario.prazo,
                icone:
                  formulario.icone,
                atualizadoEm: agora,
              }
            : meta
      );
    } else {
      novasMetas = [
        {
          id: gerarId(),
          nome,
          descricao:
            formulario.descricao.trim(),
          valorObjetivo,
          valorAtual:
            Math.min(
              valorAtual,
              valorObjetivo
            ),
          prazo:
            formulario.prazo,
          icone:
            formulario.icone,
          criadaEm: agora,
          historico: [],
        },
        ...metas,
      ];
    }

    if (!salvarMetas(novasMetas)) {
      setErro(
        "Não foi possível salvar a meta neste navegador."
      );

      return;
    }

    setMetas(novasMetas);

    setMensagem(
      metaEmEdicao
        ? "A meta foi atualizada."
        : "Sua nova meta foi criada."
    );

    fecharFormulario();
  }

  function editarMeta(meta) {
    setMetaEmEdicao(meta);

    setFormulario({
      nome: meta.nome || "",
      descricao:
        meta.descricao || "",
      valorObjetivo:
        String(
          meta.valorObjetivo || ""
        ),
      valorAtual:
        String(
          meta.valorAtual || ""
        ),
      prazo: meta.prazo || "",
      icone: meta.icone || "🎯",
    });

    setFormularioAberto(true);
    setMensagem("");
    setErro("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function excluirMeta(id) {
    const confirmar =
      window.confirm(
        "Deseja excluir esta meta?"
      );

    if (!confirmar) {
      return;
    }

    const novasMetas =
      metas.filter(
        (meta) => meta.id !== id
      );

    if (!salvarMetas(novasMetas)) {
      setErro(
        "Não foi possível excluir a meta."
      );

      return;
    }

    setMetas(novasMetas);
    setMensagem(
      "A meta foi excluída."
    );
  }

  function abrirAvanco(meta) {
    setMetaRecebendoAvanco(meta);
    setValorAvanco("");
    setErro("");
    setMensagem("");
  }

  function cancelarAvanco() {
    setMetaRecebendoAvanco(null);
    setValorAvanco("");
  }

  function salvarAvanco(evento) {
    evento.preventDefault();

    if (!metaRecebendoAvanco) {
      return;
    }

    const valor =
      Number(
        String(valorAvanco)
          .replace(",", ".")
      );

    if (
      !Number.isFinite(valor) ||
      valor <= 0
    ) {
      setErro(
        "Informe um valor de avanço maior que zero."
      );

      return;
    }

    const novasMetas =
      metas.map((meta) => {
        if (
          meta.id !==
          metaRecebendoAvanco.id
        ) {
          return meta;
        }

        const novoValor =
          Math.min(
            Number(meta.valorAtual || 0) +
              valor,
            Number(
              meta.valorObjetivo || 0
            )
          );

        return {
          ...meta,
          valorAtual: novoValor,
          atualizadoEm:
            new Date().toISOString(),
          historico: [
            ...(Array.isArray(
              meta.historico
            )
              ? meta.historico
              : []),
            {
              id: gerarId(),
              valor,
              data:
                obterDataAtual(),
            },
          ],
        };
      });

    if (!salvarMetas(novasMetas)) {
      setErro(
        "Não foi possível registrar o avanço."
      );

      return;
    }

    const metaAtualizada =
      novasMetas.find(
        (meta) =>
          meta.id ===
          metaRecebendoAvanco.id
      );

    setMetas(novasMetas);

    setMensagem(
      Number(
        metaAtualizada.valorAtual
      ) >=
        Number(
          metaAtualizada.valorObjetivo
        )
        ? `Parabéns! A meta ${metaAtualizada.nome} foi concluída.`
        : `Seu avanço em ${metaAtualizada.nome} foi registrado.`
    );

    cancelarAvanco();
  }

  function obterLeituraMeta(meta) {
    const objetivo =
      Number(
        meta.valorObjetivo || 0
      );

    const atual =
      Number(
        meta.valorAtual || 0
      );

    const falta =
      Math.max(
        0,
        objetivo - atual
      );

    const percentual =
      objetivo > 0
        ? Math.min(
            100,
            (atual / objetivo) *
              100
          )
        : 0;

    const meses =
      calcularMesesRestantes(
        meta.prazo
      );

    const mediaNecessaria =
      meses &&
      meses > 0
        ? falta / meses
        : null;

    return {
      falta,
      percentual,
      meses,
      mediaNecessaria,
      concluida:
        atual >= objetivo,
    };
  }

  return (
    <div className="metas-pagina">
      <section className="metas-apresentacao">
        <div>
          <span className="metas-etiqueta">
            Dê propósito à sua organização
          </span>

          <h1>
            Transforme objetivos em caminhos
            visíveis
          </h1>

          <p>
            Crie metas pessoais e acompanhe
            pequenos avanços. Nenhum dado
            bancário ou informação pessoal
            sensível é necessário.
          </p>
        </div>

        <button
          type="button"
          className="botao-nova-meta"
          onClick={abrirNovaMeta}
        >
          <span>+</span>
          Criar nova meta
        </button>
      </section>

      <section className="metas-principio">
        <span>✓</span>

        <p>
          As metas são representações visuais.
          O ConquistIA não movimenta dinheiro,
          não recomenda empréstimos e não
          indica investimentos.
        </p>
      </section>

      {erro && (
        <div className="metas-mensagem erro">
          <span>!</span>
          <p>{erro}</p>
        </div>
      )}

      {mensagem && (
        <div className="metas-mensagem sucesso">
          <span>✓</span>
          <p>{mensagem}</p>
        </div>
      )}

      {formularioAberto && (
        <section className="meta-formulario-bloco">
          <div className="meta-formulario-cabecalho">
            <div>
              <span>
                {metaEmEdicao
                  ? "Alterar objetivo"
                  : "Novo objetivo"}
              </span>

              <h2>
                {metaEmEdicao
                  ? "Editar meta"
                  : "Criar uma meta"}
              </h2>

              <p>
                Use apenas informações que você
                se sinta confortável em
                registrar.
              </p>
            </div>

            <button
              type="button"
              className="meta-formulario-fechar"
              onClick={fecharFormulario}
              aria-label="Fechar formulário"
            >
              ×
            </button>
          </div>

          <form
            className="meta-formulario"
            onSubmit={salvarMeta}
          >
            <div className="meta-campo meta-campo-nome">
              <label htmlFor="nome">
                Nome da meta
              </label>

              <input
                id="nome"
                name="nome"
                type="text"
                value={formulario.nome}
                onChange={atualizarCampo}
                placeholder="Ex.: viagem, curso ou computador"
                maxLength={70}
              />
            </div>

            <div className="meta-campo">
              <label htmlFor="valorObjetivo">
                Valor do objetivo
              </label>

              <input
                id="valorObjetivo"
                name="valorObjetivo"
                type="number"
                min="0.01"
                step="0.01"
                value={
                  formulario.valorObjetivo
                }
                onChange={atualizarCampo}
                placeholder="0,00"
              />
            </div>

            <div className="meta-campo">
              <label htmlFor="valorAtual">
                Progresso inicial
              </label>

              <input
                id="valorAtual"
                name="valorAtual"
                type="number"
                min="0"
                step="0.01"
                value={
                  formulario.valorAtual
                }
                onChange={atualizarCampo}
                placeholder="0,00"
              />
            </div>

            <div className="meta-campo">
              <label htmlFor="prazo">
                Prazo opcional
              </label>

              <input
                id="prazo"
                name="prazo"
                type="date"
                value={formulario.prazo}
                onChange={atualizarCampo}
              />
            </div>

            <div className="meta-campo meta-campo-descricao">
              <label htmlFor="descricao">
                Por que essa meta importa?
              </label>

              <textarea
                id="descricao"
                name="descricao"
                value={
                  formulario.descricao
                }
                onChange={atualizarCampo}
                placeholder="Escreva uma frase curta sobre o significado desta conquista."
                maxLength={180}
                rows={3}
              />
            </div>

            <div className="meta-campo meta-campo-icone">
              <label>
                Escolha um símbolo
              </label>

              <div className="icones-meta">
                {iconesDisponiveis.map(
                  (icone) => (
                    <button
                      type="button"
                      key={icone}
                      className={
                        formulario.icone ===
                        icone
                          ? "icone-meta ativo"
                          : "icone-meta"
                      }
                      onClick={() =>
                        setFormulario(
                          (estadoAtual) => ({
                            ...estadoAtual,
                            icone,
                          })
                        )
                      }
                    >
                      {icone}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="meta-formulario-acoes">
              <button
                type="button"
                className="meta-cancelar"
                onClick={fecharFormulario}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="meta-salvar"
              >
                {metaEmEdicao
                  ? "Salvar alterações"
                  : "Criar meta"}
              </button>
            </div>
          </form>
        </section>
      )}

      {metaRecebendoAvanco && (
        <section className="avanco-bloco">
          <div>
            <span>
              Registrar evolução
            </span>

            <h2>
              {metaRecebendoAvanco.icone}{" "}
              {metaRecebendoAvanco.nome}
            </h2>

            <p>
              Informe apenas o valor que deseja
              adicionar ao progresso visual.
            </p>
          </div>

          <form
            onSubmit={salvarAvanco}
            className="avanco-formulario"
          >
            <label htmlFor="valorAvanco">
              Valor do avanço
            </label>

            <input
              id="valorAvanco"
              type="number"
              min="0.01"
              step="0.01"
              value={valorAvanco}
              onChange={(evento) => {
                setValorAvanco(
                  evento.target.value
                );

                setErro("");
              }}
              placeholder="0,00"
              autoFocus
            />

            <div>
              <button
                type="button"
                onClick={cancelarAvanco}
                className="avanco-cancelar"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="avanco-salvar"
              >
                Registrar avanço
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="metas-resumo-grid">
        <article className="meta-resumo-card">
          <span className="meta-resumo-icone verde">
            ◎
          </span>

          <div>
            <p>Metas ativas</p>
            <strong>
              {resumo.ativas}
            </strong>
          </div>
        </article>

        <article className="meta-resumo-card">
          <span className="meta-resumo-icone dourado">
            ★
          </span>

          <div>
            <p>Metas concluídas</p>
            <strong>
              {resumo.concluidas}
            </strong>
          </div>
        </article>

        <article className="meta-resumo-card">
          <span className="meta-resumo-icone azul">
            ↗
          </span>

          <div>
            <p>Progresso registrado</p>
            <strong>
              {formatarMoeda(
                resumo.totalProgresso
              )}
            </strong>
          </div>
        </article>

        <article className="meta-resumo-card">
          <span className="meta-resumo-icone rosa">
            %
          </span>

          <div>
            <p>Evolução geral</p>
            <strong>
              {resumo.progressoGeral.toFixed(
                1
              )}
              %
            </strong>
          </div>
        </article>
      </section>

      <section className="metas-conteudo">
        <div className="metas-conteudo-cabecalho">
          <div>
            <span>
              Sua linha de conquistas
            </span>

            <h2>
              Objetivos cadastrados
            </h2>

            <p>
              Cada avanço conta, mesmo quando
              pequeno.
            </p>
          </div>

          <span className="metas-contador">
            {metas.length}{" "}
            {metas.length === 1
              ? "meta"
              : "metas"}
          </span>
        </div>

        {!carregado ? (
          <div className="metas-vazio">
            <span>◌</span>
            <h3>Carregando suas metas</h3>
            <p>
              Estamos preparando sua jornada.
            </p>
          </div>
        ) : metas.length === 0 ? (
          <div className="metas-vazio">
            <span>🎯</span>

            <h3>
              Sua primeira conquista começa
              aqui
            </h3>

            <p>
              Crie uma meta simples e acompanhe
              sua evolução visualmente.
            </p>

            <button
              type="button"
              className="metas-vazio-botao"
              onClick={abrirNovaMeta}
            >
              Criar primeira meta
            </button>
          </div>
        ) : (
          <div className="metas-listagem">
            {metas.map((meta) => {
              const leitura =
                obterLeituraMeta(meta);

              return (
                <article
                  key={meta.id}
                  className={
                    leitura.concluida
                      ? "meta-card concluida"
                      : "meta-card"
                  }
                >
                  <div className="meta-card-topo">
                    <span className="meta-card-icone">
                      {meta.icone}
                    </span>

                    <div className="meta-card-identidade">
                      <span>
                        {leitura.concluida
                          ? "Meta concluída"
                          : "Meta em andamento"}
                      </span>

                      <h3>{meta.nome}</h3>

                      <p>
                        {meta.descricao ||
                          "Um objetivo importante para sua jornada."}
                      </p>
                    </div>

                    <strong className="meta-card-percentual">
                      {leitura.percentual.toFixed(
                        0
                      )}
                      %
                    </strong>
                  </div>

                  <div className="meta-card-barra">
                    <span
                      style={{
                        width: `${leitura.percentual}%`,
                      }}
                    />
                  </div>

                  <div className="meta-card-valores">
                    <div>
                      <span>
                        Progresso
                      </span>

                      <strong>
                        {formatarMoeda(
                          meta.valorAtual
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Objetivo
                      </span>

                      <strong>
                        {formatarMoeda(
                          meta.valorObjetivo
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Ainda falta
                      </span>

                      <strong>
                        {formatarMoeda(
                          leitura.falta
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Prazo
                      </span>

                      <strong>
                        {formatarData(
                          meta.prazo
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="meta-card-leitura">
                    <span>💡</span>

                    <p>
                      {leitura.concluida
                        ? "Você concluiu esta meta. Essa conquista já faz parte da sua história."
                        : leitura.mediaNecessaria
                          ? `Mantendo uma média aproximada de ${formatarMoeda(
                              leitura.mediaNecessaria
                            )} por mês, esta meta poderá avançar dentro do prazo informado.`
                          : "Continue registrando pequenos avanços. Não é necessário ter um prazo para acompanhar sua evolução."}
                    </p>
                  </div>

                  <div className="meta-card-acoes">
                    {!leitura.concluida && (
                      <button
                        type="button"
                        className="meta-adicionar-avanco"
                        onClick={() =>
                          abrirAvanco(meta)
                        }
                      >
                        Registrar avanço
                      </button>
                    )}

                    <button
                      type="button"
                      className="meta-editar"
                      onClick={() =>
                        editarMeta(meta)
                      }
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      className="meta-excluir"
                      onClick={() =>
                        excluirMeta(meta.id)
                      }
                    >
                      Excluir
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="metas-reflexao">
        <span className="metas-reflexao-icone">
          ✦
        </span>

        <div>
          <span>
            Organização com propósito
          </span>

          <h2>
            O que você quer tornar possível?
          </h2>

          <p>
            Uma meta não precisa representar
            privação. Ela ajuda a pessoa a
            enxergar quais escolhas deseja
            priorizar ao longo do tempo.
          </p>
        </div>
      </section>
    </div>
  );
}