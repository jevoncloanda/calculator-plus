import { tokenize } from './tokenizer';
import { CalculatorError, type FunctionName, type Node, type Token } from './types';

/**
 * Recursive-descent parser producing an AST. No `eval`, no dynamic execution.
 *
 * Grammar (lowest precedence first):
 *   expression     := additive
 *   additive       := multiplicative (('+' | '-') multiplicative)*
 *   multiplicative := unary (('*' | '/') unary)*
 *   unary          := ('+' | '-') unary | power
 *   power          := postfix ('^' unary)?          // right associative
 *   postfix        := primary ('!' | '%' | '²')*
 *   primary        := number | constant | '(' expression ')' | function primary
 */
class Parser {
  private index = 0;

  constructor(private readonly tokens: Token[]) {}

  parse(): Node {
    if (this.tokens.length === 0) {
      throw new CalculatorError('Incomplete expression');
    }
    const node = this.parseAdditive();
    if (this.index < this.tokens.length) {
      throw new CalculatorError('Invalid expression');
    }
    return node;
  }

  private peek(): Token | undefined {
    return this.tokens[this.index];
  }

  private parseAdditive(): Node {
    let left = this.parseMultiplicative();
    for (;;) {
      const token = this.peek();
      if (token?.type !== 'operator' || (token.text !== '+' && token.text !== '-')) break;
      this.index += 1;
      const right = this.parseMultiplicative();
      left = { kind: 'binary', op: token.text, left, right };
    }
    return left;
  }

  private parseMultiplicative(): Node {
    let left = this.parseUnary();
    for (;;) {
      const token = this.peek();
      if (token?.type !== 'operator' || (token.text !== '*' && token.text !== '/')) break;
      this.index += 1;
      const right = this.parseUnary();
      left = { kind: 'binary', op: token.text, left, right };
    }
    return left;
  }

  private parseUnary(): Node {
    const token = this.peek();
    if (token?.type === 'operator' && (token.text === '+' || token.text === '-')) {
      this.index += 1;
      return { kind: 'unary', op: token.text, operand: this.parseUnary() };
    }
    return this.parsePower();
  }

  private parsePower(): Node {
    const base = this.parsePostfix();
    const token = this.peek();
    if (token?.type === 'operator' && token.text === '^') {
      this.index += 1;
      // Right associative, and the exponent may carry its own sign: 2^-3.
      return { kind: 'binary', op: '^', left: base, right: this.parseUnary() };
    }
    return base;
  }

  private parsePostfix(): Node {
    let node = this.parsePrimary();
    for (;;) {
      const token = this.peek();
      if (token?.type === 'factorial') {
        this.index += 1;
        node = { kind: 'factorial', operand: node };
      } else if (token?.type === 'percent') {
        this.index += 1;
        node = { kind: 'percent', operand: node };
      } else if (token?.type === 'square') {
        this.index += 1;
        node = { kind: 'binary', op: '^', left: node, right: { kind: 'number', value: 2 } };
      } else {
        break;
      }
    }
    return node;
  }

  private parsePrimary(): Node {
    const token = this.peek();
    if (!token) {
      throw new CalculatorError('Incomplete expression');
    }

    if (token.type === 'number') {
      this.index += 1;
      return { kind: 'number', value: token.value as number };
    }

    if (token.type === 'constant') {
      this.index += 1;
      return { kind: 'constant', name: token.text === 'pi' ? 'pi' : 'e' };
    }

    if (token.type === 'lparen') {
      this.index += 1;
      const inner = this.parseAdditive();
      const closing = this.peek();
      if (closing?.type !== 'rparen') {
        throw new CalculatorError('Incomplete expression');
      }
      this.index += 1;
      return inner;
    }

    if (token.type === 'function') {
      this.index += 1;
      // `sin(30)` and the shorthand `√144` are both accepted.
      const argument = this.parsePrimary();
      return { kind: 'call', name: token.text as FunctionName, argument };
    }

    throw new CalculatorError('Incomplete expression');
  }
}

export function parse(source: string): Node {
  return new Parser(tokenize(source)).parse();
}
