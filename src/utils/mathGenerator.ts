import { Difficulty, MathProblem, Operation } from '../types/math';

export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateProblem(
  opSelected: Operation,
  difficulty: Difficulty
): MathProblem {
  const operations: Array<'+' | '-' | '×' | '÷'> = ['+', '-', '×', '÷'];
  let chosenOp: '+' | '-' | '×' | '÷';

  if (opSelected === 'mixed') {
    chosenOp = operations[getRandomInt(0, 3)];
  } else {
    switch (opSelected) {
      case 'add': chosenOp = '+'; break;
      case 'sub': chosenOp = '-'; break;
      case 'mul': chosenOp = '×'; break;
      case 'div': chosenOp = '÷'; break;
      default: chosenOp = '+';
    }
  }

  const id = Math.random().toString(36).substring(2, 9);

  // Expert Mode with compound operations sometimes
  if (difficulty === 'expert' && Math.random() > 0.4) {
    return generateExpertCompoundProblem(id);
  }

  let num1 = 0;
  let num2 = 0;
  let answer = 0;
  let question = '';
  let hint = '';
  let explanation = '';
  let visualType: 'dots' | 'numberline' | 'split' = 'split';

  if (chosenOp === '+') {
    if (difficulty === 'easy') {
      num1 = getRandomInt(1, 15);
      num2 = getRandomInt(1, 20 - num1);
      answer = num1 + num2;
      visualType = 'numberline';
      hint = `Zähle von ${num1} in Einerschritten ${num2} weiter.`;
      explanation = `${num1} + ${num2} = ${answer}.`;
    } else if (difficulty === 'medium') {
      num1 = getRandomInt(12, 69);
      num2 = getRandomInt(11, 89);
      answer = num1 + num2;
      const tens = Math.floor(num2 / 10) * 10;
      const ones = num2 % 10;
      visualType = 'split';
      hint = `Zerteile ${num2} in Zehner (${tens}) und Einer (${ones}): ${num1} + ${tens} = ${num1 + tens}.`;
      explanation = `${num1} + ${tens} = ${num1 + tens}, dann ${num1 + tens} + ${ones} = ${answer}.`;
    } else if (difficulty === 'hard') {
      num1 = getRandomInt(110, 680);
      num2 = getRandomInt(85, 450);
      answer = num1 + num2;
      visualType = 'split';
      hint = `Addiere zuerst Hunderter, dann Zehner, dann Einer.`;
      explanation = `${num1} + ${num2} = ${answer}.`;
    } else {
      // Expert standard
      num1 = getRandomInt(350, 1850);
      num2 = getRandomInt(280, 1450);
      answer = num1 + num2;
      hint = `Runde auf den nächsten Hunderter und ziehe die Differenz wieder ab.`;
      explanation = `${num1} + ${num2} = ${answer}.`;
    }
    question = `${num1} + ${num2}`;
  } else if (chosenOp === '-') {
    if (difficulty === 'easy') {
      num1 = getRandomInt(4, 20);
      num2 = getRandomInt(1, num1);
      answer = num1 - num2;
      visualType = 'numberline';
      hint = `Springe auf dem Zahlenstrahl von ${num1} um ${num2} Schritte zurück.`;
      explanation = `${num1} - ${num2} = ${answer}.`;
    } else if (difficulty === 'medium') {
      num1 = getRandomInt(25, 99);
      num2 = getRandomInt(12, num1 - 1);
      answer = num1 - num2;
      const tens = Math.floor(num2 / 10) * 10;
      const ones = num2 % 10;
      visualType = 'split';
      hint = `Ziehe erst die Zehner ab: ${num1} - ${tens} = ${num1 - tens}.`;
      explanation = `${num1} - ${tens} = ${num1 - tens}, dann ${num1 - tens} - ${ones} = ${answer}.`;
    } else if (difficulty === 'hard') {
      num1 = getRandomInt(200, 950);
      num2 = getRandomInt(55, num1 - 20);
      answer = num1 - num2;
      hint = `Ergänze von ${num2} schrittweise bis zu ${num1}.`;
      explanation = `${num1} - ${num2} = ${answer}.`;
    } else {
      num1 = getRandomInt(800, 3200);
      num2 = getRandomInt(350, num1 - 50);
      answer = num1 - num2;
      hint = `Schrittweise Subtraktion: erst Tausender/Hunderter, dann Zehner.`;
      explanation = `${num1} - ${num2} = ${answer}.`;
    }
    question = `${num1} - ${num2}`;
  } else if (chosenOp === '×') {
    if (difficulty === 'easy') {
      num1 = getRandomInt(2, 5);
      num2 = getRandomInt(2, 5);
      answer = num1 * num2;
      visualType = 'dots';
      hint = `${num1} Reihen mit jeweils ${num2} Punkten.`;
      explanation = `${num1} × ${num2} entspricht ${num1} mal ${num2} addiert = ${answer}.`;
    } else if (difficulty === 'medium') {
      num1 = getRandomInt(3, 10);
      num2 = getRandomInt(3, 10);
      answer = num1 * num2;
      visualType = 'dots';
      hint = `Denke an das kleine Einmaleins: ${num1}er-Reihe.`;
      explanation = `${num1} × ${num2} = ${answer}.`;
    } else if (difficulty === 'hard') {
      num1 = getRandomInt(11, 19);
      num2 = getRandomInt(4, 9);
      answer = num1 * num2;
      visualType = 'split';
      hint = `Zerlege ${num1} in 10 und ${num1 - 10}: (10 × ${num2}) + (${num1 - 10} × ${num2}).`;
      explanation = `10 × ${num2} = ${10 * num2}, plus ${num1 - 10} × ${num2} = ${(num1 - 10) * num2}. Gesamt: ${answer}.`;
    } else {
      num1 = getRandomInt(12, 25);
      num2 = getRandomInt(11, 20);
      answer = num1 * num2;
      hint = `Distributivgesetz: ${num1} × 10 + ${num1} × ${num2 - 10}.`;
      explanation = `${num1} × ${num2} = ${answer}.`;
    }
    question = `${num1} × ${num2}`;
  } else {
    // Division: Always clean integer results
    if (difficulty === 'easy') {
      num2 = getRandomInt(2, 5);
      answer = getRandomInt(1, 5);
      num1 = num2 * answer;
      visualType = 'dots';
      hint = `Wie oft passt die ${num2} in die ${num1}?`;
      explanation = `${num1} ÷ ${num2} = ${answer}, weil ${answer} × ${num2} = ${num1}.`;
    } else if (difficulty === 'medium') {
      num2 = getRandomInt(2, 10);
      answer = getRandomInt(2, 10);
      num1 = num2 * answer;
      visualType = 'dots';
      hint = `Welche Zahl mal ${num2} ergibt ${num1}?`;
      explanation = `${num1} ÷ ${num2} = ${answer}.`;
    } else if (difficulty === 'hard') {
      num2 = getRandomInt(4, 12);
      answer = getRandomInt(11, 25);
      num1 = num2 * answer;
      hint = `Teile in handliche Stücke: ${num2 * 10} ÷ ${num2} = 10, Rest ${num1 - num2 * 10} ÷ ${num2} = ${answer - 10}.`;
      explanation = `${num1} ÷ ${num2} = ${answer}.`;
    } else {
      num2 = getRandomInt(7, 18);
      answer = getRandomInt(15, 45);
      num1 = num2 * answer;
      hint = `Schätze die Zehnerstelle und berechne den Rest.`;
      explanation = `${num1} ÷ ${num2} = ${answer}.`;
    }
    question = `${num1} ÷ ${num2}`;
  }

  return {
    id,
    num1,
    num2,
    op: chosenOp,
    question,
    answer,
    explanation,
    hint,
    visualType,
  };
}

function generateExpertCompoundProblem(id: string): MathProblem {
  const type = getRandomInt(0, 2);

  if (type === 0) {
    // (a + b) * c
    const a = getRandomInt(5, 20);
    const b = getRandomInt(5, 20);
    const c = getRandomInt(2, 6);
    const answer = (a + b) * c;
    return {
      id,
      num1: a,
      num2: b,
      num3: c,
      op: '+',
      op2: '×',
      question: `(${a} + ${b}) × ${c}`,
      answer,
      hint: `Rechne zuerst die Klammer aus: ${a} + ${b} = ${a + b}.`,
      explanation: `(${a} + ${b}) = ${a + b}. Dann ${a + b} × ${c} = ${answer}.`,
      visualType: 'split',
    };
  } else if (type === 1) {
    // a * b - c (Punkt vor Strich)
    const a = getRandomInt(4, 9);
    const b = getRandomInt(4, 9);
    const c = getRandomInt(5, 25);
    const answer = a * b - c;
    return {
      id,
      num1: a,
      num2: b,
      num3: c,
      op: '×',
      op2: '-',
      question: `${a} × ${b} - ${c}`,
      answer,
      hint: `Punktrechnung vor Strichrechnung! Erst ${a} × ${b}.`,
      explanation: `${a} × ${b} = ${a * b}. Dann ${a * b} - ${c} = ${answer}.`,
      visualType: 'split',
    };
  } else {
    // a² + b (Quadratzahl)
    const a = getRandomInt(6, 15);
    const b = getRandomInt(10, 50);
    const answer = a * a + b;
    return {
      id,
      num1: a,
      num2: b,
      op: '×',
      op2: '+',
      question: `${a}² + ${b}`,
      answer,
      hint: `${a}² bedeutet ${a} × ${a} = ${a * a}.`,
      explanation: `${a}² = ${a * a}, dann ${a * a} + ${b} = ${answer}.`,
      visualType: 'split',
    };
  }
}
