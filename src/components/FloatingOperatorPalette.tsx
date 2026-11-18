import React, { useState, useEffect, useRef } from 'react';
import { 
  GripHorizontal, 
  Minus, 
  Square, 
  X, 
  Delete, 
  Maximize2, 
  Minimize2,
  Move,
  Pin,
  RotateCcw
} from 'lucide-react';

interface FloatingOperatorPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertSymbol: (symbol: string) => void;
  isDocked?: boolean;
  onToggleDock?: () => void;
}

type PaletteTab = 'basis' | 'analysis' | 'greek' | 'funktionen' | 'einheiten';

export const FloatingOperatorPalette: React.FC<FloatingOperatorPaletteProps> = ({
  isOpen,
  onClose,
  onInsertSymbol,
  isDocked = false,
  onToggleDock,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<PaletteTab>('basis');

  // Initial position calculation (top-right of worksheet)
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    try {
      const saved = localStorage.getItem('mathcad_palette_pos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return parsed;
        }
      }
    } catch {}
    const defaultX = typeof window !== 'undefined' ? Math.max(20, window.innerWidth - 370) : 800;
    return { x: defaultX, y: 125 };
  });

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
  });

  // Save position to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('mathcad_palette_pos', JSON.stringify(position));
    } catch {}
  }, [position]);

  // Keep palette in visible viewport bounds on resize
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => ({
        x: Math.min(Math.max(10, prev.x), Math.max(10, window.innerWidth - 340)),
        y: Math.min(Math.max(60, prev.y), Math.max(60, window.innerHeight - 80)),
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only drag from the header itself, not from buttons
    if ((e.target as HTMLElement).closest('button')) return;

    isDraggingRef.current = true;
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: position.x,
      startY: position.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - dragStartRef.current.mouseX;
    const deltaY = e.clientY - dragStartRef.current.mouseY;

    const newX = Math.min(
      Math.max(10, dragStartRef.current.startX + deltaX),
      window.innerWidth - 100
    );
    const newY = Math.min(
      Math.max(50, dragStartRef.current.startY + deltaY),
      window.innerHeight - 50
    );

    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handleResetPosition = () => {
    const defaultX = Math.max(20, window.innerWidth - 370);
    setPosition({ x: defaultX, y: 125 });
  };

  if (!isOpen || isDocked) return null;

  // Symbol sets
  const basisOperators = [
    { label: ':=', insert: ' := ', desc: 'Zuweisung: Variable A := Wert B', highlight: true },
    { label: '=', insert: ' =', desc: 'Auswerten: Ausdruck A = Ergebnis', highlight: true },
    { label: 'a/b', insert: '/', desc: 'Bruch: Zähler A / Nenner B (Wechsel mit Tab, / oder Pfeiltasten)', highlight: true },
    { label: '√x', insert: 'sqrt()', desc: 'Quadratwurzel √x (Cursor direkt im Radikanden A)' },
    { label: 'x^y', insert: '^', desc: 'Potenz: Basis A ^ Exponent B' },
    { label: '·', insert: ' * ', desc: 'Multiplikationspunkt (A · B)' },
    { label: '+', insert: ' + ', desc: 'Addition (A + B)' },
    { label: '-', insert: ' - ', desc: 'Subtraktion (A - B)' },
    { label: '( )', insert: '()', desc: 'Klammern (Cursor direkt innen)' },
    { label: '|x|', insert: 'abs()', desc: 'Betrag |x|' },
    { label: 'x²', insert: '^2', desc: 'Quadrat (Basis A ^ 2)' },
    { label: '%', insert: ' %', desc: 'Prozent' },
  ];

  const analysisOperators = [
    { label: 'd/dx', insert: 'd/dx ()', desc: 'Ableitung nach x: d/dx (A)' },
    { label: '∫ dx', insert: 'integral()', desc: 'Integral ∫ A dx' },
    { label: '∑', insert: 'sum()', desc: 'Summenzeichen ∑ A' },
    { label: '∏', insert: 'product()', desc: 'Produktzeichen ∏ A' },
    { label: 'lim', insert: 'lim()', desc: 'Grenzwert lim A' },
    { label: '±', insert: ' +- ', desc: 'Plus-Minus' },
    { label: '≠', insert: ' != ', desc: 'Ungleich' },
    { label: '≤', insert: ' <= ', desc: 'Kleiner oder gleich' },
    { label: '≥', insert: ' >= ', desc: 'Größer oder gleich' },
  ];

  const greekSymbols = [
    { label: 'π', insert: 'pi', desc: 'Kreiszahl Pi (3.1415...)' },
    { label: 'e', insert: 'e', desc: 'Eulersche Zahl (2.7182...)' },
    { label: 'α', insert: 'alpha', desc: 'Alpha' },
    { label: 'β', insert: 'beta', desc: 'Beta' },
    { label: 'γ', insert: 'gamma', desc: 'Gamma' },
    { label: 'δ', insert: 'delta', desc: 'Delta' },
    { label: 'ε', insert: 'epsilon', desc: 'Epsilon' },
    { label: 'θ', insert: 'theta', desc: 'Theta' },
    { label: 'λ', insert: 'lambda', desc: 'Lambda' },
    { label: 'μ', insert: 'mu', desc: 'My' },
    { label: 'σ', insert: 'sigma', desc: 'Sigma (Spannung)' },
    { label: 'φ', insert: 'phi', desc: 'Phi (Winkel)' },
    { label: 'ω', insert: 'omega', desc: 'Omega (Kreisfrequenz)' },
    { label: 'Δ', insert: 'Delta', desc: 'Differenz / Delta' },
  ];

  const functions = [
    { label: 'sin', insert: 'sin()', desc: 'Sinus' },
    { label: 'cos', insert: 'cos()', desc: 'Kosinus' },
    { label: 'tan', insert: 'tan()', desc: 'Tangens' },
    { label: 'asin', insert: 'asin()', desc: 'Arkussinus' },
    { label: 'acos', insert: 'acos()', desc: 'Arkuskosinus' },
    { label: 'atan', insert: 'atan()', desc: 'Arkustangens' },
    { label: 'ln', insert: 'log()', desc: 'Natürlicher Logarithmus' },
    { label: 'log', insert: 'log10()', desc: 'Dekadischer Logarithmus' },
    { label: 'exp', insert: 'exp()', desc: 'Exponentialfunktion' },
    { label: 'round', insert: 'round()', desc: 'Runden' },
    { label: 'min', insert: 'min()', desc: 'Minimum' },
    { label: 'max', insert: 'max()', desc: 'Maximum' },
  ];

  const units = [
    { label: 'm', insert: ' m', desc: 'Meter (Länge)' },
    { label: 'cm', insert: ' cm', desc: 'Zentimeter' },
    { label: 'mm', insert: ' mm', desc: 'Millimeter' },
    { label: 'km', insert: ' km', desc: 'Kilometer' },
    { label: 's', insert: ' s', desc: 'Sekunden (Zeit)' },
    { label: 'h', insert: ' h', desc: 'Stunden' },
    { label: 'kg', insert: ' kg', desc: 'Kilogramm (Masse)' },
    { label: 'N', insert: ' N', desc: 'Newton (Kraft)' },
    { label: 'kN', insert: ' kN', desc: 'Kilonewton' },
    { label: 'MPa', insert: ' MPa', desc: 'Megapascal (Spannung)' },
    { label: 'bar', insert: ' bar', desc: 'Bar (Druck)' },
    { label: 'J', insert: ' J', desc: 'Joule (Energie)' },
    { label: 'W', insert: ' W', desc: 'Watt (Leistung)' },
    { label: 'kW', insert: ' kW', desc: 'Kilowatt' },
    { label: 'V', insert: ' V', desc: 'Volt (Spannung)' },
    { label: 'A', insert: ' A', desc: 'Ampere (Strom)' },
    { label: 'ohm', insert: ' ohm', desc: 'Ohm (Widerstand)' },
    { label: 'deg', insert: ' deg', desc: 'Grad (Winkel)' },
  ];

  return (
    <div
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
      }}
      className="fixed top-0 left-0 z-40 w-84 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-300 select-none overflow-hidden transition-shadow duration-150 ring-1 ring-black/5"
    >
      {/* 1. Draggable Window Titlebar */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white cursor-grab active:cursor-grabbing border-b border-slate-700"
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="w-4 h-4 text-indigo-300 opacity-80" />
          <span className="font-semibold text-xs tracking-wide flex items-center gap-1.5 text-slate-100">
            <span>📐 Operatoren-Palette</span>
            <span className="text-3xs bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-1 py-0.2 rounded font-mono">
              Mathcad
            </span>
          </span>
        </div>

        {/* Window action controls */}
        <div className="flex items-center gap-1">
          {onToggleDock && (
            <button
              onClick={onToggleDock}
              className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded transition-colors"
              title="Oben an die Menüleiste andocken"
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded transition-colors"
            title={isMinimized ? 'Palette vergrößern' : 'Palette minimieren'}
          >
            {isMinimized ? <Square className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onClose}
            className="p-1 text-slate-300 hover:text-rose-300 hover:bg-rose-500/20 rounded transition-colors"
            title="Schließen"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Body content when not minimized */}
      {!isMinimized && (
        <div className="p-2.5 flex flex-col gap-2.5 text-xs bg-slate-50/80">
          {/* Quick Primary Row: := , = , a/b , √x , x^y + ⌫ Rücktaste */}
          <div className="bg-white p-2 rounded-lg border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-3xs uppercase font-bold text-slate-400 tracking-wider">
                Schnellzugriff & Editieren
              </span>
              <span className="text-3xs text-slate-400 font-mono">Klick = Einfügen</span>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onInsertSymbol(' := ')}
                className="py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold font-mono rounded border border-indigo-200 text-center transition-all shadow-2xs hover:scale-102 cursor-pointer"
                title="Definition / Zuweisung (:=)"
              >
                :=
              </button>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onInsertSymbol(' =')}
                className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold font-mono rounded border border-emerald-200 text-center transition-all shadow-2xs hover:scale-102 cursor-pointer"
                title="Ergebnis berechnen (=)"
              >
                =
              </button>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onInsertSymbol('/')}
                className="py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold font-mono rounded border border-indigo-200 text-center transition-all shadow-2xs hover:scale-102 cursor-pointer"
                title="Bruch: Zähler A / Nenner B (Wechsel mit Tab, / oder Pfeiltasten)"
              >
                a/b
              </button>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onInsertSymbol('sqrt()')}
                className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold font-mono rounded border border-slate-200 text-center transition-all hover:scale-102 cursor-pointer"
                title="Wurzel √x (Cursor im Radikanden A)"
              >
                √x
              </button>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onInsertSymbol('^')}
                className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold font-mono rounded border border-slate-200 text-center transition-all hover:scale-102 cursor-pointer"
                title="Potenz x^y"
              >
                x^y
              </button>
            </div>

            {/* Rücktaste (Backspace) Action Bar */}
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5">
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onInsertSymbol('BACKSPACE')}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-md border border-rose-200 transition-all shadow-2xs hover:scale-101 cursor-pointer"
                title="Rücktaste: Letztes Zeichen löschen oder ausgewählten Block entfernen"
              >
                <Delete className="w-3.5 h-3.5 text-rose-600" />
                <span>⌫ Rücktaste (Löschen)</span>
              </button>
            </div>
          </div>

          {/* Palette Category Tabs */}
          <div className="flex border-b border-slate-200 text-2xs font-semibold gap-1 bg-white p-1 rounded-lg border">
            <button
              onClick={() => setActiveTab('basis')}
              className={`flex-1 py-1 rounded text-center transition-colors ${
                activeTab === 'basis'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Basis
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`flex-1 py-1 rounded text-center transition-colors ${
                activeTab === 'analysis'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Analysis
            </button>
            <button
              onClick={() => setActiveTab('greek')}
              className={`flex-1 py-1 rounded text-center transition-colors ${
                activeTab === 'greek'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Griechisch
            </button>
            <button
              onClick={() => setActiveTab('funktionen')}
              className={`flex-1 py-1 rounded text-center transition-colors ${
                activeTab === 'funktionen'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Funkt.
            </button>
            <button
              onClick={() => setActiveTab('einheiten')}
              className={`flex-1 py-1 rounded text-center transition-colors ${
                activeTab === 'einheiten'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Einheit
            </button>
          </div>

          {/* Tab Panel Content */}
          <div className="bg-white p-2.5 rounded-lg border border-slate-200/90 shadow-2xs min-h-[140px] max-h-[220px] overflow-y-auto">
            {activeTab === 'basis' && (
              <div className="grid grid-cols-4 gap-1.5">
                {basisOperators.map((op) => (
                  <button
                    key={op.label}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onInsertSymbol(op.insert)}
                    className="p-1.5 text-xs font-mono font-medium rounded bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-800 border border-slate-200 hover:border-indigo-300 transition-colors text-center cursor-pointer"
                    title={op.desc}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'analysis' && (
              <div className="grid grid-cols-3 gap-1.5">
                {analysisOperators.map((op) => (
                  <button
                    key={op.label}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onInsertSymbol(op.insert)}
                    className="p-1.5 text-xs font-mono font-medium rounded bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-800 border border-slate-200 hover:border-indigo-300 transition-colors text-center cursor-pointer"
                    title={op.desc}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'greek' && (
              <div className="grid grid-cols-4 gap-1.5">
                {greekSymbols.map((s) => (
                  <button
                    key={s.label}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onInsertSymbol(s.insert)}
                    className="p-1.5 text-xs font-serif font-bold rounded bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-800 border border-slate-200 hover:border-indigo-300 transition-colors text-center cursor-pointer"
                    title={s.desc}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'funktionen' && (
              <div className="grid grid-cols-3 gap-1.5">
                {functions.map((fn) => (
                  <button
                    key={fn.label}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onInsertSymbol(fn.insert)}
                    className="p-1.5 text-xs font-mono font-medium rounded bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-800 border border-slate-200 hover:border-indigo-300 transition-colors text-center cursor-pointer"
                    title={fn.desc}
                  >
                    {fn.label}
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'einheiten' && (
              <div className="grid grid-cols-3 gap-1.5">
                {units.map((u) => (
                  <button
                    key={u.label}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onInsertSymbol(u.insert)}
                    className="p-1.5 text-xs font-mono font-medium rounded bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-800 border border-slate-200 hover:border-indigo-300 transition-colors text-center cursor-pointer"
                    title={u.desc}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick hint and position reset footer */}
          <div className="flex items-center justify-between text-3xs text-slate-400 px-1">
            <span>Am blauen Kopf verschiebbar</span>
            <button
              onClick={handleResetPosition}
              className="hover:text-indigo-600 transition-colors underline flex items-center gap-0.5"
              title="Position zurücksetzen"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Position</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
