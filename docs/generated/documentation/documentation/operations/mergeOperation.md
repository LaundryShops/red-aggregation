# Merge Operation

`MergeOperation` đại diện cho stage `$merge` của MongoDB. Dùng để ghi kết quả của pipeline vào một collection (có thể cùng DB hoặc khác DB), với các tùy chọn khóa `on`, biến `let`, và hành vi khi trùng/không trùng tài liệu. Sử dụng builder `MergeOperation.builder()` (không khởi tạo trực tiếp).

```ts
import { MergeOperation } from 'red-aggregation/operations/mergeOperation';
import { ExpressionVariable, Let } from 'red-aggregation/operator/variableOperators/let';
import { WhenDocumentMatch } from 'red-aggregation/operations/mergeOperation/whenDocumentsMatch';
import { WhenDocumentsDontMatch } from 'red-aggregation/operations/mergeOperation/whenDocumentsdontMatch';
```

## Phương thức (Builder)

- [MergeOperation.builder().intoCollection().build()](/documentation/operations/mergeOperation.html#ghi-vao-collection)
- [inDatabase()](/documentation/operations/mergeOperation.html#ghi-vao-collection-o-db-khac)
- [on(...idFields)](/documentation/operations/mergeOperation.html#dat-truong-khoa-on)
- [let()/exposeVariablesOf()](/documentation/operations/operations/mergeOperation.html#truyen-bien-vao-sub-pipeline)
- [whenMatched()/whenDocumentsMatchApply()](/documentation/operations/operations/mergeOperation.html#hanh-vi-khi-trung-khoa)
- [whenNotMatched()](/documentation/operations/operations/mergeOperation.html#hanh-vi-khi-khong-trung)

### Ghi vào collection

```ts
MergeOperation.builder()
  .intoCollection('users')
  .build()
  .toDocument(context);
// => { $merge: 'users' }
```

### Ghi vào collection ở DB khác

```ts
MergeOperation.builder()
  .intoCollection('users')
  .inDatabase('analytics')
  .build()
  .toDocument(context);
// => { $merge: { into: { db: 'analytics', coll: 'users' } } }
```

### Đặt trường khóa `on`

```ts
MergeOperation.builder()
  .intoCollection('users')
  .on('email', 'tenantId')
  .build()
  .toDocument(context);
// => { $merge: { into: 'users', on: ['email', 'tenantId'] } }
```

### Truyền biến vào sub-pipeline (`let`)

```ts
const lets = Let.just(
  ExpressionVariable.newVariable('temp').forField('price'),
  ExpressionVariable.newVariable('discount').forField('discountRate')
);

MergeOperation.builder()
  .intoCollection('users')
  .let(lets) // hoặc .exposeVariablesOf(lets)
  .build()
  .toDocument(context);
// => {
//   $merge: {
//     into: 'users',
//     let: { temp: '$price', discount: '$discountRate' }
//   }
// }
```

### Hành vi khi trùng/không trùng

- Khi trùng (`whenMatched`): chọn một trong các hành vi hoặc cập nhật theo pipeline

```ts
// Giữ tài liệu hiện có
MergeOperation.builder()
  .intoCollection('users')
  .whenMatched(WhenDocumentMatch.keepExistingDocument())
  .build()
  .toDocument(context);
// => { $merge: { into: 'users', whenMatched: 'keepExisting' } }

// Cập nhật bằng pipeline
const pipelineStages = [ { $set: { updatedAt: '$$NOW' } } ];
MergeOperation.builder()
  .intoCollection('users')
  .whenMatched(WhenDocumentMatch.updateWith(pipelineStages as any))
  .build()
  .toDocument(context);
// => { $merge: { into: 'users', whenMatched: [ { $set: { updatedAt: '$$NOW' } } ] } }
```

- Khi không trùng (`whenNotMatched`): `insert`, `discard`, hoặc `fail`

```ts
MergeOperation.builder()
  .intoCollection('users')
  .whenNotMatched(WhenDocumentsDontMatch.insertNewDocument())
  .build()
  .toDocument(context);
// => { $merge: { into: 'users', whenNotMatched: 'insert' } }
```

### Lưu ý sử dụng

- Luôn dùng `MergeOperation.builder()`; constructor nội bộ yêu cầu nhiều tham số và đã được builder bao gói.
- `intoCollection(name)` là bắt buộc và không được rỗng.
- `on(...fields)` đặt khóa duy nhất để dò trùng (mặc định là `_id`).
- `let(...)` đưa biến vào trường `let` của `$merge`; các biến sẽ được map sang `'$field'` qua `context`.
- `whenMatched` chấp nhận: `replace`/`keepExisting`/`merge`/`fail` hoặc `updateWith(pipeline)`. `whenNotMatched` chấp nhận: `insert`/`discard`/`fail`.
- `MergeOperation` kế thừa các field upstream; nếu truyền `let`, các biến sẽ được expose như trường synthetic.
