async function login() {
  const email = document.getElementById('loginEmail').value;
  const senha = document.getElementById('loginSenha').value;

  const res = await fetch('https://ulhoa-0a02024d350a.herokuapp.com/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha })
  });

  const data = await res.json();

  if (res.ok) {
    // Armazena no localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuarioId', data.usuario.id);
    localStorage.setItem('usuarioNome', data.usuario.nome);
    localStorage.setItem('usuarioTipo', data.usuario.tipo);

    // 🔍 Log dos dados armazenados
    console.log("✅ Login realizado:");
    console.log("🆔 ID:", data.usuario.id);
    console.log("👤 Nome:", data.usuario.nome);
    console.log("🔐 Tipo:", data.usuario.tipo);
    console.log("🪪 Token:", data.token);

    // Redireciona
    window.location.href = 'listagem.html';
  } else {
    alert(data.erro || 'Erro no login');
  }
}

async function cadastrar() {
  const nome = document.getElementById('cadastroNome').value;
  const email = document.getElementById('cadastroEmail').value;
  const senha = document.getElementById('cadastroSenha').value;
  const tipo = document.getElementById('cadastroTipo').value;

  const res = await fetch('https://ulhoa-0a02024d350a.herokuapp.com/api/auth/cadastrar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, email, senha, tipo })
  });

  const data = await res.json();

  if (res.ok) {
    alert('Cadastro realizado! Faça login.');
    toggleForms();
  } else {
    alert(data.erro || 'Erro no cadastro');
  }
}

