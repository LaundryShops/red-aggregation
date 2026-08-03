import "reflect-metadata";
import { ObjectId as MongoObjectId } from "mongodb";
import { ObjectId } from "../../../../core/mapping/types/objectId";
import { getPropertyTypeMetadata } from "../../../../core/mapping/types/propertyType";

describe("@ObjectId", () => {
    it("registers the property with kind 'objectId'", () => {
        class User {
            @ObjectId() authorId!: MongoObjectId;
        }

        const entries = getPropertyTypeMetadata(User);
        expect(entries).toHaveLength(1);
        expect(entries[0].name).toBe("authorId");
        expect(entries[0].descriptor.kind).toBe("objectId");
    });

    it("has no default when option omitted", () => {
        class User {
            @ObjectId() authorId!: MongoObjectId;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(User);
        expect(descriptor.hasDefault()).toBe(false);
        expect(descriptor.getDefault()).toBeNull();
    });

    it("reports the configured default", () => {
        const fixed = new MongoObjectId("64b7f9e2a21f6a9e5b000001");
        class User {
            @ObjectId({ default: fixed }) authorId!: MongoObjectId;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(User);
        expect(descriptor.hasDefault()).toBe(true);
        expect(descriptor.getDefault()).toBe(fixed);
    });

    it("validate: null/undefined are valid", () => {
        class User {
            @ObjectId() authorId!: MongoObjectId;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(User);
        expect(descriptor.validate(null)).toBeNull();
        expect(descriptor.validate(undefined)).toBeNull();
    });

    it("validate: accepts a real ObjectId instance, rejects hex strings and other types", () => {
        class User {
            @ObjectId() authorId!: MongoObjectId;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(User);
        expect(descriptor.validate(new MongoObjectId("64b7f9e2a21f6a9e5b000001"))).toBeNull();
        expect(descriptor.validate("64b7f9e2a21f6a9e5b000001")).toEqual(expect.any(String));
        expect(descriptor.validate(12345)).toEqual(expect.any(String));
        expect(descriptor.validate({})).toEqual(expect.any(String));
    });

    it("calls a factory default fresh on each getDefault(), yielding a different ObjectId per call", () => {
        class User {
            @ObjectId({ default: () => new MongoObjectId() }) authorId!: MongoObjectId;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(User);
        const first = descriptor.getDefault() as MongoObjectId;
        const second = descriptor.getDefault() as MongoObjectId;
        expect(first).not.toBe(second);
        expect(first.equals(second)).toBe(false);
    });
});
