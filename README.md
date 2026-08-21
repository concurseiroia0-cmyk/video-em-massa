# BatchPost – SaaS de Produção de Conteúdo em Massa

> Coleta em massa. Edita em lote. Publica no horário.

## 🚀 Visão Geral

BatchPost é uma plataforma completa para criadores de conteúdo, agências e páginas de nicho que precisam coletar, editar e publicar dezenas ou centenas de vídeos do TikTok e Instagram automaticamente.

### Funcionalidades

- **Dashboard** — Métricas, gráficos e visão geral da operação
- **Coletor de Conteúdo** — Busca e importação de vídeos por perfil
- **Fila de Importação** — Pipeline visual com progresso e status
- **Editor de Templates** — Processamento FFmpeg com camadas configuráveis
- **Biblioteca** — Grid/lista com filtros, multi-select e player
- **Campanhas** — Agrupamento e organização de vídeos
- **Agenda** — Calendário e distribuição automática de posts
- **Contas Sociais** — Conexão OAuth segura com TikTok/Instagram
- **Publicações & Logs** — Status, retry automático e logs detalhados
- **Importar Perfil** — Coleta de conteúdo público com providers modulares

---

## 📦 Public Content Collector — Módulo de Coleta de Conteúdo Público

### Arquitetura

```
src/providers/
  types.ts                    # Interface comum para todos os providers
  index.ts                    # Factory (cria provider correto por plataforma)
  instagram/
    index.ts                  # Provider Instagram (conteúdo público)
    mockData.ts               # Dados simulados para demonstração
  tiktok/
    index.ts                  # Provider TikTok (conteúdo público)
    mockData.ts               # Dados simulados para demonstração

src/queue/
  types.ts                    # Tipos do sistema de fila
  manager.ts                  # Gerenciador de fila com concorrência
```

### Interface do Provider

Cada provider implementa:

```typescript
interface ContentProvider {
  platform: Platform;
  getProfile(username: string): Promise<ProfileInfo>;
  getVideos(options: SearchOptions): Promise<PaginatedResult<VideoMetadata>>;
  getVideoMetadata(videoId: string): Promise<VideoMetadata>;
  getMedia(video: VideoMetadata): Promise<Blob>;
}
```

### Sistema de Fila

Cada job passa por: `pending → processing → completed/failed`

- **Concorrência configurável**: `MAX_CONCURRENT_JOBS=3` (padrão)
- **Retry automático**: até 3 tentativas com backoff exponencial
- **Timeout**: 30 segundos por request (configurável)
- **Progresso**: individual (0-100%) e geral
- **Pause/Resume**: controle total da fila
- **Logs**: cada ação registrada com timestamp
- **Tratamento de erro**: erros classificados e reportados

### Segurança

- ✅ Apenas conteúdo **publicamente acessível**
- ✅ Sem credenciais ou autenticação
- ✅ Sem bypass de CAPTCHA ou DRM
- ✅ Sem contorno de anti-bot
- ✅ Ferramentas open-source apenas
- ✅ Variáveis de ambiente para secrets
- ✅ Nenhuma credencial no frontend

---

## 🛠 Dependências Open-Source Utilizadas

| Dependência | Uso | Licença |
|---|---|---|
| React 19 | UI Framework | MIT |
| TypeScript 6 | Type safety | Apache-2.0 |
| Vite 8 | Build tool | MIT |
| Tailwind CSS 4 | Styling | MIT |
| React Router 7 | Routing | MIT |
| Recharts | Gráficos | MIT |
| Lucide React | Ícones | MIT |
| react-hot-toast | Notificações | MIT |
| date-fns | Manipulação de datas | MIT |

**Para implementação real (backend necessário):**

| Ferramenta | Uso | Licença |
|---|---|---|
| yt-dlp | Download de vídeos públicos | Unlicense |
| cobalt.tools | API de download público | AGPL-3.0 |
| Supabase | Storage + Database | Apache-2.0 |
| Playwright | Scraping público (TOS) | Apache-2.0 |

---

## ⚙️ Configuração Local

### Pré-requisitos

- Node.js 20+
- npm ou yarn

### Instalação

```bash
# Clonar o repositório
git clone https://github.com/concurseiroia0-cmyk/video-em-massa.git
cd video-em-massa

# Instalar dependências
npm install

# Iniciar desenvolvimento
npm run dev
```

### Variáveis de Ambiente

Para implementação com backend real, crie um `.env`:

```env
# Supabase (para Storage e Database)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui

# Configurações de fila
VITE_MAX_CONCURRENT_JOBS=3
VITE_MAX_RETRIES=3
VITE_REQUEST_TIMEOUT=30000

# Provider APIs (NUNCA no frontend em produção)
# Estas variáveis devem ser usadas em um backend/edge function
PROVIDER_YTDLP_PATH=/usr/local/bin/yt-dlp
```

### Build e Deploy

```bash
# Build para produção
npm run build

# Preview local
npm run preview

# Deploy automático via GitHub Actions (push na branch main)
```

---

## 📁 Estrutura do Projeto

```
src/
├── components/
│   └── Layout.tsx          # Sidebar + topbar shell
├── pages/
│   ├── Dashboard.tsx        # Métricas e visão geral
│   ├── Collector.tsx        # Coletor básico (existente)
│   ├── Queue.tsx            # Fila de importação (existente)
│   ├── Templates.tsx        # Editor de templates
│   ├── Library.tsx          # Biblioteca de vídeos
│   ├── Campaigns.tsx        # Gerenciamento de campanhas
│   ├── Scheduler.tsx        # Calendário e agendamento
│   ├── Accounts.tsx         # Contas sociais
│   ├── Publications.tsx     # Status e logs de publicação
│   ├── ImportProfile.tsx    # ⭐ NOVO: Importar Perfil
│   └── Landing.tsx          # Landing page
├── providers/
│   ├── types.ts             # Interface de providers
│   ├── index.ts             # Factory
│   ├── instagram/           # Provider Instagram
│   └── tiktok/              # Provider TikTok
├── queue/
│   ├── types.ts             # Tipos da fila
│   └── manager.ts           # Gerenciador de fila
├── data/
│   ├── types.ts             # Tipos globais
│   └── mockData.ts          # Dados simulados
└── utils/
    └── helpers.ts           # Funções utilitárias
```

---

## 🧪 Testando o Módulo

### 1. Teste com 1 vídeo
1. Acesse "Importar Perfil"
2. Selecione a plataforma (TikTok ou Instagram)
3. Digite um @username (ex: `natgeo`, `khaby.lame`)
4. Selecione Quantidade: 10
5. Clique "Buscar Vídeos"
6. Selecione apenas 1 vídeo
7. Clique "Importar Selecionados"

### 2. Teste com 10 vídeos
1. Repita os passos acima
2. Selecione 10 vídeos
3. Observe a fila processando 3 por vez (concorrência configurável)

### 3. Teste em lote (50-100)
1. Selecione Quantidade: 100
2. Clique "Selecionar Todos"
3. Importe 100 vídeos
4. Observe o progresso geral (0/100 → 100/100)
5. Teste pause/resume
6. Teste retry em jobs com erro

---

## 📄 Licença

MIT License
