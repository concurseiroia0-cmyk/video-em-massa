import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Search, Download, CheckSquare, Square, Zap, Eye, Heart,
  Clock, ArrowLeft, Play, X, Pause, RotateCcw, RefreshCw,
  AlertTriangle, CheckCircle2, ChevronDown, Loader2,
  ShieldCheck, ShieldAlert, Terminal
} from 'lucide-react';
import { createProvider } from '../providers';
import type { Platform, VideoMetadata, ProfileInfo, SortOption, ProfileResolutionResult, ResolutionDebug } from '../providers/types';
import { ImportQueueManager } from '../queue/manager';
import type { ImportJob, ImportQueueState } from '../queue/types';
import { formatNumber, formatDuration, getSourceBg } from '../utils/helpers';
import toast from 'react-hot-toast';

type PageStep = 'search' | 'resolving' | 'results' | 'importing';

export default function ImportProfile() {
  // ── Search Form ──
  const [platform, setPlatform] = useState<Platform>('tiktok');
  const [username, setUsername] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [sortBy, setSortBy] = useState<SortOption>('views');
  const [searching, setSearching] = useState(false);

  // ── Step ──
  const [step, setStep] = useState<PageStep>('search');

  // ── Resolution ──
  const [resolution, setResolution] = useState<ProfileResolutionResult | null>(null);
  const [resolvedProfile, setResolvedProfile] = useState<ProfileInfo | null>(null);
  const [debug, setDebug] = useState<ResolutionDebug | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  // ── Results ──
  const [videos, setVideos] = useState<VideoMetadata[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // ── Queue ──
  const [queueState, setQueueState] = useState<ImportQueueState | null>(null);
  const queueRef = useRef<ImportQueueManager | null>(null);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<VideoMetadata | null>(null);

  useEffect(() => () => { queueRef.current?.stop(); }, []);

  // ── Search + Resolve ──
  const handleSearch = useCallback(async () => {
    if (!username.trim()) {
      toast.error('Digite o @ do perfil');
      return;
    }

    setSearching(true);
    setStep('resolving');
    setResolution(null);
    setResolvedProfile(null);
    setDebug(null);

    try {
      const provider = createProvider(platform);

      // STEP 1: Resolve exact profile
      const result = await provider.resolveProfile(username);
      setResolution(result);
      setDebug(result.debug);

      if (!result.success) {
        toast.error(result.error);
        setStep('search');
        return;
      }

      // STEP 2: Validate the resolved profile matches the request
      const normalizedInput = username.trim().replace(/^@/, '').toLowerCase();
      if (result.profile.username.toLowerCase() !== normalizedInput) {
        const errMsg = `Perfil resolvido não corresponde ao solicitado. Esperado: @${normalizedInput}, Obtido: @${result.profile.username}`;
        toast.error(errMsg);
        setStep('search');
        return;
      }

      setResolvedProfile(result.profile);

      // STEP 3: Fetch videos with ownership validation
      const videoResult = await provider.getVideos(
        { username: result.profile.username, platform, quantity, sortBy },
        result.profile
      );

      setDebug(videoResult.debug);
      setVideos(videoResult.items);
      setSelected(new Set(videoResult.items.map((v) => v.id)));
      setStep('results');

      toast.success(
        `${videoResult.items.length} vídeos de @${result.profile.username} ` +
        `(${videoResult.debug.ownershipRejected} rejeitados por ownership mismatch)`
      );
    } catch (error) {
      toast.error('Erro ao buscar perfil. Tente novamente.');
      console.error('Search error:', error);
      setStep('search');
    } finally {
      setSearching(false);
    }
  }, [platform, username, quantity, sortBy]);

  // ── Selection ──
  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (selected.size === videos.length) setSelected(new Set());
    else setSelected(new Set(videos.map((v) => v.id)));
  }, [selected.size, videos]);

  // ── Import ──
  const startImport = useCallback(() => {
    const selectedVideos = videos.filter((v) => selected.has(v.id));
    if (selectedVideos.length === 0) { toast.error('Selecione pelo menos 1 vídeo'); return; }
    if (!resolvedProfile) { toast.error('Perfil não resolvido'); return; }

    const provider = createProvider(platform);
    const manager = new ImportQueueManager(provider, selectedVideos, {
      onQueueUpdate: (state) => {
        setQueueState({ ...state });
        if (state.completedJobs === state.totalJobs && state.totalJobs > 0) {
          toast.success(`Todos os ${state.totalJobs} vídeos importados!`);
        }
      },
    }, { maxConcurrent: 3 });

    manager.setSource(resolvedProfile.username, sortBy);
    queueRef.current = manager;
    setStep('importing');
    manager.start();
  }, [videos, selected, platform, resolvedProfile, sortBy]);

  const togglePause = useCallback(() => {
    if (!queueRef.current) return;
    const s = queueRef.current.getState();
    if (s.isPaused) { queueRef.current.start(); toast('Fila retomada'); }
    else { queueRef.current.pause(); toast('Fila pausada'); }
  }, []);

  const retryAllFailed = useCallback(() => { queueRef.current?.retryAllFailed(); toast.success('Retryando erros'); }, []);
  const retryJob = useCallback((jobId: string) => { queueRef.current?.retryJob(jobId); toast.success('Retryando job...'); }, []);

  const goBack = useCallback(() => {
    if (step === 'importing') setStep('results');
    else if (step === 'results' || step === 'resolving') {
      setStep('search'); setResolvedProfile(null); setVideos([]); setSelected(new Set());
      setResolution(null); setDebug(null);
    }
  }, [step]);

  const resetSearch = useCallback(() => {
    queueRef.current?.stop(); queueRef.current = null;
    setStep('search'); setResolvedProfile(null); setVideos([]); setSelected(new Set());
    setQueueState(null); setResolution(null); setDebug(null);
  }, []);

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {(step !== 'search') && (
            <button onClick={goBack} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">Importar Perfil</h1>
            <p className="text-sm text-slate-400">
              {step === 'search' && 'Busque e importe vídeos públicos de qualquer perfil'}
              {step === 'resolving' && 'Resolvendo perfil exato...'}
              {step === 'results' && `${videos.length} vídeos encontrados — ${selected.size} selecionados`}
              {step === 'importing' && 'Importação em progresso'}
            </p>
          </div>
        </div>
        {step === 'results' && (
          <button onClick={resetSearch} className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <RefreshCw className="h-3.5 w-3.5" /> Nova Busca
          </button>
        )}
      </div>

      {/* ═══════════════════════════ STEP: SEARCH ═══ */}
      {step === 'search' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Platform */}
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">Plataforma</label>
                <div className="flex gap-2">
                  <button onClick={() => setPlatform('tiktok')} className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${platform === 'tiktok' ? 'border-pink-500/50 bg-pink-500/15 text-pink-400' : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'}`}>
                    ♪ TikTok
                  </button>
                  <button onClick={() => setPlatform('instagram')} className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${platform === 'instagram' ? 'border-purple-500/50 bg-purple-500/15 text-purple-light' : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'}`}>
                    ◎ Instagram
                  </button>
                </div>
              </div>
              {/* Username */}
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">Perfil (@username)</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="@flamengo"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-purple-electric/50"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
              </div>
              {/* Quantity */}
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">Quantidade</label>
                <div className="flex gap-2">
                  {[10, 50, 100].map((q) => (
                    <button key={q} onClick={() => setQuantity(q)} className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${quantity === q ? 'border-purple-electric/50 bg-purple-electric/15 text-purple-electric' : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'}`}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
              {/* Sort */}
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">Ordenação</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-purple-electric/50">
                  <option value="views">Mais Visualizados</option>
                  <option value="recent">Mais Recentes</option>
                  <option value="likes">Mais Curtidos</option>
                </select>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-4">
              <button onClick={handleSearch} disabled={searching || !username.trim()} className="flex items-center gap-2 rounded-lg bg-purple-electric px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-purple-dark disabled:opacity-40 disabled:cursor-not-allowed">
                {searching ? (<><Loader2 className="h-4 w-4 animate-spin" /> Buscando...</>) : (<><Search className="h-4 w-4" /> Buscar Vídeos</>)}
              </button>
            </div>
          </div>

          {/* Error display */}
          {resolution && !resolution.success && (
            <div className="animate-slide-in rounded-xl border border-red-500/30 bg-red-500/10 p-5">
              <div className="flex items-start gap-3">
                <ShieldAlert className="mt-0.5 h-5 w-5 text-red-400 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-red-400">Perfil Não Encontrado</h3>
                  <p className="mt-1 text-sm text-red-300/80">{resolution.error}</p>
                  {debug && <DebugPanel debug={debug} show={showDebug} onToggle={() => setShowDebug(!showDebug)} />}
                </div>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="rounded-xl border border-slate-700/30 bg-slate-800/30 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-neon-green flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-white">Resolução Exata de Perfil</h3>
                <p className="mt-1 text-xs text-slate-400">
                  O sistema resolve o <strong className="text-white">perfil exato</strong> antes de coletar vídeos.
                  Se o perfil não for encontrado com precisão, o sistema <strong className="text-red-400">retorna erro</strong> — nunca aceita resultados aproximados.
                  Cada vídeo é validado contra o perfil resolvido antes de ser incluído nos resultados.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════ STEP: RESOLVING ═══ */}
      {step === 'resolving' && (
        <div className="flex flex-col items-center justify-center py-20 animate-slide-in">
          <Loader2 className="h-12 w-12 text-purple-electric animate-spin mb-4" />
          <h3 className="text-lg font-semibold text-white">Resolvendo perfil exato...</h3>
          <p className="mt-2 text-sm text-slate-400">Verificando @{username.replace('@', '')}</p>
        </div>
      )}

      {/* ═══════════════════════════ STEP: RESULTS ═══ */}
      {step === 'results' && resolvedProfile && debug && (
        <div className="space-y-4 animate-slide-in">
          {/* Profile Card */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4">
            <div className="flex items-center gap-4">
              <img src={resolvedProfile.avatarUrl} alt={resolvedProfile.username} className="h-14 w-14 rounded-full border-2 border-slate-700 object-cover" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-white">{resolvedProfile.displayName}</h3>
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${getSourceBg(resolvedProfile.platform)}`}>
                    {resolvedProfile.platform === 'tiktok' ? '♪ TikTok' : '◎ Instagram'}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-neon-green/15 px-2 py-0.5 text-[10px] font-medium text-neon-green">
                    <ShieldCheck className="h-3 w-3" /> Perfil Exato Verificado
                  </span>
                </div>
                <p className="text-xs text-slate-500">@{resolvedProfile.username} · {formatNumber(resolvedProfile.followers)} seguidores · ID: {resolvedProfile.id}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{videos.length}</p>
                <p className="text-[10px] text-slate-500">vídeos validados</p>
              </div>
            </div>
          </div>

          {/* Ownership Debug Summary */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-white">Validação de Ownership</h3>
              <button onClick={() => setShowDebug(!showDebug)} className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-white transition-colors">
                <Terminal className="h-3 w-3" /> Debug Logs
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-neon-green/10 p-2 text-center">
                <p className="text-lg font-bold text-neon-green">{debug.ownershipPassed}</p>
                <p className="text-[10px] text-slate-500">Válidos</p>
              </div>
              <div className="rounded-lg bg-red-500/10 p-2 text-center">
                <p className="text-lg font-bold text-red-400">{debug.ownershipRejected}</p>
                <p className="text-[10px] text-slate-500">Rejeitados</p>
              </div>
              <div className="rounded-lg bg-slate-700/30 p-2 text-center">
                <p className="text-lg font-bold text-white">{debug.totalFetched}</p>
                <p className="text-[10px] text-slate-500">Total Buscados</p>
              </div>
            </div>
            {showDebug && <DebugPanel debug={debug} show={true} onToggle={() => setShowDebug(!showDebug)} />}
          </div>

          {/* Selection Controls */}
          <div className="flex items-center justify-between rounded-xl border border-slate-700/50 bg-slate-800/50 p-4">
            <div className="flex items-center gap-3">
              <button onClick={selectAll} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
                {selected.size === videos.length ? <CheckSquare className="h-4 w-4 text-purple-electric" /> : <Square className="h-4 w-4 text-slate-600" />}
                Selecionar Todos
              </button>
              <span className="text-xs text-slate-500">{selected.size}/{videos.length} selecionados</span>
            </div>
            <div className="flex items-center gap-2">
              <select value={quantity} onChange={(e) => { const q = Number(e.target.value); setQuantity(q); setSelected(new Set(videos.slice(0, q).map((v) => v.id))); }}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white outline-none">
                <option value={10}>TOP 10</option><option value={50}>TOP 50</option><option value={100}>TOP 100</option>
              </select>
              <button onClick={startImport} disabled={selected.size === 0}
                className="flex items-center gap-2 rounded-lg bg-neon-green px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-neon-green-dark disabled:opacity-30">
                <Download className="h-4 w-4" /> Importar Selecionados ({selected.size})
              </button>
            </div>
          </div>

          {/* Video Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map((video) => (
              <div key={video.id} className={`group rounded-xl border overflow-hidden transition-all duration-150 cursor-pointer ${selected.has(video.id) ? 'border-purple-electric/50 bg-purple-electric/5 ring-1 ring-purple-electric/20' : 'border-slate-700/50 bg-slate-800/50 hover:border-slate-600'}`}
                onClick={() => toggleSelect(video.id)}>
                <div className="relative aspect-[9/16] bg-slate-900 overflow-hidden">
                  <img src={video.thumbnailUrl} alt={video.title} className="h-full w-full object-cover opacity-80" loading="lazy" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <button onClick={(e) => { e.stopPropagation(); setPreviewVideo(video); }} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                      <Play className="h-5 w-5 text-white ml-0.5" />
                    </button>
                  </div>
                  <div className="absolute top-2 left-2">
                    {selected.has(video.id) ? <CheckSquare className="h-5 w-5 text-purple-electric drop-shadow-lg" /> : <Square className="h-5 w-5 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </div>
                  <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white font-medium">{formatDuration(video.duration)}</span>
                  {video.ownershipValidated && (
                    <span className="absolute top-2 right-2 rounded bg-neon-green/80 px-1.5 py-0.5 text-[8px] font-bold text-white">✓ OWNER</span>
                  )}
                </div>
                <div className="p-3">
                  <p className="line-clamp-2 text-xs font-medium text-white leading-tight">{video.title}</p>
                  <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-500">
                    <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" />{formatNumber(video.views)}</span>
                    <span className="flex items-center gap-0.5"><Heart className="h-3 w-3" />{formatNumber(video.likes)}</span>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-600">{new Date(video.publishedAt).toLocaleDateString('pt-BR')} · @{video.ownerUsername}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════ STEP: IMPORTING ═══ */}
      {step === 'importing' && queueState && (
        <div className="space-y-4 animate-slide-in">
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-semibold text-white">Progresso da Importação</h3>
                <span className="text-xs text-slate-500">@{queueState.username}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={togglePause} className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                  {queueState.isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                  {queueState.isPaused ? 'Retomar' : 'Pausar'}
                </button>
                <button onClick={retryAllFailed} className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                  <RotateCcw className="h-3 w-3" /> Retry Erros
                </button>
                <button onClick={resetSearch} className="flex items-center gap-1.5 rounded-lg bg-purple-electric/15 px-3 py-1.5 text-xs font-medium text-purple-electric hover:bg-purple-electric/25 transition-colors">
                  Nova Busca
                </button>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-4xl font-bold text-white">{queueState.completedJobs}</span>
                <span className="text-lg text-slate-500">/ {queueState.totalJobs}</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-700">
                <div className="h-full rounded-full bg-gradient-to-r from-purple-electric to-neon-green transition-all duration-500" style={{ width: `${queueState.overallProgress}%` }} />
              </div>
              <p className="mt-1 text-xs text-slate-500">{queueState.overallProgress}% concluído</p>
            </div>
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
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5">
            <h3 className="mb-3 text-sm font-semibold text-white">Detalhes dos Jobs</h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {queueState.jobs.map((job, index) => (
                <JobCard key={job.id} job={job} index={index} expanded={expandedJob === job.id}
                  onToggle={() => setExpandedJob(expandedJob === job.id ? null : job.id)} onRetry={() => retryJob(job.id)} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setPreviewVideo(null)}>
          <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreviewVideo(null)} className="absolute top-3 right-3 z-10 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"><X className="h-5 w-5" /></button>
            <div className="aspect-[9/16] bg-slate-900 overflow-hidden">
              <img src={previewVideo.thumbnailUrl} alt={previewVideo.title} className="h-full w-full object-cover" />
            </div>
            <div className="p-4">
              <p className="text-sm font-medium text-white">{previewVideo.title}</p>
              <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{formatNumber(previewVideo.views)}</span>
                <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{formatNumber(previewVideo.likes)}</span>
              </div>
              <p className="mt-2 text-[10px] text-slate-500">Owner: @{previewVideo.ownerUsername} · ID: {previewVideo.ownerId}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Debug Panel ──

function DebugPanel({ debug, show, onToggle }: { debug: ResolutionDebug; show: boolean; onToggle: () => void }) {
  return (
    <div className="mt-3">
      <button onClick={onToggle} className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-white transition-colors">
        <Terminal className="h-3 w-3" /> {show ? 'Ocultar Logs' : 'Mostrar Logs de Debug'}
      </button>
      {show && (
        <div className="mt-2 rounded-lg bg-slate-950 p-3 font-mono text-[10px] leading-relaxed">
          <p className="text-slate-500">{'═'.repeat(50)}</p>
          <p className="text-purple-electric font-bold">DEBUG LOG — Profile Resolution & Ownership</p>
          <p className="text-slate-500">{'═'.repeat(50)}</p>
          <p className="text-slate-400 mt-1">Requested username: <span className="text-white">{debug.requestedUsername}</span></p>
          <p className="text-slate-400">Normalized username: <span className="text-white">{debug.normalizedUsername}</span></p>
          <p className="text-slate-400">Resolved profile: <span className={debug.resolvedProfile ? 'text-neon-green' : 'text-red-400'}>{debug.resolvedProfile ? `@${debug.resolvedProfile.username} (ID: ${debug.resolvedProfile.id})` : 'FAILED'}</span></p>
          <p className="text-slate-400">Videos fetched: <span className="text-white">{debug.totalFetched}</span></p>
          <p className="text-slate-400">Ownership passed: <span className="text-neon-green">{debug.ownershipPassed}</span></p>
          <p className="text-slate-400">Ownership rejected: <span className={debug.ownershipRejected > 0 ? 'text-red-400' : 'text-neon-green'}>{debug.ownershipRejected}</span></p>
          {debug.warnings.length > 0 && (
            <div className="mt-2">
              <p className="text-amber-400 font-bold">Warnings:</p>
              {debug.warnings.map((w, i) => <p key={i} className="text-amber-400/70">  ⚠ {w}</p>)}
            </div>
          )}
          <p className="text-slate-500 mt-2">{'─'.repeat(50)}</p>
          <p className="text-slate-400 font-bold">Steps:</p>
          {debug.steps.map((s, i) => (
            <p key={i} className={`pl-2 ${s.includes('FAILED') || s.includes('REJECTED') ? 'text-red-400' : s.includes('PASSED') ? 'text-neon-green' : 'text-slate-400'}`}>
              {s}
            </p>
          ))}
          <p className="text-slate-500 mt-2">{'═'.repeat(50)}</p>
        </div>
      )}
    </div>
  );
}

// ── Job Card ──

function JobCard({ job, index, expanded, onToggle, onRetry }: {
  job: ImportJob; index: number; expanded: boolean; onToggle: () => void; onRetry: () => void;
}) {
  const cfg = {
    pending: { icon: Clock, color: 'text-slate-400', bg: 'bg-slate-500/10', label: 'Pendente' },
    processing: { icon: Loader2, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Processando' },
    completed: { icon: CheckCircle2, color: 'text-neon-green', bg: 'bg-neon-green/10', label: 'Concluído' },
    failed: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Falhou' },
  }[job.status];
  const Icon = cfg.icon;

  return (
    <div className="rounded-lg border border-slate-700/30 bg-slate-800/30 transition-all hover:bg-slate-800/60">
      <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={onToggle}>
        <span className="w-8 text-right text-[10px] font-mono text-slate-600">{String(index + 1).padStart(3, '0')}</span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${cfg.bg} flex-shrink-0`}>
          <Icon className={`h-4 w-4 ${cfg.color} ${job.status === 'processing' ? 'animate-spin' : ''}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-xs font-medium text-white">{job.video.title}</p>
          <p className="text-[10px] text-slate-500">@{job.video.ownerUsername} · {formatNumber(job.video.views)} views</p>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
        {job.retryCount > 0 && <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-400">{job.retryCount}/{job.maxRetries}</span>}
        {job.status === 'failed' && (
          <button onClick={(e) => { e.stopPropagation(); onRetry(); }} className="flex items-center gap-1 rounded bg-neon-green/15 px-2 py-1 text-[10px] font-medium text-neon-green hover:bg-neon-green/25">
            <RefreshCw className="h-2.5 w-2.5" /> Retry
          </button>
        )}
        <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </div>
      {job.status === 'processing' && (
        <div className="mx-3 mb-2">
          <div className="h-1 w-full overflow-hidden rounded-full bg-slate-700">
            <div className="h-full rounded-full bg-gradient-to-r from-purple-electric to-neon-green transition-all duration-300" style={{ width: `${job.progress}%` }} />
          </div>
          <p className="mt-0.5 text-right text-[10px] text-slate-500">{job.progress}%</p>
        </div>
      )}
      {expanded && job.logs.length > 0 && (
        <div className="border-t border-slate-700/30 bg-slate-900/50 p-3 animate-slide-in">
          <h4 className="mb-2 text-[10px] font-medium text-slate-500 uppercase">Logs</h4>
          <div className="space-y-1">
            {job.logs.map((log, i) => (
              <div key={i} className="flex items-start gap-2 text-[10px]">
                <span className="text-slate-600 flex-shrink-0 font-mono">{new Date(log.timestamp).toLocaleTimeString('pt-BR')}</span>
                <span className={log.level === 'error' ? 'text-red-400' : log.level === 'warn' ? 'text-amber-400' : log.level === 'success' ? 'text-neon-green' : 'text-slate-400'}>{log.message}</span>
              </div>
            ))}
          </div>
          {job.errorMessage && <div className="mt-2 rounded bg-red-500/10 p-2 text-[10px] text-red-400 font-mono">{job.errorMessage}</div>}
        </div>
      )}
    </div>
  );
}
