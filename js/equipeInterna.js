// equipeInterna.js

/**
 * Coleta os dados da equipe interna (vendedor e operador) do formulário.
 * Mostra os dados no console como confirmação visual.
 */

function capturarEquipeInterna() {
  const vendedorEl = document.getElementById("selectVendedor");
  const operadorEl = document.getElementById("operadorInterno");

  const vendedor = vendedorEl?.value || vendedorEl?.selectedOptions?.[0]?.textContent || "-";
  const operador = operadorEl?.value || operadorEl?.selectedOptions?.[0]?.textContent || "-";

  const dadosEquipe = {
    vendedor,
    operador
  };

  console.table(dadosEquipe);
  console.log("%c✅ Dados da equipe interna capturados com sucesso.", "color: green; font-weight: bold;");

  return dadosEquipe;
}

async function carregarVendedores() {
  const TOKEN = localStorage.getItem('accessToken');   // 🔐 salvo no login
  if (!TOKEN) {
    console.warn('⚠️ Token não encontrado — usuário não autenticado.');
    return;
  }

  try {
    const response = await fetch('https://ulhoa-0a02024d350a.herokuapp.com/api/vendedores', {
       headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TOKEN}`   // ⬅️ token JWT
  },
    });

    if (!response.ok) throw new Error('Erro ao buscar vendedores');

    const vendedores = await response.json();
    const select = document.getElementById('vendedorResponsavel');

    if (!select) {
      console.warn('⚠️ Elemento #vendedorResponsavel não encontrado no DOM.');
      return;
    }

    select.innerHTML = '<option value="">Selecione</option>';
    vendedores.forEach(v => {
      const opt = new Option(v.nome, v._id);
      select.appendChild(opt);
    });

    console.log(
      `%c✅ ${vendedores.length} vendedores carregados com sucesso.`,
      'color: green; font-weight: bold;'
    );

  } catch (err) {
    console.error('❌ Erro ao carregar vendedores:', err);
  }
}


// Inicializa ao carregar o DOM
document.addEventListener("DOMContentLoaded", carregarVendedores);

// Exemplo de uso ao clicar em salvar
const botaoSalvar = document.getElementById("save-proposal");
if (botaoSalvar) {
  botaoSalvar.addEventListener("click", capturarEquipeInterna);
} else {
  console.warn("⚠️ Botão de salvar proposta não encontrado para vincular captura da equipe interna.");
}
