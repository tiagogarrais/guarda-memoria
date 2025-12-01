# PWA - Progressive Web App

O Guarda Memória agora é um **Progressive Web App (PWA)** totalmente funcional!

## ✅ Funcionalidades PWA Implementadas

### 📱 **Instalação como App**

- O site pode ser instalado como um aplicativo nativo no celular/desktop
- Aparece como app independente (sem barra de navegação do navegador)

### 🔄 **Offline Support**

- Service Worker com cache inteligente
- Funciona offline para recursos já visitados
- Estratégia Cache-First para recursos estáticos
- Network-First para páginas dinâmicas

### 🔔 **Notificações Push** (Base preparada)

- Estrutura para notificações push implementada
- Pode ser ativada futuramente

### 🎯 **Atalhos Rápidos**

- "Minhas Memórias" - Acesso direto às memórias salvas
- "Adicionar Memória" - Acesso direto para adicionar novas memórias

## 🚀 Como Testar o PWA

### No Chrome/Edge:

1. Abra o site em `http://localhost:3000`
2. Clique nos 3 pontos (⋮) no canto superior direito
3. Selecione "Instalar Guarda Memória" ou "Install app"

### No Firefox:

1. Abra o site em `http://localhost:3000`
2. Clique no ícone de instalação na barra de endereços
3. Ou vá em Menu → Instalar Este Site como um App

### No Safari (iOS):

1. Abra o site em `http://localhost:3000`
2. Toque no botão de compartilhamento (□⬆️)
3. Role para baixo e toque em "Adicionar à Tela de Início"

## 📁 Arquivos PWA Criados/Modificados

- `src/components/PWA.js` - Componente que registra o Service Worker
- `src/app/layout.js` - Meta tags PWA e link para manifest
- `public/manifest.json` - Configuração do app (atualizado)
- `public/sw.js` - Service Worker (melhorado)
- `public/icon-192.png` - Ícone 192x192 (placeholder)
- `public/icon-512.png` - Ícone 512x512 (placeholder)
- `public/favicon.ico` - Favicon (placeholder)

## 🎨 Personalização

### Ícones

Os ícones atuais são placeholders. Para personalizar:

1. Crie ícones PNG de 192x192 e 512x512 pixels
2. Substitua os arquivos `icon-192.png` e `icon-512.png` na pasta `public/`

### Cores

As cores podem ser ajustadas no `manifest.json`:

- `theme_color`: Cor da barra de status
- `background_color`: Cor de fundo durante o carregamento

## 🔧 Desenvolvimento

O PWA está totalmente funcional no ambiente de desenvolvimento. Para produção, certifique-se de que:

- Todos os arquivos estáticos são servidos com HTTPS
- O Service Worker é registrado apenas em produção
- Os ícones estão otimizados para web
