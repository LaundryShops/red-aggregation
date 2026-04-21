import { PersistentEntityInformation } from "../../../core/mapping/persistentEntityInformation";
import { BasicPersistentEntity } from "../../../core/mapping/basicPersistentEntity";
import type { PersistentEntity } from "../../../core/support/persistentEntity";

describe("PersistentEntityInformation", () => {
    class Order {
        _id?: string;
        total: number;

        constructor(total: number, _id?: string) {
            this.total = total;
            this._id = _id;
        }
    }

    function createEntityInfo() {
        const persistentEntity = new BasicPersistentEntity<Order>(Order);
        return new PersistentEntityInformation<Order, string>(persistentEntity);
    }

    describe("constructor", () => {
        it("should create with persistent entity", () => {
            const persistentEntity = new BasicPersistentEntity<Order>(Order);
            const info = new PersistentEntityInformation<Order, string>(persistentEntity);
            expect(info).toBeDefined();
        });
    });

    describe("isNew", () => {
        it("should return true for entity without id", () => {
            const info = createEntityInfo();
            const order = new Order(100);
            expect(info.isNew(order)).toBe(true);
        });

        it("should return false for entity with id", () => {
            const info = createEntityInfo();
            const order = new Order(100, "order-123");
            expect(info.isNew(order)).toBe(false);
        });
    });

    describe("getId", () => {
        it("should return id when present", () => {
            const info = createEntityInfo();
            const order = new Order(200, "order-456");
            expect(info.getId(order)).toBe("order-456");
        });

        it("should return null when id is absent", () => {
            const info = createEntityInfo();
            const order = new Order(200);
            expect(info.getId(order)).toBeNull();
        });

        it("should return null when id is undefined", () => {
            const info = createEntityInfo();
            const order = new Order(200);
            (order as any)._id = undefined;
            expect(info.getId(order)).toBeNull();
        });
    });

    describe("getRequiredId", () => {
        it("should return id when present", () => {
            const info = createEntityInfo();
            const order = new Order(300, "order-789");
            expect(info.getRequiredId(order)).toBe("order-789");
        });

        it("should throw error when entity is null", () => {
            const info = createEntityInfo();
            expect(() => info.getRequiredId(null as any)).toThrow("Entity must not be null");
        });

        it("should throw error when id is null", () => {
            const info = createEntityInfo();
            const order = new Order(300);
            expect(() => info.getRequiredId(order)).toThrow(/Could not obtain required identifier/);
        });

        it("should throw error when id is undefined", () => {
            const info = createEntityInfo();
            const order = new Order(300);
            (order as any)._id = undefined;
            expect(() => info.getRequiredId(order)).toThrow(/Could not obtain required identifier/);
        });
    });

    describe("getEntityType", () => {
        it("should return the entity class", () => {
            const info = createEntityInfo();
            expect(info.getEntityType()).toBe(Order);
        });
    });
});
