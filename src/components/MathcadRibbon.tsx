import React, { useState } from 'react';
import { BlockType } from '../types/mathcad';
import { 
  Calculator, 
  Type, 
  LineChart, 
  Grid, 
  Printer, 
  FolderOpen, 
  RotateCcw,
  RotateCw,
  Delete,
  ChevronDown,
  Trash2,
  LayoutGrid
} from 'lucide-react';
import { templates } from '../data/mathcadTemplates';

interface MathcadRibbonProps {
  onAddBlock: (type: BlockType, insertAtEnd?: boolean) => void;
  onInsertSymbol: (symbol: string) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  onLoadTemplate: (templateKey: string) => void;
  onClearWorksheet: () => void;
  onPrint: () => void;
  onAutoArrange: () => void;
  canUndo?: boolean;
  onUndo?: () => void;
  canRedo?: boolean;
  onRedo?: () => void;
  isPaletteOpen?: boolean;
  onTogglePalette?: () => void;
  isPaletteDocked?: boolean;
  onTogglePaletteDock?: () => void;
}

export const MathcadRibbon: React.FC<MathcadRibbonProps> = ({
  onAddBlock,
  onInsertSymbol,
  showGrid,
  onToggleGrid,
  onLoadTemplate,
  onClearWorksheet,
  onPrint,
  onAutoArrange,
  canUndo = false,
  onUndo,
  canRedo = false,
  onRedo,
  isPaletteOpen = true,
  onTogglePalette,
  isPaletteDocked = false,
  onTogglePaletteDock,
}) => {
  const [templateMenuOpen, setTemplateMenuOpen] = useState(false);

  const operators = [
    { label: ':=', insert: ' := ', desc: 'Zuweisung: Variable A := Wert B' },
    { label: '=', insert: ' =', desc: 'Auswerten: Ausdruck A = Ergebnis' },
    { label: 'a/b', insert: '/', desc: 'Bruch (horizontale Teilungslinie: Zähler A / Nenner B)' },
    { label: '√x', insert: 'sqrt()', desc: 'Quadratwurzel √x' },
    { label: 'x^y', insert: '^', desc: 'Potenz: Basis A ^ Exponent B' },
    { label: '·', insert: ' * ', desc: 'Multiplikation (A · B)' },
    { label: '+', insert: ' + ', desc: 'Addition (A + B)' },
    { label: '-', insert: ' - ', desc: 'Subtraktion (A - B)' },
    { label: '( )', insert: '()', desc: 'Klammern' },
    { label: 'abs', insert: 'abs()', desc: 'Betrag' },
    { label: 'π', insert: 'pi', desc: 'Kreiszahl Pi' },
    { label: 'e', insert: 'e', desc: 'Eulersche Zahl' },
    { label: 'sin', insert: 'sin()', desc: 'Sinus' },
    { label: 'cos', insert: 'cos()', desc: 'Kosinus' },
    { label: 'tan', insert: 'tan()', desc: 'Tangens' },
    { label: 'ln', insert: 'log()', desc: 'Natürlicher Logarithmus' },
  ];

  const units = [
    { label: 'm', insert: ' m' },
    { label: 'cm', insert: ' cm' },
    { label: 'mm', insert: ' mm' },
    { label: 'km', insert: ' km' },
    { label: 's', insert: ' s' },
    { label: 'h', insert: ' h' },
    { label: 'kg', insert: ' kg' },
    { label: 'N', insert: ' N' },
    { label: 'kN', insert: ' kN' },
    { label: 'MPa', insert: ' MPa' },
    { label: 'bar', insert: ' bar' },
    { label: 'J', insert: ' J' },
    { label: 'W', insert: ' W' },
    { label: 'kW', insert: ' kW' },
    { label: 'V', insert: ' V' },
    { label: 'A', insert: ' A' },
    { label: 'ohm', insert: ' ohm' },
    { label: 'deg', insert: ' deg' },
  ];

  return (
    <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Quick Insert Buttons & Undo / Redo */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onAddBlock('math')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg transition-colors shadow-2xs"
            title="Formelzeile einfügen (oder direkt irgendwo aufs Blatt klicken)"
          >
            <Calculator className="w-3.5 h-3.5 text-indigo-600" />
            <span>+ Formel (:=)</span>
          </button>

          <button
            onClick={() => onAddBlock('text')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg transition-colors shadow-2xs"
            title="Text- / Erläuterungszeile einfügen"
          >
            <Type className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">+ Text</span>
          </button>

          <button
            onClick={() => onAddBlock('plot')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg transition-colors shadow-2xs"
            title="2D Funktionsgraph einfügen"
          >
            <LineChart className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">+ 2D Plot</span>
          </button>

          {/* Undo (Rückgängig) & Redo */}
          <div className="flex items-center gap-0.5 border-l border-slate-200 pl-1.5 ml-0.5">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors border border-slate-200 disabled:opacity-35 disabled:cursor-not-allowed text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 active:bg-indigo-100 bg-white"
              title="Rückgängig machen (Strg+Z)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline font-sans">Rückgängig</span>
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="p-1.5 text-xs font-medium rounded-lg transition-colors border border-slate-200 disabled:opacity-35 disabled:cursor-not-allowed text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 active:bg-indigo-100 bg-white"
              title="Wiederholen (Strg+Y)"
            >
              <RotateCw className="w-3.5 h-3.5 text-indigo-600" />
            </button>
          </div>

          {/* Neu anordnen Button */}
          <button
            onClick={onAutoArrange}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 rounded-lg transition-colors ml-0.5"
            title="Alle Formeln und Bereiche ordentlich am Raster ausrichten"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden md:inline">Neu anordnen</span>
          </button>
        </div>

        {/* Center: Math Operators Palette Trigger & Quick Tools */}
        <div className="flex items-center gap-1.5 border-l border-r border-slate-200 px-3 overflow-x-auto max-w-full">
          {/* Floating Palette Toggle Button */}
          <button
            onClick={onTogglePalette}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              isPaletteOpen && !isPaletteDocked
                ? 'bg-slate-900 text-white border-slate-950 shadow-xs'
                : 'bg-white hover:bg-indigo-50 text-slate-800 border-slate-200 hover:border-indigo-300'
            }`}
            title={
              isPaletteOpen && !isPaletteDocked
                ? 'Schwebendes Operatoren-Fenster ist aktiv (Klicken zum Ein-/Ausblenden)'
                : 'Schwebendes Operatoren-Fenster öffnen'
            }
          >
            <span>📐 Operatoren-Palette</span>
            {isPaletteOpen && !isPaletteDocked ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" title="Aktiv" />
            ) : (
              <span className="text-3xs text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded border border-indigo-100 font-sans">
                Schwebend
              </span>
            )}
          </button>

          {/* If user docked palette, show full operators row. Otherwise, show essentials */}
          {isPaletteDocked ? (
            <>
              {operators.map((op) => (
                <button
                  key={op.label}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onInsertSymbol(op.insert)}
                  className="px-2 py-1 text-xs font-mono font-medium rounded hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 transition-colors shrink-0 cursor-pointer"
                  title={op.desc}
                >
                  {op.label}
                </button>
              ))}
            </>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onInsertSymbol(' := ')}
                className="px-2 py-1 text-xs font-mono font-bold rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-800 transition-colors cursor-pointer"
                title="Zuweisung / Definition (:=)"
              >
                :=
              </button>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onInsertSymbol(' =')}
                className="px-2 py-1 text-xs font-mono font-bold rounded bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-800 transition-colors cursor-pointer"
                title="Auswerten (=)"
              >
                =
              </button>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onInsertSymbol('/')}
                className="px-2 py-1 text-xs font-mono font-bold rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-800 transition-colors cursor-pointer"
                title="Bruch (a/b): Zähler A eingeben, dann Tab, / oder Pfeiltasten für Nenner B"
              >
                a/b
              </button>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onInsertSymbol('sqrt()')}
                className="px-1.5 py-1 text-xs font-mono rounded hover:bg-slate-100 text-slate-700 transition-colors hidden lg:inline cursor-pointer"
                title="Wurzel √x (Cursor im Radikanden A)"
              >
                √x
              </button>
            </div>
          )}

          {/* Dedicated Rücktaste (Backspace) button */}
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onInsertSymbol('BACKSPACE')}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 border border-rose-200 transition-colors ml-1 shrink-0 shadow-2xs cursor-pointer"
            title="Rücktaste: Letztes Zeichen oder Operator aus Formel löschen (Backspace)"
          >
            <Delete className="w-3.5 h-3.5 text-rose-600" />
            <span>⌫ Rücktaste</span>
          </button>

          {isPaletteDocked && (
            <div className="hidden xl:flex items-center gap-1 ml-1 border-l border-slate-200 pl-2">
              {units.slice(0, 8).map((u) => (
                <button
                  key={u.label}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onInsertSymbol(u.insert)}
                  className="px-1.5 py-0.5 text-2xs font-mono rounded hover:bg-slate-100 text-slate-600 transition-colors shrink-0 cursor-pointer"
                  title={`Einheit ${u.label} einfügen`}
                >
                  {u.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Worksheet Controls & Templates */}
        <div className="flex items-center gap-2">
          {/* Template Dropdown */}
          <div className="relative">
            <button
              onClick={() => setTemplateMenuOpen(!templateMenuOpen)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <FolderOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Vorlagen</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {templateMenuOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50">
                <div className="px-3 py-1 text-2xs font-semibold text-slate-400 uppercase tracking-wider">
                  Beispiel-Arbeitsblätter:
                </div>
                {Object.entries(templates).map(([key, t]) => (
                  <button
                    key={key}
                    onClick={() => {
                      onLoadTemplate(key);
                      setTemplateMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 text-slate-800 hover:text-indigo-900 transition-colors block"
                  >
                    <div className="font-semibold">{t.title}</div>
                    <div className="text-2xs text-slate-500 truncate">{t.description}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Grid Toggle */}
          <button
            onClick={onToggleGrid}
            className={`p-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1 ${
              showGrid
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title={showGrid ? 'Karogitter ausblenden' : 'Karogitter einblenden'}
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Gitter</span>
          </button>

          {/* Print / PDF */}
          <button
            onClick={onPrint}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
            title="Drucken / PDF exportieren"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>

          {/* Clear */}
          <button
            onClick={() => {
              if (window.confirm('Möchtest du das gesamte Arbeitsblatt wirklich leeren?')) {
                onClearWorksheet();
              }
            }}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
            title="Arbeitsblatt leeren"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
