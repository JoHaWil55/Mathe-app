import React from 'react';
import { X, Laptop, Check, Download, ExternalLink, ShieldCheck } from 'lucide-react';

interface WindowsInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDirectInstall?: () => void;
  canDirectInstall?: boolean;
}

export const WindowsInstallModal: React.FC<WindowsInstallModalProps> = ({
  isOpen,
  onClose,
  onDirectInstall,
  canDirectInstall,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-scaleUp">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                MatheLab als Windows-App nutzen
              </h3>
              <p className="text-2xs text-slate-500">
                Eigenständiges Windows-Fenster, Taskleisten-Symbol & Offline-Nutzung
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Method 1: PWA Install (Direct & Instant) */}
          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Methode 1: 1-Klick Installation (Empfohlen)</span>
              </span>
              <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Sofort & Sicher
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              Moderne Windows-Systeme (Windows 10 & 11) unterstützen Progressive Web Apps (PWA) direkt über <strong>Microsoft Edge</strong> oder <strong>Google Chrome</strong>:
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-white rounded-lg border border-indigo-100/80">
                <span className="font-semibold text-slate-800 block mb-0.5">In Microsoft Edge:</span>
                Klicke in der Adressleiste ganz rechts auf das Symbol <strong>„App verfügbar. MatheLab installieren“</strong> oder im Menü (<code>···</code>) auf <strong>Apps → MatheLab installieren</strong>.
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-indigo-100/80">
                <span className="font-semibold text-slate-800 block mb-0.5">In Google Chrome:</span>
                Klicke in der Adressleiste auf das Symbol <strong>„App installieren“</strong> (oder Menü <code>⋮</code> → <em>Speichern und teilen → Seite als App installieren</em>).
              </div>
            </div>

            {canDirectInstall && onDirectInstall && (
              <button
                onClick={() => {
                  onDirectInstall();
                  onClose();
                }}
                className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Jetzt direkt in Windows installieren</span>
              </button>
            )}

            <div className="flex items-center gap-2 text-2xs text-slate-600 pt-1">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Erscheint im Windows-Startmenü und lässt sich an die Taskleiste heften</span>
            </div>
            <div className="flex items-center gap-2 text-2xs text-slate-600">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Startet blitzschnell im eigenen Fenster ohne störende Browser-Menüleisten</span>
            </div>
          </div>

          {/* Method 2: Packaged Desktop App (.exe) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
              <span>Methode 2: Als eigenständige Windows .EXE Datei (Tauri / Electron)</span>
            </div>
            <p className="text-2xs text-slate-600 leading-relaxed">
              Wenn du eine portable <code>.exe</code>-Installationsdatei weitergeben oder offline verteilen möchtest, kannst du dieses Projekt mit einem Befehl in eine Windows-App verwandeln:
            </p>

            <div className="bg-slate-900 text-slate-100 p-2.5 rounded-lg font-mono text-2xs overflow-x-auto select-all">
              npx @nativefier/nativefier --name "MatheLab" --icon public/icon.svg "https://ais-pre-mdeuksv7usf5w5iixvz6ns-296496115646.europe-west2.run.app"
            </div>

            <p className="text-2xs text-slate-500">
              Alternativ kannst du auch den offiziellen <strong>Microsoft PWABuilder</strong> (pwabuilder.com) nutzen, um eine fertige MSIX-Installationsdatei für den Microsoft Store zu erstellen.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="text-2xs text-slate-500">
            Kompatibel mit Windows 10 & Windows 11
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
