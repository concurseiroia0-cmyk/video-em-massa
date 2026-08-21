import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Search, Download, CheckSquare, Square, Eye, Heart,
  Clock, ArrowLeft, Play, X, Pause, RotateCcw, RefreshCw,
  AlertTriangle, CheckCircle2, Loader2,
  ShieldCheck, ShieldAlert, Terminal, ExternalLink, Link2,
  Globe
} from 'lucide-react';
import { createProvider } from '../providers';
import type { Platform, VideoMetadata, ProfileInfo, SortOption, ProfileResolutionResult, ResolutionDebug } from '../providers/types';
import { ImportQueueManager } from '../queue/manager';
import type { ImportJob, ImportQueueState } from '../queue/types';
import { formatNumber, formatDuration, getSourceBg } from '../utils/helpers';
import { parseProfileUrl } from '../utils/urlParser';
import toast from 'react-hot-toast';

type PageStep = 'search' | 'resolving' | 'results' | 'importing';

export default function ImportProfile() {
  const [profileUrl, setProfileUrl] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [sortBy, setSortBy] = useState<SortOption>('views');
  const [searching, setSearching] = useState(false);
  const [step, setStep] = useState<PageStep>('search');
  const [resolution, setResolution] = useState<ProfileResolutionResult | null>(null);
  const [resolvedProfile, setResolvedProfile] = useState<ProfileInfo | null>(null);
  const [debug, setDebug] = useState<ResolutionDebug | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [videos, setVideos] = useState<VideoMetadata[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [queueState, setQueueState] = useState<ImportQueueState | null>(null);
  const queueRef = useRef<ImportQueueManager | null>(null);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [embedVideo, setEmbedVideo] = useState<VideoMetadata | null>(null);
  const [expandedUrl, setExpandedUrl] = useState<string | null>(null);
  const [detectedPlatform, setDetectedPlatform] = useState<Platform | null>(null);

  useEffect(() => () => { queueRef.current?.stop(); }, []);

  // Auto-detect platform from URL
  useEffect(() => {
    if (profileUrl.trim()) {
      const parsed = parseProfileUrl(profileUrl);
      setDetectedPlatform(parsed.platform);
    } else {
      setDetectedPlatform(null);
    }
  }, [profileUrl]);

  // ── Search + Resolve ──
  const handleSearch = useCallback(async () => {
    if (!profileUrl.trim()) { toast.error('Cole a URL do perfil'); return; }

    // Step 1: Parse and validate URL
    const parsed = parseProfileUrl(profileUrl);
    if (!parsed.valid) {
      toast.error(parsed.error || 'URL inválida');
      return;
    }

    const platform = parsed.platform!;
    const username = parsed.username!;

    setSearching(true);
    setStep('resolving');
    setResolution(null);
    setResolvedProfile(null);
    setDebug(null);

    try {
      // Step 2: Resolve exact profile
      const provider = createProvider(platform);
      const result = await provider.resolveProfile(username);
      setResolution(result);
      setDebug(result.debug);

      if (!result.success) {
        toast.error(result.error);
        setStep('search');
        return;
      }

      // Step 3: Validate resolved profile matches URL
      if (result.profile.username.toLowerCase() !== username.toLowerCase()) {
        toast.error('Perfil resolvido não corresponde à URL fornecida.');
        setStep('search');
        return;
      }

      setResolvedProfile(result.profile);

      // Step 4: Fetch videos with ownership validation
      const videoResult = await provider.getVideos(
        { profileUrl: parsed.normalizedUrl!, username: result.profile.username, platform, quantity, sortBy },
        result.profile
      );

      setDebug(videoResult.debug);
      setVideos(videoResult.items);
      setSelected(new Set(videoResult.items.map((v) => v.id)));
      setStep('results');

      toast.success(`${videoResult.items.length} vídeos de @${result.profile.username}`);
    } catch {
      toast.error('Erro ao buscar perfil. Tente novamente.');
      setStep('search');
    } finally {
      setSearching(false);
    }
  }, [profileUrl, quantity, sortBy]);

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }, []);

  const selectTop = useCallback((n: number) => {
    setSelected(new Set(videos.slice(0, Math.min(n, videos.length)).map((v) => v.id)));
  }, [videos]);

  const clearSelection = useCallback(() => setSelected(new Set()), []);

  const startImport = useCallback(() => {
    const sel = videos.filter((v) => selected.has(v.id));
    if (sel.length === 0) { toast.error('Selecione pelo menos 1 vídeo'); return; }
    if (!resolvedProfile) { toast.error('Perfil não resolvido'); return; }
    const provider = createProvider(resolvedProfile.platform);
    const manager = new ImportQueueManager(provider, sel, {
      onQueueUpdate: (state) => { setQueueState({ ...state }); if (state.completedJobs === state.totalJobs && state.totalJobs > 0) toast.success(`Todos os ${state.totalJobs} vídeos importados!`); },
    }, { maxConcurrent: 3 });
    manager.setSource(resolvedProfile.username, sortBy);
    queueRef.current = manager;
    setStep('importing');
    manager.start();
  }, [videos, selected, resolvedProfile, sortBy]);

  const togglePause = useCallback(() => {
    if (!queueRef.current) return;
    const s = queueRef.current.getState();
    if (s.isPaused) { queueRef.current.start(); toast('Fila retomada'); } else { queueRef.current.pause(); toast('Fila pausada'); }
  }, []);

  const retryAllFailed = useCallback(() => { queueRef.current?.retryAllFailed(); toast.success('Retryando erros'); }, []);
  const retryJob = useCallback((jobId: string) => { queueRef.current?.retryJob(jobId); }, []);

  const goBack = useCallback(() => {
    if (step === 'importing') setStep('results');
    else { setStep('search'); setResolvedProfile(null); setVideos([]); setSelected(new Set()); setResolution(null); setDebug(null); }
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
          {step !== 'search' && (
            <button onClick={goBack} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">Importar Perfil</h1>
            <p className="text-sm text-slate-400">
              {step === 'search' && 'Cole a URL do perfil para encontrar vídeos públicos'}
              {step === 'resolving' && 'Coletando vídeos do perfil...'}
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

      {/* ═══════ SEARCH ═══════ */}
      {step === 'search' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6">
            {/* URL Input — Full width */}
            <div className="mb-4">
              <label className="mb-2 block text-xs font-medium text-slate-400">URL do Perfil</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="url"
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                  placeholder="https://www.instagram.com/flamengo/ ou https://www.tiktok.com/@flamengo"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/50 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-purple-electric/50 font-mono"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                {detectedPlatform && (
                  <span className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-2 py-0.5 text-[10px] font-medium ${getSourceBg(detectedPlatform)}`}>
                    {detectedPlatform === 'tiktok' ? '♪ TikTok' : '◎ Instagram'}
                  </span>
                )}
              </div>
            </div>

            {/* Options row */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">Quantidade</label>
                <div className="flex gap-1.5">
                  {[10, 25, 50, 100].map((q) => (
                    <button key={q} onClick={() => setQuantity(q)} className={`flex-1 rounded-lg border px-2 py-2.5 text-xs font-medium transition-all ${quantity === q ? 'border-purple-electric/50 bg-purple-electric/15 text-purple-electric' : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'}`}>{q}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">Ordenar por</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-purple-electric/50">
                  <option value="views">Mais Visualizados</option>
                  <option value="likes">Mais Curtidos</option>
                  <option value="recent">Mais Recentes</option>
                </select>
              </div>
              <div className="flex items-end">
                <button onClick={handleSearch} disabled={searching || !profileUrl.trim()} className="w-full flex items-center justify-center gap-2 rounded-lg bg-purple-electric px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-purple-dark disabled:opacity-40 disabled:cursor-not-allowed">
                  {searching ? (<><Loader2 className="h-4 w-4 animate-spin" /> Buscando...</>) : (<><Search className="h-4 w-4" /> Encontrar Vídeos</>)}
                </button>
              </div>
            </div>
          </div>

          {/* URL Examples */}
          <div className="rounded-xl border border-slate-700/30 bg-slate-800/30 p-4">
            <h3 className="text-xs font-medium text-white mb-2">Formatos aceitos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="rounded-lg bg-slate-900/50 p-2">
                <span className="text-[10px] text-purple-light font-medium">Instagram</span>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">https://www.instagram.com/perfil/</p>
              </div>
              <div className="rounded-lg bg-slate-900/50 p-2">
                <span className="text-[10px] text-pink-400 font-medium">TikTok</span>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">https://www.tiktok.com/@perfil</p>
              </div>
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
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════ RESOLVING ═══════ */}
      {step === 'resolving' && (
        <div className="flex flex-col items-center justify-center py-20 animate-slide-in">
          <Loader2 className="h-12 w-12 text-purple-electric animate-spin mb-4" />
          <h3 className="text-lg font-semibold text-white">Coletando vídeos...</h3>
          <p className="mt-2 text-sm text-slate-400">Buscando conteúdo público do perfil</p>
        </div>
      )}

      {/* ═══════ RESULTS ═══════ */}
      {step === 'results' && resolvedProfile && debug && (
        <div className="space-y-4 animate-slide-in">
          {/* Profile Card */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4">
            <div className="flex items-center gap-4">
              <img src={resolvedProfile.avatarUrl} alt={resolvedProfile.username} className="h-14 w-14 rounded-full border-2 border-slate-700 object-cover" />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-semibold text-white">{resolvedProfile.displayName}</h3>
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${getSourceBg(resolvedProfile.platform)}`}>
                    {resolvedProfile.platform === 'tiktok' ? '♪ TikTok' : '◎ Instagram'}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-neon-green/15 px-2 py-0.5 text-[10px] font-medium text-neon-green">
                    <ShieldCheck className="h-3 w-3" /> Verificado
                  </span>
                </div>
                <p className="text-xs text-slate-500">@{resolvedProfile.username} · {formatNumber(resolvedProfile.followers)} seguidores</p>
                <a href={resolvedProfile.profileUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-purple-electric hover:text-purple-light font-mono">{resolvedProfile.profileUrl}</a>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{videos.length}</p>
                <p className="text-[10px] text-slate-500">vídeos</p>
              </div>
            </div>
          </div>

          {/* Selection Controls */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-white">{selected.size} selecionados</span>
                <span className="text-xs text-slate-500">de {videos.length}</span>
                <div className="h-4 w-px bg-slate-700" />
                <button onClick={() => selectTop(10)} className="rounded-md bg-slate-700/50 px-2.5 py-1 text-[10px] text-slate-300 hover:bg-slate-700 transition-colors">TOP 10</button>
                <button onClick={() => selectTop(50)} className="rounded-md bg-slate-700/50 px-2.5 py-1 text-[10px] text-slate-300 hover:bg-slate-700 transition-colors">TOP 50</button>
                <button onClick={() => selectTop(100)} className="rounded-md bg-slate-700/50 px-2.5 py-1 text-[10px] text-slate-300 hover:bg-slate-700 transition-colors">TOP 100</button>
                <button onClick={() => setSelected(new Set(videos.map((v) => v.id)))} className="rounded-md bg-slate-700/50 px-2.5 py-1 text-[10px] text-slate-300 hover:bg-slate-700 transition-colors">Todos</button>
                <button onClick={clearSelection} className="rounded-md bg-red-500/10 px-2.5 py-1 text-[10px] text-red-400 hover:bg-red-500/20 transition-colors">Limpar</button>
              </div>
              <button onClick={startImport} disabled={selected.size === 0}
                className="flex items-center gap-2 rounded-lg bg-neon-green px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-neon-green-dark disabled:opacity-30">
                <Download className="h-4 w-4" /> Importar ({selected.size})
              </button>
            </div>
          </div>

          {/* Video List */}
          <div className="space-y-3">
            {videos.map((video, idx) => (
              <VideoCard
                key={video.id}
                video={video}
                index={idx}
                isSelected={selected.has(video.id)}
                onToggle={() => toggleSelect(video.id)}
                onPreview={() => setEmbedVideo(video)}
                onToggleUrl={() => setExpandedUrl(expandedUrl === video.id ? null : video.id)}
                showUrl={expandedUrl === video.id}
              />
            ))}
          </div>

          {/* Debug */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4">
            <button onClick={() => setShowDebug(!showDebug)} className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-white transition-colors">
              <Terminal className="h-3 w-3" /> {showDebug ? 'Ocultar' : 'Mostrar'} Debug Logs
            </button>
            {showDebug && <DebugPanel debug={debug} />}
          </div>
        </div>
      )}

      {/* ═══════ IMPORTING ═══════ */}
      {step === 'importing' && queueState && (
        <div className="space-y-4 animate-slide-in">
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Progresso</h3>
              <div className="flex items-center gap-2">
                <button onClick={togglePause} className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-800 hover:text-white">
                  {queueState.isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />} {queueState.isPaused ? 'Retomar' : 'Pausar'}
                </button>
                <button onClick={retryAllFailed} className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-800 hover:text-white">
                  <RotateCcw className="h-3 w-3" /> Retry
                </button>
                <button onClick={resetSearch} className="rounded-lg bg-purple-electric/15 px-3 py-1.5 text-xs font-medium text-purple-electric hover:bg-purple-electric/25">Nova Busca</button>
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
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[{ l: 'Na fila', v: queueState.totalJobs - queueState.completedJobs - queueState.failedJobs - queueState.processingCount, c: 'text-slate-400', bg: 'bg-slate-900/50' },
                { l: 'Processando', v: queueState.processingCount, c: 'text-amber-400', bg: 'bg-amber-500/10' },
                { l: 'Concluídos', v: queueState.completedJobs, c: 'text-neon-green', bg: 'bg-neon-green/10' },
                { l: 'Erros', v: queueState.failedJobs, c: 'text-red-400', bg: 'bg-red-500/10' }
              ].map((s) => (
                <div key={s.l} className={`rounded-lg ${s.bg} p-3 text-center`}>
                  <p className={`text-lg font-bold ${s.c}`}>{s.v}</p>
                  <p className="text-[10px] text-slate-500">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5">
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {queueState.jobs.map((job, i) => (
                <div key={job.id} className="flex items-center gap-3 rounded-lg border border-slate-700/30 bg-slate-800/30 p-3 cursor-pointer hover:bg-slate-800/60"
                  onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}>
                  <span className="w-8 text-right text-[10px] font-mono text-slate-600">{String(i + 1).padStart(3, '0')}</span>
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg flex-shrink-0 ${job.status === 'completed' ? 'bg-neon-green/10' : job.status === 'failed' ? 'bg-red-500/10' : job.status === 'processing' ? 'bg-amber-500/10' : 'bg-slate-700/30'}`}>
                    {job.status === 'completed' ? <CheckCircle2 className="h-3.5 w-3.5 text-neon-green" /> :
                     job.status === 'failed' ? <AlertTriangle className="h-3.5 w-3.5 text-red-400" /> :
                     job.status === 'processing' ? <Loader2 className="h-3.5 w-3.5 text-amber-400 animate-spin" /> :
                     <Clock className="h-3.5 w-3.5 text-slate-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs text-white">{job.video.title}</p>
                    {job.status === 'processing' && <div className="mt-1 h-1 rounded-full bg-slate-700"><div className="h-full rounded-full bg-gradient-to-r from-purple-electric to-neon-green transition-all" style={{ width: `${job.progress}%` }} /></div>}
                  </div>
                  {job.status === 'failed' && <button onClick={(e) => { e.stopPropagation(); retryJob(job.id); }} className="rounded bg-neon-green/15 px-2 py-0.5 text-[10px] text-neon-green hover:bg-neon-green/25"><RefreshCw className="inline h-2.5 w-2.5" /> Retry</button>}
                  {job.status === 'completed' && <CheckCircle2 className="h-4 w-4 text-neon-green flex-shrink-0" />}
                  {expandedJob === job.id && job.logs.length > 0 && (
                    <div className="col-span-full mt-2 border-t border-slate-700/30 pt-2">
                      {job.logs.slice(-5).map((log, li) => (
                        <p key={li} className={`text-[9px] font-mono ${log.level === 'error' ? 'text-red-400' : log.level === 'success' ? 'text-neon-green' : 'text-slate-500'}`}>{log.message}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════ EMBED MODAL ═══════ */}
      {embedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setEmbedVideo(null)}>
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setEmbedVideo(null)} className="absolute top-3 right-3 z-10 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"><X className="h-5 w-5" /></button>
            {embedVideo.embedUrl ? (
              <div className="aspect-[9/16] bg-black">
                <iframe src={embedVideo.embedUrl} className="h-full w-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={embedVideo.title} />
              </div>
            ) : (
              <div className="aspect-[9/16] bg-slate-900 flex items-center justify-center">
                <img src={embedVideo.thumbnailUrl} alt={embedVideo.title} className="h-full w-full object-cover opacity-50" />
              </div>
            )}
            <div className="p-4">
              <p className="text-sm font-medium text-white">{embedVideo.title}</p>
              <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
                {embedVideo.views != null && <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{formatNumber(embedVideo.views)}</span>}
                {embedVideo.likes != null && <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{formatNumber(embedVideo.likes)}</span>}
                {embedVideo.duration != null && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDuration(embedVideo.duration)}</span>}
              </div>
              <a href={embedVideo.permalink} target="_blank" rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-purple-electric/15 py-2 text-xs font-medium text-purple-electric hover:bg-purple-electric/25 transition-colors">
                <ExternalLink className="h-3 w-3" /> Ver vídeo original no {embedVideo.platform === 'tiktok' ? 'TikTok' : 'Instagram'}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// Video Card Component
// ════════════════════════════════════════════════════════════════

function VideoCard({ video, index, isSelected, onToggle, onPreview, onToggleUrl, showUrl }: {
  video: VideoMetadata; index: number; isSelected: boolean;
  onToggle: () => void; onPreview: () => void;
  onToggleUrl: () => void; showUrl: boolean;
}) {
  return (
    <div className={`rounded-xl border overflow-hidden transition-all duration-150 ${isSelected ? 'border-purple-electric/50 bg-purple-electric/5 ring-1 ring-purple-electric/20' : 'border-slate-700/50 bg-slate-800/50 hover:border-slate-600'}`}>
      <div className="flex gap-4 p-4">
        {/* Rank + Checkbox */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <span className="text-lg font-bold text-slate-600">#{index + 1}</span>
          <button onClick={onToggle} className="transition-colors">
            {isSelected ? <CheckSquare className="h-5 w-5 text-purple-electric" /> : <Square className="h-5 w-5 text-slate-600 hover:text-slate-400" />}
          </button>
        </div>

        {/* Thumbnail */}
        <div className="relative h-40 w-24 flex-shrink-0 rounded-lg overflow-hidden bg-slate-900 cursor-pointer" onClick={onPreview}>
          <img src={video.thumbnailUrl} alt={video.title} className="h-full w-full object-cover" loading="lazy" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
            <Play className="h-8 w-8 text-white ml-0.5" />
          </div>
          {video.duration != null && (
            <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[9px] text-white font-medium">
              {formatDuration(video.duration)}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{video.title}</p>
              <p className="mt-0.5 text-xs text-slate-500">@{video.ownerUsername}</p>
            </div>
            {video.ownershipValidated && (
              <span className="flex-shrink-0 rounded bg-neon-green/15 px-1.5 py-0.5 text-[8px] font-bold text-neon-green">✓ VERIFICADO</span>
            )}
          </div>

          {/* Metrics */}
          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            {video.views != null && <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{formatNumber(video.views)} views</span>}
            {video.likes != null && <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{formatNumber(video.likes)} likes</span>}
            {video.comments != null && <span className="flex items-center gap-1">{formatNumber(video.comments)} 💬</span>}
            {video.publishedAt && <span className="text-slate-500">{new Date(video.publishedAt).toLocaleDateString('pt-BR')}</span>}
          </div>

          {/* Description */}
          {video.description && (
            <p className="mt-1.5 text-[11px] text-slate-500 line-clamp-2">{video.description}</p>
          )}

          {/* Actions */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {video.embedUrl && (
              <button onClick={onPreview}
                className="flex items-center gap-1.5 rounded-lg bg-purple-electric/15 px-3 py-1.5 text-[11px] font-medium text-purple-electric hover:bg-purple-electric/25 transition-colors">
                <Play className="h-3 w-3" /> Visualizar
              </button>
            )}
            <a href={video.permalink} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg bg-slate-700/50 px-3 py-1.5 text-[11px] font-medium text-slate-300 hover:bg-slate-700 transition-colors">
              <ExternalLink className="h-3 w-3" /> Ver vídeo original
            </a>
            <button onClick={onToggleUrl}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] text-slate-500 hover:text-slate-300 transition-colors">
              <Link2 className="h-3 w-3" /> {showUrl ? 'Ocultar URL' : 'URL'}
            </button>
          </div>

          {/* URL Display */}
          {showUrl && (
            <div className="mt-2 rounded-lg bg-slate-900/80 p-2 animate-slide-in">
              <p className="text-[10px] text-slate-500 mb-1">URL Original:</p>
              <a href={video.permalink} target="_blank" rel="noopener noreferrer"
                className="block break-all text-[11px] text-purple-electric hover:text-purple-light font-mono">
                {video.permalink}
              </a>
              {video.embedUrl && (
                <>
                  <p className="text-[10px] text-slate-500 mt-2 mb-1">Embed URL:</p>
                  <p className="break-all text-[10px] text-slate-500 font-mono">{video.embedUrl}</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// Debug Panel
// ════════════════════════════════════════════════════════════════

function DebugPanel({ debug }: { debug: ResolutionDebug }) {
  return (
    <div className="mt-3 rounded-lg bg-slate-950 p-3 font-mono text-[10px] leading-relaxed">
      <p className="text-purple-electric font-bold mb-1">DEBUG — Profile Resolution</p>
      <p className="text-slate-400">Requested: <span className="text-white">{debug.requestedUsername}</span></p>
      <p className="text-slate-400">Normalized: <span className="text-white">{debug.normalizedUsername}</span></p>
      <p className="text-slate-400">Profile: <span className={debug.resolvedProfile ? 'text-neon-green' : 'text-red-400'}>{debug.resolvedProfile ? `@${debug.resolvedProfile.username} (${debug.resolvedProfile.id})` : 'FAILED'}</span></p>
      <p className="text-slate-400">Fetched: {debug.totalFetched} | Passed: <span className="text-neon-green">{debug.ownershipPassed}</span> | Rejected: <span className={debug.ownershipRejected > 0 ? 'text-red-400' : 'text-neon-green'}>{debug.ownershipRejected}</span></p>
      <p className="text-slate-400">Source: <span className="text-white">{debug.dataSource}</span>{debug.elapsed ? ` (${debug.elapsed}ms)` : ''}</p>
      {debug.steps.length > 0 && (
        <div className="mt-2 border-t border-slate-800 pt-2">
          {debug.steps.map((s, i) => (
            <p key={i} className={`pl-1 ${s.includes('FAILED') || s.includes('REJECTED') ? 'text-red-400' : s.includes('PASSED') ? 'text-neon-green' : 'text-slate-500'}`}>{s}</p>
          ))}
        </div>
      )}
    </div>
  );
}
