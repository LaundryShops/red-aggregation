import { definePropertyType, PropertyTypeDescriptor } from "./propertyType";

export interface BooleanOptions {
    default?: boolean | null;
}

class BooleanType implements PropertyTypeDescriptor<boolean> {
    readonly kind = "boolean";

    constructor(private readonly options: BooleanOptions = {}) {}

    hasDefault(): boolean {
        return this.options.default !== undefined;
    }

    getDefault(): boolean | null {
        return this.options.default ?? null;
    }

    validate(value: unknown): string | null {
        if (value == null) {
            return null;
        }
        return typeof value === "boolean" ? null : `Expected boolean, got ${typeof value}`;
    }
}

export function Boolean(options?: BooleanOptions): PropertyDecorator {
    return definePropertyType(new BooleanType(options));
}
