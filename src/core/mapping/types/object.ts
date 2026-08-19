import { DefaultOrFactory, definePropertyType, PropertyTypeDescriptor, resolveDefaultValue } from "./propertyType";

export interface ObjectOptions {
    default?: DefaultOrFactory<Record<string, unknown>> | null;
}

class ObjectType implements PropertyTypeDescriptor<Record<string, unknown>> {
    readonly kind = "object";

    constructor(private readonly options: ObjectOptions = {}) {}

    hasDefault(): boolean {
        return this.options.default !== undefined;
    }

    getDefault(): Record<string, unknown> | null {
        return resolveDefaultValue(this.options.default);
    }

    validate(value: unknown): string | null {
        if (value == null) {
            return null;
        }
        const isPlainObject = typeof value === "object" && !globalThis.Array.isArray(value);
        return isPlainObject ? null : `Expected object, got ${typeof value}`;
    }
}

/**
 * Chỉ shallow-check (là object thường, không phải `null`/mảng), không validate field bên trong.
 *
 * `default` nhận object tĩnh (dùng chung 1 reference cho mọi entity thiếu field —
 * mutate ở 1 entity sẽ ảnh hưởng entity khác) hoặc factory `() => Record<string, unknown>`
 * (gọi lại mỗi lần, mỗi entity nhận 1 object riêng — tránh shared-reference).
 *
 * Đặt tên `PlainObject` thay vì `Object`: export 1 hàm top-level tên `Object` sẽ shadow
 * `Object` toàn bộ module scope, vỡ dòng `Object.defineProperty(exports, "__esModule", ...)`
 * mà chính `tsc` chèn vào đầu file khi build CommonJS + esModuleInterop (khác với
 * `Array`/`Date` — 2 global đó không bị boilerplate của tsc tham chiếu tới).
 */
export function PlainObject(options?: ObjectOptions): PropertyDecorator {
    return definePropertyType(new ObjectType(options));
}
