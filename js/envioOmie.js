function formatarDataBR(dataISO) {
  if (!dataISO || !dataISO.includes("-")) return "";
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

function mostrarPopupPendencias(pendencias) {
  const lista = document.getElementById("listaPendencias");
  lista.innerHTML = "";
  pendencias.forEach(p => {
    const li = document.createElement("li");
    li.textContent = p;
    lista.appendChild(li);
  });
  document.getElementById("popupPendencias").style.display = "block";
  document.getElementById("overlayPopup").style.display = "block";
}

function fecharPopupPendencias() {
  document.getElementById("popupPendencias").style.display = "none";
  document.getElementById("overlayPopup").style.display = "none";
}

async function atualizarNaOmie() {
  const payload = gerarPayloadOmie();
  if (!payload) return;

  try {
    const resposta = await fetch("https://ulhoa-0a02024d350a.herokuapp.com/api/omie/pedidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const dados = await resposta.json();
    console.log("📦 Retorno da Omie:", dados);

    const descricao = dados?.descricao_status || "";

    if (descricao.includes("Pedido cadastrado com sucesso")) {
      mostrarPopupCustomizado("✅ Sucesso!", descricao, "success");
    } else {
      mostrarPopupCustomizado("❌ Erro ao enviar para Omie", descricao || "Retorno inesperado", "error");
    }
  } catch (erro) {
    console.error("❌ Erro ao enviar para Omie:", erro);
    mostrarPopupCustomizado("❌ Erro de conexão", "Falha ao comunicar com a Omie.", "error");
  }
}


function gerarNumeroPedidoUnico() {
  const agora = new Date();
  const pad = n => n.toString().padStart(2, '0');

  const ano = agora.getFullYear().toString().slice(-2); // dois últimos dígitos do ano
  const mes = pad(agora.getMonth() + 1);
  const dia = pad(agora.getDate());
  const hora = pad(agora.getHours());
  const minuto = pad(agora.getMinutes());
  const segundo = pad(agora.getSeconds());

  return `${ano}${mes}${dia}${hora}${minuto}${segundo}001`; // total de 15 caracteres
}


function gerarNumeroPedidoUnico() {
  const agora = new Date();
  const pad = n => n.toString().padStart(2, '0');

  const ano = agora.getFullYear().toString().slice(-2); // últimos 2 dígitos
  const mes = pad(agora.getMonth() + 1);
  const dia = pad(agora.getDate());
  const hora = pad(agora.getHours());
  const minuto = pad(agora.getMinutes());
  const segundo = pad(agora.getSeconds());

  return `${ano}${mes}${dia}${hora}${minuto}${segundo}001`; // total: 15 caracteres
}

function gerarPayloadOmie() {
  const pendencias = [];

  const clientes = document.querySelectorAll("#clientesWrapper .cliente-item");
  const codigoCliente = clientes[0]?.querySelector(".codigoCliente")?.value?.trim();
  if (!codigoCliente) pendencias.push("Código do cliente não preenchido.");

  const primeiraDataParcelaRaw = Array.from(document.querySelectorAll(".data-parcela"))
    .map(el => el.value?.trim())
    .find(v => !!v);
  const primeiraDataParcela = formatarDataBR(primeiraDataParcelaRaw);
  if (!primeiraDataParcela) pendencias.push("Data da 1ª parcela não preenchida.");

  const linhasParcelas = document.querySelectorAll("#listaParcelas .row");
  const blocos = document.querySelectorAll("[id^='bloco-']");

  if (pendencias.length > 0) {
    mostrarPopupPendencias(pendencias);
    return null;
  }

  const numeroPedido = gerarNumeroPedidoUnico();

  const payload = {
    cabecalho: {
      codigo_cliente: codigoCliente,
      codigo_pedido_integracao: numeroPedido,
      data_previsao: primeiraDataParcela,
      etapa: "10",
      numero_pedido: numeroPedido,
      codigo_parcela: "999",
      quantidade_itens: blocos.length
    },
    det: [],
    frete: { modalidade: "9" },
    informacoes_adicionais: {
      codigo_categoria: "1.01.01",
      codigo_conta_corrente: 2514395098,
      consumidor_final: "S",
      enviar_email: "N"
    },
    agropecuario: {
      cNumReceita: "",
      cCpfResponsavel: "",
      nTipoGuia: 1,
      cUFGuia: "",
      cSerieGuia: "",
      nNumGuia: 1
    },
    lista_parcelas: { parcela: [] }
  };

  // Produtos por grupo
  let totalGrupos = 0;
  blocos.forEach(bloco => {
    const tabela = bloco.querySelector("table");
    const linhas = tabela?.querySelectorAll("tbody tr");
    const totalGrupoEl = tabela?.querySelector("tfoot tr td:last-child strong");
    const totalTexto = totalGrupoEl?.textContent?.replace("R$", "").replace(/\./g, "").replace(",", ".") || "0";
    const valorTotal = parseFloat(totalTexto) || 0;

    if (!linhas?.length) return;

    const primeiroProduto = linhas[0];
    const codigoProduto = primeiroProduto.querySelector("td:nth-child(5)")?.textContent?.trim() || "";
    const descricao = primeiroProduto.querySelector("td:nth-child(2)")?.textContent?.trim() || "";

    payload.det.push({
      ide: { codigo_item_integracao: numeroPedido },
      inf_adic: { peso_bruto: 1, peso_liquido: 1 },
      produto: {
        cfop: "5.102",
        codigo_produto: codigoProduto,
        descricao,
        ncm: "9403.30.00",
        quantidade: 1,
        tipo_desconto: "V",
        unidade: "UN",
        valor_desconto: 0,
        valor_unitario: valorTotal
      }
    });

    totalGrupos += valorTotal;
  });

  // Parcelas
  let somaParcelas = 0;
  linhasParcelas.forEach((linha, i) => {
    const valorStr = linha.querySelector(".valor-parcela")?.value?.replace("R$", "").replace(/\./g, "").replace(",", ".") || "0";
    const valor = parseFloat(valorStr) || 0;
    const dataISO = linha.querySelector(".data-parcela")?.value || "";
    const dataFormatada = formatarDataBR(dataISO);
    const percentual = totalGrupos > 0 ? ((valor / totalGrupos) * 100).toFixed(2) : 0;

    somaParcelas += valor;

    payload.lista_parcelas.parcela.push({
      data_vencimento: dataFormatada,
      numero_parcela: i + 1,
      percentual,
      valor: parseFloat(valor.toFixed(2))
    });
  });

  // Corrigir diferença entre soma das parcelas e total dos grupos
  const totalGruposRounded = parseFloat(totalGrupos.toFixed(2));
  const somaParcelasRounded = parseFloat(somaParcelas.toFixed(2));

  if (Math.abs(totalGruposRounded - somaParcelasRounded) > 1) {
    const diferenca = totalGruposRounded - somaParcelasRounded;

    const ultimaParcela = payload.lista_parcelas.parcela.at(-1);
    if (ultimaParcela) {
      ultimaParcela.valor = parseFloat((ultimaParcela.valor + diferenca).toFixed(2));
      ultimaParcela.percentual = ((ultimaParcela.valor / totalGruposRounded) * 100).toFixed(2);

      const inputs = document.querySelectorAll(".valor-parcela");
      const ultimoInput = inputs[inputs.length - 1];
      if (ultimoInput) {
        ultimoInput.value = `R$ ${ultimaParcela.valor.toFixed(2).replace(".", ",")}`;
        ultimoInput.dataset.percentual = parseFloat(ultimaParcela.percentual);
      }

      console.warn(`⚠️ Ajuste automático aplicado na última parcela: diferença de R$ ${diferenca.toFixed(2)}`);
    } else {
      mostrarPopupPendencias([
        `Não foi possível ajustar parcelas. Nenhuma parcela encontrada.`
      ]);
      return null;
    }
  }

  console.log("📦 Payload gerado:", payload);
  return payload;
}



function mostrarPopupCustomizado(titulo, mensagem, tipo = "info") {
  // Remove popup anterior, se existir
  const popupExistente = document.getElementById("popup-status-omie");
  if (popupExistente) popupExistente.remove();

  const overlay = document.createElement("div");
  overlay.id = "popup-status-omie";
  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = 9999;

  const box = document.createElement("div");
  box.style.backgroundColor = "#fff";
  box.style.borderRadius = "8px";
  box.style.padding = "24px";
  box.style.boxShadow = "0 0 15px rgba(0, 0, 0, 0.2)";
  box.style.maxWidth = "500px";
  box.style.width = "90%";
  box.style.textAlign = "center";
  box.style.fontFamily = "Arial, sans-serif";

  const tituloEl = document.createElement("h2");
  tituloEl.textContent = titulo;
  tituloEl.style.color = tipo === "success" ? "green" : tipo === "error" ? "red" : "#333";
  tituloEl.style.marginBottom = "12px";

  const mensagemEl = document.createElement("p");
  mensagemEl.textContent = mensagem;
  mensagemEl.style.marginBottom = "20px";

  const botao = document.createElement("button");
  botao.textContent = "Fechar";
  botao.style.padding = "8px 20px";
  botao.style.border = "none";
  botao.style.backgroundColor = "#007BFF";
  botao.style.color = "#fff";
  botao.style.borderRadius = "4px";
  botao.style.cursor = "pointer";
  botao.addEventListener("click", () => overlay.remove());

  box.appendChild(tituloEl);
  box.appendChild(mensagemEl);
  box.appendChild(botao);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
}
