# Quick start: MongoTemplate + RepositoryFactory

Core repository layer cho MongoDB theo hướng *entity-driven mapping*:

- Entity biết metadata của chính nó qua `@Document`, `@Id`.
- Repository biết cách thao tác qua `SimpleMongoRepository` hoặc custom repository class.
- `RepositoryFactory` hỗ trợ cả custom repo class và fallback repo theo entity class.

## Thành phần chính

- `MongoTemplate` (`src/core/mongoTemplate.ts`): triển khai `MongoOperations`.
- `MappingContext` (`src/core/mapping/mappingContext.ts`): build + cache `MongoPersistentEntity`.
- `@Document` (`src/core/mapping/document.ts`): khai báo collection.
- `@Id` (`src/core/mapping/id.ts`): khai báo id field.
- `@Repository` (`src/core/repository/repositoryDecorator.ts`): gắn entity metadata cho repository class.
- `MongoRepositoryFactory` (alias của `RepositoryFactory`): tạo repository instance và cache.

## Ví dụ khởi tạo nhanh (custom repository class)

```ts
import type { Db } from "mongodb";
import { ObjectId } from "mongodb";
import {
  Document,
  Id,
  Repository,
  MongoTemplate,
  MappingContext,
  MongoRepositoryFactory,
  SimpleMongoRepository,
} from "red-aggregate";

@Document({ collection: "users" })
class User {
  @Id() _id: ObjectId;
  name: string;
}

@Repository(User)
class UserRepository extends SimpleMongoRepository<User, ObjectId> {}

export function bootstrap(db: Db) {
  const ops = new MongoTemplate(db);
  const factory = new MongoRepositoryFactory(ops);

  const userRepo = factory.getRepository(UserRepository);
  return { userRepo };
}
```

## Ví dụ khởi tạo đầy đủ (custom method + override collection)

```ts
import type { Db } from "mongodb";
import { ObjectId } from "mongodb";
import {
  Document,
  Id,
  Repository,
  MongoTemplate,
  MappingContext,
  MongoRepositoryFactory,
  SimpleMongoRepository,
} from "red-aggregate";

@Document({ collection: "users" })
class User {
  @Id() _id: ObjectId;
  email: string;
}

@Repository(User, { collection: "users_archive" })
class UserArchiveRepository extends SimpleMongoRepository<User, ObjectId> {
  async existsByEmail(email: string): Promise<boolean> {
    const docs = await this.mongoOperations.find(
      { email },
      User,
      this.metadata.getCollectionName(),
    );
    return docs.length > 0;
  }
}

export function bootstrap(db: Db) {
  const ops = new MongoTemplate(db);
  const factory = new MongoRepositoryFactory(ops, new MappingContext());

  const archiveRepo = factory.getRepository(UserArchiveRepository);
  return { archiveRepo };
}
```

## Fallback mode (không custom repository class)

Bạn có thể gọi trực tiếp theo entity class để lấy `SimpleMongoRepository`:

```ts
import type { Db } from "mongodb";
import { Document, Id, MongoTemplate, MappingContext, MongoRepositoryFactory } from "red-aggregate";

@Document({ collection: "users" })
class User {
  @Id() _id!: string;
  name!: string;
}

export function bootstrap(db: Db) {
  const factory = new MongoRepositoryFactory(new MongoTemplate(db), new MappingContext());

  const userRepo = factory.getRepository(User);
  const userRepoV2 = factory.getRepository(User, { collection: "users_v2" });

  return { userRepo, userRepoV2 };
}
```

## Ghi chú

- `factory.getRepository(UserRepository)` cache theo **repository class identity**.
- `factory.getRepository(User, { collection })` cache theo **entity + collection override**.
- Chưa wire `@Version` trong flow quick start hiện tại.

### Collection precedence

Khi cùng lúc khai báo collection ở nhiều nơi, thứ tự ưu tiên là:

1. `@Repository(Entity, { collection: "..." })`
2. `@Document({ collection: "..." })`
3. Default name từ class entity (`defaultCollectionName`)

Ví dụ:

```ts
@Document({ collection: "users" })
class User {
  @Id() _id!: string;
}

@Repository(User, { collection: "users_archive" })
class UserArchiveRepository extends SimpleMongoRepository<User, string> {}
```

Khi gọi `factory.getRepository(UserArchiveRepository)`, repository này sẽ thao tác trên collection `users_archive`.

