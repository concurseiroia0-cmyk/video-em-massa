import { useState } from 'react';
import { Grid, List, CheckSquare, Square, Trash2, Download, FolderInput, Edit3, Filter, Play, X, Eye, Heart, Clock, Zap } from 'lucide-react';
import { mockVideos, mockCampaigns } from '../data/mockData';
import { formatNumber, formatDuration, getSourceBg, getStatusBg, getStatusLabel } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function Library() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [filterCampaign, setFilterCampaign] = useState('all');
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  const filteredVideos = mockVideos.filter(v => {
    if (filterStatus !== 'all' && v.status !== filterStatus) return false;
    if (filterSource !== 'all' && v.source !== filterSource) return false;
    if (filterCampaign !== 'all' && v.campaignId !== filterCampaign) return false;
    return true;
  });

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === filteredVideos.length) setSelected(new Set());
    else setSelected(new Set(filteredVideos.map(v => v.id)));
  };

  const bulkAction = (action: string) => {
    toast.success(`${action}: ${selected.size} vídeos selecionados`);
    setSelected(new Set());
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Biblioteca</h1>
          <p className="text-sm text-slate-400">{filteredVideos.length} vídeos processados</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`rounded-lg p-2 transition-colors ${viewMode === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`rounded-lg p-2 transition-colors ${viewMode === 'list' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Filter className="h-4 w-4 text-slate-500" />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-xs text-white outline-none"
        >
          <option value="all">Todos os Status</option>
          <option value="ready">Pronto</option>
          <option value="processing">Processando</option>
          <option value="published">Publicado</option>
          <option value="error">Erro</option>
        </select>
        <select
          value={filterSource}
          onChange={(e) => setFilterSource(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-xs text-white outline-none"
        >
          <option value="all">Todas as Fontes</option>
          <option value="tiktok">TikTok</option>
          <option value="instagram">Instagram</option>
        </select>
        <select
          value={filterCampaign}
          onChange={(e) => setFilterCampaign(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-xs text-white outline-none"
        >
          <option value="all">Todas as Campanhas</option>
          {mockCampaigns.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Bulk Actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-purple-electric/30 bg-purple-electric/10 px-4 py-3 animate-slide-in">
          <span className="text-sm text-purple-electric font-medium">{selected.size} selecionados</span>
          <button onClick={toggleAll} className="text-xs text-slate-400 hover:text-white">
            {selected.size === filteredVideos.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => bulkAction('Mover para campanha')} className="flex items-center gap-1 rounded-lg bg-slate-700 px-3 py-1.5 text-xs text-white hover:bg-slate-600">
              <FolderInput className="h-3 w-3" /> Mover
            </button>
            <button onClick={() => bulkAction('Baixar')} className="flex items-center gap-1 rounded-lg bg-slate-700 px-3 py-1.5 text-xs text-white hover:bg-slate-600">
              <Download className="h-3 w-3" /> Baixar
            </button>
            <button onClick={() => bulkAction('Excluir')} className="flex items-center gap-1 rounded-lg bg-red-500/20 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/30">
              <Trash2 className="h-3 w-3" /> Excluir
            </button>
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredVideos.map((video) => {
            const campaign = mockCampaigns.find(c => c.id === video.campaignId);
            return (
              <div
                key={video.id}
                className={`group rounded-xl border transition-all duration-200 overflow-hidden ${
                  selected.has(video.id)
                    ? 'border-purple-electric/50 bg-purple-electric/5'
                    : 'border-slate-700/50 bg-slate-800/50 hover:border-slate-600'
                }`}
              >
                {/* Thumbnail */}
                <div className="relative aspect-[9/16] bg-slate-900 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                    <Zap className="h-12 w-12 text-slate-700" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <button
                      onClick={() => setPlayingVideo(video.id)}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
                    >
                      <Play className="h-6 w-6 text-white ml-0.5" />
                    </button>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSelect(video.id); }}
                    className="absolute top-2 left-2"
                  >
                    {selected.has(video.id) ? (
                      <CheckSquare className="h-5 w-5 text-purple-electric drop-shadow" />
                    ) : (
                      <Square className="h-5 w-5 text-white/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                  <span className={`absolute top-2 right-2 rounded-full border px-2 py-0.5 text-[10px] font-medium ${getSourceBg(video.source)}`}>
                    {video.source === 'tiktok' ? '♪' : '◎'}
                  </span>
                  <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
                    {formatDuration(video.duration)}
                  </span>
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="truncate text-sm font-medium text-white">{video.title}</p>
                  <p className="text-xs text-slate-500">{video.profile}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                      <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" />{formatNumber(video.views)}</span>
                      <span className="flex items-center gap-0.5"><Heart className="h-3 w-3" />{formatNumber(video.likes)}</span>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusBg(video.status)}`}>
                      {getStatusLabel(video.status)}
                    </span>
                  </div>
                  {campaign && (
                    <p className="mt-1 text-[10px] text-slate-600">📁 {campaign.name}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/50">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="w-10 p-3">
                    <button onClick={toggleAll}>
                      {selected.size === filteredVideos.length && filteredVideos.length > 0 ? (
                        <CheckSquare className="h-4 w-4 text-purple-electric" />
                      ) : (
                        <Square className="h-4 w-4 text-slate-600" />
                      )}
                    </button>
                  </th>
                  <th className="p-3 text-left text-xs font-medium text-slate-500">Vídeo</th>
                  <th className="p-3 text-left text-xs font-medium text-slate-500">Fonte</th>
                  <th className="p-3 text-left text-xs font-medium text-slate-500">Views</th>
                  <th className="p-3 text-left text-xs font-medium text-slate-500">Likes</th>
                  <th className="p-3 text-left text-xs font-medium text-slate-500">Duração</th>
                  <th className="p-3 text-left text-xs font-medium text-slate-500">Campanha</th>
                  <th className="p-3 text-left text-xs font-medium text-slate-500">Status</th>
                  <th className="p-3 w-20" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {filteredVideos.map((video) => {
                  const campaign = mockCampaigns.find(c => c.id === video.campaignId);
                  return (
                    <tr key={video.id} className="text-sm transition-colors hover:bg-slate-800/50">
                      <td className="p-3">
                        <button onClick={() => toggleSelect(video.id)}>
                          {selected.has(video.id) ? (
                            <CheckSquare className="h-4 w-4 text-purple-electric" />
                          ) : (
                            <Square className="h-4 w-4 text-slate-600" />
                          )}
                        </button>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-12 items-center justify-center rounded bg-slate-700/50">
                            <Zap className="h-3 w-3 text-slate-500" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{video.title}</p>
                            <p className="text-xs text-slate-500">{video.profile}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${getSourceBg(video.source)}`}>
                          {video.source === 'tiktok' ? '♪ TikTok' : '◎ Instagram'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">{formatNumber(video.views)}</td>
                      <td className="p-3 text-slate-300">{formatNumber(video.likes)}</td>
                      <td className="p-3 text-slate-300">{formatDuration(video.duration)}</td>
                      <td className="p-3 text-slate-400 text-xs">{campaign?.name || '—'}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusBg(video.status)}`}>
                          {getStatusLabel(video.status)}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setPlayingVideo(video.id)}
                            className="rounded p-1 text-slate-500 hover:bg-slate-700 hover:text-white"
                          >
                            <Play className="h-3.5 w-3.5" />
                          </button>
                          <button className="rounded p-1 text-slate-500 hover:bg-slate-700 hover:text-white">
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {playingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setPlayingVideo(null)}>
          <div
            className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setPlayingVideo(null)} className="absolute top-3 right-3 z-10 rounded-full bg-black/50 p-1 text-white hover:bg-black/70">
              <X className="h-5 w-5" />
            </button>
            <div className="aspect-[9/16] bg-slate-900 flex items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800">
                  <Play className="h-8 w-8 text-slate-500 ml-1" />
                </div>
                <p className="text-sm text-slate-400">Player de Vídeo</p>
                <p className="text-xs text-slate-600">{mockVideos.find(v => v.id === playingVideo)?.title}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
