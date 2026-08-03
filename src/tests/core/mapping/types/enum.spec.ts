import "reflect-metadata";
import { Enum } from "../../../../core/mapping/types/enum";
import { getPropertyTypeMetadata } from "../../../../core/mapping/types/propertyType";

describe("@Enum", () => {
    it("registers the property with kind 'enum'", () => {
        class Order {
            @Enum([1, 2, 3]) status!: number;
        }

        const entries = getPropertyTypeMetadata(Order);
        expect(entries).toHaveLength(1);
        expect(entries[0].name).toBe("status");
        expect(entries[0].descriptor.kind).toBe("enum");
    });

    it("has no default when option omitted", () => {
        class Order {
            @Enum([1, 2, 3]) status!: number;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(Order);
        expect(descriptor.hasDefault()).toBe(false);
        expect(descriptor.getDefault()).toBeNull();
    });

    it("reports the configured default", () => {
        class Order {
            @Enum([1, 2, 3], { default: 1 }) status!: number;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(Order);
        expect(descriptor.hasDefault()).toBe(true);
        expect(descriptor.getDefault()).toBe(1);
    });

    it("validate: null/undefined are valid", () => {
        class Order {
            @Enum([1, 2, 3]) status!: number;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(Order);
        expect(descriptor.validate(null)).toBeNull();
        expect(descriptor.validate(undefined)).toBeNull();
    });

    it("validate: accepts values in the list, rejects values outside it", () => {
        class Order {
            @Enum([1, 2, 3]) status!: number;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(Order);
        expect(descriptor.validate(2)).toBeNull();
        expect(descriptor.validate(99)).toEqual(expect.any(String));
    });

    it("works with string enums too", () => {
        class Order {
            @Enum(["pending", "paid", "shipped"], { default: "pending" }) status!: string;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(Order);
        expect(descriptor.getDefault()).toBe("pending");
        expect(descriptor.validate("paid")).toBeNull();
        expect(descriptor.validate("cancelled")).toEqual(expect.any(String));
    });

    it("calls a factory default fresh on each getDefault()", () => {
        const factory = jest.fn(() => "pending");
        class Order {
            @Enum(["pending", "paid", "shipped"], { default: factory }) status!: string;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(Order);
        expect(descriptor.hasDefault()).toBe(true);
        expect(descriptor.getDefault()).toBe("pending");
        expect(descriptor.getDefault()).toBe("pending");
        expect(factory).toHaveBeenCalledTimes(2);
    });
});
