# Unwind Operation

`UnwindOperation` đại diện cho stage `$unwind` của MongoDB. Stage này “bung” (deconstruct) một mảng thành nhiều document, mỗi phần tử mảng tạo ra một document mới. Có tuỳ chọn để giữ lại bản ghi khi mảng rỗng/null và để ghi chỉ số phần tử đã bung ra vào một field.

```ts
import { UnwindOperation } from 'red-aggregation/operations/unwindOperation';
import { UnwindOperationBuilder } from 'red-aggregation/operations/unwindOperation/unwindOperationBuilder';
import { Fields } from 'red-aggregation/aggregate/field';
```

## Phương thức

- [new UnwindOperation(field)](/documentation/operations/unwindOperation.html#constructor)
- [new UnwindOperation(field, preserveNullAndEmpty)](/documentation/operations/unwindOperation.html#preserve)
- [new UnwindOperation(field, arrayIndexField, preserveNullAndEmpty)](/documentation/operations/unwindOperation.html#with-index)
- [UnwindOperation.newUnwind().path().noArrayIndex().preserve/skip](/documentation/operations/unwindOperation.html#builder)

### Constructor: cơ bản

```ts
// Chỉ định path (field mảng) — case mặc định: không giữ phần tử null/[]
new UnwindOperation(Fields.field('items')).toDocument(context);
// => { $unwind: '$items' }
```

### Giữ lại phần tử null/mảng rỗng

```ts
new UnwindOperation(Fields.field('items'), true).toDocument(context);
// => { $unwind: { path: '$items', preserveNullAndEmptyArrays: true } }
```

### Ghi chỉ số phần tử (includeArrayIndex)

```ts
new UnwindOperation(Fields.field('items'), Fields.field('idx'), false)
  .toDocument(context);
// => { $unwind: { path: '$items', preserveNullAndEmptyArrays: false, includeArrayIndex: 'idx' } }
```

### Builder API

```ts
// Không ghi chỉ số, nhưng giữ null/[]
UnwindOperation.newUnwind()
  .path('items')
  .noArrayIndex()
  .preserveNullAndEmptyArrays()
  .toDocument(context);
// => { $unwind: { path: '$items', preserveNullAndEmptyArrays: true } }

// Ghi chỉ số và bỏ qua null/[]
UnwindOperation.newUnwind()
  .path('items')
  .arrayIndex('idx')
  .skipNullAndEmptyArrays()
  .toDocument(context);
// => { $unwind: { path: '$items', preserveNullAndEmptyArrays: false, includeArrayIndex: 'idx' } }
```

### Lưu ý sử dụng

- `path` là bắt buộc, không được rỗng.
- `arrayIndex(field)` sẽ tạo một field mới chứa chỉ số phần tử mảng ở mỗi document sau khi bung.
- `preserveNullAndEmptyArrays()` cho phép giữ lại document khi field là `null` hoặc mảng rỗng; `skipNullAndEmptyArrays()` thì loại bỏ.
- Khi không cần cấu hình nâng cao, có thể dùng constructor đơn giản với `new UnwindOperation(Fields.field('arr'))`.
