import { useState } from 'react';
import { ArrowRight, AlertCircle, RefreshCw, Pause, Play, Zap } from 'lucide-react';
import { mockVideos } from '../data/mockData';
import { getStatusLabel } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function Queue() {
  const [paused, setPaused] = useState(false);

  const statuses = [
    { key: 'found', label: 'Encontrados', icon: '🔍', color: 'from-slate-500 to-slate-600' },
    { key: 'downloading', label: 'Baixando', icon: '⬇️', color: 'from-blue-500 to-blue-600' },
    { key: 'processing', label: 'Processando', icon: '⚙️', color: 'from-amber-500 to-amber-600' },
    { key: 'ready', label: 'Prontos', icon: '✅', color: 'from-emerald-500 to-emerald-600' },
  ];

  const statusCounts = statuses.map(s => ({
    ...s,
    count: mockVideos.filter(v => v.status === s.key).length,
  }));

  const totalCount = mockVideos.length;

  // Simulate processing progress
  const [processed, setProcessed] = useState(65);
  const speed = '12.4 vídeos/min';
  const eta = '≈ 15 min restantes';

  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Fila de Importação</h1>
        <p className="text-sm text-slate-400">Acompanhe o processamento em massa dos seus vídeos</p>
      </div>

      {/* Pipeline Overview */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-electric/15">
            <Zap className="h-4 w-4 text-purple-electric" />
          </div>
          <h3 className="text-sm font-semibold text-white">Pipeline de Processamento</h3>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => { setPaused(!paused); toast(paused ? 'Fila retomada' : 'Fila pausada'); }}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 transition-colors hover:border-slate-600 hover:text-white"
            >
              {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
              {paused ? 'Retomar' : 'Pausar'}
            </button>
            <button
              onClick={() => toast.success('Fila reiniciada')}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 transition-colors hover:border-slate-600 hover:text-white"
            >
              <RefreshCw className="h-3 w-3" />
              Reiniciar Erros
            </button>
          </div>
        </div>

        {/* Pipeline Flow */}
        <div className="flex items-center gap-3">
          {statusCounts.map((status, i) => (
            <div key={status.key} className="flex flex-1 items-center gap-3">
              <div className={`flex-1 rounded-xl bg-gradient-to-r ${status.color} p-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">{status.count}</p>
                    <p className="text-xs text-white/70">{status.label}</p>
                  </div>
                  <span className="text-2xl">{status.icon}</span>
                </div>
                <div className="mt-2 h-1 rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-1000"
                    style={{ width: `${(status.count / totalCount) * 100}%` }}
                  />
                </div>
              </div>
              {i < statusCounts.length - 1 && (
                <ArrowRight className="h-5 w-5 flex-shrink-0 text-slate-600" />
              )}
            </div>
          ))}
        </div>

        {/* Progress Info */}
        <div className="mt-6 flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/50 p-4">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-slate-500">Progresso Geral</p>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-2 w-40 overflow-hidden rounded-full bg-slate-700">
                  <div className="h-full rounded-full bg-gradient-to-r from-purple-electric to-neon-green transition-all duration-500" style={{ width: `${processed}%` }} />
                </div>
                <span className="text-sm font-semibold text-white">{processed}%</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500">Velocidade</p>
              <p className="mt-1 text-sm font-medium text-neon-green">{speed}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Tempo Estimado</p>
              <p className="mt-1 text-sm font-medium text-amber-400">{eta}</p>
            </div>
          </div>
          {paused && (
            <span className="flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-400">
              <Pause className="h-3 w-3" /> Pausado
            </span>
          )}
        </div>
      </div>

      {/* Detailed List */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5">
        <h3 className="mb-4 text-sm font-semibold text-white">Itens na Fila</h3>
        <div className="space-y-2">
          {mockVideos.map((video, index) => (
            <div
              key={video.id}
              className="flex items-center gap-4 rounded-lg border border-slate-700/30 bg-slate-800/30 px-4 py-3 transition-colors hover:bg-slate-800"
            >
              <span className="w-8 text-right text-xs font-mono text-slate-600">
                {String(index + 1).padStart(3, '0')}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-700/50">
                <Zap className="h-3 w-3 text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-white">{video.title}</p>
                <p className="text-xs text-slate-500">{video.profile}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">{video.duration}s</span>
                <StatusPill status={video.status} />
                {video.status === 'processing' && (
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-700">
                    <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 pipeline-flow" style={{ width: '65%' }} />
                  </div>
                )}
                {video.status === 'downloading' && (
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-700">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: '40%' }} />
                  </div>
                )}
                {video.status === 'error' && video.errorMessage && (
                  <button className="rounded p-1 text-red-400 hover:bg-red-500/20" title={video.errorMessage}>
                    <AlertCircle className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    found: 'bg-slate-500/20 text-slate-400',
    downloading: 'bg-blue-500/20 text-blue-400',
    processing: 'bg-amber-500/20 text-amber-400',
    ready: 'bg-neon-green/20 text-neon-green',
    published: 'bg-neon-green/20 text-neon-green',
    error: 'bg-red-500/20 text-red-400',
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${styles[status] || ''}`}>
      {status === 'ready' && '✅'}
      {(status === 'processing' || status === 'downloading') && (
        <div className="h-2 w-2 animate-spin rounded-full border border-current border-t-transparent" />
      )}
      {status === 'found' && '⏳'}
      {status === 'error' && '❌'}
      {status === 'published' && '✅'}
      {getStatusLabel(status)}
    </span>
  );
}
