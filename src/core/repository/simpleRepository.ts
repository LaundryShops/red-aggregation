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
import type { EntityClass } from "../support/entityMetadata";
import type { List } from "./list";
import type { MongoRepository } from "./mongoRepository";
import { Aggregation } from "../../aggregation";
import { AggregationResults } from "../../aggregationResults";

function sortToMongoSort(sort: Sort): Record<string, 1 | -1> {
    const out: Record<string, 1 | -1> = {};
    for (const order of sort.get()) {
        out[order.getProperty()] = order.isAscending() ? 1 : -1;
    }
    return out;
}

export class SimpleMongoRepository<T, ID = ObjectId> implements MongoRepository<T, ID> {
    constructor(
        private readonly metadata: MongoEntityInformation<T, ID>,
        private readonly mongoOperations: MongoOperations,
    ) {
        Assert.notNull(metadata, "MongoEntityInformation must not be null");
        Assert.notNull(mongoOperations, "MongoOperations must not be null");
    }

    private get entityClass(): EntityClass<T> {
        return this.metadata.getEntityType() as EntityClass<T>;
    }

    private get collectionName(): string {
        return this.metadata.getCollectionName();
    }

    private idFilter(id: ID): Filter<Document> {
        const attr = this.metadata.getIdAttribute();
        return { [attr]: id } as Filter<Document>;
    }
    async doAggregate<S extends Document>(aggregate: Aggregation) {
        const cursor = this.mongoOperations.aggregate(aggregate.toPipeline(), this.collectionName);
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
        if (sortOrPageable === undefined) {
            const docs = await col.find({}).toArray();
            return docs as T[];
        }
        if (this.isPageable(sortOrPageable)) {
            return this.findAllPaged(sortOrPageable);
        }
        const sort = sortOrPageable as Sort;
        const cursor = sort.isSorted() ? col.find({}).sort(sortToMongoSort(sort)) : col.find({});
        const docs = await cursor.toArray();
        return docs as T[];
    }

    private isPageable(value: Sort | Pageable): value is Pageable {
        return "isPaged" in value && typeof (value as Pageable).isPaged === "function";
    }

    private async findAllPaged(pageable: Pageable): Promise<Page<T>> {
        const col = this.mongoOperations.getCollection(this.collectionName);
        const total = await col.countDocuments({});
        let cursor = col.find({});
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

    async findAllById(ids: Iterable<ID>): Promise<List<T>> {
        const idList = [...ids];
        if (idList.length === 0) {
            return [];
        }
        const attr = this.metadata.getIdAttribute();
        const filter = { [attr]: { $in: idList } } as Filter<Document>;
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
        const found = await this.mongoOperations.findById(id, this.entityClass, this.collectionName);
        return new Optional<T>(found);
    }

    async existsById(id: ID): Promise<boolean> {
        const n = await this.mongoOperations.count(this.idFilter(id), this.entityClass, this.collectionName);
        return n > 0;
    }

    async count(): Promise<number> {
        return this.mongoOperations.count({}, this.entityClass, this.collectionName);
    }

    async deleteById(id: ID): Promise<void> {
        await this.mongoOperations.getCollection(this.collectionName).deleteOne(this.idFilter(id));
    }

    async delete(entity: T): Promise<void> {
        await this.mongoOperations.remove(entity, this.collectionName);
    }

    async deleteAllById(ids: Iterable<ID>): Promise<void> {
        const idList = [...ids];
        if (idList.length === 0) {
            return;
        }
        const attr = this.metadata.getIdAttribute();
        await this.mongoOperations.getCollection(this.collectionName).deleteMany({
            [attr]: { $in: idList },
        } as Filter<Document>);
    }

    deleteAll(entities: Iterable<T>): Promise<void>;
    deleteAll(): Promise<void>;
    async deleteAll(entities?: Iterable<T>): Promise<void> {
        const col = this.mongoOperations.getCollection(this.collectionName);
        if (entities === undefined) {
            await col.deleteMany({});
            return;
        }
        for (const entity of entities) {
            await this.delete(entity);
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
