# 🚀 Fullstack Challenge - Sistema de Participantes

Um sistema completo para gerenciar participantes e suas porcentagens de participação, desenvolvido com **Vue.js 3** (frontend) e **Node.js + GraphQL** (backend).

## ✨ **Funcionalidades**

- ✅ **CRUD Completo** de participantes
- ✅ **Validação em tempo real** dos dados
- ✅ **Gráfico interativo** (Doughnut Chart) com Chart.js
- ✅ **Layout responsivo** para todos os dispositivos
- ✅ **Tabela dinâmica** com ações de exclusão
- ✅ **Validação de porcentagens** (máximo 100% total)
- ✅ **Tratamento de erros** robusto
- ✅ **Testes unitários** (Frontend e Backend)
- ✅ **Docker e Docker Compose** para deploy
- ✅ **API GraphQL** com validações

## 🛠️ **Tecnologias Utilizadas**

### **Frontend**
- **Vue.js 3** - Framework JavaScript progressivo
- **Vite** - Build tool e dev server
- **Apollo Client** - Cliente GraphQL
- **Chart.js** - Biblioteca de gráficos
- **Vue Router** - Roteamento
- **Vitest** - Framework de testes

### **Backend**
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **GraphQL** - Query language para APIs
- **Mongoose** - ODM para MongoDB
- **MongoDB** - Banco de dados NoSQL
- **Jest** - Framework de testes

### **DevOps**
- **Docker** - Containerização
- **Docker Compose** - Orquestração de containers
- **Nginx** - Proxy reverso

## 🚀 **Como Executar**

### **Opção 1: Docker Compose (Recomendado)**

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd fullstack-challenge-completo

# Execute com Docker Compose
docker-compose up -d

# Acesse a aplicação
# Frontend: http://localhost
# Backend API: http://localhost:4000
# GraphQL Playground: http://localhost:4000/graphql
```

### **Opção 2: Desenvolvimento Local**

#### **Backend**
```bash
cd challenge-backend
npm install
npm run dev
```

#### **Frontend**
```bash
cd challenge-frontend
npm install
npm run dev
```

#### **MongoDB**
```bash
# Instale o MongoDB localmente ou use Docker
docker run -d -p 27017:27017 --name mongodb mongo:6.0
```

## 🧪 **Executando Testes**

### **Backend**
```bash
cd challenge-backend
npm test
npm run test:coverage
```

### **Frontend**
```bash
cd challenge-frontend
npm test
npm run test:coverage
```

## 📊 **Estrutura do Projeto**

```
fullstack-challenge-completo/
├── challenge-backend/          # API GraphQL
│   ├── src/
│   │   ├── app.js             # Configuração Express
│   │   ├── db.js              # Conexão MongoDB
│   │   ├── schema.js          # Schema GraphQL
│   │   └── models/
│   │       └── Participant.js # Modelo Mongoose
│   ├── package.json
│   └── server.js              # Entry point
├── challenge-frontend/         # Aplicação Vue.js
│   ├── src/
│   │   ├── components/        # Componentes Vue
│   │   ├── views/             # Páginas
│   │   ├── graphql/           # Queries e Mutations
│   │   ├── apollo.js          # Configuração Apollo
│   │   └── main.js            # Entry point
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml         # Orquestração Docker
├── Dockerfile.backend         # Container Backend
├── Dockerfile.frontend        # Container Frontend
└── nginx.conf                 # Configuração Nginx
```

## 🔧 **API GraphQL**

### **Queries**

```graphql
# Buscar todos os participantes
query {
  participants {
    id
    firstName
    lastName
    participation
  }
}

# Buscar participante por ID
query {
  participant(id: "ID_DO_PARTICIPANTE") {
    id
    firstName
    lastName
    participation
  }
}
```

### **Mutations**

```graphql
# Adicionar participante
mutation {
  addParticipant(
    firstName: "João"
    lastName: "Silva"
    participation: 30.5
  ) {
    id
    firstName
    lastName
    participation
  }
}

# Deletar participante
mutation {
  deleteParticipant(id: "ID_DO_PARTICIPANTE")
}
```

## 🎨 **Componentes Frontend**

### **ParticipantForm**
- Formulário para adicionar novos participantes
- Validação em tempo real
- Estados de loading

### **ParticipantsTable**
- Tabela responsiva com dados dos participantes
- Ações de exclusão com confirmação
- Formatação automática de porcentagens

### **PieChart**
- Gráfico de rosca interativo
- Legendas responsivas
- Tooltips personalizados
- Cores dinâmicas

## 🔒 **Validações e Segurança**

### **Backend**
- ✅ Validação de campos obrigatórios
- ✅ Validação de porcentagens (0-100%)
- ✅ Validação de soma total (máximo 100%)
- ✅ Tratamento de erros GraphQL
- ✅ CORS configurado
- ✅ Logs estruturados

### **Frontend**
- ✅ Validação de formulários
- ✅ Tratamento de erros de rede
- ✅ Estados de loading
- ✅ Confirmações de ações destrutivas
- ✅ Responsividade completa

## 📈 **Melhorias Implementadas**

### **UX/UI**
- 🎨 Design moderno e profissional
- 📱 Layout totalmente responsivo
- 🎯 Gráfico interativo com legendas
- ⚡ Feedback visual em tempo real
- 🔄 Estados de loading e erro

### **Performance**
- 🚀 Vite para build otimizado
- 📦 Code splitting automático
- 🎯 Lazy loading de componentes
- 💾 Cache Apollo Client
- 🔄 Debounce em eventos de resize

### **Qualidade**
- 🧪 Testes unitários completos
- 📊 Cobertura de código
- 🔍 Linting e formatação
- 📚 Documentação detalhada
- 🐳 Containerização completa

## 🌐 **Deploy**

### **Docker Compose (Produção)**
```bash
# Build e deploy
docker-compose up -d --build

# Logs
docker-compose logs -f

# Parar serviços
docker-compose down
```

### **Variáveis de Ambiente**

#### **Backend**
```env
NODE_ENV=production
MONGO_URI=mongodb://admin:password123@mongodb:27017/challenge?authSource=admin
PORT=4000
```

#### **Frontend**
```env
VITE_API_URL=http://localhost:4000/graphql
```

## 🐛 **Solução de Problemas**

### **Erro de Conexão MongoDB**
```bash
# Verificar se o MongoDB está rodando
docker ps | grep mongodb

# Verificar logs
docker-compose logs mongodb
```

### **Erro de Build Frontend**
```bash
# Limpar cache
cd challenge-frontend
rm -rf node_modules package-lock.json
npm install
```

### **Erro de Porta em Uso**
```bash
# Verificar portas em uso
netstat -tulpn | grep :4000
netstat -tulpn | grep :80

# Parar processos
sudo kill -9 <PID>
```

## 📝 **Changelog**

Veja o arquivo [CHANGELOG.md](./CHANGELOG.md) para histórico de mudanças.

## 🤝 **Contribuição**

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 **Autor**

**Tharcio** - [GitHub](https://github.com/seu-usuario)

---

⭐ **Se este projeto te ajudou, considere dar uma estrela!**
