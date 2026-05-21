import "reflect-metadata";
import { ObjectId } from "mongodb";
import { Id, buildIdProperty, getIdMetadata } from "../../../core/mapping/id";

describe("@Id decorator", () => {
    it("captures property name and design:type for ObjectId field", () => {
        class User {
            @Id() _id!: ObjectId;
            name!: string;
        }

        const meta = getIdMetadata(User);
        expect(meta).not.toBeNull();
        expect(meta!.name).toBe("_id");
        expect(meta!.type).toBe(ObjectId);
    });

    it("captures custom property name", () => {
        class Account {
            @Id() accountId!: string;
        }

        const meta = getIdMetadata(Account);
        expect(meta!.name).toBe("accountId");
        expect(meta!.type).toBe(String);
    });

    it("returns null when no @Id present", () => {
        class Plain {
            _id!: string;
        }

        expect(getIdMetadata(Plain)).toBeNull();
    });

    it("throws when @Id is declared on two different properties", () => {
        expect(() => {
            class BadEntity {
                @Id() _id!: string;
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                @Id() otherId!: string;
            }
            void BadEntity;
        }).toThrow(/already defined/);
    });

    it("propagates @Id through inheritance via reflect-metadata prototype walk", () => {
        class BaseEntity {
            @Id() _id!: ObjectId;
        }
        class ChildEntity extends BaseEntity {
            name!: string;
        }

        const meta = getIdMetadata(ChildEntity);
        expect(meta).not.toBeNull();
        expect(meta!.name).toBe("_id");
    });
});

describe("buildIdProperty", () => {
    it("returns MongoPersistentProperty when class has @Id", () => {
        class User {
            @Id() _id!: ObjectId;
        }

        const prop = buildIdProperty(User);
        expect(prop).not.toBeNull();
        expect(prop!.getName()).toBe("_id");
        expect(prop!.getType()).toBe(ObjectId);
    });

    it("returns null when class has no @Id", () => {
        class Plain {}
        expect(buildIdProperty(Plain)).toBeNull();
    });
});
