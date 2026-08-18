import { ObjectId } from "mongodb";
import type { CollationOptions } from "mongodb";
import { MappingMongoEntityInformation } from "../../../core/mapping/mappingMongoEntityInformation";
import { BasicMongoPersistentEntity } from "../../../core/mapping/basicMongoPersistentEntity";
import type { EntityClass } from "../../../core/support/entityMetadata";

describe("MappingMongoEntityInformation", () => {
    class Product {
        _id?: string | ObjectId;
        name: string;
        price: number;

        constructor(name: string, price: number, _id?: string | ObjectId) {
            this.name = name;
            this.price = price;
            this._id = _id;
        }
    }

    function createEntityMetadata(collectionName: string, collation: CollationOptions | null = null) {
        return new BasicMongoPersistentEntity<Product>(Product, collectionName, { collation });
    }

    describe("constructor with single parameter", () => {
        it("should create with only entity metadata and default ObjectId fallback", () => {
            const entity = createEntityMetadata("products");
            const info = new MappingMongoEntityInformation<Product, ObjectId>(entity);

            expect(info.getCollectionName()).toBe("products");
            expect(info.getIdAttribute()).toBe("_id");
        });
    });

    describe("constructor with custom collection name", () => {
        it("should use custom collection name when provided as string", () => {
            const entity = createEntityMetadata("products");
            const info = new MappingMongoEntityInformation<Product, string>(entity, "custom_products");

            expect(info.getCollectionName()).toBe("custom_products");
        });
    });

    describe("constructor with fallback id type", () => {
        it("should use provided fallback id type", () => {
            const entity = createEntityMetadata("products");
            class CustomId {}
            const info = new MappingMongoEntityInformation<Product, CustomId>(entity, CustomId);

            expect(info).toBeDefined();
        });
    });


    describe("getCollectionName", () => {
        it("should return entity metadata collection when no custom name", () => {
            const entity = createEntityMetadata("inventory");
            const info = new MappingMongoEntityInformation<Product, string>(entity);

            expect(info.getCollectionName()).toBe("inventory");
        });

        it("should return custom collection name when provided", () => {
            const entity = createEntityMetadata("inventory");
            const info = new MappingMongoEntityInformation<Product, string>(entity, "warehouse");

            expect(info.getCollectionName()).toBe("warehouse");
        });

        it("should prefer custom name over entity metadata", () => {
            const entity = createEntityMetadata("original_collection");
            const info = new MappingMongoEntityInformation<Product, string>(entity, "override_collection");

            expect(info.getCollectionName()).toBe("override_collection");
        });
    });

    describe("getIdAttribute", () => {
        it("should return '_id' as fallback when entity has no id property", () => {
            const entity = createEntityMetadata("products");
            const info = new MappingMongoEntityInformation<Product, ObjectId>(entity);

            expect(info.getIdAttribute()).toBe("_id");
        });

        it("should read id property name from entity metadata when present", () => {
            const entity = createEntityMetadata("products");
            jest.spyOn(entity, "hasIdProperty").mockReturnValue(true);
            jest.spyOn(entity, "getRequiredIdProperty").mockReturnValue({
                getName: () => "productId",
                getType: () => String as unknown as EntityClass<unknown>,
            });
            const info = new MappingMongoEntityInformation<Product, string>(entity);

            expect(info.getIdAttribute()).toBe("productId");
        });
    });

    describe("isVersioned", () => {
        it("should return false by default", () => {
            const entity = createEntityMetadata("products");
            const info = new MappingMongoEntityInformation<Product, ObjectId>(entity);

            expect(info.isVersioned()).toBe(false);
        });

        it("should return value from entity metadata hasVersionProperty", () => {
            const entity = createEntityMetadata("products");
            // Mock hasVersionProperty to return true
            jest.spyOn(entity, "hasVersionProperty").mockReturnValue(true);
            const info = new MappingMongoEntityInformation<Product, ObjectId>(entity);

            expect(info.isVersioned()).toBe(true);
        });
    });

    describe("getVersion", () => {
        it("should return null by default", () => {
            const entity = createEntityMetadata("products");
            const info = new MappingMongoEntityInformation<Product, ObjectId>(entity);
            const product = new Product("Laptop", 1000);

            expect(info.getVersion(product)).toBeNull();
        });
    });

    describe("hasCollation", () => {
        it("should return false when no collation", () => {
            const entity = createEntityMetadata("products", null);
            const info = new MappingMongoEntityInformation<Product, ObjectId>(entity);

            expect(info.hasCollation()).toBe(false);
        });

        it("should return true when collation is set", () => {
            const collation: CollationOptions = { locale: "en_US" };
            const entity = createEntityMetadata("products", collation);
            const info = new MappingMongoEntityInformation<Product, ObjectId>(entity);

            expect(info.hasCollation()).toBe(true);
        });
    });

    describe("getCollation", () => {
        it("should return null when no collation", () => {
            const entity = createEntityMetadata("products", null);
            const info = new MappingMongoEntityInformation<Product, ObjectId>(entity);

            expect(info.getCollation()).toBeNull();
        });

        it("should return collation options when set", () => {
            const collation: CollationOptions = { locale: "vi_VN", strength: 2 };
            const entity = createEntityMetadata("products", collation);
            const info = new MappingMongoEntityInformation<Product, ObjectId>(entity);

            expect(info.getCollation()).toEqual(collation);
        });
    });

    describe("isSoftDeleteEnabled / getDeletedAtAttribute / getDeletedByAttribute", () => {
        it("should return false/null by default (no softDelete option)", () => {
            const entity = createEntityMetadata("products");
            const info = new MappingMongoEntityInformation<Product, ObjectId>(entity);

            expect(info.isSoftDeleteEnabled()).toBe(false);
            expect(info.getDeletedAtAttribute()).toBeNull();
            expect(info.getDeletedByAttribute()).toBeNull();
        });

        it("should delegate to entity metadata when soft delete is enabled", () => {
            const entity = new BasicMongoPersistentEntity<Product>(Product, "products", {
                softDelete: { deletedAtField: "deleted_at", deletedByField: "deleted_by" },
            });
            const info = new MappingMongoEntityInformation<Product, ObjectId>(entity);

            expect(info.isSoftDeleteEnabled()).toBe(true);
            expect(info.getDeletedAtAttribute()).toBe("deleted_at");
            expect(info.getDeletedByAttribute()).toBe("deleted_by");
        });
    });

    describe("inherited methods from PersistentEntityInformation", () => {
        it("should delegate isNew to persistent entity", () => {
            const entity = createEntityMetadata("products");
            const info = new MappingMongoEntityInformation<Product, string>(entity);
            const newProduct = new Product("Phone", 500);
            const savedProduct = new Product("Tablet", 300, "tablet-001");

            expect(info.isNew(newProduct)).toBe(true);
            expect(info.isNew(savedProduct)).toBe(false);
        });

        it("should delegate getId to persistent entity", () => {
            const entity = createEntityMetadata("products");
            const info = new MappingMongoEntityInformation<Product, string>(entity);
            const product = new Product("Watch", 200, "watch-001");

            expect(info.getId(product)).toBe("watch-001");
        });

        it("should return ObjectId as ID type", () => {
            const entity = createEntityMetadata("products");
            const info = new MappingMongoEntityInformation<Product, ObjectId>(entity);
            const product = new Product("Camera", 800, new ObjectId());

            expect(info.getId(product)).toBeInstanceOf(ObjectId);
        });

        it("should get entity type from persistent entity", () => {
            const entity = createEntityMetadata("products");
            const info = new MappingMongoEntityInformation<Product, ObjectId>(entity);

            expect(info.getEntityType()).toBe(Product);
        });
    });
});
