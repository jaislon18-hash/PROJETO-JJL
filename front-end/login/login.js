document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const usuario = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;
    const mensagem = document.getElementById("mensagem");

    const usuarioSalvo = JSON.parse(localStorage.getItem("usuario"));

    if (!usuarioSalvo) {
        mensagem.style.color = "red";
        mensagem.textContent = "Nenhum usuário cadastrado!";
        return;
    }
    if (usuario === usuarioSalvo.email && senha === usuarioSalvo.senha) {
         const chatP = document.getElementById('chat_principal')
        const login = document.getElementById('tela_login')
        chatP.style.display = 'flex';
        login.style.display = 'none';
    }else {
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


let nomeglobal = "";
let emailglobal = "";
let senhaglobal = "";

function cadastrar() {
    nomeglobal = document.getElementById("nome").value;
    emailglobal = document.getElementById("email").value;
    senhaglobal = document.getElementById("senha_cadastro").value;


    if(!nomeglobal || !emailglobal || !senhaglobal) {
        alert("Por favor, preencha todos os campos!");  
        return;
    }
    const validacao = ValidaEmailSenha(emailglobal, senhaglobal);
    if (validacao !== "Email e senha válidos!") {
        return;
    }

        const usuario = {
            nome: nomeglobal,
            email: emailglobal,
            senha: senhaglobal
        };


        localStorage.setItem("usuario", JSON.stringify(usuario));
        alert("Cadastro realizado com sucesso!");
        window.location.href = "../login/login.html";
    }

function ValidaEmailSenha(email, senha) {
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const senhaValida = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!emailValido.test(email)) {
        alert("Email inválido! Por favor, insira um email válido.");
        return "Email invalido";

    }

    if (!senhaValida.test(senha)) {
        alert("Senha inválida! A senha deve conter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas e números.");
        return "Senha inválida";
    }

    return "Email e senha válidos!";
}