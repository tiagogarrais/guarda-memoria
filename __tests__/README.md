# Testes - Guarda Memória

Este diretório contém os testes automatizados para o sistema Guarda Memória, utilizando Jest como framework de testes.

## Estrutura dos Testes

```
__tests__/
├── entidades.test.js          # Testes da API de entidades
├── curtidas.test.js           # Testes da API de curtidas
├── comentarios.test.js        # Testes da API de comentários
├── upload-obra-arte.test.js   # Testes de upload de obras de arte
├── integration.test.js        # Testes de integração (fluxo completo)
├── jest.config.js             # Configuração do Jest
└── jest.setup.js              # Setup global dos testes
```

## Como Executar os Testes

### Pré-requisitos

1. **Banco de dados de teste**: Configure uma base de dados MySQL separada para testes
2. **Variáveis de ambiente**: Crie um arquivo `.env.test` com as configurações de teste

```bash
# .env.test
DATABASE_URL="mysql://usuario:senha@localhost:3306/guarda_memoria_test"
NEXTAUTH_SECRET="test-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### Comandos

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch (re-executa automaticamente)
npm run test:watch

# Executar testes com coverage
npm test -- --coverage

# Executar apenas um arquivo específico
npm test entidades.test.js

# Executar apenas um teste específico
npm test -t "deve criar uma entidade do tipo PESSOA"
```

## Tipos de Testes

### 1. Testes Unitários

- Validação de entrada/saída das APIs
- Tratamento de erros
- Lógica de negócio

### 2. Testes de Integração

- Fluxo completo: criar entidade → curtir → comentar
- Interação entre diferentes APIs
- Validações cross-API

### 3. Testes de Regressão

- Garantir que mudanças não quebrem funcionalidades existentes
- Cobertura de cenários de erro

## Cobertura de Testes

Os testes cobrem:

### API Entidades (`/api/entidades`)

- ✅ Criação de entidades (todos os tipos)
- ✅ Validação de campos obrigatórios
- ✅ Validação de tipos válidos
- ✅ Busca e filtragem
- ✅ Tratamento de erros

### API Curtidas (`/api/curtidas`)

- ✅ Criar/remover curtidas
- ✅ Contagem de curtidas
- ✅ Validações

### API Comentários (`/api/comentarios`)

- ✅ Criar comentários
- ✅ Buscar comentários
- ✅ Validações de texto

### API Upload (`/api/upload-obra-arte`)

- ✅ Upload de arquivos
- ✅ Validação de tipos
- ✅ Validação de tamanho
- ✅ Integração com FTP

## Boas Práticas Implementadas

### Setup/Teardown

- Banco limpo entre testes
- Mocks apropriados (NextAuth, FTP)
- Servidor isolado por teste

### Validações Abrangentes

- Casos de sucesso
- Casos de erro
- Cenários edge
- Validações de segurança

### Manutenibilidade

- Testes legíveis e descritivos
- Estrutura organizada
- Reutilização de código

## Executando Testes em CI/CD

Para integração contínua:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: "18"
      - run: npm ci
      - run: npm test
      - run: npm test -- --coverage
```

## Debugging

### Testes falhando?

1. Verifique se o banco de teste está configurado
2. Execute `npm test -- --verbose` para mais detalhes
3. Use `npm test -- --runInBand` para execução sequencial

### Coverage baixa?

- Adicione mais testes para caminhos não cobertos
- Foque em lógica crítica e cenários de erro

## Contribuindo

Ao adicionar novas funcionalidades:

1. **Sempre escreva testes primeiro** (TDD)
2. **Mantenha cobertura > 80%**
3. **Teste cenários de erro**
4. **Atualize testes existentes** se modificar APIs

## Comandos Úteis

```bash
# Ver coverage no navegador
npm test -- --coverage && open coverage/lcov-report/index.html

# Executar apenas testes que falharam na última execução
npm test -- --onlyFailures

# Executar testes em paralelo (padrão)
npm test -- --maxWorkers=4
```
