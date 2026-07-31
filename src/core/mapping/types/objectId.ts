import { ObjectId as MongoObjectId } from "mongodb";
import { definePropertyType, PropertyTypeDescriptor } from "./propertyType";

export interface ObjectIdOptions {
    default?: MongoObjectId | null;
}

class ObjectIdType implements PropertyTypeDescriptor<MongoObjectId> {
    readonly kind = "objectId";

    constructor(private readonly options: ObjectIdOptions = {}) {}

    hasDefault(): boolean {
        return this.options.default !== undefined;
    }

    getDefault(): MongoObjectId | null {
        return this.options.default ?? null;
    }

    validate(value: unknown): string | null {
        if (value == null) {
            return null;
        }
        return value instanceof MongoObjectId ? null : `Expected ObjectId, got ${typeof value}`;
    }
}

/**
 * `default` (nếu có) là 1 `ObjectId` cố định dùng chung cho mọi entity thiếu field —
 * không dùng cho field cần giá trị duy nhất mỗi document (vd. reference tới doc khác).
 */
export function ObjectId(options?: ObjectIdOptions): PropertyDecorator {
    return definePropertyType(new ObjectIdType(options));
}
