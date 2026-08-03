import { DefaultOrFactory, definePropertyType, PropertyTypeDescriptor, resolveDefaultValue } from "./propertyType";

export interface StringOptions {
    default?: DefaultOrFactory<string> | null;
}

class StringType implements PropertyTypeDescriptor<string> {
    readonly kind = "string";

    constructor(private readonly options: StringOptions = {}) {}

    hasDefault(): boolean {
        return this.options.default !== undefined;
    }

    getDefault(): string | null {
        return resolveDefaultValue(this.options.default);
    }

    validate(value: unknown): string | null {
        if (value == null) {
            return null;
        }
        return typeof value === "string" ? null : `Expected string, got ${typeof value}`;
    }
}

export function String(options?: StringOptions): PropertyDecorator {
    return definePropertyType(new StringType(options));
}
