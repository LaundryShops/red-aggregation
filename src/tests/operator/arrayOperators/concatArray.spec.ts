import { ConcatArrays } from '../../../operator/arrayOperators/concatArray';
import { NoOpAggregationOperationContext } from '../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext';

describe('ConcatArrays', () => {
	let context: NoOpAggregationOperationContext;

	beforeEach(() => {
		context = new NoOpAggregationOperationContext();
	});

	// === Positive cases ===

	test('TC_CONCATARRAYS_001: arrayOf(string) => concatArrays với field reference', () => {
		const expr = ConcatArrays.arrayOf('arr1').concat('arr2');
		expect(expr.toDocument(context)).toEqual({
			$concatArrays: ['$arr1', '$arr2'],
		});
	});

	test('TC_CONCATARRAYS_002: arrayOf(AggregationExpression object)', () => {
		const expr = ConcatArrays.arrayOf({ $split: ['$tags', ','] }).concat({ $map: { input: '$docs', in: '$$this' } });
		expect(expr.toDocument(context)).toEqual({
			$concatArrays: [{ $split: ['$tags', ','] }, { $map: { input: '$docs', in: '$$this' } }],
		});
	});

	test('TC_CONCATARRAYS_003: concat(string) => nối thêm field reference', () => {
		const expr = ConcatArrays.arrayOf('arrA').concat('arrB').concat('arrC');
		expect(expr.toDocument(context)).toEqual({
			$concatArrays: ['$arrA', '$arrB', '$arrC'],
		});
	});

	test('TC_CONCATARRAYS_004: concat(AggregationExpression object)', () => {
		const expr = ConcatArrays.arrayOf('base').concat({ $range: [0, 5] });
		expect(expr.toDocument(context)).toEqual({
			$concatArrays: ['$base', { $range: [0, 5] }],
		});
	});

	test('TC_CONCATARRAYS_005: getMongoMethod() => trả về $concatArrays', () => {
		const expr = ConcatArrays.arrayOf('arr');
		expect(expr['getMongoMethod']()).toBe('$concatArrays');
	});

	// === Negative cases ===

	test('TC_CONCATARRAYS_006: arrayOf(null) => throw error', () => {
		expect(() => ConcatArrays.arrayOf(null as any)).toThrow('Value must not be null');
	});

	test('TC_CONCATARRAYS_007: concat(null) => throw error', () => {
		const expr = ConcatArrays.arrayOf('arr1');
		expect(() => expr.concat(null as any)).toThrow('Value must not be null');
	});

	// === Structure validation ===

	test('TC_CONCATARRAYS_008: toDocument() output đúng cú pháp Mongo aggregate', () => {
		const expr = ConcatArrays.arrayOf('first').concat('second');
		const doc = expr.toDocument(context);
		expect(Object.keys(doc)[0]).toBe('$concatArrays');
		expect(Array.isArray(doc.$concatArrays)).toBe(true);
		expect(doc.$concatArrays.length).toBe(2);
	});

	test('TC_CONCATARRAYS_009: chaining concat nhiều lần vẫn giữ cấu trúc hợp lệ', () => {
		const expr = ConcatArrays.arrayOf('a')
			.concat('b')
			.concat('c')
			.concat({ $range: [1, 3] });
		const doc = expr.toDocument(context);
		expect(doc).toEqual({
			$concatArrays: ['$a', '$b', '$c', { $range: [1, 3] }],
		});
	});
});
