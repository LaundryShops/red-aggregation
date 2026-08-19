import type { Document, Filter } from "mongodb";
import { ObjectId } from "mongodb";
import { PageImpl } from "../../domain/pageImpl";
import type { Page } from "../../domain/page";
import type { Pageable } from "../../domain/pageable";
import { Sort } from "../../domain/sort";
import { Optional } from "../../utils/optional";
import { Assert } from "../../utils";
import type { MongoEntityInformation } from "../support/mongoEntityInformation";
import type { MongoOperations } from "../mongo";
import type { MongoCriteria } from "../mongo/mongoQuery";
import { criteriaToFilter } from "../mongo/mongoCriteria";
import { buildKeysetFilter, reverseSort } from "../mongo/keysetCriteria";
import { excludeSoftDeleted, onlyDeleted, softDeleteMatchStage } from "../mongo/softDeleteCriteria";
import type { EntityClass } from "../support/entityMetadata";
import type { List } from "./list";
import type { SoftDeleteMongoRepository } from "./mongoRepository";
import { Aggregation } from "../../aggregation";
import { AggregationResults } from "../../aggregationResults";
import type { KeysetPageable } from "../../domain/keysetPage/keysetPageable";
import { DefaultKeySetPage } from "../../domain/keysetPage/defaultKeySetPage";
import { KeysetArrayList } from "../../domain/keysetPage/keysetPageImpl";
import type { PagedList } from "../../domain/keysetPage/pagedList";
import type { Serializable } from "../../domain/keysetPage/types";

function sortToMongoSort(sort: Sort): Record<string, 1 | -1> {
    const out: Record<string, 1 | -1> = {};
    for (const order of sort.get()) {
        out[order.getProperty()] = order.isAscending() ? 1 : -1;
    }
    return out;
}

export class SimpleMongoRepository<T, ID = ObjectId> implements SoftDeleteMongoRepository<T, ID> {
    constructor(
        protected readonly metadata: MongoEntityInformation<T, ID>,
        protected readonly mongoOperations: MongoOperations,
    ) {
        Assert.notNull(metadata, "MongoEntityInformation must not be null");
        Assert.notNull(mongoOperations, "MongoOperations must not be null");
    }

    protected get entityClass(): EntityClass<T> {
        return this.metadata.getEntityType() as EntityClass<T>;
    }

    protected get collectionName(): string {
        return this.metadata.getCollectionName();
    }

    protected idFilter(id: ID): Filter<Document> {
        const attr = this.metadata.getIdAttribute();
        return { [attr]: id } as Filter<Document>;
    }

    /**
     * Helper cho custom finder method trong subclass — khỏi phải tự truyền lại entity class/collection name.
     */
    protected findByCriteria(criteria: MongoCriteria): Promise<List<T>> {
        return this.mongoOperations.find(this.excludeSoftDeletedCriteria(criteria), this.entityClass, this.collectionName);
    }

    protected async findOneByCriteria(criteria: MongoCriteria): Promise<Optional<T>> {
        const found = await this.mongoOperations.findOne(
            this.excludeSoftDeletedCriteria(criteria),
            this.entityClass,
            this.collectionName,
        );
        return new Optional<T>(found);
    }

    protected countByCriteria(criteria: MongoCriteria): Promise<number> {
        return this.mongoOperations.count(this.excludeSoftDeletedCriteria(criteria), this.entityClass, this.collectionName);
    }

    private excludeSoftDeletedCriteria(criteria: MongoCriteria): Filter<Document> {
        return excludeSoftDeleted(criteriaToFilter(criteria), this.metadata);
    }

    async doAggregate<S extends Document>(aggregate: Aggregation, options?: { includeSoftDeleted?: boolean }) {
        const pipeline = aggregate.toPipeline();
        if (!options?.includeSoftDeleted) {
            const matchStage = softDeleteMatchStage(this.metadata);
            if (matchStage != null) {
                pipeline.unshift(matchStage);
            }
        }
        const cursor = this.mongoOperations.aggregate(pipeline, this.collectionName);
        const stream = await cursor.batchSize(1000).stream({ transform: (doc) => doc })
        const results: S[] = [];

        for await (const doc of stream as AsyncIterable<S>) {
            results.push(doc);
        }

        return new AggregationResults<S>(results);
    }

    async saveAll<S extends T>(entities: Iterable<S>): Promise<List<S>> {
        const list = [...entities];
        if (list.length === 0) {
            return [];
        }
        return this.mongoOperations.insert(list, this.collectionName) as Promise<List<S>>;
    }

    findAll(): Promise<List<T>>;
    findAll(sort: Sort): Promise<List<T>>;
    findAll(pageable: Pageable): Promise<Page<T>>;
    async findAll(sortOrPageable?: Sort | Pageable): Promise<List<T> | Page<T>> {
        const col = this.mongoOperations.getCollection(this.collectionName);
        const filter = excludeSoftDeleted({}, this.metadata);
        if (sortOrPageable === undefined) {
            const docs = await col.find(filter).toArray();
            return docs as T[];
        }
        if (this.isPageable(sortOrPageable)) {
            return this.findAllPaged(sortOrPageable);
        }
        const sort = sortOrPageable as Sort;
        const cursor = sort.isSorted() ? col.find(filter).sort(sortToMongoSort(sort)) : col.find(filter);
        const docs = await cursor.toArray();
        return docs as T[];
    }

    private isPageable(value: Sort | Pageable): value is Pageable {
        return "isPaged" in value && typeof (value as Pageable).isPaged === "function";
    }

    private async findAllPaged(pageable: Pageable): Promise<Page<T>> {
        const col = this.mongoOperations.getCollection(this.collectionName);
        const filter = excludeSoftDeleted({}, this.metadata);
        const total = await col.countDocuments(filter);
        let cursor = col.find(filter);
        const sort = pageable.getSort();
        if (sort.isSorted()) {
            cursor = cursor.sort(sortToMongoSort(sort));
        }
        if (pageable.isPaged()) {
            cursor = cursor.skip(pageable.getOffset()).limit(pageable.getPageSize());
        }
        const content = (await cursor.toArray()) as T[];
        return new PageImpl(content, pageable, total);
    }

    async findAllByKeyset(criteria: MongoCriteria, keysetPageable: KeysetPageable): Promise<PagedList<T>> {
        const sort = keysetPageable.getSort();
        Assert.isTrue(sort.isSorted(), "KeysetPageable must have a sort to build a keyset filter");

        const baseFilter = excludeSoftDeleted(criteriaToFilter(criteria), this.metadata);
        const anchorPage = keysetPageable.getKeysetPage();
        const direction = keysetPageable.getDirection();

        const filter: Filter<Document> = anchorPage
            ? {
                $and: [
                    baseFilter,
                    buildKeysetFilter(sort, direction === "NEXT" ? anchorPage.getHighest() : anchorPage.getLowest(), direction),
                ],
            }
            : baseFilter;

        const col = this.mongoOperations.getCollection(this.collectionName);
        const total = await col.countDocuments(baseFilter);

        const queryMongoSort = sortToMongoSort(direction === "PREVIOUS" ? reverseSort(sort) : sort);
        const docs = (await col.find(filter).sort(queryMongoSort).limit(keysetPageable.getPageSize()).toArray()) as T[];
        if (direction === "PREVIOUS") {
            docs.reverse();
        }

        const firstResult = keysetPageable.getPageNumber() * keysetPageable.getPageSize();
        const maxResults = keysetPageable.getPageSize();

        if (docs.length === 0) {
            const keysetPage = anchorPage ?? new DefaultKeySetPage(firstResult, maxResults, [] as Serializable, [] as Serializable, []);
            return new KeysetArrayList<T>([], keysetPage, total, firstResult, maxResults);
        }

        const tuples: Serializable[] = docs.map(
            (doc) => sort.get().map((order) => (doc as unknown as Document)[order.getProperty()]) as Serializable
        );
        const keysetPage = new DefaultKeySetPage(firstResult, maxResults, tuples[0], tuples[tuples.length - 1], tuples);

        return new KeysetArrayList<T>(docs, keysetPage, total, firstResult, maxResults);
    }

    async findAllById(ids: Iterable<ID>): Promise<List<T>> {
        const idList = [...ids];
        if (idList.length === 0) {
            return [];
        }
        const attr = this.metadata.getIdAttribute();
        const filter = excludeSoftDeleted({ [attr]: { $in: idList } } as Filter<Document>, this.metadata);
        const docs = await this.mongoOperations.find(filter, this.entityClass, this.collectionName);
        return docs;
    }

    async save<S extends T>(entity: S): Promise<S> {
        if (!this.metadata.isNew(entity)) {
            return this.mongoOperations.insert(entity, this.collectionName);
        }
        return this.mongoOperations.save(entity, this.collectionName);
    }

    async findById(id: ID): Promise<Optional<T>> {
        if (this.metadata.isSoftDeleteEnabled()) {
            const found = await this.mongoOperations.findOne(
                excludeSoftDeleted(this.idFilter(id), this.metadata),
                this.entityClass,
                this.collectionName,
            );
            return new Optional<T>(found);
        }
        const found = await this.mongoOperations.findById(id, this.entityClass, this.collectionName);
        return new Optional<T>(found);
    }

    async existsById(id: ID): Promise<boolean> {
        const n = await this.mongoOperations.count(
            excludeSoftDeleted(this.idFilter(id), this.metadata),
            this.entityClass,
            this.collectionName,
        );
        return n > 0;
    }

    async count(): Promise<number> {
        return this.mongoOperations.count(excludeSoftDeleted({}, this.metadata), this.entityClass, this.collectionName);
    }

    deleteById(id: ID): Promise<void>;
    deleteById(id: ID, deletedBy: unknown): Promise<void>;
    async deleteById(id: ID, deletedBy?: unknown): Promise<void> {
        if (this.metadata.isSoftDeleteEnabled()) {
            await this.softDeleteByFilter(this.idFilter(id), deletedBy);
            return;
        }
        await this.mongoOperations.getCollection(this.collectionName).deleteOne(this.idFilter(id));
    }

    delete(entity: T): Promise<void>;
    delete(entity: T, deletedBy: unknown): Promise<void>;
    async delete(entity: T, deletedBy?: unknown): Promise<void> {
        if (this.metadata.isSoftDeleteEnabled()) {
            const id = this.metadata.getId(entity) as ID;
            await this.softDeleteByFilter(this.idFilter(id), deletedBy);
            return;
        }
        await this.mongoOperations.remove(entity, this.collectionName);
    }

    async restore(id: ID): Promise<void> {
        Assert.isTrue(this.metadata.isSoftDeleteEnabled(), "restore() requires the entity to use @SoftDelete()");
        const deletedAtAttr = this.metadata.getDeletedAtAttribute() as string;
        const deletedByAttr = this.metadata.getDeletedByAttribute() as string;
        await this.mongoOperations.getCollection(this.collectionName).updateOne(this.idFilter(id), {
            $set: { [deletedAtAttr]: null, [deletedByAttr]: null },
        });
    }

    async hardDeleteById(id: ID): Promise<void> {
        await this.mongoOperations.getCollection(this.collectionName).deleteOne(this.idFilter(id));
    }

    async findAllIncludingSoftDeleted(): Promise<List<T>> {
        const docs = await this.mongoOperations.getCollection(this.collectionName).find({}).toArray();
        return docs as T[];
    }

    async findByIdIncludingSoftDeleted(id: ID): Promise<Optional<T>> {
        const found = await this.mongoOperations.findById(id, this.entityClass, this.collectionName);
        return new Optional<T>(found);
    }

    async findAllSoftDeleted(): Promise<List<T>> {
        Assert.isTrue(this.metadata.isSoftDeleteEnabled(), "findAllSoftDeleted() requires the entity to use @SoftDelete()");
        const filter = onlyDeleted({}, this.metadata);
        const docs = await this.mongoOperations.getCollection(this.collectionName).find(filter).toArray();
        return docs as T[];
    }

    private async softDeleteByFilter(filter: Filter<Document>, deletedBy: unknown): Promise<void> {
        await this.mongoOperations.getCollection(this.collectionName).updateOne(filter, this.softDeleteSet(deletedBy));
    }

    private async softDeleteManyByFilter(filter: Filter<Document>, deletedBy: unknown): Promise<void> {
        await this.mongoOperations.getCollection(this.collectionName).updateMany(filter, this.softDeleteSet(deletedBy));
    }

    private softDeleteSet(deletedBy: unknown) {
        const deletedAtAttr = this.metadata.getDeletedAtAttribute() as string;
        const deletedByAttr = this.metadata.getDeletedByAttribute() as string;
        return { $set: { [deletedAtAttr]: new Date(), [deletedByAttr]: deletedBy ?? null } };
    }

    deleteAllById(ids: Iterable<ID>): Promise<void>;
    deleteAllById(ids: Iterable<ID>, deletedBy: unknown): Promise<void>;
    async deleteAllById(ids: Iterable<ID>, deletedBy?: unknown): Promise<void> {
        const idList = [...ids];
        if (idList.length === 0) {
            return;
        }
        const attr = this.metadata.getIdAttribute();
        const filter = { [attr]: { $in: idList } } as Filter<Document>;
        if (this.metadata.isSoftDeleteEnabled()) {
            await this.softDeleteManyByFilter(filter, deletedBy);
            return;
        }
        await this.mongoOperations.getCollection(this.collectionName).deleteMany(filter);
    }

    deleteAll(entities: Iterable<T>): Promise<void>;
    deleteAll(entities: Iterable<T>, deletedBy: unknown): Promise<void>;
    deleteAll(entities: undefined, deletedBy: unknown): Promise<void>;
    deleteAll(): Promise<void>;
    async deleteAll(entities?: Iterable<T>, deletedBy?: unknown): Promise<void> {
        if (entities === undefined) {
            if (this.metadata.isSoftDeleteEnabled()) {
                await this.softDeleteManyByFilter({}, deletedBy);
                return;
            }
            await this.mongoOperations.getCollection(this.collectionName).deleteMany({});
            return;
        }
        for (const entity of entities) {
            await this.delete(entity, deletedBy);
        }
    }

    insert<S extends T>(entity: S): Promise<S>;
    insert<S extends T>(entities: Iterable<S>): Promise<List<S>>;
    async insert<S extends T>(first: S | Iterable<S>): Promise<S | List<S>> {
        if (first !== null && typeof first === "object" && Symbol.iterator in first) {
            const batch = [...(first as Iterable<S>)];
            if (batch.length === 0) {
                return [];
            }
            return this.mongoOperations.insert(batch, this.collectionName) as Promise<List<S>>;
        }
        return this.mongoOperations.insert(first as S, this.collectionName);
    }
}
