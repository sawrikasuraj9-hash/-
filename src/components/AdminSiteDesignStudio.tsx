import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Code, 
  Sparkles, 
  Save, 
  RotateCcw, 
  Check, 
  ExternalLink, 
  Eye, 
  Sliders, 
  Layers,
  Wand2,
  Copy
} from 'lucide-react';
import { soundFX } from '../utils/sound';

interface SiteDesignConfig {
  brandName: string;
  brandTagline: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  cardBackgroundColor: string;
  hologramTitle: string;
  hologramSubtitle: string;
  customCss: string;
  footerCopyright: string;
}

const DEFAULT_CSS_SNIPPET = `/* YASHI HALLS Custom Site Styling */
.cyber-glow-custom {
  box-shadow: 0 0 25px rgba(0, 240, 255, 0.4);
}

/* Custom Neon Button Hover Effect */
button:hover {
  filter: drop-shadow(0 0 8px var(--yashi-primary));
}
`;

interface Props {
  adminEmail: string;
  addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const AdminSiteDesignStudio: React.FC<Props> = ({ adminEmail, addToast }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [design, setDesign] = useState<SiteDesignConfig>({
    brandName: 'YASHI HALLS',
    brandTagline: 'Professional Cyber Multi-Device WhatsApp Cloud Engine',
    logoUrl: 'https://i.ibb.co/n2fYpDV/file-000000007c3c8210ae1b96d28b22c655.png',
    primaryColor: '#00f0ff',
    secondaryColor: '#a855f7',
    accentColor: '#3b82f6',
    backgroundColor: '#020612',
    cardBackgroundColor: '#060c18',
    hologramTitle: 'CYBER CORE ACTIVE',
    hologramSubtitle: '24/7 Autonomous WhatsApp Cloud Engine',
    customCss: DEFAULT_CSS_SNIPPET,
    footerCopyright: '© 2026 YASHI HALLS Engine. All Rights Reserved.'
  });

  const [activeCodeTab, setActiveCodeTab] = useState<'css' | 'preview'>('css');

  useEffect(() => {
    const fetchDesign = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/site-design', {
          headers: { 'x-admin-email': adminEmail }
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setDesign(json.data);
          }
        }
      } catch {
        addToast('Failed to load site design configuration', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchDesign();
  }, [adminEmail, addToast]);

  const handleSave = async () => {
    setSaving(true);
    soundFX.playClick();
    try {
      const res = await fetch('/api/admin/site-design', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': adminEmail
        },
        body: JSON.stringify(design)
      });
      const json = await res.json();
      if (json.success) {
        soundFX.playSuccess();
        addToast('Site design & CSS updated successfully!', 'success');
        // Notify live app context to refresh styles
        window.dispatchEvent(new CustomEvent('yashi-design-updated'));
      } else {
        addToast(json.message || 'Failed to save site design', 'error');
      }
    } catch {
      addToast('Network error while saving design', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleApplyPresetCss = (preset: string) => {
    soundFX.playClick();
    if (preset === 'neon-glow') {
      setDesign(prev => ({
        ...prev,
        customCss: prev.customCss + `\n/* Neon Cyber Glow Preset */\n.neon-border {\n  border: 2px solid ${prev.primaryColor};\n  box-shadow: 0 0 15px ${prev.primaryColor};\n}\n`
      }));
    } else if (preset === 'matrix') {
      setDesign(prev => ({
        ...prev,
        primaryColor: '#00ff66',
        secondaryColor: '#008f11',
        backgroundColor: '#010a01',
        cardBackgroundColor: '#031405'
      }));
    } else if (preset === 'cyberpunk') {
      setDesign(prev => ({
        ...prev,
        primaryColor: '#00f0ff',
        secondaryColor: '#ff007f',
        accentColor: '#ffe600',
        backgroundColor: '#030712',
        cardBackgroundColor: '#070f20'
      }));
    }
    addToast('Preset applied to editor. Click "Save Design" to persist.', 'info');
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono flex items-center justify-center gap-3">
        <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <span>Loading Website Design Studio...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-950/40 via-[#0e1726] to-[#0a1220] border-2 border-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,0.2)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border-2 border-purple-400 flex items-center justify-center text-purple-300 shrink-0">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span>WEBSITE DESIGN & CSS CODE STUDIO</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-400 text-purple-300 font-mono text-[10px] font-bold">
                LIVE EDITOR
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              වෙබ් අඩවියේ Brand Name, Logo, පාට (Colors), Hologram තේමා සහ Custom CSS Code සජීවීව වෙනස් කරන්න.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-300 hover:to-purple-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Design & CSS</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Brand & Palette Settings */}
        <div className="lg:col-span-6 space-y-5">
          {/* Brand Identity Card */}
          <div className="p-5 rounded-3xl bg-[#081220] border border-[#162942] space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Brand Identity & Assets</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Brand Name / Site Title
                </label>
                <input
                  type="text"
                  value={design.brandName}
                  onChange={e => setDesign({ ...design, brandName: e.target.value })}
                  placeholder="e.g. YASHI HALLS"
                  className="w-full bg-[#0a1626] border border-[#1b3150] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Brand Tagline
                </label>
                <input
                  type="text"
                  value={design.brandTagline}
                  onChange={e => setDesign({ ...design, brandTagline: e.target.value })}
                  placeholder="e.g. Professional Cyber Multi-Device WhatsApp Engine"
                  className="w-full bg-[#0a1626] border border-[#1b3150] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Website Logo URL
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="url"
                    value={design.logoUrl}
                    onChange={e => setDesign({ ...design, logoUrl: e.target.value })}
                    placeholder="https://i.ibb.co/..."
                    className="flex-1 bg-[#0a1626] border border-[#1b3150] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                  {design.logoUrl && (
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-cyan-400/50 shrink-0 bg-slate-900 flex items-center justify-center">
                      <img 
                        src={design.logoUrl} 
                        alt="Logo Preview" 
                        className="w-full h-full object-cover" 
                        onError={e => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Color Palette Card */}
          <div className="p-5 rounded-3xl bg-[#081220] border border-[#162942] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-purple-400" />
                <span>Cyber Palette & Color Variables</span>
              </h3>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleApplyPresetCss('cyberpunk')}
                  className="px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-[10px] text-cyan-300 font-mono hover:bg-cyan-900/50"
                >
                  Cyber
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPresetCss('matrix')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-[10px] text-emerald-300 font-mono hover:bg-emerald-900/50"
                >
                  Matrix
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Primary Neon Color
                </label>
                <div className="flex items-center gap-2 bg-[#0a1626] border border-[#1b3150] rounded-xl p-1.5">
                  <input
                    type="color"
                    value={design.primaryColor}
                    onChange={e => setDesign({ ...design, primaryColor: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={design.primaryColor}
                    onChange={e => setDesign({ ...design, primaryColor: e.target.value })}
                    className="w-full bg-transparent text-xs text-white font-mono uppercase focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Secondary Neon (Purple)
                </label>
                <div className="flex items-center gap-2 bg-[#0a1626] border border-[#1b3150] rounded-xl p-1.5">
                  <input
                    type="color"
                    value={design.secondaryColor}
                    onChange={e => setDesign({ ...design, secondaryColor: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={design.secondaryColor}
                    onChange={e => setDesign({ ...design, secondaryColor: e.target.value })}
                    className="w-full bg-transparent text-xs text-white font-mono uppercase focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Accent Color (Glow / Links)
                </label>
                <div className="flex items-center gap-2 bg-[#0a1626] border border-[#1b3150] rounded-xl p-1.5">
                  <input
                    type="color"
                    value={design.accentColor}
                    onChange={e => setDesign({ ...design, accentColor: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={design.accentColor}
                    onChange={e => setDesign({ ...design, accentColor: e.target.value })}
                    className="w-full bg-transparent text-xs text-white font-mono uppercase focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Site Background Color
                </label>
                <div className="flex items-center gap-2 bg-[#0a1626] border border-[#1b3150] rounded-xl p-1.5">
                  <input
                    type="color"
                    value={design.backgroundColor}
                    onChange={e => setDesign({ ...design, backgroundColor: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={design.backgroundColor}
                    onChange={e => setDesign({ ...design, backgroundColor: e.target.value })}
                    className="w-full bg-transparent text-xs text-white font-mono uppercase focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Hologram Titles & Footer */}
          <div className="p-5 rounded-3xl bg-[#081220] border border-[#162942] space-y-3.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Hologram & Footer Copy</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Hologram Core Title
              </label>
              <input
                type="text"
                value={design.hologramTitle}
                onChange={e => setDesign({ ...design, hologramTitle: e.target.value })}
                placeholder="CYBER CORE ACTIVE"
                className="w-full bg-[#0a1626] border border-[#1b3150] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Hologram Core Subtitle
              </label>
              <input
                type="text"
                value={design.hologramSubtitle}
                onChange={e => setDesign({ ...design, hologramSubtitle: e.target.value })}
                placeholder="24/7 Autonomous WhatsApp Cloud Engine"
                className="w-full bg-[#0a1626] border border-[#1b3150] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Footer Copyright Text
              </label>
              <input
                type="text"
                value={design.footerCopyright}
                onChange={e => setDesign({ ...design, footerCopyright: e.target.value })}
                placeholder="© 2026 YASHI HALLS Engine. All Rights Reserved."
                className="w-full bg-[#0a1626] border border-[#1b3150] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Custom CSS Code Studio */}
        <div className="lg:col-span-6 space-y-5">
          <div className="p-5 rounded-3xl bg-[#081220] border border-[#162942] space-y-4 flex flex-col h-full">
            <div className="flex items-center justify-between pb-2 border-b border-[#14263e]">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-mono">
                  CUSTOM CSS CODE STUDIO
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyPresetCss('neon-glow')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-[11px] text-cyan-300 font-mono hover:bg-cyan-900/50"
                >
                  <Wand2 className="w-3 h-3" />
                  <span>+ Glow Preset</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              මෙහි ලියන ඕනෑම CSS Code එකක් වෙබ්සයිට් එකේ සෑම පිටුවකටම real-time inject වේ. 
              Variable: <code className="text-cyan-400 font-mono">var(--yashi-primary)</code>
            </p>

            {/* Code Textarea with line styling */}
            <div className="relative flex-1 min-h-[360px] rounded-2xl bg-[#040811] border-2 border-[#162740] overflow-hidden focus-within:border-cyan-500/60 transition-all">
              <div className="absolute top-0 left-0 right-0 px-4 py-2 bg-[#09111e] border-b border-[#162740] flex items-center justify-between text-[11px] font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  <span className="ml-2 text-slate-300 font-bold">global-custom.css</span>
                </div>
                <span>CSS3 Editor</span>
              </div>

              <textarea
                value={design.customCss}
                onChange={e => setDesign({ ...design, customCss: e.target.value })}
                placeholder="/* Add your custom styles here */"
                rows={16}
                className="w-full h-full pt-12 pb-4 px-4 bg-transparent text-emerald-400 font-mono text-xs leading-relaxed focus:outline-none resize-y selection:bg-cyan-500/30"
                spellCheck={false}
              />
            </div>

            {/* Quick Helper Tips */}
            <div className="p-3.5 rounded-2xl bg-[#0b1626] border border-[#162a42] text-[11px] text-slate-400 font-mono space-y-1">
              <div className="text-cyan-300 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>CSS Variables Available:</span>
              </div>
              <div>--yashi-primary: {design.primaryColor}</div>
              <div>--yashi-secondary: {design.secondaryColor}</div>
              <div>--yashi-bg: {design.backgroundColor}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
