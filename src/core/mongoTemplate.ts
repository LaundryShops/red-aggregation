import type {
    AggregationCursor,
    Collection,
    Db,
    DeleteResult,
    Document,
    Filter,
    ReadPreference,
    UpdateResult,
} from "mongodb";
import { ClauseDefinition } from "../query/standardDefinition";
import { defaultCollectionName, getDocumentMetadata } from "./mapping/document";
import { criteriaToFilter } from "./mongo/mongoCriteria";
import type { MongoOperations, MongoList } from "./mongo/mongoOperations";
import type { EntityClass } from "./support/entityMetadata";
import type { MongoCriteria, MongoUpdateDefinition } from "./mongo/mongoQuery";

function entityToDocument<T>(entity: T): Document {
    if (entity !== null && typeof entity === "object") {
        return { ...(entity as object) } as Document;
    }
    throw new Error("Entity must be a non-null object for MongoDB persistence");
}

function documentToEntity<T>(doc: Document | null): T | null {
    if (doc == null) {
        return null;
    }
    return doc as T;
}

export class MongoTemplate implements MongoOperations {
    constructor(private readonly db: Db) {}
    
    aggregate(pipeline: Document[], collectionName: string): AggregationCursor<Document> {
        return this.db.collection(collectionName).aggregate(pipeline, {
            allowDiskUse: true,
        })
    }

    getCollectionName(entityClass: EntityClass): string {
        const meta = getDocumentMetadata(entityClass as abstract new (...args: never[]) => unknown);
        if (meta?.collection) {
            return meta.collection;
        }
        return defaultCollectionName(entityClass.name);
    }

    executeCommand(jsonCommand: string): Promise<Document>;
    executeCommand(command: Document): Promise<Document>;
    executeCommand(command: Document, readPreference: ReadPreference | null): Promise<Document>;
    async executeCommand(
        jsonOrCommand: string | Document,
        readPreference?: ReadPreference | null,
    ): Promise<Document> {
        const command =
            typeof jsonOrCommand === "string" ? (JSON.parse(jsonOrCommand) as Document) : jsonOrCommand;
        const options =
            readPreference === undefined
                ? {}
                : { readPreference: readPreference === null ? undefined : readPreference };
        return (await this.db.command(command, options)) as Document;
    }

    getCollection(collectionName: string): Collection<Document> {
        return this.db.collection<Document>(collectionName);
    }

    collectionExists(entityClass: EntityClass): Promise<boolean>;
    collectionExists(collectionName: string): Promise<boolean>;
    async collectionExists(entityClassOrName: EntityClass | string): Promise<boolean> {
        const name =
            typeof entityClassOrName === "string"
                ? entityClassOrName
                : this.getCollectionName(entityClassOrName);
        const found = await this.db.listCollections({ name }, { nameOnly: true }).toArray();
        return found.length > 0;
    }

    dropCollection(entityClass: EntityClass): Promise<void>;
    dropCollection(collectionName: string): Promise<void>;
    async dropCollection(entityClassOrName: EntityClass | string): Promise<void> {
        const name =
            typeof entityClassOrName === "string"
                ? entityClassOrName
                : this.getCollectionName(entityClassOrName);
        await this.db.collection(name).drop();
    }

    insert<T>(objectToSave: T): Promise<T>;
    insert<T>(objectToSave: T, collectionName: string): Promise<T>;
    insert<T>(batchToSave: readonly T[], entityClass: EntityClass): Promise<MongoList<T>>;
    insert<T>(batchToSave: readonly T[], collectionName: string): Promise<MongoList<T>>;
    async insert<T>(
        first: T | readonly T[],
        second?: string | EntityClass,
    ): Promise<T | MongoList<T>> {
        if (Array.isArray(first)) {
            const batch = first;
            if (batch.length === 0) {
                return batch;
            }
            const collectionName =
                typeof second === "string" ? second : this.getCollectionName(second as EntityClass);
            const col = this.db.collection<Document>(collectionName);
            const docs = batch.map((row) => entityToDocument(row));
            await col.insertMany([...docs]);
            return batch;
        }
        const objectToSave = first as T;
        const collectionName =
            typeof second === "string"
                ? second
                : this.getCollectionName((objectToSave as object).constructor as EntityClass);
        const col = this.db.collection<Document>(collectionName);
        const doc = entityToDocument(objectToSave);
        const result = await col.insertOne(doc);
        if (result.insertedId != null && objectToSave && typeof objectToSave === "object") {
            (objectToSave as Record<string, unknown>)._id = result.insertedId;
        }
        return objectToSave;
    }

    async insertAll<T>(objectsToSave: readonly T[]): Promise<MongoList<T>> {
        if (objectsToSave.length === 0) {
            return objectsToSave;
        }
        const ctor = (objectsToSave[0] as object).constructor as EntityClass;
        return this.insert(objectsToSave, ctor) as Promise<MongoList<T>>;
    }

    async save<T>(objectToSave: T, collectionName?: string): Promise<T> {
        const name =
            collectionName ??
            this.getCollectionName((objectToSave as object).constructor as EntityClass);
        const col = this.db.collection<Document>(name);
        const doc = entityToDocument(objectToSave);
        const id = doc._id;
        if (id != null) {
            await col.replaceOne({ _id: id } as Filter<Document>, doc, { upsert: true });
        } else {
            const result = await col.insertOne(doc);
            if (result.insertedId != null && objectToSave && typeof objectToSave === "object") {
                (objectToSave as Record<string, unknown>)._id = result.insertedId;
            }
        }
        return objectToSave;
    }

    findById<T>(id: unknown, entityClass: EntityClass<T>): Promise<T | null>;
    findById<T>(id: unknown, entityClass: EntityClass<T>, collectionName: string): Promise<T | null>;
    async findById<T>(
        id: unknown,
        entityClass: EntityClass<T>,
        collectionName?: string,
    ): Promise<T | null> {
        const name = collectionName ?? this.getCollectionName(entityClass);
        const col = this.db.collection<Document>(name);
        const doc = await col.findOne({ _id: id } as Filter<Document>);
        return documentToEntity<T>(doc);
    }

    findOne<T>(query: MongoCriteria, entityClass: EntityClass<T>): Promise<T | null>;
    findOne<T>(query: MongoCriteria, entityClass: EntityClass<T>, collectionName: string): Promise<T | null>;
    async findOne<T>(
        query: MongoCriteria,
        entityClass: EntityClass<T>,
        collectionName?: string,
    ): Promise<T | null> {
        const name = collectionName ?? this.getCollectionName(entityClass);
        const col = this.db.collection<Document>(name);
        const filter = criteriaToFilter(query);
        const doc = await col.findOne(filter);
        return documentToEntity<T>(doc);
    }

    find<T>(query: MongoCriteria, entityClass: EntityClass<T>): Promise<MongoList<T>>;
    find<T>(query: MongoCriteria, entityClass: EntityClass<T>, collectionName: string): Promise<MongoList<T>>;
    async find<T>(
        query: MongoCriteria,
        entityClass: EntityClass<T>,
        collectionName?: string,
    ): Promise<MongoList<T>> {
        const name = collectionName ?? this.getCollectionName(entityClass);
        const col = this.db.collection<Document>(name);
        const filter = criteriaToFilter(query);
        const list = await col.find(filter).toArray();
        return list as T[];
    }

    findAll<T>(entityClass: EntityClass<T>): Promise<MongoList<T>>;
    findAll<T>(entityClass: EntityClass<T>, collectionName: string): Promise<MongoList<T>>;
    async findAll<T>(entityClass: EntityClass<T>, collectionName?: string): Promise<MongoList<T>> {
        const name = collectionName ?? this.getCollectionName(entityClass);
        const col = this.db.collection<Document>(name);
        const list = await col.find({}).toArray();
        return list as T[];
    }

    count(query: MongoCriteria, entityClass: EntityClass): Promise<number>;
    count(query: MongoCriteria, collectionName: string): Promise<number>;
    count(query: MongoCriteria, entityClass: EntityClass | null, collectionName: string): Promise<number>;
    async count(
        query: MongoCriteria,
        entityClassOrName: EntityClass | string | null,
        collectionName?: string,
    ): Promise<number> {
        let name: string;
        if (typeof entityClassOrName === "string") {
            name = entityClassOrName;
        } else if (collectionName != null) {
            name = collectionName;
        } else if (entityClassOrName != null) {
            name = this.getCollectionName(entityClassOrName);
        } else {
            throw new Error("count: collection name or entity class is required");
        }
        const col = this.db.collection<Document>(name);
        const filter = criteriaToFilter(query);
        return col.countDocuments(filter);
    }

    upsert(
        query: MongoCriteria,
        update: MongoUpdateDefinition,
        entityClass: EntityClass,
    ): Promise<UpdateResult>;
    upsert(
        query: MongoCriteria,
        update: MongoUpdateDefinition,
        collectionName: string,
    ): Promise<UpdateResult>;
    upsert(
        query: MongoCriteria,
        update: MongoUpdateDefinition,
        entityClass: EntityClass,
        collectionName: string,
    ): Promise<UpdateResult>;
    async upsert(
        query: MongoCriteria,
        update: MongoUpdateDefinition,
        third?: EntityClass | string,
        fourth?: string,
    ): Promise<UpdateResult> {
        const name = this.resolveCollectionFromOverload(third, fourth);
        const col = this.db.collection<Document>(name);
        return col.updateOne(criteriaToFilter(query), update, { upsert: true });
    }

    updateFirst(
        query: MongoCriteria,
        update: MongoUpdateDefinition,
        entityClass: EntityClass,
    ): Promise<UpdateResult>;
    updateFirst(
        query: MongoCriteria,
        update: MongoUpdateDefinition,
        collectionName: string,
    ): Promise<UpdateResult>;
    updateFirst(
        query: MongoCriteria,
        update: MongoUpdateDefinition,
        entityClass: EntityClass,
        collectionName: string,
    ): Promise<UpdateResult>;
    async updateFirst(
        query: MongoCriteria,
        update: MongoUpdateDefinition,
        third?: EntityClass | string,
        fourth?: string,
    ): Promise<UpdateResult> {
        const name = this.resolveCollectionFromOverload(third, fourth);
        const col = this.db.collection<Document>(name);
        return col.updateOne(criteriaToFilter(query), update);
    }

    updateMulti(
        query: MongoCriteria,
        update: MongoUpdateDefinition,
        entityClass: EntityClass,
    ): Promise<UpdateResult>;
    updateMulti(
        query: MongoCriteria,
        update: MongoUpdateDefinition,
        collectionName: string,
    ): Promise<UpdateResult>;
    updateMulti(
        query: MongoCriteria,
        update: MongoUpdateDefinition,
        entityClass: EntityClass,
        collectionName: string,
    ): Promise<UpdateResult>;
    async updateMulti(
        query: MongoCriteria,
        update: MongoUpdateDefinition,
        third?: EntityClass | string,
        fourth?: string,
    ): Promise<UpdateResult> {
        const name = this.resolveCollectionFromOverload(third, fourth);
        const col = this.db.collection<Document>(name);
        return col.updateMany(criteriaToFilter(query), update);
    }

    private resolveCollectionFromOverload(
        third?: EntityClass | string,
        fourth?: string,
    ): string {
        if (fourth !== undefined) {
            return fourth;
        }
        if (typeof third === "string") {
            return third;
        }
        if (third != null) {
            return this.getCollectionName(third);
        }
        throw new Error("MongoTemplate: entity class or collection name is required");
    }

    remove(object: unknown): Promise<DeleteResult>;
    remove(object: unknown, collectionName: string): Promise<DeleteResult>;
    remove(query: MongoCriteria, entityClass: EntityClass): Promise<DeleteResult>;
    remove(query: MongoCriteria, entityClass: EntityClass | null, collectionName: string): Promise<DeleteResult>;
    remove(query: MongoCriteria, collectionName: string): Promise<DeleteResult>;
    async remove(
        first: unknown | MongoCriteria,
        second?: string | EntityClass | null,
        third?: string,
    ): Promise<DeleteResult> {
        if (isEntityDeleteById(first) && (second === undefined || typeof second === "string")) {
            const object = first as Record<string, unknown>;
            const name =
                typeof second === "string"
                    ? second
                    : this.getCollectionName(object.constructor as EntityClass);
            const col = this.db.collection<Document>(name);
            const id = object._id;
            return col.deleteOne({ _id: id } as Filter<Document>);
        }
        const query = first as MongoCriteria;
        if (typeof second === "string" && third === undefined) {
            const col = this.db.collection<Document>(second);
            return col.deleteMany(criteriaToFilter(query));
        }
        const collectionName =
            third ?? (typeof second === "string" ? second : undefined);
        if (collectionName != null) {
            const col = this.db.collection<Document>(collectionName);
            return col.deleteMany(criteriaToFilter(query));
        }
        if (typeof second === "function") {
            const col = this.db.collection<Document>(this.getCollectionName(second));
            return col.deleteMany(criteriaToFilter(query));
        }
        throw new Error("remove(query): entityClass and/or collectionName is required");
    }
}

/**
 * Xóa theo document (deleteOne theo {@code _id}), không dùng nhánh filter {@link MongoCriteria}.
 */
function isEntityDeleteById(value: unknown): boolean {
    if (value == null || typeof value !== "object" || value instanceof ClauseDefinition) {
        return false;
    }
    if (!Object.prototype.hasOwnProperty.call(value, "_id")) {
        return false;
    }
    const id = (value as { _id: unknown })._id;
    if (id !== null && typeof id === "object" && !Array.isArray(id) && !(id instanceof Date)) {
        const keys = Object.keys(id as object);
        if (keys.some((k) => k.startsWith("$"))) {
            return false;
        }
    }
    return true;
}
