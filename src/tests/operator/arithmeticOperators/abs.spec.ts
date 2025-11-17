import { Abs } from "../../../operator/arithmeticOperators/abs";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe('Abs Integration Test', () => {
  it('should create Abs from string field reference', () => {
    const abs = Abs.valueOf('price');
    expect(abs).toBeInstanceOf(Abs);
    expect(abs.toDocument(new NoOpAggregationOperationContext())).toEqual({'$abs': '$price'});
  });

  it('should create Abs from number', () => {
    const abs = Abs.valueOf(-10);
    expect(abs).toBeInstanceOf(Abs);
    expect(abs.toDocument(new NoOpAggregationOperationContext())).toEqual({'$abs': -10});
  });

  it('should throw error when input is null', () => {
    expect(() => Abs.valueOf(null as any)).toThrow('FieldReference must not be null');
  });
});