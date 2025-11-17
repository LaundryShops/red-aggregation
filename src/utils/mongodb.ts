export function isMongoDocument(value: any): value is Document {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		return false;
	}

	// Kiểm tra có key nào bắt đầu bằng $ không
	return Object.keys(value).some((key) => key.startsWith('$'));
}

// Chỉ kiểm tra object | !null | !Array
export const isDocument = (value: unknown): value is Document => typeof value === 'object' && value !== null && !Array.isArray(value);

export class BsonUtils {
	static isJsonDocument(value: string): boolean {
		try {
			const parsed = JSON.parse(value);
			return isDocument(parsed);
		} catch {
			return false;
		}
	}

	static parse(value: string): Document {
		return JSON.parse(value);
	}
}

export function containsKey(doc: Record<string, unknown> | null | undefined, key: string): boolean {
	return doc !== null && doc !== undefined && Object.prototype.hasOwnProperty.call(doc, key);
}
