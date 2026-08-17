import type { Collection, Document } from "mongodb";
import { PageRequest } from "../../../domain/pageRequest";
import { Sort } from "../../../domain/sort";
import { Direction } from "../../../domain/order";
import { SimpleMongoRepository } from "../../../core/repository/simpleRepository";
import type { MongoEntityInformation } from "../../../core/support/mongoEntityInformation";
import { KeysetPageRequest } from "../../../domain/keysetPage/keysetPageRequest";
import { DefaultKeySetPage } from "../../../domain/keysetPage/defaultKeySetPage";
import { DefaultKeyset } from "../../../domain/keysetPage/defaultKeySet";

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

    describe("findAllByKeyset", () => {
        const sort = Sort.by(Direction.ASC, "name");

        it("first page (no anchor) queries with the plain criteria filter and no $or", async () => {
            const col = createCollectionMock([
                { _id: "1", name: "A" },
                { _id: "2", name: "B" },
            ]);
            const ops: any = { getCollection: () => col };
            const repo = new SimpleMongoRepository(metadata, ops);

            const keysetPageable = KeysetPageRequest.of(2, sort);
            const result = await repo.findAllByKeyset({}, keysetPageable);

            expect(col.find).toHaveBeenCalledWith({});
            expect(col.__cursor.sort).toHaveBeenCalledWith({ name: 1 });
            expect(col.__cursor.limit).toHaveBeenCalledWith(2);
            expect(col.__cursor.skip).not.toHaveBeenCalled();
            expect(result.getTotalSize()).toBe(2);
            expect(result.getKeysetPage().getLowest().getTuple()).toEqual(["A"]);
            expect(result.getKeysetPage().getHighest().getTuple()).toEqual(["B"]);
        });

        it("NEXT page merges $and: [criteria, keysetFilter] anchored on the previous highest keyset", async () => {
            const col = createCollectionMock([
                { _id: "3", name: "C" },
                { _id: "4", name: "D" },
            ]);
            const ops: any = { getCollection: () => col };
            const repo = new SimpleMongoRepository(metadata, ops);

            const anchor = new DefaultKeySetPage(0, 2, new DefaultKeyset(["B"]), new DefaultKeyset(["B"]));
            const keysetPageable = KeysetPageRequest.next(KeysetPageRequest.of(2, sort), anchor);
            const criteria = { active: true };

            const result = await repo.findAllByKeyset(criteria, keysetPageable);

            expect(col.find).toHaveBeenCalledWith({
                $and: [criteria, { $or: [{ name: { $gt: "B" } }] }],
            });
            expect(col.__cursor.sort).toHaveBeenCalledWith({ name: 1 });
            expect(result.getKeysetPage().getLowest().getTuple()).toEqual(["C"]);
            expect(result.getKeysetPage().getHighest().getTuple()).toEqual(["D"]);
        });

        it("PREVIOUS page queries with a reversed sort and returns rows back in natural order", async () => {
            // Simulates what a DESC-sorted query would fetch seeking backward from "C": nearest-first (B, A).
            const col = createCollectionMock([
                { _id: "2", name: "B" },
                { _id: "1", name: "A" },
            ]);
            const ops: any = { getCollection: () => col };
            const repo = new SimpleMongoRepository(metadata, ops);

            const anchor = new DefaultKeySetPage(2, 2, new DefaultKeyset(["C"]), new DefaultKeyset(["C"]));
            const keysetPageable = KeysetPageRequest.previous(KeysetPageRequest.next(KeysetPageRequest.of(2, sort), anchor), anchor);

            const result = await repo.findAllByKeyset({}, keysetPageable);

            expect(col.__cursor.sort).toHaveBeenCalledWith({ name: -1 });
            expect([...result]).toEqual([
                { _id: "1", name: "A" },
                { _id: "2", name: "B" },
            ]);
            expect(result.getKeysetPage().getLowest().getTuple()).toEqual(["A"]);
            expect(result.getKeysetPage().getHighest().getTuple()).toEqual(["B"]);
        });
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

    describe("custom finder helpers (protected)", () => {
        class UserRepository extends SimpleMongoRepository<User, string> {
            existsByEmail(email: string): Promise<boolean> {
                return this.findByCriteria({ email }).then((docs) => docs.length > 0);
            }

            findByEmail(email: string) {
                return this.findOneByCriteria({ email });
            }

            countActive(): Promise<number> {
                return this.countByCriteria({ active: true });
            }
        }

        it("findByCriteria delegates to mongoOperations.find with entityClass + collectionName", async () => {
            const ops: any = {
                find: jest.fn(async () => [{ _id: "1", name: "A" }]),
            };
            const repo = new UserRepository(metadata, ops);

            const found = await repo.existsByEmail("a@test.com");

            expect(found).toBe(true);
            expect(ops.find).toHaveBeenCalledWith({ email: "a@test.com" }, User, "users");
        });

        it("findOneByCriteria delegates to mongoOperations.findOne and wraps result in Optional", async () => {
            const ops: any = {
                findOne: jest.fn(async () => ({ _id: "1", name: "A" })),
            };
            const repo = new UserRepository(metadata, ops);

            const result = await repo.findByEmail("a@test.com");

            expect(ops.findOne).toHaveBeenCalledWith({ email: "a@test.com" }, User, "users");
            expect(result.orElse(null as unknown as User)).toEqual({ _id: "1", name: "A" });
        });

        it("countByCriteria delegates to mongoOperations.count with entityClass + collectionName", async () => {
            const ops: any = {
                count: jest.fn(async () => 3),
            };
            const repo = new UserRepository(metadata, ops);

            const result = await repo.countActive();

            expect(result).toBe(3);
            expect(ops.count).toHaveBeenCalledWith({ active: true }, User, "users");
        });
    });
});

