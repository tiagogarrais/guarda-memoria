# Guarda Memória - Documentação Técnica

## 📋 Visão Geral da Arquitetura

O **Guarda Memória** é uma aplicação web full-stack construída com Next.js 14, utilizando uma arquitetura moderna e escalável para preservação de memórias culturais.

## 🏗️ Arquitetura do Sistema

### **Frontend**

- **Framework**: Next.js 15 com App Router
- **Linguagem**: JavaScript/TypeScript
- **Styling**: Tailwind CSS
- **Componentes**: React com hooks e context API

### **Backend**

- **API Routes**: Next.js API Routes (Serverless)
- **ORM**: Prisma com MySQL
- **Autenticação**: NextAuth.js
- **Validação**: Built-in Next.js validation

### **Infraestrutura**

- **Banco de Dados**: MySQL (PlanetScale/Hostinger)
- **Armazenamento de Mídia**: Cloudinary
- **Deploy**: Vercel

## 📁 Estrutura do Projeto

```
guarda-memoria/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/[...nextauth]/   # Autenticação NextAuth
│   │   ├── cities/               # API de cidades
│   │   │   └── [cityId]/
│   │   ├── cities-all/           # API de todas as cidades
│   │   ├── cloudinary-signature/ # Assinatura para uploads Cloudinary
│   │   ├── media/                # API de mídias
│   │   │   └── [mediaId]/
│   │   │       └── knowledge/    # API de conhecimentos
│   │   ├── permalink/            # API de permalinks
│   │   │   └── [permalink]/
│   │   ├── states/               # API de estados
│   │   ├── update-location/      # Atualização de localização
│   │   ├── upload/               # Upload de mídias
│   │   └── user/                 # APIs de usuário
│   │       ├── add-favorite-city/
│   │       ├── remove-favorite-city/
│   │       └── update-display-name/
│   ├── admin/                    # Página de administração
│   ├── auth/                     # Páginas de autenticação
│   │   └── signin/
│   ├── cidade/[citySlug]/        # Páginas dinâmicas de cidades
│   ├── components/               # Componentes React
│   ├── globals.css               # Estilos globais
│   ├── layout.js                 # Layout principal
│   ├── page.js                   # Página inicial
│   ├── postagem/[permalink]/     # Páginas de postagens
│   │   └── qr/                   # Página de QR code
│   ├── select-location/          # Seleção de localização
│   └── usuario/                  # Página de perfil do usuário
├── lib/                          # Utilitários e bibliotecas
│   ├── mediaUtils.js             # Funções de mídia
│   └── userUtils.js              # Funções de usuário
├── prisma/                       # Schema e configurações do banco
│   ├── schema.prisma             # Schema do banco de dados
│   ├── seed.js                   # Dados iniciais
│   ├── seed.js.backup            # Backup do seed
│   └── migrations/               # Migrações do banco
├── public/                       # Arquivos estáticos
│   └── estados-cidades2.json     # Dados de estados e cidades
├── scripts/                      # Scripts utilitários
│   └── populate-scores.js        # Script de população de pontuações
├── docker/                       # Configurações Docker
│   └── mysql/                    # Configuração MySQL Docker
│       └── init/
├── generate-city-slugs.js        # Script para gerar slugs de cidades
├── jsconfig.json                 # Configuração JavaScript
├── middleware.js                 # Middleware Next.js
├── next-env.d.ts                 # Tipos Next.js
├── next.config.js                # Configuração Next.js
├── package.json                  # Dependências e scripts
├── postcss.config.js             # Configuração PostCSS
├── README.md                     # Documentação principal
├── README-TECHNICAL.md           # Documentação técnica
└── tailwind.config.js            # Configuração Tailwind CSS
```

## 🗄️ Modelo de Dados

### **Entidades Principais**

#### **User (Usuário)**

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  displayName   String?   // Nome personalizado para exibição no site
  stateId       Int?      // Estado selecionado
  cityId        Int?      // Cidade selecionada
  city          City?     @relation(fields: [cityId], references: [id])
  favoriteCities City[]   @relation("UserFavoriteCities") // Cidades favoritas do usuário
  accounts      Account[]
  sessions      Session[]
  medias        Media[]   // Mídias criadas
  knowledge     MediaKnowledge[] // Conhecimentos marcados
}
```

#### **Media (Mídia/Postagem)**

```prisma
model Media {
  id        String   @id @default(cuid())
  publicId  String?  @unique // ID Cloudinary
  url       String?  // URL da mídia
  text      String?  // Texto da postagem
  type      String   // "image", "video", "audio", "text"
  categories String? // JSON: ["local", "pessoa", "historia"]
  userId    String   // Autor
  stateId   Int      // Estado
  cityId    Int      // Cidade
  score     Int      @default(0) // Pontuação calculada
  permalink String   @unique // Link permanente único baseado em timestamp
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
  parentId  String?  // ID da mídia pai (comentários)
  replies   Media[]  @relation("MediaReplies") // Respostas
  knowledge MediaKnowledge[] // Conhecimentos
  qrVisits  Int      @default(0) // Contador de visitas via QR code
}
```

#### **MediaKnowledge (Conhecimento)**

```prisma
model MediaKnowledge {
  id       String @id @default(cuid())
  userId   String
  mediaId  String
  user     User   @relation(fields: [userId], references: [id])
  media    Media  @relation(fields: [mediaId], references: [id])
  createdAt DateTime @default(now())

  @@unique([userId, mediaId]) // Um usuário conhece uma mídia apenas uma vez
}
```

#### **Visit (Visita/Analytics)**

```prisma
model Visit {
  id        String   @id @default(cuid())
  timestamp DateTime @default(now())
  source    String?  // Ex: "qr", "direct", etc.
  path      String   // Caminho da página visitada
  userAgent String?  // User agent do navegador
  ip        String?  // IP do visitante (opcional)

  @@index([timestamp])
  @@index([source])
}
```

## 🔄 Algoritmo de Pontuação

### **Cálculo da Pontuação**

```
Pontuação = Número de Comentários + Número de "Eu Conheço"
```

### **Ordenação do Feed**

1. **Primário**: Pontuação (decrescente)
2. **Secundário**: Data de criação (decrescente)

### **Atualização Automática**

- **Comentários**: Pontuação recalculada quando um comentário é adicionado
- **Conhecimentos**: Pontuação recalculada quando alguém clica em "Eu conheço"
- **Script de população**: `scripts/populate-scores.js` para dados existentes

## 🚀 APIs Principais

### **GET /api/media**

**Descrição**: Busca mídias com filtros e ordenação por pontuação

**Parâmetros**:

- `cityId` (opcional): Filtrar por cidade específica

**Resposta**:

```json
{
  "medias": [
    {
      "id": "string",
      "text": "string",
      "type": "image|video|audio|text",
      "score": 5,
      "knowledgeCount": 3,
      "userKnows": true,
      "replies": [...],
      "user": { "name": "string", "image": "string" }
    }
  ]
}
```

### **POST /api/media/[mediaId]/knowledge**

**Descrição**: Toggle do botão "Eu conheço"

**Resposta**:

```json
{
  "action": "added|removed",
  "knowledgeCount": 4,
  "userKnows": true,
  "score": 6
}
```

### **POST /api/upload**

**Descrição**: Upload de novas mídias/comentários

**Campos**:

- `file|audio`: Arquivo de mídia
- `text`: Texto da postagem
- `categories`: JSON array de categorias
- `parentId`: ID da mídia pai (para comentários)

### **GET /api/cities**

**Descrição**: Lista cidades, opcionalmente filtradas por estado

**Parâmetros**:

- `stateId` (opcional): ID do estado

### **GET /api/cities-all**

**Descrição**: Lista todas as cidades sem filtros

### **GET /api/states**

**Descrição**: Lista todos os estados

### **POST /api/cloudinary-signature**

**Descrição**: Gera assinatura para upload direto no Cloudinary

### **POST /api/user/add-favorite-city**

**Descrição**: Adiciona uma cidade aos favoritos do usuário

### **POST /api/user/remove-favorite-city**

**Descrição**: Remove uma cidade dos favoritos

### **POST /api/user/update-display-name**

**Descrição**: Atualiza o nome de exibição do usuário

### **POST /api/update-location**

**Descrição**: Atualiza localização (estado/cidade) do usuário

### **GET /api/permalink/[permalink]**

**Descrição**: Redireciona para a postagem correspondente ao permalink

## �️ Sistema de QR Codes

### **Funcionalidade**

O sistema de QR codes permite gerar cartões impressos para cada postagem, facilitando o compartilhamento físico das memórias culturais.

### **Implementação**

- **Biblioteca**: `react-qr-code` para geração client-side
- **Rota**: `/postagem/[permalink]/qr` - Página dedicada para impressão
- **Conteúdo**: Título, autor, data, descrição e QR code
- **Design**: Layout monocromático otimizado para impressão laser

### **Estrutura da Página QR**

```javascript
// app/postagem/[permalink]/qr/page.js
- Busca postagem pelo permalink
- Renderiza layout de impressão
- QR code aponta para URL da postagem
```

## 📊 Sistema de Analytics

### **Funcionalidade**

O sistema coleta dados de visitas para análise de engajamento e popularidade das postagens.

### **Implementação**

- **Modelo Visit**: Registra cada acesso com timestamp, source (qr/direct), path, etc.
- **Página Admin**: `/admin` - Exibe estatísticas como total de visitas, top posts por score, visitas via QR.
- **Contadores**: `qrVisits` no modelo Media para visitas específicas via QR.

### **Métricas Coletadas**

- Total de visitas gerais
- Visitas via QR code
- Top 5 postagens por pontuação
- Detalhes de cada visita (opcional: IP, user agent)

## 🔗 Sistema de Permalinks

### **Funcionalidade**

O sistema de permalinks permite acesso direto às postagens através de URLs permanentes e amigáveis.

### **Implementação**

- **Geração**: Timestamp + string aleatória (ex: `1766276840497-3yusj6`)
- **Unicidade**: Campo único no banco de dados
- **Indexação**: Índice otimizado para buscas rápidas
- **Redirecionamento**: API `/api/permalink/[permalink]` para compatibilidade

### **Estrutura das URLs**

- **Postagens**: `/postagem/{permalink}`
- **QR Codes**: `/postagem/{permalink}/qr`
- **API de redirecionamento**: `/api/permalink/{permalink}`

## 👤 Sistema de Nomes de Exibição

### **Funcionalidade**

Os usuários podem personalizar como seu nome aparece no site através do displayName.

### **Implementação**

- **Campo opcional**: `displayName` no modelo User
- **Priorização**: displayName > name (Google) > "Usuário"
- **Página de perfil**: `/usuario` para edição
- **API**: `/api/user/update-display-name` para atualização
- **Utilitário**: `lib/userUtils.js` para lógica de exibição

### **Validação**

- Máximo 50 caracteres
- Campo opcional (pode ser vazio)

## 🌟 Sistema de Cidades Favoritas

### **Funcionalidade**

Os usuários podem marcar cidades como favoritas para acesso rápido e personalização.

### **Implementação**

- **Relação many-to-many**: User ↔ City via tabela `_UserFavoriteCities`
- **Página de perfil**: `/usuario` para gerenciamento
- **APIs**:
  - `POST /api/user/add-favorite-city` - Adicionar favorita
  - `POST /api/user/remove-favorite-city` - Remover favorita
- **Componente**: `FavoriteCitiesSection` para exibição e gerenciamento

### **Limitações**

- Sem limite de cidades favoritas
- Uma cidade pode ser favorita de múltiplos usuários

## 🔧 Scripts e Utilitários

### **Scripts do Package.json**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "db:seed": "node prisma/seed.js"
  }
}
```

### **Scripts Personalizados**

- **`scripts/populate-scores.js`**: Calcula pontuações para mídias existentes
- **`generate-city-slugs.js`**: Gera slugs únicos para cidades brasileiras
- **`lib/mediaUtils.js`**: Utilitários para manipulação de mídias
- **`lib/userUtils.js`**: Utilitários para manipulação de usuários

## 🔐 Sistema de Autenticação

### **NextAuth.js Configuration**

- **Providers**: Google, GitHub, Email
- **Database**: Sessões armazenadas no MySQL via Prisma
- **Middleware**: Proteção automática de rotas

### **Rotas Protegidas**

- `/api/media` - Requer autenticação
- `/api/upload` - Requer autenticação
- `/select-location` - Requer autenticação

## 📦 Dependências Principais

### **Runtime Dependencies**

```json
{
  "next": "^15.5.7",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "@prisma/client": "^5.15.0",
  "prisma": "^5.15.0",
  "next-auth": "^4.24.7",
  "tailwindcss": "^3.4.1",
  "cloudinary": "^2.2.0",
  "react-qr-code": "^2.0.18"
}
```

### **Development Dependencies**

```json
{
  "@types/node": "^20.12.7",
  "@types/react": "^18.2.0",
  "eslint": "^8.57.0",
  "eslint-config-next": "^14.2.5"
}
```

## 🚀 Deploy e Configuração

### **Variáveis de Ambiente**

```env
# Database
DATABASE_URL="mysql://user:password@host:port/database"
SHADOW_DATABASE_URL="mysql://user:password@host:port/database_shadow"

# NextAuth
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secret-key"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email (opcional)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASS="your-app-password"
EMAIL_FROM="your-email@gmail.com"
```

### **Comandos de Deploy**

```bash
# Instalar dependências
npm install

# Configurar banco de dados
npx prisma db push

# Popular dados iniciais
npm run db:seed

# Calcular pontuações existentes
node scripts/populate-scores.js

# Build e deploy
npm run build
```

## 🔍 Monitoramento e Debugging

### **Logs do Next.js**

- **Development**: `npm run dev` com logs detalhados
- **Production**: Logs disponíveis no dashboard da Vercel

### **Prisma Studio**

```bash
npx prisma studio
```

Interface visual para inspeção do banco de dados.

### **Debugging de API**

- Todas as rotas incluem tratamento de erros
- Logs detalhados em desenvolvimento
- Respostas estruturadas com códigos HTTP apropriados

**Documentação atualizada em**: Dezembro 2025
