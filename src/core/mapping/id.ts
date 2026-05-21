import type { EntityClass } from "../support/entityMetadata";
import type { MongoPersistentProperty } from "../support/mongoPersistentRepository";

export const ID_METADATA = Symbol.for("mongodb.id");

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Reflect {
        function getMetadata(metadataKey: unknown, target: object, propertyKey: string | symbol): unknown;
    }
}

export interface IdMetadata {
    /** Tên property trên class (vd. `_id`, `userId`). */
    name: string;
    /** Constructor của kiểu id (vd. `ObjectId`, `String`). Có thể là `Object` nếu emitDecoratorMetadata không suy ra được. */
    type: Function;
}

/**
 * Property decorator đánh dấu identifier của entity.
 *
 * Chỉ cho phép 1 `@Id` trên mỗi class (kể cả qua kế thừa trên cùng class).
 *
 * ```ts
 * class User {
 *     @Id() _id!: ObjectId;
 * }
 * ```
 */
export function Id(): PropertyDecorator {
    return (target: object, propertyKey: string | symbol) => {
        const ctor = (target as { constructor: Function }).constructor;
        const existing = Reflect.getMetadata(ID_METADATA, ctor) as IdMetadata | undefined;
        if (existing && existing.name !== String(propertyKey)) {
            throw new Error(
                `@Id already defined on ${ctor.name}.${existing.name}; cannot redefine on ${String(propertyKey)}`,
            );
        }
        const designType =
            (Reflect.getMetadata("design:type", target, propertyKey) as Function | undefined) ??
            Object;
        const meta: IdMetadata = { name: String(propertyKey), type: designType };
        Reflect.defineMetadata(ID_METADATA, meta, ctor);
    };
}

export function getIdMetadata(ctor: Function): IdMetadata | null {
    if (typeof Reflect === "undefined" || !Reflect.getMetadata) {
        return null;
    }
    const meta = Reflect.getMetadata(ID_METADATA, ctor) as IdMetadata | undefined;
    return meta ?? null;
}

/**
 * Implementation tối giản của {@link MongoPersistentProperty} cho id property
 * — đủ để layer mapping/entity-information truy vấn tên + kiểu.
 */
class BasicIdProperty<P = unknown> implements MongoPersistentProperty<P> {
    constructor(
        private readonly name_: string,
        private readonly type_: EntityClass<P>,
    ) {}

    getName(): string {
        return this.name_;
    }

    getType(): EntityClass<P> {
        return this.type_;
    }
}

/**
 * Build {@link MongoPersistentProperty} từ metadata `@Id` gắn trên `ctor`.
 * Trả về `null` nếu class chưa khai báo `@Id`.
 */
export function buildIdProperty<P = unknown>(
    ctor: Function,
): MongoPersistentProperty<P> | null {
    const meta = getIdMetadata(ctor);
    if (!meta) {
        return null;
    }
    return new BasicIdProperty<P>(meta.name, meta.type as EntityClass<P>);
}
