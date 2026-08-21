import { useState } from 'react';
import { Plus, Eye, Layers, Type, Image, Clock, ChevronDown, ChevronRight, Sparkles } from 'lucide-react';
import { mockTemplates } from '../data/mockData';
import toast from 'react-hot-toast';

export default function Templates() {
  const [selectedTemplate, setSelectedTemplate] = useState(mockTemplates[0]);
  const [showNewModal, setShowNewModal] = useState(false);

  const layerIcons: Record<string, any> = {
    crop: Image,
    logo: Image,
    watermark: Type,
    caption: Type,
    intro: Clock,
    cta: Sparkles,
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Editor de Templates</h1>
          <p className="text-sm text-slate-400">Crie e gerencie templates de processamento em lote</p>
        </div>
        <button
          onClick={() => setShowNewModal(!showNewModal)}
          className="flex items-center gap-2 rounded-lg bg-purple-electric px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-purple-dark"
        >
          <Plus className="h-4 w-4" />
          Novo Template
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Template List */}
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider">Templates</h3>
          {mockTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template)}
              className={`w-full rounded-xl border p-4 text-left transition-all ${
                selectedTemplate.id === template.id
                  ? 'border-purple-electric/50 bg-purple-electric/10'
                  : 'border-slate-700/50 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{template.name}</p>
                  <p className="text-xs text-slate-500">{template.format}</p>
                </div>
                {selectedTemplate.id === template.id && (
                  <div className="h-2 w-2 rounded-full bg-purple-electric" />
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {template.layers.filter(l => l.enabled).map((layer) => (
                  <span key={layer.name} className="rounded bg-slate-700/50 px-1.5 py-0.5 text-[10px] text-slate-400">
                    {layer.name}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>

        {/* Layer Configurator */}
        <div className="space-y-4">
          <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Camadas — {selectedTemplate.name}
          </h3>
          <div className="space-y-2">
            {selectedTemplate.layers.map((layer, i) => {
              const Icon = layerIcons[layer.type] || Layers;
              const [expanded, setExpanded] = useState(false);
              return (
                <div
                  key={i}
                  className="rounded-xl border border-slate-700/50 bg-slate-800/50 overflow-hidden"
                >
                  <div
                    className="flex items-center gap-3 p-3 cursor-pointer"
                    onClick={() => setExpanded(!expanded)}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700/50">
                      <Icon className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{layer.name}</p>
                      <p className="text-[10px] text-slate-500 capitalize">{layer.type}</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={layer.enabled}
                        onChange={() => toast.success(`Camada "${layer.name}" ${layer.enabled ? 'desativada' : 'ativada'}`)}
                        className="peer sr-only"
                      />
                      <div className="h-5 w-9 rounded-full bg-slate-700 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-slate-400 after:transition-all peer-checked:bg-purple-electric peer-checked:after:translate-x-full peer-checked:after:bg-white" />
                    </label>
                    {expanded ? (
                      <ChevronDown className="h-4 w-4 text-slate-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-500" />
                    )}
                  </div>
                  {expanded && (
                    <div className="border-t border-slate-700/30 bg-slate-900/30 p-3 space-y-3">
                      {Object.entries(layer.config).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <label className="text-xs text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                          {typeof value === 'string' ? (
                            <input
                              type="text"
                              defaultValue={value as string}
                              className="w-40 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-white outline-none focus:border-purple-electric/50"
                            />
                          ) : typeof value === 'boolean' ? (
                            <div className="h-4 w-7 rounded-full bg-slate-700 after:absolute after:left-[2px] after:top-[2px] after:h-3 after:w-3 after:rounded-full after:bg-slate-400 peer-checked:bg-purple-electric" />
                          ) : (
                            <input
                              type="number"
                              defaultValue={value as number}
                              className="w-20 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-white outline-none focus:border-purple-electric/50"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <button
            onClick={() => toast.success(`Template "${selectedTemplate.name}" salvo!`)}
            className="w-full rounded-lg bg-purple-electric py-2.5 text-sm font-semibold text-white transition-all hover:bg-purple-dark"
          >
            Salvar Template
          </button>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pré-visualização</h3>
          <div className="relative mx-auto aspect-[9/16] w-full max-w-[280px] overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900">
            {/* Fake video preview */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-700/50">
                  <Eye className="h-8 w-8 text-slate-500" />
                </div>
                <p className="text-xs text-slate-500">Preview do Template</p>
                <p className="text-[10px] text-slate-600">1080 × 1920</p>
              </div>
            </div>

            {/* Layer overlays */}
            {selectedTemplate.layers.filter(l => l.enabled).map((layer, i) => {
              if (layer.type === 'logo' && layer.config.position === 'top-right') {
                return (
                  <div key={i} className="absolute top-3 right-3 rounded bg-purple-electric/30 px-2 py-1 text-[8px] text-purple-electric border border-purple-electric/50">
                    LOGO
                  </div>
                );
              }
              if (layer.type === 'logo' && layer.config.position === 'top-center') {
                return (
                  <div key={i} className="absolute top-3 left-1/2 -translate-x-1/2 rounded bg-purple-electric/30 px-2 py-1 text-[8px] text-purple-electric border border-purple-electric/50">
                    LOGO
                  </div>
                );
              }
              if (layer.type === 'watermark') {
                return (
                  <div key={i} className="absolute bottom-1/2 left-1/2 -translate-x-1/2 translate-y-1/2 text-[10px] text-slate-500/30 select-none">
                    {layer.config.text || '@brand'}
                  </div>
                );
              }
              if (layer.type === 'caption') {
                return (
                  <div
                    key={i}
                    className={`absolute left-2 right-2 rounded bg-black/60 px-3 py-2 text-center text-white ${
                      layer.config.position === 'top' ? 'top-20' :
                      layer.config.position === 'center' ? 'top-1/2 -translate-y-1/2' :
                      'bottom-24'
                    }`}
                  >
                    <p style={{ fontSize: `${(layer.config.size || 36) / 6}px` }} className="font-bold">
                      Legendas aqui...
                    </p>
                  </div>
                );
              }
              if (layer.type === 'cta') {
                return (
                  <div key={i} className="absolute bottom-4 left-2 right-2 rounded-lg bg-gradient-to-r from-purple-electric to-neon-green px-4 py-2 text-center text-xs font-bold text-white">
                    {layer.config.text || 'Siga para mais!'}
                  </div>
                );
              }
              if (layer.type === 'intro') {
                return (
                  <div key={i} className="absolute inset-x-0 top-1/3 flex justify-center">
                    <div className="rounded-lg bg-black/80 px-4 py-2 border border-slate-600">
                      <p className="text-[10px] font-bold text-white">{layer.config.text || 'INTRO 2s'}</p>
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>

          <button
            onClick={() => toast.success('Template aplicado à campanha!')}
            className="w-full rounded-lg border border-purple-electric/50 bg-purple-electric/10 py-2.5 text-sm font-semibold text-purple-electric transition-all hover:bg-purple-electric/20"
          >
            Aplicar Template à Campanha
          </button>
        </div>
      </div>
    </div>
  );
}
