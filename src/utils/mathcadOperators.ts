/**
 * Mathcad Operator Engine & Smart Placement Utilities
 * Handles intelligent cursor positioning for all operators (:=, =, /, ^, sqrt, +, -, *, functions, etc.)
 * Ensures that when an operator is invoked, placeholder 'A' (left-side / numerator / base / inside)
 * is immediately ready for input, and never skipped or inaccessible.
 */

export interface InsertResult {
  newRaw: string;
  newCursorPos: number;
}

/**
 * Returns the smart cursor position when a math expression is loaded or created.
 * Guarantees that:
 * - A := B -> cursor in A (pos 0)
 * - A = -> cursor in A (pos 0)
 * - A / B -> cursor in A (pos 0)
 * - A ^ B -> cursor in A (pos 0)
 * - sqrt() -> cursor inside (pos 5)
 * - () -> cursor inside (pos 1)
 * - abs() -> cursor inside (pos 4)
 * - fn() -> cursor inside
 */
export function getInitialCursorPosition(raw: string): number {
  if (!raw || raw.trim() === '') return 0;
  const trimmed = raw.trim();

  // 1. Standalone / Initial operators: start in operand A (position 0)
  if (trimmed === ':=' || raw.startsWith(':=') || raw.startsWith(' := ')) {
    return 0;
  }
  if (trimmed === '=' || raw === ' =' || raw.startsWith('=')) {
    return 0;
  }
  if (trimmed === '/' || raw.startsWith('/')) {
    return 0;
  }
  if (trimmed === '^' || trimmed === '^2' || raw.startsWith('^')) {
    return 0;
  }
  if (trimmed === '+' || trimmed === '-' || trimmed === '*' || trimmed === '·') {
    return 0;
  }

  // 2. Trailing operators without operand A
  if (raw.endsWith('/')) {
    const slashIdx = raw.lastIndexOf('/');
    const before = raw.slice(0, slashIdx).trim();
    if (!before || before.endsWith(':=') || before.endsWith('=') || /[+\-*]$/.test(before)) {
      return slashIdx; // In Numerator A!
    }
  }

  if (raw.endsWith('^')) {
    const caretIdx = raw.lastIndexOf('^');
    const before = raw.slice(0, caretIdx).trim();
    if (!before || before.endsWith(':=') || before.endsWith('=') || /[+\-*]$/.test(before)) {
      return caretIdx; // In Base A!
    }
  }

  // 3. Functions & Enclosures: cursor inside argument
  if (raw === 'sqrt()' || raw.endsWith('sqrt()')) {
    const idx = raw.lastIndexOf('sqrt()');
    return idx + 5;
  }
  if (raw === '()' || raw.endsWith('()')) {
    const idx = raw.lastIndexOf('()');
    return idx + 1;
  }
  if (raw === 'abs()' || raw.endsWith('abs()')) {
    const idx = raw.lastIndexOf('abs()');
    return idx + 4;
  }
  if (raw === 'd/dx ()' || raw.endsWith('d/dx ()')) {
    const idx = raw.lastIndexOf('d/dx ()');
    return idx + 6;
  }
  if (raw === 'integral()' || raw.endsWith('integral()')) {
    const idx = raw.lastIndexOf('integral()');
    return idx + 9;
  }
  if (raw === 'sum()' || raw.endsWith('sum()')) {
    const idx = raw.lastIndexOf('sum()');
    return idx + 4;
  }
  if (raw === 'product()' || raw.endsWith('product()')) {
    const idx = raw.lastIndexOf('product()');
    return idx + 8;
  }
  if (raw === 'lim()' || raw.endsWith('lim()')) {
    const idx = raw.lastIndexOf('lim()');
    return idx + 4;
  }

  // Generic function ending in ()
  const fnMatch = raw.match(/([a-zA-Z0-9_]+)\(\)$/);
  if (fnMatch) {
    return raw.length - 1; // Between '(' and ')'
  }

  return raw.length;
}

/**
 * Inserts an operator or symbol into a math expression with intelligent cursor placement.
 * Ensures the user is positioned in operand A whenever A is missing or being defined.
 */
export function insertOperatorIntoExpression(
  raw: string,
  symbol: string,
  selStart: number = raw.length,
  selEnd: number = raw.length
): InsertResult {
  // Normalize symbol
  let sym = symbol;
  if (sym === 'sqrt(') sym = 'sqrt()';
  if (sym === '(  )') sym = '()';
  if (sym === 'abs(') sym = 'abs()';
  if (sym === 'd/dx ') sym = 'd/dx ()';
  if (sym === 'integral(') sym = 'integral()';
  if (sym === 'sum(') sym = 'sum()';
  if (sym === 'product(') sym = 'product()';
  if (sym === 'lim(') sym = 'lim()';

  // Normalize single function like "sin(" to "sin()"
  const openFnMatch = sym.match(/^([a-zA-Z0-9_]+)\($/);
  if (openFnMatch) {
    sym = `${openFnMatch[1]}()`;
  }

  const hasSelection = selStart !== selEnd;
  const selectedText = hasSelection ? raw.slice(selStart, selEnd) : '';
  const before = raw.slice(0, selStart);
  const after = raw.slice(selEnd);
  const isEmptyOrBlank = raw.trim() === '';

  // 1. Definition Operator (:=)
  if (sym === ' := ' || sym === ':=') {
    if (isEmptyOrBlank) {
      return { newRaw: ' := ', newCursorPos: 0 }; // Cursor in Variable A
    }
    const beforeTrim = before.trim();
    if (!beforeTrim || beforeTrim.endsWith('=')) {
      // Nothing before cursor -> put cursor in Variable A
      const newRaw = before + ' := ' + after;
      return { newRaw, newCursorPos: before.length };
    }
    // There is a variable before cursor -> put cursor after := in Value B
    const newRaw = before.trimEnd() + ' := ' + after.trimStart();
    const newCursorPos = before.trimEnd().length + 4;
    return { newRaw, newCursorPos };
  }

  // 2. Evaluation Operator (=)
  if (sym === ' =' || sym === '=') {
    if (isEmptyOrBlank) {
      return { newRaw: ' =', newCursorPos: 0 }; // Cursor in Expression A
    }
    if (raw.endsWith('=')) {
      return { newRaw: raw, newCursorPos: raw.length };
    }
    const newRaw = raw.trimEnd() + ' =';
    return { newRaw, newCursorPos: newRaw.length };
  }

  // 3. Fraction Operator (/)
  if (sym === '/') {
    if (isEmptyOrBlank) {
      return { newRaw: '/', newCursorPos: 0 }; // Cursor in Numerator A
    }
    if (hasSelection) {
      // Wrap selection as numerator
      const newRaw = before + selectedText + ' / ' + after;
      return { newRaw, newCursorPos: before.length + selectedText.length + 3 }; // In Denominator B
    }
    const beforeTrim = before.trimEnd();
    if (
      !beforeTrim ||
      beforeTrim.endsWith(':=') ||
      beforeTrim.endsWith('=') ||
      /[+\-*(\[]$/.test(beforeTrim)
    ) {
      // No numerator before cursor: cursor in Numerator A
      const insertAt = before.length;
      const newRaw = before + '/' + after;
      return { newRaw, newCursorPos: insertAt };
    }
    // There is an operand before cursor: cursor in Denominator B
    const newRaw = before + ' / ' + after;
    return { newRaw, newCursorPos: before.length + 3 };
  }

  // 4. Power Operator (^)
  if (sym === '^') {
    if (isEmptyOrBlank) {
      return { newRaw: '^', newCursorPos: 0 }; // Cursor in Base A
    }
    if (hasSelection) {
      const wrapped = selectedText.includes(' ') ? `(${selectedText})` : selectedText;
      const newRaw = before + wrapped + '^' + after;
      return { newRaw, newCursorPos: before.length + wrapped.length + 1 }; // In Exponent B
    }
    const beforeTrim = before.trimEnd();
    if (
      !beforeTrim ||
      beforeTrim.endsWith(':=') ||
      beforeTrim.endsWith('=') ||
      /[+\-*(\[]$/.test(beforeTrim)
    ) {
      // No base before cursor -> cursor in Base A
      const insertAt = before.length;
      const newRaw = before + '^' + after;
      return { newRaw, newCursorPos: insertAt };
    }
    // Has base -> cursor in Exponent B
    const newRaw = before + '^' + after;
    return { newRaw, newCursorPos: before.length + 1 };
  }

  // 5. Square Operator (^2)
  if (sym === '^2') {
    if (isEmptyOrBlank) {
      return { newRaw: '^2', newCursorPos: 0 }; // Cursor in Base A
    }
    const beforeTrim = before.trimEnd();
    if (
      !beforeTrim ||
      beforeTrim.endsWith(':=') ||
      beforeTrim.endsWith('=') ||
      /[+\-*(\[]$/.test(beforeTrim)
    ) {
      return { newRaw: before + '^2' + after, newCursorPos: before.length };
    }
    const newRaw = before + '^2' + after;
    return { newRaw, newCursorPos: before.length + 2 };
  }

  // 6. Binary Operators (+, -, *)
  if (sym === ' + ' || sym === ' - ' || sym === ' * ') {
    if (isEmptyOrBlank) {
      return { newRaw: sym, newCursorPos: 0 }; // Cursor in First Operand A
    }
    const beforeTrim = before.trimEnd();
    if (
      !beforeTrim ||
      beforeTrim.endsWith(':=') ||
      beforeTrim.endsWith('=') ||
      /[+\-*(\[]$/.test(beforeTrim)
    ) {
      const newRaw = before + sym.trimStart() + after;
      return { newRaw, newCursorPos: before.length }; // Cursor in Operand A
    }
    const newRaw = before.trimEnd() + sym + after.trimStart();
    return { newRaw, newCursorPos: before.trimEnd().length + sym.length }; // Cursor in Operand B
  }

  // 7. Enclosure Operators: (), sqrt(), abs(), sin(), etc.
  if (sym.endsWith('()')) {
    const fnPrefix = sym.slice(0, -2); // e.g. "", "sqrt", "abs", "sin"
    if (hasSelection) {
      const newRaw = before + fnPrefix + '(' + selectedText + ')' + after;
      return {
        newRaw,
        newCursorPos: before.length + fnPrefix.length + 1 + selectedText.length + 1,
      };
    }
    const newRaw = before + sym + after;
    return {
      newRaw,
      newCursorPos: before.length + fnPrefix.length + 1, // INSIDE the parenthesis!
    };
  }

  // 8. Default symbol / unit insertion (e.g. pi, units, greek)
  const newRaw = before + sym + after;
  return {
    newRaw,
    newCursorPos: before.length + sym.length,
  };
}

/**
 * Handles seamless keyboard navigation between operands (A and B) for:
 * - Fractions (/)
 * - Definitions (:=)
 * - Powers (^)
 * - Parentheses / Functions
 */
export function handleOperatorKeyNavigation(
  e: React.KeyboardEvent<HTMLInputElement>,
  raw: string,
  curPos: number
): number | null {
  // 1. Fraction (/)
  if (raw.includes('/')) {
    const slashIdx = raw.indexOf('/');
    // From Numerator A -> Jump to Denominator B
    if (curPos <= slashIdx && (e.key === '/' || e.key === 'Tab' || e.key === 'ArrowDown')) {
      e.preventDefault();
      return slashIdx + 1;
    }
    // From Denominator B -> Jump back to Numerator A
    if (curPos > slashIdx && (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey))) {
      e.preventDefault();
      return slashIdx;
    }
    // From Denominator B with unshifted Tab -> exit fraction
    if (curPos > slashIdx && e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      return raw.length;
    }
  }

  // 2. Definition (:=)
  if (raw.includes(':=')) {
    const colIdx = raw.indexOf(':=');
    // From Variable A -> Jump to Value B
    if (curPos <= colIdx && (e.key === 'Tab' || (curPos === colIdx && e.key === 'ArrowRight'))) {
      e.preventDefault();
      return colIdx + 2 < raw.length && raw[colIdx + 2] === ' ' ? colIdx + 3 : colIdx + 2;
    }
    // From Value B -> Jump back to Variable A
    if (curPos > colIdx && (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey))) {
      e.preventDefault();
      return colIdx;
    }
    // At end of Value B -> unshifted Tab exits
    if (curPos >= raw.length && e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      return raw.length;
    }
  }

  // 3. Power (^)
  if (raw.includes('^')) {
    const caretIdx = raw.indexOf('^');
    // From Base A -> Jump to Exponent B
    if (curPos <= caretIdx && (e.key === '^' || e.key === 'Tab' || e.key === 'ArrowUp')) {
      e.preventDefault();
      return caretIdx + 1;
    }
    // From Exponent B -> Jump back to Base A
    if (curPos > caretIdx && (e.key === 'ArrowDown' || (e.key === 'Tab' && e.shiftKey))) {
      e.preventDefault();
      return caretIdx;
    }
    // Exit exponent to baseline with Tab or ArrowRight at end of exponent
    if (curPos > caretIdx && e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      return raw.length;
    }
  }

  // 4. Closing parenthesis exit
  if (raw.includes(')')) {
    const closeParenIdx = raw.indexOf(')');
    if (curPos === closeParenIdx && (e.key === 'ArrowRight' || (e.key === 'Tab' && !e.shiftKey))) {
      e.preventDefault();
      return closeParenIdx + 1;
    }
  }

  return null;
}
