import "reflect-metadata";
import { String as StringField } from "../../../../core/mapping/types/string";
import { getPropertyTypeMetadata } from "../../../../core/mapping/types/propertyType";

describe("@String", () => {
    it("registers the property with kind 'string'", () => {
        class User {
            @StringField() name!: string;
        }

        const entries = getPropertyTypeMetadata(User);
        expect(entries).toHaveLength(1);
        expect(entries[0].name).toBe("name");
        expect(entries[0].descriptor.kind).toBe("string");
    });

    it("has no default when option omitted", () => {
        class User {
            @StringField() name!: string;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(User);
        expect(descriptor.hasDefault()).toBe(false);
        expect(descriptor.getDefault()).toBeNull();
    });

    it("reports the configured default", () => {
        class User {
            @StringField({ default: "anon" }) name!: string;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(User);
        expect(descriptor.hasDefault()).toBe(true);
        expect(descriptor.getDefault()).toBe("anon");
    });

    it("validate: null/undefined are valid", () => {
        class User {
            @StringField() name!: string;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(User);
        expect(descriptor.validate(null)).toBeNull();
        expect(descriptor.validate(undefined)).toBeNull();
    });

    it("validate: accepts strings, rejects other types", () => {
        class User {
            @StringField() name!: string;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(User);
        expect(descriptor.validate("hello")).toBeNull();
        expect(descriptor.validate(42)).toEqual(expect.any(String));
    });

    it("calls a factory default fresh on each getDefault()", () => {
        const factory = jest.fn(() => "generated");
        class User {
            @StringField({ default: factory }) name!: string;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(User);
        expect(descriptor.hasDefault()).toBe(true);
        expect(descriptor.getDefault()).toBe("generated");
        expect(descriptor.getDefault()).toBe("generated");
        expect(factory).toHaveBeenCalledTimes(2);
    });
});
