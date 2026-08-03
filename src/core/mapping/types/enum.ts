import { DefaultOrFactory, definePropertyType, PropertyTypeDescriptor, resolveDefaultValue } from "./propertyType";

export interface EnumOptions<T> {
    default?: DefaultOrFactory<T> | null;
}

class EnumType<T> implements PropertyTypeDescriptor<T> {
    readonly kind = "enum";

    constructor(
        private readonly values: readonly T[],
        private readonly options: EnumOptions<T> = {},
    ) {}

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
        return this.values.includes(value as T)
            ? null
            : `Expected one of [${this.values.join(", ")}], got ${String(value)}`;
    }
}

/**
 * `default` (nếu có) không bị kiểm tra phải nằm trong `values` lúc decorate —
 * giữ đơn giản cho v1, sai sót đó sẽ lộ ra qua `validate()` khi save().
 */
export function Enum<T>(values: readonly T[], options?: EnumOptions<T>): PropertyDecorator {
    return definePropertyType(new EnumType(values, options));
}
