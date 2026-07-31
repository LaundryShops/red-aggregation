import { definePropertyType, PropertyTypeDescriptor } from "./propertyType";

export interface ArrayOptions {
    default?: unknown[] | null;
}

class ArrayType implements PropertyTypeDescriptor<unknown[]> {
    readonly kind = "array";

    constructor(private readonly options: ArrayOptions = {}) {}

    hasDefault(): boolean {
        return this.options.default !== undefined;
    }

    getDefault(): unknown[] | null {
        return this.options.default ?? null;
    }

    validate(value: unknown): string | null {
        if (value == null) {
            return null;
        }
        // `Array` bên dưới bị chính decorator `Array` (export ở cuối file) shadow do function
        // declaration hoisting — phải dùng globalThis.Array để chắc chắn tham chiếu class Array thật.
        return globalThis.Array.isArray(value) ? null : `Expected array, got ${typeof value}`;
    }
}

/**
 * Chỉ shallow-check (`Array.isArray`), không validate phần tử bên trong.
 *
 * `default` (nếu có) là 1 mảng cố định dùng chung (cùng reference) cho mọi entity
 * thiếu field — không tự clone. Mutate mảng đó ở 1 entity sẽ ảnh hưởng entity khác
 * cũng nhận cùng default này.
 */
export function Array(options?: ArrayOptions): PropertyDecorator {
    return definePropertyType(new ArrayType(options));
}
