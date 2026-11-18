import React, { useState, useEffect, useRef } from 'react';
import { WorksheetDoc, WorksheetBlock, BlockType } from './types/mathcad';
import { Header } from './components/Header';
import { MathcadRibbon } from './components/MathcadRibbon';
import { Worksheet } from './components/Worksheet';
import { FloatingOperatorPalette } from './components/FloatingOperatorPalette';
import { MathcadHelpModal } from './components/MathcadHelpModal';
import { WindowsInstallModal } from './components/WindowsInstallModal';
import { usePWAInstall } from './hooks/usePWAInstall';
import { templates } from './data/mathcadTemplates';

const STORAGE_KEY = 'mathcad_current_doc_v1';

export default function App() {
  const { isInstallable, install } = usePWAInstall();
  const [isWindowsInstallOpen, setIsWindowsInstallOpen] = useState<boolean>(false);
  const [doc, setDoc] = useState<WorksheetDoc>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    // Default starting sheet: Statik template so the user immediately sees working Mathcad calculations
    return templates.statik;
  });

  const [activeTemplate, setActiveTemplate] = useState<string | null>('statik');
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  // Floating operator palette state (default open as a floating window)
  const [isPaletteOpen, setIsPaletteOpen] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('mathcad_palette_open');
      if (stored !== null) return stored === 'true';
    } catch {}
    return true;
  });

  const [isPaletteDocked, setIsPaletteDocked] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('mathcad_palette_docked');
      if (stored !== null) return stored === 'true';
    } catch {}
    return false;
  });

  useEffect(() => {
    try {
      localStorage.setItem('mathcad_palette_open', String(isPaletteOpen));
      localStorage.setItem('mathcad_palette_docked', String(isPaletteDocked));
    } catch {}
  }, [isPaletteOpen, isPaletteDocked]);

  // History stack for Undo ("Rückgängig" / "Rücktaste") and Redo
  const [history, setHistory] = useState<WorksheetDoc[]>([]);
  const [future, setFuture] = useState<WorksheetDoc[]>([]);

  // Symbol insertion bridge
  const insertSymbolFnRef = useRef<((sym: string) => void) | null>(null);

  // Auto-save worksheet
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
    } catch {}
  }, [doc]);

  // Updates document with optional history recording
  const updateDocWithHistory = (
    nextDocOrFn: WorksheetDoc | ((prev: WorksheetDoc) => WorksheetDoc),
    recordHistory = true
  ) => {
    setDoc((current) => {
      const next = typeof nextDocOrFn === 'function' ? nextDocOrFn(current) : nextDocOrFn;
      if (next === current) return current;
      if (recordHistory) {
        setHistory((prevHist) => [...prevHist.slice(-40), current]);
        setFuture([]);
      }
      return next;
    });
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    setFuture((prevFuture) => [doc, ...prevFuture.slice(0, 40)]);
    setHistory(newHistory);
    setDoc(previous);
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    setHistory((prevHist) => [...prevHist.slice(-40), doc]);
    setFuture(newFuture);
    setDoc(next);
  };

  // Global Keyboard Shortcuts for Undo (Ctrl+Z) and Redo (Ctrl+Y / Ctrl+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.ctrlKey || e.metaKey;
      if (!isCmdOrCtrl) return;

      const activeEl = document.activeElement;
      const isInput = activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA';

      if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
        if (!isInput) {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.key.toLowerCase() === 'z' && e.shiftKey) || e.key.toLowerCase() === 'y') {
        if (!isInput) {
          e.preventDefault();
          handleRedo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history, future, doc]);

  // Create clean blank sheet (blocks: [], selectedBlockId: null)
  const handleNewSheet = () => {
    const blankDoc: WorksheetDoc = {
      id: Math.random().toString(36).substring(2, 9),
      title: 'Neues Berechnungsblatt',
      description: 'Leeres Arbeitsblatt (Mathcad Style)',
      showGrid: true,
      layoutMode: 'freeform',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      blocks: [], // Blank start - ready for fresh formulas
    };
    updateDocWithHistory(blankDoc);
    setActiveTemplate(null);
    setSelectedBlockId(null);
  };

  const handleLoadTemplate = (key: string) => {
    if (templates[key]) {
      updateDocWithHistory(templates[key]);
      setActiveTemplate(key);
      setSelectedBlockId(null);
    }
  };

  const handleToggleGrid = () => {
    updateDocWithHistory((prev) => ({ ...prev, showGrid: !prev.showGrid }), false);
  };

  const handleAddBlock = (type: BlockType) => {
    const newId = Math.random().toString(36).substring(2, 9);
    let maxY = 40;
    for (const b of doc.blocks) {
      const bottom = (b.y ?? 0) + (b.type === 'plot' ? 260 : 60);
      if (bottom > maxY) maxY = bottom;
    }
    const nextY = Math.round((maxY + 20) / 20) * 20;

    let newBlock: WorksheetBlock;
    if (type === 'math') {
      newBlock = { id: newId, type: 'math' as const, x: 40, y: nextY, width: 280, mathData: { raw: '' } };
    } else if (type === 'text') {
      newBlock = { id: newId, type: 'text' as const, x: 40, y: nextY, width: 500, textData: { content: '', isHeading: false } };
    } else {
      newBlock = {
        id: newId,
        type: 'plot' as const,
        x: 40,
        y: nextY,
        width: 620,
        plotData: { title: 'Funktionsgraph', fn: 'x^2', varName: 'x', xMin: -5, xMax: 5 },
      };
    }
    updateDocWithHistory((prev) => ({ ...prev, blocks: [...prev.blocks, newBlock] }));
    setSelectedBlockId(newId);
  };

  const handleInsertSymbol = (symbol: string) => {
    if (insertSymbolFnRef.current) {
      insertSymbolFnRef.current(symbol);
    }
  };

  const handleAutoArrange = () => {
    const sorted = [...doc.blocks].sort((a, b) => {
      const yA = a.y ?? 0;
      const yB = b.y ?? 0;
      if (Math.abs(yA - yB) > 20) return yA - yB;
      return (a.x ?? 0) - (b.x ?? 0);
    });

    let currentY = 20;
    let prevRowY = -100;

    const arranged = sorted.map((block) => {
      const origX = block.x ?? 40;
      const origY = block.y ?? 0;

      if (block.type === 'text' && block.textData?.isHeading) {
        currentY = Math.round((currentY + 20) / 20) * 20;
        const b = { ...block, x: 40, y: currentY };
        currentY += 45;
        return b;
      }

      if (block.type === 'plot') {
        currentY = Math.round((currentY + 20) / 20) * 20;
        const b = { ...block, x: 40, y: currentY };
        currentY += 280;
        return b;
      }

      if (origX >= 260 && Math.abs(origY - prevRowY) < 35) {
        const b = { ...block, x: 320, y: prevRowY };
        currentY = Math.max(currentY, prevRowY + 40);
        return b;
      } else {
        currentY = Math.round(currentY / 20) * 20;
        const b = { ...block, x: 40, y: currentY };
        prevRowY = currentY;
        currentY += 40;
        return b;
      }
    });

    updateDocWithHistory((prev) => ({ ...prev, blocks: arranged }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* 1. Header (Top Bar Contract) */}
      <Header
        onNewSheet={handleNewSheet}
        onOpenHelp={() => setIsHelpOpen(true)}
        onLoadTemplate={handleLoadTemplate}
        activeTemplate={activeTemplate}
        onOpenWindowsInstall={() => setIsWindowsInstallOpen(true)}
      />

      {/* 2. Mathcad Engineering Ribbon */}
      <MathcadRibbon
        onAddBlock={handleAddBlock}
        onInsertSymbol={handleInsertSymbol}
        showGrid={doc.showGrid}
        onToggleGrid={handleToggleGrid}
        onLoadTemplate={handleLoadTemplate}
        onClearWorksheet={() => updateDocWithHistory((prev) => ({ ...prev, blocks: [] }))}
        onPrint={handlePrint}
        onAutoArrange={handleAutoArrange}
        canUndo={history.length > 0}
        onUndo={handleUndo}
        canRedo={future.length > 0}
        onRedo={handleRedo}
        isPaletteOpen={isPaletteOpen}
        onTogglePalette={() => setIsPaletteOpen((prev) => !prev)}
        isPaletteDocked={isPaletteDocked}
        onTogglePaletteDock={() => setIsPaletteDocked((prev) => !prev)}
      />

      {/* 3. Floating Mathcad Operator Palette */}
      <FloatingOperatorPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onInsertSymbol={handleInsertSymbol}
        isDocked={isPaletteDocked}
        onToggleDock={() => setIsPaletteDocked((prev) => !prev)}
      />

      {/* 4. Main Interactive Worksheet Canvas */}
      <main className="flex-1 w-full">
        <Worksheet
          doc={doc}
          onChangeDoc={updateDocWithHistory}
          selectedBlockId={selectedBlockId}
          onSelectBlock={setSelectedBlockId}
          onInsertSymbolRef={(fn) => {
            insertSymbolFnRef.current = fn;
          }}
        />
      </main>

      {/* 4. Quick Syntax & Units Guide Modal */}
      <MathcadHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* 5. Windows App Install Modal */}
      <WindowsInstallModal
        isOpen={isWindowsInstallOpen}
        onClose={() => setIsWindowsInstallOpen(false)}
        canDirectInstall={isInstallable}
        onDirectInstall={install}
      />

      {/* Quiet, Human Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">MatheLab Worksheets</span>
            <span aria-hidden="true">·</span>
            <span>Interaktive mathematische Berechnungen im Mathcad-Stil</span>
          </div>

          <div className="flex items-center gap-4 text-slate-600">
            <span>Variablen mit <code className="font-mono text-indigo-600 font-bold">:=</code> definieren</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsHelpOpen(true)}
              className="hover:text-indigo-600 underline font-medium"
            >
              Hilfe & Einheiten
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
