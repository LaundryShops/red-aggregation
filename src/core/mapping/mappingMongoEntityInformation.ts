import type { CollationOptions } from "mongodb";
import { ObjectId } from "mongodb";
import type { EntityClass } from "../support/entityMetadata";
import type { MongoEntityInformation } from "../support/mongoEntityInformation";
import type { MongoPersistentEntity } from "../support/mongoPersistentEntity";
import { PersistentEntityInformation } from "./persistentEntityInformation";

/**
 * {@link MongoEntityInformation} dựa trên {@link MongoPersistentEntity}.
 *
 * Có thể cấu hình `customCollectionName` để override collection từ metadata.
 */
export class MappingMongoEntityInformation<T, ID>
    extends PersistentEntityInformation<T, ID>
    implements MongoEntityInformation<T, ID>
{
    private readonly entityMetadata: MongoPersistentEntity<T>;
    private readonly customCollectionName: string | null;
    private readonly fallbackIdType: EntityClass<ID>;

    constructor(entity: MongoPersistentEntity<T>);
    constructor(entity: MongoPersistentEntity<T>, fallbackIdType: EntityClass<ID> | null);
    constructor(entity: MongoPersistentEntity<T>, customCollectionName: string);
    constructor(
        entity: MongoPersistentEntity<T>,
        second?: string | EntityClass<ID> | null,
        third?: EntityClass<ID> | null,
    ) {
        super(entity);

        this.entityMetadata = entity;

        const customCollectionName =
            typeof second === "string" ? second : null;
        const fallbackIdType =
            (typeof second === "function" ? second : third) ??
            (ObjectId as unknown as EntityClass<ID>);

        this.customCollectionName = customCollectionName;
        this.fallbackIdType = fallbackIdType;
    }

    getCollectionName(): string {
        return this.customCollectionName ?? this.entityMetadata.getCollection();
    }

    getIdAttribute(): string {
        return '_id';
        // return this.entityMetadata.hasIdProperty()
        //     ? this.entityMetadata.getRequiredIdProperty().getName()
        //     : "_id";
    }

    isVersioned(): boolean {
        return this.entityMetadata.hasVersionProperty();
    }

    getVersion(entity: T): unknown | null {
        return null;
        // if (!this.isVersioned()) {
        //     return null;
        // }
        // const accessor = this.entityMetadata.getPropertyAccessor(entity);
        // return accessor.getProperty(this.entityMetadata.getRequiredVersionProperty());
    }

    hasCollation(): boolean {
        return this.getCollation() != null;
    }

    getCollation(): CollationOptions | null {
        return this.entityMetadata.getCollation();
    }
}