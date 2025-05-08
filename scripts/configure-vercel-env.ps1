# PowerShell script para configurar variáveis de ambiente no Vercel
# Data: 2023-06-10

Write-Host "===== AliTools B2B - Configuração de Variáveis de Ambiente no Vercel =====" -ForegroundColor Cyan
Write-Host "Data: $(Get-Date)" -ForegroundColor Cyan
Write-Host "" 
Write-Host "Este script irá configurar todas as variáveis de ambiente necessárias no Vercel usando o Vercel CLI." -ForegroundColor Yellow
Write-Host "Certifique-se de que está logado no Vercel CLI antes de executar este script." -ForegroundColor Yellow
Write-Host ""

# Verificar se o Vercel CLI está instalado
try {
    $vercelVersion = vercel --version
    Write-Host "Vercel CLI detectado: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "Erro: Vercel CLI não encontrado. Instale com 'npm i -g vercel' e faça login com 'vercel login'." -ForegroundColor Red
    exit 1
}

# Verificar se o usuário está autenticado no Vercel
try {
    $vercelWhoami = vercel whoami
    Write-Host "Usuário autenticado no Vercel: $vercelWhoami" -ForegroundColor Green
} catch {
    Write-Host "Erro: Você não está autenticado no Vercel. Execute 'vercel login' primeiro." -ForegroundColor Red
    exit 1
}

# Verificar se estamos no diretório raiz do projeto
if (-not (Test-Path "vercel.json")) {
  Write-Host "Erro: Por favor, execute este script do diretório raiz do projeto." -ForegroundColor Red
  exit 1
}

# Verificar se o arquivo .env existe
if (-not (Test-Path ".env")) {
  Write-Host "Erro: Arquivo .env não encontrado." -ForegroundColor Red
  exit 1
}

# Ler variáveis do arquivo .env
Write-Host "Lendo variáveis do arquivo .env..." -ForegroundColor Green
$envContent = Get-Content ".env"
$envVars = @{}

foreach ($line in $envContent) {
    if (-not [string]::IsNullOrWhiteSpace($line) -and -not $line.StartsWith("#")) {
        $parts = $line -split "=", 2
        if ($parts.Length -eq 2) {
            $key = $parts[0].Trim()
            $value = $parts[1].Trim()
            $envVars[$key] = $value
        }
    }
}

Write-Host "Encontradas $(($envVars.Keys).Count) variáveis no arquivo .env." -ForegroundColor Green

# Configurar variáveis no Vercel
Write-Host "Configurando variáveis no Vercel..." -ForegroundColor Green

$configuredCount = 0
foreach ($key in $envVars.Keys) {
    try {
        $value = $envVars[$key]
        Write-Host "Configurando $key..." -NoNewline
        
        # Execute o comando Vercel para adicionar a variável de ambiente
        vercel env add $key production
        Write-Host $value | vercel env add $key production
        
        Write-Host " Configurada!" -ForegroundColor Green
        $configuredCount++
    } catch {
        Write-Host " Falha ao configurar: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "===== Configuração Concluída =====" -ForegroundColor Cyan
Write-Host "$configuredCount variáveis de ambiente configuradas com sucesso." -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Faça um redeploy da aplicação: 'vercel --prod'" -ForegroundColor Yellow
Write-Host "2. Verifique se a API está funcionando corretamente" -ForegroundColor Yellow 