import "reflect-metadata";
import { Uuid } from "../../../../core/mapping/types/uuid";
import { getPropertyTypeMetadata } from "../../../../core/mapping/types/propertyType";

describe("@Uuid", () => {
    it("registers the property with kind 'uuid'", () => {
        class Session {
            @Uuid() token!: string;
        }

        const entries = getPropertyTypeMetadata(Session);
        expect(entries).toHaveLength(1);
        expect(entries[0].name).toBe("token");
        expect(entries[0].descriptor.kind).toBe("uuid");
    });

    it("has no default when option omitted", () => {
        class Session {
            @Uuid() token!: string;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(Session);
        expect(descriptor.hasDefault()).toBe(false);
        expect(descriptor.getDefault()).toBeNull();
    });

    it("reports the configured default", () => {
        const fixed = "123e4567-e89b-12d3-a456-426614174000";
        class Session {
            @Uuid({ default: fixed }) token!: string;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(Session);
        expect(descriptor.hasDefault()).toBe(true);
        expect(descriptor.getDefault()).toBe(fixed);
    });

    it("validate: null/undefined are valid", () => {
        class Session {
            @Uuid() token!: string;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(Session);
        expect(descriptor.validate(null)).toBeNull();
        expect(descriptor.validate(undefined)).toBeNull();
    });

    it("validate: accepts a well-formed UUID, rejects malformed strings and other types", () => {
        class Session {
            @Uuid() token!: string;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(Session);
        expect(descriptor.validate("123e4567-e89b-12d3-a456-426614174000")).toBeNull();
        expect(descriptor.validate("not-a-uuid")).toEqual(expect.any(String));
        expect(descriptor.validate(12345)).toEqual(expect.any(String));
    });
});
