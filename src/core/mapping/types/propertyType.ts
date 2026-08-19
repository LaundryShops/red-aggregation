export const PROPERTY_TYPE_METADATA = Symbol.for("mongodb.propertyType");

declare global {
    // `reflect-metadata` augments the Reflect namespace at runtime, but TS doesn't know by default.
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Reflect {
        function defineMetadata(metadataKey: unknown, metadataValue: unknown, target: object): void;
        function getMetadata(metadataKey: unknown, target: object): unknown;
    }
}

/**
 * Contract chung cho mọi type decorator (`@String`, `@Number`, `@Enum`, ...).
 *
 * Mỗi type sống trong 1 file riêng, tự implement interface này — không có dispatcher
 * trung tâm nào biết về `kind` cụ thể, nên thêm/bớt 1 type không đụng tới type khác.
 */
export interface PropertyTypeDescriptor<T = unknown> {
    readonly kind: string;

    hasDefault(): boolean;

    getDefault(): T | null;

    /**
     * Trả về `null` nếu hợp lệ, hoặc message lỗi nếu không.
     * `null`/`undefined` luôn được coi là hợp lệ ở đây — việc field có bắt buộc
     * hay không là mối quan tâm khác (default/required), không phải của `validate`.
     */
    validate(value: unknown): string | null;
}

export interface PropertyTypeEntry {
    name: string;
    descriptor: PropertyTypeDescriptor;
}

/**
 * `default` option chung cho mọi type: giá trị tĩnh, hoặc factory không tham số
 * được gọi lại mỗi lần `getDefault()` chạy (không memoize).
 */
export type DefaultOrFactory<T> = T | (() => T);

export function resolveDefaultValue<T>(raw: DefaultOrFactory<T> | null | undefined): T | null {
    if (raw == null) {
        return null;
    }
    if (typeof raw === "function") {
        return (raw as () => T)();
    }
    return raw;
}

/**
 * Property decorator factory dùng chung cho mọi type decorator.
 *
 * Tích luỹ danh sách `{name, descriptor}` theo class (không phải 1 record đơn như `@Id`),
 * kế thừa qua prototype chain nhờ `Reflect.getMetadata` tự đi lên `ctor` cha — cùng cơ chế
 * đã dùng cho `@Id`.
 */
export function definePropertyType(descriptor: PropertyTypeDescriptor): PropertyDecorator {
    return (target: object, propertyKey: string | symbol) => {
        const ctor = (target as { constructor: Function }).constructor;
        const existing =
            (Reflect.getMetadata(PROPERTY_TYPE_METADATA, ctor) as PropertyTypeEntry[] | undefined) ?? [];
        const name = String(propertyKey);
        const next = [...existing.filter((entry) => entry.name !== name), { name, descriptor }];
        Reflect.defineMetadata(PROPERTY_TYPE_METADATA, next, ctor);
    };
}

export function getPropertyTypeMetadata(ctor: Function): PropertyTypeEntry[] {
    if (typeof Reflect === "undefined" || !Reflect.getMetadata) {
        return [];
    }
    return (Reflect.getMetadata(PROPERTY_TYPE_METADATA, ctor) as PropertyTypeEntry[] | undefined) ?? [];
}
