import type { EntityClass } from "./entityMetadata";
import { MongoPersistentProperty } from "./mongoPersistentRepository";
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
    // getRequiredIdProperty(): MongoPersistentProperty;
    // getRequiredIdProperty(): P;
    // getRequiredVersionProperty(): MongoPersistentProperty;
    hasVersionProperty(): boolean;

    getIdentifierAccessor(entity: T): IdentifierAccessor;

    getType(): EntityClass<T>;

    getPropertyAccessor<P>(entity: P): PersistentPropertyAccessor<P>;
}
