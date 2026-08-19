import "reflect-metadata";
import { Array as ArrayField } from "../../../../core/mapping/types/array";
import { getPropertyTypeMetadata } from "../../../../core/mapping/types/propertyType";

describe("@Array", () => {
    it("registers the property with kind 'array'", () => {
        class Post {
            @ArrayField() tags!: string[];
        }

        const entries = getPropertyTypeMetadata(Post);
        expect(entries).toHaveLength(1);
        expect(entries[0].name).toBe("tags");
        expect(entries[0].descriptor.kind).toBe("array");
    });

    it("has no default when option omitted", () => {
        class Post {
            @ArrayField() tags!: string[];
        }

        const [{ descriptor }] = getPropertyTypeMetadata(Post);
        expect(descriptor.hasDefault()).toBe(false);
        expect(descriptor.getDefault()).toBeNull();
    });

    it("reports the configured default", () => {
        const fixed = ["a", "b"];
        class Post {
            @ArrayField({ default: fixed }) tags!: string[];
        }

        const [{ descriptor }] = getPropertyTypeMetadata(Post);
        expect(descriptor.hasDefault()).toBe(true);
        expect(descriptor.getDefault()).toBe(fixed);
    });

    it("validate: null/undefined are valid", () => {
        class Post {
            @ArrayField() tags!: string[];
        }

        const [{ descriptor }] = getPropertyTypeMetadata(Post);
        expect(descriptor.validate(null)).toBeNull();
        expect(descriptor.validate(undefined)).toBeNull();
    });

    it("validate: accepts arrays (any element shape), rejects non-arrays", () => {
        class Post {
            @ArrayField() tags!: string[];
        }

        const [{ descriptor }] = getPropertyTypeMetadata(Post);
        expect(descriptor.validate([])).toBeNull();
        expect(descriptor.validate(["a", 1, {}])).toBeNull();
        expect(descriptor.validate("not-an-array")).toEqual(expect.any(String));
        expect(descriptor.validate({})).toEqual(expect.any(String));
        expect(descriptor.validate(123)).toEqual(expect.any(String));
    });

    it("calls a factory default fresh on each getDefault(), yielding distinct array references", () => {
        class Post {
            @ArrayField({ default: () => [] }) tags!: string[];
        }

        const [{ descriptor }] = getPropertyTypeMetadata(Post);
        const first = descriptor.getDefault();
        const second = descriptor.getDefault();
        expect(first).not.toBe(second);
        expect(first).toEqual([]);
        expect(second).toEqual([]);
    });
});
