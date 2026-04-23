/**
 * Constructor của domain type `T`
 * Dùng `abstract` để cho phép cả class cụ thể lẫn class trừu tượng làm entity.
 */
export type EntityClass<T = unknown> = abstract new (...args: never[]) => T;

export interface EntityMetadata<T> {
    /**
     * Trả về class (constructor) thực của domain entity.
     */
    getEntityType(): EntityClass<T>;
}
