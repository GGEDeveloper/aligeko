# Documentação da API - AliTools B2B

Esta documentação descreve os endpoints da API RESTful do sistema AliTools B2B. A API segue o padrão REST e utiliza JSON para troca de dados.

## Autenticação

A API utiliza autenticação baseada em JWT (JSON Web Tokens). Para autenticar, inclua o token JWT no cabeçalho das requisições:

```
Authorization: Bearer seu_token_aqui
```

## Base URL

```
https://api.alitools.com/v1
```

## Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 | OK - Requisição bem-sucedida |
| 201 | Criado - Recurso criado com sucesso |
| 400 | Requisição Inválida - Dados inválidos fornecidos |
| 401 | Não Autorizado - Autenticação necessária |
| 403 | Proibido - Sem permissão para acessar o recurso |
| 404 | Não Encontrado - Recurso não encontrado |
| 500 | Erro Interno do Servidor - Erro inesperado |

## Endpoints

### Autenticação

#### Login

```
POST /auth/login
```

**Corpo da Requisição:**

```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Resposta de Sucesso (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "João Silva",
    "email": "usuario@exemplo.com",
    "role": "customer"
  }
}
```

### Usuários

#### Obter Perfil do Usuário

```
GET /users/me
```

**Resposta de Sucesso (200 OK):**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "João Silva",
  "email": "usuario@exemplo.com",
  "phone": "+5511999999999",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

#### Atualizar Perfil

```
PUT /users/me
```

**Corpo da Requisição:**

```json
{
  "name": "Novo Nome",
  "phone": "+5511888888888"
}
```

**Resposta de Sucesso (200 OK):**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Novo Nome",
  "email": "usuario@exemplo.com",
  "phone": "+5511888888888",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-05-18T14:30:00.000Z"
}
```

### Pedidos

#### Listar Pedidos

```
GET /orders
```

**Parâmetros de Consulta:**

| Parâmetro | Tipo    | Obrigatório | Descrição                    |
|-----------|---------|-------------|------------------------------|
| status    | string  | Não         | Filtrar por status           |
| startDate | string  | Não         | Data inicial (YYYY-MM-DD)    |
| endDate   | string  | Não         | Data final (YYYY-MM-DD)      |
| page      | integer | Não         | Número da página (padrão: 1) |
| limit     | integer | Não         | Itens por página (padrão: 10)|

**Resposta de Sucesso (200 OK):**

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "orderNumber": "ORD-2025-0001",
      "status": "processing",
      "total": 199.99,
      "createdAt": "2025-05-18T10:00:00.000Z",
      "items": [
        {
          "id": "660e8400-e29b-41d4-a716-446655441111",
          "productId": "770e8400-e29b-41d4-a716-446655442222",
          "name": "Produto A",
          "quantity": 2,
          "unitPrice": 99.99,
          "total": 199.98
        }
      ]
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

#### Obter Detalhes do Pedido

```
GET /orders/:orderId
```

**Resposta de Sucesso (200 OK):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "orderNumber": "ORD-2025-0001",
  "status": "processing",
  "createdAt": "2025-05-18T10:00:00.000Z",
  "updatedAt": "2025-05-18T10:05:00.000Z",
  "shippingAddress": {
    "street": "Rua Exemplo",
    "number": "123",
    "complement": "Apto 101",
    "district": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01001000",
    "country": "Brasil"
  },
  "billingAddress": {
    "street": "Rua Exemplo",
    "number": "123",
    "complement": "Apto 101",
    "district": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01001000",
    "country": "Brasil"
  },
  "items": [
    {
      "id": "660e8400-e29b-41d4-a716-446655441111",
      "productId": "770e8400-e29b-41d4-a716-446655442222",
      "name": "Produto A",
      "quantity": 2,
      "unitPrice": 99.99,
      "total": 199.98,
      "image": "https://example.com/images/produto-a.jpg"
    }
  ],
  "subtotal": 199.98,
  "shippingCost": 15.99,
  "discount": 0,
  "total": 215.97,
  "paymentMethod": "credit_card",
  "paymentStatus": "pending",
  "trackingNumber": "BR123456789BR",
  "trackingUrl": "https://www2.correios.com.br/sistemas/rastreamento/"
}
```

### Endereços

#### Listar Endereços

```
GET /addresses
```

**Resposta de Sucesso (200 OK):**

```json
[
  {
    "id": "880e8400-e29b-41d4-a716-446655443333",
    "alias": "Casa",
    "street": "Rua Exemplo",
    "number": "123",
    "complement": "Apto 101",
    "district": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01001000",
    "country": "Brasil",
    "isDefault": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

#### Criar Endereço

```
POST /addresses
```

**Corpo da Requisição:**

```json
{
  "alias": "Trabalho",
  "street": "Avenida Paulista",
  "number": "1000",
  "complement": "10º andar",
  "district": "Bela Vista",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01311000",
  "country": "Brasil",
  "isDefault": false
}
```

**Resposta de Sucesso (201 Created):**

```json
{
  "id": "990e8400-e29b-41d4-a716-446655444444",
  "alias": "Trabalho",
  "street": "Avenida Paulista",
  "number": "1000",
  "complement": "10º andar",
  "district": "Bela Vista",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01311000",
  "country": "Brasil",
  "isDefault": false,
  "createdAt": "2025-05-18T15:00:00.000Z",
  "updatedAt": "2025-05-18T15:00:00.000Z"
}
```

### Produtos

#### Listar Produtos

```
GET /products
```

**Parâmetros de Consulta:**

| Parâmetro | Tipo    | Obrigatório | Descrição                    |
|-----------|---------|-------------|------------------------------|
| category  | string  | Não         | Filtrar por categoria        |
| search    | string  | Não         | Buscar por termo             |
| minPrice  | number  | Não         | Preço mínimo                |
| maxPrice  | number  | Não         | Preço máximo                |
| page      | integer | Não         | Número da página (padrão: 1) |
| limit     | integer | Não         | Itens por página (padrão: 12)|

**Resposta de Sucesso (200 OK):**

```json
{
  "data": [
    {
      "id": "aa0e8400-e29b-41d4-a716-446655445555",
      "name": "Produto A",
      "description": "Descrição do Produto A",
      "price": 99.99,
      "originalPrice": 129.99,
      "discount": 30,
      "images": [
        "https://example.com/images/produto-a-1.jpg",
        "https://example.com/images/produto-a-2.jpg"
      ],
      "inStock": true,
      "stockQuantity": 100,
      "rating": 4.5,
      "reviewCount": 42,
      "category": "eletronicos",
      "brand": "Marca X",
      "sku": "PRD-A-001",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 12,
    "totalPages": 1
  },
  "filters": {
    "categories": [
      {"id": "eletronicos", "name": "Eletrônicos", "count": 1},
      {"id": "informatica", "name": "Informática", "count": 0}
    ],
    "priceRange": {
      "min": 0,
      "max": 9999.99
    }
  }
}
```

## Erros

A API retorna erros no seguinte formato:

```json
{
  "error": {
    "code": "invalid_request",
    "message": "Dados inválidos fornecidos",
    "details": [
      {
        "field": "email",
        "message": "O campo email é obrigatório"
      }
    ]
  }
}
```

### Códigos de Erro Comuns

| Código | Descrição |
|--------|-----------|
| invalid_credentials | Email ou senha inválidos |
| email_in_use | Email já está em uso |
| invalid_token | Token inválido ou expirado |
| permission_denied | Usuário não tem permissão |
| not_found | Recurso não encontrado |
| validation_error | Erro de validação |

## Paginação

Todos os endpoints que retornam listas de itens utilizam paginação. A resposta inclui um objeto `pagination` com as seguintes propriedades:

- `total`: Número total de itens
- `page`: Página atual
- `limit`: Número de itens por página
- `totalPages`: Número total de páginas

## Ordenação

Alguns endpoints suportam ordenação através do parâmetro `sort`:

```
GET /products?sort=price:asc,name:desc
```

## Filtros Avançados

Alguns endpoints suportam filtros avançados usando a seguinte sintaxe:

```
GET /products?filter[price][gte]=100&filter[price][lte]=1000&filter[category]=eletronicos
```

## Taxa de Limite (Rate Limiting)

A API tem um limite de 1000 requisições por hora por IP. Os cabeçalhos de resposta incluem informações sobre o limite:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1621375200
```

## Versão da API

A versão atual da API é `v1`. Todas as URLs devem incluir o prefixo `/v1`.

## Suporte

Para suporte técnico, entre em contato:

- Email: api-support@alitools.com
- Telefone: +55 11 99999-9999
- Horário de Atendimento: Segunda a Sexta, 9h às 18h (GMT-3)

## Changelog

### v1.0.0 (2025-05-18)
- Versão inicial da API
- Autenticação JWT
- Gerenciamento de usuários
- Pedidos e endereços
- Catálogo de produtos
