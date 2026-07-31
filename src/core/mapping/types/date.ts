import { definePropertyType, PropertyTypeDescriptor } from "./propertyType";

export interface DateOptions {
    /**
     * Giá trị mặc định **tĩnh** — dùng đúng 1 instance `Date` này cho mọi entity
     * thiếu field, KHÔNG phải "thời điểm lúc save" (không phải factory function).
     */
    default?: Date | null;
}

class DateType implements PropertyTypeDescriptor<Date> {
    readonly kind = "date";

    constructor(private readonly options: DateOptions = {}) {}

    hasDefault(): boolean {
        return this.options.default !== undefined;
    }

    getDefault(): Date | null {
        return this.options.default ?? null;
    }

    validate(value: unknown): string | null {
        if (value == null) {
            return null;
        }
        // `Date` bên dưới bị chính decorator `Date` (export ở cuối file) shadow do function
        // declaration hoisting — phải dùng globalThis.Date để chắc chắn tham chiếu class Date thật.
        return value instanceof globalThis.Date && !isNaN(value.getTime())
            ? null
            : `Expected a valid Date, got ${typeof value}`;
    }
}

/**
 * `options.default` là 1 giá trị `Date` tĩnh, được chia sẻ cho mọi entity thiếu field —
 * không phải factory sinh "thời điểm hiện tại" mỗi lần save. Nếu cần default động,
 * tự set giá trị field trước khi gọi save() thay vì dùng option này.
 */
export function Date(options?: DateOptions): PropertyDecorator {
    return definePropertyType(new DateType(options));
}
