import { Max } from '../../../operator/accumulatorOperators/max';
import { Sum } from '../../../operator/accumulatorOperators/sum';
import { NoOpAggregationOperationContext } from '../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext';

describe('Max', () => {
	let context: NoOpAggregationOperationContext;

	beforeEach(() => {
		context = new NoOpAggregationOperationContext();
	});

	it('should create $max from field reference', () => {
		const expr = Max.maxOf('price');
		const result = expr.toDocument(context);

		expect(result).toEqual({
			$max: '$price',
		});
	});

	it('should create $max from AggregationExpression', () => {
		const expr = Max.maxOf(Sum.sumOf('a').and('b'));
		const result = expr.toDocument(context);

		expect(result).toEqual({
			$max: { $sum: ['$a', '$b'] },
		});
	});

	it('should append another field using and()', () => {
		const expr = Max.maxOf('price').and('discount');
		const result = expr.toDocument(context);

		expect(result).toEqual({
			$max: ['$price', '$discount'],
		});
	});

	it('should create $maxN when limit() is used', () => {
		const expr = Max.maxOf('score').limit(3);
		const result = expr.toDocument(context);

		expect(result).toEqual({
			$maxN: { input: '$score', n: 3 },
		});
	});

	it('should combine .and() and .limit()', () => {
		const expr = Max.maxOf('score').and('bonus').limit(5);
		const result = expr.toDocument(context);

		expect(result).toEqual({
			$maxN: { input: ['$score', '$bonus'], n: 5 },
		});
	});

	it('should throw when input is null', () => {
		expect(() => Max.maxOf(null as any)).toThrow('Input must not be null');
	});
});
