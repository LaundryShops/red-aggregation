import "reflect-metadata";
import { CustomField } from "../../../../core/mapping/types/customField";
import { getPropertyTypeMetadata } from "../../../../core/mapping/types/propertyType";

describe("@CustomField", () => {
    it("registers the property with kind from options.kind, verbatim", () => {
        class User {
            @CustomField({ kind: "positive-number", validate: () => null }) score!: number;
        }

        const entries = getPropertyTypeMetadata(User);
        expect(entries).toHaveLength(1);
        expect(entries[0].name).toBe("score");
        expect(entries[0].descriptor.kind).toBe("positive-number");
    });

    it("has no default when option omitted", () => {
        class User {
            @CustomField({ kind: "stub", validate: () => null }) score!: number;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(User);
        expect(descriptor.hasDefault()).toBe(false);
        expect(descriptor.getDefault()).toBeNull();
    });

    it("reports a static default", () => {
        class User {
            @CustomField({ kind: "stub", validate: () => null, default: 7 }) score!: number;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(User);
        expect(descriptor.hasDefault()).toBe(true);
        expect(descriptor.getDefault()).toBe(7);
    });

    it("calls a factory default fresh on each getDefault()", () => {
        const factory = jest.fn(() => 7);
        class User {
            @CustomField({ kind: "stub", validate: () => null, default: factory }) score!: number;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(User);
        expect(descriptor.getDefault()).toBe(7);
        expect(descriptor.getDefault()).toBe(7);
        expect(factory).toHaveBeenCalledTimes(2);
    });

    it("validate: null/undefined are always valid, regardless of options.validate", () => {
        const validate = jest.fn(() => "should never be called for null/undefined");
        class User {
            @CustomField({ kind: "stub", validate }) score!: number;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(User);
        expect(descriptor.validate(null)).toBeNull();
        expect(descriptor.validate(undefined)).toBeNull();
        expect(validate).not.toHaveBeenCalled();
    });

    it("validate: delegates non-null values directly to options.validate", () => {
        class User {
            @CustomField<number>({
                kind: "positive-number",
                validate: (value) =>
                    typeof value === "number" && value > 0 ? null : `Expected positive number, got ${String(value)}`,
            })
            score!: number;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(User);
        expect(descriptor.validate(5)).toBeNull();
        expect(descriptor.validate(-1)).toEqual(expect.any(String));
        expect(descriptor.validate("5")).toEqual(expect.any(String));
    });
});
