export function isPresent<T>(value: T | null | undefined): value is T {
	return value !== null && value !== undefined;
}

export function orElse<T>(value: T | null | undefined, fallback: T): T {
	return value ?? fallback;
}

export function ifPresent<T>(value: T | null | undefined, consumer: (value: T) => void): void {
	if (value !== null && value !== undefined) {
		consumer(value);
	}
}
export class Optional<T> {
	private value: T | null;

	constructor(value: T | null) {
		this.value = value;
	}

	static empty<T>(): Optional<T> {
		return new Optional<T>(null);
	}

	filter(predicate: (value: T) => boolean): Optional<T> {
		if (!this.value || !predicate(this.value)) {
			return new Optional<T>(null);
		}
		return this;
	}

	map<U>(mapper: (value: T) => U): Optional<U> {
		if (!this.value) {
			return new Optional<U>(null);
		}
		return new Optional<U>(mapper(this.value));
	}

	orElse(defaultValue: T): T {
		return this.value ?? defaultValue;
	}
}
