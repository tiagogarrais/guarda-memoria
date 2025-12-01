// Teste para API de perfil
// Execute com: node test-profile-api.js

const testData = {
  fullName: "João Silva",
  birthDate: "1990-01-01",
  cpf: "123.456.789-09", // CPF válido para teste
  whatsapp: "11999999999",
  whatsappCountryCode: "55",
  whatsappConsent: true,
  bio: "Bio de teste",
  fotoPerfilUrl: "",
  cidadesFavoritas: ["São Paulo", "Rio de Janeiro"],
};

console.log("🧪 Dados de teste para API /api/profile:");
console.log(JSON.stringify(testData, null, 2));

console.log("\n🔍 Para testar:");
console.log("1. Acesse http://localhost:3000/profile");
console.log("2. Faça login se necessário");
console.log("3. Preencha os campos com dados válidos:");
console.log("   - Nome: João Silva");
console.log("   - Data nascimento: 01/01/1990 (maior de 18 anos)");
console.log("   - CPF: 123.456.789-09 (formato válido)");
console.log("   - WhatsApp: 11999999999");
console.log("4. Clique em 'Salvar Perfil'");
console.log("5. Verifique os logs no terminal do servidor");

console.log("\n📋 CPFs válidos para teste:");
console.log("- 123.456.789-09");
console.log("- 111.444.777-35");
console.log("- 000.000.001-91");

console.log("\n🚨 Se ainda der erro, verifique:");
console.log("- Se você está logado no sistema");
console.log("- Se todos os campos obrigatórios estão preenchidos");
console.log("- Se a data de nascimento indica idade entre 18-120 anos");
console.log("- Se o CPF está no formato correto");
console.log("- Os logs detalhados no terminal do servidor");
