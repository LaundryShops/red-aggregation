import "reflect-metadata";
import type { Collection, Db, Document } from "mongodb";
import { ObjectId } from "mongodb";
import { MongoTemplate } from "../../../core/mongo";
import { Document as DocumentDecorator } from "../../../core/mapping/document";
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
});

