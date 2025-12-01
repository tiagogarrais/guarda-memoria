/**
 * Teste das correções para problema de ambiguidade de cidades
 *
 * PROBLEMA RESOLVIDO:
 * - Antes: Salvava apenas nomes das cidades ["São Miguel", "Limoeiro do Norte"]
 * - Agora: Salva objetos completos com estado [{stateId, cityId, stateName, cityName}, ...]
 *
 * EXEMPLO:
 * Antes: "São Miguel" (ambíguo - qual estado?)
 * Agora: {stateId: 22, cityId: 12345, stateName: "Piauí", cityName: "São Miguel"}
 */

// Formato antigo (problemático)
const formatoAntigoProblematico = ["São Miguel", "Limoeiro do Norte"];

// Novo formato (resolve ambiguidade)
const novoFormatoCorreto = [
  {
    stateId: 22,
    cityId: 12345,
    stateName: "Piauí",
    cityName: "São Miguel",
  },
  {
    stateId: 23,
    cityId: 67890,
    stateName: "Ceará",
    cityName: "Limoeiro do Norte",
  },
];

// Exemplo de cidades com mesmo nome em estados diferentes
const exemploAmbiguidade = [
  {
    stateId: 22,
    cityId: 111,
    stateName: "Piauí",
    cityName: "São Miguel",
  },
  {
    stateId: 26,
    cityId: 222,
    stateName: "Pernambuco",
    cityName: "São Miguel", // MESMA CIDADE, ESTADO DIFERENTE!
  },
];

console.log("=== TESTE DE CORREÇÃO DE AMBIGUIDADE ===");
console.log("Formato antigo (problemático):", formatoAntigoProblematico);
console.log("Novo formato (resolve ambiguidade):", novoFormatoCorreto);
console.log("Exemplo de ambiguidade resolvida:", exemploAmbiguidade);

// Verificar se duas cidades são diferentes mesmo com nome igual
const cidade1 = exemploAmbiguidade[0];
const cidade2 = exemploAmbiguidade[1];

console.log("\n=== VERIFICAÇÃO DE UNICIDADE ===");
console.log(
  `Cidade 1: ${cidade1.cityName} - ${cidade1.stateName} (ID: ${cidade1.cityId})`
);
console.log(
  `Cidade 2: ${cidade2.cityName} - ${cidade2.stateName} (ID: ${cidade2.cityId})`
);
console.log(
  `São cidades diferentes? ${
    cidade1.cityId !== cidade2.cityId ? "SIM ✅" : "NÃO ❌"
  }`
);
console.log(
  `Estados diferentes? ${
    cidade1.stateId !== cidade2.stateId ? "SIM ✅" : "NÃO ❌"
  }`
);
