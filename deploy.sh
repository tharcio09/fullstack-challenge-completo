#!/bin/bash

# 🚀 Script de Deploy Automatizado
# Fullstack Challenge - Sistema de Participantes

set -e  # Para o script se houver erro

echo "🚀 Iniciando deploy do Fullstack Challenge..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    error "Docker não está instalado. Por favor, instale o Docker primeiro."
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro."
fi

# Parar containers existentes
log "🛑 Parando containers existentes..."
docker-compose down --remove-orphans || true

# Limpar imagens antigas (opcional)
read -p "🧹 Deseja limpar imagens Docker antigas? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log "🧹 Limpando imagens antigas..."
    docker system prune -f || true
fi

# Build das imagens
log "🔨 Fazendo build das imagens..."
docker-compose build --no-cache

# Iniciar serviços
log "🚀 Iniciando serviços..."
docker-compose up -d

# Aguardar serviços ficarem prontos
log "⏳ Aguardando serviços ficarem prontos..."
sleep 10

# Verificar status dos containers
log "🔍 Verificando status dos containers..."
docker-compose ps

# Verificar logs
log "📋 Últimos logs dos serviços:"
docker-compose logs --tail=20

# Testar endpoints
log "🧪 Testando endpoints..."

# Testar health check do backend
if curl -f http://localhost:4000/health > /dev/null 2>&1; then
    log "✅ Backend está funcionando"
else
    warn "⚠️  Backend pode não estar pronto ainda"
fi

# Testar frontend
if curl -f http://localhost > /dev/null 2>&1; then
    log "✅ Frontend está funcionando"
else
    warn "⚠️  Frontend pode não estar pronto ainda"
fi

# Informações finais
echo
log "🎉 Deploy concluído com sucesso!"
echo
echo "📱 URLs de acesso:"
echo "   Frontend: http://localhost"
echo "   Backend API: http://localhost:4000"
echo "   GraphQL Playground: http://localhost:4000/graphql"
echo "   Health Check: http://localhost:4000/health"
echo
echo "🐳 Comandos úteis:"
echo "   Ver logs: docker-compose logs -f"
echo "   Parar serviços: docker-compose down"
echo "   Reiniciar: docker-compose restart"
echo "   Status: docker-compose ps"
echo
echo "🧪 Para executar testes:"
echo "   Backend: cd challenge-backend && npm test"
echo "   Frontend: cd challenge-frontend && npm test"
echo

# Verificar se há erros nos logs
if docker-compose logs | grep -i "error\|exception\|failed" > /dev/null; then
    warn "⚠️  Encontrados possíveis erros nos logs. Verifique com: docker-compose logs"
fi

log "✨ Deploy finalizado! Acesse http://localhost para usar a aplicação."
