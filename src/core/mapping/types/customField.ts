import { DefaultOrFactory, definePropertyType, PropertyTypeDescriptor, resolveDefaultValue } from "./propertyType";

/**
 * Type generic, public — dùng để tự định nghĩa field theo nhu cầu riêng
 * (kind + validate + default tuỳ chọn) mà không cần sửa source thư viện.
 */
export interface CustomFieldOptions<T> {
    kind: string;
    validate: (value: unknown) => string | null;
    default?: DefaultOrFactory<T> | null;
}

class CustomFieldType<T> implements PropertyTypeDescriptor<T> {
    readonly kind: string;

    constructor(private readonly options: CustomFieldOptions<T>) {
        this.kind = options.kind;
    }

    hasDefault(): boolean {
        return this.options.default !== undefined;
    }

    getDefault(): T | null {
        return resolveDefaultValue(this.options.default);
    }

    validate(value: unknown): string | null {
        if (value == null) {
            return null;
        }
        return this.options.validate(value);
    }
}

/**
 * `default` nhận giá trị tĩnh hoặc factory `() => T` (gọi lại mỗi lần `getDefault()` chạy),
 * giống mọi type khác. `kind` do người dùng cung cấp, không cần unique toàn cục.
 */
export function CustomField<T>(options: CustomFieldOptions<T>): PropertyDecorator {
    return definePropertyType(new CustomFieldType(options));
}
