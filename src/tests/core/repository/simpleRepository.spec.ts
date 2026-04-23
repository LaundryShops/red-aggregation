import type { Collection, Document } from "mongodb";
import { PageRequest } from "../../../domain/pageRequest";
import { Sort } from "../../../domain/sort";
import { Direction } from "../../../domain/order";
import { SimpleMongoRepository } from "../../../core/repository/simpleRepository";
import type { MongoEntityInformation } from "../../../core/support/mongoEntityInformation";

function createCursor<T>(docs: T[]) {
    let skipN = 0;
    let limitN: number | null = null;
    const cursor = {
        sort: jest.fn().mockImplementation(() => cursor),
        skip: jest.fn().mockImplementation((n: number) => {
            skipN = n;
            return cursor;
        }),
        limit: jest.fn().mockImplementation((n: number) => {
            limitN = n;
            return cursor;
        }),
        toArray: jest.fn(async () => {
            const sliced = docs.slice(skipN, limitN == null ? undefined : skipN + limitN);
            return sliced;
        }),
    };
    return cursor;
}

function createCollectionMock(initial: Document[] = []) {
    let docs = [...initial];
    const cursor = createCursor<Document>(docs);
    return {
        find: jest.fn(() => cursor),
        countDocuments: jest.fn(async () => docs.length),
        deleteMany: jest.fn(async () => ({ acknowledged: true } as any)),
        deleteOne: jest.fn(async () => ({ acknowledged: true } as any)),
        __cursor: cursor,
        __setDocs: (next: Document[]) => {
            docs = [...next];
            cursor.toArray = jest.fn(async () => docs);
        },
    } as unknown as Collection<Document> & { __cursor: any; __setDocs: (d: Document[]) => void };
}

describe("SimpleMongoRepository", () => {
    class User {
        constructor(public _id: string, public name: string) {}
    }

    const metadata: MongoEntityInformation<User, string> = {
        isNew: (e) => e._id == null,
        getId: (e) => e._id,
        getEntityType: () => User as any,
        getRequiredId: (e) => e._id,
        getCollectionName: () => "users",
        getIdAttribute: () => "_id",
        isVersioned: () => false,
        getVersion: () => null,
        hasCollation: () => false,
        getCollation: () => null,
    };

    it("findAll() returns all docs", async () => {
        const col = createCollectionMock([{ _id: "1", name: "A" }]);
        const ops: any = {
            getCollection: () => col,
        };
        const repo = new SimpleMongoRepository(metadata, ops);

        const res = await repo.findAll();
        expect(res).toEqual([{ _id: "1", name: "A" }]);
        expect(col.find).toHaveBeenCalledWith({});
    });

    it("findAll(sort) applies mongodb sort mapping", async () => {
        const col = createCollectionMock([{ _id: "1", name: "B" }]);
        const ops: any = { getCollection: () => col };
        const repo = new SimpleMongoRepository(metadata, ops);

        const sort = Sort.by(Direction.DESC, "name");
        await repo.findAll(sort);

        expect(col.__cursor.sort).toHaveBeenCalledWith({ name: -1 });
    });

    it("findAll(pageable) builds PageImpl with total and applies skip/limit", async () => {
        const col = createCollectionMock([
            { _id: "1", name: "A" },
            { _id: "2", name: "B" },
            { _id: "3", name: "C" },
        ]);
        const ops: any = { getCollection: () => col };
        const repo = new SimpleMongoRepository(metadata, ops);

        const pageable = PageRequest.of(1, 2, Sort.by("name")); // offset=2, size=2
        const page = await repo.findAll(pageable);

        expect(page.getTotalElements()).toBe(3);
        expect(col.__cursor.skip).toHaveBeenCalledWith(pageable.getOffset());
        expect(col.__cursor.limit).toHaveBeenCalledWith(pageable.getPageSize());
    });

    it("existsById delegates to count(filter)", async () => {
        const col = createCollectionMock();
        const ops: any = {
            getCollection: () => col,
            count: jest.fn(async () => 1),
        };
        const repo = new SimpleMongoRepository(metadata, ops);

        expect(await repo.existsById("1")).toBe(true);
        expect(ops.count).toHaveBeenCalledWith({ _id: "1" }, expect.anything(), "users");
    });

    it("deleteAll() calls deleteMany({})", async () => {
        const col = createCollectionMock();
        const ops: any = { getCollection: () => col };
        const repo = new SimpleMongoRepository(metadata, ops);

        await repo.deleteAll();
        expect(col.deleteMany).toHaveBeenCalledWith({});
    });
});

