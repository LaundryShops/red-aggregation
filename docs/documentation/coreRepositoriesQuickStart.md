# Quick start: MongoTemplate + RepositoryFactory

Từ phiên bản này, thư viện bổ sung một **core layer** giúp bạn thao tác MongoDB theo mô hình *mapping + repository* (repository pattern) một cách tối giản và “type-safe” trong TypeScript.

## Tính năng mới / cập nhật

- **`MongoTemplate`** (`src/core/mongoTemplate.ts`): triển khai `MongoOperations` để thao tác CRUD cơ bản + `aggregate(...)`.
- **`MappingContext`** (`src/core/mapping/mappingContext.ts`): build + cache `MongoPersistentEntity` theo entity class.
- **`@Document` + metadata** (`src/core/mapping/document.ts`): khai báo collection name (và metadata khác) cho entity.
- **`MongoRepositoryFactory`** (alias của `RepositoryFactory`, `src/core/repository/repositoryFactory.ts`):
  - Sinh repository cho entity class dựa trên `MongoTemplate` + `MappingContext`
  - Cache repository theo `(EntityClass, collection override)`
  - Trả về repository có đầy đủ method của `SimpleMongoRepository`

## Khởi tạo nhanh

```ts
import type { Db } from "mongodb";
import { MongoTemplate, MappingContext, MongoRepositoryFactory } from "red-aggregate";

// Entity ví dụ
class User {
  constructor(public _id: string, public name: string) {}
}

export function bootstrap(db: Db) {
  const ops = new MongoTemplate(db);
  const mappingContext = new MappingContext();
  const factory = new MongoRepositoryFactory(ops, mappingContext);

  const userRepo = factory.getRepository(User); // đủ method của SimpleMongoRepository

  // hoặc override collection (tuỳ nhu cầu)
  const userRepo2 = factory.getRepository(User, { collection: "users_v2" });

  return { userRepo, userRepo2 };
}
```

## Ghi chú

- **Cache behavior**: `MongoRepositoryFactory` sẽ cache theo key `TypeName::collectionOverride`, nên gọi nhiều lần vẫn trả về cùng instance.
- **Override collection**: phù hợp multi-tenant hoặc khi muốn tách collection theo ngữ cảnh.

