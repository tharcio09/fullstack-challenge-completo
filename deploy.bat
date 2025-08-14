@echo off
setlocal enabledelayedexpansion

echo 🚀 Iniciando deploy do Fullstack Challenge...

REM Verificar se Docker está instalado
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Docker não está instalado. Por favor, instale o Docker primeiro.
    exit /b 1
)

REM Verificar se Docker Compose está instalado
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro.
    exit /b 1
)

echo 🛑 Parando containers existentes...
docker-compose down --remove-orphans

echo.
set /p clean_images="🧹 Deseja limpar imagens Docker antigas? (y/N): "
if /i "!clean_images!"=="y" (
    echo 🧹 Limpando imagens antigas...
    docker system prune -f
)

echo 🔨 Fazendo build das imagens...
docker-compose build --no-cache

echo 🚀 Iniciando serviços...
docker-compose up -d

echo ⏳ Aguardando serviços ficarem prontos...
timeout /t 10 /nobreak >nul

echo 🔍 Verificando status dos containers...
docker-compose ps

echo 📋 Últimos logs dos serviços:
docker-compose logs --tail=20

echo 🧪 Testando endpoints...

REM Testar health check do backend
curl -f http://localhost:4000/health >nul 2>&1
if errorlevel 1 (
    echo ⚠️  WARNING: Backend pode não estar pronto ainda
) else (
    echo ✅ Backend está funcionando
)

REM Testar frontend
curl -f http://localhost >nul 2>&1
if errorlevel 1 (
    echo ⚠️  WARNING: Frontend pode não estar pronto ainda
) else (
    echo ✅ Frontend está funcionando
)

echo.
echo 🎉 Deploy concluído com sucesso!
echo.
echo 📱 URLs de acesso:
echo    Frontend: http://localhost
echo    Backend API: http://localhost:4000
echo    GraphQL Playground: http://localhost:4000/graphql
echo    Health Check: http://localhost:4000/health
echo.
echo 🐳 Comandos úteis:
echo    Ver logs: docker-compose logs -f
echo    Parar serviços: docker-compose down
echo    Reiniciar: docker-compose restart
echo    Status: docker-compose ps
echo.
echo 🧪 Para executar testes:
echo    Backend: cd challenge-backend ^&^& npm test
echo    Frontend: cd challenge-frontend ^&^& npm test
echo.

echo ✨ Deploy finalizado! Acesse http://localhost para usar a aplicação.
pause
