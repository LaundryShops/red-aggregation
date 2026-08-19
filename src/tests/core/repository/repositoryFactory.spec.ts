import "reflect-metadata";
import { ObjectId } from "mongodb";
import { Document } from "../../../core/mapping/document";
import { Id } from "../../../core/mapping/id";
import { SoftDelete } from "../../../core/mapping/softDelete";
import { Repository } from "../../../core/repository/repositoryDecorator";
import { RepositoryFactory } from "../../../core/repository/repositoryFactory";
import { SimpleMongoRepository } from "../../../core/repository/simpleRepository";

describe("RepositoryFactory", () => {
    const mongoOperations: any = {
        getCollection: jest.fn(),
    };

    @Document({ collection: "users" })
    class User {
        @Id() _id!: ObjectId;
        email!: string;
    }

    @Repository(User)
    class UserRepository extends SimpleMongoRepository<User, ObjectId> {
        getResolvedCollection(): string {
            return this.metadata.getCollectionName();
        }
    }

    @Repository(User, { collection: "users_archive" })
    class UserArchiveRepository extends SimpleMongoRepository<User, ObjectId> {
        getResolvedCollection(): string {
            return this.metadata.getCollectionName();
        }
    }

    @Document({ collection: "soft_users" })
    @SoftDelete()
    class SoftDeleteUser {
        @Id() _id!: ObjectId;
        email!: string;
    }

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns SimpleMongoRepository for entity class fallback", () => {
        const factory = new RepositoryFactory(mongoOperations);
        const repo = factory.getRepository(User);

        expect(repo).toBeInstanceOf(SimpleMongoRepository);
    });

    it("returns decorated custom repository for repository class", () => {
        const factory = new RepositoryFactory(mongoOperations);
        const repo = factory.getRepository(UserRepository);

        expect(repo).toBeInstanceOf(UserRepository);
        expect(repo.getResolvedCollection()).toBe("users");
    });

    it("supports repository-level collection override from decorator options", () => {
        const factory = new RepositoryFactory(mongoOperations);
        const repo = factory.getRepository(UserArchiveRepository);

        expect(repo).toBeInstanceOf(UserArchiveRepository);
        expect(repo.getResolvedCollection()).toBe("users_archive");
    });

    it("caches custom repository by repository class", () => {
        const factory = new RepositoryFactory(mongoOperations);
        const a = factory.getRepository(UserRepository);
        const b = factory.getRepository(UserRepository);

        expect(a).toBe(b);
    });

    it("keeps entity fallback cache key separated by collection override", () => {
        const factory = new RepositoryFactory(mongoOperations);
        const baseRepo = factory.getRepository(User);
        const overrideRepo = factory.getRepository(User, { collection: "users_tmp" });
        const overrideRepoAgain = factory.getRepository(User, { collection: "users_tmp" });

        expect(baseRepo).not.toBe(overrideRepo);
        expect(overrideRepo).toBe(overrideRepoAgain);
    });

    describe("getSoftDeleteRepository", () => {
        it("returns a repository exposing the soft-delete-only methods for a @SoftDelete() entity", () => {
            const factory = new RepositoryFactory(mongoOperations);
            const repo = factory.getSoftDeleteRepository(SoftDeleteUser);

            expect(typeof repo.restore).toBe("function");
            expect(typeof repo.hardDeleteById).toBe("function");
            expect(typeof repo.findAllIncludingSoftDeleted).toBe("function");
            expect(typeof repo.findByIdIncludingSoftDeleted).toBe("function");
            expect(typeof repo.findAllSoftDeleted).toBe("function");
        });

        it("throws synchronously, before any Mongo call, when the entity is not @SoftDelete()-enabled", () => {
            const factory = new RepositoryFactory(mongoOperations);

            expect(() => factory.getSoftDeleteRepository(User)).toThrow(/User/);
            expect(mongoOperations.getCollection).not.toHaveBeenCalled();
        });

        it("returns the same cached instance as getRepository() for the same entity/collection", () => {
            const factory = new RepositoryFactory(mongoOperations);
            const viaGetRepository = factory.getRepository(SoftDeleteUser);
            const viaGetSoftDeleteRepository = factory.getSoftDeleteRepository(SoftDeleteUser);

            expect(viaGetSoftDeleteRepository).toBe(viaGetRepository);
        });

        it("does not type-check calling a soft-delete-only method through the plain getRepository()", () => {
            const factory = new RepositoryFactory(mongoOperations);
            const repo = factory.getRepository(User);

            // @ts-expect-error restore() is not part of MongoRepository — only SoftDeleteMongoRepository
            repo.restore;
        });
    });
});
