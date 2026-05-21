import type { EntityClass } from "./entityMetadata";
import { PersistentProperty } from "./persistentProperty";
import { PersistentPropertyAccessor } from "./persistentPropertyAccessor";

/**
 * Truy cập identifier của một instance entity.
 */
export interface IdentifierAccessor {
    getIdentifier(): null | any;
}

/**
 * Mô tả metadata entity persistence.
 *
 * @typeParam T kiểu domain entity
 * @typeParam P kiểu property (thường là id property hoặc {@link PersistentProperty})
 */
export interface PersistentEntity<
    T,
    P extends PersistentProperty = PersistentProperty,
> {
    isNew(entity: T): boolean;

    hasIdProperty(): boolean;

    /**
     * Trả về id property (vd. từ `@Id`); ném nếu {@link hasIdProperty} là `false`.
     */
    getRequiredIdProperty(): P;

    hasVersionProperty(): boolean;

    getIdentifierAccessor(entity: T): IdentifierAccessor;

    getType(): EntityClass<T>;

    getPropertyAccessor<P>(entity: P): PersistentPropertyAccessor<P>;
}
