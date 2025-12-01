const { spawn } = require("child_process");

async function testAPI() {
  try {
    console.log("Testando API com fetch...");
    const response = await fetch(
      "http://localhost:3000/api/cidades/slug/limoeirodonortece"
    );
    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Data:", data);
  } catch (error) {
    console.error("Erro:", error.message);
  }
}

console.log("Iniciando servidor...");
const server = spawn("npm", ["run", "dev"], {
  cwd: "/home/tiago/Documentos/Github/guarda-memoria",
  stdio: "pipe",
});

server.stdout.on("data", (data) => {
  const output = data.toString();
  if (output.includes("Ready in")) {
    console.log("Servidor pronto! Testando API...");
    setTimeout(() => {
      testAPI().then(() => {
        server.kill();
        process.exit(0);
      });
    }, 1000);
  }
});

server.stderr.on("data", (data) => {
  console.error("Server error:", data.toString());
});

setTimeout(() => {
  console.log("Timeout - parando servidor");
  server.kill();
  process.exit(1);
}, 15000);
