import { Keyset, Serializable } from "./types";

const HASH_SEED = 1;
const HASH_MULTIPLIER = 31;

export class DefaultKeyset<T extends Serializable = Serializable> implements Keyset {
	private readonly tuple: T;

	constructor(tuple: T) {
		this.tuple = tuple;
	}

	public getTuple(): T {
		return this.tuple;
	}

	public hashCode(): number {
		let hash = 5;
		hash = 53 * hash + this.deepHashCode(this.tuple);
		return hash;
	}

	public equals(other: unknown): boolean {
		if (!Array.isArray(other) || other.length !== this.tuple.length) {
			return false;
		}

		return other.every((value, index) => value === this.tuple[index]);
	}

	private deepHashCode(array: unknown[]): number {
		let result = HASH_SEED;

		for (const element of array) {
			let elementHash = 0;

			if (Array.isArray(element)) {
				elementHash = this.deepHashCode(element);
			} else if (typeof element === 'number') {
				elementHash = this.numberHash(element);
			} else if (typeof element === 'boolean') {
				elementHash = element ? 1231 : 1237;
			} else if (typeof element === 'string') {
				elementHash = this.stringHash(element);
			} else if (element === null || element === undefined) {
				elementHash = 0;
			} else {
				elementHash = this.stringHash(String(element));
			}

			result = (HASH_MULTIPLIER * result + elementHash) | 0;
		}

		return result;
	}

	private numberHash(value: number): number {
		if (Number.isInteger(value)) {
			return value | 0;
		}
		const buffer = new DataView(new ArrayBuffer(8));
		buffer.setFloat64(0, value, false);
		return buffer.getInt32(0) ^ buffer.getInt32(4);
	}

	private stringHash(text: string): number {
		let hash = 0;
		for (let i = 0; i < text.length; i++) {
			hash = (hash * HASH_MULTIPLIER + text.charCodeAt(i)) | 0;
		}
		return hash;
	}
}
