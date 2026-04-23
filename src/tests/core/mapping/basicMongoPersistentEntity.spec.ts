import type { CollationOptions } from "mongodb";
import { BasicMongoPersistentEntity } from "../../../core/mapping/basicMongoPersistentEntity";

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
});
