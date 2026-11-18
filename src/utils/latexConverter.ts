import * as math from 'mathjs';

export function formatFormulaToTex(raw: string, result?: string): string {
  let clean = raw.trim();
  if (!clean) return '';

  const hasTrailingEquals = clean.endsWith('=');
  if (hasTrailingEquals) {
    clean = clean.slice(0, -1).trim();
  }

  let tex = '';
  if (clean.includes(':=')) {
    const parts = clean.split(':=');
    const lhs = parts[0].trim();
    const rhs = parts.slice(1).join(':=').trim();
    const lhsTex = formatPartToTex(lhs);
    const rhsTex = formatPartToTex(rhs);
    tex = `${lhsTex} \\coloneqq ${rhsTex}`;
  } else if (clean.includes('=') && !clean.includes('==') && !clean.includes('<=') && !clean.includes('>=')) {
    const parts = clean.split('=');
    const lhs = parts[0].trim();
    const rhs = parts.slice(1).join('=').trim();
    tex = `${formatPartToTex(lhs)} = ${formatPartToTex(rhs)}`;
  } else {
    tex = formatPartToTex(clean);
  }

  if (result !== undefined && result !== '') {
    tex += ` = ${formatResultTex(result)}`;
  } else if (hasTrailingEquals) {
    tex += ' = ';
  }

  return tex;
}

function formatIncompleteFraction(part: string): string | null {
  const trimmed = part.trim();
  if (trimmed === '/') {
    return '\\frac{\\square}{\\square}';
  }
  if (trimmed.endsWith('/')) {
    const num = trimmed.slice(0, -1).trim();
    const numTex = num ? formatPartToTex(num) : '\\square';
    return `\\frac{${numTex}}{\\square}`;
  }
  if (trimmed.startsWith('/')) {
    const den = trimmed.slice(1).trim();
    const denTex = den ? formatPartToTex(den) : '\\square';
    return `\\frac{\\square}{${denTex}}`;
  }

  // Check if there is an isolated fraction e.g. "a + b /" or "x := 10 / "
  const lastSlash = trimmed.lastIndexOf('/');
  if (lastSlash > 0 && lastSlash === trimmed.length - 1) {
    const num = trimmed.slice(0, -1).trim();
    return `\\frac{${formatPartToTex(num)}}{\\square}`;
  }

  return null;
}

function formatIncompleteExpression(part: string): string | null {
  const trimmed = part.trim();
  if (!trimmed) return '\\square';

  // 1. Standalone single operators
  if (trimmed === '+') return '\\square + \\square';
  if (trimmed === '-') return '\\square - \\square';
  if (trimmed === '*' || trimmed === '·') return '\\square \\cdot \\square';
  if (trimmed === '^') return '{\\square}^{\\square}';
  if (trimmed === '^2') return '{\\square}^{2}';
  if (trimmed === '()' || trimmed === '(') return '\\left(\\square\\right)';
  if (trimmed === 'abs()' || trimmed === 'abs(' || trimmed === 'abs') return '\\left|\\square\\right|';
  if (trimmed === 'sqrt()' || trimmed === 'sqrt(' || trimmed === 'sqrt') return '\\sqrt{\\square}';

  // 2. Incomplete powers (e.g. "x^", "^2", "10^")
  if (trimmed.endsWith('^')) {
    const base = trimmed.slice(0, -1).trim();
    const baseTex = base ? formatPartToTex(base) : '\\square';
    return `{${baseTex}}^{\\square}`;
  }
  if (trimmed.startsWith('^')) {
    const exp = trimmed.slice(1).trim();
    const expTex = exp ? formatPartToTex(exp) : '\\square';
    return `{\\square}^{${expTex}}`;
  }

  // 3. Incomplete fraction states (e.g. "/", "10/", "/2")
  const incompleteFrac = formatIncompleteFraction(trimmed);
  if (incompleteFrac) return incompleteFrac;

  // 4. Incomplete functions (e.g. "sqrt(16", "abs(x")
  if (trimmed.startsWith('sqrt(') && !trimmed.endsWith(')')) {
    const inner = trimmed.slice(5).trim();
    const innerTex = inner ? formatPartToTex(inner) : '\\square';
    return `\\sqrt{${innerTex}}`;
  }
  if (trimmed.startsWith('abs(') && !trimmed.endsWith(')')) {
    const inner = trimmed.slice(4).trim();
    const innerTex = inner ? formatPartToTex(inner) : '\\square';
    return `\\left|${innerTex}\\right|`;
  }

  // 5. Calculus and Analysis
  if (trimmed.startsWith('d/dx')) {
    const inner = trimmed.slice(4).trim().replace(/^\(|\)$/g, '').trim();
    const innerTex = inner ? formatPartToTex(inner) : '\\square';
    return `\\frac{d}{dx}\\left(${innerTex}\\right)`;
  }
  if (trimmed === 'integral()' || trimmed === 'integral(' || trimmed === 'integral') {
    return '\\int \\square \\, dx';
  }
  if (trimmed === 'sum()' || trimmed === 'sum(' || trimmed === 'sum') {
    return '\\sum \\square';
  }
  if (trimmed === 'product()' || trimmed === 'product(' || trimmed === 'product') {
    return '\\prod \\square';
  }
  if (trimmed === 'lim()' || trimmed === 'lim(' || trimmed === 'lim') {
    return '\\lim \\square';
  }

  // 6. Functions with empty argument: sin(), cos(), etc.
  const fnMatch = trimmed.match(/^(sin|cos|tan|asin|acos|atan|log|log10|exp|round|min|max)\s*(\(\s*\))?$/);
  if (fnMatch) {
    const fnName = fnMatch[1];
    const latexFn = fnName === 'log' ? '\\ln' : fnName === 'log10' ? '\\log' : `\\${fnName}`;
    return `${latexFn}\\left(\\square\\right)`;
  }

  // 7. Trailing binary operator e.g. "a + " or "a * " or "a - "
  if (/[+\-*]$/.test(trimmed)) {
    const op = trimmed.slice(-1);
    const left = trimmed.slice(0, -1).trim();
    const opTex = op === '*' ? '\\cdot' : op;
    const leftTex = left ? formatPartToTex(left) : '\\square';
    return `${leftTex} ${opTex} \\square`;
  }

  return null;
}

function formatPartToTex(part: string): string {
  if (!part.trim()) return '\\square';

  // 1. Check for incomplete expression states
  const incomplete = formatIncompleteExpression(part);
  if (incomplete) return incomplete;

  // 2. Try standard mathjs parse
  try {
    return math.parse(part).toTex({
      parenthesis: 'auto',
      implicit: 'hide',
    });
  } catch {
    // 3. Fallback for custom or partially typed math
    return escapeSimpleMath(part);
  }
}

function formatResultTex(res: string): string {
  try {
    return math.parse(res).toTex({
      parenthesis: 'auto',
      implicit: 'hide',
    });
  } catch {
    return `\\text{${res}}`;
  }
}

function escapeSimpleMath(str: string): string {
  // If string has a single slash like "a/b" that math.parse couldn't parse
  const parts = str.split('/');
  if (parts.length === 2) {
    const num = parts[0].trim() || '\\square';
    const den = parts[1].trim() || '\\square';
    return `\\frac{${escapeSimpleMath(num)}}{${escapeSimpleMath(den)}}`;
  }

  // If string has a caret like "x^" or "^y"
  if (str.includes('^')) {
    const p = str.split('^');
    const base = p[0].trim() || '\\square';
    const exp = p.slice(1).join('^').trim() || '\\square';
    return `{${escapeSimpleMath(base)}}^{${escapeSimpleMath(exp)}}`;
  }

  return str
    .replace(/\*/g, ' \\cdot ')
    .replace(/_/g, '\\_');
}
