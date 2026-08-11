class Calculator {
  constructor() {
    this.currentValue = '0';
    this.previousValue = '';
    this.operator = null;
    this.waitingForOperand = false;
    this.expressionEl = document.getElementById('expression');
    this.resultEl = document.getElementById('result');
    this.operatorBtns = document.querySelectorAll('[data-action="operator"]');

    this.init();
  }

  init() {
    document.querySelector('.keypad').addEventListener('click', (e) => {
      const btn = e.target.closest('.btn');
      if (!btn) return;
      this.handleButton(btn);
    });

    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
  }

  handleButton(btn) {
    const action = btn.dataset.action;
    const value = btn.dataset.value;

    switch (action) {
      case 'digit':
        this.inputDigit(value);
        break;
      case 'decimal':
        this.inputDecimal();
        break;
      case 'operator':
        this.inputOperator(value);
        break;
      case 'equals':
        this.calculate();
        break;
      case 'clear':
        this.clear();
        break;
      case 'toggle-sign':
        this.toggleSign();
        break;
      case 'percent':
        this.percent();
        break;
    }

    this.animateResult();
  }

  handleKeyboard(e) {
    if (e.key >= '0' && e.key <= '9') {
      this.inputDigit(e.key);
      this.animateResult();
      return;
    }

    const keyMap = {
      '.': () => this.inputDecimal(),
      '+': () => this.inputOperator('+'),
      '-': () => this.inputOperator('-'),
      '*': () => this.inputOperator('*'),
      '/': () => { e.preventDefault(); this.inputOperator('/'); },
      'Enter': () => this.calculate(),
      '=': () => this.calculate(),
      'Escape': () => this.clear(),
      'Backspace': () => this.backspace(),
      '%': () => this.percent(),
    };

    if (keyMap[e.key]) {
      e.preventDefault();
      keyMap[e.key]();
      this.animateResult();
    }
  }

  inputDigit(digit) {
    if (this.waitingForOperand) {
      this.currentValue = digit;
      this.waitingForOperand = false;
    } else {
      this.currentValue = this.currentValue === '0' ? digit : this.currentValue + digit;
    }
    this.updateDisplay();
  }

  inputDecimal() {
    if (this.waitingForOperand) {
      this.currentValue = '0.';
      this.waitingForOperand = false;
    } else if (!this.currentValue.includes('.')) {
      this.currentValue += '.';
    }
    this.updateDisplay();
  }

  inputOperator(nextOperator) {
    const inputValue = parseFloat(this.currentValue);

    if (this.operator && this.waitingForOperand) {
      this.operator = nextOperator;
      this.highlightOperator(nextOperator);
      this.updateExpression();
      return;
    }

    if (this.previousValue !== '' && this.operator && !this.waitingForOperand) {
      const result = this.performCalculation();
      this.currentValue = String(result);
      this.previousValue = this.currentValue;
    } else {
      this.previousValue = this.currentValue;
    }

    this.waitingForOperand = true;
    this.operator = nextOperator;
    this.highlightOperator(nextOperator);
    this.updateDisplay();
    this.updateExpression();
  }

  calculate() {
    if (this.operator === null || this.waitingForOperand) return;

    const result = this.performCalculation();
    this.expressionEl.textContent = `${this.formatDisplay(this.previousValue)} ${this.getOperatorSymbol(this.operator)} ${this.formatDisplay(this.currentValue)} =`;
    this.currentValue = String(result);
    this.previousValue = '';
    this.operator = null;
    this.waitingForOperand = true;
    this.highlightOperator(null);
    this.updateDisplay();
  }

  performCalculation() {
    const prev = parseFloat(this.previousValue);
    const current = parseFloat(this.currentValue);

    if (isNaN(prev) || isNaN(current)) return current;

    let result;
    switch (this.operator) {
      case '+': result = prev + current; break;
      case '-': result = prev - current; break;
      case '*': result = prev * current; break;
      case '/':
        if (current === 0) {
          this.showError('Cannot divide by zero');
          return 0;
        }
        result = prev / current;
        break;
      default: return current;
    }

    return this.roundResult(result);
  }

  roundResult(num) {
    const rounded = Math.round((num + Number.EPSILON) * 1e10) / 1e10;
    return rounded;
  }

  clear() {
    this.currentValue = '0';
    this.previousValue = '';
    this.operator = null;
    this.waitingForOperand = false;
    this.expressionEl.textContent = '';
    this.resultEl.classList.remove('error');
    this.highlightOperator(null);
    this.updateDisplay();
  }

  toggleSign() {
    if (this.currentValue === '0') return;
    this.currentValue = this.currentValue.startsWith('-')
      ? this.currentValue.slice(1)
      : '-' + this.currentValue;
    this.updateDisplay();
  }

  percent() {
    const value = parseFloat(this.currentValue) / 100;
    this.currentValue = String(this.roundResult(value));
    this.updateDisplay();
  }

  backspace() {
    if (this.waitingForOperand) return;

    if (this.currentValue.length <= 1 || (this.currentValue.length === 2 && this.currentValue.startsWith('-'))) {
      this.currentValue = '0';
    } else {
      this.currentValue = this.currentValue.slice(0, -1);
    }
    this.updateDisplay();
  }

  showError(message) {
    this.resultEl.textContent = message;
    this.resultEl.classList.add('error');
    setTimeout(() => {
      this.clear();
    }, 1500);
  }

  formatDisplay(value) {
    const num = parseFloat(value);
    if (isNaN(num)) return value;

    const str = String(num);
    if (str.length > 12) {
      return num.toExponential(4);
    }
    return str;
  }

  getOperatorSymbol(op) {
    const symbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };
    return symbols[op] || op;
  }

  updateDisplay() {
    this.resultEl.textContent = this.formatDisplay(this.currentValue);
    this.resultEl.classList.remove('error');
  }

  updateExpression() {
    if (this.operator) {
      this.expressionEl.textContent = `${this.formatDisplay(this.previousValue)} ${this.getOperatorSymbol(this.operator)}`;
    }
  }

  highlightOperator(op) {
    this.operatorBtns.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.value === op);
    });
  }

  animateResult() {
    this.resultEl.classList.remove('updated');
    void this.resultEl.offsetWidth;
    this.resultEl.classList.add('updated');
  }
}

document.addEventListener('DOMContentLoaded', () => new Calculator());
