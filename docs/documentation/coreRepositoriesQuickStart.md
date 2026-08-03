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
- Typed field decorators (`src/core/mapping/types/`): `@String`/`@Number`/`@Boolean`/`@Date`/`@Enum`/`@Uuid` (v1) + `@ObjectId`/`@Array`/`@Object` (v2) + `@CustomField`/`@Email` (v4, generic/user-defined) — khai báo type + `default` (tĩnh hoặc factory) + validate cho field.
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

- Có `default` áp dụng **cả khi lưu lẫn khi đọc** — field đang `undefined` mới được điền; `null` là giá trị cố ý, không bị ghi đè. `default` nhận giá trị tĩnh **hoặc** factory không tham số `() => T` — nếu là factory, được **gọi lại mỗi lần** field thiếu giá trị cần điền default (mỗi document xử lý qua `applyDefaults()` là 1 lần gọi riêng, không memoize).
- Được **validate khi lưu** — sai kiểu thì `save()`/`insert()` throw ngay, không gửi gì tới Mongo. Không validate khi đọc (dữ liệu legacy có thể không hợp lệ theo rule mới).
- Được tính vào whitelist cho `@Document({ stripUnknownFields: true })`.

9 type có sẵn (v1 + v2, `src/core/mapping/types/`): `@String`, `@Number`, `@Boolean`, `@Date`, `@Enum`, `@Uuid`, `@ObjectId`, `@Array`, `@Object` (export tên `PlainObject` — xem giới hạn đặt tên bên dưới).

Ngoài ra còn `@CustomField<T>` (v4) — type generic, public, để tự định nghĩa field theo nhu cầu riêng (`kind`, `validate`, `default?`) mà không cần sửa source thư viện; và `@Email` — string field với validate hình dạng email cơ bản, dựng sẵn trên `@CustomField` làm ví dụ tham khảo.

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
  CustomField,
  Email,
} from "red-aggregate";

@Document({ collection: "users", stripUnknownFields: true })
class User {
  @Id() _id!: ObjectId;
  @StringField({ default: "anon" }) name!: string;
  @NumberField() age!: number;
  @Enum(["active", "banned"], { default: "active" }) status!: string;
  @ObjectIdField({ default: () => new ObjectId() }) managerId!: ObjectId;
  @ArrayField({ default: () => [] }) tags!: string[];
  @ObjectField({ default: {} }) settings!: Record<string, unknown>;
  @Email({ default: "unknown@example.com" }) email!: string;
  @CustomField<number>({
    kind: "positive-number",
    validate: (value) => (typeof value === "number" && value > 0 ? null : "Expected a positive number"),
  })
  score!: number;
}
```

Với entity trên: lưu 1 `User` mới không set `name` → document lưu có `name: "anon"`; set `age` là string → `save()` throw ngay; đọc lại 1 document cũ thiếu `name` → entity trả về vẫn có `name: "anon"`; `managerId`/`tags` dùng factory default nên mỗi document thiếu field sẽ nhận 1 `ObjectId`/mảng **riêng** (không trùng, không share reference — khác với `settings` ở trên vẫn dùng giá trị tĩnh `{}` dùng chung); field nào không có type decorator (và không phải `@Id`) sẽ bị loại khi lưu vì `stripUnknownFields: true`, nhưng vẫn còn nguyên khi đọc (strip chỉ áp dụng lúc ghi).

Ví dụ tự định nghĩa 1 field type riêng qua `@CustomField` mà không cần sửa source thư viện:

```ts
import { CustomField } from "red-aggregate";

function PhoneNumber(options?: { default?: string | (() => string) | null }): PropertyDecorator {
  return CustomField<string>({
    kind: "phone-number",
    default: options?.default,
    validate: (value) =>
      typeof value === "string" && /^\+?[0-9]{8,15}$/.test(value) ? null : "Expected a valid phone number",
  });
}
```

**Giới hạn cần biết:**

1. **Đọc lại 1 document cũ qua field dùng factory default sẽ luôn sinh giá trị mới ở mỗi lần đọc, không ghi ngược lại DB.** Ví dụ document cũ thiếu `managerId` (dùng `default: () => new ObjectId()` ở trên): mỗi lần `findById`/`findOne`/`find` đọc lại document đó, entity trả về sẽ có 1 `ObjectId` khác nhau — giá trị đó không được lưu lại vào Mongo (`applyDefaults()` chỉ áp dụng trên object trả về, không tự `save()` lại). Cần giá trị ổn định lâu dài thì tự ghi field đó vào document, đừng dựa vào factory default cho việc đọc lặp lại.
2. **Field không có type decorator nào sẽ không nằm trong whitelist.** Entity có field kiểu nested/lồng sâu (chưa có type decorator hỗ trợ) mà bật `stripUnknownFields: true` sẽ bị loại field đó khi lưu. Chỉ bật option này khi mọi field cần giữ đã được decorate bằng 1 trong các type ở trên (kể cả `@CustomField`/`@Email`).
3. **`@Array`/`@Object` chỉ shallow-check** — chỉ kiểm tra field có phải mảng/object hay không, không validate phần tử/field con bên trong. Một mảng string chứa lẫn 1 số vẫn được coi là hợp lệ.
4. **`default` tĩnh của `@Array`/`@Object` là 1 reference dùng chung, không tự clone** — **tránh được** nếu dùng factory (`default: () => []`/`default: () => ({})`) thay vì giá trị tĩnh, như ví dụ `tags` ở trên. Nếu vẫn chọn giá trị tĩnh: mọi entity thiếu field sẽ trỏ vào **cùng 1** mảng/object, mutate trực tiếp (`entity.tags.push(...)`) ở 1 entity sẽ ảnh hưởng mọi entity khác cũng nhận default đó — gán lại field bằng giá trị mới (`entity.tags = [...entity.tags, x]`) thay vì mutate in-place để tránh việc này.
5. **`default` tĩnh của `@ObjectId` dễ gây trùng giá trị nếu field cần là duy nhất mỗi document** (vd. field tham chiếu tới document khác) — **tránh được** nếu dùng factory (`default: () => new ObjectId()`, như `managerId` ở trên) thay vì giá trị tĩnh. Nếu vẫn chọn giá trị tĩnh, mọi entity thiếu field sẽ nhận cùng 1 `ObjectId`.
6. **`@Object` export tên là `PlainObject`, không phải `Object`** — export 1 hàm top-level tên `Object` sẽ shadow `Object` toàn bộ module, vỡ dòng `Object.defineProperty(exports, "__esModule", ...)` mà `tsc` tự chèn khi build CommonJS + esModuleInterop.
7. **`kind` của `@CustomField` do người dùng tự đặt, không cần unique toàn cục** — `kind` chỉ mang tính mô tả, không dùng để dispatch ở bất kỳ đâu trong thư viện.

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

