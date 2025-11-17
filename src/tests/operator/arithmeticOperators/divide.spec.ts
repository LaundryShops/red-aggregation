import { Divide } from "../../../operator/arithmeticOperators/divide";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe('Divide Integration Test', () => {
    it('should chain divideBy with number', () => {
        const divide = Divide.valueOf('price').divideBy(2);
        expect(divide.toDocument(new NoOpAggregationOperationContext()))
            .toEqual({ '$divide': ['$price', 2] });
    });

    it('should chain divideBy with field reference', () => {
        const divide = Divide.valueOf('total').divideBy('count');
        expect(divide.toDocument(new NoOpAggregationOperationContext()))
            .toEqual({ '$divide': ['$total', '$count'] });
    });

    it('should chain divideBy with multiple operands', () => {
        const divide = Divide.valueOf('a').divideBy(10).divideBy('b');
        expect(divide.toDocument(new NoOpAggregationOperationContext()))
            .toEqual({ '$divide': ['$a', 10, '$b'] });
    });

    it('should throw error when input is null', () => {
        expect(() => Divide.valueOf(null as any)).toThrow('FieldReference must not be null');
    });
});