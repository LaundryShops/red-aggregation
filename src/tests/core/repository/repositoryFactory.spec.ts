import "reflect-metadata";
import { ObjectId } from "mongodb";
import { Document } from "../../../core/mapping/document";
import { Id } from "../../../core/mapping/id";
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
});
