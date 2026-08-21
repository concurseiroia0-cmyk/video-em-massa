import { useState } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight, Pause, Play, ArrowRight, Zap } from 'lucide-react';
import { mockScheduleSlots, mockVideos, mockCampaigns, mockAccounts } from '../data/mockData';
import { getStatusBg, getStatusLabel } from '../utils/helpers';
import toast from 'react-hot-toast';

const timeSlots = ['09:00', '12:00', '15:00', '18:00', '21:00'];

export default function Scheduler() {
  const [selectedDate, setSelectedDate] = useState('2026-08-20');
  const [view, setView] = useState<'calendar' | 'timeline'>('timeline');
  const [selectedCampaign, setSelectedCampaign] = useState('all');

  // Generate calendar days for August 2026
  const calendarDays = Array.from({ length: 31 }, (_, i) => {
    const date = `2026-08-${String(i + 1).padStart(2, '0')}`;
    const slots = mockScheduleSlots.filter(s => s.date === date);
    return { date, day: i + 1, slots };
  });

  const daySlots = mockScheduleSlots
    .filter(s => s.date === selectedDate)
    .filter(s => selectedCampaign === 'all' || s.campaignId === selectedCampaign)
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Agenda</h1>
          <p className="text-sm text-slate-400">Gerencie o cronograma de publicações</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-xs text-white outline-none"
          >
            <option value="all">Todas as Campanhas</option>
            {mockCampaigns.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button
            onClick={() => toast.success('Distribuição automática iniciada!')}
            className="flex items-center gap-2 rounded-lg bg-purple-electric px-4 py-2 text-xs font-semibold text-white hover:bg-purple-dark"
          >
            <Zap className="h-3.5 w-3.5" />
            Auto-Distribuir
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Calendar Grid */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Agosto 2026</h3>
            <div className="flex items-center gap-2">
              <button className="rounded p-1 text-slate-500 hover:bg-slate-700 hover:text-white">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className="rounded p-1 text-slate-500 hover:bg-slate-700 hover:text-white">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="mb-2 grid grid-cols-7 gap-1 text-center">
            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(d => (
              <div key={d} className="py-1 text-[10px] font-medium text-slate-500">{d}</div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {/* August 2026 starts on Saturday */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {calendarDays.map((day) => {
              const isSelected = day.date === selectedDate;
              const hasScheduled = day.slots.length > 0;
              const publishedCount = day.slots.filter(s => s.status === 'published').length;
              const scheduledCount = day.slots.filter(s => s.status === 'scheduled').length;

              return (
                <button
                  key={day.date}
                  onClick={() => setSelectedDate(day.date)}
                  className={`relative rounded-lg p-1.5 text-center transition-all ${
                    isSelected
                      ? 'bg-purple-electric text-white'
                      : 'text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  <span className="text-xs font-medium">{day.day}</span>
                  {hasScheduled && (
                    <div className="mt-0.5 flex justify-center gap-0.5">
                      {publishedCount > 0 && (
                        <div className="h-1 w-1 rounded-full bg-neon-green" />
                      )}
                      {scheduledCount > 0 && (
                        <div className="h-1 w-1 rounded-full bg-purple-electric" />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center gap-4 text-[10px] text-slate-500">
            <span className="flex items-center gap-1"><div className="h-1.5 w-1.5 rounded-full bg-neon-green" /> Publicado</span>
            <span className="flex items-center gap-1"><div className="h-1.5 w-1.5 rounded-full bg-purple-electric" /> Agendado</span>
            <span className="flex items-center gap-1"><div className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Publicando</span>
          </div>
        </div>

        {/* Day Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">
              Cronograma — {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h3>
            <span className="text-xs text-slate-500">{daySlots.length} publicações agendadas</span>
          </div>

          {/* Config Panel */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="mb-1 block text-[10px] font-medium text-slate-500">Campanha</label>
                <select className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white outline-none">
                  {mockCampaigns.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="w-24">
                <label className="mb-1 block text-[10px] font-medium text-slate-500">Posts/dia</label>
                <input type="number" defaultValue={5} min={1} max={20} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white outline-none" />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-[10px] font-medium text-slate-500">Horários</label>
                <div className="flex flex-wrap gap-1">
                  {timeSlots.map(t => (
                    <span key={t} className="rounded bg-slate-700/50 px-2 py-0.5 text-[10px] text-slate-400">{t}</span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => toast.success('Horários configurados!')}
                className="rounded-lg bg-purple-electric/15 px-3 py-1.5 text-xs font-medium text-purple-electric hover:bg-purple-electric/25 transition-colors"
              >
                Aplicar
              </button>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            {daySlots.length === 0 ? (
              <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-12 text-center">
                <Calendar className="mx-auto mb-3 h-12 w-12 text-slate-700" />
                <p className="text-sm text-slate-500">Nenhuma publicação agendada para este dia</p>
                <p className="text-xs text-slate-600">Selecione uma campanha e distribua automaticamente</p>
              </div>
            ) : (
              daySlots.map((slot, i) => {
                const video = mockVideos.find(v => v.id === slot.videoId);
                const campaign = mockCampaigns.find(c => c.id === slot.campaignId);
                const account = mockAccounts.find(a => a.id === slot.accountId);

                return (
                  <div key={slot.id} className="flex items-center gap-4 rounded-xl border border-slate-700/50 bg-slate-800/50 p-4 transition-all hover:border-slate-600">
                    {/* Time */}
                    <div className="w-16 flex-shrink-0">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-500" />
                        <span className="text-lg font-bold text-white">{slot.time}</span>
                      </div>
                    </div>

                    {/* Connector */}
                    <div className="flex flex-col items-center gap-1">
                      <div className={`h-3 w-3 rounded-full ${
                        slot.status === 'published' ? 'bg-neon-green' :
                        slot.status === 'publishing' ? 'bg-amber-400 animate-pulse' :
                        'bg-purple-electric'
                      }`} />
                      {i < daySlots.length - 1 && (
                        <div className="h-6 w-px bg-slate-700" />
                      )}
                    </div>

                    {/* Video Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white">{video?.title || `Vídeo #${slot.videoId}`}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusBg(slot.status)}`}>
                          {getStatusLabel(slot.status)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-[10px] text-slate-500">
                        <span>📁 {campaign?.name || 'Sem campanha'}</span>
                        <span>👤 {account?.username || 'Sem conta'}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {slot.status === 'scheduled' && (
                        <button
                          onClick={() => toast.success('Publicação pausada')}
                          className="rounded p-1.5 text-slate-500 hover:bg-slate-700 hover:text-amber-400 transition-colors"
                          title="Pausar"
                        >
                          <Pause className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {slot.status === 'scheduled' && (
                        <button
                          onClick={() => toast.success('Reagendando...')}
                          className="rounded p-1.5 text-slate-500 hover:bg-slate-700 hover:text-purple-electric transition-colors"
                          title="Reagendar"
                        >
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
