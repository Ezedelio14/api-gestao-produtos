# 📦 API de Gestão de Produtos e Inventário

Uma API robusta e escalável desenvolvida com **Node.js, Fastify e TypeScript**, estruturada sob princípios de Arquitetura Limpa (Use Cases e Repositories). O sistema gerencia inventário, vendas, controle de estoque e controle de acessos (RBAC).

---

## ✨ Funcionalidades Principais

- 🔐 **Autenticação e Autorização:** Login com JWT e controle de acesso baseado em cargos (`SUPERADMIN`, `ADMIN`, `MANAGER`, `USER`).
- 👥 **Gestão de Usuários:** CRUD completo de colaboradores e permissões.
- 🏭 **Fornecedores & Categorias:** Organização de produtos e rastreio de fornecedores.
- 🛍️ **Produtos com Fotos:** Cadastro de produtos recebendo imagens via `multipart/form-data`, convertidas magicamente e armazenadas em **Base64** no banco de dados.
- 🛒 **Vendas (Pedidos):** Criação de pedidos com baixa automática de estoque.
- 📦 **Controle de Estoque:** Ajuste manual de entradas/saídas e histórico (auditoria) de movimentações de cada produto.
- 📊 **Dashboard:** Rota de estatísticas agregando totais, produtos sem estoque e valor total do inventário.
- 📚 **Documentação Interativa:** Interface visual com Swagger (OpenAPI 3) utilizando integração direta com as validações do Zod.

---

## 🚀 Tecnologias Utilizadas

- **[Node.js](https://nodejs.org/)** & **[TypeScript](https://www.typescriptlang.org/)**
- **[Fastify](https://www.fastify.io/)** (Framework Web super rápido)
- **[Prisma ORM](https://www.prisma.io/)** (Modelagem de Banco de Dados)
- **[PostgreSQL](https://www.postgresql.org/)** (Banco de dados relacional)
- **[Zod](https://zod.dev/)** (Validação de schemas e integração nativa com o Swagger)
- **[Bcrypt.js](https://www.npmjs.com/package/bcryptjs)** (Criptografia de senhas)
- **[ES Modules (ESM)](https://nodejs.org/api/esm.html)** (Sintaxe de importação moderna do JavaScript)

---

## 🛠️ Pré-requisitos

Certifique-se de ter os seguintes softwares instalados no seu sistema (macOS, Linux ou Windows):

- [Node.js](https://nodejs.org/) (Versão 20 ou superior)
- [PostgreSQL](https://www.postgresql.org/) (Serviço ativo rodando na porta `5432`)

---

## ⚙️ Instalação e Configuração

**1. Clone ou acesse a pasta do repositório**

```bash
cd api-gestao-produtos
```
