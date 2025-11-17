import { Cond } from '../../../operator/conditionalOperators/cond';
import { NoOpAggregationOperationContext } from '../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext';
import { Fields } from '../../../aggregate/field';
import { ArithmeticOperators } from '../../../operator/arithmeticOperators/arithmeticOperators';
import { ComparisonOperation } from '../../../operator/compareOperators/comparisonOperators';

describe('Cond MongoDB $cond operator', () => {
	const context = new NoOpAggregationOperationContext();

	describe('Static factory methods', () => {
		it('should create Cond using newBuilder()', () => {
			const cond = Cond.newBuilder()
				.when('isActive')
				.then(true)
				.otherwise(false);

			expect(cond).toBeInstanceOf(Cond);
		});

		it('should create Cond using static when() method', () => {
			const cond = Cond.when('score').then(100).otherwise(0);

			expect(cond).toBeInstanceOf(Cond);
		});
	});

	describe('Builder pattern with field references', () => {
		it('should create $cond with field reference condition and literal values', () => {
			const cond = Cond.when(Fields.field('isActive'))
				.then(true)
				.otherwise(false);

			const doc = cond.toDocument(context);

			expect(doc).toEqual({
				$cond: {
					if: '$isActive',
					then: true,
					else: false,
				},
			});
		});

		it('should create $cond with field reference condition and field reference values', () => {
			const cond = Cond.when(Fields.field('score'))
				.thenValueOf(Fields.field('maxScore'))
				.otherwise(Fields.field('minScore'));

			const doc = cond.toDocument(context);

			expect(doc).toEqual({
				$cond: {
					if: '$score',
					then: '$maxScore',
					else: '$minScore',
				},
			});
		});

		it('should create $cond with field reference condition and mixed value types', () => {
			const cond = Cond.when(Fields.field('hasDiscount'))
				.thenValueOf(Fields.field('discountedPrice'))
				.otherwise(100);

			const doc = cond.toDocument(context);

			expect(doc).toEqual({
				$cond: {
					if: '$hasDiscount',
					then: '$discountedPrice',
					else: 100,
				},
			});
		});
	});

	describe('Builder pattern with expressions', () => {
		it('should create $cond with expression condition', () => {
			const cond = Cond.when({ $gt: ['$score', 80] })
				.then('A')
				.otherwise('B');

			const doc = cond.toDocument(context);

			expect(doc).toEqual({
				$cond: {
					if: { $gt: ['$score', 80] },
					then: 'A',
					else: 'B',
				},
			});
		});

		it('should create $cond with expression condition and expression values', () => {
			const cond = Cond.when({ $gte: ['$age', 18] })
				.thenValueOf({ $multiply: ['$salary', 1.1] })
				.otherwise({ $multiply: ['$salary', 0.8] });

			const doc = cond.toDocument(context);

			expect(doc).toEqual({
				$cond: {
					if: { $gte: ['$age', 18] },
					then: { $multiply: ['$salary', 1.1] },
					else: { $multiply: ['$salary', 0.8] },
				},
			});
		});

		it('should create $cond with complex nested expressions', () => {
			const cond = Cond.when({
				$and: [{ $gte: ['$age', 18] }, { $eq: ['$status', 'active'] }],
			})
				.thenValueOf({
					$add: ['$baseSalary', { $multiply: ['$bonus', 0.1] }],
				})
				.otherwise(0);

			const doc = cond.toDocument(context);

			expect(doc).toEqual({
				$cond: {
					if: {
						$and: [
							{ $gte: ['$age', 18] },
							{ $eq: ['$status', 'active'] },
						],
					},
					then: {
						$add: ['$baseSalary', { $multiply: ['$bonus', 0.1] }],
					},
					else: 0,
				},
			});
		});
	});

	describe('Different value types', () => {
		it('should handle string values', () => {
			const cond = Cond.when(Fields.field('isVip'))
				.then('Premium')
				.otherwise('Standard');

			const doc = cond.toDocument(context);

			expect(doc).toEqual({
				$cond: {
					if: '$isVip',
					then: 'Premium',
					else: 'Standard',
				},
			});
		});

		it('should handle number values', () => {
			const cond = Cond.when(Fields.field('hasBonus'))
				.then(1000)
				.otherwise(0);

			const doc = cond.toDocument(context);

			expect(doc).toEqual({
				$cond: {
					if: '$hasBonus',
					then: 1000,
					else: 0,
				},
			});
		});

		it('should handle boolean values', () => {
			const cond = Cond.when(Fields.field('isEnabled'))
				.then(true)
				.otherwise(false);

			const doc = cond.toDocument(context);

			expect(doc).toEqual({
				$cond: {
					if: '$isEnabled',
					then: true,
					else: false,
				},
			});
		});

		it('should throw error when otherwise value is null', () => {
			expect(() => {
				Cond.when('hasValue')
					.then('exists')
					.otherwise(null as any);
			}).toThrow('Value must not be null');
		});

		it('should handle array values', () => {
			const cond = Cond.when(Fields.field('isArray'))
				.then([1, 2, 3])
				.otherwise([]);

			const doc = cond.toDocument(context);

			expect(doc).toEqual({
				$cond: {
					if: '$isArray',
					then: [1, 2, 3],
					else: [],
				},
			});
		});

		it('should handle object values', () => {
			const cond = Cond.when(Fields.field('hasConfig'))
				.then({ theme: 'dark', lang: 'en' })
				.otherwise({ theme: 'light', lang: 'en' });

			const doc = cond.toDocument(context);

			expect(doc).toEqual({
				$cond: {
					if: '$hasConfig',
					then: { theme: 'dark', lang: 'en' },
					else: { theme: 'light', lang: 'en' },
				},
			});
		});
	});

	describe('Error handling', () => {
		it('should throw error when condition is null', () => {
			expect(() => {
				Cond.when(null as any);
			}).toThrow('Expression must not be null');
		});

		it('should throw error when then value is null', () => {
			expect(() => {
				Cond.when('field').then(null as any);
			}).toThrow('ThenValue must not be null');
		});

		it('should throw error when otherwise value is null', () => {
			expect(() => {
				Cond.when('field')
					.then('value')
					.otherwise(null as any);
			}).toThrow('Value must not be null');
		});
	});

	describe('Integration with other operators', () => {
		it('should work with arithmetic operators in condition', () => {
			const cond = Cond.when(ArithmeticOperators.add('$a').add('$b'))
				.then('sum')
				.otherwise('not sum');

			const doc = cond.toDocument(context);

			expect(doc).toEqual({
				$cond: {
					if: { $add: ['$a', '$b'] },
					then: 'sum',
					else: 'not sum',
				},
			});
		});

		it('should work with comparison operators in condition', () => {
			const cond = Cond.when(
				ComparisonOperation.gt('$score').greaterThanValue(80)
			)
				.then('high')
				.otherwise('low');

			const doc = cond.toDocument(context);

			expect(doc).toEqual({
				$cond: {
					if: { $gt: ['$score', 80] },
					then: 'high',
					else: 'low',
				},
			});
		});

		it('should work with Field objects', () => {
			const field = Fields.field('status');
			const cond = Cond.when(field).then('active').otherwise('inactive');

			const doc = cond.toDocument(context);

			expect(doc).toEqual({
				$cond: {
					if: '$status',
					then: 'active',
					else: 'inactive',
				},
			});
		});
	});

	describe('Complex scenarios', () => {
		it('should handle nested conditional logic', () => {
			const innerCond = Cond.when(Fields.field('isVip'))
				.then(0.1)
				.otherwise(0.05);

			const outerCond = Cond.when(Fields.field('hasDiscount'))
				.thenValueOf(innerCond)
				.otherwise(0);

			const doc = outerCond.toDocument(context);

			expect(doc).toEqual({
				$cond: {
					if: '$hasDiscount',
					then: {
						$cond: {
							if: '$isVip',
							then: 0.1,
							else: 0.05,
						},
					},
					else: 0,
				},
			});
		});

		it('should handle multiple conditions with builder pattern', () => {
			const cond = Cond.newBuilder()
				.when({ $gte: ['$score', 90] })
				.then('A+')
				.otherwise(
					Cond.newBuilder()
						.when({ $gte: ['$score', 80] })
						.then('A')
						.otherwise('B')
				);

			const doc = cond.toDocument(context);
			expect(doc).toEqual({
				$cond: {
					if: { $gte: ['$score', 90] },
					then: 'A+',
					else: {
						$cond: {
							if: { $gte: ['$score', 80] },
							then: 'A',
							else: 'B',
						},
					},
				},
			});
		});
	});

	describe('Edge cases', () => {
		it('should handle empty string condition', () => {
			const cond = Cond.when(Fields.field(''))
				.then('empty')
				.otherwise('not empty');

			const doc = cond.toDocument(context);

			expect(doc).toEqual({
				$cond: {
					if: '$',
					then: 'empty',
					else: 'not empty',
				},
			});
		});

		it('should handle zero values', () => {
			const cond = Cond.when(Fields.field('count')).then(0).otherwise(-1);

			const doc = cond.toDocument(context);

			expect(doc).toEqual({
				$cond: {
					if: '$count',
					then: 0,
					else: -1,
				},
			});
		});
	});
});
