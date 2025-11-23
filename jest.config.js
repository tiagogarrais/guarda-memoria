module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.js", "**/?(*.)+(spec|test).js"],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/**/*.test.js",
    "!src/**/*.spec.js",
  ],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testTimeout: 10000,
  maxWorkers: 1, // Executar testes em série para evitar conflitos de banco
};
