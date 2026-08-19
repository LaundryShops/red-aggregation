import type { CollationOptions } from "mongodb";
// import { ObjectId } from "mongodb";
import type { EntityClass } from "../support/entityMetadata";
import type { MongoPersistentEntity } from "../support/mongoPersistentEntity";
import type { MongoPersistentProperty } from "../support/mongoPersistentRepository";
import { BasicPersistentEntity } from "./basicPersistentEntity";
import type { SoftDeleteMetadata } from "./softDelete";
import type { PropertyTypeEntry } from "./types/propertyType";

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
    private readonly stripUnknownFieldsFlag: boolean;
    private readonly propertyTypes: readonly PropertyTypeEntry[];
    private readonly softDelete: SoftDeleteMetadata | null;

    constructor(
        type: EntityClass<T>,
        collection: string,
        options?: {
            collation?: CollationOptions | null;
            idProperty?: MongoPersistentProperty | null;
            stripUnknownFields?: boolean;
            propertyTypes?: readonly PropertyTypeEntry[];
            softDelete?: SoftDeleteMetadata | null;
        },
    ) {
        super(type, options?.idProperty ?? null);

        this.collection = collection;
        this.collation = options?.collation ?? null;
        this.stripUnknownFieldsFlag = options?.stripUnknownFields ?? false;
        this.propertyTypes = options?.propertyTypes ?? [];
        this.softDelete = options?.softDelete ?? null;
    }

    getCollection(): string {
        return this.collection;
    }

    getCollation(): CollationOptions | null {
        return this.collation;
    }

    shouldStripUnknownFields(): boolean {
        return this.stripUnknownFieldsFlag;
    }

    getKnownFieldNames(): string[] {
        const names = this.propertyTypes.map((entry) => entry.name);
        if (this.hasIdProperty()) {
            names.push(this.getRequiredIdProperty().getName());
        }
        if (this.softDelete != null) {
            names.push(this.softDelete.deletedAtField, this.softDelete.deletedByField);
        }
        return Array.from(new Set(names));
    }

    isSoftDeleteEnabled(): boolean {
        return this.softDelete != null;
    }

    getDeletedAtAttribute(): string | null {
        return this.softDelete?.deletedAtField ?? null;
    }

    getDeletedByAttribute(): string | null {
        return this.softDelete?.deletedByField ?? null;
    }

    applyDefaults(doc: Record<string, unknown>): void {
        for (const { name, descriptor } of this.propertyTypes) {
            if (doc[name] === undefined && descriptor.hasDefault()) {
                doc[name] = descriptor.getDefault();
            }
        }
    }

    validateForWrite(doc: Record<string, unknown>): string[] {
        const errors: string[] = [];
        for (const { name, descriptor } of this.propertyTypes) {
            const error = descriptor.validate(doc[name]);
            if (error != null) {
                errors.push(`${name}: ${error}`);
            }
        }
        return errors;
    }

    stripUnknownFields(doc: Record<string, unknown>): Record<string, unknown> {
        if (!this.stripUnknownFieldsFlag) {
            return { ...doc };
        }
        const known = new Set(this.getKnownFieldNames());
        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(doc)) {
            if (known.has(key)) {
                result[key] = value;
            }
        }
        return result;
    }
}