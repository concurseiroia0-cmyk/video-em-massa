import { useState } from 'react';
import { Search, Download, CheckSquare, Square, Zap, Eye, Heart, Clock } from 'lucide-react';
import { mockVideos } from '../data/mockData';
import { formatNumber, formatDuration, getSourceBg } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function Collector() {
  const [platform, setPlatform] = useState<'tiktok' | 'instagram'>('tiktok');
  const [profile, setProfile] = useState('');
  const [quantity, setQuantity] = useState(100);
  const [criteria, setCriteria] = useState('views');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const handleSearch = () => {
    if (!profile) {
      toast.error('Digite o @ do perfil');
      return;
    }
    setSearching(true);
    setTimeout(() => {
      setSearching(false);
      setResults(true);
      toast.success(`Encontrados ${quantity} vídeos de @${profile}`);
    }, 2000);
  };

  const searchResults = mockVideos.slice(0, Math.min(quantity, 15));

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === searchResults.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(searchResults.map(v => v.id)));
    }
  };

  const importSelected = () => {
    toast.success(`${selected.size} vídeos importados para a fila!`);
    setSelected(new Set());
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Coletor de Conteúdo</h1>
        <p className="text-sm text-slate-400">Busque e importe vídeos em massa do TikTok e Instagram</p>
      </div>

      {/* Search Form */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Platform */}
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-400">Rede Social</label>
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

          {/* Profile */}
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-400">@ do Perfil</label>
            <input
              type="text"
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
              placeholder="@nome_do_perfil"
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-purple-electric/50"
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-400">Quantidade</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min={1}
              max={500}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-purple-electric/50"
            />
          </div>

          {/* Criteria */}
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-400">Critério</label>
            <select
              value={criteria}
              onChange={(e) => setCriteria(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-purple-electric/50"
            >
              <option value="views">Mais Visualizações</option>
              <option value="recent">Mais Recentes</option>
              <option value="likes">Mais Curtidas</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <button
            onClick={handleSearch}
            disabled={searching}
            className="flex items-center gap-2 rounded-lg bg-purple-electric px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-purple-dark disabled:opacity-50"
          >
            {searching ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Buscando...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Buscar
              </>
            )}
          </button>
          {results && (
            <span className="text-sm text-slate-400">
              {searchResults.length} resultados encontrados
            </span>
          )}
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="animate-slide-in rounded-xl border border-slate-700/50 bg-slate-800/50 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-white">Resultados</h3>
              <span className="text-xs text-slate-500">{selected.size} selecionados</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleAll}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 transition-colors hover:border-slate-600 hover:text-white"
              >
                {selected.size === searchResults.length ? (
                  <CheckSquare className="h-3.5 w-3.5 text-purple-electric" />
                ) : (
                  <Square className="h-3.5 w-3.5" />
                )}
                Selecionar Todos
              </button>
              <button
                onClick={importSelected}
                disabled={selected.size === 0}
                className="flex items-center gap-1.5 rounded-lg bg-neon-green px-4 py-1.5 text-xs font-semibold text-white transition-all hover:bg-neon-green-dark disabled:opacity-30"
              >
                <Download className="h-3.5 w-3.5" />
                Importar para Fila ({selected.size})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="pb-3 w-10" />
                  <th className="pb-3 text-left text-xs font-medium text-slate-500">Vídeo</th>
                  <th className="pb-3 text-left text-xs font-medium text-slate-500">Fonte</th>
                  <th className="pb-3 text-left text-xs font-medium text-slate-500">
                    <Eye className="inline h-3 w-3" /> Views
                  </th>
                  <th className="pb-3 text-left text-xs font-medium text-slate-500">
                    <Heart className="inline h-3 w-3" /> Likes
                  </th>
                  <th className="pb-3 text-left text-xs font-medium text-slate-500">
                    <Clock className="inline h-3 w-3" /> Duração
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {searchResults.map((video) => (
                  <tr key={video.id} className="text-sm transition-colors hover:bg-slate-800/50 cursor-pointer" onClick={() => toggleSelect(video.id)}>
                    <td className="py-3">
                      <button onClick={(e) => { e.stopPropagation(); toggleSelect(video.id); }}>
                        {selected.has(video.id) ? (
                          <CheckSquare className="h-4 w-4 text-purple-electric" />
                        ) : (
                          <Square className="h-4 w-4 text-slate-600" />
                        )}
                      </button>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-16 items-center justify-center rounded-md bg-slate-700/50 overflow-hidden">
                          <Zap className="h-4 w-4 text-slate-500" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{video.title}</p>
                          <p className="text-xs text-slate-500">{video.profile}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${getSourceBg(video.source)}`}>
                        {video.source === 'tiktok' ? '♪ TikTok' : '◎ Instagram'}
                      </span>
                    </td>
                    <td className="py-3 text-slate-300">{formatNumber(video.views)}</td>
                    <td className="py-3 text-slate-300">{formatNumber(video.likes)}</td>
                    <td className="py-3 text-slate-300">{formatDuration(video.duration)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
