import { CompositeIterator } from '../aggregate/field/compositionIterator';

describe('CompositeIterator', () => {
	let compositeIterator: CompositeIterator<string>;

	beforeEach(() => {
		compositeIterator = new CompositeIterator<string>();
	});

	describe('add()', () => {
		it('should add iterator successfully', () => {
			const iterator1 = createMockIterator(['a', 'b']);
			const iterator2 = createMockIterator(['c', 'd']);

			expect(() => {
				compositeIterator.add(iterator1);
				compositeIterator.add(iterator2);
			}).not.toThrow();
		});

		it('should throw error when adding same iterator twice', () => {
			const iterator = createMockIterator(['a']);
			compositeIterator.add(iterator);

			expect(() => {
				compositeIterator.add(iterator);
			}).toThrow('You cannot add the same iterator twice');
		});

		it('should throw error when adding iterator after use', () => {
			const iterator1 = createMockIterator(['a']);
			const iterator2 = createMockIterator(['b']);

			compositeIterator.add(iterator1);
			compositeIterator.next(); // Mark as in use

			expect(() => {
				compositeIterator.add(iterator2);
			}).toThrow(
				"You can no longer add iterators to a composite iterator that's already in use"
			);
		});
	});

	describe('next()', () => {
		it('should iterate through single iterator', () => {
			const iterator = createMockIterator(['a', 'b', 'c']);
			compositeIterator.add(iterator);

			expect(compositeIterator.next()).toEqual({
				done: false,
				value: 'a',
			});
			expect(compositeIterator.next()).toEqual({
				done: false,
				value: 'b',
			});
			expect(compositeIterator.next()).toEqual({
				done: false,
				value: 'c',
			});
			expect(compositeIterator.next()).toEqual({
				done: true,
				value: undefined,
			});
		});

		it('should iterate through multiple iterators sequentially', () => {
			const iterator1 = createMockIterator(['a', 'b']);
			const iterator2 = createMockIterator(['c', 'd']);
			const iterator3 = createMockIterator(['e']);

			compositeIterator.add(iterator1);
			compositeIterator.add(iterator2);
			compositeIterator.add(iterator3);

			expect(compositeIterator.next()).toEqual({
				done: false,
				value: 'a',
			});
			expect(compositeIterator.next()).toEqual({
				done: false,
				value: 'b',
			});
			expect(compositeIterator.next()).toEqual({
				done: false,
				value: 'c',
			});
			expect(compositeIterator.next()).toEqual({
				done: false,
				value: 'd',
			});
			expect(compositeIterator.next()).toEqual({
				done: false,
				value: 'e',
			});
			expect(compositeIterator.next()).toEqual({
				done: true,
				value: undefined,
			});
		});

		it('should handle empty iterators', () => {
			const emptyIterator = createMockIterator([]);
			compositeIterator.add(emptyIterator);

			expect(compositeIterator.next()).toEqual({
				done: true,
				value: undefined,
			});
		});

		it('should handle mixed empty and non-empty iterators', () => {
			const emptyIterator = createMockIterator([]);
			const nonEmptyIterator = createMockIterator(['a', 'b']);

			compositeIterator.add(emptyIterator);
			compositeIterator.add(nonEmptyIterator);

			expect(compositeIterator.next()).toEqual({
				done: false,
				value: 'a',
			});
			expect(compositeIterator.next()).toEqual({
				done: false,
				value: 'b',
			});
			expect(compositeIterator.next()).toEqual({
				done: true,
				value: undefined,
			});
		});

		it('should handle no iterators added', () => {
			expect(compositeIterator.next()).toEqual({
				done: true,
				value: undefined,
			});
		});
	});

	describe('hasNext()', () => {
		it('should return true when iterator has more elements', () => {
			const iterator = createMockIterator(['a', 'b']);
			compositeIterator.add(iterator);

			expect(compositeIterator.hasNext()).toBe(true);
			compositeIterator.next();
			expect(compositeIterator.hasNext()).toBe(true);
			compositeIterator.next();
			expect(compositeIterator.hasNext()).toBe(false);
		});

		it('should return false when all iterators are exhausted', () => {
			const iterator1 = createMockIterator(['a']);
			const iterator2 = createMockIterator(['b']);

			compositeIterator.add(iterator1);
			compositeIterator.add(iterator2);

			expect(compositeIterator.hasNext()).toBe(true);
			compositeIterator.next(); // 'a'
			expect(compositeIterator.hasNext()).toBe(true);
			compositeIterator.next(); // 'b'
			expect(compositeIterator.hasNext()).toBe(false);
		});

		it('should cache result correctly', () => {
			const iterator = createMockIterator(['a', 'b']);
			compositeIterator.add(iterator);

			// hasNext() should cache the first result
			expect(compositeIterator.hasNext()).toBe(true);

			// next() should return cached result
			expect(compositeIterator.next()).toEqual({
				done: false,
				value: 'a',
			});

			// hasNext() should cache the second result
			expect(compositeIterator.hasNext()).toBe(true);
			expect(compositeIterator.next()).toEqual({
				done: false,
				value: 'b',
			});
			expect(compositeIterator.hasNext()).toBe(false);
		});

		it('should return false when no iterators added', () => {
			expect(compositeIterator.hasNext()).toBe(false);
		});
	});

	describe('Symbol.iterator', () => {
		it('should be iterable with for...of loop', () => {
			const iterator1 = createMockIterator(['a', 'b']);
			const iterator2 = createMockIterator(['c']);

			compositeIterator.add(iterator1);
			compositeIterator.add(iterator2);

			const results: string[] = [];
			for (const value of compositeIterator) {
				results.push(value);
			}

			expect(results).toEqual(['a', 'b', 'c']);
		});

		it('should work with spread operator', () => {
			const iterator1 = createMockIterator(['a', 'b']);
			const iterator2 = createMockIterator(['c']);

			compositeIterator.add(iterator1);
			compositeIterator.add(iterator2);

			const results = [...compositeIterator];
			expect(results).toEqual(['a', 'b', 'c']);
		});
	});

	describe('edge cases', () => {
		it('should handle iterator that throws error', () => {
			const errorIterator = {
				next: jest.fn().mockImplementation(() => {
					throw new Error('Iterator error');
				}),
			};

			compositeIterator.add(errorIterator as any);

			expect(() => compositeIterator.next()).toThrow('Iterator error');
		});

		it('should maintain type safety with string iterators', () => {
			const stringIterator1 = createMockIterator(['hello']);
			const stringIterator2 = createMockIterator(['world']);
			const stringIterator3 = createMockIterator(['!']);

			compositeIterator.add(stringIterator1);
			compositeIterator.add(stringIterator2);
			compositeIterator.add(stringIterator3);

			expect(compositeIterator.next()).toEqual({
				done: false,
				value: 'hello',
			});
			expect(compositeIterator.next()).toEqual({
				done: false,
				value: 'world',
			});
			expect(compositeIterator.next()).toEqual({
				done: false,
				value: '!',
			});
			expect(compositeIterator.next()).toEqual({
				done: true,
				value: undefined,
			});
		});
	});
});

// Helper function to create mock iterators
function createMockIterator<T>(values: T[]): Iterator<T> {
	let index = 0;
	return {
		next(): IteratorResult<T> {
			if (index < values.length) {
				return { done: false, value: values[index++] };
			}
			return { done: true, value: undefined };
		},
	};
}
