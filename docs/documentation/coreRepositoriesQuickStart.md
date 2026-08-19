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

## Keyset (cursor) pagination

Phân trang kiểu offset (`skip`/`limit` qua `findAll(pageable)`) càng vào trang sau càng chậm vì Mongo vẫn phải quét qua hết số document bị `skip`. Keyset pagination (còn gọi là cursor pagination/seek method) tránh việc này bằng cách lọc trực tiếp "lấy document đứng sau/trước điểm mốc X theo thứ tự sort" (`$gt`/`$lt` trên field sort) thay vì đếm rồi bỏ qua.

### Thành phần chính

- `findAllByKeyset(criteria, keysetPageable)`: method trên `MongoRepository<T, ID>` (có sẵn ở mọi repo lấy qua `factory.getRepository(...)`), trả về `Promise<PagedList<T>>`.
- `KeysetPageRequest` (`src/domain/keysetPage/keysetPageRequest.ts`): implementation của `KeysetPageable`, tạo request cho trang đầu/tiến/lùi/theo cursor.
- `PagedList<T>` / `KeysetArrayList<T>` (`src/domain/keysetPage/pagedList.ts`, `keysetPageImpl.ts`): kết quả trả về, **là 1 `Array<T>`** (dùng `for...of`, `.map()`, `[...result]` được luôn) kèm thêm metadata phân trang.
- `KeysetPage` / `DefaultKeySetPage`, `Keyset` / `DefaultKeyset` (`src/domain/keysetPage/`): điểm mốc (anchor) — mỗi `Keyset` là 1 tuple giá trị của các field đang sort, lấy từ document thấp nhất/cao nhất của trang vừa fetch.
- `encodeKeysetCursor` / `decodeKeysetCursor` (`src/domain/keysetPage/keysetCursor.ts`): mã hoá 1 `Keyset` thành chuỗi base64 opaque để trả về client (dùng cho cursor kiểu GraphQL `after`/`before`), và giải mã ngược lại.
- `buildKeysetFilter` / `reverseSort` (`src/core/mongo/keysetCriteria.ts`): utility nội bộ dựng filter Mongo — bình thường không cần gọi trực tiếp, `findAllByKeyset` đã dùng sẵn.

### Cách dùng cơ bản — lật trang tiến/lùi trong 1 phiên

```ts
import { Sort, Direction, KeysetPageRequest } from "red-aggregate";

const sort = Sort.by(Direction.ASC, "name"); // field sort PHẢI duy nhất (xem lưu ý #2)

// Trang đầu — chưa có anchor
const first = KeysetPageRequest.of(20, sort);
const page1 = await userRepo.findAllByKeyset({ active: true }, first);

for (const user of page1) { /* PagedList là Array<User> */ }
page1.getTotalSize();   // tổng số document khớp criteria (không tính riêng theo trang)
page1.getKeysetPage();  // KeysetPage: getLowest()/getHighest()/getKeysets()

// Trang kế tiếp — anchor lấy từ getKeysetPage() của page1, KHÔNG lấy từ `first`
const nextRequest = KeysetPageRequest.next(first, page1.getKeysetPage());
const page2 = await userRepo.findAllByKeyset({ active: true }, nextRequest);

// Quay lại trang trước đó — anchor lấy từ getKeysetPage() của page2
const prevRequest = KeysetPageRequest.previous(nextRequest, page2.getKeysetPage());
const backToPage1 = await userRepo.findAllByKeyset({ active: true }, prevRequest);
```

### Cách dùng qua cursor opaque (trả cursor về client, kiểu REST/GraphQL `after`/`before`)

```ts
import { Sort, Direction, KeysetPageRequest, encodeKeysetCursor } from "red-aggregate";

const sort = Sort.by(Direction.ASC, "name");

// Request đầu tiên từ client: chưa có cursor
const page1 = await userRepo.findAllByKeyset({}, KeysetPageRequest.of(20, sort));

// Trả cursor cho client dựa theo entry cao nhất của trang vừa fetch
const nextCursor = encodeKeysetCursor(page1.getKeysetPage().getHighest());

// Request sau, client gửi lại `nextCursor` ở query param (vd. ?after=...)
const page2 = await userRepo.findAllByKeyset({}, KeysetPageRequest.afterCursor(20, sort, nextCursor));

// Tương tự cho chiều lùi (vd. ?before=...): KeysetPageRequest.beforeCursor(20, sort, cursor)
```

### Method reference

**`KeysetPageRequest`** (static factory — constructor là `private`):

| Method | Ý nghĩa |
| --- | --- |
| `KeysetPageRequest.of(size, sort)` | Trang đầu tiên, chưa có anchor, `direction = 'NEXT'`. |
| `KeysetPageRequest.next(previous, resultKeysetPage)` | Trang kế tiếp; `resultKeysetPage` phải lấy từ `PagedList.getKeysetPage()` của lần query trước, không phải từ `previous`. |
| `KeysetPageRequest.previous(previous, resultKeysetPage)` | Trang trước đó; `pageNumber` floor ở `0`. |
| `KeysetPageRequest.afterCursor(size, sort, cursor, page?)` | Giải mã `cursor` (base64) thành anchor 1 điểm, seek `NEXT` từ đó. |
| `KeysetPageRequest.beforeCursor(size, sort, cursor, page?)` | Giống trên nhưng seek `PREVIOUS`. |
| `.getSort()` / `.getKeysetPage()` / `.getDirection()` | Accessor — `getDirection()` trả `'NEXT' \| 'PREVIOUS'`. |
| `.next()` / `.previousOrFirst()` / `.first()` / `.withPage(n)` | Kế thừa từ `Pageable`, chỉ đổi `pageNumber`, giữ nguyên `sort`/anchor/`direction`. |

**`PagedList<T>` / `KeysetArrayList<T>`** (kết quả `findAllByKeyset`, tự nó là `T[]`):

| Method | Ý nghĩa |
| --- | --- |
| `getSize()` | Số phần tử thực tế của trang này (`this.length`). |
| `getTotalSize()` | Tổng số document khớp `criteria` (từ `countDocuments`, không bị ảnh hưởng bởi anchor). |
| `getPage()` | Số thứ tự trang, đánh từ `1`. |
| `getTotalPages()` | Tổng số trang (`ceil(totalSize / maxResults)`). |
| `getFirstResult()` / `getMaxResults()` | `pageNumber * pageSize` / `pageSize` đã dùng để query. |
| `getKeysetPage()` | Trả về `KeysetPage` — dùng làm anchor cho lần gọi `next()`/`previous()` kế tiếp. |

**`KeysetPage`** (anchor, lấy qua `PagedList.getKeysetPage()`):

| Method | Ý nghĩa |
| --- | --- |
| `getLowest()` / `getHighest()` | `Keyset` của document thấp nhất/cao nhất trang, theo `sort` — dùng làm anchor cho `previous()`/`next()`. |
| `getKeysets()` | Danh sách `Keyset` của **toàn bộ** document trong trang (không chỉ 2 đầu). |
| `getFirstResult()` / `getMaxResults()` | Giống trên `PagedList`. |

**`Keyset` / `DefaultKeyset`**: `getTuple()` trả `Array<string \| number>` — giá trị của từng field sort, theo đúng thứ tự khai báo trong `Sort`.

### Lưu ý cần biết

1. **`sort` truyền vào bắt buộc phải `isSorted()`** — `Sort.unsorted()` khiến `findAllByKeyset` throw ngay (`Assert.isTrue`), không query Mongo.
2. **Field sort nên có ít nhất 1 field duy nhất (unique) để làm tie-breaker** (vd. `_id`) — sort chỉ theo field không unique (vd. `name`) có thể khiến các document trùng giá trị bị bỏ sót hoặc lặp lại khi chuyển trang, vì anchor chỉ so sánh được đúng những field có trong `sort`. Dùng `Sort.by(Direction.ASC, "name").and(Sort.by(Direction.ASC, "_id"))` cho trường hợp cần chắc chắn thứ tự.
3. **`criteria` phải giữ nguyên giữa các lần gọi `next()`/`previous()` của cùng 1 phiên phân trang.** `findAllByKeyset` không tự lưu lại `criteria` cũ; đổi `criteria` giữa chừng (vd. đổi filter `active`) sẽ cho kết quả không nhất quán vì anchor được tính từ trang trước đó với `criteria` khác.
4. **`getTotalSize()` vẫn chạy `countDocuments` trên `criteria`** (không tính anchor) — nghĩa là keyset pagination tối ưu **việc seek trang**, không tối ưu chi phí đếm tổng. Nếu không cần tổng số trang chính xác, cân nhắc bỏ qua `getTotalSize()`/`getTotalPages()` ở tầng gọi để tiết kiệm 1 query đếm.
5. **`PREVIOUS` tự đảo `sort` để query rồi đảo lại kết quả** (`reverseSort` + `docs.reverse()`) — nội bộ `findAllByKeyset` tự lo việc này, người dùng chỉ cần gọi `KeysetPageRequest.previous(...)` bình thường, không cần tự đảo `sort`/kết quả.
6. **Trang rỗng (không còn document nào tiếp theo) vẫn trả về `PagedList` hợp lệ**, `getSize() === 0` và `getKeysetPage()` giữ nguyên anchor cũ (nếu có) hoặc keyset rỗng — không throw.
7. **`encodeKeysetCursor`/`decodeKeysetCursor` chỉ base64-encode JSON của tuple, không mã hoá/ký (sign) gì thêm** — cursor không bảo mật, không nên dùng để mang thông tin nhạy cảm; `decodeKeysetCursor` sẽ throw nếu chuỗi truyền vào không phải base64/JSON hợp lệ hoặc decode ra không phải array.
8. **`findAllByKeyset` tự động loại document soft-deleted** (giống các method find khác) khi entity dùng `@SoftDelete()` — không cần tự thêm điều kiện lọc vào `criteria`.

## Soft delete

Xóa "mềm" — đánh dấu `deleted_at`/`deleted_by` trên document thay vì xóa vật lý — để giữ lại dữ liệu cho audit/khôi phục. Entity opt-in qua `@SoftDelete()`; sau khi bật, **mọi** method đọc/xóa sẵn có trên repository tự động nhận biết, không cần đổi cách gọi.

### Thành phần chính

- `@SoftDelete()` (`src/core/mapping/softDelete.ts`): class decorator, dùng cùng `@Document()`, thứ tự không quan trọng. Đánh dấu entity dùng soft delete với 2 field cố định `deleted_at`/`deleted_by` — **không cần khai báo property nào cho 2 field này trên class**.
- `indexes` option trên `@Document({ indexes: [...] })`: khai báo index Mongo theo đúng type `IndexDescription` gốc của driver `mongodb` (hỗ trợ compound/partial/unique/TTL/text index) — không có DSL riêng.
- `MongoOperations.ensureIndexes(entityClass)` (trên `MongoTemplate`): tạo thật các index đã khai báo ở `indexes` — gọi thủ công (thường lúc bootstrap), không tự động chạy ngầm. Với entity `@SoftDelete()`, index nào `unique: true` mà chưa tự set `partialFilterExpression` sẽ được **tự động thêm** `{ deleted_at: null }` — tránh lỗi duplicate-key khi tạo lại document với giá trị unique đã bị soft-delete.
- `RepositoryFactory.getSoftDeleteRepository(EntityClass)`: giống `getRepository()` nhưng trả về type rộng hơn (`SoftDeleteMongoRepository`) có thêm các method chỉ dành cho soft delete. Throw ngay (trước khi chạm Mongo) nếu entity chưa dùng `@SoftDelete()`.

### Cách dùng cơ bản

```ts
import { ObjectId } from "mongodb";
import { Document, Id, SoftDelete, MongoTemplate, MappingContext, MongoRepositoryFactory } from "red-aggregate";

@Document({
  collection: "users",
  indexes: [{ key: { email: 1 }, unique: true }], // partialFilterExpression: { deleted_at: null } tự thêm
})
@SoftDelete()
class User {
  @Id() _id!: ObjectId;
  email!: string;
}

export async function bootstrap(db: import("mongodb").Db) {
  const ops = new MongoTemplate(db);
  const factory = new MongoRepositoryFactory(ops, new MappingContext());

  await ops.ensureIndexes(User); // tạo index thật — gọi 1 lần lúc bootstrap

  const userRepo = factory.getRepository(User); // dùng như mọi repo khác
  return { userRepo, factory };
}
```

```ts
// Xóa "mềm" — set deleted_at/deleted_by, KHÔNG xóa vật lý. deletedBy tùy chọn (ai thực hiện xóa).
await userRepo.deleteById(userId, "admin-1");
await userRepo.delete(user, "admin-1");
await userRepo.deleteAllById([id1, id2], "admin-1");
await userRepo.deleteAll(); // soft-delete toàn bộ collection qua 1 lệnh updateMany({}, ...)

// Mọi read method tự động loại document đã soft-delete — không cần tự thêm điều kiện lọc
await userRepo.findAll();        // không còn thấy document đã xóa
await userRepo.findById(userId); // Optional.empty() nếu document đã bị soft-delete
await userRepo.count();          // không tính document đã xóa

// Cần các method chỉ dành riêng cho soft delete -> lấy repo qua getSoftDeleteRepository()
const softUserRepo = factory.getSoftDeleteRepository(User);

await softUserRepo.restore(userId);        // khôi phục — set deleted_at/deleted_by về null
await softUserRepo.hardDeleteById(userId); // xóa vật lý thật, bỏ qua soft delete hoàn toàn
const all = await softUserRepo.findAllIncludingSoftDeleted(); // thấy cả document đã xóa
const trash = await softUserRepo.findAllSoftDeleted();        // CHỈ document đã xóa
```

### Method reference

**`@SoftDelete()`** (`src/core/mapping/softDelete.ts`):

| Export | Ý nghĩa |
| --- | --- |
| `SoftDelete()` | Class decorator, dùng cùng `@Document()`. |
| `SOFT_DELETE_DELETED_AT_FIELD` | Hằng số tên field cố định: `'deleted_at'`. |
| `SOFT_DELETE_DELETED_BY_FIELD` | Hằng số tên field cố định: `'deleted_by'`. |

**`MongoRepository<T, ID>`** (mọi repo lấy qua `getRepository()`) — các method này tự nhận biết soft delete, không cần gọi qua `getSoftDeleteRepository()`:

| Method | Khi entity dùng `@SoftDelete()` | Khi không dùng |
| --- | --- | --- |
| `deleteById(id, deletedBy?)` | `updateOne` set `deleted_at`/`deleted_by` | `deleteOne` như cũ |
| `delete(entity, deletedBy?)` | Tương tự, id lấy từ entity | `remove()` như cũ |
| `deleteAllById(ids, deletedBy?)` | `updateMany` theo `$in` | `deleteMany` như cũ |
| `deleteAll(entities?, deletedBy?)` | `updateMany({}, ...)` nếu không truyền `entities`, ngược lại lặp `delete()` từng entity | `deleteMany`/lặp `delete()` như cũ |
| `findAll()` / `findAll(sort)` / `findAll(pageable)` | Loại document đã soft-delete | Không đổi |
| `findById(id)` | `Optional.empty()` nếu đã soft-delete | Không đổi |
| `existsById(id)` / `count()` | Không tính document đã soft-delete | Không đổi |
| `findAllById(ids)` / `findAllByKeyset(...)` | Loại document đã soft-delete | Không đổi |
| `doAggregate(aggregation, { includeSoftDeleted? })` | Tự chèn `{ $match: { deleted_at: null } }` làm stage đầu, trừ khi `includeSoftDeleted: true` | Không đổi |

**`SoftDeleteMongoRepository<T, ID>`** (lấy qua `factory.getSoftDeleteRepository(EntityClass)`):

| Method | Ý nghĩa |
| --- | --- |
| `restore(id)` | Set `deleted_at`/`deleted_by` về `null`. Throw nếu entity không dùng `@SoftDelete()`. |
| `hardDeleteById(id)` | Xóa vật lý thật, bỏ qua soft delete hoàn toàn. |
| `findAllIncludingSoftDeleted()` | Như `findAll()` nhưng KHÔNG loại document đã soft-delete. |
| `findByIdIncludingSoftDeleted(id)` | Như `findById()` nhưng KHÔNG loại document đã soft-delete. |
| `findAllSoftDeleted()` | View "thùng rác" — CHỈ document đã soft-delete. Throw nếu entity không dùng `@SoftDelete()`. |

**`ensureIndexes`** (trên `MongoOperations`/`MongoTemplate`):

| Method | Ý nghĩa |
| --- | --- |
| `ensureIndexes(entityClass)` | Tạo các index khai báo ở `@Document({ indexes: [...] })`. No-op nếu không khai báo gì. Với entity `@SoftDelete()`, tự thêm `partialFilterExpression: { deleted_at: null }` vào index `unique: true` chưa tự set. |

### Lưu ý cần biết

1. **`deleted_at`/`deleted_by` là 2 field cố định, không cấu hình được tên** — không khai báo property nào trên class cho 2 field này; chúng được ghi thẳng vào document lúc xóa/khôi phục.
2. **`deletedBy` không có type cụ thể (`unknown`)** — repository không biết "current user" là gì, caller tự truyền id/tên người thực hiện xóa. Không truyền thì lưu `null`.
3. **Các method chỉ dành cho soft delete không nằm trên type trả về của `getRepository()`** — `restore`/`hardDeleteById`/`findAllIncludingSoftDeleted`/`findByIdIncludingSoftDeleted`/`findAllSoftDeleted` chỉ gọi/type-check được qua `getSoftDeleteRepository()`; gọi `getSoftDeleteRepository()` cho entity không dùng `@SoftDelete()` throw ngay, trước khi chạm Mongo.
4. **`restore()`/`findAllSoftDeleted()` throw nếu entity không dùng `@SoftDelete()`** — không có gì để restore, không có tập "đã xóa" nào để trả về.
5. **`ensureIndexes()` không tự động chạy** — phải gọi thủ công (thường lúc bootstrap); quên gọi thì index (kể cả partial unique index được tự thêm) không thực sự tồn tại trên MongoDB.
6. **Phạm vi tự động lọc chỉ nằm trong `SimpleMongoRepository`** — gọi trực tiếp `MongoOperations`/`MongoTemplate` (`find`/`findOne`/`count`/`aggregate` tổng quát, không qua repository) hoặc dựng `Aggregation` pipeline chạy ở nơi khác `doAggregate` sẽ KHÔNG tự loại document đã soft-delete.
7. **Chưa có bản `IncludingSoftDeleted` cho `existsById`/`count()`, và chưa có bản bulk cho `restore`/`hardDeleteById`** (`restoreAllById`/`hardDeleteAllById`) — chưa được yêu cầu, có thể bổ sung sau nếu cần.
8. **`deleteAll(entities)` (có truyền `entities`) vẫn lặp gọi `delete()` từng entity một** — giống hành vi hard-delete hiện tại, không phải 1 lệnh bulk duy nhất; chỉ `deleteAll()` (không truyền gì) và `deleteAllById(ids)` mới dùng `updateMany`/`deleteMany` 1 lần.

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

