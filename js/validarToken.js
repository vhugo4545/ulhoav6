async function verificarTokenOuRedirecionar() {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "../index.html";
    return;
  }

  try {
    const resposta = await fetch("https://ulhoa-0a02024d350a.herokuapp.com/auth/validar-token", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!resposta.ok) {
      // Token inválido ou expirado
      localStorage.removeItem("token"); // limpa token inválido
      window.location.href = "pages/login.html"; // redireciona
      return;
    }

    const dados = await resposta.json();
    console.log("🔐 Usuário autenticado:", dados.usuario);

  } catch (erro) {
    console.error("Erro ao validar token:", erro);
    window.location.href = "/login.html";
  }
}
