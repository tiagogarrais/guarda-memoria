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
- **Sistema de URLs Amigáveis**: URLs baseadas em slugs (ex: `/memorias/limoeirodonortece`).
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

O sistema suporta diferentes tipos de memórias culturais:

- **PESSOA**: Pessoas que marcaram a história da cidade
- **LUGAR**: Locais históricos, monumentos, pontos turísticos
- **EVENTO**: Eventos marcantes, festivais, ocorrências históricas
- **DATA**: Datas comemorativas ou históricas importantes
- **OBRA_ARTE**: Pinturas, esculturas, fotografias, músicas, etc.

Cada tipo de memória possui campos específicos para capturar informações relevantes.
