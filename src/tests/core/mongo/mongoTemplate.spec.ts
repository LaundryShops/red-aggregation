import "reflect-metadata";
import type { Collection, Db, Document } from "mongodb";
import { ObjectId } from "mongodb";
import { MongoTemplate } from "../../../core/mongo";
import { Document as DocumentDecorator } from "../../../core/mapping/document";
import { Id } from "../../../core/mapping/id";
import { String as StringField } from "../../../core/mapping/types/string";
import { ClauseDefinition } from "../../../query/standardDefinition";

function createCursor<T>(docs: T[]) {
    const cursor = {
        sort: jest.fn().mockImplementation(() => cursor),
        skip: jest.fn().mockImplementation(() => cursor),
        limit: jest.fn().mockImplementation(() => cursor),
        toArray: jest.fn(async () => docs),
    };
    return cursor;
}

function createCollectionMock() {
    const cursor = createCursor<Document>([]);
    return {
        insertOne: jest.fn(async () => ({ insertedId: new ObjectId("64b7f9e2a21f6a9e5b000001") })),
        insertMany: jest.fn(async () => ({ insertedCount: 0 })),
        replaceOne: jest.fn(async () => ({ acknowledged: true })),
        findOne: jest.fn(async () => null),
        find: jest.fn(() => cursor),
        countDocuments: jest.fn(async () => 0),
        updateOne: jest.fn(async () => ({ acknowledged: true } as any)),
        updateMany: jest.fn(async () => ({ acknowledged: true } as any)),
        deleteOne: jest.fn(async () => ({ acknowledged: true } as any)),
        deleteMany: jest.fn(async () => ({ acknowledged: true } as any)),
        drop: jest.fn(async () => true),
        __cursor: cursor,
    } as unknown as Collection<Document> & { __cursor: any };
}

function createDbMock(col: ReturnType<typeof createCollectionMock>) {
    return {
        command: jest.fn(async (cmd: Document) => ({ ok: 1, cmd })),
        collection: jest.fn(() => col),
        listCollections: jest.fn(() => ({
            toArray: jest.fn(async () => []),
        })),
    } as unknown as Db;
}

class TestClause extends ClauseDefinition {
    constructor(private readonly doc: Document) {
        super();
    }
    getCriteriaObject(): Document {
        return this.doc;
    }
    getKey(): string | null {
        return null;
    }
}

describe("MongoTemplate", () => {
    it("derives collection name from @Document metadata", () => {
        @DocumentDecorator({ collection: "users" })
        class User {}

        const col = createCollectionMock();
        const db = createDbMock(col);
        const template = new MongoTemplate(db);

        expect(template.getCollectionName(User as any)).toBe("users");
    });

    it("falls back to defaultCollectionName when no @Document", () => {
        class UserProfile {}

        const col = createCollectionMock();
        const db = createDbMock(col);
        const template = new MongoTemplate(db);

        expect(template.getCollectionName(UserProfile as any)).toBe("user_profile");
    });

    it("executeCommand parses json string and calls db.command", async () => {
        const col = createCollectionMock();
        const db = createDbMock(col);
        const template = new MongoTemplate(db);

        const result = await template.executeCommand('{ "ping": 1 }');
        expect(db.command).toHaveBeenCalledWith({ ping: 1 }, {});
        expect(result.ok).toBe(1);
    });

    it("collectionExists checks listCollections by name", async () => {
        const col = createCollectionMock();
        const db = createDbMock(col) as any;
        db.listCollections = jest.fn(() => ({
            toArray: jest.fn(async () => [{ name: "users" }]),
        }));
        const template = new MongoTemplate(db);

        expect(await template.collectionExists("users")).toBe(true);
        expect(db.listCollections).toHaveBeenCalledWith({ name: "users" }, { nameOnly: true });
    });

    it("insert assigns insertedId to _id for object entities", async () => {
        const col = createCollectionMock();
        const db = createDbMock(col);
        const template = new MongoTemplate(db);

        const entity: any = { name: "A" };
        const saved = await template.insert(entity, "users");

        expect(saved._id).toBeDefined();
        expect(col.insertOne).toHaveBeenCalled();
    });

    it("save uses replaceOne with upsert when _id exists", async () => {
        const col = createCollectionMock();
        const db = createDbMock(col);
        const template = new MongoTemplate(db);

        const entity: any = { _id: "x", name: "A" };
        await template.save(entity, "users");

        expect(col.replaceOne).toHaveBeenCalledWith({ _id: "x" }, expect.any(Object), { upsert: true });
    });

    it("findOne accepts ClauseDefinition and forwards converted filter", async () => {
        const col = createCollectionMock() as any;
        col.findOne = jest.fn(async () => ({ _id: 1, a: 1 }));
        const db = createDbMock(col);
        const template = new MongoTemplate(db);

        class User {}
        const clause = new TestClause({ a: 1 });
        const res = await template.findOne(clause, User as any, "users");

        expect(col.findOne).toHaveBeenCalledWith({ a: 1 });
        expect(res).toEqual({ _id: 1, a: 1 });
    });

    it("remove(entity) deletes by _id", async () => {
        const col = createCollectionMock() as any;
        const db = createDbMock(col);
        const template = new MongoTemplate(db);

        const entity: any = { _id: "x" };
        await template.remove(entity, "users");

        expect(col.deleteOne).toHaveBeenCalledWith({ _id: "x" });
    });

    describe("write path — defaults, validation, stripUnknownFields", () => {
        it("fills in a missing field's default before insertOne", async () => {
            @DocumentDecorator({ collection: "users" })
            class User {
                @Id() _id!: ObjectId;
                @StringField({ default: "anon" }) name!: string;
            }

            const col = createCollectionMock();
            const db = createDbMock(col);
            const template = new MongoTemplate(db);

            await template.insert(new User(), "users");

            expect(col.insertOne).toHaveBeenCalledWith(expect.objectContaining({ name: "anon" }));
        });

        it("throws before any Mongo call when a field fails validation", async () => {
            @DocumentDecorator({ collection: "users" })
            class User {
                @Id() _id!: ObjectId;
                @StringField() name!: string;
            }

            const col = createCollectionMock();
            const db = createDbMock(col);
            const template = new MongoTemplate(db);

            const entity = new User();
            (entity as unknown as Record<string, unknown>).name = 42;

            await expect(template.insert(entity, "users")).rejects.toThrow(/Validation failed/);
            expect(col.insertOne).not.toHaveBeenCalled();
        });

        it("strips a field not in the whitelist when stripUnknownFields is true", async () => {
            @DocumentDecorator({ collection: "users", stripUnknownFields: true })
            class User {
                @Id() _id!: ObjectId;
                @StringField() name!: string;
            }

            const col = createCollectionMock();
            const db = createDbMock(col);
            const template = new MongoTemplate(db);

            const entity = new User() as unknown as Record<string, unknown>;
            entity.name = "Alice";
            entity.extra = "sneaky";

            await template.insert(entity, "users");

            const sentDoc = (col.insertOne as jest.Mock).mock.calls[0][0];
            expect(sentDoc).toEqual({ name: "Alice" });
        });

        it("keeps an undeclared field when stripUnknownFields is false or unset", async () => {
            @DocumentDecorator({ collection: "users" })
            class User {
                @Id() _id!: ObjectId;
                @StringField() name!: string;
            }

            const col = createCollectionMock();
            const db = createDbMock(col);
            const template = new MongoTemplate(db);

            const entity = new User() as unknown as Record<string, unknown>;
            entity.name = "Alice";
            entity.extra = "sneaky";

            await template.insert(entity, "users");

            const sentDoc = (col.insertOne as jest.Mock).mock.calls[0][0];
            expect(sentDoc).toEqual({ name: "Alice", extra: "sneaky" });
        });
    });

    describe("read path — defaults only, no validate, no strip", () => {
        it("fills in a missing field's default when reading via findById", async () => {
            @DocumentDecorator({ collection: "users" })
            class User {
                @Id() _id!: ObjectId;
                @StringField({ default: "anon" }) name!: string;
            }

            const col = createCollectionMock() as any;
            col.findOne = jest.fn(async () => ({ _id: "1" })); // legacy doc missing "name"
            const db = createDbMock(col);
            const template = new MongoTemplate(db);

            const found = await template.findById("1", User, "users");

            expect(found).toEqual({ _id: "1", name: "anon" });
        });

        it("fills in a missing field's default when reading via findOne", async () => {
            @DocumentDecorator({ collection: "users" })
            class User {
                @Id() _id!: ObjectId;
                @StringField({ default: "anon" }) name!: string;
            }

            const col = createCollectionMock() as any;
            col.findOne = jest.fn(async () => ({ _id: "1" }));
            const db = createDbMock(col);
            const template = new MongoTemplate(db);

            const found = await template.findOne({ _id: "1" } as any, User, "users");

            expect(found).toEqual({ _id: "1", name: "anon" });
        });

        it("fills in defaults for every document returned by find", async () => {
            @DocumentDecorator({ collection: "users" })
            class User {
                @Id() _id!: ObjectId;
                @StringField({ default: "anon" }) name!: string;
            }

            const col = createCollectionMock() as any;
            col.__cursor.toArray = jest.fn(async () => [{ _id: "1" }, { _id: "2", name: "Bob" }]);
            const db = createDbMock(col);
            const template = new MongoTemplate(db);

            const found = await template.find({}, User, "users");

            expect(found).toEqual([
                { _id: "1", name: "anon" },
                { _id: "2", name: "Bob" },
            ]);
        });

        it("does not strip an undeclared field on read, even when stripUnknownFields is true", async () => {
            @DocumentDecorator({ collection: "users", stripUnknownFields: true })
            class User {
                @Id() _id!: ObjectId;
                @StringField() name!: string;
            }

            const col = createCollectionMock() as any;
            col.findOne = jest.fn(async () => ({ _id: "1", name: "Alice", legacyField: "still here" }));
            const db = createDbMock(col);
            const template = new MongoTemplate(db);

            const found = await template.findById("1", User, "users");

            expect(found).toEqual({ _id: "1", name: "Alice", legacyField: "still here" });
        });

        it("does not validate on read — an invalid value is returned as-is instead of throwing", async () => {
            @DocumentDecorator({ collection: "users" })
            class User {
                @Id() _id!: ObjectId;
                @StringField() name!: string;
            }

            const col = createCollectionMock() as any;
            col.findOne = jest.fn(async () => ({ _id: "1", name: 42 })); // legacy: wrong type
            const db = createDbMock(col);
            const template = new MongoTemplate(db);

            await expect(template.findById("1", User, "users")).resolves.toEqual({ _id: "1", name: 42 });
        });
    });
});

