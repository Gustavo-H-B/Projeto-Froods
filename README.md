# 🍔 Projeto Froods

Bem-vindo ao **Froods**! 🚀

Uma solução **backend completa e robusta** para o gerenciamento inteligente de restaurantes, pedidos e clientes. Construído com foco em **escalabilidade**, **segurança** e **organização**.

---

## 🎯 Objetivo do Projeto

O **Froods** foi desenvolvido para resolver os desafios comuns na gestão de delivery e estabelecimentos gastronômicos, oferecendo uma **API RESTful** poderosa que interliga restaurantes, clientes e pedidos de forma eficiente.

### ✨ Diferenciais
- **Robustez**: Validações detalhadas de dados e regras de negócio complexas.
- **Segurança**: Prevenção contra deleção de registros com histórico (integridade referencial lógica).
- **Flexibilidade**: Atualizações dinâmicas de registros.

---

## �️ Tecnologias & Arquitetura

O projeto utiliza uma stack moderna e performática:

| Tecnologia | Descrição |
| :--- | :--- |
| **Node.js** | Ambiente de execução JavaScript de alta performance. |
| **Express** | Framework web rápido e minimalista para criação de rotas e middlewares. |
| **MySQL** | Banco de dados relacional robusto para integridade dos dados. |
| **Dotenv** | Gerenciamento seguro de variáveis de ambiente. |

---

## 📂 Estrutura do Projeto

A arquitetura foi pensada para facilitar a manutenção e o entendimento do fluxo de dados:

### 🔹 `config`
- **db.js**: Coração da conexão com o banco de dados. Gerencia pools de conexão e verifica a integridade do acesso.

### 🔹 `src`
- **app.js**: Inicializa a aplicação, configura middlewares e rotas globais.
- **server.js**: Centralizador de rotas da API, organizando os endpoints por domínio.
- **routes/**: Onde a mágica acontece. Cada arquivo representa um domínio da aplicação (Alimentos, Clientes, Pedidos, etc.).

---

## 🚀 Funcionalidades Principais (Features)

### 1. Gestão de Alimentos (`/alimentos`)
- **CRUD Completo**: Criar, Ler, Atualizar e Deletar itens do cardápio.
- **Validações Rigorosas**:
  - Verificação de unicidade de nome (evita duplicidade).
  - Limites de caracteres para nomes e categorias.
  - Validação de preço máximo e mínimo.
- **Segurança na Exclusão**: Impede a remoção de alimentos que já possuem pedidos vinculados, preservando o histórico financeiro.

### 2. Gestão de Restaurantes (`/restaurantes`)
- Administração completa das unidades.
- Controle de dados cadastrais como CNPJ e Endereço.

### 3. Gestão de Clientes (`/clientes`)
- Cadastro e manutenção de perfis de clientes.
- Histórico de pedidos e informações de contato.

### 4. Controle de Pedidos (`/pedidos`)
- Fluxo completo de pedidos: do carrinho à entrega.
- Rastreamento de status e pagamentos.

### 5. Relatórios Estratégicos (`/relatorios`)
- Geração de métricas de vendas.
- Análise de desempenho por restaurante ou período.

---

## � Endpoints da API

Aqui estão as principais rotas disponíveis para consumo:

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/alimentos` | Lista todos os alimentos com detalhes do restaurante. |
| `GET` | `/alimentos/:id` | Busca um alimento específico pelo ID. |
| `POST` | `/alimentos/adicionar` | Cria um novo alimento (com validações de negócio). |
| `PUT` | `/alimentos/:id/atualizar` | Atualiza dados de um alimento dinamicamente. |
| `DELETE` | `/alimentos/:id/deletar` | Remove um alimento (se não houver vendas vinculadas). |
| ... | ... | *E muito mais para Clientes, Pedidos e Restaurantes.* |

---

## 🏁 Como Executar

Para rodar este projeto localmente:

### Pré-requisitos
- **Node.js** e **npm** instalados.
- Banco de dados **MySQL** configurado.

### Instalação

1. Clone o repositório e instale as dependências:
   ```bash
   npm install
   ```

2. Configure suas variáveis de ambiente no arquivo `.env`.

3. Inicie o servidor:
   ```bash
   npm start
   ```

Agora a API estará rodando e pronta para receber requisições! 🚀

---

# ADM

![meme](https://github.com/user-attachments/assets/2d4204bb-a77d-4c39-ac7d-922dbf203a15)