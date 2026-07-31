import "reflect-metadata";
import { Number as NumberField } from "../../../../core/mapping/types/number";
import { getPropertyTypeMetadata } from "../../../../core/mapping/types/propertyType";

describe("@Number", () => {
    it("registers the property with kind 'number'", () => {
        class Product {
            @NumberField() price!: number;
        }

        const entries = getPropertyTypeMetadata(Product);
        expect(entries).toHaveLength(1);
        expect(entries[0].name).toBe("price");
        expect(entries[0].descriptor.kind).toBe("number");
    });

    it("has no default when option omitted", () => {
        class Product {
            @NumberField() price!: number;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(Product);
        expect(descriptor.hasDefault()).toBe(false);
        expect(descriptor.getDefault()).toBeNull();
    });

    it("reports the configured default", () => {
        class Product {
            @NumberField({ default: 0 }) price!: number;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(Product);
        expect(descriptor.hasDefault()).toBe(true);
        expect(descriptor.getDefault()).toBe(0);
    });

    it("validate: null/undefined are valid", () => {
        class Product {
            @NumberField() price!: number;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(Product);
        expect(descriptor.validate(null)).toBeNull();
        expect(descriptor.validate(undefined)).toBeNull();
    });

    it("validate: accepts finite numbers, rejects NaN and other types", () => {
        class Product {
            @NumberField() price!: number;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(Product);
        expect(descriptor.validate(9.99)).toBeNull();
        expect(descriptor.validate(NaN)).toEqual(expect.any(String));
        expect(descriptor.validate("9.99")).toEqual(expect.any(String));
    });
});
