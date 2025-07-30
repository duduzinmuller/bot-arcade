# CI/CD Pipeline - Discord XP Bot

Este projeto inclui um pipeline completo de CI/CD usando GitHub Actions que automatiza todo o processo de desenvolvimento, teste e deploy do bot Discord.

## 🚀 Funcionalidades do Pipeline

### 1. **Análise de Código e Qualidade**
- ✅ Verificação de sintaxe JavaScript
- ✅ Análise com ESLint
- ✅ Formatação com Prettier
- ✅ Auditoria de segurança (npm audit)
- ✅ Verificação de dependências

### 2. **Testes**
- ✅ Testes unitários (configurável)
- ✅ Testes de integração (configurável)
- ✅ Cobertura de testes
- ✅ Upload de relatórios

### 3. **Build e Validação**
- ✅ Validação de sintaxe
- ✅ Verificação de dependências
- ✅ Validação do Dockerfile
- ✅ Validação do docker-compose.yml

### 4. **Docker**
- ✅ Build automático de imagens
- ✅ Push para GitHub Container Registry
- ✅ Tags automáticas baseadas em branch/versão
- ✅ Cache otimizado

### 5. **Deploy**
- ✅ Deploy automático para staging (branch develop)
- ✅ Deploy para produção (releases)
- ✅ Ambientes protegidos
- ✅ Rollback automático

### 6. **Monitoramento e Backup**
- ✅ Backup automático diário
- ✅ Monitoramento de saúde
- ✅ Verificação de recursos
- ✅ Notificações de status

### 7. **Documentação**
- ✅ Geração automática de docs
- ✅ Deploy para GitHub Pages
- ✅ Atualização de README

## 📋 Triggers do Pipeline

O pipeline é executado automaticamente quando:

- **Push** para branches `main` ou `develop`
- **Pull Request** para branch `main`
- **Release** publicado
- **Schedule** (backup diário às 2h)

## 🔧 Configuração

### 1. Secrets Necessários

Configure os seguintes secrets no seu repositório:

```bash
# Variáveis do Bot Discord
DISCORD_TOKEN=seu-token-do-discord
CLIENT_ID=id-do-cliente-discord
DATABASE_PATH=./data/bot.db
WEB_PORT=3000
WEB_SECRET=chave-secreta-web
XP_PER_MESSAGE=15
XP_COOLDOWN=60
LEVEL_MULTIPLIER=100

# Deploy Render
RENDER_DEPLOY_HOOK_URL=https://api.render.com/deploy/srv-xxx
RENDER_STAGING_DEPLOY_HOOK_URL=https://api.render.com/deploy/srv-xxx-staging

# Para notificações Discord
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

### 2. Environments

Configure os environments no GitHub:

1. **staging** - Para testes
2. **production** - Para produção

### 3. Permissões

O pipeline precisa das seguintes permissões:
- `contents: read` - Para ler o código
- `packages: write` - Para push de imagens Docker

### 4. Configuração do Render

1. **Criar serviços no Render:**
   - Web Service para staging
   - Web Service para produção

2. **Configurar variáveis de ambiente no Render:**
   - `DISCORD_TOKEN`
   - `CLIENT_ID`
   - `DATABASE_PATH`
   - `WEB_PORT`
   - `WEB_SECRET`
   - `XP_PER_MESSAGE`
   - `XP_COOLDOWN`
   - `LEVEL_MULTIPLIER`

3. **Obter URLs de deploy:**
   - Copie as URLs de deploy automático dos serviços
   - Configure como secrets no GitHub

## 🛠️ Comandos Locais

### Desenvolvimento
```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Verificar qualidade do código
npm run lint
npm run format:check

# Corrigir problemas de código
npm run lint:fix
npm run format

# Executar testes
npm test
```

### Docker
```bash
# Build da imagem
docker build -t discord-xp-bot .

# Executar com docker-compose
docker-compose up -d

# Executar apenas o bot
docker run -d --env-file .env discord-xp-bot
```

### Render Deploy
```bash
# Deploy manual para staging
curl "$RENDER_STAGING_DEPLOY_HOOK_URL"

# Deploy manual para produção
curl "$RENDER_DEPLOY_HOOK_URL"
```

## 📊 Status do Pipeline

O pipeline inclui os seguintes jobs:

1. **code-quality** - Análise de código
2. **test** - Execução de testes
3. **build** - Build e validação
4. **build-docker** - Build da imagem Docker
5. **deploy-staging** - Deploy para staging (Render)
6. **migrate** - Migração de banco de dados
7. **deploy-production** - Deploy para produção (Render)
8. **backup** - Backup automático
9. **monitoring** - Monitoramento
10. **docs** - Documentação
11. **notify** - Notificações

## 🔄 Fluxo de Trabalho

### Desenvolvimento
1. Crie uma branch a partir de `develop`
2. Faça suas alterações
3. Execute `npm run lint` e `npm run format` localmente
4. Crie um Pull Request para `develop`
5. O pipeline executará automaticamente

### Produção
1. Merge da `develop` para `main`
2. Crie uma release no GitHub
3. O pipeline executará migrações de banco
4. O pipeline fará deploy automático para produção (Render)

## 🚨 Troubleshooting

### Problemas Comuns

1. **Pipeline falha no ESLint**
   ```bash
   npm run lint:fix
   ```

2. **Pipeline falha no Prettier**
   ```bash
   npm run format
   ```

3. **Problemas com Docker**
   ```bash
   docker system prune -a
   docker build --no-cache .
   ```

4. **Problemas de permissão**
   - Verifique se os secrets estão configurados
   - Verifique as permissões do repositório

### Logs e Debug

- Acesse a aba "Actions" no GitHub
- Clique no workflow que falhou
- Analise os logs de cada job
- Use `echo "DEBUG: mensagem"` nos steps para debug

## 📈 Métricas

O pipeline gera as seguintes métricas:

- **Tempo de execução** de cada job
- **Taxa de sucesso** dos deploys
- **Cobertura de testes**
- **Vulnerabilidades** encontradas
- **Qualidade do código** (ESLint score)

## 🔐 Segurança

- ✅ Auditoria automática de dependências
- ✅ Secrets protegidos
- ✅ Ambientes isolados
- ✅ Validação de código antes do merge
- ✅ Backup automático dos dados

## 📞 Suporte

Para problemas com o pipeline:

1. Verifique os logs na aba Actions
2. Consulte este README
3. Abra uma issue no repositório
4. Entre em contato com a equipe de DevOps

---

**Nota**: Este pipeline é configurado para funcionar com o Discord XP Bot, mas pode ser adaptado para outros projetos Node.js/Docker. 