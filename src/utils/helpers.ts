export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function getSourceColor(source: string): string {
  return source === 'tiktok' ? 'text-pink-400' : 'text-purple-light';
}

export function getSourceBg(source: string): string {
  return source === 'tiktok' ? 'bg-pink-500/20 text-pink-400 border-pink-500/30' : 'bg-purple-500/20 text-purple-light border-purple-500/30';
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'found': return 'text-slate-400';
    case 'downloading': return 'text-blue-400';
    case 'processing': return 'text-amber-400';
    case 'ready': return 'text-neon-green';
    case 'published': return 'text-neon-green';
    case 'error': return 'text-red-400';
    default: return 'text-slate-400';
  }
}

export function getStatusBg(status: string): string {
  switch (status) {
    case 'found': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    case 'downloading': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'processing': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'ready': return 'bg-neon-green/20 text-neon-green border-neon-green/30';
    case 'published': return 'bg-neon-green/20 text-neon-green border-neon-green/30';
    case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'scheduled': return 'bg-purple-electric/20 text-purple-light border-purple-electric/30';
    case 'publishing': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'connected': return 'bg-neon-green/20 text-neon-green border-neon-green/30';
    case 'expired': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'active': return 'bg-neon-green/20 text-neon-green border-neon-green/30';
    case 'paused': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'completed': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'found': return 'Encontrado';
    case 'downloading': return 'Baixando';
    case 'processing': return 'Processando';
    case 'ready': return 'Pronto';
    case 'published': return 'Publicado';
    case 'error': return 'Erro';
    case 'scheduled': return 'Agendado';
    case 'publishing': return 'Publicando';
    case 'connected': return 'Conectado';
    case 'expired': return 'Expirado';
    case 'active': return 'Ativa';
    case 'paused': return 'Pausada';
    case 'completed': return 'Concluída';
    default: return status;
  }
}

export function getStatusIcon(status: string): string {
  switch (status) {
    case 'ready':
    case 'published':
    case 'connected':
      return '✅';
    case 'processing':
    case 'downloading':
    case 'publishing':
      return '🔄';
    case 'found':
    case 'scheduled':
    case 'paused':
      return '⏳';
    case 'error':
    case 'expired':
      return '❌';
    default: return '⏳';
  }
}
