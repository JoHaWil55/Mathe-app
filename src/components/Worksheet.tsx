import React, { useState, useMemo, useRef } from 'react';
import { BlockType, WorksheetBlock, WorksheetDoc } from '../types/mathcad';
import { evaluateWorksheet } from '../utils/mathEngine';
import { insertOperatorIntoExpression } from '../utils/mathcadOperators';
import { MathBlockView } from './MathBlockView';
import { TextBlockView } from './TextBlockView';
import { PlotBlockView } from './PlotBlockView';
import { 
  Calculator, 
  Type, 
  LineChart, 
  MousePointerClick, 
  LayoutGrid,
  Layers,
  Trash2
} from 'lucide-react';

interface WorksheetProps {
  doc: WorksheetDoc;
  onChangeDoc: (newDoc: WorksheetDoc | ((prev: WorksheetDoc) => WorksheetDoc)) => void;
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  onInsertSymbolRef: (fn: (sym: string) => void) => void;
  onAutoArrange?: () => void;
}

export const Worksheet: React.FC<WorksheetProps> = ({
  doc,
  onChangeDoc,
  selectedBlockId,
  onSelectBlock,
  onInsertSymbolRef,
  onAutoArrange,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const blocksPlaneRef = useRef<HTMLDivElement>(null);

  // Position tracking for inserting expressions into deleted or clicked areas
  const lastClickedPosRef = useRef<{ x: number; y: number } | null>(null);
  const lastDeletedPosRef = useRef<{ x: number; y: number } | null>(null);

  // Dragging state for 2D spatial placement
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);
  const dragStartPos = useRef<{ mouseX: number; mouseY: number; blockX: number; blockY: number } | null>(null);

  const isFreeform = doc.layoutMode !== 'flow';

  // Pass symbol insertion callback to parent
  React.useEffect(() => {
    onInsertSymbolRef((symbol: string) => {
      // 1. Backspace logic ("Rücktaste")
      if (symbol === 'BACKSPACE') {
        if (selectedBlockId) {
          const target = doc.blocks.find((b) => b.id === selectedBlockId);
          if (target && target.type === 'math') {
            const raw = target.mathData?.raw || '';
            if (raw.length > 0) {
              const trimmed = raw.trimEnd();
              const newRaw = trimmed.slice(0, -1);
              handleUpdateMath(target.id, newRaw);
            } else {
              handleDeleteBlock(target.id);
            }
          } else if (target) {
            handleDeleteBlock(target.id);
          }
        } else {
          // If no block selected, remove the last block from worksheet if any
          if (doc.blocks.length > 0) {
            const last = doc.blocks[doc.blocks.length - 1];
            handleDeleteBlock(last.id);
          }
        }
        return;
      }

      // 2. An existing math block IS selected: insert directly into it at cursor position
      if (selectedBlockId) {
        const target = doc.blocks.find((b) => b.id === selectedBlockId);
        if (target && target.type === 'math') {
          const prevRaw = target.mathData?.raw || '';
          
          const activeEl = document.activeElement;
          let selStart = prevRaw.length;
          let selEnd = prevRaw.length;
          if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
            const inputEl = activeEl as HTMLInputElement;
            if (typeof inputEl.selectionStart === 'number') {
              selStart = inputEl.selectionStart;
              selEnd = inputEl.selectionEnd ?? selStart;
            }
          }

          const { newRaw, newCursorPos } = insertOperatorIntoExpression(prevRaw, symbol, selStart, selEnd);
          handleUpdateMath(target.id, newRaw);

          // Restore focus and smart cursor position immediately
          setTimeout(() => {
            const blockEl = document.querySelector(`[data-block-id="${target.id}"]`);
            const inputEl = blockEl?.querySelector('input') as HTMLInputElement | null;
            if (inputEl) {
              inputEl.focus();
              inputEl.setSelectionRange(newCursorPos, newCursorPos);
            }
          }, 20);
          return;
        }
      }

      // 3. NO BLOCK IS SELECTED: Spawn a BRAND NEW math block cleanly!
      // Priority 1: Put directly into previously deleted area if one was just deleted
      // Priority 2: Put at user's last clicked position
      // Priority 3: Put below all existing blocks
      let targetX = 40;
      let targetY = 60;

      if (lastDeletedPosRef.current) {
        targetX = lastDeletedPosRef.current.x;
        targetY = lastDeletedPosRef.current.y;
        lastDeletedPosRef.current = null;
      } else if (lastClickedPosRef.current) {
        targetX = lastClickedPosRef.current.x;
        targetY = lastClickedPosRef.current.y;
      } else if (doc.blocks.length > 0) {
        let maxY = 40;
        for (const b of doc.blocks) {
          const bottom = (b.y ?? 0) + (b.type === 'plot' ? 260 : 45);
          if (bottom > maxY) maxY = bottom;
        }
        targetY = Math.round((maxY + 30) / 20) * 20;
      }

      const { newRaw } = insertOperatorIntoExpression('', symbol, 0, 0);
      handleAddBlockAt('math', targetX, targetY, newRaw);
    });
  }, [selectedBlockId, doc.blocks]);

  // Global Delete / Backspace key listener to delete selected block
  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedBlockId) {
        const activeEl = document.activeElement;
        const isInput = activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA';
        if (isInput) {
          const inputEl = activeEl as HTMLInputElement | HTMLTextAreaElement;
          if (inputEl.value.length > 0 && e.key === 'Backspace') {
            return;
          }
        }
        e.preventDefault();
        handleDeleteBlock(selectedBlockId);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [selectedBlockId, doc.blocks]);

  // Reactive evaluation in 2D spatial order (top-to-bottom, left-to-right)
  const evaluatedBlocks = useMemo(() => {
    return evaluateWorksheet(doc.blocks, isFreeform);
  }, [doc.blocks, isFreeform]);

  // Calculate dynamic canvas height based on furthest block
  const computedMinHeight = useMemo(() => {
    if (!isFreeform) return 600;
    let maxY = 700;
    for (const b of doc.blocks) {
      const bBottom = (b.y ?? 0) + (b.type === 'plot' ? 260 : 40);
      if (bBottom > maxY) maxY = bBottom;
    }
    return maxY + 120;
  }, [doc.blocks, isFreeform]);

  // Click on empty space in canvas to add a new Math block at clicked (x, y)
  // No box or window will appear—only the blinking text cursor at that coordinate!
  // Works seamlessly anywhere on the paper, including areas where blocks were previously deleted.
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    // Do not create a new block if clicking on interactive elements, buttons, or existing blocks
    if (
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('button') ||
      target.closest('[data-block-id]') ||
      target.closest('#worksheet-header')
    ) {
      return;
    }

    // Determine coordinate relative to blocksPlaneRef (or canvasRef)
    const container = blocksPlaneRef.current || canvasRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

    // Prevent placing blocks outside of valid drawing boundary
    if (rawY < 10) return;

    // Snap to 20px grid
    const snapX = Math.max(20, Math.round(rawX / 20) * 20);
    const snapY = Math.max(20, Math.round(rawY / 20) * 20);

    // Save as last clicked position
    lastClickedPosRef.current = { x: snapX, y: snapY };
    lastDeletedPosRef.current = null;

    handleAddBlockAt('math', snapX, snapY);
  };

  const handleAddBlockAt = (type: BlockType, x: number, y: number, initialRaw?: string) => {
    const newId = Math.random().toString(36).substring(2, 9);
    let newBlock: WorksheetBlock;

    if (type === 'math') {
      newBlock = {
        id: newId,
        type: 'math',
        x,
        y,
        mathData: { raw: initialRaw || '' },
      };
    } else if (type === 'text') {
      newBlock = {
        id: newId,
        type: 'text',
        x,
        y,
        width: 480,
        textData: { content: '', isHeading: false },
      };
    } else {
      newBlock = {
        id: newId,
        type: 'plot',
        x,
        y,
        width: 620,
        plotData: {
          title: 'Neuer Funktionsgraph',
          fn: 'x^2',
          varName: 'x',
          xMin: -5,
          xMax: 5,
        },
      };
    }

    onChangeDoc((prev) => ({ ...prev, blocks: [...prev.blocks, newBlock] }));
    onSelectBlock(newId);
  };

  const handleUpdateMath = (id: string, newRaw: string) => {
    onChangeDoc((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) =>
        b.id === id ? { ...b, mathData: { ...b.mathData, raw: newRaw } } : b
      ),
    }));
  };

  const handleUpdateText = (id: string, newTextData: any) => {
    onChangeDoc((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) =>
        b.id === id ? { ...b, textData: newTextData } : b
      ),
    }));
  };

  const handleUpdatePlot = (id: string, newPlotData: any) => {
    onChangeDoc((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) =>
        b.id === id ? { ...b, plotData: newPlotData } : b
      ),
    }));
  };

  const handleDeleteBlock = (id: string) => {
    const blockToDelete = doc.blocks.find((b) => b.id === id);
    if (blockToDelete && blockToDelete.x !== undefined && blockToDelete.y !== undefined) {
      // Remember where the deleted block was so the user can easily insert a replacement formula
      lastDeletedPosRef.current = { x: blockToDelete.x, y: blockToDelete.y };
    }
    onChangeDoc((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((b) => b.id !== id),
    }));
    if (selectedBlockId === id) onSelectBlock(null);
  };

  const handleDuplicateBlock = (id: string) => {
    const original = doc.blocks.find((b) => b.id === id);
    if (!original) return;
    const newBlock: WorksheetBlock = {
      ...original,
      id: Math.random().toString(36).substring(2, 9),
      x: (original.x ?? 40) + 20,
      y: (original.y ?? 40) + 30,
    };
    onChangeDoc((prev) => ({ ...prev, blocks: [...prev.blocks, newBlock] }));
    onSelectBlock(newBlock.id);
  };

  // Dragging logic
  const handlePointerDown = (blockId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    const block = doc.blocks.find((b) => b.id === blockId);
    if (!block) return;

    setDraggingBlockId(blockId);
    onSelectBlock(blockId);
    dragStartPos.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      blockX: block.x ?? 40,
      blockY: block.y ?? 40,
    };

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingBlockId || !dragStartPos.current) return;

    const deltaX = e.clientX - dragStartPos.current.mouseX;
    const deltaY = e.clientY - dragStartPos.current.mouseY;

    // Snap to 20px grid
    const targetX = Math.max(20, Math.round((dragStartPos.current.blockX + deltaX) / 20) * 20);
    const targetY = Math.max(20, Math.round((dragStartPos.current.blockY + deltaY) / 20) * 20);

    onChangeDoc((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) => {
        if (b.id !== draggingBlockId) return b;
        return { ...b, x: targetX, y: targetY };
      }),
    }));
  };

  const handlePointerUp = () => {
    setDraggingBlockId(null);
    dragStartPos.current = null;
  };

  // Clean auto-arrange algorithm: sorts, aligns, removes overlaps, and arranges cleanly
  const handleAutoArrangeInternal = () => {
    if (onAutoArrange) {
      onAutoArrange();
      return;
    }

    // Sort by y then x
    const sorted = [...doc.blocks].sort((a, b) => {
      const yA = a.y ?? 0;
      const yB = b.y ?? 0;
      if (Math.abs(yA - yB) > 20) return yA - yB;
      return (a.x ?? 0) - (b.x ?? 0);
    });

    let currentY = 20;
    let prevRowY = -100;
    let currentX = 40;

    const arranged = sorted.map((block) => {
      const origX = block.x ?? 40;
      const origY = block.y ?? 0;

      // If text heading:
      if (block.type === 'text' && block.textData?.isHeading) {
        currentY = Math.round((currentY + 20) / 20) * 20;
        const b = { ...block, x: 40, y: currentY };
        currentY += 40;
        currentX = 40;
        return b;
      }

      // If plot:
      if (block.type === 'plot') {
        currentY = Math.round((currentY + 20) / 20) * 20;
        const b = { ...block, x: 40, y: currentY };
        currentY += 280;
        currentX = 40;
        return b;
      }

      // If math block or regular text:
      // Check if it was placed on the right side (side-by-side with previous item)
      if (origX >= 280 && Math.abs(origY - prevRowY) < 30) {
        // Place in right column on same Y
        const b = { ...block, x: 320, y: prevRowY };
        currentY = Math.max(currentY, prevRowY + 40);
        currentX = 40;
        return b;
      } else {
        // Place in left column
        currentY = Math.round(currentY / 20) * 20;
        const b = { ...block, x: 40, y: currentY };
        prevRowY = currentY;
        currentY += 40;
        currentX = 320;
        return b;
      }
    });

    onChangeDoc({ ...doc, blocks: arranged });
  };

  const toggleLayoutMode = () => {
    const nextMode = doc.layoutMode === 'flow' ? 'freeform' : 'flow';
    onChangeDoc({ ...doc, layoutMode: nextMode });
  };

  return (
    <div
      className={`min-h-[calc(100vh-8rem)] py-6 px-3 sm:px-6 transition-colors ${
        doc.showGrid
          ? 'bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:20px_20px] bg-slate-50/80'
          : 'bg-slate-100'
      }`}
    >
      <div className="max-w-5xl mx-auto space-y-2">
        {/* Top Info & Rearrange Controls */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <MousePointerClick className="w-3.5 h-3.5 text-indigo-600" />
              <span>Arbeitsblatt:</span>
            </span>
            <span className="hidden sm:inline">
              Klicke an jede beliebige Stelle – der Cursor erscheint direkt auf dem Papier.
            </span>
          </div>

          <div className="flex items-center gap-2">
            {selectedBlockId && (
              <button
                onClick={() => handleDeleteBlock(selectedBlockId)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition-colors shadow-2xs font-medium animate-fadeIn"
                title="Ausgewählte Formel löschen (Entf-Taste)"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Löschen (Entf)</span>
              </button>
            )}

            <button
              onClick={handleAutoArrangeInternal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:text-indigo-700 hover:bg-slate-50 transition-colors shadow-2xs"
              title="Alle Ausdrücke sauber sortieren und am Raster ausrichten"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-indigo-600" />
              <span>Neu anordnen</span>
            </button>

            <button
              onClick={toggleLayoutMode}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Layers className="w-3 h-3 text-slate-500" />
              <span>{isFreeform ? '2D-Freiform' : 'Zeilenmodus'}</span>
            </button>
          </div>
        </div>

        {/* The Worksheet Canvas (Paper Pad) */}
        <div
          ref={canvasRef}
          id="worksheet-inner"
          onClick={handleCanvasClick}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{ minHeight: `${computedMinHeight}px` }}
          className={`relative bg-white rounded-2xl shadow-sm border border-slate-200/90 p-6 sm:p-10 transition-all cursor-text ${
            doc.showGrid
              ? 'bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:20px_20px]'
              : 'bg-white'
          }`}
        >
          {/* Document Header (Editable title and description) */}
          <div id="worksheet-header" className="border-b border-slate-200/80 pb-3 mb-6 relative pointer-events-auto">
            <input
              type="text"
              value={doc.title}
              onChange={(e) => onChangeDoc((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Arbeitsblatt Titel..."
              className="w-full text-2xl sm:text-3xl font-extrabold text-slate-900 bg-transparent outline-none border-none p-0 focus:ring-0"
            />
            <input
              type="text"
              value={doc.description}
              onChange={(e) => onChangeDoc((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Optionale Notiz..."
              className="w-full text-xs sm:text-sm text-slate-400 bg-transparent outline-none border-none p-0 mt-0.5 focus:ring-0"
            />
          </div>

          {/* Empty state prompt if 0 blocks (pointer-events-none so mouse clicks cleanly place a cursor anywhere) */}
          {evaluatedBlocks.length === 0 && (
            <div className="py-24 text-center border border-dashed border-slate-200 rounded-xl space-y-2 pointer-events-none select-none">
              <Calculator className="w-8 h-8 text-indigo-400 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-700">
                Klicke an eine beliebige Stelle, um zu rechnen
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Tippe direkt los: <span className="font-mono text-indigo-600 font-bold">L := 10 m</span> oder <span className="font-mono text-indigo-600 font-bold">f(x) := x^2</span>.
              </p>
            </div>
          )}

          {/* Blocks Rendering */}
          {isFreeform ? (
            /* 2D Free-Form Spatial Canvas (Mathcad style: frameless, clean text) */
            <div
              ref={blocksPlaneRef}
              id="worksheet-blocks-plane"
              style={{ minHeight: `${Math.max(600, computedMinHeight - 120)}px` }}
              className="relative w-full"
            >
              {evaluatedBlocks.map((block) => (
                <React.Fragment key={block.id}>
                  {block.type === 'math' && block.mathData && (
                    <MathBlockView
                      id={block.id}
                      data={block.mathData}
                      onChange={(val) => handleUpdateMath(block.id, val)}
                      onDelete={() => handleDeleteBlock(block.id)}
                      onDuplicate={() => handleDuplicateBlock(block.id)}
                      isSelected={selectedBlockId === block.id}
                      onSelect={() => onSelectBlock(block.id)}
                      isAbsolute={true}
                      x={block.x ?? 40}
                      y={block.y ?? 40}
                      width={block.width}
                      onDragStart={(e) => handlePointerDown(block.id, e)}
                    />
                  )}

                  {block.type === 'text' && block.textData && (
                    <TextBlockView
                      id={block.id}
                      data={block.textData}
                      onChange={(val) => handleUpdateText(block.id, val)}
                      onDelete={() => handleDeleteBlock(block.id)}
                      isSelected={selectedBlockId === block.id}
                      onSelect={() => onSelectBlock(block.id)}
                      isAbsolute={true}
                      x={block.x ?? 40}
                      y={block.y ?? 40}
                      width={block.width}
                      onDragStart={(e) => handlePointerDown(block.id, e)}
                    />
                  )}

                  {block.type === 'plot' && block.plotData && (
                    <PlotBlockView
                      id={block.id}
                      data={block.plotData}
                      onChange={(val) => handleUpdatePlot(block.id, val)}
                      onDelete={() => handleDeleteBlock(block.id)}
                      isSelected={selectedBlockId === block.id}
                      onSelect={() => onSelectBlock(block.id)}
                      isAbsolute={true}
                      x={block.x ?? 40}
                      y={block.y ?? 40}
                      width={block.width}
                      onDragStart={(e) => handlePointerDown(block.id, e)}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          ) : (
            /* Flow / List Mode */
            <div className="space-y-4">
              {evaluatedBlocks.map((block) => (
                <React.Fragment key={block.id}>
                  {block.type === 'math' && block.mathData && (
                    <MathBlockView
                      id={block.id}
                      data={block.mathData}
                      onChange={(val) => handleUpdateMath(block.id, val)}
                      onDelete={() => handleDeleteBlock(block.id)}
                      onDuplicate={() => handleDuplicateBlock(block.id)}
                      isSelected={selectedBlockId === block.id}
                      onSelect={() => onSelectBlock(block.id)}
                      isAbsolute={false}
                    />
                  )}

                  {block.type === 'text' && block.textData && (
                    <TextBlockView
                      id={block.id}
                      data={block.textData}
                      onChange={(val) => handleUpdateText(block.id, val)}
                      onDelete={() => handleDeleteBlock(block.id)}
                      isSelected={selectedBlockId === block.id}
                      onSelect={() => onSelectBlock(block.id)}
                      isAbsolute={false}
                    />
                  )}

                  {block.type === 'plot' && block.plotData && (
                    <PlotBlockView
                      id={block.id}
                      data={block.plotData}
                      onChange={(val) => handleUpdatePlot(block.id, val)}
                      onDelete={() => handleDeleteBlock(block.id)}
                      isSelected={selectedBlockId === block.id}
                      onSelect={() => onSelectBlock(block.id)}
                      isAbsolute={false}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
