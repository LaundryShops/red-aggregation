import type { EntityClass } from "../support/entityMetadata";
import type { MongoOperations } from "../mongo";
import type { MongoEntityInformation } from "../support/mongoEntityInformation";
import { MappingContext } from "../mapping/mappingContext";
import { MappingMongoEntityInformation } from "../mapping/mappingMongoEntityInformation";
import { SimpleMongoRepository } from "./simpleRepository";
import type { MongoRepository, SoftDeleteMongoRepository } from "./mongoRepository";
import { getRepositoryMetadata } from "./repositoryDecorator";

type RepoKey = string;
type CustomRepositoryClass = new (...args: any[]) => MongoRepository<any, any>;
type CustomRepositoryConstructor<C extends CustomRepositoryClass> = new (
    metadata: MongoEntityInformation<any, any>,
    mongoOperations: MongoOperations,
) => InstanceType<C>;

function keyFor(type: Function, collectionOverride?: string): RepoKey {
    return `${type.name}::${collectionOverride ?? ""}`;
}

export class RepositoryFactory {
    private readonly entityRepos = new Map<RepoKey, MongoRepository<any, any>>();
    /**
     * Cache custom repositories by class identity (Function reference), not by `.name`.
     *
     * Why:
     * - class names are not guaranteed unique across modules/packages.
     * - build tools/minifiers can rewrite class names.
     * - Function identity is stable and collision-free in-process.
     */
    private readonly customRepos = new Map<Function, MongoRepository<any, any>>();

    constructor(
        private readonly mongoOperations: MongoOperations,
        private readonly mappingContext: MappingContext = new MappingContext(),
    ) { }

    getRepository<C extends CustomRepositoryClass>(repositoryClass: C,): InstanceType<C>;
    getRepository<T, ID = any>(
        entityClass: EntityClass<T>,
        options?: { collection?: string },
    ): MongoRepository<T, ID>;
    getRepository<T, ID = any>(
        entityOrRepositoryClass: EntityClass<T> | CustomRepositoryClass,
        options?: { collection?: string },
    ): MongoRepository<T, ID> {
        const customMetadata = getRepositoryMetadata<T>(entityOrRepositoryClass as unknown as Function);
        if (customMetadata != null) {
            const repositoryClass = entityOrRepositoryClass as unknown as CustomRepositoryClass;
            const repositoryCtor =
                repositoryClass as unknown as CustomRepositoryConstructor<CustomRepositoryClass>;
            const cached = this.customRepos.get(repositoryClass as unknown as Function);
            if (cached) {
                return cached as MongoRepository<T, ID>;
            }
            const persistentEntity = this.mappingContext.getPersistentEntity(customMetadata.entityClass);
            const entityInfo =
                customMetadata.collection != null
                    ? new MappingMongoEntityInformation<T, ID>(persistentEntity, customMetadata.collection)
                    : new MappingMongoEntityInformation<T, ID>(persistentEntity);
            const customRepository = new repositoryCtor(
                entityInfo as unknown as MongoEntityInformation<any, any>,
                this.mongoOperations,
            );
            this.customRepos.set(repositoryClass as unknown as Function, customRepository);
            return customRepository;
        }

        const entityClass = entityOrRepositoryClass as EntityClass<T>;
        const collectionOverride = options?.collection;
        const k = keyFor(entityClass as unknown as Function, collectionOverride);
        const cached = this.entityRepos.get(k);
        if (cached) {
            return cached as MongoRepository<T, ID>;
        }
        const persistentEntity = this.mappingContext.getPersistentEntity(entityClass);
        const entityInfo =
            collectionOverride != null
                ? new MappingMongoEntityInformation<T, ID>(persistentEntity, collectionOverride)
                : new MappingMongoEntityInformation<T, ID>(persistentEntity);
        const repo = new SimpleMongoRepository<T, ID>(entityInfo, this.mongoOperations);
        this.entityRepos.set(k, repo as MongoRepository<any, any>);
        return repo;
    }

    /**
     * Như {@link getRepository} nhưng trả về type rộng hơn (`SoftDeleteMongoRepository`) —
     * throw ngay nếu `entityClass` chưa dùng `@SoftDelete()`, trước khi chạm tới Mongo.
     */
    getSoftDeleteRepository<T, ID = any>(
        entityClass: EntityClass<T>,
        options?: { collection?: string },
    ): SoftDeleteMongoRepository<T, ID> {
        const persistentEntity = this.mappingContext.getPersistentEntity(entityClass);
        if (!persistentEntity.isSoftDeleteEnabled()) {
            throw new Error(
                `Entity "${entityClass.name}" is not @SoftDelete()-enabled; cannot obtain a SoftDeleteMongoRepository for it.`,
            );
        }
        return this.getRepository<T, ID>(entityClass, options) as SoftDeleteMongoRepository<T, ID>;
    }

    clear(): void {
        this.entityRepos.clear();
        this.customRepos.clear();
    }
}
