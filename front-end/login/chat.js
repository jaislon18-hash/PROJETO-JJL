
const API = "https://emphatic-cake-spoiled.ngrok-free.dev";
let usuarioLogado = null;     
let contatoSelecionado = null;  
let contatos = [];               
let ultimoTimestamp = 0;         
let intervaloPoll = null;        


async function post(rota, dados) {
    const res = await fetch(API + rota, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    });
    return res.json();
}

async function get(rota) {
    const res = await fetch(API + rota);
    return res.json();
}

document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const email = document.getElementById("usuario").value.trim();
    const senha = document.getElementById("senha").value.trim();

    const res = await post("/login", { email, senha });
    if (res.erro) { alert(res.erro); return; }

    usuarioLogado = { nome: res.nome, email: res.email };
    carregarContatosSalvos();
    abrirChat();
});

function abrirChat() {
    document.getElementById("tela_login").style.display = "none";
    document.getElementById("tela_cadastro").style.display = "none";
    document.getElementById("chat_principal").style.display = "flex";
    renderizarContatos();
}

function redirecionarCD() {
    document.getElementById("tela_login").style.display = "none";
    document.getElementById("tela_cadastro").style.display = "block";
}

function redirecionarLG() {
    document.getElementById("tela_login").style.display = "block";
    document.getElementById("tela_cadastro").style.display = "none";
}

async function cadastrar() {
    const nome  = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha_cadastro").value.trim();

    if (!nome || !email || !senha) { alert("Preencha todos os campos!"); return; }
    if (!validaEmail(email)) { alert("Email inválido!"); return; }
    if (!validaSenha(senha)) { alert("Senha inválida! Use 8+ caracteres, maiúsculas, minúsculas e números."); return; }

    const res = await post("/cadastrar", { nome, email, senha });
    if (res.erro) { alert(res.erro); return; }

    alert("Cadastro realizado com sucesso!");
    redirecionarLG();
}

function validaEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validaSenha(senha) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(senha);
}

function chaveContatos() {
    return "contatos_" + usuarioLogado.email;
}

function carregarContatosSalvos() {
    const salvo = localStorage.getItem(chaveContatos());
    contatos = salvo ? JSON.parse(salvo) : [];
}

function salvarContatos() {
    localStorage.setItem(chaveContatos(), JSON.stringify(contatos));
}

async function adicionarNovoContato() {
    const email = prompt("Digite o email do contato:");
    if (!email) return;

    if (email.toLowerCase() === usuarioLogado.email.toLowerCase()) {
        alert("Você não pode adicionar a si mesmo!");
        return;
    }
    if (contatos.find(c => c.email.toLowerCase() === email.toLowerCase())) {
        alert("Contato já adicionado!");
        return;
    }

    const res = await get(`/buscarUsuario?email=${encodeURIComponent(email)}`);
    if (res.erro) { alert("Usuário não encontrado!"); return; }

    contatos.push({ nome: res.nome, email: res.email });
    salvarContatos();
    renderizarContatos();
    alert(`${res.nome} adicionado com sucesso!`);
}

function renderizarContatos() {
    const lista = document.getElementById("listaContatos");
    lista.innerHTML = "";
    contatos.forEach(c => adicionarContatoNaLista(c));
}

function adicionarContatoNaLista(contato) {
    const template = document.getElementById("templateContato");
    const clone = template.content.cloneNode(true);
    const div = clone.querySelector(".contato");

    div.querySelector(".nome").textContent = contato.nome;
    div.querySelector(".mensagem").textContent = contato.email;
    div.querySelector(".foto").src = `https://i.pravatar.cc/150?u=${contato.email}`;
    div.dataset.email = contato.email;

    div.onclick = () => selecionarContato(contato, div);

    document.getElementById("listaContatos").appendChild(clone);
}

function selecionarContato(contato, elemento) {
    if (intervaloPoll) clearInterval(intervaloPoll);
    ultimoTimestamp = 0;

    contatoSelecionado = contato;

    document.querySelectorAll(".contato").forEach(c => c.classList.remove("selecionado"));
    elemento.classList.add("selecionado");

    document.getElementById("nomeContatoChat").textContent = contato.nome;
    const img = document.getElementById("imgContatoChat");
    img.src = `https://i.pravatar.cc/150?u=${contato.email}`;
    img.style.display = "block";

    document.getElementById("mensagensChat").innerHTML = "";
    buscarMensagens();

    intervaloPoll = setInterval(buscarMensagens, 2000);
}

async function buscarMensagens() {
    if (!contatoSelecionado || !usuarioLogado) return;

    const url = `/mensagens?de=${encodeURIComponent(usuarioLogado.email)}&para=${encodeURIComponent(contatoSelecionado.email)}&desde=${ultimoTimestamp}`;
    const msgs = await get(url);

    if (!Array.isArray(msgs) || msgs.length === 0) return;

    msgs.forEach(msg => {
        const tipo = msg.de === usuarioLogado.email ? "enviado" : "recebido";
        exibirMensagem(msg.texto, tipo);
        if (msg.hora > ultimoTimestamp) ultimoTimestamp = msg.hora;
    });
}

async function enviarMensagem() {
    const input = document.getElementById("inputMensagem");
    const texto = input.value.trim();
    if (!texto || !contatoSelecionado) return;

    input.value = "";

    const res = await post("/enviarMensagem", {
        de:    usuarioLogado.email,
        para:  contatoSelecionado.email,
        texto: texto
    });

    if (res.erro) { alert("Erro ao enviar: " + res.erro); return; }

    exibirMensagem(texto, "enviado");
    ultimoTimestamp = Date.now();
}

function exibirMensagem(texto, tipo) {
    const area = document.getElementById("mensagensChat");
    const div = document.createElement("div");
    div.className = `balao ${tipo}`;
    div.textContent = texto;
    area.appendChild(div);
    area.scrollTop = area.scrollHeight;
}

document.getElementById("inputMensagem")?.addEventListener("keypress", e => {
    if (e.key === "Enter") enviarMensagem();
});