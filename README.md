# Guarda Memória

## Descrição do Projeto

Em todas as cidades existem pessoas que estão na memória dos residentes. São pessoas comuns que se tornam ícones locais, mas que a nova geração pode não conhecer ou dar valor se não souber da história. O "Guarda Memória" é um site estilo rede social dedicado a preservar e compartilhar essas histórias.

Na página inicial, há uma landing page aberta ao público. Após o login, os usuários acessam uma página para selecionar o estado e a cidade de interesse. Cada cidade possui sua própria lista de pessoas cadastradas e estrutura de pódio, com ranking baseado na popularidade local.

Os usuários indicam pessoas conhecidas para criar páginas dedicadas, podendo incluir a si mesmos (mas não obrigatório). Todas as interações, como comentários e materiais enviados, são identificadas corretamente com o usuário responsável.

O site promove a conexão intergeracional através de histórias compartilhadas.

## Funcionalidades Principais

- **Landing Page Pública**: Página inicial acessível sem login, apresentando o conceito do site.
- **Sistema de Autenticação**: Login via NextAuth.js (e-mail, Google, etc.) para acessar áreas restritas.
- **Seleção de Localização**: Após login, página para escolher estado e cidade, direcionando para o conteúdo local.
- **Página de Pessoas Cadastradas**: Exibe lista de pessoas da cidade selecionada com ranking de popularidade local.
- **Cadastro de Pessoas**: Usuários indicam pessoas conhecidas (incluindo si mesmos, opcionalmente) para criar páginas dedicadas em cidades específicas, incluindo nome, história, foto, etc. Todas as ações são identificadas com o usuário.
- **Sistema de Ranking por Cidade**: Pessoas são ranqueadas por popularidade dentro da cidade escolhida, baseado em votações, número de comentários, curtidas e fotos enviadas.
- **Pódio das Top 3 por Cidade**: Destaque visual para as três pessoas mais conhecidas da cidade no início da página.
- **Interação Social**: Possibilidade de curtir, comentar ou compartilhar histórias.
- **Página de Detalhes da Pessoa**: Ao clicar em uma pessoa, abre uma página estilo fórum com comentários, áudios, vídeos, relatos e materiais enviados pelos usuários.
- **Sistema de Logs**: Registro de todas as ações dos usuários (cadastros, comentários, uploads, etc.) para rastreabilidade e auditoria.
- **Moderação Comunitária**: Sistema de denúncias para conteúdos inadequados, com revisão por moderadores ou admins. Regras claras na landing page para promover um ambiente respeitoso.
- **Análise de Dados**: Dashboard para admins com estatísticas (ex.: cidades mais ativas, tendências de votações), usando gráficos para insights sobre o uso do site.
- **Personalização de Perfil**: Usuários podem personalizar perfis com foto, bio e cidades favoritas, e ver um histórico de suas contribuições (pessoas indicadas, comentários feitos).
- **Modo Offline ou PWA**: Tornar o site uma Progressive Web App (PWA) para acesso offline básico, permitindo leitura de histórias salvas, ideal para áreas com conectividade limitada.
- **Busca e Filtros Avançados**: Permitir busca por nome, categoria (ex.: "artistas", "líderes comunitários") ou tags personalizadas nas pessoas cadastradas. Filtros por data de nascimento, profissão ou eventos históricos relacionados.

## Tecnologias Utilizadas

- Next.js
- React
- Prisma
- MySQL
- NextAuth.js
- Armazenamento de Mídias: FTP para fotos e vídeos (URLs armazenadas no banco de dados)
- [Outras tecnologias]

## Estrutura do Projeto

[Descrição da estrutura de arquivos e pastas.]

## Como Executar

[Instruções para rodar o projeto.]

## Contribuições

[Como contribuir.]

## Licença

[Informações de licença.]
