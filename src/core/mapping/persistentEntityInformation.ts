import type { PersistentEntity } from "../support/persistentEntity";
import { AbstractEntityInformation } from "../support/entityInformation";
import type { EntityClass } from "../support/entityMetadata";
import { PersistentProperty } from "../support/persistentProperty";

/**
 * {@link EntityInformation} ủy quyền cho {@link PersistentEntity}
 * {@code PersistentEntityInformation}).
 */
export class PersistentEntityInformation<
    T,
    ID,
    P extends PersistentProperty = PersistentProperty,
> extends AbstractEntityInformation<T, ID> {
    constructor(private readonly persistentEntity: PersistentEntity<T, P>) {
        super();
    }

    isNew(entity: T): boolean {
        return this.persistentEntity.isNew(entity);
    }

    getId(entity: T): ID | null {
        const raw = this.persistentEntity.getIdentifierAccessor(entity).getIdentifier();
        if (raw === null) {
            return null;
        }
        return raw as ID;
    }

    getEntityType(): EntityClass<T> {
        return this.persistentEntity.getType();
    }
}
