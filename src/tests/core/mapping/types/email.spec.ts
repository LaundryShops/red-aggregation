import "reflect-metadata";
import { Email } from "../../../../core/mapping/types/email";
import { getPropertyTypeMetadata } from "../../../../core/mapping/types/propertyType";

describe("@Email", () => {
    it("registers the property with kind 'email'", () => {
        class User {
            @Email() email!: string;
        }

        const entries = getPropertyTypeMetadata(User);
        expect(entries).toHaveLength(1);
        expect(entries[0].name).toBe("email");
        expect(entries[0].descriptor.kind).toBe("email");
    });

    it("has no default when option omitted", () => {
        class User {
            @Email() email!: string;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(User);
        expect(descriptor.hasDefault()).toBe(false);
        expect(descriptor.getDefault()).toBeNull();
    });

    it("reports a static default", () => {
        class User {
            @Email({ default: "anon@example.com" }) email!: string;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(User);
        expect(descriptor.hasDefault()).toBe(true);
        expect(descriptor.getDefault()).toBe("anon@example.com");
    });

    it("calls a factory default fresh on each getDefault()", () => {
        const factory = jest.fn(() => "anon@example.com");
        class User {
            @Email({ default: factory }) email!: string;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(User);
        expect(descriptor.getDefault()).toBe("anon@example.com");
        expect(descriptor.getDefault()).toBe("anon@example.com");
        expect(factory).toHaveBeenCalledTimes(2);
    });

    it("validate: null/undefined are valid", () => {
        class User {
            @Email() email!: string;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(User);
        expect(descriptor.validate(null)).toBeNull();
        expect(descriptor.validate(undefined)).toBeNull();
    });

    it("validate: accepts common valid email shapes, rejects malformed strings and other types", () => {
        class User {
            @Email() email!: string;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(User);
        expect(descriptor.validate("user@example.com")).toBeNull();
        expect(descriptor.validate("first.last@sub.example.co")).toBeNull();
        expect(descriptor.validate("not-an-email")).toEqual(expect.any(String));
        expect(descriptor.validate("missing-domain@")).toEqual(expect.any(String));
        expect(descriptor.validate("@missing-local.com")).toEqual(expect.any(String));
        expect(descriptor.validate(12345)).toEqual(expect.any(String));
    });
});
