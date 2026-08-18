import type { CollationOptions } from "mongodb";
import { BasicMongoPersistentEntity } from "../../../core/mapping/basicMongoPersistentEntity";
import type { PropertyTypeDescriptor, PropertyTypeEntry } from "../../../core/mapping/types/propertyType";

class StubType implements PropertyTypeDescriptor<string> {
    readonly kind = "stub";

    constructor(private readonly defaultValue?: string | null) {}

    hasDefault(): boolean {
        return this.defaultValue !== undefined;
    }

    getDefault(): string | null {
        return this.defaultValue ?? null;
    }

    validate(value: unknown): string | null {
        return value == null || typeof value === "string" ? null : "not a string";
    }
}

function stubEntry(name: string, defaultValue?: string | null): PropertyTypeEntry {
    return { name, descriptor: new StubType(defaultValue) };
}

describe("BasicMongoPersistentEntity", () => {
    class Product {
        _id?: string;
        name: string;
        price: number;

        constructor(name: string, price: number, _id?: string) {
            this.name = name;
            this.price = price;
            this._id = _id;
        }
    }

    describe("constructor", () => {
        it("should create with type, collection, and default collation", () => {
            const entity = new BasicMongoPersistentEntity(Product, "products");
            expect(entity.getType()).toBe(Product);
            expect(entity.getCollection()).toBe("products");
            expect(entity.getCollation()).toBeNull();
        });

        it("should create with custom collation options", () => {
            const collation: CollationOptions = { locale: "en_US", strength: 2 };
            const entity = new BasicMongoPersistentEntity(Product, "products", { collation });
            expect(entity.getCollation()).toEqual(collation);
        });

        it("should create with null collation when explicitly set", () => {
            const entity = new BasicMongoPersistentEntity(Product, "products", { collation: null });
            expect(entity.getCollation()).toBeNull();
        });
    });

    describe("getCollection", () => {
        it("should return the collection name", () => {
            const entity = new BasicMongoPersistentEntity(Product, "inventory");
            expect(entity.getCollection()).toBe("inventory");
        });
    });

    describe("getCollation", () => {
        it("should return null by default", () => {
            const entity = new BasicMongoPersistentEntity(Product, "products");
            expect(entity.getCollation()).toBeNull();
        });

        it("should return collation when provided", () => {
            const collation: CollationOptions = { locale: "vi_VN", caseLevel: true };
            const entity = new BasicMongoPersistentEntity(Product, "products", { collation });
            expect(entity.getCollation()).toEqual(collation);
        });
    });

    describe("inherited from BasicPersistentEntity", () => {
        it("should inherit isNew behavior", () => {
            const entity = new BasicMongoPersistentEntity(Product, "products");
            const newProduct = new Product("Laptop", 1000);
            const savedProduct = new Product("Phone", 500, "prod-123");

            expect(entity.isNew(newProduct)).toBe(true);
            expect(entity.isNew(savedProduct)).toBe(false);
        });

        it("should inherit getIdentifierAccessor behavior", () => {
            const entity = new BasicMongoPersistentEntity(Product, "products");
            const product = new Product("Tablet", 300, "tablet-001");
            const accessor = entity.getIdentifierAccessor(product);

            expect(accessor.getIdentifier()).toBe("tablet-001");
        });

        it("should inherit getPropertyAccessor behavior", () => {
            const entity = new BasicMongoPersistentEntity(Product, "products");
            const product = new Product("Watch", 200, "watch-001");
            const accessor = entity.getPropertyAccessor(product);

            expect(accessor.getProperty("name")).toBe("Watch");
            expect(accessor.getProperty("price")).toBe(200);
        });

        it("should inherit hasVersionProperty behavior", () => {
            const entity = new BasicMongoPersistentEntity(Product, "products");
            expect(entity.hasVersionProperty()).toBe(false);
        });

        it("should inherit hasIdProperty behavior", () => {
            const entity = new BasicMongoPersistentEntity(Product, "products");
            expect(entity.hasIdProperty()).toBe(false);
        });
    });

    describe("shouldStripUnknownFields", () => {
        it("defaults to false when not provided", () => {
            const entity = new BasicMongoPersistentEntity(Product, "products");
            expect(entity.shouldStripUnknownFields()).toBe(false);
        });

        it("reflects the stripUnknownFields option", () => {
            const entity = new BasicMongoPersistentEntity(Product, "products", { stripUnknownFields: true });
            expect(entity.shouldStripUnknownFields()).toBe(true);
        });
    });

    describe("getKnownFieldNames", () => {
        it("returns typed-field names union id property name, deduped", () => {
            const idProperty = { getName: () => "_id", getType: () => String as any };
            const entity = new BasicMongoPersistentEntity(Product, "products", {
                idProperty,
                propertyTypes: [stubEntry("name"), stubEntry("price")],
            });

            expect(entity.getKnownFieldNames().sort()).toEqual(["_id", "name", "price"]);
        });

        it("returns only typed-field names when there is no id property", () => {
            const entity = new BasicMongoPersistentEntity(Product, "products", {
                propertyTypes: [stubEntry("name")],
            });

            expect(entity.getKnownFieldNames()).toEqual(["name"]);
        });

        it("includes deletedAtField/deletedByField when soft delete is enabled", () => {
            const entity = new BasicMongoPersistentEntity(Product, "products", {
                propertyTypes: [stubEntry("name")],
                softDelete: { deletedAtField: "deleted_at", deletedByField: "deleted_by" },
            });

            expect(entity.getKnownFieldNames().sort()).toEqual(["deleted_at", "deleted_by", "name"]);
        });
    });

    describe("soft delete", () => {
        it("defaults to disabled with null attribute getters when no softDelete option is given", () => {
            const entity = new BasicMongoPersistentEntity(Product, "products");

            expect(entity.isSoftDeleteEnabled()).toBe(false);
            expect(entity.getDeletedAtAttribute()).toBeNull();
            expect(entity.getDeletedByAttribute()).toBeNull();
        });

        it("reports enabled with attribute names when a softDelete option is given", () => {
            const entity = new BasicMongoPersistentEntity(Product, "products", {
                softDelete: { deletedAtField: "deleted_at", deletedByField: "deleted_by" },
            });

            expect(entity.isSoftDeleteEnabled()).toBe(true);
            expect(entity.getDeletedAtAttribute()).toBe("deleted_at");
            expect(entity.getDeletedByAttribute()).toBe("deleted_by");
        });
    });

    describe("applyDefaults", () => {
        it("fills in undefined fields that have a default", () => {
            const entity = new BasicMongoPersistentEntity(Product, "products", {
                propertyTypes: [stubEntry("name", "anon")],
            });
            const doc: Record<string, unknown> = {};

            entity.applyDefaults(doc);

            expect(doc.name).toBe("anon");
        });

        it("does not overwrite a field that is explicitly null", () => {
            const entity = new BasicMongoPersistentEntity(Product, "products", {
                propertyTypes: [stubEntry("name", "anon")],
            });
            const doc: Record<string, unknown> = { name: null };

            entity.applyDefaults(doc);

            expect(doc.name).toBeNull();
        });

        it("does nothing for fields with no default", () => {
            const entity = new BasicMongoPersistentEntity(Product, "products", {
                propertyTypes: [stubEntry("name")],
            });
            const doc: Record<string, unknown> = {};

            entity.applyDefaults(doc);

            expect(doc.name).toBeUndefined();
        });
    });

    describe("validateForWrite", () => {
        it("returns an empty array when every field is valid", () => {
            const entity = new BasicMongoPersistentEntity(Product, "products", {
                propertyTypes: [stubEntry("name")],
            });

            expect(entity.validateForWrite({ name: "Laptop" })).toEqual([]);
        });

        it("returns one message per failing field", () => {
            const entity = new BasicMongoPersistentEntity(Product, "products", {
                propertyTypes: [stubEntry("name")],
            });

            const errors = entity.validateForWrite({ name: 42 });

            expect(errors).toHaveLength(1);
            expect(errors[0]).toContain("name");
        });
    });

    describe("stripUnknownFields", () => {
        it("returns a copy unchanged when the option is off", () => {
            const entity = new BasicMongoPersistentEntity(Product, "products", {
                propertyTypes: [stubEntry("name")],
            });
            const doc = { name: "Laptop", extra: "sneaky" };

            expect(entity.stripUnknownFields(doc)).toEqual({ name: "Laptop", extra: "sneaky" });
        });

        it("removes fields not in the whitelist when the option is on", () => {
            const entity = new BasicMongoPersistentEntity(Product, "products", {
                stripUnknownFields: true,
                propertyTypes: [stubEntry("name")],
            });
            const doc = { name: "Laptop", extra: "sneaky" };

            expect(entity.stripUnknownFields(doc)).toEqual({ name: "Laptop" });
        });

        it("keeps the id field even when stripping is on", () => {
            const idProperty = { getName: () => "_id", getType: () => String as any };
            const entity = new BasicMongoPersistentEntity(Product, "products", {
                stripUnknownFields: true,
                idProperty,
                propertyTypes: [stubEntry("name")],
            });
            const doc = { _id: "1", name: "Laptop", extra: "sneaky" };

            expect(entity.stripUnknownFields(doc)).toEqual({ _id: "1", name: "Laptop" });
        });
    });
});
