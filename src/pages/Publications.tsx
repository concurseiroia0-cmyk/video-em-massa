import { useState } from 'react';
import { Send, CheckCircle2, XCircle, Clock, RefreshCw, AlertTriangle, Eye, ChevronDown, Filter } from 'lucide-react';
import { mockVideos, mockCampaigns, mockAccounts } from '../data/mockData';
import { formatNumber, getStatusBg, getStatusLabel } from '../utils/helpers';
import toast from 'react-hot-toast';

interface Publication {
  id: string;
  videoId: string;
  accountId: string;
  campaignId: string;
  scheduledAt: string;
  status: 'scheduled' | 'publishing' | 'published' | 'failed';
  retryCount: number;
  maxRetries: number;
  errorLog?: string;
  publishedAt?: string;
}

const mockPublications: Publication[] = [
  { id: 'p1', videoId: '003', accountId: 'a2', campaignId: 'c2', scheduledAt: '2026-08-20 09:00', status: 'published', retryCount: 0, maxRetries: 3, publishedAt: '2026-08-20 09:00:12' },
  { id: 'p2', videoId: '001', accountId: 'a1', campaignId: 'c1', scheduledAt: '2026-08-20 09:00', status: 'published', retryCount: 1, maxRetries: 3, publishedAt: '2026-08-20 09:02:45', errorLog: 'Retry 1/3: Rate limit exceeded. Retrying in 60s...' },
  { id: 'p3', videoId: '008', accountId: 'a1', campaignId: 'c1', scheduledAt: '2026-08-20 12:00', status: 'published', retryCount: 0, maxRetries: 3, publishedAt: '2026-08-20 12:00:08' },
  { id: 'p4', videoId: '014', accountId: 'a2', campaignId: 'c3', scheduledAt: '2026-08-20 15:00', status: 'published', retryCount: 2, maxRetries: 3, publishedAt: '2026-08-20 15:05:30', errorLog: 'Retry 1/3: Upload timeout. Retrying...\nRetry 2/3: Server error 503. Retrying...' },
  { id: 'p5', videoId: '007', accountId: 'a4', campaignId: 'c2', scheduledAt: '2026-08-20 18:00', status: 'publishing', retryCount: 0, maxRetries: 3 },
  { id: 'p6', videoId: '010', accountId: 'a1', campaignId: 'c4', scheduledAt: '2026-08-20 21:00', status: 'scheduled', retryCount: 0, maxRetries: 3 },
  { id: 'p7', videoId: '004', accountId: 'a3', campaignId: 'c3', scheduledAt: '2026-08-20 12:00', status: 'failed', retryCount: 3, maxRetries: 3, errorLog: 'Retry 1/3: FFmpeg encoding failed: unsupported codec\nRetry 2/3: FFmpeg encoding failed: unsupported codec\nRetry 3/3: FFmpeg encoding failed: unsupported codec\n⚠️ Max retries reached. Manual review required.' },
  { id: 'p8', videoId: '018', accountId: 'a2', campaignId: 'c2', scheduledAt: '2026-08-20 15:00', status: 'failed', retryCount: 3, maxRetries: 3, errorLog: 'Retry 1/3: Download timeout\nRetry 2/3: Download timeout\nRetry 3/3: Download timeout\n⚠️ Max retries reached. Source video may be private.' },
  { id: 'p9', videoId: '016', accountId: 'a1', campaignId: 'c1', scheduledAt: '2026-08-21 09:00', status: 'scheduled', retryCount: 0, maxRetries: 3 },
  { id: 'p10', videoId: '002', accountId: 'a2', campaignId: 'c1', scheduledAt: '2026-08-21 12:00', status: 'scheduled', retryCount: 0, maxRetries: 3 },
  { id: 'p11', videoId: '013', accountId: 'a1', campaignId: 'c5', scheduledAt: '2026-08-21 15:00', status: 'scheduled', retryCount: 0, maxRetries: 3 },
  { id: 'p12', videoId: '009', accountId: 'a4', campaignId: 'c4', scheduledAt: '2026-08-21 18:00', status: 'scheduled', retryCount: 0, maxRetries: 3 },
];

export default function Publications() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const filtered = mockPublications.filter(p =>
    filterStatus === 'all' || p.status === filterStatus
  );

  const statusCounts = {
    published: mockPublications.filter(p => p.status === 'published').length,
    publishing: mockPublications.filter(p => p.status === 'publishing').length,
    scheduled: mockPublications.filter(p => p.status === 'scheduled').length,
    failed: mockPublications.filter(p => p.status === 'failed').length,
  };

  const statusConfig: Record<string, { icon: any; color: string; bg: string }> = {
    published: { icon: CheckCircle2, color: 'text-neon-green', bg: 'bg-neon-green/10' },
    publishing: { icon: Send, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    scheduled: { icon: Clock, color: 'text-purple-electric', bg: 'bg-purple-electric/10' },
    failed: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Publicações & Logs</h1>
        <p className="text-sm text-slate-400">Acompanhe o status de todas as publicações</p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Object.entries(statusCounts).map(([status, count]) => {
          const config = statusConfig[status];
          const Icon = config.icon;
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(filterStatus === status ? 'all' : status)}
              className={`rounded-xl border p-4 text-left transition-all ${
                filterStatus === status
                  ? `border-${status === 'published' ? 'neon-green' : status === 'publishing' ? 'amber-400' : status === 'scheduled' ? 'purple-electric' : 'red-400'}/50`
                  : 'border-slate-700/50 hover:border-slate-600'
              } bg-slate-800/50`}
            >
              <div className="flex items-center gap-3">
                <div className={`rounded-lg ${config.bg} p-2`}>
                  <Icon className={`h-5 w-5 ${config.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{count}</p>
                  <p className="text-xs text-slate-500 capitalize">{getStatusLabel(status)}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Publications Timeline */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Timeline de Publicações</h3>
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-xs text-slate-500">{filtered.length} itens</span>
          </div>
        </div>

        <div className="space-y-2">
          {filtered.map((pub) => {
            const video = mockVideos.find(v => v.id === pub.videoId);
            const campaign = mockCampaigns.find(c => c.id === pub.campaignId);
            const account = mockAccounts.find(a => a.id === pub.accountId);
            const config = statusConfig[pub.status];
            const Icon = config.icon;

            return (
              <div key={pub.id} className="rounded-lg border border-slate-700/30 bg-slate-800/30 transition-all hover:bg-slate-800/60">
                <div className="flex items-center gap-4 p-4">
                  {/* Status Icon */}
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${config.bg}`}>
                    <Icon className={`h-5 w-5 ${config.color}`} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white">{video?.title || `Vídeo #${pub.videoId}`}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusBg(pub.status)}`}>
                        {getStatusLabel(pub.status)}
                      </span>
                      {pub.retryCount > 0 && (
                        <span className="flex items-center gap-0.5 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                          <RefreshCw className="h-2.5 w-2.5" />
                          {pub.retryCount}/{pub.maxRetries} retries
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-[10px] text-slate-500">
                      <span>📁 {campaign?.name}</span>
                      <span>👤 {account?.username}</span>
                      <span>⏰ Agendado: {pub.scheduledAt}</span>
                      {pub.publishedAt && <span>✅ Publicado: {pub.publishedAt}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {pub.status === 'failed' && (
                      <button
                        onClick={() => toast.success('Retentando publicação...')}
                        className="flex items-center gap-1 rounded-lg bg-neon-green/15 px-3 py-1.5 text-[10px] font-medium text-neon-green hover:bg-neon-green/25 transition-colors"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Retry
                      </button>
                    )}
                    {pub.errorLog && (
                      <button
                        onClick={() => setExpandedLog(expandedLog === pub.id ? null : pub.id)}
                        className="flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-1.5 text-[10px] text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                      >
                        <AlertTriangle className="h-3 w-3" />
                        Log
                        <ChevronDown className={`h-3 w-3 transition-transform ${expandedLog === pub.id ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Error Log */}
                {expandedLog === pub.id && pub.errorLog && (
                  <div className="border-t border-slate-700/30 bg-slate-900/50 px-4 py-3 animate-slide-in">
                    <h4 className="mb-2 text-[10px] font-medium text-slate-500 uppercase">Log de Erros</h4>
                    <pre className="whitespace-pre-wrap rounded-lg bg-slate-950 p-3 text-xs font-mono text-red-400/80">
                      {pub.errorLog}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
