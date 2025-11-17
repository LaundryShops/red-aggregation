# AggregationUpdate

`AggregationUpdate` mở rộng `Aggregation` và triển khai `UpdateDefinition` để định nghĩa các update pipeline dựa trên stage aggregation. Lớp này theo dõi các field bị tác động (`keysTouched`), hỗ trợ gắn `$set`, `$unset`, `$replaceWith` và cung cấp `UpdateDefinition` tương thích với driver MongoDB.

## Import

```ts
import { AggregationUpdate } from '@/aggregationUpdate';
import { SetOperation } from '@/operations/setOperation';

const update = AggregationUpdate.update()
  .set(SetOperation.createSetOperation('status', 'PAID'))
  .unset('temporaryNote')
  .replaceWith({ $mergeObjects: ['$$ROOT', { reviewed: true }] });

const command = update.getUpdateObject();
// command => { '': [ { $set: { status: 'PAID' } },
//                    { $unset: 'temporaryNote' },
//                    { $replaceWith: { $mergeObjects: [...] } } ] }
```

## Danh mục phương thức

### Static

| API | Kiểu trả về | Tóm tắt |
| --- | --- | --- |
| `AggregationUpdate.update()` | `AggregationUpdate` | Tạo update trống để bắt đầu gắn stage. |
| `AggregationUpdate.from(pipeline)` | `AggregationUpdate` | Bọc một mảng `AggregateOperation` sẵn có thành update. |

> `AggregationUpdate` vẫn thừa hưởng toàn bộ static helper của `Aggregation` (stage builder, options, context...). Tham khảo `aggregation.md` khi cần chi tiết về những API đó.

### Protected

| API | Kiểu trả về | Tóm tắt |
| --- | --- | --- |
| `protected constructor(pipeline?: AggregateOperation[])` | `AggregationUpdate` | Chỉ dành cho factory nội bộ; đảm bảo mọi instance đều có pipeline hợp lệ và cập nhật `keysTouched`. |

### Public

| Method | Trả về | Công dụng |
| --- | --- | --- |
| `set(setOperation)` | `AggregationUpdate` | Thêm stage `$set` và đánh dấu các field được cập nhật. |
| `unset(...keys)` / `unset(unsetOperation)` | `AggregationUpdate` | Gắn stage `$unset` từ danh sách string hoặc `UnsetOperation`. |
| `replaceWith(value \| ReplaceWithOperation)` | `AggregationUpdate` | Thay toàn bộ document bằng giá trị/operation mới (`$replaceWith`). |
| `isIsolated()` | `boolean` | Cho biết update có gắn cờ `isolated` hay không (mặc định `false`). |
| `getUpdateObject()` | `Document` | Biến pipeline thành update object cho MongoDB. |
| `modifies(key)` | `boolean` | Kiểm tra field có nằm trong `keysTouched`. |
| `inc(key)` | `UpdateDefinition` | Placeholder, hiện ném lỗi vì chưa được hỗ trợ. |
| `getArrayFilters()` | `ArrayFilter[]` | Trả về danh sách filter (mặc định rỗng). |
| `hasArrayFilters()` | `boolean` | `true` nếu có ít nhất một filter (dựa trên `getArrayFilters()`). |
| `toPipeline(rootContext)` | `Document[]` | Thừa hưởng từ `Aggregation`: render pipeline. |
| `toDocument(collection, rootContext)` | `Document` | Render command `aggregate`. |
| `getPipeline()` | `AggregationPipeline` | Truy cập pipeline bất biến. |

---

## Static API

### `AggregationUpdate.update()`

- **Mô tả:** Factory tiện lợi tạo một update trống sử dụng constructor được bảo vệ.
- **Ví dụ:**

```ts
const update = AggregationUpdate.update()
  .set(SetOperation.createSetOperation('status', 'PAID'))
  .unset('deprecatedField');
```

### `AggregationUpdate.from(pipeline: AggregateOperation[])`

- **Mô tả:** Khi đã có danh sách `AggregateOperation` (ví dụ xây dựng bằng các helper của `Aggregation`), bạn có thể bọc chúng vào `AggregationUpdate` để tận dụng API `UpdateDefinition`.
- **Ví dụ:**

```ts
const stages = [
  Aggregation.match({ status: 'PAID' }),
  Aggregation.addFields().withField('flagged', true).build(),
];

const update = AggregationUpdate.from(stages);
```

---

## Protected API

### `protected constructor(pipeline?: AggregateOperation[])`

- **Ý nghĩa:** Chỉ factory nội bộ (`update()`, `from()`) được phép gọi. Constructor khởi tạo `keysTouched` dựa trên mọi `FieldsExposingAggregationOperation` trong pipeline để phục vụ `modifies(key)`.
- **Ghi chú:** Nếu không truyền pipeline, constructor tự tạo instance trống (gọi lại chính mình với `[]`), giúp bạn luôn bắt đầu với cấu trúc hợp lệ.

---

## Public API

### `set(setOperation: SetOperation)`

- **Mô tả:** Thêm stage `$set` do `SetOperation` định nghĩa, đồng thời đánh dấu mọi field xuất hiện trong operation vào `keysTouched`.
- **Ví dụ:**

```ts
const update = AggregationUpdate.update();

update.set(
  SetOperation.createSetOperation('profile.completed', true)
);

update.set(
  SetOperation.createSetOperation('lastModified', '$$NOW')
);
```

### `unset(...keys: string[])` / `unset(unsetOperation: UnsetOperation)`

- **Mô tả:** Support hai overload:
  1. Truyền danh sách string (`unset('foo', 'bar')`) → được chuyển thành `UnsetOperation`.
  2. Truyền trực tiếp `UnsetOperation` nếu đã dựng sẵn.
- **Ví dụ:**

```ts
AggregationUpdate.update()
  .unset('temporaryField', 'debugInfo')
  .unset(new UnsetOperation([Fields.field('legacy.status')]));
```

### `replaceWith(value | ReplaceWithOperation)`

- **Mô tả:** Dùng `$replaceWith` để thay toàn bộ document. Nếu truyền literal, method sẽ tự tạo `ReplaceWithOperation.replaceWithValue(value)`.
- **Ví dụ:**

```ts
AggregationUpdate.update()
  .replaceWith({ $mergeObjects: ['$$ROOT', { normalized: true }] })
  .replaceWith(ReplaceWithOperation.replaceWithValue({ clean: '$$ROOT' }));
```

### `isIsolated()`

- **Mô tả:** Trả về giá trị của cờ `isolated`. Thư viện hiện chưa cung cấp setter, vì vậy hàm chủ yếu phục vụ kiểm tra giao diện `UpdateDefinition`.

### `getUpdateObject()`

- **Mô tả:** Kết hợp pipeline thành object driver-friendly. `AggregationUpdate` lưu pipeline dưới key rỗng (`''`) để tương thích với các adapter hiện có.
- **Ví dụ:**

```ts
const updateObject = AggregationUpdate.update()
  .set(SetOperation.createSetOperation('status', 'PAID'))
  .getUpdateObject();

// => { '': [{ $set: { status: 'PAID' } }] }
```

### `modifies(key: string)`

- **Mô tả:** Kiểm tra xem key đã từng được chạm bởi `set`/`unset` hoặc một stage `FieldsExposingAggregationOperation` trong pipeline ban đầu hay chưa.
- **Ví dụ:**

```ts
const update = AggregationUpdate.update()
  .set(SetOperation.createSetOperation('status', 'PAID'));

update.modifies('status'); // true
update.modifies('notes');  // false
```

### `inc(key: string)`

- **Mô tả:** Method tồn tại để thỏa interface `UpdateDefinition` nhưng hiện chưa được triển khai và sẽ ném lỗi. Tránh sử dụng cho đến khi thư viện bổ sung logic `$inc`.

### `getArrayFilters()` và `hasArrayFilters()`

- **Mô tả:** Mặc định trả về mảng rỗng và `false`. Bạn có thể override trong subclass nếu cần inject array filters cho update pipeline.
- **Ví dụ:**

```ts
const update = AggregationUpdate.update();
update.getArrayFilters(); // []
update.hasArrayFilters(); // false
```

### Thừa hưởng từ `Aggregation`

- `toPipeline(rootContext)`, `toDocument(collection, rootContext)`, `getPipeline()` hoạt động giống hệt mô tả trong `docs/documentation/aggregation.md`. Sử dụng chúng khi cần render pipeline/command hoặc kiểm tra stage đã gắn.

---

## Lưu ý khi sử dụng

- `AggregationUpdate` được thiết kế cho update pipeline (đã hỗ trợ từ MongoDB 4.2). Đảm bảo cluster/driver của bạn hỗ trợ update stage trước khi áp dụng.
- Vì `getUpdateObject()` trả về object với key rỗng, bạn thường cần adapter hoặc mapper để chuyển đổi sang định dạng mà driver/ORM mong đợi (ví dụ `$set`/`$unset` truyền thống). Đây là hành vi tương thích với phần còn lại của thư viện.
- `keysTouched` chỉ phát hiện field từ `SetOperation`, `UnsetOperation` hoặc bất kỳ stage nào triển khai `FieldsExposingAggregationOperation`. Nếu bạn gắn các stage tùy biến không expose field, `modifies(key)` có thể không phản ánh đầy đủ.
