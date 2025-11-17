import { Min } from '../../../operator/accumulatorOperators/min';
import { Sum } from '../../../operator/accumulatorOperators/sum';
import { NoOpAggregationOperationContext } from '../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext';

describe('Min', () => {
    let context: NoOpAggregationOperationContext;

    beforeEach(() => {
        context = new NoOpAggregationOperationContext();
    });

    it('should create $min from field reference', () => {
        const expr = Min.minOf('price');
        const result = expr.toDocument(context);

        expect(result).toEqual({
            $min: '$price',
        });
    });

    it('should create $Min from AggregationExpression', () => {
        const expr = Min.minOf(Sum.sumOf('a').and('b'));
        const result = expr.toDocument(context);

        expect(result).toEqual({
            $min: { $sum: ['$a', '$b'] },
        });
    });

    it('should append another field using and()', () => {
        const expr = Min.minOf('price').and('discount');
        const result = expr.toDocument(context);

        expect(result).toEqual({
            $min: ['$price', '$discount'],
        });
    });

    it('should create $MinN when limit() is used', () => {
        const expr = Min.minOf('score').limit(3);
        const result = expr.toDocument(context);

        expect(result).toEqual({
            $minN: { input: '$score', n: 3 },
        });
    });

    it('should combine .and() and .limit()', () => {
        const expr = Min.minOf('score').and('bonus').limit(5);
        const result = expr.toDocument(context);

        expect(result).toEqual({
            $minN: { input: ['$score', '$bonus'], n: 5 },
        });
    });

    it('should throw when input is null', () => {
        expect(() => Min.minOf(null as any)).toThrow('Input must not be null');
    });
});
