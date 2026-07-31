import "reflect-metadata";
import { PlainObject as ObjectField } from "../../../../core/mapping/types/object";
import { getPropertyTypeMetadata } from "../../../../core/mapping/types/propertyType";

describe("@Object", () => {
    it("registers the property with kind 'object'", () => {
        class Post {
            @ObjectField() meta!: Record<string, unknown>;
        }

        const entries = getPropertyTypeMetadata(Post);
        expect(entries).toHaveLength(1);
        expect(entries[0].name).toBe("meta");
        expect(entries[0].descriptor.kind).toBe("object");
    });

    it("has no default when option omitted", () => {
        class Post {
            @ObjectField() meta!: Record<string, unknown>;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(Post);
        expect(descriptor.hasDefault()).toBe(false);
        expect(descriptor.getDefault()).toBeNull();
    });

    it("reports the configured default", () => {
        const fixed = { flag: true };
        class Post {
            @ObjectField({ default: fixed }) meta!: Record<string, unknown>;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(Post);
        expect(descriptor.hasDefault()).toBe(true);
        expect(descriptor.getDefault()).toBe(fixed);
    });

    it("validate: null/undefined are valid", () => {
        class Post {
            @ObjectField() meta!: Record<string, unknown>;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(Post);
        expect(descriptor.validate(null)).toBeNull();
        expect(descriptor.validate(undefined)).toBeNull();
    });

    it("validate: accepts plain objects (any field shape), rejects arrays and primitives", () => {
        class Post {
            @ObjectField() meta!: Record<string, unknown>;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(Post);
        expect(descriptor.validate({})).toBeNull();
        expect(descriptor.validate({ nested: { a: 1 }, list: [1, 2] })).toBeNull();
        expect(descriptor.validate([])).toEqual(expect.any(String));
        expect(descriptor.validate("not-an-object")).toEqual(expect.any(String));
        expect(descriptor.validate(123)).toEqual(expect.any(String));
    });
});
