import { Ceil } from "../../../operator/arithmeticOperators/ceil";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe('Ceil Integration Test', () => {
    it('should create Ceil from string field reference', () => {
        const ceil = Ceil.valueOf('price');
        expect(ceil).toBeInstanceOf(Ceil);
        expect(ceil.toDocument(new NoOpAggregationOperationContext()))
            .toEqual({ '$ceil': '$price' });
    });

    it('should create Ceil from number', () => {
        const ceil = Ceil.valueOf(12.3);
        expect(ceil).toBeInstanceOf(Ceil);
        expect(ceil.toDocument(new NoOpAggregationOperationContext()))
            .toEqual({ '$ceil': 12.3 });
    });

    it('should create Ceil from expression', () => {
        const expr = { $divide: ['$total', '$count'] };
        const ceil = Ceil.valueOf(expr);
        expect(ceil).toBeInstanceOf(Ceil);
        expect(ceil.toDocument(new NoOpAggregationOperationContext()))
            .toEqual({ '$ceil': expr });
    });

    it('should throw error when input is null', () => {
        expect(() => Ceil.valueOf(null as any)).toThrow('FieldReference must not be null');
    });
});