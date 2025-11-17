export class CompositeIterator<E> implements Iterator<E> {
	private readonly iterators: Set<Iterator<E>> = new Set();
	private inUse: boolean = false;
	private cachedResult: IteratorResult<E> | null = null;
	private currentIteratorIndex: number = 0;
	private iteratorArray: Iterator<E>[] = [];

	add(iterator: Iterator<E>): void {
		if (this.inUse) {
			throw new Error(
				"You can no longer add iterators to a composite iterator that's already in use"
			);
		}
		if (this.iterators.has(iterator)) {
			throw new Error('You cannot add the same iterator twice');
		}
		this.iterators.add(iterator);
	}

	next(): IteratorResult<E> {
		this.inUse = true;

		// Convert Set to Array on first use
		if (this.iteratorArray.length === 0) {
			this.iteratorArray = Array.from(this.iterators);
		}

		// If we have a cached result, return it
		if (this.cachedResult !== null && !this.cachedResult.done) {
			const result = this.cachedResult;
			this.cachedResult = null;
			return result;
		}

		// Find next available value
		while (this.currentIteratorIndex < this.iteratorArray.length) {
			const iterator = this.iteratorArray[this.currentIteratorIndex];
			const result = iterator.next();

			if (!result.done) {
				return result;
			}

			// Move to next iterator
			this.currentIteratorIndex++;
		}

		// All iterators exhausted - return done result
		return { done: true, value: undefined };
	}

	hasNext(): boolean {
		this.inUse = true;

		// Convert Set to Array on first use
		if (this.iteratorArray.length === 0) {
			this.iteratorArray = Array.from(this.iterators);
		}

		// Check if we have a cached result
		if (this.cachedResult !== null && !this.cachedResult.done) {
			return true;
		}

		// Try to get next result and cache it
		while (this.currentIteratorIndex < this.iteratorArray.length) {
			const iterator = this.iteratorArray[this.currentIteratorIndex];
			const result = iterator.next();

			if (!result.done) {
				this.cachedResult = result;
				return true;
			}

			// Move to next iterator
			this.currentIteratorIndex++;
		}

		return false;
	}

	[Symbol.iterator](): Iterator<E> {
		return this;
	}
}
