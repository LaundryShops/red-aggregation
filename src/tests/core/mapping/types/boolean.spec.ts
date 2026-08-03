import "reflect-metadata";
import { Boolean as BooleanField } from "../../../../core/mapping/types/boolean";
import { getPropertyTypeMetadata } from "../../../../core/mapping/types/propertyType";

describe("@Boolean", () => {
    it("registers the property with kind 'boolean'", () => {
        class Account {
            @BooleanField() active!: boolean;
        }

        const entries = getPropertyTypeMetadata(Account);
        expect(entries).toHaveLength(1);
        expect(entries[0].name).toBe("active");
        expect(entries[0].descriptor.kind).toBe("boolean");
    });

    it("has no default when option omitted", () => {
        class Account {
            @BooleanField() active!: boolean;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(Account);
        expect(descriptor.hasDefault()).toBe(false);
        expect(descriptor.getDefault()).toBeNull();
    });

    it("reports the configured default, including explicit false", () => {
        class Account {
            @BooleanField({ default: false }) active!: boolean;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(Account);
        expect(descriptor.hasDefault()).toBe(true);
        expect(descriptor.getDefault()).toBe(false);
    });

    it("validate: null/undefined are valid", () => {
        class Account {
            @BooleanField() active!: boolean;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(Account);
        expect(descriptor.validate(null)).toBeNull();
        expect(descriptor.validate(undefined)).toBeNull();
    });

    it("validate: accepts booleans, rejects other types", () => {
        class Account {
            @BooleanField() active!: boolean;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(Account);
        expect(descriptor.validate(true)).toBeNull();
        expect(descriptor.validate("true")).toEqual(expect.any(String));
    });

    it("calls a factory default fresh on each getDefault()", () => {
        const factory = jest.fn(() => true);
        class Account {
            @BooleanField({ default: factory }) active!: boolean;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(Account);
        expect(descriptor.hasDefault()).toBe(true);
        expect(descriptor.getDefault()).toBe(true);
        expect(descriptor.getDefault()).toBe(true);
        expect(factory).toHaveBeenCalledTimes(2);
    });
});
