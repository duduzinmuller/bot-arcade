# Discord XP Bot

Um bot Discord completo com sistema de XP e níveis, similar ao Arcane Bot. Inclui painel web para configuração e monitoramento.

## 🚀 Funcionalidades

### Bot Discord
- ✅ Sistema de XP e níveis automático
- ✅ Recompensas por nível (cargos automáticos)
- ✅ Comando `/perfil` com card visual personalizado
- ✅ Comando `/ranking` com top usuários
- ✅ Sistema anti-spam configurável
- ✅ Comandos de configuração para administradores
- ✅ Suporte a comandos slash e prefixo (!)

### Painel Web
- ✅ Dashboard com estatísticas do servidor
- ✅ Visualização do ranking em tempo real
- ✅ Configuração de XP, cooldown e multiplicadores
- ✅ Interface responsiva e moderna

## 📦 Instalação

### 1. Clonar e Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure:

```env
# Discord Bot Configuration
DISCORD_TOKEN=seu_token_do_bot
CLIENT_ID=id_do_seu_bot

# Database Configuration
DATABASE_PATH=./data/bot.db

# Web Panel Configuration
WEB_PORT=3000
WEB_SECRET=sua_chave_secreta

# Bot Configuration
XP_PER_MESSAGE=15
XP_COOLDOWN=60000
LEVEL_MULTIPLIER=100
```

### 3. Criar o Bot no Discord

1. Acesse [Discord Developer Portal](https://discord.com/developers/applications)
2. Crie uma nova aplicação
3. Vá em "Bot" e crie um bot
4. Copie o token e coloque no `.env`
5. Copie o Client ID da aba "General Information"

### 4. Configurar Permissões

O bot precisa das seguintes permissões:
- `Send Messages`
- `Use Slash Commands`
- `Manage Roles`
- `Read Message History`
- `Embed Links`
- `Attach Files`

### 5. Executar Setup

```bash
npm run setup
```

## 🎮 Uso

### Iniciar o Bot

```bash
npm start
```

### Iniciar o Painel Web

```bash
npm run web
```

O painel estará disponível em `http://localhost:3000`

### Desenvolvimento

```bash
npm run dev
```

## 📋 Comandos Disponíveis

### Comandos Slash

- `/perfil [usuario]` - Mostra o perfil de XP com card visual
- `/ranking [pagina]` - Mostra o ranking do servidor
- `/config` - Configurações do sistema (apenas administradores)
  - `/config xp <quantidade>` - Define XP por mensagem
  - `/config cooldown <segundos>` - Define cooldown entre mensagens
  - `/config multiplicador <valor>` - Define multiplicador de nível
  - `/config canal-levelup [canal]` - Define canal para mensagens de level up
  - `/config recompensa <nivel> <cargo>` - Adiciona recompensa de nível
  - `/config ver` - Mostra configurações atuais

### Comandos com Prefixo

- `!perfil [@usuario]` - Mostra perfil de XP
- `!ranking` - Mostra ranking do servidor

## 🗄️ Estrutura do Banco de Dados

### Tabela `users`
- `id` - ID do usuário Discord
- `guild_id` - ID do servidor
- `xp` - XP total do usuário
- `level` - Nível atual
- `total_messages` - Total de mensagens enviadas
- `last_message` - Timestamp da última mensagem

### Tabela `guild_settings`
- `guild_id` - ID do servidor
- `xp_per_message` - XP ganho por mensagem
- `xp_cooldown` - Cooldown entre mensagens (ms)
- `level_multiplier` - Multiplicador para cálculo de nível
- `level_up_message` - Mensagem personalizada de level up
- `level_up_channel` - Canal para mensagens de level up

### Tabela `level_rewards`
- `guild_id` - ID do servidor
- `level` - Nível necessário
- `role_id` - ID do cargo a ser dado

## 🎨 Personalização

### Fórmula de Nível

O nível é calculado usando a fórmula:
```
level = floor(sqrt(xp / multiplier)) + 1
```

### XP Necessário para Próximo Nível

```
xp_needed = (level^2) * multiplier
```

### Card de Perfil

O card de perfil é gerado usando Canvas e inclui:
- Avatar do usuário
- Barra de progresso animada
- Informações de XP e nível
- Design gradiente personalizado

## 🚀 Deploy

### Railway

1. Conecte seu repositório ao Railway
2. Configure as variáveis de ambiente
3. Deploy automático

### Render

1. Conecte seu repositório ao Render
2. Configure as variáveis de ambiente
3. Use o comando de build: `npm install`
4. Use o comando de start: `npm start`

### VPS

1. Clone o repositório
2. Configure as variáveis de ambiente
3. Instale PM2: `npm install -g pm2`
4. Execute: `pm2 start src/bot.js --name discord-bot`
5. Para o painel web: `pm2 start src/web/server.js --name web-panel`

## 🔧 Configurações Avançadas

### Anti-Spam

O sistema anti-spam impede que usuários ganhem XP muito rapidamente:
- Cooldown configurável por servidor
- Limpeza automática de cache antigo
- Proteção contra spam de mensagens

### Sistema de Recompensas

- Cargos automáticos por nível
- Múltiplas recompensas por servidor
- Verificação automática de permissões

### Painel Web

- Interface responsiva
- Estatísticas em tempo real
- Configuração sem necessidade de comandos
- Visualização de ranking completo

## 🐛 Solução de Problemas

### Bot não responde
1. Verifique se o token está correto
2. Verifique as permissões do bot
3. Verifique os logs no console

### Comandos slash não aparecem
1. Execute `npm run setup` novamente
2. Aguarde até 1 hora para sincronização
3. Verifique se o CLIENT_ID está correto

### Erro de permissões
1. Verifique se o bot tem permissão para gerenciar cargos
2. Verifique se o cargo do bot está acima dos cargos que ele deve dar
3. Verifique as permissões do canal

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Suporte

Para suporte, abra uma issue no GitHub ou entre em contato através do Discord.

---

Feito com ❤️ para a comunidade Discord