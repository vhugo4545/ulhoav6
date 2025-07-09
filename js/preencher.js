let blocoIndex = 0;

// 🕓 Aguarda até que um elemento exista no DOM
function esperarElemento(seletor, tentativas = 20, intervalo = 300) {
  return new Promise((resolve, reject) => {
    const tentar = (vezesRestantes) => {
      const elemento = document.querySelector(seletor);
      if (elemento) return resolve(elemento);
      if (vezesRestantes <= 0) return reject(new Error(`Elemento "${seletor}" não encontrado.`));
      setTimeout(() => tentar(vezesRestantes - 1), intervalo);
    };
    tentar(tentativas);
  });
}

// 🔄 Exibe o loader
function mostrarLoader() {
  document.getElementById("loader-overlay")?.style.setProperty("display", "flex");
}

// ✅ Esconde o loader
function esconderLoader() {
  document.getElementById("loader-overlay")?.style.setProperty("display", "none");
}

// 📥 Extrai o ID da URL (?id=...)
function obterIdPropostaDaUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id") || "";
}

// ✅ Preenche os campos do formulário com os dados da proposta
async function carregarPropostaEditavel(proposta) {
  try {
    const campos = proposta.camposFormulario || {};
    const setIfExists = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.value = value ?? "";
      else console.warn(`⚠️ Campo com ID '${id}' não encontrado.`);
    };

    setIfExists("numeroOrcamento", campos.numeroOrcamento || proposta.numeroProposta);
    setIfExists("dataOrcamento", campos.dataOrcamento);
    setIfExists("origemCliente", campos.origemCliente);
    setIfExists("cep", campos.cep);
    setIfExists("rua", campos.rua);
    setIfExists("numero", campos.numero);
    setIfExists("complemento", campos.complemento);
    setIfExists("bairro", campos.bairro);
    setIfExists("cidade", campos.cidade);
    setIfExists("estado", campos.estado);
    setIfExists("vendedorResponsavel", campos.vendedorResponsavel);
    setIfExists("operadorInterno", campos.operadorInterno);

    console.log("✅ Proposta preenchida com sucesso.");
  } catch (erro) {
    console.error("❌ Erro ao preencher proposta:", erro);
    alert("Erro ao preencher dados da proposta.");
  }
}

// 📦 Busca e carrega a proposta por ID
async function localizarECarregarPropostaPorId() {
  const estaEditandoModelo = window.location.pathname.includes("editarModelo.html");

  const idDesejado = estaEditandoModelo
    ? "6851c413b30e3e4dda354132" // ID fixo para modo de edição de modelo
    : obterIdPropostaDaUrl();

  if (!idDesejado) {
    if (!estaEditandoModelo) {
      alert("❌ Nenhum ID informado na URL.");
    }
    return;
  }

  try {
    mostrarLoader();

    const url = `https://ulhoa-0a02024d350a.herokuapp.com/api/propostas/${idDesejado}`;
    console.log("🔍 Buscando proposta por ID:", url);

    const resposta = await fetch(url);
    if (!resposta.ok) {
      const msg = `Erro ${resposta.status} - ${resposta.statusText}`;
      throw new Error(msg);
    }

    const proposta = await resposta.json();

    if (!proposta || typeof proposta !== "object") {
      alert("❌ Proposta não encontrada ou inválida.");
      return;
    }

    console.log("✅ Proposta localizada:", proposta);

    await esperarElemento("#clientesWrapper");
    await esperarElemento("#blocosProdutosContainer");

    await carregarPropostaEditavel(proposta);

  } catch (erro) {
    console.error("❌ Erro ao localizar proposta:", erro);
   
  } finally {
    esconderLoader();
  }
}





function arredondarCimaSeguro(valor, context = {}) {
  if (valor === undefined || valor === null) return 1;

  try {
    // Se for fórmula (contém # ou operadores), tenta avaliar
    if (typeof valor === "string" && /[#*/+\-()]/.test(valor)) {
      if (typeof evaluateFormula === "function") {
        valor = evaluateFormula(valor, context);
      } else {
        console.warn("⚠️ evaluateFormula não está disponível.");
        return 1;
      }
    }

    // Substitui vírgula por ponto se for string
    const normalizado = typeof valor === "string" ? valor.replace(",", ".") : valor;
    const numero = parseFloat(normalizado);

    return Number.isFinite(numero) ? Math.ceil(numero) : 1;
  } catch (e) {
    console.warn("Erro ao arredondar valor:", valor, e);
    return 1;
  }
}


async function carregarPropostaEditavel(proposta) {
  try {
    if (!proposta || typeof proposta !== "object") throw new Error("Proposta inválida.");
console.log("propostas",proposta)
    const dados = proposta.camposFormulario || {};
    const setIfExists = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val ?? "";
      else console.warn(`⚠️ Campo com ID '${id}' não encontrado no DOM.`);
    };

    // 🧾 Campos do formulário
    setIfExists("numeroOrcamento", dados.numeroOrcamento || proposta.numeroProposta);
    setIfExists("dataOrcamento", dados.dataOrcamento);
    setIfExists("origemCliente", dados.origemCliente);
    setIfExists("cep", dados.cep);
    setIfExists("rua", dados.rua);
    setIfExists("numero", dados.numero);
    setIfExists("complemento", dados.complemento);
    setIfExists("bairro", dados.bairro);
    setIfExists("cidade", dados.cidade);
    setIfExists("estado", dados.estado);
    setIfExists("vendedorResponsavel", dados.vendedorResponsavel);
    setIfExists("operadorInterno", dados.operadorInterno);
    setIfExists("prazosArea", dados.prazosArea);
    setIfExists("condicaoPagamento", dados.condicaoPagamento);
    setIfExists("condicoesGerais", dados.condicoesGerais);

    // 👥 Clientes
    const containerClientes = document.getElementById("clientesWrapper");
    const clienteBase = containerClientes?.querySelector(".cliente-item");
    if (clienteBase) {
      containerClientes.querySelectorAll(".cliente-item:not(:first-child)").forEach(el => el.remove());
      (dados.clientes || []).forEach((cliente, i) => {
        const ref = i === 0 ? clienteBase : clienteBase.cloneNode(true);
        ref.querySelector(".razaoSocial").value = cliente.nome_razao_social || "";
        ref.querySelector(".nomeContato").value = cliente.nome_contato || "";
        ref.querySelector(".codigoCliente").value = cliente.codigoOmie || "";
        ref.querySelector(".cpfCnpj").value = cliente.cpfCnpj || "";
        ref.querySelector(".funcaoCliente").value = cliente.funcao || "";
        ref.querySelector(".telefoneCliente").value = cliente.telefone || "";
        if (i > 0) containerClientes.appendChild(ref);
      });
    }

    // 💳 Parcelas
    const containerParcelas = document.getElementById("listaParcelas");
    if (containerParcelas && Array.isArray(dados.parcelas)) {
      containerParcelas.innerHTML = "";
      const parcelamentoContainer = document.getElementById("parcelamentoContainer");
      if (parcelamentoContainer) parcelamentoContainer.style.display = "block";

      dados.parcelas.forEach((parcela, index) => {
        try {
          adicionarParcela();
          const todas = document.querySelectorAll("#listaParcelas .row");
          const ultima = todas[todas.length - 1];
          const inputValor = ultima.querySelector(".valor-parcela");
          const inputData = ultima.querySelector(".data-parcela");
          const selectTipo = ultima.querySelector(".tipo-monetario");
          const condSelect = ultima.querySelector("select.condicao-pagto");
          const condWrapper = ultima.querySelector(".condicao-wrapper");

          if (inputValor) inputValor.value = parcela.valor || "";
          if (inputData) inputData.value = parcela.data || "";
          if (selectTipo) selectTipo.value = parcela.tipo || "";

          if (parcela.condicao?.startsWith("Personalizado")) {
            condWrapper.innerHTML = "";
            const input = document.createElement("input");
            input.type = "text";
            input.className = "form-control condicao-pagto";
            input.placeholder = "Descreva a condição de pagamento...";
            input.value = parcela.condicao;
            condWrapper.appendChild(input);
          } else {
            if (condSelect) condSelect.value = parcela.condicao || "";
          }
        } catch (e) {
          console.error(`❌ Erro ao adicionar parcela #${index + 1}:`, e);
        }
      });
    }

    // 📦 Produtos por grupo
    const container = document.getElementById("blocosProdutosContainer");
    if (!container) throw new Error("Elemento #blocosProdutosContainer não encontrado.");
    container.innerHTML = "";
    blocoIndex = 0;

    for (let i = 0; i < proposta.grupos.length; i++) {
      const grupo = proposta.grupos[i];
      const nomeGrupo = grupo.nome || `Grupo ${i + 1}`;
      const nomeAmbiente = grupo.ambiente || "";

      await esperarElemento("#blocosProdutosContainer");
      const idSuffix = criarBlocoDeProposta(nomeGrupo, nomeAmbiente);
      await esperarElemento(`#${idSuffix}`);

      const bloco = document.getElementById(idSuffix);
      if (!bloco) continue;

      if (window.location.pathname.includes("editarModelo.html")) {
        const spanTitulo = bloco.querySelector(`#titulo-accordion-${idSuffix}`);
        if (spanTitulo) {
          const inputTitulo = document.createElement("input");
          inputTitulo.type = "text";
          inputTitulo.className = "form-control form-control-sm input-editar-nome-grupo";
          inputTitulo.value = spanTitulo.textContent.trim();
          inputTitulo.setAttribute("data-id", idSuffix);
          inputTitulo.addEventListener("input", (e) => {
            proposta.grupos[i].nome = e.target.value;
          });
          spanTitulo.replaceWith(inputTitulo);
        }
      }

      const inputAmbiente = bloco.querySelector(`input[placeholder="Ambientes"]`);
      if (inputAmbiente && nomeAmbiente) inputAmbiente.value = nomeAmbiente;

      for (const [chave, valor] of Object.entries(grupo.parametros || {})) {
        const input = bloco.querySelector(`input[name="${chave}"]`);
        if (input) {
          const deveZerar = window.location.pathname.includes("editarModelo.html") &&
            ["altura_montante", "numero_montantes", "numero_protecoes", "descricao"].includes(chave);
          input.value = deveZerar ? "0" : valor;
        }
      }

      const tbody = bloco.querySelector(`#tabela-${idSuffix} tbody`);
      tbody.innerHTML = "";

      grupo.itens.forEach(item => {
        const formula = item.formula_quantidade || "";
        const valorOriginal = window.location.pathname.includes("editarModelo.html") ? "0" : (item.quantidade_desejada || "");
        const context = { groupId: idSuffix };
        const quantidadeFinal = arredondarCimaSeguro(formula || valorOriginal, context);

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${item.utilizacao || ""}</td>
          <td>${item.nome_produto || ""}</td>
          <td class="custo-unitario">R$ ${parseFloat(item.custo || 0).toFixed(2)}</td>
          <td class="venda-unitaria">R$ ${parseFloat(item.preco || 0).toFixed(2)}</td>
          <td>${item.codigo_omie || ""}</td>
          <td>
            <input type="number" class="form-control form-control-sm quantidade" value="${window.location.pathname.includes("editarModelo.html") ? "0" : quantidadeFinal}">
          </td>
          <td class="quantidade-desejada">
            <input type="text" class="form-control form-control-sm quantidade-desejada"
              value="${valorOriginal}" data-formula="${formula}" data-group-id="${idSuffix}">
          </td>
          <td>
            <button class="btn btn-danger btn-sm" onclick="this.closest('tr').remove()">Remover</button>
            <button class="btn btn-secondary btn-sm mt-1" onclick="abrirSubstituirProduto(this)">Substituir</button>
          </td>
        `;
        tbody.appendChild(tr);
      });

      if (typeof inicializarCamposDeFormulaQuantidade === "function") {
        inicializarCamposDeFormulaQuantidade(bloco, { groupId: idSuffix });
      }

      if (i === 0) {
        const collapse = bloco.querySelector(`#collapse-${idSuffix}`);
        if (collapse && !collapse.classList.contains("show")) {
          collapse.classList.add("show");
        }
      }
    }

    if (typeof renderizarTudo === "function") renderizarTudo();
    if (typeof ativarRecalculoEmTodasTabelas === "function") ativarRecalculoEmTodasTabelas();
    if (typeof simularFocusEBlurEmTodosCamposFormula === "function") simularFocusEBlurEmTodosCamposFormula();

    if (window.location.pathname.includes("editarModelo.html")) {
  const form = document.getElementById("novoOrcamentoForm");
  if (form) form.style.display = "none";

  // ⛔ Oculta campos de ambiente
  document.querySelectorAll('input[placeholder="Ambiente"]').forEach(input => {
    input.style.display = "none";
    
  });
  
}


  console.log("✅ Proposta carregada com sucesso!");
   
  } catch (erro) {
    console.error("❌ Erro ao carregar proposta:", erro);
    alert("Erro ao carregar proposta. Veja o console.");
  }
 aguardarTabelasEExecutar(forcarEventosDescricao);
}

function aguardarTabelasEExecutar(callback, delay = 2000) {
  setTimeout(() => {
    const inputs = document.querySelectorAll('input[name="descricao"]');
    
    if (inputs.length === 0) {
      console.warn("⚠️ Nenhum campo 'descricao' encontrado.");
    } else {
      console.log(`✅ ${inputs.length} campos 'descricao' encontrados.`);
      inputs.forEach(callback);
    }
  }, delay);
}


async function atualizarPrecosOmieNaDOM() {
  const ENDPOINT = "https://ulhoa-0a02024d350a.herokuapp.com/produtos/visualizar";

  const toNumber = (v) => {
    if (v === undefined || v === null) return 0;
    let s = String(v).replace(/\s+/g, "").replace("R$", "");
    const hasDot = s.includes(".");
    const hasComma = s.includes(",");
    if (hasDot && hasComma) s = s.replace(/\./g, "").replace(",", ".");
    else if (!hasDot && hasComma) s = s.replace(",", ".");
    const n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  };

  try {
    const res = await fetch(ENDPOINT);
    if (!res.ok) throw new Error(`Erro ao buscar produtos: ${res.status}`);
    const listaAPI = await res.json();

    // Monta dicionário por código
    const lookup = {};
    listaAPI.forEach((p) => {
      const codigo = String(p.codigo_produto || p.codigo || "").trim();
      const preco = p.preco_unitario ?? p.valor_unitario ?? p.preco ?? p.price ?? 0;
      if (codigo) lookup[codigo] = toNumber(preco);
    });

    const linhasCorrigidas = [];

    document.querySelectorAll("table[id^='tabela-'] tbody tr").forEach((tr) => {
      const codigoCell = tr.querySelector("td:nth-child(5)");
      const custoTd = tr.querySelector("td:nth-child(3)");
      const unitarioTd = tr.querySelector("td:nth-child(4)");
      const inputQtd = tr.querySelector("td:nth-child(6) input");

      if (!codigoCell || !unitarioTd || !custoTd || !inputQtd) return;

      const codigo = String(codigoCell.textContent || "").trim();
      const precoAPI = lookup[codigo];
      if (!precoAPI) return;

      const precoAtual = toNumber(unitarioTd?.textContent);
      if (Math.abs(precoAtual - precoAPI) > 0.009) {
        const qtd = parseFloat(inputQtd?.value?.replace(",", ".") || "1") || 1;
        const novoCustoFinal = precoAPI * qtd;

        unitarioTd.textContent = `R$ ${precoAPI.toFixed(2)}`;
        custoTd.textContent = `R$ ${novoCustoFinal.toFixed(2)}`;

        tr.style.backgroundColor = "#e5ffe5";
        unitarioTd.style.color = "green";
        custoTd.style.color = "green";

        linhasCorrigidas.push(codigo);
      }
    });

    if (typeof ativarRecalculoEmTodasTabelas === "function") {
      ativarRecalculoEmTodasTabelas();
    }

    if (linhasCorrigidas.length > 0) {
     mostrarPopupCustomizado("✅ Preços Atualizados", `${linhasCorrigidas.length} produto(s) com preço atualizado com sucesso.`, "success");

    } else {
      alert("✔️ Todos os preços já estavam atualizados.");
    }
  } catch (err) {
    console.error("❌ Erro ao atualizar preços:", err);
    alert("Erro ao atualizar preços com a Omie.");
  }
}

function simularEventosInputsDosBlocos() {
  const blocos = document.querySelectorAll(".main-container");

  blocos.forEach(bloco => {
    const inputs = bloco.querySelectorAll("input[name]");

    inputs.forEach(input => {
      // Simula que o valor atual foi alterado
      const eventoInput = new Event("input", { bubbles: true });
      const eventoChange = new Event("change", { bubbles: true });
      const eventoBlur = new Event("blur", { bubbles: true });

      input.dispatchEvent(eventoInput);
      input.dispatchEvent(eventoChange);
      input.dispatchEvent(eventoBlur);
    });
  });

  console.log("✅ Todos os eventos simulados nos inputs dos blocos.");
}
simularEventosInputsDosBlocos() 

document.addEventListener("DOMContentLoaded", () => {
  localizarECarregarPropostaPorId();
});

