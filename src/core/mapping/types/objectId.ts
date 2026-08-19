import { ObjectId as MongoObjectId } from "mongodb";
import { DefaultOrFactory, definePropertyType, PropertyTypeDescriptor, resolveDefaultValue } from "./propertyType";

export interface ObjectIdOptions {
    default?: DefaultOrFactory<MongoObjectId> | null;
}

class ObjectIdType implements PropertyTypeDescriptor<MongoObjectId> {
    readonly kind = "objectId";

    constructor(private readonly options: ObjectIdOptions = {}) {}

    hasDefault(): boolean {
        return this.options.default !== undefined;
    }

    getDefault(): MongoObjectId | null {
        return resolveDefaultValue(this.options.default);
    }

    validate(value: unknown): string | null {
        if (value == null) {
            return null;
        }
        return value instanceof MongoObjectId ? null : `Expected ObjectId, got ${typeof value}`;
    }
}

/**
 * `default` nhận `ObjectId` tĩnh (dùng chung 1 instance cho mọi entity thiếu field)
 * hoặc factory `() => ObjectId` (gọi lại mỗi lần — dùng khi cần giá trị riêng mỗi document).
 */
export function ObjectId(options?: ObjectIdOptions): PropertyDecorator {
    return definePropertyType(new ObjectIdType(options));
}
