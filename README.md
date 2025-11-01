# Base para aplicativo web

Este é um template de projeto para criação de aplicativos web que oferece autenticação segura por e-mail, utilizando magic links. É baseado em tecnologias populares, como Node.js, Next.js, React, NextAuth.js e Nodemailer, e foi projetado para simplificar o processo de início de projetos.

## Visão Geral

Um aplicativo web é um programa de computador que pode ser acessado de praticamente qualquer lugar do mundo através de um navegador web. Este template permite criar um ambiente onde os usuários podem navegar em uma página inicial pública e, a partir dela, acessar áreas restritas garantidas por autenticação por e-mail. O método de autenticação envolve o envio de um e-mail com um link de acesso único.

## Tecnologias Utilizadas

Para começar, você precisará das seguintes tecnologias:

- **Node.js**: Ambiente de execução JavaScript no servidor.
- **Next.js**: Framework React para renderização no lado do servidor.
- **React**: Biblioteca JavaScript para criar interfaces de usuário.
- **NextAuth.js**: Biblioteca para implementar autenticação segura.
  - **Nodemailer**: Para o envio de e-mails.
  - **Credenciais para envio de e-mails no arquivo .env**.
  - **Banco de dados para NextAuth.js - PostgreSQL**.

## Como Usar

1. Clone este repositório: `git clone https://github.com/tiagogarrais/base-para-aplicativo-web`.
2. Copie o arquivo .env.example e o renomeie para .env.
3. Preencha as informações necessárias no arquivo .env.
4. Execute `npm install` para instalar as dependências.
5. Execute `npm run dev` para iniciar o servidor de desenvolvimento.
6. Personalize a interface do usuário e adicione recursos conforme necessário.
7. Implemente seu aplicativo e comece a usá-lo.

## Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para fazer melhorias, correções de bugs ou adicionar recursos adicionais a este template. Basta abrir uma issue ou enviar um pull request.

---

Criado por Tiago das Graças Arrais - [Perfil no GitHub](https://github.com/tiagogarrais)
