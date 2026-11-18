import React, { useState } from 'react';
import { sounds } from '../utils/audio';
import { Eye, EyeOff, Sparkles, Check, HelpCircle } from 'lucide-react';

export const TimesTable: React.FC = () => {
  const [gridSize, setGridSize] = useState<number>(10);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>({ row: 6, col: 7 });
  const [activeTab, setActiveTab] = useState<'explore' | 'rowDrill' | 'quiz'>('explore');

  // Row drill state
  const [drillRow, setDrillRow] = useState<number>(7);
  const [drillStep, setDrillStep] = useState<number>(1);
  const [drillInput, setDrillInput] = useState<string>('');
  const [drillFeedback, setDrillFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');

  // Hidden mode state for 1x1 table
  const [hideMode, setHideMode] = useState<boolean>(false);
  const [revealedCells, setRevealedCells] = useState<Record<string, boolean>>({});

  const handleCellClick = (r: number, c: number) => {
    sounds.playClick();
    setSelectedCell({ row: r, col: c });
    const key = `${r}-${c}`;
    if (hideMode) {
      setRevealedCells((prev) => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const handleDrillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const expected = drillRow * drillStep;
    const answer = parseInt(drillInput.trim(), 10);

    if (answer === expected) {
      sounds.playCorrect();
      setDrillFeedback('correct');
      setTimeout(() => {
        if (drillStep < 10) {
          setDrillStep((s) => s + 1);
          setDrillInput('');
          setDrillFeedback('idle');
        } else {
          setDrillFeedback('correct');
        }
      }, 500);
    } else {
      sounds.playWrong();
      setDrillFeedback('wrong');
    }
  };

  const numbers = Array.from({ length: gridSize }, (_, i) => i + 1);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
      {/* Header bar inside Times Table */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Das Einmaleins (1×1)</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Muster erkennen, Reihen trainieren und geometrische Flächen visualisieren.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Tab Selector */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => {
                setActiveTab('explore');
                sounds.playClick();
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'explore'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tabelle & Fläche
            </button>
            <button
              onClick={() => {
                setActiveTab('rowDrill');
                sounds.playClick();
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'rowDrill'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Reihen-Trainer
            </button>
          </div>

          {/* Grid Size Switcher */}
          <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
            <button
              onClick={() => setGridSize(10)}
              className={`px-2 py-1 text-xs font-medium rounded-md ${
                gridSize === 10 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              10×10
            </button>
            <button
              onClick={() => setGridSize(12)}
              className={`px-2 py-1 text-xs font-medium rounded-md ${
                gridSize === 12 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              12×12
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'explore' && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Grid */}
          <div className="lg:col-span-8 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-600">
                Klicke auf ein Feld, um das Produkt zu visualisieren:
              </span>
              <button
                onClick={() => {
                  setHideMode(!hideMode);
                  sounds.playClick();
                  if (hideMode) setRevealedCells({});
                }}
                className="text-xs font-medium text-slate-600 hover:text-indigo-600 flex items-center gap-1.5"
              >
                {hideMode ? <Eye className="w-4 h-4 text-indigo-600" /> : <EyeOff className="w-4 h-4" />}
                <span>{hideMode ? 'Werte einblenden' : 'Verdeckt üben (Memory)'}</span>
              </button>
            </div>

            <div className="inline-block min-w-full">
              <div
                className="grid gap-1 font-mono text-center text-xs sm:text-sm select-none"
                style={{
                  gridTemplateColumns: `auto repeat(${gridSize}, minmax(${gridSize > 10 ? '2.1rem' : '2.5rem'}, 1fr))`,
                }}
              >
                {/* Top-left corner */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-bold text-slate-400 bg-slate-100 rounded-lg">
                  ×
                </div>

                {/* Column Headers */}
                {numbers.map((col) => {
                  const isHighlighted = selectedCell && selectedCell.col === col;
                  return (
                    <div
                      key={`col-${col}`}
                      className={`h-8 sm:h-10 flex items-center justify-center font-bold rounded-lg transition-colors ${
                        isHighlighted
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {col}
                    </div>
                  );
                })}

                {/* Rows */}
                {numbers.map((row) => (
                  <React.Fragment key={`row-wrap-${row}`}>
                    {/* Row Header */}
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-bold rounded-lg transition-colors ${
                        selectedCell && selectedCell.row === row
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {row}
                    </div>

                    {/* Cells */}
                    {numbers.map((col) => {
                      const isSelected = selectedCell && selectedCell.row === row && selectedCell.col === col;
                      const isInRect =
                        selectedCell && row <= selectedCell.row && col <= selectedCell.col;
                      const isSquare = row === col;
                      const key = `${row}-${col}`;
                      const isHidden = hideMode && !revealedCells[key] && !isSelected;

                      return (
                        <button
                          key={key}
                          onClick={() => handleCellClick(row, col)}
                          className={`h-8 sm:h-10 rounded-lg font-mono font-medium transition-all text-xs sm:text-sm tabular-nums flex items-center justify-center border ${
                            isSelected
                              ? 'bg-indigo-700 text-white border-indigo-700 scale-105 shadow-md z-10'
                              : isInRect
                              ? 'bg-indigo-100/70 text-indigo-900 border-indigo-200'
                              : isSquare
                              ? 'bg-amber-50 text-amber-900 border-amber-200/80 font-bold'
                              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-100'
                          }`}
                          title={`${row} × ${col} = ${row * col}`}
                        >
                          {isHidden ? '?' : row * col}
                        </button>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="mt-4 text-xs text-slate-400 flex items-center gap-4">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300 inline-block" />
                <span>Quadratzahlen (z.B. 6×6=36)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-indigo-100 border border-indigo-300 inline-block" />
                <span>Aufgespannte Fläche</span>
              </span>
            </div>
          </div>

          {/* Right Column: Visual Explanation & Geometry of Multiplication */}
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            {selectedCell ? (
              <>
                <div className="border-b border-slate-100 pb-4">
                  <div className="text-xs uppercase font-semibold text-indigo-600 tracking-wider">
                    Aktuelle Multiplikation
                  </div>
                  <div className="text-4xl font-mono font-extrabold text-slate-900 mt-1 tabular-nums">
                    {selectedCell.row} × {selectedCell.col} = {selectedCell.row * selectedCell.col}
                  </div>
                  <div className="text-xs text-slate-500 mt-2">
                    Bedeutung: {selectedCell.row} Reihen mit jeweils {selectedCell.col} Elementen.
                  </div>
                </div>

                {/* Geometric Grid Visualization */}
                <div>
                  <div className="text-xs font-semibold text-slate-700 mb-2">
                    Flächenmodell ({selectedCell.row} × {selectedCell.col}):
                  </div>
                  <div
                    className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 max-h-56 overflow-hidden flex items-center justify-center"
                  >
                    <div
                      className="grid gap-1"
                      style={{
                        gridTemplateColumns: `repeat(${selectedCell.col}, minmax(0, 1fr))`,
                      }}
                    >
                      {Array.from({ length: selectedCell.row * selectedCell.col }).map((_, idx) => (
                        <div
                          key={idx}
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-indigo-500 rounded-xs transition-transform"
                          title={`Kästchen ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mathematical Insight / Properties */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 space-y-1.5">
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Mathe-Wissen:</span>
                  </div>
                  <p>
                    <span className="font-semibold text-slate-700">Kommutativgesetz:</span>{' '}
                    {selectedCell.row} × {selectedCell.col} ist genau so viel wie{' '}
                    {selectedCell.col} × {selectedCell.row} ({selectedCell.row * selectedCell.col}).
                  </p>
                  {selectedCell.row === selectedCell.col && (
                    <p className="text-amber-800 font-medium">
                      Dies ist eine Quadratzahl: {selectedCell.row}² = {selectedCell.row * selectedCell.col}.
                    </p>
                  )}
                  {selectedCell.row % 2 === 0 && (
                    <p>
                      Da {selectedCell.row} gerade ist, ist das Ergebnis ({selectedCell.row * selectedCell.col}) ebenfalls gerade.
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <p>Wähle ein Feld in der Tabelle aus.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Row Drill Mode */}
      {activeTab === 'rowDrill' && (
        <div className="mt-6 max-w-xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="mb-6">
            <label className="text-xs font-semibold text-slate-600 block mb-2">
              Wähle eine Reihe zum Trainieren:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    setDrillRow(num);
                    setDrillStep(1);
                    setDrillInput('');
                    setDrillFeedback('idle');
                    sounds.playClick();
                  }}
                  className={`w-9 h-9 rounded-lg font-mono font-bold text-sm transition-colors ${
                    drillRow === num
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center">
            <div className="text-xs text-slate-500 mb-1 font-medium">
              Die {drillRow}er-Reihe: Schritt {drillStep} von 10
            </div>
            <div className="text-5xl font-mono font-extrabold text-slate-900 my-4 tabular-nums">
              {drillStep} × {drillRow} = ?
            </div>

            <form onSubmit={handleDrillSubmit} className="max-w-xs mx-auto flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={drillInput}
                onChange={(e) => setDrillInput(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Ergebnis..."
                className={`w-full text-center text-2xl font-mono font-bold py-2.5 px-3 rounded-xl border-2 outline-none ${
                  drillFeedback === 'correct'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                    : drillFeedback === 'wrong'
                    ? 'border-rose-500 bg-rose-50 text-rose-900'
                    : 'border-slate-300 focus:border-indigo-600 bg-white'
                }`}
                autoFocus
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
              >
                Prüfen
              </button>
            </form>

            {drillFeedback === 'correct' && (
              <div className="mt-3 text-sm font-semibold text-emerald-600 flex items-center justify-center gap-1">
                <Check className="w-4 h-4" />
                <span>Klasse! {drillStep} × {drillRow} = {drillStep * drillRow}</span>
              </div>
            )}
            {drillFeedback === 'wrong' && (
              <div className="mt-3 text-sm font-semibold text-rose-600">
                Tipp: Noch einmal nachrechnen ({drillStep} mal {drillRow})
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
