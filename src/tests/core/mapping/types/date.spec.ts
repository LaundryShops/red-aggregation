import "reflect-metadata";
import { Date as DateField } from "../../../../core/mapping/types/date";
import { getPropertyTypeMetadata } from "../../../../core/mapping/types/propertyType";

describe("@Date", () => {
    it("registers the property with kind 'date'", () => {
        class Article {
            @DateField() publishedAt!: Date;
        }

        const entries = getPropertyTypeMetadata(Article);
        expect(entries).toHaveLength(1);
        expect(entries[0].name).toBe("publishedAt");
        expect(entries[0].descriptor.kind).toBe("date");
    });

    it("has no default when option omitted", () => {
        class Article {
            @DateField() publishedAt!: Date;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(Article);
        expect(descriptor.hasDefault()).toBe(false);
        expect(descriptor.getDefault()).toBeNull();
    });

    it("reports the same static Date instance as default on every call", () => {
        const fixed = new Date("2024-01-01T00:00:00.000Z");
        class Article {
            @DateField({ default: fixed }) publishedAt!: Date;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(Article);
        expect(descriptor.getDefault()).toBe(fixed);
        expect(descriptor.getDefault()).toBe(fixed);
    });

    it("validate: null/undefined are valid", () => {
        class Article {
            @DateField() publishedAt!: Date;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(Article);
        expect(descriptor.validate(null)).toBeNull();
        expect(descriptor.validate(undefined)).toBeNull();
    });

    it("validate: accepts valid Date instances, rejects invalid Date and other types", () => {
        class Article {
            @DateField() publishedAt!: Date;
        }

        const [{ descriptor }] = getPropertyTypeMetadata(Article);
        expect(descriptor.validate(new Date())).toBeNull();
        expect(descriptor.validate(new Date("not-a-date"))).toEqual(expect.any(String));
        expect(descriptor.validate("2024-01-01")).toEqual(expect.any(String));
    });
});
