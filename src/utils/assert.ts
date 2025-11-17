export class Assert {
	static isInstanceOf<T>(type: new (...args: any[]) => T, value: unknown, message?: string): asserts value is T;

	// Overload 2: Kiểm tra kiểu nguyên thủy 'string'
	static isInstanceOf(type: 'string', value: unknown, message?: string): asserts value is string;

	// Overload 3: Kiểm tra kiểu nguyên thủy 'number'
	static isInstanceOf(type: 'number', value: unknown, message?: string): asserts value is number;

	// Overload 4: Kiểm tra kiểu nguyên thủy 'boolean'
	static isInstanceOf(type: 'boolean', value: unknown, message?: string): asserts value is boolean;

	// Phần triển khai thực tế của method
	static isInstanceOf(type: any, value: unknown, message: string = 'Invalid type'): void {
		if (type === 'string' || type === 'number' || type === 'boolean') {
			// Kiểm tra kiểu nguyên thủy
			if (typeof value !== type) {
				throw new TypeError(message);
			}
		} else {
			// Kiểm tra instance của class (chỉ áp dụng với constructor function)
			if (!(value instanceof type)) {
				throw new TypeError(message);
			}
		}
	}

	static notNull(value: any, message: string): void {
		if (Array.isArray(value)) {
			if (
				value.some((elm) => elm === null || elm === undefined)
				// || value.length === 0
			)
				throw new Error(message);
		}
		if (value === null || value === undefined) {
			throw new Error(message);
		}
	}

	static notEmpty(value: string, message: string): void;
	static notEmpty(value: any[], message: string): void;
	static notEmpty(value: string | any[], message: string): void {
		if (!value || (typeof value === 'string' && value.trim().length === 0) || (Array.isArray(value) && value.length === 0)) {
			throw new Error(message);
		}
	}

	static noNullElements<T>(array: Array<T | null | undefined>, message: string): asserts array is T[] {
		if (!Array.isArray(array)) {
			throw new Error(message);
		}

		for (let i = 0; i < array.length; i++) {
			if (array[i] === null || array[i] === undefined) {
				throw new Error(message);
			}
		}
	}

	static notEmptyArray(array: any[], message: string): void {
		if (!array || array.length === 0) {
			throw new Error(message);
		}
	}

	static hasText(text: string, message: string): void {
		if (!text || text.trim().length === 0) {
			throw new Error(message);
		}
	}

	static isTrue(bool: boolean, message: string): void {
		if (!bool) {
			throw new Error(message);
		}
	}

	static state(expression: boolean, message: string): void {
		if (!expression) {
			throw new Error(message);
		}
	}

	/**
	 * Assert with message supplier (lazy evaluation)
	 */
	static stateWithSupplier(expression: boolean, messageSupplier: () => string): void {
		if (!expression) {
			throw new Error(messageSupplier());
		}
	}

	/**
	 * Assert with custom error type
	 */
	static stateWithError<T extends Error>(expression: boolean, errorFactory: () => T): void {
		if (!expression) {
			throw errorFactory();
		}
	}
}
