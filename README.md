# ♟️ Sistema de Repertório: Livro de Aberturas de Xadrez

## 📖 Sobre o Projeto
O **Livro de Aberturas** é um sistema completo (Fullstack) desenvolvido para resolver o problema de organização e estudo de enxadristas. Ele permite que jogadores centralizem seu repertório de aberturas, estruturem variantes teóricas e salvem o histórico e a precisão de partidas reais jogadas nessas linhas. 

Como diferencial técnico, o sistema conta com autenticação de usuários via JWT e um **visualizador gráfico de tabuleiro integrado**, que lê a notação FEN do banco de dados e renderiza as posições em tempo real no frontend em React.

---

## 👥 Integrantes
* **Ivy Oliveira dos Reis**

---

## ⚙️ Pré-requisitos
Para executar este projeto localmente, você precisará instalar:
* **[.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)**
* **[Node.js](https://nodejs.org/)** (versão 18 ou superior)
* **[PostgreSQL](https://www.postgresql.org/)** (Rodando localmente ou via Docker)

---

## 🚀 Passo a Passo de Execução

### 1. Banco de Dados e Configuração do Backend
1. Clone este repositório:
   ```bash
   git clone [https://github.com/seu-usuario/seu-repositorio.git](https://github.com/seu-usuario/seu-repositorio.git)
Abra a pasta do backend (LivroAberturasAPI).

Abra o arquivo appsettings.json (ou appsettings.Development.json) e configure a sua string de conexão com o PostgreSQL. Exemplo:

JSON


"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Database=aberturas_db;Username=postgres;Password=sua_senha"
}
Restaure as dependências do .NET:

Bash


dotnet restore
Aplique as Migrations para criar as tabelas no banco de dados:

Bash


dotnet ef database update
Inicie a API:

Bash


dotnet run
A API estará rodando em http://localhost:5000 (ou na porta especificada no launchSettings.json).

2. Configuração do Frontend (React)
Abra um novo terminal e navegue até a pasta do frontend (FrontendAberturasChess):

Bash


cd FrontendAberturasChess
Instale as dependências do projeto:

Bash


npm install
Inicie o servidor de desenvolvimento (Vite):

Bash


npm run dev
Acesse o sistema no navegador: http://localhost:5173.

🗺️ Diagrama de Entidades (DER)
![Diagrama Lógico de Entidades](./frontend-xadrez/docs/modelogico.png)
Nota: O diagrama ilustra a modelagem relacional estrita do domínio.

1:N (Um para Muitos): Usuario cadastra múltiplas Aberturas.

1:N (Um para Muitos): Uma Abertura possui muitas Variantes teóricas.

1:N (Um para Muitos): Uma Variante pode ter várias Partidas reais associadas.

1:1 (Um para Um): Cada Partida possui uma única métrica de Precisao técnica associada (com exclusão em cascata implementada via Fluent API).

📡 Endpoints da API REST
A documentação completa e interativa dos endpoints está disponível via Swagger.
Com a API rodando, acesse no seu navegador: http://localhost:<porta_da_api>/swagger

Principais Rotas:

POST /api/Authentication/login - Autenticação e geração de token JWT.

POST /api/Authentication/register - Cadastro de novos usuários.

GET /api/aberturas - Lista todas as aberturas do usuário logado.

POST /api/aberturas - Cria uma nova abertura.

GET /api/partidas/variante/{varianteId} - Lista as partidas de uma variante específica com Eager Loading da Precisão.

POST /api/partidas - Cadastra uma nova partida vinculada a uma variante e acopla suas métricas de precisão na mesma transação.

DELETE /api/aberturas/{id} - Exclui uma abertura (valida regras de integridade antes da deleção).

🛠️ Tecnologias Utilizadas
Backend: C# / .NET 8 / Entity Framework Core / JWT (JSON Web Tokens)

Banco de Dados: PostgreSQL

Frontend: React / Vite / Tailwind CSS / Axios
