document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const usuarioInput = document.getElementById("usuario").value;
    const senhaInput = document.getElementById("senha").value;

    // Recupera os dados direto do localStorage
    const usuarioSalvo = JSON.parse(localStorage.getItem("usuario"));

    if (!usuarioSalvo) {
        alert("Nenhum usuário cadastrado!");
        return;
    }

    // Valida se o usuário/email e senha coincidem
    if (usuarioInput === usuarioSalvo.email && senhaInput === usuarioSalvo.senha) {
        document.getElementById('chat_principal').style.display = 'block';
        document.getElementById('tela_login').style.display = 'none';
    } else {
        alert("Usuário ou senha inválidos!");
    }
});

function redirecionarCD(){
    document.getElementById('tela_login').style.display = 'none';
    document.getElementById('tela_cadastro').style.display = 'block';
}

function redirecionarLG(){
    document.getElementById('tela_login').style.display = 'block';
    document.getElementById('tela_cadastro').style.display = 'none';
}

function cadastrar() {
    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha_cadastro").value;

    if(!nome || !email || !senha) {
        alert("Por favor, preencha todos os campos!");  
        return;
    }

    if (ValidaEmailSenha(email, senha)) {
        const usuario = { nome, email, senha };

        // Salva no localStorage (persiste mesmo após o refresh)
        localStorage.setItem("usuario", JSON.stringify(usuario));
        
        alert("Cadastro realizado com sucesso!");
        
        // Em vez de window.location.href, apenas troque a tela para não perder o estado
        redirecionarLG();
    }
}

function ValidaEmailSenha(email, senha) {
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Removi a exigência complexa temporariamente para teste, ou mantenha se desejar
    const senhaValida = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!emailValido.test(email)) {
        alert("Email inválido!");
        return false;
    }

    if (!senhaValida.test(senha)) {
        alert("Senha inválida! Use 8 caracteres, maiúsculas, minúsculas e números.");
        return false;
    }
 
    return true;
}