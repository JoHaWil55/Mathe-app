import React, { useState } from 'react';
import { sounds } from '../utils/audio';
import { PieChart, Shapes, TrendingUp, Sparkles } from 'lucide-react';

export const VisualMathLab: React.FC = () => {
  const [subTab, setSubTab] = useState<'fractions' | 'geometry' | 'numberline'>('fractions');

  // Fractions state
  const [numA, setNumA] = useState<number>(3);
  const [denA, setDenA] = useState<number>(4);
  const [numB, setNumB] = useState<number>(1);
  const [denB, setDenB] = useState<number>(3);
  const [showAddition, setShowAddition] = useState<boolean>(true);

  // Geometry state
  const [geoShape, setGeoShape] = useState<'rect' | 'triangle' | 'circle'>('rect');
  const [rectWidth, setRectWidth] = useState<number>(6);
  const [rectHeight, setRectHeight] = useState<number>(4);
  const [triBase, setTriBase] = useState<number>(8);
  const [triHeight, setTriHeight] = useState<number>(5);
  const [circleRadius, setCircleRadius] = useState<number>(4);

  // Number line state
  const [numLineStart, setNumLineStart] = useState<number>(24);
  const [numLineJump, setNumLineJump] = useState<number>(18);

  // Fractions math helper
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const lcm = (a: number, b: number): number => (a * b) / gcd(a, b);

  const commonDen = lcm(denA, denB);
  const equivA = numA * (commonDen / denA);
  const equivB = numB * (commonDen / denB);
  const sumNum = equivA + equivB;
  const commonGcd = gcd(sumNum, commonDen);
  const simplifiedNum = sumNum / commonGcd;
  const simplifiedDen = commonDen / commonGcd;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Visuelles Mathe-Labor</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mathematik begreifen durch interaktive Diagramme, Brüche und Geometrie.
          </p>
        </div>

        {/* Sub-tab picker */}
        <div className="flex items-center p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => {
              setSubTab('fractions');
              sounds.playClick();
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors ${
              subTab === 'fractions'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Brüche & Anteile</span>
          </button>
          <button
            onClick={() => {
              setSubTab('geometry');
              sounds.playClick();
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors ${
              subTab === 'geometry'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shapes className="w-3.5 h-3.5" />
            <span>Fläche & Geometrie</span>
          </button>
          <button
            onClick={() => {
              setSubTab('numberline');
              sounds.playClick();
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors ${
              subTab === 'numberline'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Zahlenstrahl</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: FRACTIONS */}
      {subTab === 'fractions' && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Bruch einstellen
            </h3>

            {/* Fraction 1 */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Erster Bruch:</span>
                <span className="font-mono font-extrabold text-xl text-indigo-600 tabular-nums">
                  {numA} / {denA}
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Zähler (Anteile): {numA}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max={denA}
                  value={numA}
                  onChange={(e) => setNumA(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Nenner (Ganzes geteilt in): {denA}</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="12"
                  value={denA}
                  onChange={(e) => {
                    const nextDen = parseInt(e.target.value, 10);
                    setDenA(nextDen);
                    if (numA > nextDen) setNumA(nextDen);
                  }}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Toggle Addition Explorer */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-semibold text-slate-700">Zweiten Bruch addieren (+)</span>
              <button
                onClick={() => {
                  setShowAddition(!showAddition);
                  sounds.playClick();
                }}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  showAddition ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-md" />
              </button>
            </div>

            {showAddition && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Zweiter Bruch:</span>
                  <span className="font-mono font-extrabold text-xl text-purple-600 tabular-nums">
                    {numB} / {denB}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Zähler: {numB}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max={denB}
                    value={numB}
                    onChange={(e) => setNumB(parseInt(e.target.value, 10))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Nenner: {denB}</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="12"
                    value={denB}
                    onChange={(e) => {
                      const nextDen = parseInt(e.target.value, 10);
                      setDenB(nextDen);
                      if (numB > nextDen) setNumB(nextDen);
                    }}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Visualization Canvas */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Visuelle Darstellung
            </h3>

            {/* Fraction 1 Pie & Bar */}
            <div className="p-4 rounded-xl bg-indigo-50/40 border border-indigo-100 flex flex-col sm:flex-row items-center gap-6">
              {/* Circular Pie Chart */}
              <div className="relative w-36 h-36 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="#e0e7ff" />
                  {Array.from({ length: denA }).map((_, i) => {
                    const angle = (360 / denA) * i;
                    const rad = (angle * Math.PI) / 180;
                    const x = 50 + 42 * Math.cos(rad);
                    const y = 50 + 42 * Math.sin(rad);
                    return (
                      <line
                        key={i}
                        x1="50"
                        y1="50"
                        x2={x}
                        y2={y}
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    );
                  })}
                  {/* Filled slice */}
                  <circle
                    cx="50"
                    cy="50"
                    r="21"
                    fill="transparent"
                    stroke="#4f46e5"
                    strokeWidth="42"
                    strokeDasharray={`${(numA / denA) * (2 * Math.PI * 21)} 1000`}
                  />
                </svg>
              </div>

              {/* Bar and Stats */}
              <div className="flex-1 w-full space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-lg">
                    {numA} / {denA}
                  </span>
                  <span className="text-xs font-mono font-semibold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                    {((numA / denA) * 100).toFixed(1)}% · {(numA / denA).toFixed(3)}
                  </span>
                </div>

                {/* Segmented Bar */}
                <div className="h-8 w-full bg-slate-100 rounded-lg overflow-hidden flex border border-slate-200">
                  {Array.from({ length: denA }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-full border-r border-white/60 transition-colors ${
                        i < numA ? 'bg-indigo-600' : 'bg-slate-100'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs text-slate-500">
                  {numA} von {denA} gleich großen Teilen sind markiert.
                </div>
              </div>
            </div>

            {/* Addition Result */}
            {showAddition && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Addition auf den Hauptnenner:</span>
                </div>

                <div className="font-mono text-base font-semibold text-slate-900 bg-white p-3 rounded-lg border border-slate-200 text-center">
                  <span className="text-indigo-600">{numA}/{denA}</span>
                  <span className="mx-2 text-slate-400">+</span>
                  <span className="text-purple-600">{numB}/{denB}</span>
                  <span className="mx-2 text-slate-400">=</span>
                  <span>{equivA}/{commonDen} + {equivB}/{commonDen}</span>
                  <span className="mx-2 text-slate-400">=</span>
                  <span className="text-emerald-700 font-extrabold">{sumNum}/{commonDen}</span>
                  {commonGcd > 1 && (
                    <span className="text-slate-500 text-sm ml-2">
                      (gekürzt: {simplifiedNum}/{simplifiedDen})
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-500 leading-relaxed">
                  Hauptnenner ist das kleinste gemeinsame Vielfache (kgV): {commonDen}.
                  Bruch 1 wurde mit {commonDen / denA} erweitert, Bruch 2 mit {commonDen / denB}.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: GEOMETRY */}
      {subTab === 'geometry' && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => setGeoShape('rect')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md ${
                  geoShape === 'rect' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                Rechteck
              </button>
              <button
                onClick={() => setGeoShape('triangle')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md ${
                  geoShape === 'triangle' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                Dreieck
              </button>
              <button
                onClick={() => setGeoShape('circle')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md ${
                  geoShape === 'circle' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                Kreis
              </button>
            </div>

            {geoShape === 'rect' && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>Breite (a):</span>
                    <span className="font-mono font-bold text-slate-900">{rectWidth} cm</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="12"
                    value={rectWidth}
                    onChange={(e) => setRectWidth(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>Höhe (b):</span>
                    <span className="font-mono font-bold text-slate-900">{rectHeight} cm</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="10"
                    value={rectHeight}
                    onChange={(e) => setRectHeight(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {geoShape === 'triangle' && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>Grundseite (g):</span>
                    <span className="font-mono font-bold text-slate-900">{triBase} cm</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="14"
                    value={triBase}
                    onChange={(e) => setTriBase(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>Höhe (h):</span>
                    <span className="font-mono font-bold text-slate-900">{triHeight} cm</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="10"
                    value={triHeight}
                    onChange={(e) => setTriHeight(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {geoShape === 'circle' && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>Radius (r):</span>
                    <span className="font-mono font-bold text-slate-900">{circleRadius} cm</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="8"
                    value={circleRadius}
                    onChange={(e) => setCircleRadius(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
                <div className="text-xs text-slate-500">
                  Durchmesser (d) = 2 · r = {circleRadius * 2} cm
                </div>
              </div>
            )}

            {/* Calculations Card */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Formeln & Werte
              </div>

              {geoShape === 'rect' && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Fläche A = a · b:</span>
                    <span className="font-mono font-bold text-indigo-700">
                      {rectWidth * rectHeight} cm²
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Umfang U = 2a + 2b:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {2 * (rectWidth + rectHeight)} cm
                    </span>
                  </div>
                </>
              )}

              {geoShape === 'triangle' && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Fläche A = ½ · g · h:</span>
                    <span className="font-mono font-bold text-indigo-700">
                      {((triBase * triHeight) / 2).toFixed(1)} cm²
                    </span>
                  </div>
                </>
              )}

              {geoShape === 'circle' && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Fläche A = π · r²:</span>
                    <span className="font-mono font-bold text-indigo-700">
                      {(Math.PI * circleRadius * circleRadius).toFixed(2)} cm²
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Umfang U = 2 · π · r:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {(2 * Math.PI * circleRadius).toFixed(2)} cm
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Canvas Display */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[360px]">
            {geoShape === 'rect' && (
              <div className="relative">
                <div
                  className="bg-indigo-100 border-2 border-indigo-600 rounded-sm relative flex items-center justify-center transition-all"
                  style={{
                    width: `${rectWidth * 28}px`,
                    height: `${rectHeight * 28}px`,
                  }}
                >
                  <span className="font-mono font-bold text-indigo-900 text-lg">
                    {rectWidth * rectHeight} cm²
                  </span>
                </div>
                <div className="text-center font-mono text-xs text-slate-600 mt-2 font-semibold">
                  a = {rectWidth} cm
                </div>
                <div className="absolute -left-12 top-1/2 -translate-y-1/2 font-mono text-xs text-slate-600 font-semibold -rotate-90">
                  b = {rectHeight} cm
                </div>
              </div>
            )}

            {geoShape === 'triangle' && (
              <div className="relative flex flex-col items-center">
                <svg
                  width={triBase * 24 + 40}
                  height={triHeight * 24 + 40}
                  className="overflow-visible"
                >
                  {/* Triangle path */}
                  <polygon
                    points={`20,${triHeight * 24 + 20} ${triBase * 24 + 20},${triHeight * 24 + 20} ${
                      (triBase * 24) / 2 + 20
                    },20`}
                    fill="#e0e7ff"
                    stroke="#4f46e5"
                    strokeWidth="2"
                  />
                  {/* Height dashed line */}
                  <line
                    x1={(triBase * 24) / 2 + 20}
                    y1="20"
                    x2={(triBase * 24) / 2 + 20}
                    y2={triHeight * 24 + 20}
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                </svg>
                <div className="font-mono text-xs text-slate-600 mt-2 font-semibold">
                  Grundseite g = {triBase} cm · Höhe h = {triHeight} cm
                </div>
              </div>
            )}

            {geoShape === 'circle' && (
              <div className="relative flex flex-col items-center">
                <div
                  className="rounded-full bg-indigo-100 border-2 border-indigo-600 relative flex items-center justify-center transition-all"
                  style={{
                    width: `${circleRadius * 36}px`,
                    height: `${circleRadius * 36}px`,
                  }}
                >
                  {/* Center dot */}
                  <div className="w-2.5 h-2.5 bg-indigo-700 rounded-full" />
                  {/* Radius line */}
                  <div
                    className="absolute h-0.5 bg-indigo-700 top-1/2 left-1/2 origin-left"
                    style={{ width: `${(circleRadius * 36) / 2}px` }}
                  />
                </div>
                <div className="font-mono text-xs text-slate-600 mt-4 font-semibold">
                  Radius r = {circleRadius} cm
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: NUMBER LINE */}
      {subTab === 'numberline' && (
        <div className="mt-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8">
          <div className="max-w-md mx-auto space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Startwert:</span>
                <span className="font-mono font-bold text-slate-900">{numLineStart}</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={numLineStart}
                onChange={(e) => setNumLineStart(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Sprung (+ oder −):</span>
                <span className="font-mono font-bold text-indigo-700">
                  {numLineJump >= 0 ? `+${numLineJump}` : numLineJump}
                </span>
              </div>
              <input
                type="range"
                min="-30"
                max="30"
                value={numLineJump}
                onChange={(e) => setNumLineJump(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center font-mono text-xl font-bold text-slate-900">
              {numLineStart} {numLineJump >= 0 ? `+ ${numLineJump}` : `− ${Math.abs(numLineJump)}`} ={' '}
              <span className="text-indigo-600">{numLineStart + numLineJump}</span>
            </div>
          </div>

          {/* Visual Number Line representation */}
          <div className="overflow-x-auto py-8 px-4">
            <div className="relative min-w-[700px] h-28 flex items-end">
              {/* Horizontal line */}
              <div className="absolute bottom-6 left-0 right-0 h-1 bg-slate-400 rounded-full" />

              {/* Ticks from 0 to 100 in steps of 5 */}
              {Array.from({ length: 21 }).map((_, i) => {
                const val = i * 5;
                const isTen = val % 10 === 0;
                const percent = (val / 100) * 100;
                return (
                  <div
                    key={val}
                    className="absolute flex flex-col items-center -translate-x-1/2"
                    style={{ left: `${percent}%`, bottom: '24px' }}
                  >
                    <div
                      className={`w-0.5 bg-slate-600 ${isTen ? 'h-4' : 'h-2'}`}
                    />
                    {isTen && (
                      <span className="font-mono text-xs text-slate-600 mt-1 select-none">
                        {val}
                      </span>
                    )}
                  </div>
                );
              })}

              {/* Start marker */}
              <div
                className="absolute z-10 -translate-x-1/2 flex flex-col items-center transition-all duration-300"
                style={{ left: `${Math.max(0, Math.min(100, numLineStart))}%`, bottom: '24px' }}
              >
                <div className="w-4 h-4 rounded-full bg-slate-800 border-2 border-white shadow-sm" />
                <span className="text-2xs font-mono font-bold text-slate-800 -bottom-6 absolute whitespace-nowrap">
                  Start ({numLineStart})
                </span>
              </div>

              {/* Target marker */}
              <div
                className="absolute z-10 -translate-x-1/2 flex flex-col items-center transition-all duration-300"
                style={{
                  left: `${Math.max(0, Math.min(100, numLineStart + numLineJump))}%`,
                  bottom: '24px',
                }}
              >
                <div className="w-4 h-4 rounded-full bg-indigo-600 border-2 border-white shadow-sm" />
                <span className="text-2xs font-mono font-bold text-indigo-700 -bottom-6 absolute whitespace-nowrap">
                  Ziel ({numLineStart + numLineJump})
                </span>
              </div>

              {/* Jump Arc */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {(() => {
                  const x1 = (numLineStart / 100) * 100;
                  const x2 = ((numLineStart + numLineJump) / 100) * 100;
                  const midX = (x1 + x2) / 2;
                  const arcHeight = Math.min(60, Math.abs(x2 - x1) * 2 + 20);

                  return (
                    <path
                      d={`M ${x1}% 85 Q ${midX}% ${85 - arcHeight} ${x2}% 85`}
                      fill="none"
                      stroke="#4f46e5"
                      strokeWidth="2.5"
                      strokeDasharray="4 4"
                    />
                  );
                })()}
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
