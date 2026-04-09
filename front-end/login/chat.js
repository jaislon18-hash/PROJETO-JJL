document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const usuarioInput = document.getElementById("usuario").value;
    const senhaInput = document.getElementById("senha").value;


    const usuarioSalvo = JSON.parse(localStorage.getItem("usuario"));

    if (!usuarioSalvo) {
        alert("Nenhum usuário cadastrado!");
        return;
    }


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


        localStorage.setItem("usuario", JSON.stringify(usuario));
        
        alert("Cadastro realizado com sucesso!");
        
  
        redirecionarLG();
    }
}

function ValidaEmailSenha(email, senha) {
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;  
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

function adicionarNovoContato() {
  const nome = prompt("Nome do novo contato:");
  if (!nome) return;
  
  const novo = {
    nome: nome,
    mensagem: "Nova conversa",
    foto: "https://via.placeholder.com/50"
  };
  
  contatos.push(novo);
  renderizarContatos();
}


const contatos = [
  {
    nome: "João",
    mensagem: "E aí?",
    foto: "https://via.placeholder.com/50"
  },
  {
    nome: "Maria",
    mensagem: "Tudo bem?",
    foto: "https://via.placeholder.com/50"
  }
];


function renderizarContatos() {
  const lista = document.getElementById("listaContatos");
  lista.innerHTML = ""; // limpa tudo

  contatos.forEach(contato => {
    adicionarContato(contato.nome, contato.mensagem, contato.foto);
  });
}

function adicionarContato(nome, mensagem, foto) {
  const template = document.getElementById("templateContato");
  const clone = template.content.cloneNode(true);

  clone.querySelector(".nome").textContent = nome;
  clone.querySelector(".mensagem").textContent = mensagem;
  clone.querySelector(".foto").src = foto;

  const lista = document.getElementById("listaContatos");
  if (lista) {
    lista.appendChild(clone);
  } else {
    console.error("Elemento listaContatos não encontrado!");
  }
}

// Inicializa a lista de contatos ao carregar
document.addEventListener("DOMContentLoaded", renderizarContatos);


