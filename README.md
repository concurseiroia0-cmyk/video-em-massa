# BatchPost – SaaS de Produção de Conteúdo em Massa

> Coleta em massa. Edita em lote. Publica no horário.

## 🚀 Funcionalidades

- **Dashboard** — Métricas e visão geral
- **Importar Perfil** — Encontre e selecione vídeos públicos do Instagram/TikTok
- **Fila de Importação** — Pipeline visual com progresso
- **Editor de Templates** — Processamento FFmpeg com camadas
- **Biblioteca** — Grid/lista com filtros e player
- **Campanhas** — Organização de vídeos
- **Agenda** — Calendário e agendamento
- **Contas Sociais** — Conexão OAuth
- **Publicações & Logs** — Status e retry

---

## 📦 Módulo de Coleta de Conteúdo Público

### Arquitetura

```
src/
├── providers/
│   ├── types.ts              # Interface comum ContentProvider
│   ├── index.ts              # Factory por plataforma
│   ├── instagram/
│   │   ├── index.ts          # Provider Instagram
│   │   └── mockData.ts       # Dados simulados
│   └── tiktok/
│       ├── index.ts          # Provider TikTok
│       └── mockData.ts       # Dados simulados
├── queue/
│   ├── types.ts              # Tipos da fila
│   └── manager.ts            # Gerenciador com concorrência
├── server/
│   ├── index.ts              # Express server (backend)
│   ├── routes/collect.ts     # API de coleta
│   └── utils/ytdlp.ts        # Wrapper yt-dlp
└── pages/
    └── ImportProfile.tsx      # Página de coleta
```

### Como Funciona

1. Usuário informa `@username` + plataforma
2. `resolveProfile()` resolve o perfil EXATO (case-insensitive)
3. Validação: `profile.username === requestedUsername`
4. `getVideos()` busca vídeos e valida ownership de cada um
5. Cada vídeo com `ownerUsername !== profile.username` é REJEITADO
6. Resultados mostrados com thumbnails, métricas e links originais
7. Usuário seleciona vídeos e pode importar

### Segurança

- ✅ Apenas conteúdo **publicamente acessível**
- ✅ Sem credenciais ou autenticação
- ✅ Sem bypass de CAPTCHA ou DRM
- ✅ Sem contorno de anti-bot
- ✅ Ferramentas open-source apenas
- ✅ Variáveis de ambiente para secrets

---

## ⚙️ Configuração Local

### Pré-requisitos

- Node.js 20+
- npm
- yt-dlp (para coleta real): `pip install yt-dlp` ou `brew install yt-dlp`

### Instalação

```bash
# Clonar
git clone https://github.com/concurseiroia0-cmyk/video-em-massa.git
cd video-em-massa

# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env

# Iniciar frontend (porta 5173)
npm run dev

# Em outro terminal: iniciar backend (porta 3001)
npm run server
```

### Backend (Coleta Real)

O backend usa **yt-dlp** (open-source, Unlicense) para buscar dados públicos:

```bash
# Verificar yt-dlp
yt-dlp --version

# O servidor fica em http://localhost:3001
# Health check: GET /api/health
# Coleta: POST /api/collect
```

### Frontend (GitHub Pages)

O frontend funciona standalone com dados simulados quando o backend não está disponível.

---

## 🗄️ Banco de Dados (Supabase)

Schema SQL disponível em `database/schema.sql`.

Tabelas:
- `collected_videos` — Vídeos coletados (platform + source_id único)
- `collection_jobs` — Jobs de coleta em lote

Para criar no Supabase:
1. Acesse o SQL Editor
2. Cole o conteúdo de `database/schema.sql`
3. Execute

---

## 🧪 Testando o Módulo

### Teste 1: 1 vídeo
1. Acesse `/#/importar-perfil`
2. Plataforma: Instagram
3. Perfil: `@flamengo`
4. Quantidade: 10
5. Clique "Encontrar Vídeos"
6. Selecione 1 vídeo
7. Verifique o link "Ver vídeo original" → abre Instagram

### Teste 2: 10 vídeos
1. Repita acima com 10 vídeos
2. Verifique que todos são do perfil @flamengo
3. Clique "Visualizar" em um → abre embed

### Teste 3: Lote (50-100)
1. Selecione TOP 50 ou TOP 100
2. Clique "Importar"
3. Observe a fila processando

### Teste de erro
1. Busque por `@perfil_inexistente_xyz`
2. Sistema deve mostrar: "Perfil não encontrado"

---

## 📋 Dependências

| Dependência | Uso | Licença |
|---|---|---|
| React 19 | UI Framework | MIT |
| TypeScript 6 | Type safety | Apache-2.0 |
| Vite 8 | Build tool | MIT |
| Tailwind CSS 4 | Styling | MIT |
| yt-dlp | Coleta de dados públicos | Unlicense |
| Express | Backend API | MIT |
| Supabase | Storage + Database | Apache-2.0 |

---

## 📄 Licença

MIT License
