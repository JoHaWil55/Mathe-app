import * as math from 'mathjs';
import { WorksheetBlock } from '../types/mathcad';

// Safe wrapper around mathjs evaluate
export function evaluateWorksheet(
  blocks: WorksheetBlock[],
  isFreeform: boolean = true
): WorksheetBlock[] {
  // Fresh scope for sequential evaluation
  const scope: Record<string, unknown> = {};

  // If in freeform mode, determine execution order by Mathcad 2D spatial rule:
  // Top-to-bottom, and for blocks at roughly the same height, left-to-right.
  const indices = blocks.map((_, i) => i);
  if (isFreeform) {
    indices.sort((a, b) => {
      const bA = blocks[a];
      const bB = blocks[b];
      const yA = bA.y ?? 0;
      const yB = bB.y ?? 0;
      const xA = bA.x ?? 0;
      const xB = bB.x ?? 0;

      // Vertical threshold: within 25px consider same row
      if (Math.abs(yA - yB) > 25) {
        return yA - yB;
      }
      return xA - xB;
    });
  }

  const results: Record<string, WorksheetBlock> = {};

  for (const idx of indices) {
    const block = blocks[idx];
    if (block.type !== 'math' || !block.mathData) {
      results[block.id] = block;
      continue;
    }

    const raw = block.mathData.raw.trim();
    if (!raw) {
      results[block.id] = {
        ...block,
        mathData: {
          ...block.mathData,
          result: undefined,
          error: undefined,
        },
      };
      continue;
    }

    try {
      let expr = raw;
      let isAssignment = false;
      let varName = '';
      let isFunction = false;
      let funcName = '';

      // Check if it ends with "=" (evaluation request)
      const hasTrailingEquals = expr.endsWith('=');
      if (hasTrailingEquals) {
        expr = expr.slice(0, -1).trim();
      }

      // Check for assignment ":=" or "=" (if not comparison "==")
      if (expr.includes(':=')) {
        isAssignment = true;
        const parts = expr.split(':=');
        const lhs = parts[0].trim();
        const rhs = parts.slice(1).join(':=').trim();

        // Check if LHS is a function: e.g. f(x)
        const funcMatch = lhs.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)$/);
        if (funcMatch) {
          isFunction = true;
          funcName = funcMatch[1];
          math.evaluate(`${lhs} = ${rhs}`, scope);
          results[block.id] = {
            ...block,
            mathData: {
              ...block.mathData,
              varName: lhs,
              isFunction: true,
              funcName,
              result: `${lhs}`,
              error: undefined,
            },
          };
        } else {
          varName = lhs;
          const rhsVal = math.evaluate(rhs, scope);
          scope[varName] = rhsVal;

          let displayResult = formatResult(rhsVal);

          results[block.id] = {
            ...block,
            mathData: {
              ...block.mathData,
              varName,
              isFunction: false,
              result: displayResult,
              error: undefined,
            },
          };
        }
      } else if (expr.includes('=') && !expr.includes('==') && !expr.includes('<=') && !expr.includes('>=')) {
        isAssignment = true;
        const parts = expr.split('=');
        const lhs = parts[0].trim();
        const rhs = parts.slice(1).join('=').trim();

        const funcMatch = lhs.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)$/);
        if (funcMatch) {
          isFunction = true;
          funcName = funcMatch[1];
          math.evaluate(`${lhs} = ${rhs}`, scope);
          results[block.id] = {
            ...block,
            mathData: {
              ...block.mathData,
              varName: lhs,
              isFunction: true,
              funcName,
              result: `${lhs}`,
              error: undefined,
            },
          };
        } else {
          varName = lhs;
          const rhsVal = math.evaluate(rhs, scope);
          scope[varName] = rhsVal;

          results[block.id] = {
            ...block,
            mathData: {
              ...block.mathData,
              varName,
              isFunction: false,
              result: formatResult(rhsVal),
              error: undefined,
            },
          };
        }
      } else {
        const evaluated = math.evaluate(expr, scope);
        results[block.id] = {
          ...block,
          mathData: {
            ...block.mathData,
            result: formatResult(evaluated),
            error: undefined,
          },
        };
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Ungültiger mathematischer Ausdruck';
      results[block.id] = {
        ...block,
        mathData: {
          ...block.mathData,
          result: undefined,
          error: translateErrorMessage(errorMsg),
        },
      };
    }
  }

  return blocks.map((b) => results[b.id] || b);
}

function formatResult(val: unknown): string {
  if (val === undefined || val === null) return '';

  if (typeof val === 'number') {
    // Check if integer or float
    if (Number.isInteger(val)) {
      return val.toString();
    }
    // Round to 4 decimal places without redundant trailing zeros
    const rounded = parseFloat(val.toFixed(4));
    return rounded.toString();
  }

  // mathjs Unit
  if (typeof val === 'object' && val !== null && 'format' in val && typeof (val as { format: unknown }).format === 'function') {
    return (val as { format: (options?: object) => string }).format({ precision: 4 });
  }

  // mathjs Matrix or Array
  if (Array.isArray(val) || (typeof val === 'object' && val !== null && 'toArray' in val)) {
    return JSON.stringify(val);
  }

  // Function
  if (typeof val === 'function') {
    return 'Funktion definiert';
  }

  return String(val);
}

function translateErrorMessage(msg: string): string {
  if (msg.includes('Undefined symbol')) {
    const symbol = msg.replace('Undefined symbol', '').trim();
    return `Variable oder Symbol '${symbol}' ist noch nicht definiert.`;
  }
  if (msg.includes('Unexpected type of argument') || msg.includes('Units do not match')) {
    return 'Einheiten stimmen nicht überein (z. B. Meter + Sekunde).';
  }
  if (msg.includes('Parenthesis ) expected')) {
    return 'Schließende Klammer ) fehlt.';
  }
  if (msg.includes('Value expected')) {
    return 'Zahl oder Variable erwartet.';
  }
  return msg;
}

// Evaluate a function for 2D plotting across a range of X values
export function evaluatePlotPoints(
  fnExpression: string,
  varName: string,
  xMin: number,
  xMax: number,
  scope: Record<string, unknown> = {},
  numSteps: number = 80
): { points: { x: number; y: number }[]; error?: string; yMin: number; yMax: number } {
  const points: { x: number; y: number }[] = [];
  const step = (xMax - xMin) / (numSteps - 1);

  let yMin = Infinity;
  let yMax = -Infinity;

  try {
    // Compile once for speed
    const compiled = math.compile(fnExpression);

    for (let i = 0; i < numSteps; i++) {
      const x = xMin + i * step;
      const pointScope = { ...scope, [varName]: x };
      const rawY = compiled.evaluate(pointScope);

      let y: number;
      if (typeof rawY === 'number') {
        y = rawY;
      } else if (typeof rawY === 'object' && rawY !== null && 'value' in rawY) {
        y = Number((rawY as { value: unknown }).value);
      } else {
        y = Number(rawY);
      }

      if (!isNaN(y) && isFinite(y)) {
        points.push({ x, y });
        if (y < yMin) yMin = y;
        if (y > yMax) yMax = y;
      }
    }

    if (points.length === 0) {
      return { points: [], error: 'Keine gültigen Funktionswerte im Bereich.', yMin: 0, yMax: 1 };
    }

    if (yMin === yMax) {
      yMin -= 1;
      yMax += 1;
    }

    return { points, yMin, yMax };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Funktion konnte nicht berechnet werden';
    return { points: [], error: errorMsg, yMin: 0, yMax: 1 };
  }
}
