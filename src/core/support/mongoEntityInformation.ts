import type { CollationOptions } from "mongodb";
import { AbstractEntityInformation, type EntityInformation } from "./entityInformation";

export interface MongoEntityInformation<T, ID> extends EntityInformation<T, ID> {
    /**
     * Tên collection entity được lưu.
     */
    getCollectionName(): string;

    /**
     * Tên field (attribute) lưu id.
     */
    getIdAttribute(): string;

    /**
     * Có {@code @Version} / optimistic locking hay không.
     */
    isVersioned(): boolean;

    /**
     * Giá trị version trên entity, hoặc {@code null} nếu không versioned.
     */
    getVersion(entity: T): unknown | null;

    /**
     * Entity có khai báo collation hay không.
     */
    hasCollation(): boolean;

    /**
     * Collation áp dụng cho entity, hoặc {@code null} (dùng {@link CollationOptions} của driver MongoDB).
     */
    getCollation(): CollationOptions | null;
}

export abstract class AbstractMongoEntityInformation<T, ID>
    extends AbstractEntityInformation<T, ID>
    implements MongoEntityInformation<T, ID>
{
    abstract getCollectionName(): string;

    abstract getIdAttribute(): string;

    abstract getCollation(): CollationOptions | null;

    isVersioned(): boolean {
        return false;
    }

    getVersion(_entity: T): unknown | null {
        return null;
    }

    hasCollation(): boolean {
        return this.getCollation() != null;
    }
}
