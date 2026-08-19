import type {
    AggregationCursor,
    Collection,
    DeleteResult,
    Document,
    ReadPreference,
    UpdateResult,
} from "mongodb";
import type { EntityClass } from "../support/entityMetadata";
import type { FluentMongoOperations } from "./fluentMongoOperations";
import type { MongoCriteria, MongoUpdateDefinition } from "./mongoQuery";

export type MongoList<T> = readonly T[];

export interface MongoOperations extends FluentMongoOperations {
    getCollectionName(entityClass: EntityClass): string;

    executeCommand(jsonCommand: string): Promise<Document>;

    executeCommand(command: Document): Promise<Document>;

    executeCommand(command: Document, readPreference: ReadPreference | null): Promise<Document>;

    getCollection(collectionName: string): Collection<Document>;

    collectionExists(entityClass: EntityClass): Promise<boolean>;

    collectionExists(collectionName: string): Promise<boolean>;

    dropCollection(entityClass: EntityClass): Promise<void>;

    dropCollection(collectionName: string): Promise<void>;

    /**
     * Tạo các index khai báo qua `@Document({ indexes: [...] })` cho entity này (no-op nếu không khai báo gì).
     * Gọi thủ công lúc bootstrap — không tự động chạy ngầm ở đâu khác.
     */
    ensureIndexes(entityClass: EntityClass): Promise<string[]>;

    insert<T>(objectToSave: T): Promise<T>;

    insert<T>(objectToSave: T, collectionName: string): Promise<T>;

    insert<T>(batchToSave: readonly T[], entityClass: EntityClass): Promise<MongoList<T>>;

    insert<T>(batchToSave: readonly T[], collectionName: string): Promise<MongoList<T>>;

    insertAll<T>(objectsToSave: readonly T[]): Promise<MongoList<T>>;

    save<T>(objectToSave: T): Promise<T>;

    save<T>(objectToSave: T, collectionName: string): Promise<T>;

    findById<T>(id: unknown, entityClass: EntityClass<T>): Promise<T | null>;

    findById<T>(id: unknown, entityClass: EntityClass<T>, collectionName: string): Promise<T | null>;

    findOne<T>(query: MongoCriteria, entityClass: EntityClass<T>): Promise<T | null>;

    findOne<T>(query: MongoCriteria, entityClass: EntityClass<T>, collectionName: string): Promise<T | null>;

    find<T>(query: MongoCriteria, entityClass: EntityClass<T>): Promise<MongoList<T>>;

    find<T>(query: MongoCriteria, entityClass: EntityClass<T>, collectionName: string): Promise<MongoList<T>>;

    findAll<T>(entityClass: EntityClass<T>): Promise<MongoList<T>>;

    findAll<T>(entityClass: EntityClass<T>, collectionName: string): Promise<MongoList<T>>;

    count(query: MongoCriteria, entityClass: EntityClass): Promise<number>;

    count(query: MongoCriteria, collectionName: string): Promise<number>;

    count(query: MongoCriteria, entityClass: EntityClass | null, collectionName: string): Promise<number>;

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

    remove(object: unknown): Promise<DeleteResult>;

    remove(object: unknown, collectionName: string): Promise<DeleteResult>;

    remove(query: MongoCriteria, entityClass: EntityClass): Promise<DeleteResult>;

    remove(query: MongoCriteria, entityClass: EntityClass | null, collectionName: string): Promise<DeleteResult>;

    remove(query: MongoCriteria, collectionName: string): Promise<DeleteResult>;

    aggregate(pipeline: Document[], collection: string): AggregationCursor<Document>
}
