import React from 'react';
import { FilePlus, HelpCircle, Laptop } from 'lucide-react';

interface HeaderProps {
  onNewSheet: () => void;
  onOpenHelp: () => void;
  onLoadTemplate: (key: string) => void;
  activeTemplate: string | null;
  onOpenWindowsInstall: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNewSheet,
  onOpenHelp,
  onLoadTemplate,
  activeTemplate,
  onOpenWindowsInstall,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-mono font-black text-lg shadow-xs">
            :=
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            MatheLab
          </span>
        </div>

        {/* Zone 2: 4-5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => onLoadTemplate('statik')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-0.5 border-b-2 ${
              activeTemplate === 'statik'
                ? 'text-indigo-600 border-indigo-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Statik-Vorlage
          </button>
          <button
            onClick={() => onLoadTemplate('physik')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-0.5 border-b-2 ${
              activeTemplate === 'physik'
                ? 'text-indigo-600 border-indigo-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Physik-Vorlage
          </button>
          <button
            onClick={() => onLoadTemplate('elektrotechnik')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-0.5 border-b-2 ${
              activeTemplate === 'elektrotechnik'
                ? 'text-indigo-600 border-indigo-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Elektrotechnik
          </button>
          <button
            onClick={() => onLoadTemplate('kurvendiskussion')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-0.5 border-b-2 ${
              activeTemplate === 'kurvendiskussion'
                ? 'text-indigo-600 border-indigo-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Kurvendiskussion
          </button>
          <button
            onClick={onOpenHelp}
            className="whitespace-nowrap shrink-0 text-slate-500 hover:text-indigo-600 transition-colors pb-0.5 border-b-2 border-transparent flex items-center gap-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Syntax</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action cluster */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenWindowsInstall}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-700 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
            title="Als Windows-App installieren"
          >
            <Laptop className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Windows-App</span>
          </button>

          <button
            onClick={onNewSheet}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
          >
            <FilePlus className="w-3.5 h-3.5" />
            <span>Neues Blatt</span>
          </button>
        </div>
      </div>
    </header>
  );
};
