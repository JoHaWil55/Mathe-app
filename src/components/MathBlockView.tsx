import React, { useRef, useEffect, useState, useMemo } from 'react';
import { MathBlockData } from '../types/mathcad';
import { formatFormulaToTex } from '../utils/latexConverter';
import { 
  getInitialCursorPosition, 
  handleOperatorKeyNavigation 
} from '../utils/mathcadOperators';
import katex from 'katex';
import { 
  Trash2, 
  AlertCircle, 
  Copy,
  GripHorizontal,
  Edit3
} from 'lucide-react';

interface MathBlockViewProps {
  id: string;
  data: MathBlockData;
  onChange: (newRaw: string) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  isSelected?: boolean;
  onSelect: () => void;
  isAbsolute?: boolean;
  x?: number;
  y?: number;
  width?: number;
  onDragStart?: (e: React.PointerEvent) => void;
}

export const MathBlockView: React.FC<MathBlockViewProps> = ({
  id,
  data,
  onChange,
  onDelete,
  onDuplicate,
  isSelected,
  onSelect,
  isAbsolute,
  x,
  y,
  onDragStart,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const prevRawRef = useRef(data.raw);

  const jumpTo = (pos: number) => {
    setIsEditing(true);
    setTimeout(() => {
      if (!inputRef.current) return;
      inputRef.current.focus();
      const clamped = Math.max(0, Math.min(pos, inputRef.current.value.length));
      inputRef.current.setSelectionRange(clamped, clamped);
    }, 20);
  };

  const focusNumerator = () => {
    const slashIdx = data.raw.indexOf('/');
    jumpTo(slashIdx >= 0 ? slashIdx : 0);
  };

  const focusDenominator = () => {
    const slashIdx = data.raw.indexOf('/');
    jumpTo(slashIdx >= 0 ? slashIdx + 1 : data.raw.length);
  };

  const jumpToVariable = () => {
    jumpTo(0);
  };

  const jumpToValue = () => {
    const colIdx = data.raw.indexOf(':=');
    if (colIdx >= 0) {
      jumpTo(colIdx + 2 < data.raw.length && data.raw[colIdx + 2] === ' ' ? colIdx + 3 : colIdx + 2);
    } else {
      jumpTo(data.raw.length);
    }
  };

  const jumpToBase = () => {
    const caretIdx = data.raw.indexOf('^');
    jumpTo(caretIdx >= 0 ? caretIdx : 0);
  };

  const jumpToExponent = () => {
    const caretIdx = data.raw.indexOf('^');
    jumpTo(caretIdx >= 0 ? caretIdx + 1 : data.raw.length);
  };

  const jumpInsideEnclosure = () => {
    const parenIdx = data.raw.indexOf('(');
    if (parenIdx >= 0) {
      jumpTo(parenIdx + 1);
    } else {
      jumpTo(data.raw.length);
    }
  };

  // If newly selected or empty, enter edit mode and place cursor smartly for ALL operators:
  // For fraction "/", cursor starts in Numerator A (index 0)
  // For definition ":=", cursor starts in Variable A (index 0)
  // For power "^", cursor starts in Base A (index 0)
  // For "sqrt()", cursor starts inside (index 5)
  useEffect(() => {
    if (isSelected) {
      if (data.raw.trim() === '' || !data.result) {
        setIsEditing(true);
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
            const val = inputRef.current.value;
            const targetPos = getInitialCursorPosition(val);
            inputRef.current.setSelectionRange(targetPos, targetPos);
          }
        }, 30);
      }
    }
  }, [isSelected]);

  // When formula content changes externally (e.g. from palette or ribbon buttons)
  useEffect(() => {
    if (isEditing && inputRef.current && prevRawRef.current !== data.raw) {
      const val = data.raw;
      const prev = prevRawRef.current;
      prevRawRef.current = data.raw;

      // Smart positioning for all operators if newly inserted
      if (prev === '' || prev.trim() === '') {
        const targetPos = getInitialCursorPosition(val);
        inputRef.current.setSelectionRange(targetPos, targetPos);
        return;
      }

      // If fraction was inserted
      if (val.endsWith('/') && !prev.endsWith('/')) {
        const slashIdx = val.lastIndexOf('/');
        const before = val.slice(0, slashIdx).trim();
        if (!before || before.endsWith(':=') || before.endsWith('=') || /[+\-*]$/.test(before)) {
          inputRef.current.setSelectionRange(slashIdx, slashIdx);
          return;
        }
      }

      // If power was inserted
      if (val.endsWith('^') && !prev.endsWith('^')) {
        const caretIdx = val.lastIndexOf('^');
        const before = val.slice(0, caretIdx).trim();
        if (!before || before.endsWith(':=') || before.endsWith('=') || /[+\-*]$/.test(before)) {
          inputRef.current.setSelectionRange(caretIdx, caretIdx);
          return;
        }
      }

      // If definition was inserted
      if (val.includes(':=') && !prev.includes(':=')) {
        const colIdx = val.indexOf(':=');
        const before = val.slice(0, colIdx).trim();
        if (!before) {
          inputRef.current.setSelectionRange(0, 0);
          return;
        }
      }
    }
  }, [data.raw, isEditing]);

  const isDeletedRef = useRef(false);

  const handleDelete = () => {
    if (isDeletedRef.current) return;
    isDeletedRef.current = true;
    onDelete();
  };

  const handleBlur = () => {
    setIsEditing(false);
    // If user clicked to create a block but typed nothing, clean it up immediately
    if (data.raw.trim() === '') {
      handleDelete();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      return;
    } 
    if ((e.key === 'Backspace' || e.key === 'Delete') && data.raw === '') {
      e.preventDefault();
      onDelete();
      return;
    }

    const curPos = inputRef.current?.selectionStart ?? 0;
    const targetPos = handleOperatorKeyNavigation(e, data.raw, curPos);
    if (targetPos !== null && inputRef.current) {
      inputRef.current.setSelectionRange(targetPos, targetPos);
      return;
    }
  };

  // Convert raw expression to LaTeX
  const tex = useMemo(() => {
    return formatFormulaToTex(data.raw, data.result);
  }, [data.raw, data.result]);

  // Render KaTeX HTML (with true horizontal fraction line \frac{}{}, roots, powers)
  const renderedHtml = useMemo(() => {
    if (!tex) return '';
    try {
      return katex.renderToString(tex, {
        throwOnError: false,
        displayMode: false,
      });
    } catch {
      return '';
    }
  }, [tex]);

  const style: React.CSSProperties = isAbsolute
    ? {
        position: 'absolute',
        left: `${x ?? 40}px`,
        top: `${y ?? 40}px`,
      }
    : {};

  const charLength = Math.max(4, data.raw.length + 1);

  return (
    <div
      data-block-id={id}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
        setTimeout(() => inputRef.current?.focus(), 10);
      }}
      className={`group relative inline-flex items-center transition-all select-none py-1 px-1.5 rounded-md ${
        isEditing || isSelected
          ? 'z-30 outline-1 outline-blue-500/80 outline-offset-2 bg-blue-50/20'
          : 'hover:outline-1 hover:outline-slate-300/80 hover:outline-offset-2 z-10 cursor-pointer'
      }`}
    >
      {/* Discreet drag grip on hover/select */}
      {isAbsolute && onDragStart && (
        <div
          onPointerDown={onDragStart}
          className={`cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-700 transition-opacity p-1 -ml-2 mr-1 touch-none ${
            isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          title="Verschieben (ziehen)"
        >
          <GripHorizontal className="w-4 h-4" />
        </div>
      )}

      {/* 2D Mathcad Typesetting Display (Horizontal fraction lines, roots, subscripts) */}
      {!isEditing && renderedHtml ? (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
            setIsEditing(true);
            setTimeout(() => inputRef.current?.focus(), 10);
          }}
          className="text-base sm:text-lg text-slate-900 leading-none select-text py-0.5"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
          title="Klicken zum Bearbeiten"
        />
      ) : (
        /* Inline editing mode */
        <div className="relative flex items-center font-mono text-base sm:text-lg text-slate-900 leading-none">
          <input
            ref={inputRef}
            type="text"
            value={data.raw}
            size={charLength}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Formel eingeben..."
            className="font-mono text-base sm:text-lg text-slate-900 bg-transparent outline-none border-none p-0 tracking-normal caret-blue-600 focus:ring-0"
            spellCheck={false}
            autoFocus
          />

          {data.result !== undefined && data.result !== '' && (
            <span className="flex items-center ml-1.5 font-mono text-base font-bold text-slate-900 tabular-nums">
              <span className="text-slate-400 font-normal mr-1">=</span>
              <span>{data.result}</span>
            </span>
          )}

          {/* Live 2D preview floating right below while typing */}
          {renderedHtml && (
            <div className="absolute left-0 top-full mt-2 px-2.5 py-1.5 bg-white border border-slate-200 shadow-md rounded-md text-sm text-slate-800 z-50 whitespace-nowrap animate-fadeIn">
              <div className="flex items-center justify-between gap-3 mb-1">
                <span className="text-3xs text-slate-400 uppercase tracking-wider font-sans">
                  2D Vorschau:
                </span>
                <div className="flex items-center gap-1 pointer-events-auto">
                  {/* Fraction A / B */}
                  {data.raw.includes('/') && (
                    <>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          focusNumerator();
                        }}
                        className="px-1.5 py-0.5 rounded text-3xs font-mono font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer shadow-2xs"
                        title="Zähler (A) bearbeiten - oder Pfeil Hoch ↑ / Shift+Tab"
                      >
                        [ Zähler A ]
                      </button>
                      <span className="text-slate-300 text-3xs font-bold">/</span>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          focusDenominator();
                        }}
                        className="px-1.5 py-0.5 rounded text-3xs font-mono font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer shadow-2xs"
                        title="Nenner (B) bearbeiten - oder Tab / / / Pfeil Runter ↓"
                      >
                        [ Nenner B ]
                      </button>
                    </>
                  )}

                  {/* Definition A := B */}
                  {data.raw.includes(':=') && (
                    <>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          jumpToVariable();
                        }}
                        className="px-1.5 py-0.5 rounded text-3xs font-mono font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer shadow-2xs"
                        title="Variable (A) bearbeiten - oder Shift+Tab / Pfeil Hoch ↑"
                      >
                        [ Variable A ]
                      </button>
                      <span className="text-slate-300 text-3xs font-bold">:=</span>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          jumpToValue();
                        }}
                        className="px-1.5 py-0.5 rounded text-3xs font-mono font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer shadow-2xs"
                        title="Wert (B) bearbeiten - oder Tab / Pfeil Runter ↓"
                      >
                        [ Wert B ]
                      </button>
                    </>
                  )}

                  {/* Power A ^ B */}
                  {data.raw.includes('^') && !data.raw.includes('/') && !data.raw.includes(':=') && (
                    <>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          jumpToBase();
                        }}
                        className="px-1.5 py-0.5 rounded text-3xs font-mono font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer shadow-2xs"
                        title="Basis (A) bearbeiten"
                      >
                        [ Basis A ]
                      </button>
                      <span className="text-slate-300 text-3xs font-bold">^</span>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          jumpToExponent();
                        }}
                        className="px-1.5 py-0.5 rounded text-3xs font-mono font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer shadow-2xs"
                        title="Exponent (B) bearbeiten"
                      >
                        [ Exponent B ]
                      </button>
                    </>
                  )}

                  {/* Enclosure / Functions */}
                  {(data.raw.includes('sqrt(') || data.raw.includes('abs(') || (data.raw.includes('(') && !data.raw.includes(':='))) && (
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        jumpInsideEnclosure();
                      }}
                      className="px-1.5 py-0.5 rounded text-3xs font-mono font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer shadow-2xs"
                      title="Ausdruck in Klammern bearbeiten"
                    >
                      [ Argument A ]
                    </button>
                  )}
                </div>
              </div>
              <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />
            </div>
          )}
        </div>
      )}

      {/* Error Indicator */}
      {data.error && (
        <span
          className="ml-2 inline-flex items-center gap-1 text-xs font-sans text-rose-600 bg-rose-50/90 px-1.5 py-0.5 rounded border border-rose-200"
          title={data.error}
        >
          <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
          <span className="max-w-[140px] truncate text-2xs">{data.error}</span>
        </span>
      )}

      {/* Seamless Action Toolbar (Placed directly inline next to formula - ZERO hover gap, always reachable!) */}
      <div
        className={`items-center gap-0.5 ml-2 transition-opacity ${
          isSelected ? 'flex opacity-100' : 'hidden group-hover:flex opacity-90 hover:opacity-100'
        }`}
      >
        {!isEditing && (
          <button
            onMouseDown={(e) => e.preventDefault()}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
              setTimeout(() => inputRef.current?.focus(), 10);
            }}
            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
            title="Formel bearbeiten"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onMouseDown={(e) => e.preventDefault()}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
          title="Duplizieren"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
          title="Formel löschen (oder Entf-Taste drücken)"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-500 hover:text-rose-700" />
        </button>
      </div>
    </div>
  );
};
