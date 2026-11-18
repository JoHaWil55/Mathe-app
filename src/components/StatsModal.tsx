import React from 'react';
import { UserStats, MathProblem } from '../types/math';
import { sounds } from '../utils/audio';
import { 
  X, 
  Trophy, 
  Flame, 
  CheckCircle2, 
  RotateCcw, 
  Trash2,
  AlertCircle
} from 'lucide-react';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
  onResetStats: () => void;
  onRetryMistake: (problem: MathProblem) => void;
  onClearMistakes: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  stats,
  onResetStats,
  onRetryMistake,
  onClearMistakes,
}) => {
  if (!isOpen) return null;

  const accuracy = stats.totalSolved > 0 
    ? Math.round((stats.totalCorrect / stats.totalSolved) * 100) 
    : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col animate-scaleUp">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-lg">Fortschritt & Statistiken</h3>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* 4 Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-xs text-slate-500 font-medium">Gelöste Aufgaben</div>
              <div className="text-2xl font-mono font-bold text-slate-900 mt-1 tabular-nums">
                {stats.totalSolved}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-xs text-slate-500 font-medium">Trefferquote</div>
              <div className="text-2xl font-mono font-bold text-emerald-600 mt-1 tabular-nums">
                {accuracy}%
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-xs text-slate-500 font-medium">Beste Serie (Streak)</div>
              <div className="text-2xl font-mono font-bold text-amber-600 mt-1 flex items-center gap-1.5 tabular-nums">
                <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
                <span>{stats.bestStreak}</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-xs text-slate-500 font-medium">Blitz Highscore</div>
              <div className="text-2xl font-mono font-bold text-indigo-600 mt-1 tabular-nums">
                {stats.bestBlitzScore} Pkt
              </div>
            </div>
          </div>

          {/* Fehlerkiste (Review Mistakes) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Fehlerkiste ({stats.recentMistakes.length})
                </h4>
              </div>
              {stats.recentMistakes.length > 0 && (
                <button
                  onClick={() => {
                    sounds.playClick();
                    onClearMistakes();
                  }}
                  className="text-2xs text-slate-400 hover:text-rose-600 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Kiste leeren</span>
                </button>
              )}
            </div>

            {stats.recentMistakes.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-emerald-50/50 border border-emerald-100 text-emerald-800 text-xs">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
                <span>Keine Fehler gespeichert – Hervorragend gerechnet!</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {stats.recentMistakes.map((problem, i) => (
                  <div
                    key={`${problem.id}-${i}`}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-mono font-bold text-slate-900 text-sm">
                        {problem.question} = <span className="text-emerald-700">{problem.answer}</span>
                      </div>
                      <div className="text-2xs text-slate-400 mt-0.5">{problem.hint}</div>
                    </div>

                    <button
                      onClick={() => {
                        sounds.playClick();
                        onRetryMistake(problem);
                        onClose();
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-indigo-600 hover:text-indigo-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Üben</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm('Möchtest du alle Statistiken und Rekorde wirklich zurücksetzen?')) {
                sounds.playClick();
                onResetStats();
              }
            }}
            className="text-xs text-slate-400 hover:text-rose-600"
          >
            Statistiken zurücksetzen
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
