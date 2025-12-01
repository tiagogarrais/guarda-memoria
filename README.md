# Guarda Memória

## Descrição do Projeto

Em todas as cidades existem histórias que estão na memória dos residentes. São pessoas, lugares, eventos, datas e obras de arte que marcaram a história local, mas que a nova geração pode não conhecer ou dar valor se não souber da história. O "Guarda Memória" é um site estilo rede social dedicado a preservar e compartilhar essas memórias culturais.

Na página inicial, há uma landing page aberta ao público. Após o login, os usuários acessam uma página para selecionar o estado e a cidade de interesse. Cada cidade possui sua própria lista de memórias cadastradas e estrutura de pódio, com ranking baseado na popularidade local.

Os usuários indicam memórias culturais para criar páginas dedicadas, podendo incluir pessoas, lugares históricos, eventos marcantes, datas importantes e obras de arte. Todas as interações, como comentários e materiais enviados, são identificadas corretamente com o usuário responsável.

O site promove a conexão intergeracional através de histórias compartilhadas e preserva a memória cultural das cidades.

## Funcionalidades Principais

- **Landing Page Pública**: Página inicial acessível sem login, apresentando o conceito do site.
- **Sistema de Autenticação**: Login via NextAuth.js (e-mail, Google, etc.) para acessar áreas restritas.
- **Cabeçalho Inteligente**: Header responsivo com informações do usuário, cidade atual e menu de navegação.
- **Sistema de URLs Amigáveis**: URLs baseadas em slugs (ex: `/memorias/limoeirodonortece`) em vez de UUIDs.
- **Seleção de Localização**: Após login, página para escolher estado e cidade, direcionando para o conteúdo local.
- **Navegação Contextual**: Barra de navegação dinâmica baseada na cidade selecionada.
- **Página de Memórias Cadastradas**: Exibe lista de memórias da cidade selecionada com ranking de popularidade local.
- **Cadastro de Memórias**: Usuários indicam memórias culturais (pessoas, lugares, eventos, datas, obras de arte) para criar páginas dedicadas em cidades específicas, incluindo nome, história, foto, etc. Todas as ações são identificadas com o usuário.
- **Sistema de Ranking por Cidade**: Memórias são ranqueadas por popularidade dentro da cidade escolhida, baseado em votações, número de comentários, curtidas e fotos enviadas.
- **Pódio das Top 3 por Cidade**: Destaque visual para as três memórias mais conhecidas da cidade no início da página.
- **Interação Social**: Possibilidade de curtir, comentar ou compartilhar histórias.
- **Página de Detalhes da Memória**: Ao clicar em uma memória, abre uma página estilo fórum com comentários, áudios, vídeos, relatos e materiais enviados pelos usuários.
- **Sistema de Logs**: Registro de todas as ações dos usuários (cadastros, comentários, uploads, etc.) para rastreabilidade e auditoria.
- **Moderação Comunitária**: Sistema de denúncias para conteúdos inadequados, com revisão por moderadores ou admins. Regras claras na landing page para promover um ambiente respeitoso.
- **Análise de Dados**: Dashboard para admins com estatísticas (ex.: cidades mais ativas, tendências de votações), usando gráficos para insights sobre o uso do site.
- **Personalização de Perfil**: Usuários podem personalizar perfis com foto, bio e cidades favoritas, e ver um histórico de suas contribuições (memórias indicadas, comentários feitos).
- **Modo Offline ou PWA**: Tornar o site uma Progressive Web App (PWA) para acesso offline básico, permitindo leitura de histórias salvas, ideal para áreas com conectividade limitada.
- **Busca e Filtros Avançados**: Permitir busca por nome, categoria (ex.: "pessoas", "lugares", "eventos", "obras de arte") ou tags personalizadas nas memórias cadastradas. Filtros por data, tipo ou eventos históricos relacionados.

## Tecnologias Utilizadas

- **Frontend**: Next.js 14, React 18
- **Backend**: Next.js API Routes
- **Banco de Dados**: MySQL com Prisma ORM
- **Autenticação**: NextAuth.js
- **Armazenamento de Mídias**: FTP para fotos, vídeos e arquivos (URLs armazenadas no banco)
- **UI/UX**: Componentes React customizados
- **Validação**: Formulários com validação client-side
- **Deploy**: Hospedagem com banco MySQL remoto

## Estrutura do Projeto

```
guarda-memoria/
├── prisma/
│   ├── schema.prisma          # Schema do banco de dados
│   └── migrations/            # Migrações do banco
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/              # API Routes
│   │   │   ├── memorias/     # CRUD de memórias
│   │   │   ├── comentarios/  # Sistema de comentários
│   │   │   ├── curtidas/     # Sistema de curtidas
│   │   │   └── ...           # Outras APIs
│   │   ├── memoria/[id]/     # Página de detalhes da memória
│   │   ├── memorias/[slug]/  # Lista de memórias por cidade (URLs amigáveis)
│   │   ├── indicar-memoria/  # Formulário de cadastro
│   │   └── ...               # Outras páginas
│   ├── components/           # Componentes React reutilizáveis
│   │   ├── SiteHeader.js     # Cabeçalho principal com login/logout
│   │   ├── NavigationBar.js  # Barra de navegação contextual
│   │   └── ...               # Outros componentes
│   └── lib/                  # Utilitários (Prisma, Auth, etc.)
│       ├── utils.js          # Geração de slugs e funções auxiliares
│       └── ...
├── public/                   # Arquivos estáticos
└── package.json

## Componentes de Interface

### SiteHeader
Cabeçalho principal do site com as seguintes funcionalidades:
- **Design responsivo**: Adaptável para desktop e mobile
- **Informações do usuário**: Exibe nome e foto de perfil quando logado
- **Cidade atual**: Mostra a cidade selecionada com botão para trocar
- **Menu dropdown**: Acesso ao perfil, seleção de cidade e logout
- **Navegação**: Link para home page

### NavigationBar
Barra de navegação contextual que aparece após login:
- **Links dinâmicos**: Baseados na cidade selecionada
- **Indicador ativo**: Destaca a página atual
- **Breadcrumb**: Mostra contexto da cidade atual
- **Responsivo**: Layout otimizado para mobile e desktop
- **Seções principais**: Memórias, Pessoas, Indicar Memória/Pessoa

### Sistema de URLs Amigáveis
- **Geração automática**: Slugs criados automaticamente (ex: `limoeirodonortece`)
- **SEO otimizado**: URLs descritivas em vez de UUIDs
- **Mapeamento de estados**: Conversão de códigos para siglas (CE, SP, RJ)
- **Caracteres especiais**: Remoção automática de acentos e normalização
```

### Tipos de Memória Suportados

O sistema suporta diferentes tipos de memórias culturais:

- **PESSOA**: Pessoas que marcaram a história da cidade
- **LUGAR**: Locais históricos, monumentos, pontos turísticos
- **EVENTO**: Eventos marcantes, festivais, ocorrências históricas
- **DATA**: Datas comemorativas ou históricas importantes
- **OBRA_ARTE**: Pinturas, esculturas, fotografias, músicas, etc.

Cada tipo de memória possui campos específicos para capturar informações relevantes.

## Como Executar

[Instruções para rodar o projeto.]

## Contribuições

[Como contribuir.]

## Desenvolvimento Local

### Pré-requisitos

- Node.js 18+
- Docker e Docker Compose
- Git

### Configuração do Ambiente

### Configuração do Ambiente

#### Opção 1: Banco Local (Recomendado para Desenvolvimento)

1. **Instale as dependências:**

   ```bash
   npm install
   ```

2. **Configure o banco de dados local:**

   ```bash
   # Inicie o MySQL local com Docker
   npm run db:start

   # Aguarde alguns segundos para o banco inicializar
   # Verifique se está rodando:
   npm run db:logs
   ```

3. **Configure as variáveis de ambiente:**

   ```bash
   # O .env.local já está configurado para o banco local
   # Verifique se as outras credenciais (Google, Email, FTP) estão corretas
   ```

4. **Execute as migrações:**

   ```bash
   npm run build:local  # ou DATABASE_URL="mysql://devuser:devpassword@localhost:3307/guarda_memoria_dev" npx prisma db push
   ```

5. **Inicie o servidor:**

   ```bash
   npm run dev:local  # Inicia automaticamente o banco Docker se necessário
   ```

   Ou manualmente:

   ```bash
   npm run db:start   # Iniciar banco
   npm run dev:local  # Iniciar aplicação
   ```

#### Opção 2: Banco de Produção (Deploy)

Para produção, use o arquivo `.env` com as credenciais do banco remoto.

### Comandos Úteis

```bash
# Banco de dados local
npm run db:start    # Iniciar MySQL Docker
npm run db:stop     # Parar MySQL Docker
npm run db:reset    # Resetar banco (remove dados)
npm run db:logs     # Ver logs do banco
npm run db:ensure   # Verificar/iniciar banco automaticamente

# Desenvolvimento
npm run dev         # Dev com banco de produção (.env)
npm run dev:local   # Dev com banco local (inicia DB automaticamente)
npm run build       # Build com banco de produção
npm run build:local # Build com banco local

# Testes
npm test            # Executar testes
npm run test:watch  # Modo watch
npm run test:coverage # Com cobertura

# Prisma
npm run prisma:generate  # Gerar cliente Prisma
npm run prisma:migrate   # Criar migração
```

### Estrutura do Banco

O projeto usa **dois ambientes de banco**:

- **Desenvolvimento**: MySQL local via Docker (`docker-compose.yml`)
- **Produção**: MySQL remoto (Hostinger)

As configurações são separadas:

- `.env.local` → Desenvolvimento
- `.env` → Produção

### Testes

```bash
npm test              # Executar todos os testes
npm run test:watch    # Modo watch
npm run test:coverage # Com cobertura
```

## Licença

[Informações de licença.]
