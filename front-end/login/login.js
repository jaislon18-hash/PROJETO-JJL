document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const usuario = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;
    const mensagem = document.getElementById("mensagem");

    // Usuário e senha fixos para teste
    const usuarioCorreto = "admin";
    const senhaCorreta = "1234";

    if (usuario === usuarioCorreto && senha === senhaCorreta) {
        const chatP = document.getElementById('chat_principal')
        const login = document.getElementById('tela_login')
        chatP.style.display = 'flex';
        login.style.display = 'none';
    } else {
        mensagem.style.color = "red";
        mensagem.textContent = "Usuário ou senha inválidos!";
    }
});

function redirecionarCD(){
    const login = document.getElementById('tela_login')
    const telaCadastro = document.getElementById('tela_cadastro')
    
    login.style.display = 'none';
    telaCadastro.style.display = 'inline';

}