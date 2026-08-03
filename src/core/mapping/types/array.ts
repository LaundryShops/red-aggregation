import { DefaultOrFactory, definePropertyType, PropertyTypeDescriptor, resolveDefaultValue } from "./propertyType";

export interface ArrayOptions {
    default?: DefaultOrFactory<unknown[]> | null;
}

class ArrayType implements PropertyTypeDescriptor<unknown[]> {
    readonly kind = "array";

    constructor(private readonly options: ArrayOptions = {}) {}

    hasDefault(): boolean {
        return this.options.default !== undefined;
    }

    getDefault(): unknown[] | null {
        return resolveDefaultValue(this.options.default);
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
 * `default` nhận mảng tĩnh (dùng chung 1 reference cho mọi entity thiếu field —
 * mutate ở 1 entity sẽ ảnh hưởng entity khác) hoặc factory `() => unknown[]`
 * (gọi lại mỗi lần, mỗi entity nhận 1 mảng riêng — tránh shared-reference).
 */
export function Array(options?: ArrayOptions): PropertyDecorator {
    return definePropertyType(new ArrayType(options));
}
