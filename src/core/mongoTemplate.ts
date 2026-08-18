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
import { MappingContext } from "./mapping/mappingContext";
import { applySoftDeleteToIndexes, getSoftDeleteMetadata } from "./mapping/softDelete";
import { criteriaToFilter } from "./mongo/mongoCriteria";
import type { MongoOperations, MongoList } from "./mongo/mongoOperations";
import type { EntityClass } from "./support/entityMetadata";
import type { MongoCriteria, MongoUpdateDefinition } from "./mongo/mongoQuery";

export class MongoTemplate implements MongoOperations {
    constructor(
        private readonly db: Db,
        private readonly mappingContext: MappingContext = new MappingContext(),
    ) {}

    /**
     * Spread entity thành document, rồi áp `applyDefaults` → `validateForWrite` (throw nếu có lỗi,
     * không gửi gì tới Mongo) → `stripUnknownFields` (no-op khi option tắt) — theo đúng thứ tự.
     */
    private entityToDocument<T>(entity: T, entityClass: EntityClass<T>): Document {
        if (entity === null || typeof entity !== "object") {
            throw new Error("Entity must be a non-null object for MongoDB persistence");
        }
        const raw = { ...(entity as object) } as Record<string, unknown>;
        const persistentEntity = this.mappingContext.getPersistentEntity(entityClass);

        persistentEntity.applyDefaults(raw);

        const errors = persistentEntity.validateForWrite(raw);
        if (errors.length > 0) {
            throw new Error(`Validation failed for entity "${entityClass.name}": ${errors.join("; ")}`);
        }

        return persistentEntity.stripUnknownFields(raw) as Document;
    }

    /**
     * Chỉ áp `applyDefaults` — không validate, không strip (đọc dữ liệu legacy không được phép
     * "biến mất" field hay bị throw vì không hợp lệ theo rule mới).
     */
    private documentToEntity<T>(doc: Document | null, entityClass: EntityClass<T>): T | null {
        if (doc == null) {
            return null;
        }
        const persistentEntity = this.mappingContext.getPersistentEntity(entityClass);
        persistentEntity.applyDefaults(doc as Record<string, unknown>);
        return doc as T;
    }

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

    async ensureIndexes(entityClass: EntityClass): Promise<string[]> {
        const meta = getDocumentMetadata(entityClass as abstract new (...args: never[]) => unknown);
        const declaredIndexes = meta?.indexes ?? [];
        if (declaredIndexes.length === 0) {
            return [];
        }
        const softDelete = getSoftDeleteMetadata(entityClass as abstract new (...args: never[]) => unknown);
        const indexes = applySoftDeleteToIndexes(declaredIndexes, softDelete);
        const name = this.getCollectionName(entityClass);
        return this.db.collection(name).createIndexes(indexes);
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
            const docs = batch.map((row) =>
                this.entityToDocument(row, (row as object).constructor as EntityClass),
            );
            await col.insertMany([...docs]);
            return batch;
        }
        const objectToSave = first as T;
        const entityClass = (objectToSave as object).constructor as EntityClass;
        const collectionName = typeof second === "string" ? second : this.getCollectionName(entityClass);
        const col = this.db.collection<Document>(collectionName);
        const doc = this.entityToDocument(objectToSave, entityClass);
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
        const entityClass = (objectToSave as object).constructor as EntityClass;
        const name = collectionName ?? this.getCollectionName(entityClass);
        const col = this.db.collection<Document>(name);
        const doc = this.entityToDocument(objectToSave, entityClass);
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
        return this.documentToEntity<T>(doc, entityClass);
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
        return this.documentToEntity<T>(doc, entityClass);
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
        return list.map((doc) => this.documentToEntity<T>(doc, entityClass)) as T[];
    }

    findAll<T>(entityClass: EntityClass<T>): Promise<MongoList<T>>;
    findAll<T>(entityClass: EntityClass<T>, collectionName: string): Promise<MongoList<T>>;
    async findAll<T>(entityClass: EntityClass<T>, collectionName?: string): Promise<MongoList<T>> {
        const name = collectionName ?? this.getCollectionName(entityClass);
        const col = this.db.collection<Document>(name);
        const list = await col.find({}).toArray();
        return list.map((doc) => this.documentToEntity<T>(doc, entityClass)) as T[];
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
