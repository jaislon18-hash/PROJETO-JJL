import com.sun.net.httpserver.*;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.*;

public class main {

    // ── Armazenamento em memória ──────────────────────────────────────────────
    static Map<String, Map<String, String>> usuarios = new ConcurrentHashMap<>();
    // chave: email → {nome, email, senha}

    static Map<String, List<Map<String, String>>> mensagens = new ConcurrentHashMap<>();
    // chave: "emailA|emailB" (ordenado alfabeticamente) → lista de {de, texto, hora}

    // ── Utilitários ──────────────────────────────────────────────────────────
    static String chaveConversa(String a, String b) {
        String[] par = {a.toLowerCase(), b.toLowerCase()};
        Arrays.sort(par);
        return par[0] + "|" + par[1];
    }

    static String lerBody(HttpExchange ex) throws IOException {
        return new String(ex.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
    }

    static Map<String, String> parseJson(String json) {
        Map<String, String> map = new LinkedHashMap<>();
        json = json.trim().replaceAll("^\\{|\\}$", "");
        for (String par : json.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)")) {
            String[] kv = par.split(":", 2);
            if (kv.length == 2) {
                String k = kv[0].trim().replaceAll("\"", "");
                String v = kv[1].trim().replaceAll("\"", "");
                map.put(k, v);
            }
        }
        return map;
    }

    static void responder(HttpExchange ex, int status, String corpo) throws IOException {
        byte[] bytes = corpo.getBytes(StandardCharsets.UTF_8);
        ex.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        ex.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        ex.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        ex.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
        ex.sendResponseHeaders(status, bytes.length);
        ex.getResponseBody().write(bytes);
        ex.getResponseBody().close();
    }

    static void responderOK(HttpExchange ex) throws IOException {
        ex.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        ex.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        ex.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
        ex.sendResponseHeaders(204, -1);
        ex.getResponseBody().close();
    }

    static String escaparJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }


    // POST /cadastrar
    static void handleCadastrar(HttpExchange ex) throws IOException {
        if (ex.getRequestMethod().equalsIgnoreCase("OPTIONS")) { responderOK(ex); return; }
        Map<String, String> body = parseJson(lerBody(ex));
        String nome  = body.getOrDefault("nome", "").trim();
        String email = body.getOrDefault("email", "").trim().toLowerCase();
        String senha = body.getOrDefault("senha", "").trim();

        if (nome.isEmpty() || email.isEmpty() || senha.isEmpty()) {
            responder(ex, 400, "{\"erro\":\"Preencha todos os campos\"}");
            return;
        }
        if (usuarios.containsKey(email)) {
            responder(ex, 409, "{\"erro\":\"Email já cadastrado\"}");
            return;
        }
        Map<String, String> u = new HashMap<>();
        u.put("nome", nome); u.put("email", email); u.put("senha", senha);
        usuarios.put(email, u);
        responder(ex, 200, "{\"ok\":true,\"nome\":\"" + escaparJson(nome) + "\",\"email\":\"" + escaparJson(email) + "\"}");
    }

    // POST /login 
    static void handleLogin(HttpExchange ex) throws IOException {
        if (ex.getRequestMethod().equalsIgnoreCase("OPTIONS")) { responderOK(ex); return; }
        Map<String, String> body = parseJson(lerBody(ex));
        String email = body.getOrDefault("email", "").trim().toLowerCase();
        String senha = body.getOrDefault("senha", "").trim();

        Map<String, String> u = usuarios.get(email);
        if (u == null || !u.get("senha").equals(senha)) {
            responder(ex, 401, "{\"erro\":\"Email ou senha inválidos\"}");
            return;
        }
        responder(ex, 200, "{\"ok\":true,\"nome\":\"" + escaparJson(u.get("nome")) + "\",\"email\":\"" + escaparJson(email) + "\"}");
    }

    // GET /buscarUsuario
    static void handleBuscarUsuario(HttpExchange ex) throws IOException {
        if (ex.getRequestMethod().equalsIgnoreCase("OPTIONS")) { responderOK(ex); return; }
        String query = ex.getRequestURI().getQuery();
        String email = "";
        if (query != null) {
            for (String p : query.split("&")) {
                String[] kv = p.split("=", 2);
                if (kv[0].equals("email") && kv.length == 2)
                    email = URLDecoder.decode(kv[1], StandardCharsets.UTF_8).toLowerCase();
            }
        }
        if (!usuarios.containsKey(email)) {
            responder(ex, 404, "{\"erro\":\"Usuário não encontrado\"}");
            return;
        }
        String nome = usuarios.get(email).get("nome");
        responder(ex, 200, "{\"ok\":true,\"nome\":\"" + escaparJson(nome) + "\",\"email\":\"" + escaparJson(email) + "\"}");
    }

    // POST /enviarMensagem
    static void handleEnviarMensagem(HttpExchange ex) throws IOException {
        if (ex.getRequestMethod().equalsIgnoreCase("OPTIONS")) { responderOK(ex); return; }
        Map<String, String> body = parseJson(lerBody(ex));
        String de    = body.getOrDefault("de", "").trim().toLowerCase();
        String para  = body.getOrDefault("para", "").trim().toLowerCase();
        String texto = body.getOrDefault("texto", "").trim();

        if (de.isEmpty() || para.isEmpty() || texto.isEmpty()) {
            responder(ex, 400, "{\"erro\":\"Dados incompletos\"}");
            return;
        }
        String chave = chaveConversa(de, para);
        mensagens.computeIfAbsent(chave, k -> Collections.synchronizedList(new ArrayList<>()));

        Map<String, String> msg = new LinkedHashMap<>();
        msg.put("de", de);
        msg.put("texto", texto);
        msg.put("hora", String.valueOf(System.currentTimeMillis()));
        mensagens.get(chave).add(msg);

        responder(ex, 200, "{\"ok\":true}");
    }

    // GET /mensagens
    static void handleMensagens(HttpExchange ex) throws IOException {
        if (ex.getRequestMethod().equalsIgnoreCase("OPTIONS")) { responderOK(ex); return; }
        String query = ex.getRequestURI().getQuery();
        String de = "", para = "";
        long desde = 0;
        if (query != null) {
            for (String p : query.split("&")) {
                String[] kv = p.split("=", 2);
                if (kv.length < 2) continue;
                switch (kv[0]) {
                    case "de"    -> de    = URLDecoder.decode(kv[1], StandardCharsets.UTF_8).toLowerCase();
                    case "para"  -> para  = URLDecoder.decode(kv[1], StandardCharsets.UTF_8).toLowerCase();
                    case "desde" -> { try { desde = Long.parseLong(kv[1]); } catch (Exception ignored) {} }
                }
            }
        }
        String chave = chaveConversa(de, para);
        List<Map<String, String>> lista = mensagens.getOrDefault(chave, List.of());

        long desdeF = desde;
        StringBuilder sb = new StringBuilder("[");
        boolean primeiro = true;
        synchronized (lista) {
            for (Map<String, String> msg : lista) {
                long hora = Long.parseLong(msg.getOrDefault("hora", "0"));
                if (hora <= desdeF) continue;
                if (!primeiro) sb.append(",");
                sb.append("{\"de\":\"").append(escaparJson(msg.get("de")))
                  .append("\",\"texto\":\"").append(escaparJson(msg.get("texto")))
                  .append("\",\"hora\":").append(hora).append("}");
                primeiro = false;
            }
        }
        sb.append("]");
        responder(ex, 200, sb.toString());
    }

    // ── main ─────────────────────────────────────────────────────────────────
    public static void main(String[] args) throws IOException {
        int porta = 8080;
        HttpServer servidor = HttpServer.create(new InetSocketAddress(porta), 0);

        servidor.createContext("/cadastrar",     ex -> handleCadastrar(ex));
        servidor.createContext("/login",         ex -> handleLogin(ex));
        servidor.createContext("/buscarUsuario", ex -> handleBuscarUsuario(ex));
        servidor.createContext("/enviarMensagem",ex -> handleEnviarMensagem(ex));
        servidor.createContext("/mensagens",     ex -> handleMensagens(ex));

        servidor.setExecutor(Executors.newFixedThreadPool(4));
        servidor.start();
        System.out.println("✅ Servidor rodando em http://localhost:" + porta);
        System.out.println("   Rotas disponíveis:");
        System.out.println("   POST /cadastrar");
        System.out.println("   POST /login");
        System.out.println("   GET  /buscarUsuario?email=...");
        System.out.println("   POST /enviarMensagem");
        System.out.println("   GET  /mensagens?de=...&para=...&desde=...");
    }
}