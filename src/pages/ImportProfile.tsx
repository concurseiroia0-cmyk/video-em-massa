import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Search, Download, CheckSquare, Square, Zap, Eye, Heart,
  Clock, User, ArrowLeft, Play, X, Pause, RotateCcw, RefreshCw,
  AlertTriangle, CheckCircle2, ChevronDown, Loader2
} from 'lucide-react';
import { createProvider } from '../providers';
import type { Platform, VideoMetadata, ProfileInfo, SortOption } from '../providers/types';
import { ImportQueueManager } from '../queue/manager';
import type { ImportJob, ImportQueueState } from '../queue/types';
import { formatNumber, formatDuration, getSourceBg } from '../utils/helpers';
import toast from 'react-hot-toast';

type PageStep = 'search' | 'results' | 'importing';

export default function ImportProfile() {
  // ── Search Form State ──
  const [platform, setPlatform] = useState<Platform>('tiktok');
  const [username, setUsername] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [sortBy, setSortBy] = useState<SortOption>('views');
  const [searching, setSearching] = useState(false);

  // ── Page Step ──
  const [step, setStep] = useState<PageStep>('search');

  // ── Results State ──
  const [profile, setProfile] = useState<ProfileInfo | null>(null);
  const [videos, setVideos] = useState<VideoMetadata[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // ── Queue State ──
  const [queueState, setQueueState] = useState<ImportQueueState | null>(null);
  const queueRef = useRef<ImportQueueManager | null>(null);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<VideoMetadata | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      queueRef.current?.stop();
    };
  }, []);

  // ── Search Handler ──
  const handleSearch = useCallback(async () => {
    if (!username.trim()) {
      toast.error('Digite o @ do perfil');
      return;
    }

    setSearching(true);
    try {
      const provider = createProvider(platform);
      const cleanUsername = username.replace('@', '');

      // Fetch profile and videos in parallel
      const [profileData, videoData] = await Promise.all([
        provider.getProfile(cleanUsername),
        provider.getVideos({
          username: cleanUsername,
          platform,
          quantity,
          sortBy,
        }),
      ]);

      setProfile(profileData);
      setVideos(videoData.items);
      setSelected(new Set(videoData.items.map((v) => v.id)));
      setStep('results');
      toast.success(`${videoData.items.length} vídeos encontrados para @${cleanUsername}`);
    } catch (error) {
      toast.error('Erro ao buscar perfil. Tente novamente.');
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  }, [platform, username, quantity, sortBy]);

  // ── Selection Handlers ──
  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (selected.size === videos.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(videos.map((v) => v.id)));
    }
  }, [selected.size, videos]);

  // ── Import Handler ──
  const startImport = useCallback(() => {
    const selectedVideos = videos.filter((v) => selected.has(v.id));
    if (selectedVideos.length === 0) {
      toast.error('Selecione pelo menos 1 vídeo');
      return;
    }

    const provider = createProvider(platform);
    const manager = new ImportQueueManager(
      provider,
      selectedVideos,
      {
        onQueueUpdate: (state) => {
          setQueueState({ ...state });

          // Auto-toast on milestones
          if (state.completedJobs === state.totalJobs && state.totalJobs > 0) {
            toast.success(`🎉 Todos os ${state.totalJobs} vídeos importados com sucesso!`);
          }
        },
        onJobUpdate: (job) => {
          if (job.status === 'completed') {
            // subtle, no toast per job
          }
        },
        onError: (job, error) => {
          console.error(`Job ${job.id} error:`, error);
        },
      },
      { maxConcurrent: 3 }
    );

    manager.setSource(username.replace('@', ''), sortBy);
    queueRef.current = manager;
    setStep('importing');
    manager.start();
  }, [videos, selected, platform, username, sortBy]);

  // ── Queue Controls ──
  const togglePause = useCallback(() => {
    if (!queueRef.current) return;
    const state = queueRef.current.getState();
    if (state.isPaused) {
      queueRef.current.start();
      toast('Fila retomada');
    } else {
      queueRef.current.pause();
      toast('Fila pausada');
    }
  }, []);

  const retryAllFailed = useCallback(() => {
    queueRef.current?.retryAllFailed();
    toast.success('Retentando todos os jobs com erro');
  }, []);

  const retryJob = useCallback((jobId: string) => {
    queueRef.current?.retryJob(jobId);
    toast.success('Retentando job...');
  }, []);

  const goBack = useCallback(() => {
    if (step === 'importing') {
      setStep('results');
    } else if (step === 'results') {
      setStep('search');
      setProfile(null);
      setVideos([]);
      setSelected(new Set());
    }
  }, [step]);

  const resetSearch = useCallback(() => {
    queueRef.current?.stop();
    queueRef.current = null;
    setStep('search');
    setProfile(null);
    setVideos([]);
    setSelected(new Set());
    setQueueState(null);
  }, []);

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {step !== 'search' && (
            <button
              onClick={goBack}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">Importar Perfil</h1>
            <p className="text-sm text-slate-400">
              {step === 'search' && 'Busque e importe vídeos públicos de qualquer perfil'}
              {step === 'results' && `${videos.length} vídeos encontrados — ${selected.size} selecionados`}
              {step === 'importing' && 'Importação em progresso'}
            </p>
          </div>
        </div>
        {step === 'results' && (
          <button
            onClick={resetSearch}
            className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Nova Busca
          </button>
        )}
      </div>

      {/* ═══════════════════════════════════════ STEP: SEARCH ═══ */}
      {step === 'search' && (
        <div className="space-y-6">
          {/* Search Form */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Platform */}
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">Plataforma</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPlatform('tiktok')}
                    className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                      platform === 'tiktok'
                        ? 'border-pink-500/50 bg-pink-500/15 text-pink-400'
                        : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    ♪ TikTok
                  </button>
                  <button
                    onClick={() => setPlatform('instagram')}
                    className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                      platform === 'instagram'
                        ? 'border-purple-500/50 bg-purple-500/15 text-purple-light'
                        : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    ◎ Instagram
                  </button>
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">Perfil (@username)</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="@nome_do_perfil"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-purple-electric/50"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">Quantidade</label>
                <div className="flex gap-2">
                  {[10, 50, 100].map((q) => (
                    <button
                      key={q}
                      onClick={() => setQuantity(q)}
                      className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                        quantity === q
                          ? 'border-purple-electric/50 bg-purple-electric/15 text-purple-electric'
                          : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">Ordenação</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-purple-electric/50"
                >
                  <option value="views">Mais Visualizados</option>
                  <option value="recent">Mais Recentes</option>
                  <option value="likes">Mais Curtidos</option>
                </select>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-4">
              <button
                onClick={handleSearch}
                disabled={searching || !username.trim()}
                className="flex items-center gap-2 rounded-lg bg-purple-electric px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-purple-dark disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {searching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Buscar Vídeos
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Info Card */}
          <div className="rounded-xl border border-slate-700/30 bg-slate-800/30 p-4">
            <div className="flex items-start gap-3">
              <Zap className="mt-0.5 h-5 w-5 text-neon-green flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-white">Como funciona</h3>
                <p className="mt-1 text-xs text-slate-400">
                  O Public Content Collector busca apenas conteúdo <strong className="text-neon-green">publicamente acessível</strong> e autorizado para reutilização.
                  Nenhuma credencial ou autenticação é necessária. Ferramentas open-source são utilizadas para acessar dados públicos.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded bg-slate-700/50 px-2 py-0.5 text-[10px] text-slate-400">yt-dlp</span>
                  <span className="rounded bg-slate-700/50 px-2 py-0.5 text-[10px] text-slate-400">cobalt.tools</span>
                  <span className="rounded bg-slate-700/50 px-2 py-0.5 text-[10px] text-slate-400">Supabase Storage</span>
                  <span className="rounded bg-slate-700/50 px-2 py-0.5 text-[10px] text-slate-400">Concorrência configurável</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════ STEP: RESULTS ═══ */}
      {step === 'results' && (
        <div className="space-y-4 animate-slide-in">
          {/* Profile Card */}
          {profile && (
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4">
              <div className="flex items-center gap-4">
                <img
                  src={profile.avatarUrl}
                  alt={profile.username}
                  className="h-14 w-14 rounded-full border-2 border-slate-700 object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-white">{profile.displayName}</h3>
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${getSourceBg(profile.platform)}`}>
                      {profile.platform === 'tiktok' ? '♪ TikTok' : '◎ Instagram'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">@{profile.username} · {formatNumber(profile.followers)} seguidores · {formatNumber(profile.postsCount)} posts</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{videos.length}</p>
                  <p className="text-[10px] text-slate-500">vídeos encontrados</p>
                </div>
              </div>
            </div>
          )}

          {/* Selection Controls */}
          <div className="flex items-center justify-between rounded-xl border border-slate-700/50 bg-slate-800/50 p-4">
            <div className="flex items-center gap-3">
              <button onClick={selectAll} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
                {selected.size === videos.length ? (
                  <CheckSquare className="h-4 w-4 text-purple-electric" />
                ) : (
                  <Square className="h-4 w-4 text-slate-600" />
                )}
                Selecionar Todos
              </button>
              <span className="text-xs text-slate-500">{selected.size}/{videos.length} selecionados</span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={quantity}
                onChange={(e) => {
                  const newQ = Number(e.target.value);
                  setQuantity(newQ);
                  setSelected(new Set(videos.slice(0, newQ).map((v) => v.id)));
                }}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white outline-none"
              >
                <option value={10}>TOP 10</option>
                <option value={50}>TOP 50</option>
                <option value={100}>TOP 100</option>
              </select>
              <button
                onClick={startImport}
                disabled={selected.size === 0}
                className="flex items-center gap-2 rounded-lg bg-neon-green px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-neon-green-dark disabled:opacity-30"
              >
                <Download className="h-4 w-4" />
                Importar Selecionados ({selected.size})
              </button>
            </div>
          </div>

          {/* Video Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map((video) => (
              <div
                key={video.id}
                className={`group rounded-xl border overflow-hidden transition-all duration-150 cursor-pointer ${
                  selected.has(video.id)
                    ? 'border-purple-electric/50 bg-purple-electric/5 ring-1 ring-purple-electric/20'
                    : 'border-slate-700/50 bg-slate-800/50 hover:border-slate-600'
                }`}
                onClick={() => toggleSelect(video.id)}
              >
                {/* Thumbnail */}
                <div className="relative aspect-[9/16] bg-slate-900 overflow-hidden">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="h-full w-full object-cover opacity-80"
                    loading="lazy"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <button
                      onClick={(e) => { e.stopPropagation(); setPreviewVideo(video); }}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
                    >
                      <Play className="h-5 w-5 text-white ml-0.5" />
                    </button>
                  </div>
                  {/* Select checkbox */}
                  <div className="absolute top-2 left-2">
                    {selected.has(video.id) ? (
                      <CheckSquare className="h-5 w-5 text-purple-electric drop-shadow-lg" />
                    ) : (
                      <Square className="h-5 w-5 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                  {/* Duration badge */}
                  <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white font-medium">
                    {formatDuration(video.duration)}
                  </span>
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="line-clamp-2 text-xs font-medium text-white leading-tight">{video.title}</p>
                  <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-500">
                    <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" />{formatNumber(video.views)}</span>
                    <span className="flex items-center gap-0.5"><Heart className="h-3 w-3" />{formatNumber(video.likes)}</span>
                    <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" />{formatNumber(video.comments)} 💬</span>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-600">
                    {new Date(video.publishedAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════ STEP: IMPORTING ═══ */}
      {step === 'importing' && queueState && (
        <div className="space-y-4 animate-slide-in">
          {/* Overall Progress */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-semibold text-white">Progresso da Importação</h3>
                <span className="text-xs text-slate-500">
                  {queueState.platform === 'tiktok' ? '♪ TikTok' : '◎ Instagram'} · @{queueState.username}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePause}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  {queueState.isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                  {queueState.isPaused ? 'Retomar' : 'Pausar'}
                </button>
                <button
                  onClick={retryAllFailed}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  Retry Erros
                </button>
                <button
                  onClick={resetSearch}
                  className="flex items-center gap-1.5 rounded-lg bg-purple-electric/15 px-3 py-1.5 text-xs font-medium text-purple-electric hover:bg-purple-electric/25 transition-colors"
                >
                  Nova Busca
                </button>
              </div>
            </div>

            {/* Big Progress Bar */}
            <div className="mb-4">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-4xl font-bold text-white">{queueState.completedJobs}</span>
                <span className="text-lg text-slate-500">/ {queueState.totalJobs}</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-electric to-neon-green transition-all duration-500"
                  style={{ width: `${queueState.overallProgress}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">{queueState.overallProgress}% concluído</p>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-4 gap-3">
              <div className="rounded-lg bg-slate-900/50 p-3 text-center">
                <p className="text-lg font-bold text-slate-400">{queueState.totalJobs - queueState.completedJobs - queueState.failedJobs - queueState.processingCount}</p>
                <p className="text-[10px] text-slate-500">Na fila</p>
              </div>
              <div className="rounded-lg bg-amber-500/10 p-3 text-center">
                <p className="text-lg font-bold text-amber-400">{queueState.processingCount}</p>
                <p className="text-[10px] text-slate-500">Processando</p>
              </div>
              <div className="rounded-lg bg-neon-green/10 p-3 text-center">
                <p className="text-lg font-bold text-neon-green">{queueState.completedJobs}</p>
                <p className="text-[10px] text-slate-500">Concluídos</p>
              </div>
              <div className="rounded-lg bg-red-500/10 p-3 text-center">
                <p className="text-lg font-bold text-red-400">{queueState.failedJobs}</p>
                <p className="text-[10px] text-slate-500">Erros</p>
              </div>
            </div>
          </div>

          {/* Job List */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5">
            <h3 className="mb-3 text-sm font-semibold text-white">Detalhes dos Jobs</h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {queueState.jobs.map((job, index) => (
                <JobCard
                  key={job.id}
                  job={job}
                  index={index}
                  expanded={expandedJob === job.id}
                  onToggle={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                  onRetry={() => retryJob(job.id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════ VIDEO PREVIEW MODAL ═══ */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setPreviewVideo(null)}>
          <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreviewVideo(null)} className="absolute top-3 right-3 z-10 rounded-full bg-black/50 p-1 text-white hover:bg-black/70">
              <X className="h-5 w-5" />
            </button>
            <div className="aspect-[9/16] bg-slate-900 overflow-hidden">
              <img src={previewVideo.thumbnailUrl} alt={previewVideo.title} className="h-full w-full object-cover" />
            </div>
            <div className="p-4">
              <p className="text-sm font-medium text-white">{previewVideo.title}</p>
              <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{formatNumber(previewVideo.views)}</span>
                <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{formatNumber(previewVideo.likes)}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDuration(previewVideo.duration)}</span>
              </div>
              <a href={previewVideo.permalink} target="_blank" rel="noopener noreferrer" className="mt-3 block text-center text-xs text-purple-electric hover:text-purple-light">
                Ver no {previewVideo.platform === 'tiktok' ? 'TikTok' : 'Instagram'} →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Job Card Component ──

function JobCard({ job, index, expanded, onToggle, onRetry }: {
  job: ImportJob;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onRetry: () => void;
}) {
  const statusConfig = {
    pending: { icon: Clock, color: 'text-slate-400', bg: 'bg-slate-500/10', label: 'Pendente' },
    processing: { icon: Loader2, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Processando' },
    completed: { icon: CheckCircle2, color: 'text-neon-green', bg: 'bg-neon-green/10', label: 'Concluído' },
    failed: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Falhou' },
  };

  const config = statusConfig[job.status];
  const Icon = config.icon;

  return (
    <div className="rounded-lg border border-slate-700/30 bg-slate-800/30 transition-all hover:bg-slate-800/60">
      <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={onToggle}>
        <span className="w-8 text-right text-[10px] font-mono text-slate-600">
          {String(index + 1).padStart(3, '0')}
        </span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${config.bg} flex-shrink-0`}>
          <Icon className={`h-4 w-4 ${config.color} ${job.status === 'processing' ? 'animate-spin' : ''}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-xs font-medium text-white">{job.video.title}</p>
          <p className="text-[10px] text-slate-500">{job.video.profile} · {formatNumber(job.video.views)} views</p>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${config.bg} ${config.color}`}>
          {config.label}
        </span>
        {job.retryCount > 0 && (
          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-400">
            {job.retryCount}/{job.maxRetries}
          </span>
        )}
        {job.status === 'failed' && (
          <button
            onClick={(e) => { e.stopPropagation(); onRetry(); }}
            className="flex items-center gap-1 rounded bg-neon-green/15 px-2 py-1 text-[10px] font-medium text-neon-green hover:bg-neon-green/25"
          >
            <RefreshCw className="h-2.5 w-2.5" /> Retry
          </button>
        )}
        <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </div>

      {/* Progress bar for processing jobs */}
      {job.status === 'processing' && (
        <div className="mx-3 mb-2">
          <div className="h-1 w-full overflow-hidden rounded-full bg-slate-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-electric to-neon-green transition-all duration-300"
              style={{ width: `${job.progress}%` }}
            />
          </div>
          <p className="mt-0.5 text-right text-[10px] text-slate-500">{job.progress}%</p>
        </div>
      )}

      {/* Expanded logs */}
      {expanded && job.logs.length > 0 && (
        <div className="border-t border-slate-700/30 bg-slate-900/50 p-3 animate-slide-in">
          <h4 className="mb-2 text-[10px] font-medium text-slate-500 uppercase">Logs</h4>
          <div className="space-y-1">
            {job.logs.map((log, i) => (
              <div key={i} className="flex items-start gap-2 text-[10px]">
                <span className="text-slate-600 flex-shrink-0 font-mono">
                  {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                </span>
                <span className={
                  log.level === 'error' ? 'text-red-400' :
                  log.level === 'warn' ? 'text-amber-400' :
                  log.level === 'success' ? 'text-neon-green' :
                  'text-slate-400'
                }>
                  {log.message}
                </span>
              </div>
            ))}
          </div>
          {job.errorMessage && (
            <div className="mt-2 rounded bg-red-500/10 p-2 text-[10px] text-red-400 font-mono">
              {job.errorMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
