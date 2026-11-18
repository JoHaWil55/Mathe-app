export interface WrittenStep {
  stepNumber: number;
  description: string;
  activeColumn?: number; // 0-indexed from right
  highlight?: string;
}

export interface WrittenAdditionResult {
  num1Str: string;
  num2Str: string;
  maxLen: number;
  columns: {
    digit1: number;
    digit2: number;
    carryIn: number;
    sum: number;
    resultDigit: number;
    carryOut: number;
  }[];
  resultStr: string;
  steps: WrittenStep[];
}

export function solveWrittenAddition(a: number, b: number): WrittenAdditionResult {
  const num1Str = a.toString();
  const num2Str = b.toString();
  const len1 = num1Str.length;
  const len2 = num2Str.length;
  const maxLen = Math.max(len1, len2);

  const columns: WrittenAdditionResult['columns'] = [];
  const steps: WrittenStep[] = [];
  let carry = 0;
  const resultDigits: number[] = [];

  for (let i = 0; i < maxLen; i++) {
    const d1 = i < len1 ? parseInt(num1Str[len1 - 1 - i], 10) : 0;
    const d2 = i < len2 ? parseInt(num2Str[len2 - 1 - i], 10) : 0;
    const columnSum = d1 + d2 + carry;
    const resultDigit = columnSum % 10;
    const nextCarry = Math.floor(columnSum / 10);

    columns.push({
      digit1: d1,
      digit2: d2,
      carryIn: carry,
      sum: columnSum,
      resultDigit,
      carryOut: nextCarry,
    });

    const colName = i === 0 ? 'Einer' : i === 1 ? 'Zehner' : i === 2 ? 'Hunderter' : i === 3 ? 'Tausender' : `${Math.pow(10, i)}er`;
    let desc = `${colName}-Spalte: ${d1} + ${d2}`;
    if (carry > 0) {
      desc += ` + ${carry} (Übertrag)`;
    }
    desc += ` = ${columnSum}.`;
    if (nextCarry > 0) {
      desc += ` Schreibe ${resultDigit}, merke ${nextCarry} Übertrag für die nächste Spalte.`;
    } else {
      desc += ` Schreibe ${resultDigit}.`;
    }

    steps.push({
      stepNumber: i + 1,
      description: desc,
      activeColumn: i,
    });

    resultDigits.unshift(resultDigit);
    carry = nextCarry;
  }

  if (carry > 0) {
    resultDigits.unshift(carry);
    steps.push({
      stepNumber: steps.length + 1,
      description: `Letzter Übertrag ${carry} wird ganz links als neue Stelle geschrieben.`,
      activeColumn: maxLen,
    });
  }

  return {
    num1Str,
    num2Str,
    maxLen,
    columns,
    resultStr: (a + b).toString(),
    steps,
  };
}

export interface WrittenSubtractionResult {
  num1Str: string;
  num2Str: string;
  maxLen: number;
  resultStr: string;
  steps: WrittenStep[];
  borrowArr: number[]; // carries/borrows per column
  diffDigits: number[];
}

export function solveWrittenSubtraction(a: number, b: number): WrittenSubtractionResult {
  // Ensure a >= b for school standard
  const top = Math.max(a, b);
  const bottom = Math.min(a, b);

  const num1Str = top.toString();
  const num2Str = bottom.toString();
  const len1 = num1Str.length;
  const len2 = num2Str.length;
  const maxLen = len1;

  const steps: WrittenStep[] = [];
  const borrowArr: number[] = new Array(maxLen + 1).fill(0);
  const diffDigits: number[] = [];

  let currentCarry = 0;

  for (let i = 0; i < maxLen; i++) {
    const d1 = parseInt(num1Str[len1 - 1 - i], 10);
    const d2 = i < len2 ? parseInt(num2Str[len2 - 1 - i], 10) : 0;
    const colName = i === 0 ? 'Einer' : i === 1 ? 'Zehner' : i === 2 ? 'Hunderter' : i === 3 ? 'Tausender' : `${Math.pow(10, i)}er`;

    const effectiveBottom = d2 + currentCarry;
    let diff = d1 - effectiveBottom;
    let nextCarry = 0;

    let desc = `${colName}-Spalte: Obere Ziffer ${d1}, untere Ziffer ${d2}`;
    if (currentCarry > 0) {
      desc += ` (+ ${currentCarry} Übertrag = ${effectiveBottom})`;
    }

    if (diff < 0) {
      diff += 10;
      nextCarry = 1;
      desc += `. Da ${d1} kleiner ist als ${effectiveBottom}, borgen wir 1 Zehner: ${d1 + 10} - ${effectiveBottom} = ${diff}. Schreibe ${diff}, Übertrag 1.`;
    } else {
      desc += `. ${d1} - ${effectiveBottom} = ${diff}. Schreibe ${diff}.`;
    }

    borrowArr[i] = currentCarry;
    diffDigits.unshift(diff);
    currentCarry = nextCarry;

    steps.push({
      stepNumber: i + 1,
      description: desc,
      activeColumn: i,
    });
  }

  // trim leading zeroes if any (except single '0')
  const finalStr = (top - bottom).toString();

  return {
    num1Str,
    num2Str,
    maxLen,
    resultStr: finalStr,
    steps,
    borrowArr,
    diffDigits,
  };
}

export interface WrittenMultiplicationSubRow {
  multiplierDigit: number;
  shift: number;
  product: number;
  rowStr: string;
}

export interface WrittenMultiplicationResult {
  num1: number;
  num2: number;
  subRows: WrittenMultiplicationSubRow[];
  totalResult: number;
  steps: WrittenStep[];
}

export function solveWrittenMultiplication(a: number, b: number): WrittenMultiplicationResult {
  const num2Str = b.toString();
  const subRows: WrittenMultiplicationSubRow[] = [];
  const steps: WrittenStep[] = [];

  let stepCount = 1;
  steps.push({
    stepNumber: stepCount++,
    description: `Multipliziere ${a} nacheinander mit jeder Ziffer von ${b} (von links nach rechts).`,
  });

  for (let i = 0; i < num2Str.length; i++) {
    const digit = parseInt(num2Str[i], 10);
    const shift = num2Str.length - 1 - i;
    const partialProduct = a * digit;
    const rowStr = partialProduct.toString() + '0'.repeat(shift);

    subRows.push({
      multiplierDigit: digit,
      shift,
      product: partialProduct * Math.pow(10, shift),
      rowStr,
    });

    steps.push({
      stepNumber: stepCount++,
      description: `Schritt ${i + 1}: ${a} × ${digit} = ${partialProduct}. Da die Ziffer den Stellenwert 10^${shift} hat: ${rowStr}.`,
    });
  }

  const totalResult = a * b;
  steps.push({
    stepNumber: stepCount++,
    description: `Addiere nun alle Zwischenergebnisse untereinander: ${subRows.map(r => r.rowStr).join(' + ')} = ${totalResult}.`,
  });

  return {
    num1: a,
    num2: b,
    subRows,
    totalResult,
    steps,
  };
}

export interface WrittenDivisionStep {
  currentDividend: number;
  bringDownDigit?: number;
  quotientDigit: number;
  product: number;
  remainder: number;
}

export interface WrittenDivisionResult {
  dividend: number;
  divisor: number;
  quotient: number;
  remainder: number;
  steps: WrittenStep[];
  detailedSteps: WrittenDivisionStep[];
}

export function solveWrittenDivision(dividend: number, divisor: number): WrittenDivisionResult {
  const dividendStr = dividend.toString();
  const detailedSteps: WrittenDivisionStep[] = [];
  const steps: WrittenStep[] = [];

  let currentVal = 0;
  let quotientStr = '';
  let stepIndex = 0;

  for (let i = 0; i < dividendStr.length; i++) {
    const digit = parseInt(dividendStr[i], 10);
    currentVal = currentVal * 10 + digit;

    if (currentVal < divisor && quotientStr.length === 0 && i < dividendStr.length - 1) {
      continue;
    }

    const qDigit = Math.floor(currentVal / divisor);
    const prod = qDigit * divisor;
    const rem = currentVal - prod;

    detailedSteps.push({
      currentDividend: currentVal,
      bringDownDigit: digit,
      quotientDigit: qDigit,
      product: prod,
      remainder: rem,
    });

    quotientStr += qDigit.toString();

    steps.push({
      stepNumber: ++stepIndex,
      description: `Wie oft passt ${divisor} in ${currentVal}? -> ${qDigit} mal (${qDigit} × ${divisor} = ${prod}). Rest: ${currentVal} - ${prod} = ${rem}.${i < dividendStr.length - 1 ? ` Nächste Ziffer (${dividendStr[i + 1]}) herabholen.` : ''}`,
    });

    currentVal = rem;
  }

  const finalRemainder = currentVal;
  const quotient = parseInt(quotientStr || '0', 10);

  if (finalRemainder > 0) {
    steps.push({
      stepNumber: ++stepIndex,
      description: `Endergebnis: ${quotient} mit Rest ${finalRemainder}.`,
    });
  } else {
    steps.push({
      stepNumber: ++stepIndex,
      description: `Endergebnis: ${quotient} (Rest 0, geht genau auf).`,
    });
  }

  return {
    dividend,
    divisor,
    quotient,
    remainder: finalRemainder,
    steps,
    detailedSteps,
  };
}
