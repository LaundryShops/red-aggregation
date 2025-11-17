# Aggregation

`Aggregation` là lớp trung tâm giúp bạn lắp ráp danh sách stage MongoDB, áp dụng `AggregateOptions` và kết xuất ra pipeline hoặc command hoàn chỉnh. Tài liệu này mô phỏng cách trình bày của hướng dẫn Mongoose, bao gồm danh mục phương thức theo loại (static/protected/public), mô tả chi tiết từng API cùng ví dụ thực tế (từ import đến output kỳ vọng).

## Import

```ts
import { Aggregation } from '@/aggregation';
import { Direction } from '@/domain/order';

const pipeline = Aggregation.newAggregation(
  Aggregation.match({ status: 'PAID' }),
  Aggregation.sort(Direction.DESC, ['createdAt'])
).toPipeline(Aggregation.DEFAULT_CONTEXT);

// pipeline => [
//   { $match: { status: 'PAID' } },
//   { $sort: { createdAt: -1 } }
// ]
```

## Danh mục phương thức

### Static

| API | Kiểu trả về | Tóm tắt |
| --- | --- | --- |
| `newAggregation(...operations)` | `Aggregation` | Factory chính để dựng pipeline mới. |
| `newAggregationOptions()` | `AggregateOptionsBuilder` | Truy cập builder cấu hình `AggregateOptions`. |
| `DEFAULT_OPTIONS` | `AggregateOptions` | Tập tùy chọn mặc định được gán khi không truyền builder. |
| `DEFAULT_CONTEXT` | `AggregationOperationContext` | Renderer context mặc định khi xuất pipeline. |
| `ROOT`, `CURRENT` | `string` | Alias cho `$$ROOT`/`$$CURRENT`. |
| `addFields()` | `AddFieldsOperationBuilder` | Tạo stage `$addFields`. |
| `replaceRoot(...)` | `ReplaceRootOperation` \| `ReplaceRootOperationBuilder` | Thay thế tài liệu gốc bằng field/expression khác. |
| `project(...fields)` | `ProjectionOperation` | Lựa chọn field đầu ra (`$project`). |
| `unwind(...)` | `UnwindOperation` | Tách mảng thành nhiều bản ghi (`$unwind`). |
| `group(fields)` | `GroupOperation` | Dựng stage `$group` dựa trên `Fields`. |
| `sort(...)` | `SortOperation` | Sắp xếp kết quả (`$sort`). |
| `skip(count)` | `SkipOperation` | Bỏ qua N documents (`$skip`). |
| `limit(count)` | `LimitOperation` | Giới hạn số document (`$limit`). |
| `match(expression)` | `MatchOperation` | Lọc dữ liệu theo điều kiện (`$match`). |
| `merge()` | `MergeOperationBuilder` | Ghi kết quả sang collection khác (`$merge`). |
| `facet(...operations)` | `FacetOperation` | Chạy nhiều pipeline song song (`$facet`). |
| `lookup(...)` | `LookupOperation` \| `LookupOperationBuilder` | Thực hiện join (`$lookup`). |
| `count()` | `CountOperationBuilder` | Đếm số bản ghi (`$count`). |
| `sortByCount(selector)` | `SortByCountOperation` | Gom nhóm và sắp xếp theo số lượng (`$sortByCount`). |
| `field(name)` | `Field` | Chuẩn hóa tên field trước khi dựng stage. |

### Protected

| API | Kiểu trả về | Tóm tắt |
| --- | --- | --- |
| `protected static asAggregationList(...operations)` | `AggregateOperation[]` | Chuẩn hóa danh sách stage dùng nội bộ cho factory/ subclass. |

### Public

| Method | Trả về | Công dụng |
| --- | --- | --- |
| `toPipeline(rootContext)` | `Document[]` | Render pipeline theo `AggregationOperationContext`. |
| `getPipeline()` | `AggregationPipeline` | Truy cập đối tượng pipeline bất biến. |
| `toDocument(collection, rootContext)` | `Document` | Dựng command `aggregate` hoàn chỉnh và áp dụng `AggregateOptions`. |

---

## Static API

### `newAggregation(...operations)`

- **Mô tả:** Nhận một hoặc nhiều `AggregateOperation`. Nếu tham số cuối không phải `AggregateOptions`, `DEFAULT_OPTIONS` sẽ được dùng.
- **Ví dụ:**

```ts
const agg = Aggregation.newAggregation(
  Aggregation.match({ status: 'PAID' }),
  Aggregation.limit(100)
);

agg.getPipeline().toDocuments(Aggregation.DEFAULT_CONTEXT);
// => [{ $match: { status: 'PAID' } }, { $limit: 100 }]
```

### `newAggregationOptions()`

- **Mô tả:** Trả về `AggregateOptions.builder()` giúp cấu hình `allowDiskUse`, `cursor.batchSize`, ...
- **Ví dụ:**

```ts
const options = Aggregation.newAggregationOptions()
  .allowDiskUse(true)
  .cursorBatchSize(500)
  .build();

const agg = Aggregation.newAggregation(
  [Aggregation.match({ status: 'PAID' }), Aggregation.count().as('total')],
  options
);
```

### `addFields()`

- **Trả về:** `AddFieldsOperation.builder()`.
- **Ví dụ:**

```ts
import { SystemVariables } from '@/systemVariables';

const addFieldsStage = Aggregation.addFields()
  .withField('grandTotal', { $add: ['$subtotal', '$tax'] })
  .withField('issuedAt', SystemVariables.NOW)
  .build();
// => { $addFields: { grandTotal: { $add: [...] }, issuedAt: '$$NOW' } }
```

### `replaceRoot(...)`

- **Chữ ký:** `replaceRoot()`, `replaceRoot(field: string)`, `replaceRoot(expression: AggregationExpression | Document)`.
- **Ví dụ:**

```ts
const builder = Aggregation.replaceRoot(); // builder để gắn thêm giá trị
const fromField = Aggregation.replaceRoot('payload');
const fromExpression = Aggregation.replaceRoot(new SomeExpression());
const fromDocument = Aggregation.replaceRoot({ merged: '$$ROOT' });
```

### `project(...fields | fields: Fields)`

- **Mô tả:** Nhận danh sách string hoặc `Fields` để tạo `ProjectionOperation`.
- **Ví dụ:**

```ts
const projection = Aggregation.project('customer', 'items', 'total');
const normalized = Aggregation.project(Fields.fields('orderNumber', 'shipping.address'));
```

### `unwind(field, arrayIndex?, preserveNullAndEmptyArrays?)`

- **Overload:**  
  1. `unwind(field: string)`  
  2. `unwind(field: string, preserveNullAndEmptyArrays: boolean)`  
  3. `unwind(field: string, arrayIndex: string)`  
  4. `unwind(field: string, arrayIndex: string, preserveNullAndEmptyArrays: boolean)`
- **Ví dụ:**

```ts
const basic = Aggregation.unwind('items');
const keepNull = Aggregation.unwind('items', true);
const withIndex = Aggregation.unwind('items', 'idx');
const full = Aggregation.unwind('items', 'idx', true);
```

### `group(fields: Fields)`

- **Mô tả:** Nhận `Fields` mô tả `_id` và accumulator.
- **Ví dụ:**

```ts
const idFields = Fields.fieldsField(Fields.field('_id', '$customerId'));
const grouped = Aggregation.group(idFields)
  .sum('$amount').as('totalAmount')
  .avg('$amount').as('avgAmount');

grouped.toDocument(Aggregation.DEFAULT_CONTEXT);
// => { $group: { _id: '$customerId', totalAmount: { $sum: '$amount' }, ... } }
```

### `sort(sort: Sort)` và `sort(direction: Direction, fields: string[])`

- **Ví dụ:**

```ts
const byObject = Aggregation.sort(Sort.by(Direction.ASC, 'customer', 'createdAt'));
const byArgs = Aggregation.sort(Direction.DESC, ['createdAt', 'orderNumber']);
```

### `skip(count)` / `limit(count)`

- **Ví dụ:**

```ts
const skipStage = Aggregation.skip(50);   // { $skip: 50 }
const limitStage = Aggregation.limit(20); // { $limit: 20 }
```

### `match(expression)`

- **Đối số hợp lệ:** `AggregationExpression`, `IClauseDefinition`, `Document`.
- **Ví dụ:**

```ts
const byDoc = Aggregation.match({ status: 'PAID' });
const byClause = Aggregation.match(buildStatusClause());
const byExpression = Aggregation.match(new BooleanExpression());
```

### `merge()`

- **Trả về:** `MergeOperation.builder()`.
- **Ví dụ:**

```ts
const mergeStage = Aggregation.merge()
  .into('orders_archive')
  .whenMatched('replace')
  .whenNotMatched('insert')
  .build();
```

### `facet(...operations)`

- **Mô tả:** Không đối số → `FacetOperation.EMPTY`; truyền nhiều `AggregateOperation` để đăng ký facet.
- **Ví dụ:**

```ts
const fromBuilder = Aggregation.facet()
  .and('paidOrders', Aggregation.match({ status: 'PAID' }))
  .and('byCustomer', Aggregation.group(Fields.fields('customer')));

const fromArgs = Aggregation.facet(
  Aggregation.match({ status: 'PAID' }),
  Aggregation.project('customer', 'total')
);
```

### `lookup(...)`

- **Chữ ký:** builder rỗng, chữ ký với 4 string, hoặc chữ ký với 4 `Field`.
- **Ví dụ:**

```ts
const builder = Aggregation.lookup()
  .from('customers')
  .localField('customerId')
  .foreignField('_id')
  .as('customer');

const fromStrings = Aggregation.lookup('customers', 'customerId', '_id', 'customer');

const fromFields = Aggregation.lookup(
  Fields.field('customers'),
  Fields.field('customerId'),
  Fields.field('_id'),
  Fields.field('customer')
);
```

### `count()`

- **Ví dụ:**

```ts
const countStage = Aggregation.count().as('totalOrders'); // { $count: 'totalOrders' }
```

### `sortByCount(selector)`

- **Ví dụ:**

```ts
const byField = Aggregation.sortByCount('status');
const byExpression = Aggregation.sortByCount({ $substr: ['$customer', 0, 1] });
```

### `field(name: string)`

- **Ví dụ:**

```ts
const customerField = Aggregation.field('customer.name');
const aliased = Fields.field('customerName', '$customer.name');
```

---

## Protected API

### `protected constructor(operations: AggregateOperation | AggregateOperation[])`

- **Ý nghĩa:** Ngăn việc khởi tạo trực tiếp. Mọi người dùng phải gọi `Aggregation.newAggregation(...)` hoặc subclass.
- **Bảo vệ:** sử dụng `Assert.notNull`/`Assert.notEmpty` để chắc chắn pipeline không rỗng.

### `protected static asAggregationList(...operations)`

- **Ý nghĩa:** Nội bộ chuyển các overload sang mảng chuẩn và xác thực danh sách.
- **Khi nào hữu ích:** Nếu bạn viết subclass `CustomAggregation` và cần kế thừa logic hợp nhất stage.

---

## Public API

### `toPipeline(rootContext: AggregationOperationContext)`

- **Trả về:** `Document[]`.
- **Ví dụ:**

```ts
const docs = Aggregation.newAggregation(
  Aggregation.match({ status: 'PAID' })
).toPipeline(Aggregation.DEFAULT_CONTEXT);

// docs => [{ $match: { status: 'PAID' } }]
```

### `getPipeline()`

- **Trả về:** `AggregationPipeline` (read-only).
- **Ví dụ:**

```ts
const pipeline = Aggregation.newAggregation(
  Aggregation.skip(10)
).getPipeline();

pipeline.toDocuments(Aggregation.DEFAULT_CONTEXT); // [{ $skip: 10 }]
```

### `toDocument(collectionName: string, rootContext: AggregationOperationContext)`

- **Trả về:** Command `Document` dạng `{ aggregate, pipeline, cursor?, ... }`.
- **Ví dụ:**

```ts
const command = Aggregation.newAggregation(
  Aggregation.match({ status: 'PAID' }),
  Aggregation.limit(5)
).toDocument('orders', Aggregation.DEFAULT_CONTEXT);

// command => {
//   aggregate: 'orders',
//   pipeline: [{ $match: {...} }, { $limit: 5 }],
//   cursor: {}
// }
```

---

## Lưu ý sử dụng

- Ưu tiên helper `Aggregation.field` hoặc `Fields.field` để tránh lỗi cú pháp `$`.
- `Aggregation.replaceRoot`, `Aggregation.lookup`, `Aggregation.group` cho phép truyền `AggregationExpression` hoặc `Document`. Khi dùng literal, hãy đảm bảo schema hợp lệ vì thư viện không kiểm tra chi tiết.
- `AggregationOperationContext` ảnh hưởng trực tiếp tới cách render field và system variables. Dùng `DEFAULT_CONTEXT` cho case phổ biến; tạo context riêng khi cần map hoặc prefix khác.
- Các hằng `Aggregation.ROOT` và `Aggregation.CURRENT` tương đương `$$ROOT`/`$$CURRENT`. Kết hợp chúng với module `systemVariables` để tránh hard-code literal.
