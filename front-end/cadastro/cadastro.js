function cadastrar() {
    var nome = document.getElementById("nome").value;
    var email = document.getElementById("email").value;
    var senha = document.getElementById("senha").value;

    if(!nome || !email || !senha) {
        alert("Por favor, preencha todos os campos.");
        return;
    }
        const usuario = {
            nome,
            email,
            senha
        };

        localStorage.setItem("usuario", JSON.stringify(usuario));
        alert("Cadastro realizado com sucesso!");
        window.location.href = "../login/login.html";


    }