import { ArithmeticOperatorsFactory } from '../../../operator/arithmeticOperators/arithmeticOperatorsFactory';
import { ArithmeticOperators } from '../../../operator/arithmeticOperators/arithmeticOperators';

describe('ArithmeticOperatorsFactory (integration)', () => {
  describe('constructor', () => {
    it('should initialize with fieldReference when input starts with $', () => {
      const factory = new ArithmeticOperatorsFactory('$price');
      expect((factory as any).fieldReference).toBe('$price');
      expect((factory as any).expression).toBeNull();
    });

    it('should add $ prefix when input is string without $', () => {
      const factory = new ArithmeticOperatorsFactory('price');
      expect((factory as any).fieldReference).toBe('$price');
    });

    it('should initialize with expression when input is object', () => {
      const expr = { $add: [1, 2] };
      const factory = new ArithmeticOperatorsFactory(expr);
      expect((factory as any).expression).toEqual(expr);
      expect((factory as any).fieldReference).toBeNull();
    });
  });

  describe('operators with fieldReference', () => {
    const factory = new ArithmeticOperatorsFactory('$value');

    it('abs', () => {
      const result = factory.abs();
      expect(result).toEqual(ArithmeticOperators.abs('$value'));
    });

    it('add', () => {
      const result = factory.add(10);
      expect(result).toEqual(ArithmeticOperators.add('$value').add(10));
    });

    it('ceil', () => {
      const result = factory.ceil();
      expect(result).toEqual(ArithmeticOperators.ceil('$value'));
    });

    it('divideBy', () => {
      const result = factory.divideBy(2);
      expect(result).toEqual(ArithmeticOperators.divide('$value').divideBy(2));
    });

    it('exp', () => {
      const result = factory.exp();
      expect(result).toEqual(ArithmeticOperators.exp('$value'));
    });

    it('floor', () => {
      const result = factory.floor();
      expect(result).toEqual(ArithmeticOperators.floor('$value'));
    });

    it('ln', () => {
      const result = factory.ln();
      expect(result).toEqual(ArithmeticOperators.ln('$value'));
    });

    it('log', () => {
      const result = factory.log(2);
      expect(result).toEqual(ArithmeticOperators.log('$value').log(2));
    });

    it('log10', () => {
      const result = factory.log10();
      expect(result).toEqual(ArithmeticOperators.log10('$value'));
    });

    it('mod', () => {
      const result = factory.mod(3);
      expect(result).toEqual(ArithmeticOperators.mod('$value').mod(3));
    });

    it('multiplyBy', () => {
      const result = factory.multiplyBy(4);
      expect(result).toEqual(ArithmeticOperators.multiply('$value').multiplyBy(4));
    });

    it('powBy', () => {
      const result = factory.powBy(2);
      expect(result).toEqual(ArithmeticOperators.pow('$value').pow(2));
    });

    it('round', () => {
      const result = factory.round();
      expect(result).toEqual(ArithmeticOperators.round('$value'));
    });

    it('roundToPlace', () => {
      const result = factory.roundToPlace(2);
      expect(result).toEqual(ArithmeticOperators.round('$value').place(2));
    });

    it('sqrt', () => {
      const result = factory.sqrt();
      expect(result).toEqual(ArithmeticOperators.sqrt('$value'));
    });

    it('subtract', () => {
      const result = factory.subtract(5);
      expect(result).toEqual(ArithmeticOperators.subtract('$value').subtract(5));
    });

    it('trunc', () => {
      const result = factory.trunc();
      expect(result).toEqual(ArithmeticOperators.trunc('$value'));
    });
  });

  describe('operators with expression', () => {
    const expr = { $literal: 100 };
    const factory = new ArithmeticOperatorsFactory(expr);

    it('abs', () => {
      expect(factory.abs()).toEqual(ArithmeticOperators.abs(expr));
    });

    it('add', () => {
      expect(factory.add(50)).toEqual(ArithmeticOperators.add(expr).add(50));
    });

    it('ceil', () => {
      expect(factory.ceil()).toEqual(ArithmeticOperators.ceil(expr));
    });

    it('divideBy', () => {
      expect(factory.divideBy(10)).toEqual(ArithmeticOperators.divide(expr).divideBy(10));
    });

    it('exp', () => {
      expect(factory.exp()).toEqual(ArithmeticOperators.exp(expr));
    });

    it('floor', () => {
      expect(factory.floor()).toEqual(ArithmeticOperators.floor(expr));
    });

    it('ln', () => {
      expect(factory.ln()).toEqual(ArithmeticOperators.ln(expr));
    });

    it('log', () => {
      expect(factory.log(5)).toEqual(ArithmeticOperators.log(expr).log(5));
    });

    it('log10', () => {
      expect(factory.log10()).toEqual(ArithmeticOperators.log10(expr));
    });

    it('mod', () => {
      expect(factory.mod(2)).toEqual(ArithmeticOperators.mod(expr).mod(2));
    });

    it('multiplyBy', () => {
      expect(factory.multiplyBy(8)).toEqual(ArithmeticOperators.multiply(expr).multiplyBy(8));
    });

    it('powBy', () => {
      expect(factory.powBy(3)).toEqual(ArithmeticOperators.pow(expr).pow(3));
    });

    it('round', () => {
      expect(factory.round()).toEqual(ArithmeticOperators.round(expr));
    });

    it('roundToPlace', () => {
      expect(factory.roundToPlace(1)).toEqual(ArithmeticOperators.round(expr).place(1));
    });

    it('sqrt', () => {
      expect(factory.sqrt()).toEqual(ArithmeticOperators.sqrt(expr));
    });

    it('subtract', () => {
      expect(factory.subtract(9)).toEqual(ArithmeticOperators.subtract(expr).subtract(9));
    });

    it('trunc', () => {
      expect(factory.trunc()).toEqual(ArithmeticOperators.trunc(expr));
    });
  });
});
