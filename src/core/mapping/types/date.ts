import { DefaultOrFactory, definePropertyType, PropertyTypeDescriptor, resolveDefaultValue } from "./propertyType";

export interface DateOptions {
    /**
     * Giá trị `Date` tĩnh (1 instance dùng chung cho mọi entity thiếu field), hoặc
     * factory `() => Date` được gọi lại mỗi lần `getDefault()` chạy — vd. dùng
     * `() => new Date()` để sinh "thời điểm hiện tại lúc save".
     */
    default?: DefaultOrFactory<Date> | null;
}

class DateType implements PropertyTypeDescriptor<Date> {
    readonly kind = "date";

    constructor(private readonly options: DateOptions = {}) {}

    hasDefault(): boolean {
        return this.options.default !== undefined;
    }

    getDefault(): Date | null {
        return resolveDefaultValue(this.options.default);
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
 * `options.default` nhận giá trị `Date` tĩnh (chia sẻ 1 instance cho mọi entity thiếu
 * field) hoặc factory `() => Date` (gọi lại mỗi lần, vd. sinh "thời điểm hiện tại lúc save").
 */
export function Date(options?: DateOptions): PropertyDecorator {
    return definePropertyType(new DateType(options));
}
