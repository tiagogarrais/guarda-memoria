# Guarda Memória - Documentação Técnica

## 📋 Visão Geral da Arquitetura

O **Guarda Memória** é uma aplicação web full-stack construída com Next.js 14, utilizando uma arquitetura moderna e escalável para preservação de memórias culturais.

## 🏗️ Arquitetura do Sistema

### **Frontend**

- **Framework**: Next.js 14 com App Router
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
│   │   ├── media/                # API de mídias
│   │   │   └── [mediaId]/
│   │   │       └── knowledge/    # API de conhecimentos
│   │   ├── states/               # API de estados
│   │   ├── update-location/      # Atualização de localização
│   │   └── upload/               # Upload de mídias
│   ├── auth/                     # Páginas de autenticação
│   ├── cidade/[cityId]/          # Páginas dinâmicas de cidades
│   ├── components/               # Componentes React
│   ├── globals.css               # Estilos globais
│   ├── layout.js                 # Layout principal
│   └── page.js                   # Página inicial
├── lib/                          # Utilitários e bibliotecas
│   └── mediaUtils.js             # Funções de mídia
├── prisma/                       # Schema e configurações do banco
│   ├── schema.prisma             # Schema do banco de dados
│   └── seed.js                   # Dados iniciais
├── public/                       # Arquivos estáticos
├── scripts/                      # Scripts utilitários
│   └── populate-scores.js        # Script de população de pontuações
├── docker/                       # Configurações Docker
└── package.json                  # Dependências e scripts
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
  stateId       Int?      // Estado selecionado
  cityId        Int?      // Cidade selecionada
  city          City?     @relation(fields: [cityId], references: [id])
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
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
  parentId  String?  // ID da mídia pai (comentários)
  replies   Media[]  @relation("MediaReplies") // Respostas
  knowledge MediaKnowledge[] // Conhecimentos
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
- **`lib/mediaUtils.js`**: Utilitários para manipulação de mídias

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
  "next": "^14.2.15",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "@prisma/client": "^5.15.0",
  "prisma": "^5.15.0",
  "next-auth": "^4.24.7",
  "tailwindcss": "^3.4.1",
  "cloudinary": "^2.2.0"
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

# NextAuth
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secret-key"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
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
