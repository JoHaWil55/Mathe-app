import React, { useState, useMemo } from 'react';
import { 
  solveWrittenAddition, 
  solveWrittenSubtraction, 
  solveWrittenMultiplication, 
  solveWrittenDivision,
  WrittenStep 
} from '../utils/writtenMath';
import { sounds } from '../utils/audio';
import { 
  Plus, 
  Minus, 
  X, 
  Divide, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  Shuffle, 
  HelpCircle 
} from 'lucide-react';

type WrittenOp = 'add' | 'sub' | 'mul' | 'div';

export const WrittenArithmetic: React.FC = () => {
  const [op, setOp] = useState<WrittenOp>('add');
  const [numA, setNumA] = useState<number>(487);
  const [numB, setNumB] = useState<number>(365);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1); // -1 = show all

  const handleRandomize = () => {
    sounds.playClick();
    if (op === 'add') {
      setNumA(Math.floor(Math.random() * 800) + 120);
      setNumB(Math.floor(Math.random() * 800) + 120);
    } else if (op === 'sub') {
      const top = Math.floor(Math.random() * 800) + 200;
      const bottom = Math.floor(Math.random() * (top - 50)) + 50;
      setNumA(top);
      setNumB(bottom);
    } else if (op === 'mul') {
      setNumA(Math.floor(Math.random() * 400) + 50);
      setNumB(Math.floor(Math.random() * 40) + 12);
    } else {
      const divisor = Math.floor(Math.random() * 7) + 3;
      const quotient = Math.floor(Math.random() * 180) + 25;
      setNumA(divisor * quotient);
      setNumB(divisor);
    }
    setCurrentStepIndex(-1);
  };

  // Calculations
  const additionData = useMemo(() => {
    if (op !== 'add') return null;
    return solveWrittenAddition(numA, numB);
  }, [op, numA, numB]);

  const subtractionData = useMemo(() => {
    if (op !== 'sub') return null;
    return solveWrittenSubtraction(numA, numB);
  }, [op, numA, numB]);

  const multiplicationData = useMemo(() => {
    if (op !== 'mul') return null;
    return solveWrittenMultiplication(numA, numB);
  }, [op, numA, numB]);

  const divisionData = useMemo(() => {
    if (op !== 'div') return null;
    return solveWrittenDivision(numA, numB);
  }, [op, numA, numB]);

  const activeSteps: WrittenStep[] = useMemo(() => {
    if (op === 'add' && additionData) return additionData.steps;
    if (op === 'sub' && subtractionData) return subtractionData.steps;
    if (op === 'mul' && multiplicationData) return multiplicationData.steps;
    if (op === 'div' && divisionData) return divisionData.steps;
    return [];
  }, [op, additionData, subtractionData, multiplicationData, divisionData]);

  const totalSteps = activeSteps.length;
  const isStepMode = currentStepIndex >= 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Schriftliches Rechnen</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Schritt-für-Schritt Rechenwege auf Schul-Rechenkästchen mit Überträgen.
          </p>
        </div>

        {/* Operation Picker */}
        <div className="flex items-center p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => {
              setOp('add');
              sounds.playClick();
              setCurrentStepIndex(-1);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors ${
              op === 'add' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Addition</span>
          </button>
          <button
            onClick={() => {
              setOp('sub');
              sounds.playClick();
              if (numB > numA) {
                const temp = numA;
                setNumA(numB);
                setNumB(temp);
              }
              setCurrentStepIndex(-1);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors ${
              op === 'sub' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Minus className="w-3.5 h-3.5" />
            <span>Subtraktion</span>
          </button>
          <button
            onClick={() => {
              setOp('mul');
              sounds.playClick();
              setCurrentStepIndex(-1);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors ${
              op === 'mul' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <X className="w-3.5 h-3.5" />
            <span>Multiplikation</span>
          </button>
          <button
            onClick={() => {
              setOp('div');
              sounds.playClick();
              setNumA(876);
              setNumB(4);
              setCurrentStepIndex(-1);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors ${
              op === 'div' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Divide className="w-3.5 h-3.5" />
            <span>Division</span>
          </button>
        </div>
      </div>

      {/* Input row & quick action */}
      <div className="py-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Zahl 1:</span>
            <input
              type="number"
              min="1"
              max="99999"
              value={numA}
              onChange={(e) => {
                const val = Math.max(1, Math.min(999999, parseInt(e.target.value, 10) || 1));
                setNumA(val);
                setCurrentStepIndex(-1);
              }}
              className="w-24 px-2.5 py-1 text-sm font-mono font-semibold rounded-lg border border-slate-200 bg-white text-slate-900"
            />
          </div>

          <span className="font-mono text-base font-bold text-slate-400">
            {op === 'add' ? '+' : op === 'sub' ? '−' : op === 'mul' ? '·' : ':'}
          </span>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Zahl 2:</span>
            <input
              type="number"
              min="1"
              max="99999"
              value={numB}
              onChange={(e) => {
                const val = Math.max(1, Math.min(999999, parseInt(e.target.value, 10) || 1));
                setNumB(val);
                setCurrentStepIndex(-1);
              }}
              className="w-24 px-2.5 py-1 text-sm font-mono font-semibold rounded-lg border border-slate-200 bg-white text-slate-900"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRandomize}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Shuffle className="w-3.5 h-3.5 text-indigo-600" />
            <span>Zufallsaufgabe</span>
          </button>
        </div>
      </div>

      {/* Main Grid Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Math Grid Paper Display */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Rechenkästchen
            </span>
            <div className="text-xs text-slate-500">
              {isStepMode
                ? `Schritt ${currentStepIndex + 1} von ${totalSteps}`
                : 'Gesamtlösung'}
            </div>
          </div>

          {/* School Math Grid Background */}
          <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 flex justify-center overflow-x-auto">
            {/* ADDITION GRID */}
            {op === 'add' && additionData && (
              <div className="font-mono text-2xl sm:text-3xl font-bold tracking-widest text-slate-800 tabular-nums">
                {/* Number 1 */}
                <div className="text-right pr-4">
                  {additionData.num1Str}
                </div>
                {/* Number 2 with + */}
                <div className="text-right pr-4 flex justify-end items-center gap-3">
                  <span className="text-slate-400 font-sans text-xl">+</span>
                  <span>{additionData.num2Str}</span>
                </div>

                {/* Carries line (Übertrag in red) */}
                <div className="text-right pr-4 text-xs font-semibold text-rose-600 h-5 flex justify-end gap-2.5">
                  {additionData.columns
                    .slice()
                    .reverse()
                    .map((col, idx) => {
                      const colIndexFromRight = additionData.columns.length - 1 - idx;
                      const isRevealed = !isStepMode || colIndexFromRight <= currentStepIndex;
                      return (
                        <span key={idx} className="w-6 text-center">
                          {isRevealed && col.carryIn > 0 ? col.carryIn : ''}
                        </span>
                      );
                    })}
                </div>

                {/* Divider Line */}
                <div className="w-full border-b-2 border-slate-800 my-1" />

                {/* Result */}
                <div className="text-right pr-4 text-indigo-700">
                  {!isStepMode ? (
                    additionData.resultStr
                  ) : (
                    <span>
                      {additionData.resultStr
                        .split('')
                        .map((char, charIdx) => {
                          const colFromRight = additionData.resultStr.length - 1 - charIdx;
                          const show = colFromRight <= currentStepIndex;
                          return (
                            <span key={charIdx} className={show ? 'text-indigo-700' : 'invisible'}>
                              {char}
                            </span>
                          );
                        })}
                    </span>
                  )}
                </div>
                <div className="w-full border-b border-indigo-200 mt-1" />
              </div>
            )}

            {/* SUBTRACTION GRID */}
            {op === 'sub' && subtractionData && (
              <div className="font-mono text-2xl sm:text-3xl font-bold tracking-widest text-slate-800 tabular-nums">
                {/* Number 1 */}
                <div className="text-right pr-4">
                  {subtractionData.num1Str}
                </div>
                {/* Number 2 with - */}
                <div className="text-right pr-4 flex justify-end items-center gap-3">
                  <span className="text-slate-400 font-sans text-xl">−</span>
                  <span>{subtractionData.num2Str}</span>
                </div>

                {/* Borrow / Übertrag in red */}
                <div className="text-right pr-4 text-xs font-semibold text-rose-600 h-5 flex justify-end gap-2.5">
                  {subtractionData.borrowArr
                    .slice(0, subtractionData.maxLen)
                    .reverse()
                    .map((bVal, idx) => {
                      const colFromRight = subtractionData.maxLen - 1 - idx;
                      const isRevealed = !isStepMode || colFromRight <= currentStepIndex;
                      return (
                        <span key={idx} className="w-6 text-center">
                          {isRevealed && bVal > 0 ? bVal : ''}
                        </span>
                      );
                    })}
                </div>

                <div className="w-full border-b-2 border-slate-800 my-1" />

                <div className="text-right pr-4 text-indigo-700">
                  {!isStepMode ? (
                    subtractionData.resultStr
                  ) : (
                    <span>
                      {subtractionData.resultStr
                        .split('')
                        .map((char, charIdx) => {
                          const colFromRight = subtractionData.resultStr.length - 1 - charIdx;
                          const show = colFromRight <= currentStepIndex;
                          return (
                            <span key={charIdx} className={show ? 'text-indigo-700' : 'invisible'}>
                              {char}
                            </span>
                          );
                        })}
                    </span>
                  )}
                </div>
                <div className="w-full border-b border-indigo-200 mt-1" />
              </div>
            )}

            {/* MULTIPLICATION GRID */}
            {op === 'mul' && multiplicationData && (
              <div className="font-mono text-xl sm:text-2xl font-bold tracking-wider text-slate-800 tabular-nums">
                {/* Problem */}
                <div className="text-right pr-4 border-b border-slate-300 pb-1 mb-2">
                  {multiplicationData.num1} · {multiplicationData.num2}
                </div>

                {/* Sub-rows */}
                {multiplicationData.subRows.map((row, idx) => {
                  const showRow = !isStepMode || currentStepIndex >= idx;
                  return (
                    <div
                      key={idx}
                      className={`text-right pr-4 text-slate-600 transition-opacity ${
                        showRow ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      {row.rowStr}
                    </div>
                  );
                })}

                <div className="w-full border-b-2 border-slate-800 my-1" />

                <div
                  className={`text-right pr-4 text-indigo-700 text-2xl sm:text-3xl ${
                    !isStepMode || currentStepIndex >= multiplicationData.subRows.length
                      ? 'opacity-100'
                      : 'opacity-0'
                  }`}
                >
                  {multiplicationData.totalResult}
                </div>
              </div>
            )}

            {/* DIVISION GRID */}
            {op === 'div' && divisionData && (
              <div className="font-mono text-xl sm:text-2xl font-bold tracking-wide text-slate-800 tabular-nums space-y-2">
                <div className="flex items-center gap-2 border-b border-slate-300 pb-1">
                  <span>{divisionData.dividend}</span>
                  <span>:</span>
                  <span>{divisionData.divisor}</span>
                  <span>=</span>
                  <span className="text-indigo-700 font-extrabold">
                    {!isStepMode
                      ? `${divisionData.quotient}${divisionData.remainder > 0 ? ` R ${divisionData.remainder}` : ''}`
                      : `${divisionData.detailedSteps
                          .slice(0, currentStepIndex + 1)
                          .map((s) => s.quotientDigit)
                          .join('')}`}
                  </span>
                </div>

                {/* Detailed Steps down */}
                <div className="space-y-1 text-sm sm:text-base">
                  {divisionData.detailedSteps.map((s, idx) => {
                    const isVisible = !isStepMode || currentStepIndex >= idx;
                    if (!isVisible) return null;
                    return (
                      <div key={idx} className="pl-4 border-l-2 border-indigo-100 py-1">
                        <div className="text-slate-800">{s.currentDividend}</div>
                        <div className="text-slate-500">− {s.product}</div>
                        <div className="border-b border-slate-300 w-20" />
                        <div className="text-slate-700 font-bold">{s.remainder}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Stepper Controls */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => {
                setCurrentStepIndex(-1);
                sounds.playClick();
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                currentStepIndex === -1
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Ganzes Ergebnis
            </button>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentStepIndex <= 0}
                onClick={() => {
                  sounds.playClick();
                  setCurrentStepIndex((prev) => (prev <= 0 ? 0 : prev - 1));
                }}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
                title="Vorheriger Schritt"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setCurrentStepIndex((prev) => {
                    if (prev === -1) return 0;
                    return Math.min(totalSteps - 1, prev + 1);
                  });
                }}
                disabled={currentStepIndex >= totalSteps - 1}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none"
              >
                <span>{currentStepIndex === -1 ? 'Schritt für Schritt' : 'Nächster Schritt'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Step Description & Educational Explanation */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            <span>Erklärung der Rechenschritte</span>
          </div>

          <div className="space-y-3">
            {activeSteps.map((step, idx) => {
              const isCurrent = isStepMode && currentStepIndex === idx;
              const isPast = !isStepMode || currentStepIndex >= idx;

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs transition-all ${
                    isCurrent
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-medium shadow-xs'
                      : isPast
                      ? 'bg-slate-50 border-slate-200 text-slate-700'
                      : 'bg-white border-dashed border-slate-200 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="font-semibold text-slate-900 mb-0.5">
                    Schritt {step.stepNumber}
                  </div>
                  <p className="leading-relaxed">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
