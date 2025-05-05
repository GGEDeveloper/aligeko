# AliTools B2B - Fluxo de Autenticação

## Fluxo de Login Padrão

1. O usuário submete o formulário de login com `email` e `password`.
2. O servidor verifica as credenciais no endpoint `POST /api/v1/auth/login`.
3. Se o usuário não tiver 2FA habilitado, o servidor retorna:
   - Token de acesso JWT
   - Token de atualização
   - Dados do usuário
4. O cliente armazena os tokens e redireciona para a página principal.

## Fluxo de Login com Autenticação de Dois Fatores (2FA)

1. O usuário submete o formulário de login com `email` e `password`.
2. O servidor verifica as credenciais no endpoint `POST /api/v1/auth/login`.
3. Se o usuário tiver 2FA habilitado, o servidor retorna:
   - `requireTwoFactor: true`
   - `userId` (para uso na próxima etapa)
4. O cliente exibe um formulário para inserção do código de autenticação.
5. O usuário insere o código do aplicativo de autenticação ou um código de backup.
6. O cliente submete o código para o endpoint `POST /api/v1/auth/2fa/validate` com:
   - `userId`
   - `token` (código de 6 dígitos)
   - `useBackupCode` (opcional, `true` se estiver usando um código de backup)
7. Se o código for válido, o servidor retorna:
   - Token de acesso JWT
   - Token de atualização
   - Dados do usuário
8. O cliente armazena os tokens e redireciona para a página principal.

## Configuração da Autenticação de Dois Fatores

### Habilitando o 2FA

1. O usuário navega até as configurações de segurança.
2. O cliente chama o endpoint `POST /api/v1/auth/2fa/setup`.
3. O servidor retorna:
   - `secret` (chave secreta)
   - `qrCodeUrl` (código QR em formato de URL de dados)
   - `backupCodes` (códigos de backup)
4. O cliente exibe o código QR para escaneamento no aplicativo de autenticação e os códigos de backup para armazenamento seguro.
5. O usuário escaneia o código QR com o aplicativo de autenticação e gera um código.
6. O cliente submete o código para o endpoint `POST /api/v1/auth/2fa/verify` com:
   - `token` (código de 6 dígitos do aplicativo)
7. Se o código for válido, o servidor habilita o 2FA para o usuário.

### Desabilitando o 2FA

1. O usuário navega até as configurações de segurança.
2. O usuário insere sua senha e um código de autenticação.
3. O cliente submete os dados para o endpoint `POST /api/v1/auth/2fa/disable` com:
   - `password` (senha do usuário)
   - `token` (código de 6 dígitos do aplicativo)
4. Se as credenciais forem válidas, o servidor desabilita o 2FA para o usuário.

## Recuperação de Conta

Se o usuário perder acesso ao aplicativo de autenticação e não tiver códigos de backup:

1. O usuário deve contatar o suporte para verificação de identidade.
2. Um administrador pode desabilitar manualmente o 2FA para o usuário através do painel administrativo.
3. O usuário deve redefinir sua senha e configurar novamente o 2FA se desejar. 