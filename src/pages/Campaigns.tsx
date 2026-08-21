import { useState } from 'react';
import { Plus, Megaphone, Calendar, TrendingUp, MoreHorizontal, Pause, Play, Trash2, Edit3, ChevronRight } from 'lucide-react';
import { mockCampaigns, mockVideos } from '../data/mockData';
import { getStatusBg, getStatusLabel } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function Campaigns() {
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);

  const campaignDetails = mockCampaigns.map(c => ({
    ...c,
    videos: mockVideos.filter(v => v.campaignId === c.id),
    statusBreakdown: {
      ready: mockVideos.filter(v => v.campaignId === c.id && v.status === 'ready').length,
      processing: mockVideos.filter(v => v.campaignId === c.id && v.status === 'processing').length,
      published: mockVideos.filter(v => v.campaignId === c.id && v.status === 'published').length,
      error: mockVideos.filter(v => v.campaignId === c.id && v.status === 'error').length,
    },
  }));

  const expanded = selectedCampaign ? campaignDetails.find(c => c.id === selectedCampaign) : null;

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Campanhas</h1>
          <p className="text-sm text-slate-400">Organize e gerencie suas campanhas de conteúdo</p>
        </div>
        <button
          onClick={() => toast.success('Modal de nova campanha aberto')}
          className="flex items-center gap-2 rounded-lg bg-purple-electric px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-purple-dark"
        >
          <Plus className="h-4 w-4" />
          Nova Campanha
        </button>
      </div>

      {/* Campaign Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {campaignDetails.map((campaign) => (
          <div
            key={campaign.id}
            className={`rounded-xl border transition-all duration-200 cursor-pointer ${
              selectedCampaign === campaign.id
                ? 'border-purple-electric/50 bg-purple-electric/5 ring-1 ring-purple-electric/20'
                : 'border-slate-700/50 bg-slate-800/50 hover:border-slate-600'
            }`}
            onClick={() => setSelectedCampaign(selectedCampaign === campaign.id ? null : campaign.id)}
          >
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-electric/20 to-purple-electric/5">
                    <Megaphone className="h-5 w-5 text-purple-electric" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{campaign.name}</h3>
                    <p className="text-xs text-slate-500">{campaign.description}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusBg(campaign.status)}`}>
                  {getStatusLabel(campaign.status)}
                </span>
              </div>

              {/* Platform badges */}
              <div className="mt-3 flex items-center gap-2">
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                  campaign.platform === 'tiktok' || campaign.platform === 'both'
                    ? 'border-pink-500/30 bg-pink-500/20 text-pink-400'
                    : 'border-slate-600 bg-slate-700/50 text-slate-500'
                }`}>
                  ♪ TikTok
                </span>
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                  campaign.platform === 'instagram' || campaign.platform === 'both'
                    ? 'border-purple-500/30 bg-purple-500/20 text-purple-light'
                    : 'border-slate-600 bg-slate-700/50 text-slate-500'
                }`}>
                  ◎ Instagram
                </span>
              </div>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-4 gap-2">
                <div className="rounded-lg bg-slate-900/50 p-2 text-center">
                  <p className="text-lg font-bold text-white">{campaign.videoCount}</p>
                  <p className="text-[10px] text-slate-500">Total</p>
                </div>
                <div className="rounded-lg bg-neon-green/10 p-2 text-center">
                  <p className="text-lg font-bold text-neon-green">{campaign.publishedCount}</p>
                  <p className="text-[10px] text-slate-500">Publicados</p>
                </div>
                <div className="rounded-lg bg-purple-electric/10 p-2 text-center">
                  <p className="text-lg font-bold text-purple-electric">{campaign.scheduledCount}</p>
                  <p className="text-[10px] text-slate-500">Agendados</p>
                </div>
                <div className="rounded-lg bg-slate-700/30 p-2 text-center">
                  <p className="text-lg font-bold text-amber-400">{campaign.statusBreakdown.processing}</p>
                  <p className="text-[10px] text-slate-500">Proc.</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-700">
                <div className="flex h-full">
                  <div className="bg-neon-green transition-all" style={{ width: `${(campaign.publishedCount / campaign.videoCount) * 100}%` }} />
                  <div className="bg-purple-electric transition-all" style={{ width: `${(campaign.scheduledCount / campaign.videoCount) * 100}%` }} />
                  <div className="bg-amber-400 transition-all" style={{ width: `${(campaign.statusBreakdown.processing / campaign.videoCount) * 100}%` }} />
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); toast.success(`Distribuindo vídeos no calendário para "${campaign.name}"`); }}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-700 py-2 text-xs text-slate-400 transition-colors hover:border-purple-electric/50 hover:text-purple-electric"
                >
                  <Calendar className="h-3 w-3" />
                  Distribuir no Calendário
                </button>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="rounded-lg border border-slate-700 p-2 text-slate-500 transition-colors hover:bg-slate-700 hover:text-white"
                >
                  {campaign.status === 'active' ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="rounded-lg border border-slate-700 p-2 text-slate-500 transition-colors hover:bg-slate-700 hover:text-white"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Expanded: Video list */}
            {selectedCampaign === campaign.id && (
              <div className="border-t border-slate-700/30 bg-slate-900/30 p-4 animate-slide-in">
                <h4 className="mb-2 text-xs font-medium text-slate-500">Vídeos nesta Campanha</h4>
                <div className="space-y-2">
                  {campaign.videos.map((video) => (
                    <div key={video.id} className="flex items-center gap-3 rounded-lg bg-slate-800/50 px-3 py-2">
                      <span className="text-xs font-mono text-slate-600">{video.id}</span>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-xs text-white">{video.title}</p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusBg(video.status)}`}>
                        {getStatusLabel(video.status)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
