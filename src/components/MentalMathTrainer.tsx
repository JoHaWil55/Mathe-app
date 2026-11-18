import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Difficulty, GameMode, MathProblem, Operation, QuizResult, UserStats } from '../types/math';
import { generateProblem } from '../utils/mathGenerator';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Play, 
  RotateCcw, 
  Lightbulb, 
  Check, 
  X, 
  Flame, 
  Timer, 
  Trophy, 
  ArrowRight,
  HelpCircle,
  Delete
} from 'lucide-react';

interface MentalMathTrainerProps {
  stats: UserStats;
  onUpdateStats: (newStats: Partial<UserStats>) => void;
  externalTriggerBlitz?: number;
}

export const MentalMathTrainer: React.FC<MentalMathTrainerProps> = ({
  stats,
  onUpdateStats,
  externalTriggerBlitz,
}) => {
  const [operation, setOperation] = useState<Operation>('mixed');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [mode, setMode] = useState<GameMode>('practice');

  // Active game state
  const [currentProblem, setCurrentProblem] = useState<MathProblem>(() => 
    generateProblem('mixed', 'medium')
  );
  const [inputVal, setInputVal] = useState<string>('');
  const [showHint, setShowHint] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

  // Mode: 60s Blitz
  const [blitzTimeLeft, setBlitzTimeLeft] = useState<number>(60);
  const [isBlitzActive, setIsBlitzActive] = useState<boolean>(false);
  const [blitzScore, setBlitzScore] = useState<number>(0);
  const [blitzStreak, setBlitzStreak] = useState<number>(0);

  // Mode: 10er Sprint
  const [sprintIndex, setSprintIndex] = useState<number>(0);
  const [isSprintActive, setIsSprintActive] = useState<boolean>(false);
  const [sprintResults, setSprintResults] = useState<QuizResult[]>([]);
  const [sprintStartTime, setSprintStartTime] = useState<number>(0);
  const [problemStartTime, setProblemStartTime] = useState<number>(Date.now());

  // Finished dialog
  const [roundFinished, setRoundFinished] = useState<boolean>(false);
  const [summaryData, setSummaryData] = useState<{
    total: number;
    correct: number;
    score?: number;
    timeSeconds?: number;
    isNewRecord?: boolean;
    mistakes: MathProblem[];
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Listen to external trigger for Blitz mode from header
  useEffect(() => {
    if (externalTriggerBlitz && externalTriggerBlitz > 0) {
      startBlitzGame();
    }
  }, [externalTriggerBlitz]);

  // Handle timer in Blitz Mode
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isBlitzActive && blitzTimeLeft > 0) {
      timer = setInterval(() => {
        setBlitzTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            finishBlitzGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBlitzActive, blitzTimeLeft]);

  // Focus input automatically
  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    focusInput();
  }, [currentProblem, focusInput]);

  const nextProblem = useCallback(() => {
    const prob = generateProblem(operation, difficulty);
    setCurrentProblem(prob);
    setInputVal('');
    setShowHint(false);
    setFeedback('idle');
    setFeedbackMessage('');
    setProblemStartTime(Date.now());
    focusInput();
  }, [operation, difficulty, focusInput]);

  // Start Blitz
  const startBlitzGame = () => {
    setMode('blitz');
    setBlitzTimeLeft(60);
    setBlitzScore(0);
    setBlitzStreak(0);
    setIsBlitzActive(true);
    setRoundFinished(false);
    setSummaryData(null);
    nextProblem();
  };

  // Finish Blitz
  const finishBlitzGame = () => {
    setIsBlitzActive(false);
    setRoundFinished(true);
    const isNew = blitzScore > stats.bestBlitzScore;
    if (isNew) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      sounds.playFanfare();
    } else {
      sounds.playCorrect();
    }
    onUpdateStats({
      totalSolved: stats.totalSolved + blitzScore,
      totalCorrect: stats.totalCorrect + blitzScore,
      bestBlitzScore: Math.max(stats.bestBlitzScore, blitzScore),
    });
    setSummaryData({
      total: blitzScore,
      correct: blitzScore,
      score: blitzScore,
      isNewRecord: isNew,
      mistakes: [],
    });
  };

  // Start 10er Sprint
  const startSprintGame = () => {
    setMode('sprint10');
    setSprintIndex(0);
    setSprintResults([]);
    setIsSprintActive(true);
    setRoundFinished(false);
    setSummaryData(null);
    setSprintStartTime(Date.now());
    nextProblem();
  };

  // Check Answer
  const handleCheck = () => {
    if (inputVal.trim() === '') return;
    const parsed = parseInt(inputVal.trim(), 10);
    if (isNaN(parsed)) return;

    const isCorrect = parsed === currentProblem.answer;
    const timeSpent = Date.now() - problemStartTime;

    if (isCorrect) {
      sounds.playCorrect();
      setFeedback('correct');
      setFeedbackMessage('Richtig gerechnet!');

      // Update streaks
      const newStreak = stats.currentStreak + 1;
      onUpdateStats({
        totalSolved: stats.totalSolved + 1,
        totalCorrect: stats.totalCorrect + 1,
        currentStreak: newStreak,
        bestStreak: Math.max(stats.bestStreak, newStreak),
      });

      if (mode === 'blitz') {
        const streakBonus = Math.floor(blitzStreak / 3);
        const points = 10 + streakBonus * 5;
        setBlitzScore((s) => s + points);
        setBlitzStreak((st) => st + 1);
        setTimeout(() => nextProblem(), 250);
      } else if (mode === 'sprint10') {
        const nextResults = [
          ...sprintResults,
          { problem: currentProblem, userAnswer: parsed, isCorrect: true, timeSpentMs: timeSpent },
        ];
        setSprintResults(nextResults);
        if (sprintIndex + 1 >= 10) {
          finishSprint(nextResults);
        } else {
          setSprintIndex((idx) => idx + 1);
          setTimeout(() => nextProblem(), 300);
        }
      } else {
        // Practice mode
        setTimeout(() => nextProblem(), 600);
      }
    } else {
      sounds.playWrong();
      setFeedback('wrong');
      setFeedbackMessage(`Nicht ganz: Die richtige Antwort ist ${currentProblem.answer}`);

      // Add to recent mistakes
      const updatedMistakes = [currentProblem, ...stats.recentMistakes.slice(0, 19)];
      onUpdateStats({
        totalSolved: stats.totalSolved + 1,
        currentStreak: 0,
        recentMistakes: updatedMistakes,
      });

      if (mode === 'blitz') {
        setBlitzStreak(0);
        setTimeout(() => nextProblem(), 800);
      } else if (mode === 'sprint10') {
        const nextResults = [
          ...sprintResults,
          { problem: currentProblem, userAnswer: parsed, isCorrect: false, timeSpentMs: timeSpent },
        ];
        setSprintResults(nextResults);
        if (sprintIndex + 1 >= 10) {
          finishSprint(nextResults);
        } else {
          setSprintIndex((idx) => idx + 1);
          setTimeout(() => nextProblem(), 900);
        }
      }
    }
  };

  const finishSprint = (results: QuizResult[]) => {
    setIsSprintActive(false);
    setRoundFinished(true);
    const totalDuration = Math.round((Date.now() - sprintStartTime) / 1000);
    const correctCount = results.filter((r) => r.isCorrect).length;
    const mistakes = results.filter((r) => !r.isCorrect).map((r) => r.problem);

    if (correctCount >= 8) {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      sounds.playFanfare();
    } else {
      sounds.playCorrect();
    }

    setSummaryData({
      total: 10,
      correct: correctCount,
      timeSeconds: totalDuration,
      mistakes,
    });
  };

  // Keyboard navigation & numpad
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCheck();
    }
  };

  const appendDigit = (digit: string) => {
    sounds.playClick();
    if (inputVal.length < 7) {
      setInputVal((prev) => prev + digit);
    }
  };

  const backspace = () => {
    sounds.playClick();
    setInputVal((prev) => prev.slice(0, -1));
  };

  const clearInput = () => {
    sounds.playClick();
    setInputVal('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
      {/* Top Controls: Mode & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        {/* Mode Selector */}
        <div className="flex items-center p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => {
              setMode('practice');
              setIsBlitzActive(false);
              setIsSprintActive(false);
              setRoundFinished(false);
              nextProblem();
            }}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              mode === 'practice'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Übungsmodus
          </button>
          <button
            onClick={startBlitzGame}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              mode === 'blitz'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            60s Blitz
          </button>
          <button
            onClick={startSprintGame}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              mode === 'sprint10'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            10er-Sprint
          </button>
        </div>

        {/* Difficulty Selector */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <span className="text-xs font-medium text-slate-500 mr-1">Stufe:</span>
          {(['easy', 'medium', 'hard', 'expert'] as Difficulty[]).map((lvl) => {
            const labels: Record<Difficulty, string> = {
              easy: 'Leicht',
              medium: 'Mittel',
              hard: 'Schwer',
              expert: 'Experte',
            };
            return (
              <button
                key={lvl}
                onClick={() => {
                  setDifficulty(lvl);
                  sounds.playClick();
                  setTimeout(() => nextProblem(), 10);
                }}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  difficulty === lvl
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {labels[lvl]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Operation Picker */}
      <div className="py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-medium text-slate-500 mr-1">Rechenart:</span>
          {[
            { id: 'mixed', label: 'Gemischt (±×÷)' },
            { id: 'add', label: 'Addition (+)' },
            { id: 'sub', label: 'Subtraktion (-)' },
            { id: 'mul', label: 'Multiplikation (×)' },
            { id: 'div', label: 'Division (÷)' },
          ].map((op) => (
            <button
              key={op.id}
              onClick={() => {
                setOperation(op.id as Operation);
                sounds.playClick();
                setTimeout(() => nextProblem(), 10);
              }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                operation === op.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {op.label}
            </button>
          ))}
        </div>

        {/* Live Stats Bar */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-1.5 text-amber-600 font-semibold">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span className="tabular-nums">{stats.currentStreak} Serie</span>
          </div>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <div>
            <span className="text-slate-900 font-semibold tabular-nums">{stats.totalCorrect}</span>
            <span className="text-slate-500">/{stats.totalSolved} gelöst</span>
          </div>
        </div>
      </div>

      {/* Game Mode Status Banners */}
      {mode === 'blitz' && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-600 text-white">
              <Timer className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-semibold text-indigo-900 uppercase tracking-wide">
                60-Sekunden Blitz-Runde
              </div>
              <div className="text-xl font-bold font-mono text-indigo-700 tabular-nums">
                {blitzTimeLeft}s verbleibend
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">Punkte</div>
            <div className="text-2xl font-black font-mono text-slate-900 tabular-nums">
              {blitzScore}
            </div>
          </div>
        </div>
      )}

      {mode === 'sprint10' && (
        <div className="mb-6 p-4 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-xs font-semibold text-slate-600">Aufgabe {sprintIndex + 1} von 10</div>
            <div className="w-36 h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${((sprintIndex + 1) / 10) * 100}%` }}
              />
            </div>
          </div>
          <div className="text-xs text-slate-600 font-medium">
            Richtig: {sprintResults.filter((r) => r.isCorrect).length}
          </div>
        </div>
      )}

      {/* Main Interaction Area: Problem Card or Round Summary */}
      {!roundFinished ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {/* Question Display */}
          <div className="py-6 sm:py-10 text-center">
            <div className="text-5xl sm:text-6xl md:text-7xl font-mono font-bold tracking-tight text-slate-900 tabular-nums">
              {currentProblem.question} <span className="text-indigo-600">= ?</span>
            </div>

            {/* Visual Dot Array if available for multiplication/division */}
            {currentProblem.visualType === 'dots' && currentProblem.num1 <= 10 && currentProblem.num2 <= 10 && (
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col items-center justify-center">
                <span className="text-xs text-slate-400 mb-2">Visuelles Punktefeld:</span>
                <div
                  className="grid gap-1.5 p-2 bg-slate-50 rounded-lg border border-slate-100"
                  style={{ gridTemplateColumns: `repeat(${currentProblem.num2}, minmax(0, 1fr))` }}
                >
                  {Array.from({ length: currentProblem.num1 * currentProblem.num2 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-full bg-indigo-400"
                      title={`Punkt ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input & Form */}
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={inputVal}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9-]/g, '');
                    setInputVal(val);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Ergebnis eingeben..."
                  className={`w-full text-center text-3xl font-mono font-bold py-3.5 px-4 rounded-xl border-2 transition-all outline-none ${
                    feedback === 'correct'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                      : feedback === 'wrong'
                      ? 'border-rose-500 bg-rose-50 text-rose-900'
                      : 'border-slate-300 focus:border-indigo-600 text-slate-900 bg-white'
                  }`}
                  autoFocus
                />
              </div>

              <button
                onClick={handleCheck}
                disabled={inputVal.trim() === ''}
                className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 text-base shadow-sm shrink-0"
              >
                <span>Prüfen</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Feedback Message */}
            {feedback !== 'idle' && (
              <div
                className={`mt-3 p-3 rounded-xl text-center text-sm font-semibold flex items-center justify-center gap-2 ${
                  feedback === 'correct'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {feedback === 'correct' ? <Check className="w-5 h-5 text-emerald-600" /> : <X className="w-5 h-5 text-rose-600" />}
                <span>{feedbackMessage}</span>
              </div>
            )}

            {/* Hint Box (in practice mode) */}
            {mode === 'practice' && (
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col items-center">
                {!showHint ? (
                  <button
                    onClick={() => {
                      setShowHint(true);
                      sounds.playClick();
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 hover:underline"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Lösungsweg / Tipp anzeigen</span>
                  </button>
                ) : (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 w-full animate-fadeIn">
                    <div className="font-semibold flex items-center gap-1.5 mb-1 text-amber-800">
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                      <span>Rechen-Tipp:</span>
                    </div>
                    <p className="leading-relaxed">{currentProblem.hint}</p>
                    <p className="mt-1 font-mono text-slate-700">{currentProblem.explanation}</p>
                  </div>
                )}
              </div>
            )}

            {/* Interactive On-Screen Numpad for Touch / Fast Input */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    onClick={() => appendDigit(digit)}
                    className="h-12 text-xl font-mono font-semibold bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-800 rounded-xl border border-slate-200 shadow-2xs transition-all active:scale-95"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  onClick={clearInput}
                  title="Eingabe löschen"
                  className="h-12 text-sm font-semibold text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 rounded-xl border border-slate-200 transition-all active:scale-95 flex items-center justify-center"
                >
                  C
                </button>
                <button
                  onClick={() => appendDigit('0')}
                  className="h-12 text-xl font-mono font-semibold bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-800 rounded-xl border border-slate-200 shadow-2xs transition-all active:scale-95"
                >
                  0
                </button>
                <button
                  onClick={backspace}
                  title="Letzte Ziffer löschen"
                  className="h-12 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 rounded-xl border border-slate-200 transition-all active:scale-95 flex items-center justify-center"
                >
                  <Delete className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Round Finished Summary Card */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8" />
          </div>

          <h3 className="text-2xl font-bold text-slate-900">
            {mode === 'blitz' ? 'Blitz-Runde beendet!' : 'Sprint abgeschlossen!'}
          </h3>

          {summaryData?.isNewRecord && (
            <div className="mt-2 text-sm font-semibold text-amber-600 flex items-center justify-center gap-1.5">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>Neuer persönlicher Rekord!</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 my-6">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-xs text-slate-500 mb-1">Richtig gelöst</div>
              <div className="text-3xl font-mono font-bold text-slate-900 tabular-nums">
                {summaryData?.correct} / {summaryData?.total}
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-xs text-slate-500 mb-1">Genauigkeit</div>
              <div className="text-3xl font-mono font-bold text-emerald-600 tabular-nums">
                {summaryData?.total ? Math.round((summaryData.correct / summaryData.total) * 100) : 0}%
              </div>
            </div>
          </div>

          {/* Mistakes review if any */}
          {summaryData?.mistakes && summaryData.mistakes.length > 0 && (
            <div className="mb-6 text-left">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Zur Wiederholung:
              </h4>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {summaryData.mistakes.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-rose-50 border border-rose-100 text-xs flex items-center justify-between"
                  >
                    <span className="font-mono font-semibold text-slate-800">{m.question}</span>
                    <span className="font-mono font-bold text-rose-700">= {m.answer}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                if (mode === 'blitz') startBlitzGame();
                else startSprintGame();
              }}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Noch eine Runde</span>
            </button>
            <button
              onClick={() => {
                setMode('practice');
                setRoundFinished(false);
                nextProblem();
              }}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
            >
              Zum Übungsmodus
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
