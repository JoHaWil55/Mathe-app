import React from 'react';
import { X, HelpCircle, Check, Sparkles } from 'lucide-react';

interface MathcadHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MathcadHelpModal: React.FC<MathcadHelpModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-lg">
              Mathcad-Kurzanleitung & Syntax
            </h3>
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
          {/* 1. Variable Assignment */}
          <div>
            <h4 className="font-bold text-slate-900 text-base mb-1.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">1</span>
              <span>Variablen definieren mit dem Definitionsoperator :=</span>
            </h4>
            <p className="text-slate-600 mb-2">
              In Mathcad definiert man Variablen mit dem Doppelpunkt-Gleich-Zeichen (<code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-indigo-700 font-bold">:=</code>):
            </p>
            <div className="space-y-1 font-mono text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="text-slate-800"><span className="text-indigo-600 font-bold">L :=</span> 6 m</div>
              <div className="text-slate-800"><span className="text-indigo-600 font-bold">F :=</span> 25 kN</div>
              <div className="text-slate-800"><span className="text-indigo-600 font-bold">M_max :=</span> (F * L) / 4 <span className="text-emerald-700 font-bold ml-2">= 37.5 kN m</span></div>
            </div>
          </div>

          {/* 2. Units */}
          <div>
            <h4 className="font-bold text-slate-900 text-base mb-1.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">2</span>
              <span>Physikalische Einheiten (Units)</span>
            </h4>
            <p className="text-slate-600 mb-2">
              Einheiten werden automatisch verrechnet, geprüft und gekürzt:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-700 block mb-0.5">Länge & Zeit:</span>
                <span className="font-mono text-slate-600">m, cm, mm, km, s, min, h</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-700 block mb-0.5">Kraft, Masse & Druck:</span>
                <span className="font-mono text-slate-600">N, kN, kg, g, Pa, MPa, bar</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-700 block mb-0.5">Energie & Leistung:</span>
                <span className="font-mono text-slate-600">J, kJ, W, kW, kWh</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-700 block mb-0.5">Elektrotechnik & Winkel:</span>
                <span className="font-mono text-slate-600">V, A, ohm, Hz, deg, rad</span>
              </div>
            </div>
          </div>

          {/* 3. Functions & Plots */}
          <div>
            <h4 className="font-bold text-slate-900 text-base mb-1.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">3</span>
              <span>Funktionen und 2D-Funktionsgraphen</span>
            </h4>
            <p className="text-slate-600 mb-2">
              Du kannst eigene Funktionen definieren und im Arbeitsblatt plotten:
            </p>
            <div className="space-y-1 font-mono text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="text-slate-800"><span className="text-indigo-600 font-bold">f(x) :=</span> x^2 - 4*x + 3</div>
              <div className="text-slate-800"><span className="text-indigo-600 font-bold">f(5) =</span> 8</div>
            </div>
          </div>

          {/* 4. Mathematische Operatoren */}
          <div>
            <h4 className="font-bold text-slate-900 text-base mb-1.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">4</span>
              <span>Mathematische Funktionen & Konstanten</span>
            </h4>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              <span className="bg-slate-100 px-2 py-1 rounded">sqrt(x)</span>
              <span className="bg-slate-100 px-2 py-1 rounded">sin(x), cos(x), tan(x)</span>
              <span className="bg-slate-100 px-2 py-1 rounded">pi = 3.1415...</span>
              <span className="bg-slate-100 px-2 py-1 rounded">e = 2.718...</span>
              <span className="bg-slate-100 px-2 py-1 rounded">log(x), ln(x)</span>
              <span className="bg-slate-100 px-2 py-1 rounded">abs(x)</span>
            </div>
          </div>

          {/* 5. Bruchrechnung a/b */}
          <div>
            <h4 className="font-bold text-slate-900 text-base mb-1.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">5</span>
              <span>Bruchrechnung mit horizontalem Bruchstrich (a/b)</span>
            </h4>
            <p className="text-slate-600 mb-2">
              Beim Klick auf den Operator <code className="font-mono bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold">a/b</code> startet der Cursor direkt im <strong>Zähler A</strong>.
            </p>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <div>• <strong>Zähler (A) eingeben:</strong> z. B. <code className="font-mono bg-white px-1 border rounded">24</code></div>
              <div>• <strong>Zum Nenner (B) springen:</strong> Drücke <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono shadow-2xs">Tab</kbd>, <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono shadow-2xs">/</kbd> oder <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono shadow-2xs">↓</kbd> (oder klicke auf die Schaltfläche [Nenner B])</div>
              <div>• <strong>Zurück zum Zähler (A):</strong> Drücke <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono shadow-2xs">↑</kbd> oder <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono shadow-2xs">Shift+Tab</kbd> (oder klicke auf [Zähler A])</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Verstanden
          </button>
        </div>
      </div>
    </div>
  );
};
