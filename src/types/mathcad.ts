export type BlockType = 'math' | 'text' | 'plot';

export interface MathBlockData {
  raw: string; // e.g. "a := 15 m", "b := 4 m", "A := a * b", "A ="
  result?: string; // e.g. "60 m^2"
  resultNum?: number;
  unit?: string;
  error?: string;
  varName?: string; // if assignment: "a"
  isFunction?: boolean; // e.g. "f(x) := ..."
  funcName?: string;
}

export interface TextBlockData {
  content: string;
  isHeading?: boolean;
}

export interface PlotBlockData {
  fn: string; // e.g. "f(x)" or "sin(x) * exp(-0.2 * x)"
  varName: string; // e.g. "x"
  xMin: number;
  xMax: number;
  yMin?: number;
  yMax?: number;
  title?: string;
}

export interface WorksheetBlock {
  id: string;
  type: BlockType;
  x?: number; // 2D canvas X coordinate
  y?: number; // 2D canvas Y coordinate
  width?: number;
  height?: number;
  mathData?: MathBlockData;
  textData?: TextBlockData;
  plotData?: PlotBlockData;
}

export interface WorksheetDoc {
  id: string;
  title: string;
  description: string;
  blocks: WorksheetBlock[];
  showGrid: boolean;
  layoutMode?: 'freeform' | 'flow'; // 'freeform' = 2D spatial canvas anywhere, 'flow' = vertical document
  canvasHeight?: number;
  createdAt: string;
  updatedAt: string;
}
