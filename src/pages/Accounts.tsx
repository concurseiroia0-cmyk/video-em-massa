import { useState } from 'react';
import { Users, Link2, Unlink, RefreshCw, AlertTriangle, CheckCircle2, ExternalLink, Shield, Zap } from 'lucide-react';
import { mockAccounts } from '../data/mockData';
import { formatNumber, getStatusBg, getStatusLabel } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function Accounts() {
  const [accounts, setAccounts] = useState(mockAccounts);

  const reconnect = (id: string) => {
    setAccounts(prev => prev.map(a =>
      a.id === id ? { ...a, status: 'connected' as const } : a
    ));
    toast.success('Conta reconectada com sucesso!');
  };

  const disconnect = (id: string) => {
    setAccounts(prev => prev.map(a =>
      a.id === id ? { ...a, status: 'expired' as const } : a
    ));
    toast.success('Conta desconectada');
  };

  const connectedCount = accounts.filter(a => a.status === 'connected').length;
  const totalCount = accounts.length;

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Contas Sociais</h1>
          <p className="text-sm text-slate-400">Gerencie as conexões com TikTok e Instagram</p>
        </div>
        <button
          onClick={() => toast.success('Redirecionando para autenticação OAuth...')}
          className="flex items-center gap-2 rounded-lg bg-purple-electric px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-purple-dark"
        >
          <Link2 className="h-4 w-4" />
          Conectar Nova Conta
        </button>
      </div>

      {/* Connection Overview */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6">
        <div className="flex items-center gap-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neon-green/10">
            <Shield className="h-6 w-6 text-neon-green" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Status das Conexões</h3>
            <p className="text-xs text-slate-500">
              {connectedCount} de {totalCount} contas conectadas via OAuth seguro
            </p>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-neon-green">{connectedCount}</p>
              <p className="text-[10px] text-slate-500">Conectadas</p>
            </div>
            <div className="h-8 w-px bg-slate-700" />
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-400">{totalCount - connectedCount}</p>
              <p className="text-[10px] text-slate-500">Problemas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {accounts.map((account) => (
          <div
            key={account.id}
            className={`rounded-xl border transition-all ${
              account.status === 'connected'
                ? 'border-neon-green/20 bg-slate-800/50'
                : account.status === 'expired'
                  ? 'border-amber-500/20 bg-slate-800/50'
                  : 'border-red-500/20 bg-slate-800/50'
            }`}
          >
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold ${
                    account.platform === 'tiktok'
                      ? 'bg-pink-500/20 text-pink-400'
                      : 'bg-purple-500/20 text-purple-light'
                  }`}>
                    {account.platform === 'tiktok' ? '♪' : '◎'}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{account.displayName}</h3>
                    <p className="text-xs text-slate-500">{account.username}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusBg(account.status)}`}>
                  {account.status === 'connected' && <CheckCircle2 className="h-3 w-3" />}
                  {account.status === 'expired' && <RefreshCw className="h-3 w-3" />}
                  {account.status === 'error' && <AlertTriangle className="h-3 w-3" />}
                  {getStatusLabel(account.status)}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-900/50 p-3">
                  <p className="text-lg font-bold text-white">{formatNumber(account.followers)}</p>
                  <p className="text-[10px] text-slate-500">Seguidores</p>
                </div>
                <div className="rounded-lg bg-slate-900/50 p-3">
                  <p className="text-sm font-medium text-white capitalize">{account.platform}</p>
                  <p className="text-[10px] text-slate-500">Plataforma</p>
                </div>
              </div>

              <div className="mt-2 text-[10px] text-slate-600">
                Conectado em: {new Date(account.connectedAt).toLocaleDateString('pt-BR')}
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center gap-2">
                {account.status === 'connected' ? (
                  <>
                    <button
                      onClick={() => disconnect(account.id)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-700 py-2 text-xs text-slate-400 transition-colors hover:border-red-500/30 hover:text-red-400"
                    >
                      <Unlink className="h-3 w-3" />
                      Desconectar
                    </button>
                    <button
                      onClick={() => toast.success('Configurações abertas')}
                      className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
                    >
                      Configurações
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => reconnect(account.id)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-neon-green/15 py-2 text-xs font-medium text-neon-green transition-colors hover:bg-neon-green/25"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Reconectar
                    </button>
                    {account.status === 'error' && (
                      <button
                        onClick={() => toast.success('Verificando conexão...')}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Diagnosticar
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Add New Account Card */}
        <button
          onClick={() => toast.success('Redirecionando para autenticação OAuth...')}
          className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-transparent p-12 text-center transition-all hover:border-purple-electric/50 hover:bg-purple-electric/5"
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800">
            <Users className="h-6 w-6 text-slate-600" />
          </div>
          <p className="text-sm font-medium text-slate-400">Conectar Nova Conta</p>
          <p className="mt-1 text-xs text-slate-600">TikTok ou Instagram via OAuth</p>
        </button>
      </div>
    </div>
  );
}
