import { DefaultOrFactory, definePropertyType, PropertyTypeDescriptor, resolveDefaultValue } from "./propertyType";

export interface NumberOptions {
    default?: DefaultOrFactory<number> | null;
}

class NumberType implements PropertyTypeDescriptor<number> {
    readonly kind = "number";

    constructor(private readonly options: NumberOptions = {}) {}

    hasDefault(): boolean {
        return this.options.default !== undefined;
    }

    getDefault(): number | null {
        return resolveDefaultValue(this.options.default);
    }

    validate(value: unknown): string | null {
        if (value == null) {
            return null;
        }
        // `Number` bên dưới bị chính decorator `Number` (export ở cuối file) shadow do function
        // declaration hoisting — phải dùng globalThis.Number để chắc chắn tham chiếu class thật.
        return typeof value === "number" && !globalThis.Number.isNaN(value)
            ? null
            : `Expected number, got ${typeof value}`;
    }
}

export function Number(options?: NumberOptions): PropertyDecorator {
    return definePropertyType(new NumberType(options));
}
