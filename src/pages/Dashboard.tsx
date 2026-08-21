import { stats, mockVideos, mockCampaigns } from '../data/mockData';
import { formatNumber } from '../utils/helpers';
import {
  Video, CheckCircle2, Megaphone, TrendingUp, ArrowUpRight,
  Clock, AlertTriangle, Zap
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function Dashboard() {
  const statCards = [
    { label: 'Vídeos na Fila', value: stats.videosInQueue, icon: Video, color: 'text-purple-electric', bg: 'bg-purple-electric/10', change: '+23 hoje' },
    { label: 'Publicados Hoje', value: stats.publishedToday, icon: CheckCircle2, color: 'text-neon-green', bg: 'bg-neon-green/10', change: '+5 na última hora' },
    { label: 'Campanhas Ativas', value: stats.activeCampaigns, icon: Megaphone, color: 'text-amber-400', bg: 'bg-amber-400/10', change: '3 em processamento' },
    { label: 'Taxa de Sucesso', value: `${stats.successRate}%`, icon: TrendingUp, color: 'text-neon-green', bg: 'bg-neon-green/10', change: '↑ 1.2% vs semana anterior' },
  ];

  const recentActivity = mockVideos.slice(0, 8);
  const activeCampaigns = mockCampaigns.filter(c => c.status === 'active').slice(0, 4);

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-slate-400">Visão geral da sua operação de conteúdo em massa</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="group rounded-xl border border-slate-700/50 bg-slate-800/50 p-5 transition-all duration-200 hover:border-slate-600 hover:bg-slate-800"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">{card.label}</p>
                  <p className="mt-2 text-3xl font-bold text-white">{card.value}</p>
                  <p className="mt-1 text-xs text-slate-500">{card.change}</p>
                </div>
                <div className={`rounded-lg ${card.bg} p-2.5`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Weekly Volume Chart */}
        <div className="col-span-2 rounded-xl border border-slate-700/50 bg-slate-800/50 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Volume Semanal</h3>
            <span className="text-xs text-slate-500">Últimos 7 dias</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.weeklyVolume} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                  cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Active Campaigns */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">Campanhas Ativas</h3>
          <div className="space-y-3">
            {activeCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="rounded-lg border border-slate-700/30 bg-slate-800/30 p-3 transition-colors hover:bg-slate-800"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{campaign.name}</p>
                    <p className="text-xs text-slate-500">{campaign.videoCount} vídeos</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    campaign.status === 'active' ? 'bg-neon-green/20 text-neon-green' : 'bg-amber-400/20 text-amber-400'
                  }`}>
                    {campaign.status === 'active' ? 'Ativa' : 'Pausada'}
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
                  <div
                    className="h-full rounded-full bg-purple-electric transition-all duration-500"
                    style={{ width: `${(campaign.publishedCount / campaign.videoCount) * 100}%` }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-slate-500">
                  <span>{campaign.publishedCount} publicados</span>
                  <span>{campaign.scheduledCount} agendados</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Atividade Recente</h3>
          <button className="text-xs text-purple-electric hover:text-purple-light transition-colors">
            Ver tudo →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="pb-3 text-left text-xs font-medium text-slate-500">Vídeo</th>
                <th className="pb-3 text-left text-xs font-medium text-slate-500">Fonte</th>
                <th className="pb-3 text-left text-xs font-medium text-slate-500">Views</th>
                <th className="pb-3 text-left text-xs font-medium text-slate-500">Status</th>
                <th className="pb-3 text-left text-xs font-medium text-slate-500">Campanha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {recentActivity.map((video) => {
                const campaign = mockCampaigns.find(c => c.id === video.campaignId);
                return (
                  <tr key={video.id} className="text-sm transition-colors hover:bg-slate-800/50">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700/50">
                          <Zap className="h-4 w-4 text-slate-500" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{video.title}</p>
                          <p className="text-xs text-slate-500">{video.profile}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                        video.source === 'tiktok'
                          ? 'border-pink-500/30 bg-pink-500/20 text-pink-400'
                          : 'border-purple-500/30 bg-purple-500/20 text-purple-light'
                      }`}>
                        {video.source === 'tiktok' ? '♪ TikTok' : '◎ Instagram'}
                      </span>
                    </td>
                    <td className="py-3 text-slate-300">{formatNumber(video.views)}</td>
                    <td className="py-3">
                      <StatusBadge status={video.status} />
                    </td>
                    <td className="py-3 text-slate-400 text-xs">
                      {campaign?.name || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    found: 'bg-slate-500/20 text-slate-400',
    downloading: 'bg-blue-500/20 text-blue-400',
    processing: 'bg-amber-500/20 text-amber-400',
    ready: 'bg-neon-green/20 text-neon-green',
    published: 'bg-neon-green/20 text-neon-green',
    error: 'bg-red-500/20 text-red-400',
  };
  const labels: Record<string, string> = {
    found: 'Encontrado',
    downloading: 'Baixando',
    processing: 'Processando',
    ready: 'Pronto',
    published: 'Publicado',
    error: 'Erro',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${styles[status] || ''}`}>
      {labels[status] || status}
    </span>
  );
}
