# Financeiro

Plataforma full stack de gestão financeira pessoal. Cada usuário registra entradas e saídas, organiza as movimentações em categorias e acompanha o saldo da conta por meio de um dashboard.

![Java](https://img.shields.io/badge/Java-17-444?style=flat-square&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.1-444?style=flat-square&logo=springboot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-444?style=flat-square&logo=postgresql&logoColor=white)
![React](https://img.shields.io/badge/React-19-444?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-444?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-444?style=flat-square&logo=vite&logoColor=white)

O back-end é uma API REST em Spring Boot com autenticação JWT stateless. O front-end é uma SPA em React e TypeScript, servida pelo Vite.

## Funcionalidades

- Cadastro e login com senha em BCrypt e token JWT com expiração configurável
- Dashboard com total de entradas, total de saídas, saldo da conta e comparativo do período
- CRUD de transações, com filtro por período e formas de pagamento PIX, crédito e débito
- Categorias por usuário, com contagem de transações; a exclusão só é permitida quando não há transações vinculadas
- Resumo por categoria dentro do período selecionado
- Isolamento total entre usuários: cada um só acessa os próprios dados

## Segurança

| Recurso | Detalhe |
|---|---|
| Senhas | BCrypt, mínimo de 8 caracteres e máximo de 72 bytes |
| Sessão | Stateless, JWT assinado com HS256 e segredo de no mínimo 32 caracteres |
| Rate limiting | Login: 5 tentativas por e-mail e 20 por IP a cada 15 minutos. Registro: 10 por IP por hora |
| Autorização | Todas as rotas exigem token, exceto `/auth/registro`, `/auth/login` e `/ping` |
| CORS | Restrito às origens locais `localhost:5173` e `localhost:3000` |
| Credenciais | Banco e segredo JWT lidos de variáveis de ambiente |

## Stack

**Back-end:** Java 17, Spring Boot 4.1, Spring Web MVC, Spring Data JPA, Bean Validation, Spring Security com OAuth2 Resource Server, PostgreSQL (H2 nos testes).

**Front-end:** React 19, React Router 7, TypeScript, Vite, Oxlint.

## Estrutura

```
financeiro/
├── src/main/java/com/financeiro/
│   ├── config/        # Segurança, CORS e usuário logado
│   ├── controller/    # Endpoints REST
│   ├── dto/           # Objetos de entrada e saída
│   ├── exception/     # Exceções de domínio e handler global
│   ├── model/         # Entidades JPA e enums
│   ├── repository/    # Repositórios Spring Data
│   └── service/       # Regras de negócio, tokens e limitador de tentativas
├── src/test/          # Testes unitários, web e de integração
└── frontend/
    └── src/
        ├── api/          # Cliente HTTP e chamadas à API
        ├── components/   # Layout, modais, tabelas, badges
        ├── context/      # Contexto de autenticação
        └── pages/        # Login, Dashboard, Transações, Categorias
```

## API

Rotas autenticadas esperam o cabeçalho `Authorization: Bearer <token>`.

| Método | Rota | Descrição | Autenticação |
|---|---|---|:---:|
| POST | `/auth/registro` | Cria uma conta | Não |
| POST | `/auth/login` | Retorna o token JWT e os dados do usuário | Não |
| GET | `/auth/me` | Dados do usuário logado | Sim |
| GET | `/transacoes` | Lista transações; filtro opcional `date1` e `date2` (`AAAA-MM-DD`) | Sim |
| POST | `/transacoes` | Cria uma transação | Sim |
| PUT | `/transacoes/{id}` | Atualiza uma transação | Sim |
| DELETE | `/transacoes/{id}` | Exclui uma transação | Sim |
| GET | `/transacoes/resumo?inicio=&fim=` | Entradas, saídas, saldo e totais por categoria | Sim |
| GET | `/categorias` | Lista categorias com a contagem de transações | Sim |
| POST | `/categorias` | Cria uma categoria | Sim |
| PUT | `/categorias/{id}` | Renomeia uma categoria | Sim |
| DELETE | `/categorias/{id}` | Exclui uma categoria sem transações | Sim |
| GET | `/ping` | Health check | Não |

Exemplo de resposta de `/transacoes/resumo`:

```json
{
  "totalEntradas": 5200.00,
  "totalSaidas": 1830.50,
  "saldo": 3369.50,
  "porCategoria": [
    { "categoria": "Salário", "tipo": "ENTRADA", "total": 5200.00 },
    { "categoria": "Mercado", "tipo": "SAIDA", "total": 830.50 }
  ]
}
```

O campo `saldo` considera toda a conta, não apenas o período filtrado.

## Como executar

### Pré-requisitos

- JDK 17 ou superior
- Node.js 20 ou superior
- PostgreSQL com um banco chamado `financeiro`

### Banco de dados

```sql
CREATE DATABASE financeiro;
```

As tabelas são criadas automaticamente (`spring.jpa.hibernate.ddl-auto=update`).

### Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `DB_USER` | Usuário do PostgreSQL |
| `DB_PASSWORD` | Senha do PostgreSQL |
| `JWT_SECRET` | Segredo para assinar os tokens (mínimo de 32 caracteres) |

PowerShell:

```powershell
$env:DB_USER = "postgres"
$env:DB_PASSWORD = "sua_senha"
$env:JWT_SECRET = "troque-por-um-segredo-com-32-caracteres-ou-mais"
```

Linux/macOS:

```bash
export DB_USER=postgres
export DB_PASSWORD=sua_senha
export JWT_SECRET=troque-por-um-segredo-com-32-caracteres-ou-mais
```

### Back-end

```bash
./mvnw spring-boot:run
```

A API fica disponível em `http://localhost:8080`.

### Front-end

```bash
cd frontend
npm install
npm run dev
```

A aplicação abre em `http://localhost:5173`. Para usar outra URL de API, defina `VITE_API_URL` (padrão: `http://localhost:8080`).

## Testes

```bash
./mvnw test
```

A suíte cobre os serviços (autenticação, categorias, transações, tokens e limitador de tentativas), a camada web dos controllers, o modelo e um fluxo completo de integração, usando H2 em memória.

No front-end:

```bash
cd frontend
npm run lint
npm run build
```

## Próximos passos

- Gráficos por categoria no dashboard
- Exportação para CSV
- Migrações de banco com Flyway
- Docker Compose com API, front-end e banco
