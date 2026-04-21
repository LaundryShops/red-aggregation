import { BasicPersistentEntity } from "../../../core/mapping/basicPersistentEntity";

describe("BasicPersistentEntity", () => {
    class User {
        _id?: string;
        name: string;
        version?: number;

        constructor(name: string, _id?: string) {
            this.name = name;
            this._id = _id;
        }
    }

    describe("constructor", () => {
        it("should create with entity class", () => {
            const entity = new BasicPersistentEntity<User>(User);
            expect(entity.getType()).toBe(User);
        });

        it("should create without entity class", () => {
            const entity = new BasicPersistentEntity<User>();
            expect(() => entity.getType()).toThrow("Entity type not configured");
        });
    });

    describe("hasVersionProperty", () => {
        it("should return false by default", () => {
            const entity = new BasicPersistentEntity<User>(User);
            expect(entity.hasVersionProperty()).toBe(false);
        });
    });

    describe("hasIdProperty", () => {
        it("should return false by default (uses _id fallback)", () => {
            const entity = new BasicPersistentEntity<User>(User);
            expect(entity.hasIdProperty()).toBe(false);
        });
    });

    describe("isNew", () => {
        it("should return true when entity has no _id", () => {
            const entity = new BasicPersistentEntity<User>(User);
            const user = new User("John");
            expect(entity.isNew(user)).toBe(true);
        });

        it("should return false when entity has _id", () => {
            const entity = new BasicPersistentEntity<User>(User);
            const user = new User("John", "123");
            expect(entity.isNew(user)).toBe(false);
        });

        it("should return true when _id is null", () => {
            const entity = new BasicPersistentEntity<User>(User);
            const user = new User("John");
            (user as any)._id = null;
            expect(entity.isNew(user)).toBe(true);
        });

        it("should return true when _id is undefined", () => {
            const entity = new BasicPersistentEntity<User>(User);
            const user = new User("John");
            (user as any)._id = undefined;
            expect(entity.isNew(user)).toBe(true);
        });
    });

    describe("getIdentifierAccessor", () => {
        it("should return accessor that gets _id value", () => {
            const entity = new BasicPersistentEntity<User>(User);
            const user = new User("John", "user-123");
            const accessor = entity.getIdentifierAccessor(user);

            expect(accessor.getIdentifier()).toBe("user-123");
        });

        it("should return null when _id is not set", () => {
            const entity = new BasicPersistentEntity<User>(User);
            const user = new User("John");
            const accessor = entity.getIdentifierAccessor(user);

            expect(accessor.getIdentifier()).toBeNull();
        });
    });

    describe("getPropertyAccessor", () => {
        it("should access property by name string", () => {
            const entity = new BasicPersistentEntity<User>(User);
            const user = new User("John", "123");
            const accessor = entity.getPropertyAccessor(user);

            expect(accessor.getProperty("name")).toBe("John");
            expect(accessor.getProperty("_id")).toBe("123");
        });

        it("should return null for non-existent property", () => {
            const entity = new BasicPersistentEntity<User>(User);
            const user = new User("John");
            const accessor = entity.getPropertyAccessor(user);

            expect(accessor.getProperty("nonExistent")).toBeNull();
        });

        it("should handle nested null values", () => {
            const entity = new BasicPersistentEntity<any>(Object);
            const obj = { a: { b: null } };
            const accessor = entity.getPropertyAccessor(obj);

            expect(accessor.getProperty("a")).toEqual({ b: null });
        });
    });

    describe("getType", () => {
        it("should return the entity class constructor", () => {
            const entity = new BasicPersistentEntity<User>(User);
            expect(entity.getType()).toBe(User);
        });

        it("should throw error when type not configured", () => {
            const entity = new BasicPersistentEntity<User>();
            expect(() => entity.getType()).toThrow("Entity type not configured");
        });
    });
});
