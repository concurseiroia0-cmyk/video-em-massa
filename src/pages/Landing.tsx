import { ArrowRight, Zap, Layers, Calendar, Shield, Gauge, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Zap,
      title: 'Coleta em Massa',
      description: 'Busque centenas de vídeos do TikTok e Instagram com filtros avançados. Dezenas por vez, nunca um por vez.',
    },
    {
      icon: Layers,
      title: 'Edição em Lote',
      description: 'Aplique templates com crop, logo, legendas e CTAs via FFmpeg em paralelo. 100+ vídeos processados simultaneamente.',
    },
    {
      icon: Calendar,
      title: 'Publicação Automática',
      description: 'Distribua seus vídeos em calendário com horários fixos. O sistema publica no momento certo, toda vez.',
    },
    {
      icon: Shield,
      title: 'Contas Seguras',
      description: 'Conexão via OAuth oficial do TikTok e Instagram. Suas credenciais nunca são expostas.',
    },
    {
      icon: Gauge,
      title: 'Filas Inteligentes',
      description: 'Processamento assíncrono com retry automático. Interface nunca trava, mesmo com 500+ vídeos.',
    },
    {
      icon: CheckCircle2,
      title: 'Monitoramento Total',
      description: 'Logs detalhados, métricas de sucesso e alertas em tempo real. Controle total sobre sua operação.',
    },
  ];

  const steps = [
    { number: '01', title: 'Conecte suas contas', description: 'Link TikTok e Instagram via OAuth seguro em segundos.' },
    { number: '02', title: 'Colete e importe', description: 'Busque vídeos por perfil, trendy, ou critério personalizado.' },
    { number: '03', title: 'Edite em lote', description: 'Aplique templates, legendas e marca d\'água com um clique.' },
    { number: '04', title: 'Agende e publique', description: 'Defina horários e deixe o sistema publicar automaticamente.' },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-electric">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              Batch<span className="text-purple-electric">Post</span>
            </span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-slate-400 hover:text-white transition-colors">Como Funciona</a>
            <a href="#pricing" className="text-sm text-slate-400 hover:text-white transition-colors">Preços</a>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 rounded-lg bg-purple-electric px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-purple-dark"
          >
            Abrir App
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-purple-electric/10 blur-3xl" />
          <div className="absolute top-20 right-0 h-64 w-64 rounded-full bg-neon-green/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/50 px-4 py-1.5 text-xs text-slate-400">
            <Zap className="h-3 w-3 text-purple-electric" />
            Plataforma de produção de conteúdo em escala
          </div>

          <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-white md:text-7xl">
            Coleta em massa.<br />
            Edita em lote.<br />
            <span className="bg-gradient-to-r from-purple-electric to-neon-green bg-clip-text text-transparent">
              Publica no horário.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
            A plataforma definitiva para criadores de conteúdo, agências e páginas de nicho que precisam de volume.
            Colete, edite, organize e publique dezenas ou centenas de vídeos automaticamente.
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 rounded-xl bg-purple-electric px-8 py-4 text-base font-bold text-white transition-all hover:bg-purple-dark hover:shadow-lg hover:shadow-purple-electric/25"
            >
              Começar Agora
              <ArrowRight className="h-5 w-5" />
            </button>
            <button className="flex items-center gap-2 rounded-xl border border-slate-700 px-8 py-4 text-base font-medium text-slate-300 transition-all hover:border-slate-600 hover:bg-slate-800">
              Ver Demo
            </button>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-8 border-t border-slate-700/50 pt-10">
            <div>
              <p className="text-3xl font-bold text-white">5-50</p>
              <p className="mt-1 text-sm text-slate-500">Posts por dia</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">96.8%</p>
              <p className="mt-1 text-sm text-slate-500">Taxa de sucesso</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">100+</p>
              <p className="mt-1 text-sm text-slate-500">Vídeos simultâneos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-white">Tudo que você precisa em escala</h2>
            <p className="mt-3 text-slate-400">Ferramentas pensadas para volume, velocidade e confiabilidade.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group rounded-xl border border-slate-700/50 bg-slate-800/30 p-6 transition-all duration-200 hover:border-purple-electric/30 hover:bg-slate-800/50"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-electric/10">
                    <Icon className="h-5 w-5 text-purple-electric" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm text-slate-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 bg-slate-800/30">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-white">Como funciona</h2>
            <p className="mt-3 text-slate-400">Do perfil do TikTok ao post agendado em minutos.</p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-purple-electric/30 bg-purple-electric/10 text-lg font-bold text-purple-electric">
                  {step.number}
                </div>
                <h3 className="text-base font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 p-12">
            <h2 className="text-3xl font-bold text-white">Pronto para escalar seu conteúdo?</h2>
            <p className="mt-4 text-slate-400">
              Comece gratuitamente. Sem cartão de crédito. Configure em 5 minutos.
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-purple-electric px-8 py-4 text-base font-bold text-white transition-all hover:bg-purple-dark hover:shadow-lg hover:shadow-purple-electric/25"
            >
              Criar Conta Grátis
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-purple-electric" />
            <span className="text-sm font-semibold text-slate-400">
              Batch<span className="text-purple-electric">Post</span>
            </span>
          </div>
          <p className="text-xs text-slate-600">© 2026 BatchPost. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
