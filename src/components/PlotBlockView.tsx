import React, { useState, useMemo } from 'react';
import { PlotBlockData } from '../types/mathcad';
import { evaluatePlotPoints } from '../utils/mathEngine';
import { 
  Trash2, 
  AlertCircle,
  GripVertical
} from 'lucide-react';

interface PlotBlockViewProps {
  id?: string;
  data: PlotBlockData;
  onChange: (newData: PlotBlockData) => void;
  onDelete: () => void;
  isSelected?: boolean;
  onSelect: () => void;
  isAbsolute?: boolean;
  x?: number;
  y?: number;
  width?: number;
  onDragStart?: (e: React.PointerEvent) => void;
}

export const PlotBlockView: React.FC<PlotBlockViewProps> = ({
  id,
  data,
  onChange,
  onDelete,
  isSelected,
  onSelect,
  isAbsolute,
  x,
  y,
  width,
  onDragStart,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number } | null>(null);

  const plotResult = useMemo(() => {
    return evaluatePlotPoints(data.fn, data.varName || 'x', data.xMin, data.xMax);
  }, [data.fn, data.varName, data.xMin, data.xMax]);

  const plotWidth = width ?? 620;
  const height = 240;
  const padding = { top: 20, right: 25, bottom: 30, left: 50 };

  const innerWidth = plotWidth - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const { points, error, yMin, yMax } = plotResult;

  const scaleX = (valX: number) => {
    return padding.left + ((valX - data.xMin) / (data.xMax - data.xMin)) * innerWidth;
  };

  const scaleY = (valY: number) => {
    return padding.top + innerHeight - ((valY - yMin) / (yMax - yMin)) * innerHeight;
  };

  const pathData = useMemo(() => {
    if (points.length < 2) return '';
    return points.reduce((acc, pt, idx) => {
      const px = scaleX(pt.x);
      const py = scaleY(pt.y);
      return idx === 0 ? `M ${px} ${py}` : `${acc} L ${px} ${py}`;
    }, '');
  }, [points, data.xMin, data.xMax, yMin, yMax]);

  const style: React.CSSProperties = isAbsolute
    ? {
        position: 'absolute',
        left: `${x ?? 40}px`,
        top: `${y ?? 40}px`,
        width: `${plotWidth}px`,
      }
    : {};

  return (
    <div
      data-block-id={id || 'plot-block'}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`group p-3.5 rounded-xl border transition-all ${
        isSelected
          ? 'bg-white border-indigo-500 shadow-md ring-2 ring-indigo-200/80 z-20'
          : 'bg-white/95 hover:bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs z-10'
      }`}
    >
      {/* Title & Plot settings */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          {isAbsolute && onDragStart && (
            <div
              onPointerDown={onDragStart}
              className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-600 p-0.5 rounded touch-none -ml-1"
              title="Ziehen, um an beliebige Stelle zu verschieben"
            >
              <GripVertical className="w-4 h-4" />
            </div>
          )}
          <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider">
            2D Graph:
          </span>
          <input
            type="text"
            value={data.title || ''}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            placeholder="Plot Titel"
            className="text-xs font-bold text-slate-800 bg-transparent outline-none"
          />
        </div>

        {/* Function expression input */}
        <div className="flex items-center gap-1 text-xs font-mono">
          <span className="text-indigo-600 font-bold">f({data.varName || 'x'}) =</span>
          <input
            type="text"
            value={data.fn}
            onChange={(e) => onChange({ ...data, fn: e.target.value })}
            className="px-2 py-0.5 rounded border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none text-slate-900 font-semibold text-xs"
          />
        </div>

        {/* Range Controls & Delete button */}
        <div className="flex items-center gap-1.5 text-2xs text-slate-500 font-mono">
          <span>von</span>
          <input
            type="number"
            value={data.xMin}
            onChange={(e) => onChange({ ...data, xMin: parseFloat(e.target.value) || 0 })}
            className="w-12 px-1 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-800 text-center"
          />
          <span>bis</span>
          <input
            type="number"
            value={data.xMax}
            onChange={(e) => onChange({ ...data, xMax: parseFloat(e.target.value) || 1 })}
            className="w-12 px-1 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-800 text-center"
          />
          <button
            onPointerDown={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 ml-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
            title="Plot löschen"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative bg-slate-50/70 rounded-lg border border-slate-200/80 overflow-hidden flex justify-center">
        {error ? (
          <div className="h-44 flex flex-col items-center justify-center text-xs text-rose-600 gap-1.5 p-4">
            <AlertCircle className="w-5 h-5 text-rose-500" />
            <span>{error}</span>
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${plotWidth} ${height}`}
            className="w-full h-auto select-none"
            onMouseLeave={() => setHoveredPoint(null)}
          >
            {/* Grid lines (horizontal) */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
              const yVal = yMin + (yMax - yMin) * (1 - pct);
              const py = padding.top + pct * innerHeight;
              return (
                <g key={idx}>
                  <line
                    x1={padding.left}
                    y1={py}
                    x2={padding.left + innerWidth}
                    y2={py}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 5}
                    y={py + 3}
                    textAnchor="end"
                    className="text-3xs font-mono fill-slate-400"
                  >
                    {yVal.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {/* Grid lines (vertical) */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
              const xVal = data.xMin + (data.xMax - data.xMin) * pct;
              const px = padding.left + pct * innerWidth;
              return (
                <g key={idx}>
                  <line
                    x1={px}
                    y1={padding.top}
                    x2={px}
                    y2={padding.top + innerHeight}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />
                  <text
                    x={px}
                    y={padding.top + innerHeight + 12}
                    textAnchor="middle"
                    className="text-3xs font-mono fill-slate-400"
                  >
                    {xVal.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {/* Zero axes if within range */}
            {yMin <= 0 && yMax >= 0 && (
              <line
                x1={padding.left}
                y1={scaleY(0)}
                x2={padding.left + innerWidth}
                y2={scaleY(0)}
                stroke="#94a3b8"
                strokeWidth="1.5"
              />
            )}

            {data.xMin <= 0 && data.xMax >= 0 && (
              <line
                x1={scaleX(0)}
                y1={padding.top}
                x2={scaleX(0)}
                y2={padding.top + innerHeight}
                stroke="#94a3b8"
                strokeWidth="1.5"
              />
            )}

            {/* Plot curve */}
            <path
              d={pathData}
              fill="none"
              stroke="#4f46e5"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Hover overlay points */}
            {points.map((pt, i) => {
              const px = scaleX(pt.x);
              const py = scaleY(pt.y);
              return (
                <circle
                  key={i}
                  cx={px}
                  cy={py}
                  r="5"
                  fill="transparent"
                  className="cursor-crosshair hover:fill-indigo-600 transition-colors"
                  onMouseEnter={() => setHoveredPoint(pt)}
                />
              );
            })}
          </svg>
        )}

        {hoveredPoint && (
          <div className="absolute top-2 right-2 bg-slate-900/90 text-white font-mono text-2xs px-2 py-0.5 rounded shadow-sm pointer-events-none tabular-nums">
            x = {hoveredPoint.x.toFixed(2)}, y = {hoveredPoint.y.toFixed(2)}
          </div>
        )}
      </div>

      {/* Hover action toolbar */}
      <div className="absolute right-1 -top-3.5 hidden group-hover:flex items-center gap-0.5 bg-white border border-slate-200 shadow-sm rounded-md px-1 py-0.5 z-30">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
          title="Löschen"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
