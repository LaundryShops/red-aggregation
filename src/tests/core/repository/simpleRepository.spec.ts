import type { Collection, Document } from "mongodb";
import { PageRequest } from "../../../domain/pageRequest";
import { Sort } from "../../../domain/sort";
import { Direction } from "../../../domain/order";
import { SimpleMongoRepository } from "../../../core/repository/simpleRepository";
import type { MongoEntityInformation } from "../../../core/support/mongoEntityInformation";
import { KeysetPageRequest } from "../../../domain/keysetPage/keysetPageRequest";
import { DefaultKeySetPage } from "../../../domain/keysetPage/defaultKeySetPage";
import { DefaultKeyset } from "../../../domain/keysetPage/defaultKeySet";
import type { Aggregation } from "../../../aggregation";

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
        updateOne: jest.fn(async () => ({ acknowledged: true } as any)),
        updateMany: jest.fn(async () => ({ acknowledged: true } as any)),
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
        isSoftDeleteEnabled: () => false,
        getDeletedAtAttribute: () => null,
        getDeletedByAttribute: () => null,
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

        it("excludes soft-deleted docs from both the content query and the total count when soft delete is enabled", async () => {
            const softDeleteMetadata: MongoEntityInformation<User, string> = {
                ...metadata,
                isSoftDeleteEnabled: () => true,
                getDeletedAtAttribute: () => "deleted_at",
                getDeletedByAttribute: () => "deleted_by",
            };
            const col = createCollectionMock([{ _id: "1", name: "A" }]);
            const ops: any = { getCollection: () => col };
            const repo = new SimpleMongoRepository(softDeleteMetadata, ops);

            const keysetPageable = KeysetPageRequest.of(2, sort);
            await repo.findAllByKeyset({}, keysetPageable);

            expect(col.countDocuments).toHaveBeenCalledWith({ $and: [{}, { deleted_at: null }] });
            expect(col.find).toHaveBeenCalledWith({ $and: [{}, { deleted_at: null }] });
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

    describe("soft delete — core finds", () => {
        const softDeleteMetadata: MongoEntityInformation<User, string> = {
            ...metadata,
            isSoftDeleteEnabled: () => true,
            getDeletedAtAttribute: () => "deleted_at",
            getDeletedByAttribute: () => "deleted_by",
        };

        it("findAll() excludes soft-deleted docs when soft delete is enabled", async () => {
            const col = createCollectionMock([{ _id: "1", name: "A" }]);
            const ops: any = { getCollection: () => col };
            const repo = new SimpleMongoRepository(softDeleteMetadata, ops);

            await repo.findAll();

            expect(col.find).toHaveBeenCalledWith({ $and: [{}, { deleted_at: null }] });
        });

        it("findAll(sort) excludes soft-deleted docs when soft delete is enabled", async () => {
            const col = createCollectionMock([{ _id: "1", name: "A" }]);
            const ops: any = { getCollection: () => col };
            const repo = new SimpleMongoRepository(softDeleteMetadata, ops);

            await repo.findAll(Sort.by("name"));

            expect(col.find).toHaveBeenCalledWith({ $and: [{}, { deleted_at: null }] });
        });

        it("findAll(pageable) excludes soft-deleted docs from both the count and the page query", async () => {
            const col = createCollectionMock([{ _id: "1", name: "A" }]);
            const ops: any = { getCollection: () => col };
            const repo = new SimpleMongoRepository(softDeleteMetadata, ops);

            await repo.findAll(PageRequest.of(0, 10));

            expect(col.countDocuments).toHaveBeenCalledWith({ $and: [{}, { deleted_at: null }] });
            expect(col.find).toHaveBeenCalledWith({ $and: [{}, { deleted_at: null }] });
        });

        it("findById queries via mongoOperations.findOne with the exclusion merged in when soft delete is enabled", async () => {
            const ops: any = { findOne: jest.fn(async () => null) };
            const repo = new SimpleMongoRepository(softDeleteMetadata, ops);

            await repo.findById("1");

            expect(ops.findOne).toHaveBeenCalledWith({ $and: [{ _id: "1" }, { deleted_at: null }] }, User, "users");
        });

        it("findById still uses mongoOperations.findById when the entity is not soft-delete-enabled", async () => {
            const ops: any = { findById: jest.fn(async () => ({ _id: "1", name: "A" })) };
            const repo = new SimpleMongoRepository(metadata, ops);

            const found = await repo.findById("1");

            expect(ops.findById).toHaveBeenCalledWith("1", User, "users");
            expect(found.orElse(null as unknown as User)).toEqual({ _id: "1", name: "A" });
        });

        it("existsById excludes soft-deleted docs when soft delete is enabled", async () => {
            const ops: any = { count: jest.fn(async () => 0) };
            const repo = new SimpleMongoRepository(softDeleteMetadata, ops);

            expect(await repo.existsById("1")).toBe(false);
            expect(ops.count).toHaveBeenCalledWith({ $and: [{ _id: "1" }, { deleted_at: null }] }, User, "users");
        });

        it("count() excludes soft-deleted docs when soft delete is enabled", async () => {
            const ops: any = { count: jest.fn(async () => 2) };
            const repo = new SimpleMongoRepository(softDeleteMetadata, ops);

            expect(await repo.count()).toBe(2);
            expect(ops.count).toHaveBeenCalledWith({ $and: [{}, { deleted_at: null }] }, User, "users");
        });

        it("count() queries with {} when the entity is not soft-delete-enabled", async () => {
            const ops: any = { count: jest.fn(async () => 3) };
            const repo = new SimpleMongoRepository(metadata, ops);

            expect(await repo.count()).toBe(3);
            expect(ops.count).toHaveBeenCalledWith({}, User, "users");
        });

        it("findAllById excludes soft-deleted docs when soft delete is enabled", async () => {
            const ops: any = { find: jest.fn(async () => []) };
            const repo = new SimpleMongoRepository(softDeleteMetadata, ops);

            await repo.findAllById(["1", "2"]);

            expect(ops.find).toHaveBeenCalledWith(
                { $and: [{ _id: { $in: ["1", "2"] } }, { deleted_at: null }] },
                User,
                "users",
            );
        });
    });

    describe("soft delete — escape hatches", () => {
        const softDeleteMetadata: MongoEntityInformation<User, string> = {
            ...metadata,
            isSoftDeleteEnabled: () => true,
            getDeletedAtAttribute: () => "deleted_at",
            getDeletedByAttribute: () => "deleted_by",
        };

        it("findAllIncludingSoftDeleted() queries with {} even when soft delete is enabled", async () => {
            const col = createCollectionMock([
                { _id: "1", name: "A" },
                { _id: "2", name: "B", deleted_at: new Date() },
            ]);
            const ops: any = { getCollection: () => col };
            const repo = new SimpleMongoRepository(softDeleteMetadata, ops);

            const result = await repo.findAllIncludingSoftDeleted();

            expect(col.find).toHaveBeenCalledWith({});
            expect(result).toHaveLength(2);
        });

        it("findByIdIncludingSoftDeleted() bypasses the exclusion filter when soft delete is enabled", async () => {
            const ops: any = { findById: jest.fn(async () => ({ _id: "1", name: "A", deleted_at: new Date() })) };
            const repo = new SimpleMongoRepository(softDeleteMetadata, ops);

            const found = await repo.findByIdIncludingSoftDeleted("1");

            expect(ops.findById).toHaveBeenCalledWith("1", User, "users");
            expect(found.orElse(null as unknown as User)).toEqual({ _id: "1", name: "A", deleted_at: expect.any(Date) });
        });

        it("findAllSoftDeleted() returns only soft-deleted docs when soft delete is enabled", async () => {
            const col = createCollectionMock([{ _id: "2", name: "B", deleted_at: new Date() }]);
            const ops: any = { getCollection: () => col };
            const repo = new SimpleMongoRepository(softDeleteMetadata, ops);

            await repo.findAllSoftDeleted();

            expect(col.find).toHaveBeenCalledWith({ $and: [{}, { deleted_at: { $ne: null } }] });
        });

        it("findAllSoftDeleted() throws when the entity is not soft-delete-enabled", async () => {
            const col = createCollectionMock();
            const ops: any = { getCollection: () => col };
            const repo = new SimpleMongoRepository(metadata, ops);

            await expect(repo.findAllSoftDeleted()).rejects.toThrow();
        });
    });

    it("deleteAll() calls deleteMany({})", async () => {
        const col = createCollectionMock();
        const ops: any = { getCollection: () => col };
        const repo = new SimpleMongoRepository(metadata, ops);

        await repo.deleteAll();
        expect(col.deleteMany).toHaveBeenCalledWith({});
    });

    describe("soft delete — single-record writes", () => {
        const softDeleteMetadata: MongoEntityInformation<User, string> = {
            ...metadata,
            isSoftDeleteEnabled: () => true,
            getDeletedAtAttribute: () => "deleted_at",
            getDeletedByAttribute: () => "deleted_by",
        };

        it("deleteById soft-deletes via updateOne when soft delete is enabled", async () => {
            const col = createCollectionMock();
            const ops: any = { getCollection: () => col };
            const repo = new SimpleMongoRepository(softDeleteMetadata, ops);

            await repo.deleteById("1", "admin-1");

            expect(col.updateOne).toHaveBeenCalledWith(
                { _id: "1" },
                { $set: { deleted_at: expect.any(Date), deleted_by: "admin-1" } },
            );
            expect(col.deleteOne).not.toHaveBeenCalled();
        });

        it("deleteById stores deleted_by: null when the parameter is omitted", async () => {
            const col = createCollectionMock();
            const ops: any = { getCollection: () => col };
            const repo = new SimpleMongoRepository(softDeleteMetadata, ops);

            await repo.deleteById("1");

            expect(col.updateOne).toHaveBeenCalledWith(
                { _id: "1" },
                { $set: { deleted_at: expect.any(Date), deleted_by: null } },
            );
        });

        it("deleteById still hard-deletes when the entity is not soft-delete-enabled", async () => {
            const col = createCollectionMock();
            const ops: any = { getCollection: () => col };
            const repo = new SimpleMongoRepository(metadata, ops);

            await repo.deleteById("1");

            expect(col.deleteOne).toHaveBeenCalledWith({ _id: "1" });
            expect(col.updateOne).not.toHaveBeenCalled();
        });

        it("delete(entity) soft-deletes using the entity's id when soft delete is enabled", async () => {
            const col = createCollectionMock();
            const ops: any = { getCollection: () => col };
            const repo = new SimpleMongoRepository(softDeleteMetadata, ops);

            await repo.delete(new User("1", "Alice"), "admin-1");

            expect(col.updateOne).toHaveBeenCalledWith(
                { _id: "1" },
                { $set: { deleted_at: expect.any(Date), deleted_by: "admin-1" } },
            );
        });

        it("delete(entity) still calls mongoOperations.remove when the entity is not soft-delete-enabled", async () => {
            const ops: any = { remove: jest.fn(async () => ({ acknowledged: true })) };
            const repo = new SimpleMongoRepository(metadata, ops);

            await repo.delete(new User("1", "Alice"));

            expect(ops.remove).toHaveBeenCalledWith(expect.objectContaining({ _id: "1" }), "users");
        });

        it("restore() clears deleted_at/deleted_by back to null", async () => {
            const col = createCollectionMock();
            const ops: any = { getCollection: () => col };
            const repo = new SimpleMongoRepository(softDeleteMetadata, ops);

            await repo.restore("1");

            expect(col.updateOne).toHaveBeenCalledWith(
                { _id: "1" },
                { $set: { deleted_at: null, deleted_by: null } },
            );
        });

        it("restore() throws for an entity that is not soft-delete-enabled", async () => {
            const col = createCollectionMock();
            const ops: any = { getCollection: () => col };
            const repo = new SimpleMongoRepository(metadata, ops);

            await expect(repo.restore("1")).rejects.toThrow();
        });

        it("hardDeleteById() always physically removes the document, even when soft delete is enabled", async () => {
            const col = createCollectionMock();
            const ops: any = { getCollection: () => col };
            const repo = new SimpleMongoRepository(softDeleteMetadata, ops);

            await repo.hardDeleteById("1");

            expect(col.deleteOne).toHaveBeenCalledWith({ _id: "1" });
            expect(col.updateOne).not.toHaveBeenCalled();
        });
    });

    describe("soft delete — bulk writes", () => {
        const softDeleteMetadata: MongoEntityInformation<User, string> = {
            ...metadata,
            isSoftDeleteEnabled: () => true,
            getDeletedAtAttribute: () => "deleted_at",
            getDeletedByAttribute: () => "deleted_by",
        };

        it("deleteAllById soft-deletes via updateMany when soft delete is enabled", async () => {
            const col = createCollectionMock();
            const ops: any = { getCollection: () => col };
            const repo = new SimpleMongoRepository(softDeleteMetadata, ops);

            await repo.deleteAllById(["1", "2"], "admin-1");

            expect(col.updateMany).toHaveBeenCalledWith(
                { _id: { $in: ["1", "2"] } },
                { $set: { deleted_at: expect.any(Date), deleted_by: "admin-1" } },
            );
            expect(col.deleteMany).not.toHaveBeenCalled();
        });

        it("deleteAllById stores deleted_by: null when the parameter is omitted", async () => {
            const col = createCollectionMock();
            const ops: any = { getCollection: () => col };
            const repo = new SimpleMongoRepository(softDeleteMetadata, ops);

            await repo.deleteAllById(["1", "2"]);

            expect(col.updateMany).toHaveBeenCalledWith(
                { _id: { $in: ["1", "2"] } },
                { $set: { deleted_at: expect.any(Date), deleted_by: null } },
            );
        });

        it("deleteAllById still hard-deletes when the entity is not soft-delete-enabled", async () => {
            const col = createCollectionMock();
            const ops: any = { getCollection: () => col };
            const repo = new SimpleMongoRepository(metadata, ops);

            await repo.deleteAllById(["1", "2"]);

            expect(col.deleteMany).toHaveBeenCalledWith({ _id: { $in: ["1", "2"] } });
            expect(col.updateMany).not.toHaveBeenCalled();
        });

        it("deleteAll() with no entities soft-deletes the whole collection via updateMany({})", async () => {
            const col = createCollectionMock();
            const ops: any = { getCollection: () => col };
            const repo = new SimpleMongoRepository(softDeleteMetadata, ops);

            await repo.deleteAll();

            expect(col.updateMany).toHaveBeenCalledWith({}, { $set: { deleted_at: expect.any(Date), deleted_by: null } });
            expect(col.deleteMany).not.toHaveBeenCalled();
        });

        it("deleteAll(undefined, deletedBy) soft-deletes the whole collection with the given deletedBy", async () => {
            const col = createCollectionMock();
            const ops: any = { getCollection: () => col };
            const repo = new SimpleMongoRepository(softDeleteMetadata, ops);

            await repo.deleteAll(undefined, "admin-1");

            expect(col.updateMany).toHaveBeenCalledWith({}, { $set: { deleted_at: expect.any(Date), deleted_by: "admin-1" } });
        });

        it("deleteAll(entities, deletedBy) soft-deletes each given entity with the given deletedBy", async () => {
            const col = createCollectionMock();
            const ops: any = { getCollection: () => col };
            const repo = new SimpleMongoRepository(softDeleteMetadata, ops);

            await repo.deleteAll([new User("1", "Alice"), new User("2", "Bob")], "admin-1");

            expect(col.updateOne).toHaveBeenCalledWith({ _id: "1" }, { $set: { deleted_at: expect.any(Date), deleted_by: "admin-1" } });
            expect(col.updateOne).toHaveBeenCalledWith({ _id: "2" }, { $set: { deleted_at: expect.any(Date), deleted_by: "admin-1" } });
        });

        it("deleteAll() still hard-deletes the whole collection when the entity is not soft-delete-enabled", async () => {
            const col = createCollectionMock();
            const ops: any = { getCollection: () => col };
            const repo = new SimpleMongoRepository(metadata, ops);

            await repo.deleteAll();

            expect(col.deleteMany).toHaveBeenCalledWith({});
            expect(col.updateMany).not.toHaveBeenCalled();
        });
    });

    describe("doAggregate", () => {
        const softDeleteMetadata: MongoEntityInformation<User, string> = {
            ...metadata,
            isSoftDeleteEnabled: () => true,
            getDeletedAtAttribute: () => "deleted_at",
            getDeletedByAttribute: () => "deleted_by",
        };

        function createAggregateCursorMock(docs: Document[]) {
            const cursor: any = {
                batchSize: jest.fn(() => cursor),
                stream: jest.fn(() => (async function* () {
                    for (const doc of docs) yield doc;
                })()),
            };
            return cursor;
        }

        function fakeAggregation(pipeline: Document[]): Aggregation {
            return { toPipeline: () => pipeline } as unknown as Aggregation;
        }

        it("prepends a $match exclusion stage when soft delete is enabled", async () => {
            const cursor = createAggregateCursorMock([{ _id: "1" }]);
            const ops: any = { aggregate: jest.fn(() => cursor) };
            const repo = new SimpleMongoRepository(softDeleteMetadata, ops);

            await repo.doAggregate(fakeAggregation([{ $match: { active: true } }]));

            expect(ops.aggregate).toHaveBeenCalledWith(
                [{ $match: { deleted_at: null } }, { $match: { active: true } }],
                "users",
            );
        });

        it("sends the pipeline unmodified when includeSoftDeleted is true, even if soft delete is enabled", async () => {
            const cursor = createAggregateCursorMock([]);
            const ops: any = { aggregate: jest.fn(() => cursor) };
            const repo = new SimpleMongoRepository(softDeleteMetadata, ops);

            await repo.doAggregate(fakeAggregation([{ $match: { active: true } }]), { includeSoftDeleted: true });

            expect(ops.aggregate).toHaveBeenCalledWith([{ $match: { active: true } }], "users");
        });

        it("sends the pipeline unmodified when the entity is not soft-delete-enabled", async () => {
            const cursor = createAggregateCursorMock([]);
            const ops: any = { aggregate: jest.fn(() => cursor) };
            const repo = new SimpleMongoRepository(metadata, ops);

            await repo.doAggregate(fakeAggregation([{ $match: { active: true } }]));

            expect(ops.aggregate).toHaveBeenCalledWith([{ $match: { active: true } }], "users");
        });

        it("returns the aggregated documents wrapped in AggregationResults", async () => {
            const cursor = createAggregateCursorMock([{ _id: "1" }, { _id: "2" }]);
            const ops: any = { aggregate: jest.fn(() => cursor) };
            const repo = new SimpleMongoRepository(metadata, ops);

            const result = await repo.doAggregate(fakeAggregation([]));

            expect(result.getMappedResults()).toEqual([{ _id: "1" }, { _id: "2" }]);
        });
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

        describe("soft delete", () => {
            const softDeleteMetadata: MongoEntityInformation<User, string> = {
                ...metadata,
                isSoftDeleteEnabled: () => true,
                getDeletedAtAttribute: () => "deleted_at",
                getDeletedByAttribute: () => "deleted_by",
            };

            it("findByCriteria excludes soft-deleted docs when soft delete is enabled", async () => {
                const ops: any = { find: jest.fn(async () => []) };
                const repo = new UserRepository(softDeleteMetadata, ops);

                await repo.existsByEmail("a@test.com");

                expect(ops.find).toHaveBeenCalledWith(
                    { $and: [{ email: "a@test.com" }, { deleted_at: null }] },
                    User,
                    "users",
                );
            });

            it("findOneByCriteria excludes soft-deleted docs when soft delete is enabled", async () => {
                const ops: any = { findOne: jest.fn(async () => null) };
                const repo = new UserRepository(softDeleteMetadata, ops);

                await repo.findByEmail("a@test.com");

                expect(ops.findOne).toHaveBeenCalledWith(
                    { $and: [{ email: "a@test.com" }, { deleted_at: null }] },
                    User,
                    "users",
                );
            });

            it("countByCriteria excludes soft-deleted docs when soft delete is enabled", async () => {
                const ops: any = { count: jest.fn(async () => 1) };
                const repo = new UserRepository(softDeleteMetadata, ops);

                await repo.countActive();

                expect(ops.count).toHaveBeenCalledWith(
                    { $and: [{ active: true }, { deleted_at: null }] },
                    User,
                    "users",
                );
            });
        });
    });
});

