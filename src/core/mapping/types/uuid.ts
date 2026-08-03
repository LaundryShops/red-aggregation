import { DefaultOrFactory, definePropertyType, PropertyTypeDescriptor, resolveDefaultValue } from "./propertyType";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface UuidOptions {
    default?: DefaultOrFactory<string> | null;
}

class UuidType implements PropertyTypeDescriptor<string> {
    readonly kind = "uuid";

    constructor(private readonly options: UuidOptions = {}) {}

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
        return typeof value === "string" && UUID_PATTERN.test(value)
            ? null
            : `Expected a UUID string, got ${typeof value === "string" ? value : typeof value}`;
    }
}

export function Uuid(options?: UuidOptions): PropertyDecorator {
    return definePropertyType(new UuidType(options));
}
