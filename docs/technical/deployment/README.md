# Guia de Implantação - AliTools B2B

Este guia fornece instruções detalhadas para implantar a aplicação AliTools B2B em diferentes ambientes.

## Pré-requisitos

### Servidor
- Sistema Operacional: Ubuntu 20.04 LTS ou superior
- Node.js 16.x ou superior
- NPM 8.x ou superior
- PostgreSQL 13 ou superior
- Redis 6.x ou superior (para cache e filas)

### Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Configurações da Aplicação
NODE_ENV=production
PORT=3000

# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=alitools
DB_USER=postgres
DB_PASSWORD=seu_senha_segura
DB_SSL=false

# Autenticação
JWT_SECRET=seu_jwt_secreto
JWT_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# E-mail (SMTP)
SMTP_HOST=smtp.exemplo.com
SMTP_PORT=587
SMTP_USER=usuario@exemplo.com
SMTP_PASS=sua_senha
SMTP_FROM=contato@alitools.com

# Armazenamento
STORAGE_TYPE=local # ou 's3' para Amazon S3
AWS_ACCESS_KEY_ID=seu_access_key
AWS_SECRET_ACCESS_KEY=sua_secret_key
AWS_REGION=sa-east-1
AWS_BUCKET_NAME=alitools-bucket

# URLs
APP_URL=https://app.alitools.com.br
API_URL=https://api.alitools.com.br

# Outros
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

## Instalação

### 1. Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/alitools.git
cd alitools
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Banco de Dados

1. Crie um banco de dados PostgreSQL
2. Execute as migrações:

```bash
npm run db:migrate
```

3. Opcional: Execute as seeds para dados iniciais:

```bash
npm run db:seed
```

## Construção

### Frontend

```bash
cd client
npm install
npm run build
```

### Backend

```bash
npm run build
```

## Executando a Aplicação

### Modo Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Ou para frontend e backend separadamente
npm run client:dev
npm run server:dev
```

### Modo Produção

1. Construa a aplicação (conforme mostrado acima)
2. Inicie o servidor:

```bash
npm start
```

## Configuração do Nginx (Recomendado para Produção)

Crie um arquivo de configuração do Nginx em `/etc/nginx/sites-available/alitools`:

```nginx
server {
    listen 80;
    server_name api.alitools.com.br;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name app.alitools.com.br;
    
    root /caminho/para/alitools/client/build;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ative o site:

```bash
sudo ln -s /etc/nginx/sites-available/alitools /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Configuração do PM2 (Process Manager)

Instale o PM2 globalmente:

```bash
npm install -g pm2
```

Inicie a aplicação com PM2:

```bash
pm2 start npm --name "alitools-api" -- start
```

Configure o PM2 para iniciar na inicialização do sistema:

```bash
pm2 startup
pm2 save
```

## Configuração de SSL com Let's Encrypt

Instale o Certbot:

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

Obtenha e instale o certificado SSL:

```bash
sudo certbot --nginx -d api.alitools.com.br -d app.alitools.com.br
```

O Certbot irá configurar automaticamente o Nginx para usar HTTPS.

## Monitoramento

### Logs

Visualize os logs da aplicação:

```bash
# Logs em tempo real
pm2 logs

# Últimas 100 linhas de log
pm2 logs --lines 100
```

### Monitoramento de Recursos

Instale o módulo de monitoramento do PM2:

```bash
pm2 install pm2-module-pm2-logrotate
pm2 install pm2-server-monit
```

## Atualizações

Para atualizar a aplicação para uma nova versão:

```bash
# Parar a aplicação
pm2 stop alitools-api

# Atualizar o código
git pull origin main

# Instalar novas dependências (se houver)
npm install

# Executar migrações (se houver)
npm run db:migrate

# Reconstruir a aplicação
npm run build
cd client
npm run build
cd ..

# Iniciar a aplicação novamente
pm2 restart alitools-api
```

## Backup e Recuperação

### Backup do Banco de Dados

Crie um script de backup em `/usr/local/bin/backup-db.sh`:

```bash
#!/bin/bash

# Configurações
DB_NAME="alitools"
BACKUP_DIR="/backups/database"
DATE=$(date +"%Y%m%d_%H%M%S")
FILENAME="${DB_NAME}_${DATE}.sql"

# Criar diretório de backup se não existir
mkdir -p $BACKUP_DIR

# Fazer backup
pg_dump -U postgres -d $DB_NAME > "${BACKUP_DIR}/${FILENAME}"

# Compactar o backup
gzip "${BACKUP_DIR}/${FILENAME}"

# Manter apenas os últimos 7 backups
find $BACKUP_DIR -name "${DB_NAME}_*.sql.gz" -type f | sort -r | tail -n +8 | xargs rm -f

echo "Backup concluído: ${BACKUP_DIR}/${FILENAME}.gz"
```

Torne o script executável:

```bash
chmod +x /usr/local/bin/backup-db.sh
```

Adicione ao crontab para backup diário:

```bash
crontab -e
```

Adicione a seguinte linha para executar o backup diariamente às 2h:

```
0 2 * * * /usr/local/bin/backup-db.sh
```

### Restauração do Banco de Dados

```bash
# Descompactar o backup (se estiver compactado)
gunzip backup_file.sql.gz

# Restaurar o banco de dados
psql -U postgres -d alitools -f backup_file.sql
```

## Solução de Problemas

### Aplicação não inicia

1. Verifique os logs:
   ```bash
   pm2 logs alitools-api
   ```

2. Verifique se as portas estão disponíveis:
   ```bash
   sudo lsof -i :3000
   ```

3. Verifique as variáveis de ambiente:
   ```bash
   cat .env
   ```

### Erros de Banco de Dados

1. Verifique a conexão com o banco de dados:
   ```bash
   psql -h localhost -U postgres -d alitools
   ```

2. Execute as migrações pendentes:
   ```bash
   npm run db:migrate
   ```

### Problemas de Permissão

1. Verifique as permissões dos arquivos:
   ```bash
   sudo chown -R seu_usuario:seu_usuario /caminho/para/alitools
   ```

2. Dê permissão de execução aos scripts necessários:
   ```bash
   chmod +x scripts/*.sh
   ```

## Segurança

### Firewall

Ative o UFW e configure as portas necessárias:

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Atualizações de Segurança

Mantenha o sistema operacional e as dependências atualizadas:

```bash
# Atualizar pacotes do sistema
sudo apt update
sudo apt upgrade -y

# Atualizar dependências do Node.js
npm outdated
npm update
```

### Auditoria de Segurança

Execute auditorias regulares de segurança:

```bash
# Verificar vulnerabilidades nas dependências
npm audit

# Verificar dependências desatualizadas
npx npm-check-updates
```

## Monitoramento e Alertas

### Configurar Monitoramento com PM2

Monitore o uso de recursos em tempo real:

```bash
pm2 monit
```

### Configurar Alertas

Crie um script para verificar a saúde da aplicação e enviar alertas:

```bash
#!/bin/bash

# Verificar se a aplicação está em execução
if ! pm2 show alitools-api | grep -q "online"; then
    # Enviar notificação (exemplo com curl para um webhook)
    curl -X POST -H 'Content-type: application/json' \
    --data '{"text":"🚨 Alerta: Aplicação AliTools está fora do ar!"}' \
    https://hooks.slack.com/services/SEU/WEBHOOK/URL
    
    # Tentar reiniciar a aplicação
    pm2 restart alitools-api
fi
```

Agende a verificação a cada 5 minutos no crontab:

```
*/5 * * * * /caminho/para/verificar-saude.sh
```

## Escalabilidade

### Balanceamento de Carga

Para alta disponibilidade, configure múltiplas instâncias atrás de um balanceador de carga:

1. Configure múltiplos servidores de aplicação
2. Use o Nginx como balanceador de carga:

```nginx
upstream backend {
    server 10.0.0.1:3000;
    server 10.0.0.2:3000;
    server 10.0.0.3:3000;
}

server {
    listen 80;
    server_name api.alitools.com.br;
    
    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Cache

Configure o Redis para cache de consultas frequentes:

```javascript
// Exemplo de uso de cache no Node.js
const redis = require('redis');
const { promisify } = require('util');

const client = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
});

const getAsync = promisify(client.get).bind(client);
const setexAsync = promisify(client.setex).bind(client);

async function getWithCache(key, ttl, callback) {
    const cached = await getAsync(key);
    if (cached) {
        return JSON.parse(cached);
    }
    
    const data = await callback();
    await setexAsync(key, ttl, JSON.stringify(data));
    return data;
}
```

## Considerações Finais

Este guia cobre os principais aspectos da implantação da aplicação AliTools B2B em um ambiente de produção. Para ambientes de desenvolvimento, algumas configurações podem ser simplificadas.

Para obter suporte adicional, entre em contato com a equipe de desenvolvimento em dev@alitools.com.br.
