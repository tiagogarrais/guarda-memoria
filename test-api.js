// Teste da API de entidades
const testEntityCreation = async () => {
  const testData = {
    tipo: "PESSOA",
    nome: "João Silva Teste",
    descricao: "Pessoa importante da cidade para teste",
    cidadeId: "test-city-id", // Este ID pode não existir, mas vamos testar a validação
    categoria: "Político",
    tags: ["história", "política"],
    profissao: "Professor",
    dataNascimento: "1980-01-01",
  };

  try {
    console.log("Enviando dados de teste:", JSON.stringify(testData, null, 2));

    const response = await fetch("http://localhost:3000/api/entidades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    console.log("Status:", response.status);
    console.log("Resposta:", result);

    if (!response.ok) {
      console.error("Erro na API:", result.error);
    } else {
      console.log("Entidade criada com sucesso!");
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
  }
};

// Executar teste
testEntityCreation();
