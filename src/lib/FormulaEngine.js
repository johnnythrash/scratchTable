class FormulaEngine {
  constructor() {
    this.functions = {
      SUM: this.sum.bind(this),
      AVERAGE: this.average.bind(this),
      COUNT: this.count.bind(this),
      MAX: this.max.bind(this),
      MIN: this.min.bind(this),
      IF: this.if.bind(this),
      ROUND: this.round.bind(this),
      ABS: this.abs.bind(this),
      SQRT: this.sqrt.bind(this),
      POW: this.pow.bind(this),
    };
  }

  evaluate(formula, cells) {
    if (!formula.startsWith('=')) {
      return formula;
    }

    // Remove the = sign
    let expression = formula.substring(1);

    // Replace cell references with their values
    expression = this.resolveCellReferences(expression, cells);

    // Handle functions
    expression = this.resolveFunctions(expression);

    // Evaluate the mathematical expression
    try {
      return this.evaluateExpression(expression);
    } catch (error) {
      throw new Error('Invalid formula');
    }
  }

  resolveCellReferences(expression, cells) {
    // Match cell references like A1, B2, etc.
    const cellRefPattern = /[A-Z]+\d+/g;
    
    return expression.replace(cellRefPattern, (match) => {
      const cellValue = cells[match]?.value || '0';
      const numValue = parseFloat(cellValue);
      return isNaN(numValue) ? '0' : numValue.toString();
    });
  }

  resolveFunctions(expression) {
    // Handle function calls like SUM(A1:A5)
    const functionPattern = /([A-Z]+)\((.*?)\)/g;
    
    return expression.replace(functionPattern, (match, funcName, args) => {
      if (this.functions[funcName]) {
        const argValues = this.parseArguments(args);
        const result = this.functions[funcName](argValues);
        return result.toString();
      }
      return match;
    });
  }

  parseArguments(argsString) {
    const args = [];
    const parts = argsString.split(',');
    
    for (let part of parts) {
      part = part.trim();
      
      // Handle ranges like A1:A5
      if (part.includes(':')) {
        const rangeValues = this.parseRange(part);
        args.push(...rangeValues);
      } else {
        const numValue = parseFloat(part);
        args.push(isNaN(numValue) ? 0 : numValue);
      }
    }
    
    return args;
  }

  parseRange(range) {
    const [start, end] = range.split(':');
    const values = [];
    
    // Simple range parsing for A1:A5 format
    const startCol = start.match(/[A-Z]+/)[0];
    const startRow = parseInt(start.match(/\d+/)[0]);
    const endCol = end.match(/[A-Z]+/)[0];
    const endRow = parseInt(end.match(/\d+/)[0]);
    
    if (startCol === endCol) {
      // Same column, different rows
      for (let row = startRow; row <= endRow; row++) {
        values.push(0); // Placeholder - in real implementation, would get cell values
      }
    } else if (startRow === endRow) {
      // Same row, different columns
      const startColNum = startCol.charCodeAt(0) - 65;
      const endColNum = endCol.charCodeAt(0) - 65;
      for (let col = startColNum; col <= endColNum; col++) {
        values.push(0); // Placeholder
      }
    }
    
    return values;
  }

  evaluateExpression(expression) {
    // Simple expression evaluator
    // In a production app, you'd want a proper expression parser
    try {
      // Replace ^ with ** for exponentiation
      expression = expression.replace(/\^/g, '**');
      
      // Evaluate using Function constructor (safer than eval)
      return new Function('return ' + expression)();
    } catch (error) {
      throw new Error('Invalid expression');
    }
  }

  // Mathematical functions
  sum(values) {
    return values.reduce((acc, val) => acc + val, 0);
  }

  average(values) {
    return values.length > 0 ? this.sum(values) / values.length : 0;
  }

  count(values) {
    return values.length;
  }

  max(values) {
    return values.length > 0 ? Math.max(...values) : 0;
  }

  min(values) {
    return values.length > 0 ? Math.min(...values) : 0;
  }

  if(values) {
    const [condition, trueValue, falseValue] = values;
    return condition ? trueValue : falseValue;
  }

  round(values) {
    const [number, digits = 0] = values;
    return Math.round(number * Math.pow(10, digits)) / Math.pow(10, digits);
  }

  abs(values) {
    return Math.abs(values[0]);
  }

  sqrt(values) {
    return Math.sqrt(values[0]);
  }

  pow(values) {
    const [base, exponent] = values;
    return Math.pow(base, exponent);
  }
}

export default FormulaEngine;