# Quick start: MongoTemplate + RepositoryFactory

Core repository layer cho MongoDB theo hướng *entity-driven mapping*:

- Entity biết metadata của chính nó qua `@Document`, `@Id`.
- Repository biết cách thao tác qua `SimpleMongoRepository` hoặc custom repository class.
- `RepositoryFactory` hỗ trợ cả custom repo class và fallback repo theo entity class.

## Thành phần chính

- `MongoTemplate` (`src/core/mongoTemplate.ts`): triển khai `MongoOperations`.
- `MappingContext` (`src/core/mapping/mappingContext.ts`): build + cache `MongoPersistentEntity`.
- `@Document` (`src/core/mapping/document.ts`): khai báo collection, có thể bật `stripUnknownFields`.
- `@Id` (`src/core/mapping/id.ts`): khai báo id field.
- Typed field decorators (`src/core/mapping/types/`): `@String`/`@Number`/`@Boolean`/`@Date`/`@Enum`/`@Uuid` (v1) + `@ObjectId`/`@Array`/`@Object` (v2) — khai báo type + `default` + validate cho field.
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
    const docs = await this.findByCriteria({ email });
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

## Typed field decorators + `@Document({ stripUnknownFields })`

Field được decorate bởi 1 trong các type dưới đây sẽ:

- Có `default` áp dụng **cả khi lưu lẫn khi đọc** — field đang `undefined` mới được điền; `null` là giá trị cố ý, không bị ghi đè.
- Được **validate khi lưu** — sai kiểu thì `save()`/`insert()` throw ngay, không gửi gì tới Mongo. Không validate khi đọc (dữ liệu legacy có thể không hợp lệ theo rule mới).
- Được tính vào whitelist cho `@Document({ stripUnknownFields: true })`.

6 type cho v1 (`src/core/mapping/types/`): `@String`, `@Number`, `@Boolean`, `@Date`, `@Enum`, `@Uuid`.
3 type thêm ở v2: `@ObjectId`, `@Array`, `@Object` (export tên `PlainObject` — xem giới hạn đặt tên bên dưới).

```ts
import { ObjectId } from "mongodb";
import {
  Document,
  Id,
  String as StringField,
  Number as NumberField,
  Enum,
  ObjectId as ObjectIdField,
  Array as ArrayField,
  PlainObject as ObjectField,
} from "red-aggregate";

@Document({ collection: "users", stripUnknownFields: true })
class User {
  @Id() _id!: ObjectId;
  @StringField({ default: "anon" }) name!: string;
  @NumberField() age!: number;
  @Enum(["active", "banned"], { default: "active" }) status!: string;
  @ObjectIdField() managerId!: ObjectId;
  @ArrayField({ default: [] }) tags!: string[];
  @ObjectField({ default: {} }) settings!: Record<string, unknown>;
}
```

Với entity trên: lưu 1 `User` mới không set `name` → document lưu có `name: "anon"`; set `age` là string → `save()` throw ngay; đọc lại 1 document cũ thiếu `name` → entity trả về vẫn có `name: "anon"`; field nào không có type decorator (và không phải `@Id`) sẽ bị loại khi lưu vì `stripUnknownFields: true`, nhưng vẫn còn nguyên khi đọc (strip chỉ áp dụng lúc ghi).

**Giới hạn cần biết:**

1. **`default` là giá trị tĩnh, không phải factory.** `@Date({ default: someDate })` dùng đúng 1 instance `Date` đó cho mọi entity thiếu field — không phải "giờ hiện tại lúc save". Cần giá trị động thì tự set field trước khi gọi `save()`. (v3 dự kiến hỗ trợ factory default để giải quyết giới hạn này.)
2. **Field không có type decorator nào sẽ không nằm trong whitelist.** Entity có field kiểu nested/lồng sâu (chưa có type decorator hỗ trợ) mà bật `stripUnknownFields: true` sẽ bị loại field đó khi lưu. Chỉ bật option này khi mọi field cần giữ đã được decorate bằng 1 trong các type ở trên.
3. **`@Array`/`@Object` chỉ shallow-check** — chỉ kiểm tra field có phải mảng/object hay không, không validate phần tử/field con bên trong. Một mảng string chứa lẫn 1 số vẫn được coi là hợp lệ.
4. **`default` của `@Array`/`@Object` là 1 reference dùng chung, không tự clone.** Mọi entity thiếu field sẽ trỏ vào **cùng 1** mảng/object. Mutate trực tiếp (`entity.tags.push(...)`) ở 1 entity sẽ ảnh hưởng mọi entity khác cũng nhận default đó — gán lại field bằng giá trị mới (`entity.tags = [...entity.tags, x]`) thay vì mutate in-place để tránh việc này.
5. **`default` của `@ObjectId` dễ gây trùng giá trị nếu field cần là duy nhất mỗi document** (vd. field tham chiếu tới document khác) — vì mọi entity thiếu field sẽ nhận cùng 1 `ObjectId`. Không dùng `default` cho field cần unique.
6. **`@Object` export tên là `PlainObject`, không phải `Object`** — export 1 hàm top-level tên `Object` sẽ shadow `Object` toàn bộ module, vỡ dòng `Object.defineProperty(exports, "__esModule", ...)` mà `tsc` tự chèn khi build CommonJS + esModuleInterop.

## Ghi chú

- `factory.getRepository(UserRepository)` cache theo **repository class identity**.
- `factory.getRepository(User, { collection })` cache theo **entity + collection override**.
- Chưa wire `@Version` trong flow quick start hiện tại.
- Viết custom finder method trong subclass, dùng 3 helper protected có sẵn trên `SimpleMongoRepository` thay vì tự gọi `mongoOperations`/tự nhắc lại entity class: `findByCriteria(criteria)`, `findOneByCriteria(criteria)` (trả về `Optional<T>`), `countByCriteria(criteria)`. `criteria` nhận filter Mongo thuần hoặc `ClauseDefinition` từ `Clause`.

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

