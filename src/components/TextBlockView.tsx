import React, { useRef, useEffect, useState } from 'react';
import { TextBlockData } from '../types/mathcad';
import { 
  Trash2, 
  Heading, 
  AlignLeft,
  GripHorizontal
} from 'lucide-react';

interface TextBlockViewProps {
  id?: string;
  data: TextBlockData;
  onChange: (newData: TextBlockData) => void;
  onDelete: () => void;
  isSelected?: boolean;
  onSelect: () => void;
  isAbsolute?: boolean;
  x?: number;
  y?: number;
  width?: number;
  onDragStart?: (e: React.PointerEvent) => void;
}

export const TextBlockView: React.FC<TextBlockViewProps> = ({
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const isDeletedRef = useRef(false);

  const handleDelete = () => {
    if (isDeletedRef.current) return;
    isDeletedRef.current = true;
    onDelete();
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [data.content]);

  useEffect(() => {
    if (isSelected && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isSelected]);

  const toggleHeading = () => {
    onChange({
      ...data,
      isHeading: !data.isHeading,
    });
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (data.content.trim() === '') {
      handleDelete();
    }
  };

  const style: React.CSSProperties = isAbsolute
    ? {
        position: 'absolute',
        left: `${x ?? 40}px`,
        top: `${y ?? 40}px`,
        width: width ? `${width}px` : '480px',
      }
    : {};

  return (
    <div
      data-block-id={id || 'text-block'}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
        textareaRef.current?.focus();
      }}
      className={`group relative transition-all py-1 px-1.5 rounded-md ${
        isSelected || isFocused
          ? 'z-30 outline-1 outline-blue-500/80 outline-offset-2 bg-blue-50/10'
          : 'hover:outline-1 hover:outline-slate-300/80 hover:outline-offset-2 z-10'
      }`}
    >
      <div className="flex items-start">
        {/* Discreet drag grip on hover/select */}
        {isAbsolute && onDragStart && (
          <div
            onPointerDown={onDragStart}
            className={`cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-700 transition-opacity p-1 -ml-2 mr-1 touch-none mt-0.5 ${
              isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
            title="Verschieben (ziehen)"
          >
            <GripHorizontal className="w-4 h-4" />
          </div>
        )}

        <textarea
          ref={textareaRef}
          rows={1}
          value={data.content}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          onChange={(e) => onChange({ ...data, content: e.target.value })}
          placeholder=""
          className={`w-full bg-transparent resize-none outline-none border-none p-0 leading-relaxed text-slate-800 caret-blue-600 focus:ring-0 ${
            data.isHeading
              ? 'text-lg sm:text-xl font-bold text-slate-900'
              : 'text-sm sm:text-base font-normal text-slate-700'
          }`}
        />

        {/* Action Toolbar */}
        <div
          className={`items-center gap-0.5 ml-2 transition-opacity ${
            isSelected ? 'flex opacity-100' : 'hidden group-hover:flex opacity-90 hover:opacity-100'
          }`}
        >
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              toggleHeading();
            }}
            className={`p-1 rounded transition-colors ${
              data.isHeading ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title={data.isHeading ? 'Als normalen Text formatieren' : 'Als Überschrift formatieren'}
          >
            {data.isHeading ? <Heading className="w-3.5 h-3.5" /> : <AlignLeft className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
            title="Textblock löschen (oder Entf-Taste drücken)"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500 hover:text-rose-700" />
          </button>
        </div>
      </div>
    </div>
  );
};
