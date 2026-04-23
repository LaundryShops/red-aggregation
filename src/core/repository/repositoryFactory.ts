import type { EntityClass } from "../support/entityMetadata";
import type { MongoOperations } from "../mongo";
import { MappingContext } from "../mapping/mappingContext";
import { MappingMongoEntityInformation } from "../mapping/mappingMongoEntityInformation";
import { SimpleMongoRepository } from "./simpleRepository";
import type { MongoRepository } from "./mongoRepository";
import { ObjectId } from "mongodb";

type RepoKey = string;

function keyFor(type: Function, collectionOverride?: string): RepoKey {
    return `${type.name}::${collectionOverride ?? ""}`;
}

export class RepositoryFactory {
    private readonly repos = new Map<RepoKey, MongoRepository<any, ObjectId>>();

    constructor(
        private readonly mongoOperations: MongoOperations,
        private readonly mappingContext: MappingContext = new MappingContext(),
    ) { }

    getRepository<T, ID = any>(
        entityClass: EntityClass<T>,
        options?: { collection?: string },
    ): MongoRepository<T, ID> {
        const collectionOverride = options?.collection;
        const k = keyFor(entityClass as unknown as Function, collectionOverride);
        const cached = this.repos.get(k);
        if (cached) {
            return cached as MongoRepository<T, ID>;
        }
        const persistentEntity = this.mappingContext.getPersistentEntity(entityClass);
        const entityInfo =
            collectionOverride != null
                ? new MappingMongoEntityInformation<T, ID>(persistentEntity, collectionOverride)
                : new MappingMongoEntityInformation<T, ID>(persistentEntity);
        const repo = new SimpleMongoRepository<T, ID>(entityInfo, this.mongoOperations);
        this.repos.set(k, repo as MongoRepository<any, any>);
        return repo;
    }

    clear(): void {
        this.repos.clear();
    }
}
