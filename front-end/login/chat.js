let contatoSelecionado = null;

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
        document.getElementById('chat_principal').style.display = 'flex';
        document.getElementById('tela_login').style.display = 'none';
        renderizarContatos();
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

const contatos = [
  {
    nome: "João",
    mensagem: "E aí?",
    foto: "https://i.pravatar.cc/150?u=joao"
  },
  {
    nome: "Maria",
    mensagem: "Tudo bem?",
    foto: "https://i.pravatar.cc/150?u=maria"
  }
];

function adicionarNovoContato() {
  const nome = prompt("Nome do novo contato:");
  if (!nome) return;
  
  const novo = {
    nome: nome,
    mensagem: "Nova conversa",
    foto: `https://i.pravatar.cc/150?u=${nome}`
  };
  
  contatos.push(novo);
  renderizarContatos();
}

function renderizarContatos() {
  const lista = document.getElementById("listaContatos");
  lista.innerHTML = ""; 

  contatos.forEach(contato => {
    adicionarContato(contato.nome, contato.mensagem, contato.foto);
  });
}

function adicionarContato(nome, mensagem, foto) {
  const template = document.getElementById("templateContato");
  const clone = template.content.cloneNode(true);
  const divContato = clone.querySelector(".contato");

  divContato.querySelector(".nome").textContent = nome;
  divContato.querySelector(".mensagem").textContent = mensagem;
  divContato.querySelector(".foto").src = foto;

  divContato.onclick = () => selecionarContato(nome, foto, divContato);

  const lista = document.getElementById("listaContatos");
  if (lista) {
    lista.appendChild(clone);
  }
}

function selecionarContato(nome, foto, elemento) {
    contatoSelecionado = nome;


    document.querySelectorAll('.contato').forEach(c => c.classList.remove('selecionado'));
    elemento.classList.add('selecionado');

    // Atualizar Header do Chat
    document.getElementById('nomeContatoChat').textContent = nome;
    document.getElementById('imgContatoChat').src = foto;
    document.getElementById('imgContatoChat').style.display = 'block';

    carregarMensagens();
}

function carregarMensagens() {
    const areaMensagens = document.getElementById('mensagensChat');
    areaMensagens.innerHTML = '';

    const todasMensagens = JSON.parse(localStorage.getItem('mensagens_chat')) || {};
    const mensagensDoContato = todasMensagens[contatoSelecionado] || [];

    mensagensDoContato.forEach(msg => {
        exibirMensagemNoChat(msg.texto, msg.tipo);
    });

    areaMensagens.scrollTop = areaMensagens.scrollHeight;
}

function enviarMensagem() {
    const input = document.getElementById('inputMensagem');
    const texto = input.value.trim();

    if (!texto || !contatoSelecionado) return;

    const todasMensagens = JSON.parse(localStorage.getItem('mensagens_chat')) || {};
    if (!todasMensagens[contatoSelecionado]) {
        todasMensagens[contatoSelecionado] = [];
    }

    const novaMensagem = { texto, tipo: 'enviado' };
    todasMensagens[contatoSelecionado].push(novaMensagem);
    localStorage.setItem('mensagens_chat', JSON.stringify(todasMensagens));

    // Exibir na tela
    exibirMensagemNoChat(texto, 'enviado');
    input.value = '';

    setTimeout(() => {
        receberRespostaAutomatica();
    }, 1000);
}

function exibirMensagemNoChat(texto, tipo) {
    const areaMensagens = document.getElementById('mensagensChat');
    const divMensagem = document.createElement('div');
    divMensagem.className = `balao ${tipo}`;
    divMensagem.textContent = texto;
    areaMensagens.appendChild(divMensagem);
    
    areaMensagens.scrollTop = areaMensagens.scrollHeight;
}

function receberRespostaAutomatica() {
    const todasMensagens = JSON.parse(localStorage.getItem('mensagens_chat')) || {};
    const resposta = { texto: "Entendido!", tipo: 'recebido' };
    
    todasMensagens[contatoSelecionado].push(resposta);
    localStorage.setItem('mensagens_chat', JSON.stringify(todasMensagens));
    
    exibirMensagemNoChat(resposta.texto, 'recebido');
}

document.getElementById('inputMensagem')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') enviarMensagem();
});

document.addEventListener("DOMContentLoaded", () => {
});


