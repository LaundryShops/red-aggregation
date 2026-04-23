import type { CollationOptions } from "mongodb";
// import { ObjectId } from "mongodb";
import type { EntityClass } from "../support/entityMetadata";
import type { MongoPersistentEntity } from "../support/mongoPersistentEntity";
import type { MongoPersistentProperty } from "../support/mongoPersistentRepository";
import { BasicPersistentEntity } from "./basicPersistentEntity";

// type PropertyConfig<P = unknown> = {
//     name: string;
//     type: EntityClass<P>;
// };

/**
 * Implementation tối thiểu của {@link MongoPersistentEntity} phục vụ cho CRUD/repository layer.
 *
 * - `idProperty`/`versionProperty` là **tùy chọn** (giống mapping metadata).
 * - Nếu không có `idProperty`, {@link getIdentifierAccessor} sẽ fallback sang field `_id`.
 */
export class BasicMongoPersistentEntity<T>
    extends BasicPersistentEntity<T, MongoPersistentProperty>
    implements MongoPersistentEntity<T>
{
    private readonly collection: string;
    private readonly collation: CollationOptions | null;

    constructor(
        type: EntityClass<T>,
        collection: string,
        options?: {
            collation?: CollationOptions | null;
        },
    ) {
        super(type);

        this.collection = collection;
        this.collation = options?.collation ?? null;
    }

    getCollection(): string {
        return this.collection;
    }

    getCollation(): CollationOptions | null {
        return this.collation;
    }
}