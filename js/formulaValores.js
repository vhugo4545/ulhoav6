function preencherValoresFinanceiros(blocoId) {
  const bloco = document.getElementById(blocoId);

  if (!bloco) {
    console.warn(`Bloco ${blocoId} não encontrado.`);
    return;
  }

  const inputs = bloco.querySelectorAll('input[name]');
  const dados = {};

  // Coletar valores dos inputs
  inputs.forEach(input => {
    const nome = input.name;
    const valor = input.value.trim().replace(',', '.').replace('R$', '');
    dados[nome] = parseFloat(valor) || 0;
  });

  // Extrair percentuais
  const impostos = dados.impostos / 100;
  const margemLucro = dados.margem_lucro / 100;
  const gastosTotais = dados.gasto_operacional / 100;
  const negociacao = dados.margem_negociacao / 100;
  console.log("negociação", negociacao  )
  const miudezas = dados.miudezas / 100;
  const comissaoArquiteta = dados.comissao_arquiteta / 100;
  const margemSegunraca = dados.margem_seguranca / 100;
  // Obter total da tabela (soma da coluna "Valor de Custo Final")
  const tabela = bloco.querySelector("table");
  let materialBase = 0;
  tabela.querySelectorAll("tbody tr").forEach(linha => {
    const valorStr = linha.querySelector(".custo-unitario")?.textContent?.replace("R$", "").replace(",", ".");
    const valor = parseFloat(valorStr || 0);
    materialBase += valor;
  });


  // Custo total de material com miudezas
  const custoMaterial = materialBase * (1 + miudezas);

  const divisor = 1 - (gastosTotais + margemLucro + impostos);
  if (divisor <= 0) {
    console.error("❌ Erro: soma dos percentuais maior ou igual a 100%");
    return;
  }

  // Fórmula: custo de material / (1 - gastosTotais - margemLucro - impostos) * (1 + comissaoArquiteta)
  const precoMinimo = (custoMaterial / (1- gastosTotais -margemLucro - impostos )) * (1 + (comissaoArquiteta + margemSegunraca));
  const negociacao1 =  negociacao
  const precoSugerido = precoMinimo * (1 + negociacao1 );

  // Preencher os campos no HTML
  const inputMin = bloco.querySelector('input[name="precoMinimo"]');
  const inputSug = bloco.querySelector('input[name="precoSugerido"]');
  const inputCusto = bloco.querySelector('input[name="custoTotalMaterial"]');

  if (inputMin) inputMin.value = precoMinimo.toFixed(2);
  if (inputSug) inputSug.value = precoSugerido.toFixed(2);
  if (inputCusto) inputCusto.value = custoMaterial.toFixed(2);

  // Atualizar total no rodapé da tabela
  const totalRodape = bloco.querySelector('table tfoot td[colspan="6"] strong');
  if (totalRodape) totalRodape.textContent = `R$ ${precoSugerido.toFixed(2)}`;

  // Mostrar no console os valores detalhados
  const valorImpostos = precoMinimo * impostos;
  const valorMargem = precoMinimo * margemLucro;
  const valorGastos = precoMinimo * gastosTotais;
  const valorComissao = precoMinimo * comissaoArquiteta;
  const valorNegociacao = precoMinimo * negociacao;
  const valorMiudezas = materialBase * miudezas;

  }

// 🔁 Ativa o recálculo automático ao alterar qualquer input[name]
document.addEventListener('input', function (e) {
  const input = e.target;
  if (input.matches('input[name]')) {
    const bloco = input.closest('.main-container');
    if (bloco && bloco.id) {
      preencherValoresFinanceiros(bloco.id);
    }
  }
});

// Pare aqui
function criarBlocoDeProposta(nomeGrupo = "", ambiente = "") {
  const idSuffix = `bloco-${blocoIndex++}`;
  const container = document.getElementById("blocosProdutosContainer");
  if (!container) {
    console.warn("❌ Container #blocosProdutosContainer não encontrado.");
    return idSuffix;
  }

  const estaEditandoModelo = window.location.pathname.includes("editarModelo.html");

  const parametros = [
    "miudezas", "gasto_operacional", "impostos", "margem_lucro",
    "margem_seguranca", "comissao_arquiteta", "margem_negociacao",
    "altura_montante", "numero_montantes", "numero_protecoes", "descricao"
  ];

  const camposFinanceiros = [
    { label: "Custo Total de Material", name: "custoTotalMaterial" },
    { label: "Preço Mínimo", name: "precoMinimo" },
    { label: "Preço Sugerido", name: "precoSugerido" }
  ];

  const bloco = document.createElement("div");
  bloco.className = "main-container position-relative mb-4";
  bloco.id = idSuffix;

  bloco.innerHTML = `
    <div class="accordion" id="accordion-${idSuffix}">
      <div class="accordion-item">
        <h2 class="accordion-header" id="heading-${idSuffix}">
          <div class="d-flex align-items-center justify-content-between px-2 w-100">
            <button class="accordion-button collapsed flex-grow-1" type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapse-${idSuffix}"
              aria-expanded="false"
              aria-controls="collapse-${idSuffix}">
              <span id="titulo-accordion-${idSuffix}">
                ${nomeGrupo || `Grupo (${idSuffix})`}
              </span>
            </button>
            <div class="d-flex align-items-center gap-2 ms-4">
              <input
                type="text"
                class="form-control form-control-sm"
                placeholder="Ambiente"
                value="${ambiente || ""}"
                data-id-grupo="${idSuffix}"
                title="Digite o nome do ambiente"
                ${estaEditandoModelo ? 'style="display:none;"' : ''}
              >
              <button class="btn btn-outline-danger btn-sm" type="button" onclick="removerBloco('${idSuffix}')" title="Excluir grupo">Excluir</button>
            </div>
          </div>
        </h2>
        <div id="collapse-${idSuffix}" class="accordion-collapse collapse" data-bs-parent="#accordion-${idSuffix}">
          <div class="accordion-body">
            <div class="row g-3">
              <div class="col-lg-4">
                <ul class="nav nav-tabs">
                  <li class="nav-item">
                    <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#${idSuffix}-aba1">Parâmetros</button>
                  </li>
                  <li class="nav-item">
                    <button class="nav-link" data-bs-toggle="tab" data-bs-target="#${idSuffix}-aba2">Valores R$</button>
                  </li>
                </ul>
                <div class="tab-content pt-3">
                  <div class="tab-pane fade show active" id="${idSuffix}-aba1">
                    <form class="row g-2">
                      ${parametros.map(param => `
                        <div class="col-6">
                          <label class="form-label">${param.replace(/_/g, ' ')}</label>
                          <input type="text" name="${param}" class="form-control form-control-sm"
                            ${(!estaEditandoModelo && !["altura_montante", "numero_montantes", "numero_protecoes", "descricao","comissao_arquiteta","margem_negociacao"].includes(param))
                              ? "readonly style='background:#f3f3f3'" : ""}>
                        </div>
                      `).join("")}
                    </form>
                  </div>
                  <div class="tab-pane fade" id="${idSuffix}-aba2">
                    <form class="row g-2">
                      ${camposFinanceiros.map(campo => `
                        <div class="col-12">
                          <label class="form-label">${campo.label}</label>
                          <input type="text" name="${campo.name}" class="form-control form-control-sm"
                            ${!estaEditandoModelo ? "readonly style='background:#f3f3f3'" : ""}>
                        </div>
                      `).join("")}
                    </form>
                  </div>
                </div>
              </div>
              <div class="col-lg-8 grupo-tabela position-relative">
                <div class="input-group mb-3">
                  <input id="input-${idSuffix}" type="text" class="form-control form-control-sm"
                         placeholder="Pesquisar e incluir produto..."
                         oninput="mostrarSugestoes(this, '${idSuffix}')">
                  <button class="btn btn-primary btn-sm" type="button" onclick="incluirProduto('${idSuffix}')">Incluir</button>
                </div>
                <div id="sugestoes-${idSuffix}" class="tabela-sugestoes position-absolute bg-white shadow-sm" style="z-index:1000;"></div>
                <div class="table-responsive">
                  <table id="tabela-${idSuffix}" class="table table-sm table-bordered">
                    <thead class="table-light">
                      <tr>
                        <th>Utilização</th>
                        <th>Descrição</th>
                        <th>Valor de Custo Final</th>
                        <th>Custo Unitário</th>
                        <th>Código Omie</th>
                        <th>Quantidade</th>
                        <th>Qtd. Desejada</th>
                        <th>Ação</th>
                      </tr>
                    </thead>
                    <tbody ondragover="event.preventDefault();" ondrop="handleDrop(event)"></tbody>
                    <tfoot>
                      <tr>
                        <td colspan="2"><strong>Total</strong></td>
                        <td colspan="6"><strong>R$ 0,00</strong></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  container.appendChild(bloco);

  const tbody = bloco.querySelector("tbody");
  if (tbody) {
    const observer = new MutationObserver(() => {
      const linhas = tbody.querySelectorAll("tr");
      linhas.forEach(linha => {
        if (!linha.hasAttribute("draggable")) {
          linha.setAttribute("draggable", "true");
          linha.addEventListener("dragstart", () => linha.classList.add("dragging"));
          linha.addEventListener("dragend", () => linha.classList.remove("dragging"));
        }
      });
    });
    observer.observe(tbody, { childList: true });
  }

  setTimeout(() => {
    if (typeof ativarRecalculoEmTodasTabelas === "function") ativarRecalculoEmTodasTabelas();
    if (typeof preencherValoresFinanceiros === "function") preencherValoresFinanceiros(idSuffix);
    if (typeof simularFocusEBlurEmTodosCamposFormula === "function") simularFocusEBlurEmTodosCamposFormula();
  }, 1000);

  return idSuffix;
}



// Função de drop que move as linhas
function handleDrop(event) {
  event.preventDefault();
  const dragged = document.querySelector(".dragging");
  const targetRow = event.target.closest("tr");
  if (!dragged || !targetRow || dragged === targetRow) return;

  const tbody = targetRow.closest("tbody");
  const rows = Array.from(tbody.querySelectorAll("tr"));
  const fromIndex = rows.indexOf(dragged);
  const toIndex = rows.indexOf(targetRow);

  if (fromIndex < toIndex) {
    targetRow.after(dragged);
  } else {
    targetRow.before(dragged);
  }
}



function ativarRecalculoEmTodasTabelas() {
  const tabelas = document.querySelectorAll("table[id^='tabela-bloco-']");
  console.log(`🔍 Encontradas ${tabelas.length} tabelas para recalcular`);

  tabelas.forEach((tabela, index) => {
    console.log(`📊 Tabela ${index + 1} ID: ${tabela.id}`);

    const atualizarLinha = (linha, tentativa = 0) => {
      const custoFinalCell = linha.querySelector(".custo-unitario");
      const custoUnitarioCell = linha.querySelector(".venda-unitaria");
      const inputQuantidade = linha.querySelector("input.quantidade");

      if (!custoFinalCell || !custoUnitarioCell || !inputQuantidade) {
        if (tentativa < 1) {
          console.warn("⚠️ Elemento ausente na linha. Tentando novamente em 2 segundos...", { custoFinalCell, custoUnitarioCell, inputQuantidade });
          setTimeout(() => atualizarLinha(linha, tentativa + 1), 2000);
        } else {
          console.error("❌ Elementos ainda ausentes após nova tentativa:", { custoFinalCell, custoUnitarioCell, inputQuantidade });
        }
        return;
      }

      const quantidade = parseFloat(inputQuantidade.value.replace(",", ".") || 1);
      const custoUnitario = parseFloat(

        custoUnitarioCell.textContent.replace("R$", "").replace(",", ".") ||
        0
      );

      const custoFinal = custoUnitario * quantidade;
      custoFinalCell.textContent = `R$ ${custoFinal.toFixed(2)}`;

      console.log(`✅ Linha atualizada - Qtd: ${quantidade}, Unitário: ${custoUnitario}, Final: ${custoFinal}`);
    };

    const atualizarTotalTabela = (tabela) => {
      let total = 0;
      tabela.querySelectorAll("tbody tr").forEach(linha => {
        const valorStr = linha.querySelector(".custo-unitario")?.textContent?.replace("R$", "").replace(",", ".");
        const valor = parseFloat(valorStr || 0);
        total += valor;
      });
      const totalCell = tabela.querySelector("tfoot td strong");
      if (totalCell) {
        totalCell.textContent = `R$ ${total.toFixed(2)}`;
        console.log(`💰 Total da tabela ${tabela.id}: R$ ${total.toFixed(2)}`);
      }
    };

    // Escuta mudanças no campo .quantidade
    tabela.querySelectorAll("input.quantidade").forEach(input => {
      const linha = input.closest("tr");
      if (!linha) {
        console.warn("⚠️ Linha não encontrada para input.quantidade");
        return;
      }

     input.addEventListener("input", () => {
    atualizarLinha(linha);
    atualizarTotalTabela(tabela);

  const grupoId = tabela.id.replace("tabela-", ""); // ex: "tabela-bloco-0" → "bloco-0"
  console.log("📦 Grupo ID:", grupoId);

  preencherValoresFinanceiros(grupoId);
});


      atualizarLinha(linha); // Executa ao carregar
      console.log(`📌 Listener adicionado ao input.quantidade`);
    });

    // Salva valor original de custo unitário
    tabela.querySelectorAll("tbody tr").forEach(linha => {
      const cell = linha.querySelector(".venda-unitaria");
      if (cell && !cell.dataset.valorOriginal) {
        const val = cell.textContent.replace("R$", "").replace(",", ".").trim();
        cell.dataset.valorOriginal = parseFloat(val || 0);
        console.log(`🗃️ Valor original salvo: ${cell.dataset.valorOriginal}`);
      }
    });

    atualizarTotalTabela(tabela); // Total inicial
  });
}
